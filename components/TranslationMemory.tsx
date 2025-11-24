import React, { useState, useEffect } from 'react';
import { Search, Database, Download, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TMUnit, GlossaryTerm } from '../types';

interface TranslationMemoryProps {
  lang: string;
}

export const TranslationMemory: React.FC<TranslationMemoryProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'tm' | 'glossary'>('tm');
  const [tmUnits, setTmUnits] = useState<TMUnit[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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
        setTmUnits(data || []);
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
    tm.sourceSegment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tm.targetSegment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGlossary = glossary.filter(term =>
    term.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Translation Resources</h2>
        <p className="text-slate-600">Manage your translation memory and terminology glossary</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('tm')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'tm'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Translation Memory
        </button>
        <button
          onClick={() => setActiveTab('glossary')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'glossary'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Glossary
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
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
      </div>

      {/* Add New Entry */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New {activeTab === 'tm' ? 'Translation' : 'Term'}
        </h3>
        
        {activeTab === 'tm' ? (
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
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
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
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs font-medium text-slate-500 uppercase">{tm.langPair}</span>
                        <div className="text-slate-900 font-medium">{tm.sourceSegment}</div>
                      </div>
                      <div className="text-slate-600 bg-slate-50 px-3 py-2 rounded">
                        {tm.targetSegment}
                      </div>
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
      <div className="mt-4 grid grid-cols-2 gap-4">
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
  );
};

export default TranslationMemory;

