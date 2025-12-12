import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Download, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TMUnit, GlossaryTerm } from '../types';
import { exportTMX, importTMX } from '../services/tmService';
import TemplateVault from './TemplateVault';

interface TranslationMemoryProps {
  lang: string;
}

export const TranslationMemory: React.FC<TranslationMemoryProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'tm' | 'glossary'>('vault');
  const [tmUnits, setTmUnits] = useState<TMUnit[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportTMX = () => {
    const tmxContent = exportTMX(tmUnits);
    const blob = new Blob([tmxContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lexiledger_tm_${new Date().toISOString().split('T')[0]}.tmx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTMX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const newUnits = await importTMX(content);
          // Save to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user && newUnits.length > 0) {
            const { error } = await supabase.from('tm_units').insert(
              newUnits.map(u => ({
                user_id: user.id,
                source_segment: u.sourceSegment,
                target_segment: u.targetSegment,
                lang_pair: u.langPair,
                timestamp: u.timestamp
              }))
            );
            if (error) throw error;
            alert(`Successfully imported ${newUnits.length} translation units.`);
            fetchData();
          }
        } catch (error) {
          console.error("Import failed:", error);
          alert("Failed to import TMX file.");
        }
      }
    };
    reader.readAsText(file);
  };

  // Add new TM entry form
  const [newTM, setNewTM] = useState({
    sourceSegment: '',
    targetSegment: '',
    langPair: 'en-fr'
  });

  // Add new glossary term form
  const [newGlossary, setNewGlossary] = useState({
    source: '',
    target: '',
    langPair: 'en-fr'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tm') {
        const { data, error } = await supabase
          .from('tm_units')
          .select('*')
          .order('timestamp', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedData = (data || []).map(item => ({
          id: item.id,
          sourceSegment: item.source_segment,
          targetSegment: item.target_segment,
          langPair: item.lang_pair,
          timestamp: item.timestamp
        }));

        setTmUnits(mappedData);
      } else {
        const { data, error } = await supabase
          .from('glossary_terms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGlossary(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTMEntry = async () => {
    if (!newTM.sourceSegment || !newTM.targetSegment) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tm_units')
        .insert([{
          user_id: user.id,
          source_segment: newTM.sourceSegment,
          target_segment: newTM.targetSegment,
          lang_pair: newTM.langPair,
          timestamp: Date.now()
        }]);

      if (error) throw error;

      setNewTM({ sourceSegment: '', targetSegment: '', langPair: 'en-fr' });
      fetchData();
    } catch (error) {
      console.error('Error adding TM entry:', error);
    }
  };

  const addGlossaryTerm = async () => {
    if (!newGlossary.source || !newGlossary.target) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('glossary_terms')
        .insert([{
          user_id: user.id,
          source: newGlossary.source,
          target: newGlossary.target,
          lang_pair: newGlossary.langPair
        }]);

      if (error) throw error;

      setNewGlossary({ source: '', target: '', langPair: 'en-fr' });
      fetchData();
    } catch (error) {
      console.error('Error adding glossary term:', error);
    }
  };

  const deleteEntry = async (id: string, type: 'tm' | 'glossary') => {
    try {
      const table = type === 'tm' ? 'tm_units' : 'glossary_terms';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const filteredTM = tmUnits.filter(tm =>
    (tm.sourceSegment || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tm.targetSegment || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlossary = glossary.filter(term =>
    (term.source || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.target || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto block">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Translation Resources</h2>
          <p className="text-slate-600">Manage your templates, translation memory, and glossary</p>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImportTMX} accept=".tmx,.xml" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" /> Import TMX
          </button>
          <button onClick={handleExportTMX} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Export TMX
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'vault'
            ? 'text-primary-600 border-b-2 border-primary-600'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Database className="w-4 h-4" />
          Template Vault
        </button>
        <button
          onClick={() => setActiveTab('tm')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'tm'
            ? 'text-primary-600 border-b-2 border-primary-600'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Database className="w-4 h-4" />
          Translation Memory
        </button>
        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'glossary'
            ? 'text-primary-600 border-b-2 border-primary-600'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Search className="w-4 h-4" />
          Glossary
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === 'vault' ? (
          <TemplateVault lang={lang} />
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'tm' ? 'translations' : 'terms'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Add New Entry */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New {activeTab === 'tm' ? 'Translation' : 'Term'}
              </h3>

              {
                activeTab === 'tm' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Source text"
                      value={newTM.sourceSegment}
                      onChange={(e) => setNewTM({ ...newTM, sourceSegment: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Translation"
                      value={newTM.targetSegment}
                      onChange={(e) => setNewTM({ ...newTM, targetSegment: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newTM.langPair}
                        onChange={(e) => setNewTM({ ...newTM, langPair: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en-fr">EN → FR</option>
                        <option value="fr-en">FR → EN</option>
                        <option value="ar-en">AR → EN</option>
                        <option value="en-ar">EN → AR</option>
                      </select>
                      <button
                        onClick={addTMEntry}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Source term"
                      value={newGlossary.source}
                      onChange={(e) => setNewGlossary({ ...newGlossary, source: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Target term"
                      value={newGlossary.target}
                      onChange={(e) => setNewGlossary({ ...newGlossary, target: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newGlossary.langPair}
                        onChange={(e) => setNewGlossary({ ...newGlossary, langPair: e.target.value })}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="en-fr">EN → FR</option>
                        <option value="fr-en">FR → EN</option>
                        <option value="ar-en">AR → EN</option>
                        <option value="en-ar">EN → AR</option>
                      </select>
                      <button
                        onClick={addGlossaryTerm}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )
              }
            </div>

            {/* List */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {
                loading ? (
                  <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : activeTab === 'tm' ? (
                  <div className="divide-y divide-slate-200">
                    {filteredTM.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        No translation memory entries yet. Add your first one above!
                      </div>
                    ) : (
                      filteredTM.map((tm) => (
                        <div key={tm.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-xs font-medium text-slate-500 uppercase mr-3">{tm.langPair}</span>
                              <span className="text-slate-900 font-medium">{tm.sourceSegment}</span>
                              <span className="text-slate-400 mx-3">→</span>
                              <span className="text-primary-600 font-medium">{tm.targetSegment}</span>
                            </div>
                            <button
                              onClick={() => deleteEntry(tm.id, 'tm')}
                              className="text-rose-500 hover:text-rose-700 p-2"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredGlossary.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        No glossary terms yet. Add your first one above!
                      </div>
                    ) : (
                      filteredGlossary.map((term) => (
                        <div key={term.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-xs font-medium text-slate-500 uppercase mr-3">{term.langPair}</span>
                              <span className="text-slate-900 font-medium">{term.source}</span>
                              <span className="text-slate-400 mx-3">→</span>
                              <span className="text-primary-600 font-medium">{term.target}</span>
                            </div>
                            <button
                              onClick={() => deleteEntry(term.id, 'glossary')}
                              className="text-rose-500 hover:text-rose-700 p-2"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary-600">{tmUnits.length}</div>
                <div className="text-sm text-primary-700">TM Units</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">{glossary.length}</div>
                <div className="text-sm text-purple-700">Glossary Terms</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationMemory;

