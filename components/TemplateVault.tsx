import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Check, X, Shield, RefreshCw, Layers, Search, GraduationCap, Car, Scale, Landmark } from 'lucide-react';
import { parseFileContent, DetectedDocType } from '../utils/documentParser';
import { supabase } from '../lib/supabase';
import { Lang } from '../locales';

interface TemplateVaultProps {
    lang: Lang;
}

interface ScannedFile {
    id: string;
    file: File;
    status: 'scanning' | 'ready' | 'uploading' | 'complete' | 'error';
    detected?: DetectedDocType;
    title: string;
}

const TemplateVault: React.FC<TemplateVaultProps> = ({ lang }) => {
    const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filter, setFilter] = useState('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Add files to state with 'scanning' status
        const newFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            status: 'scanning',
            title: file.name
        } as ScannedFile));

        setScannedFiles(prev => [...prev, ...newFiles]);

        // Process each file
        for (const item of newFiles) {
            try {
                const result = await parseFileContent(item.file);

                setScannedFiles(prev => prev.map(f => {
                    if (f.id === item.id) {
                        return {
                            ...f,
                            status: 'ready',
                            detected: result || undefined,
                            title: result?.type !== 'Unknown' ? `${result?.type} - ${f.file.name}` : f.file.name
                        };
                    }
                    return f;
                }));
            } catch (err) {
                console.error("Scan failed", err);
                setScannedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } });

    const handleSaveAll = async () => {
        setIsProcessing(true);
        const readyFiles = scannedFiles.filter(f => f.status === 'ready');

        for (const item of readyFiles) {
            setScannedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f));

            try {
                // 1. Upload File
                const fileName = `${Date.now()}_${item.file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('templates')
                    .upload(`${(await supabase.auth.getUser()).data.user?.id}/${fileName}`, item.file);

                if (uploadError) throw uploadError;

                // 2. Insert DB Record
                const { error: dbError } = await supabase.from('document_templates').insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    title: item.title,
                    original_filename: item.file.name,
                    category: item.detected?.category || 'Uncategorized',
                    detected_type: item.detected?.type || 'Unknown Type',
                    confidence_score: item.detected?.confidence || 0,
                    tags: item.detected?.tags || [],
                    file_path: fileName,
                    file_type: item.file.name.split('.').pop(),
                    file_size: item.file.size
                });

                if (dbError) throw dbError;

                setScannedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'complete' } : f));

            } catch (err) {
                console.error("Upload failed", err);
                setScannedFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
            }
        }
        setIsProcessing(false);
    };

    const removeFile = (id: string) => {
        setScannedFiles(prev => prev.filter(f => f.id !== id));
    };

    const getIconForType = (type: string | undefined) => {
        if (!type) return <FileText className="w-6 h-6 text-slate-400" />;
        if (type.includes('Birth') || type.includes('Marriage')) return <UsersIcon className="w-6 h-6 text-rose-500" />;
        if (type.includes('Diplom')) return <GraduationCap className="w-6 h-6 text-purple-500" />;
        if (type.includes('Crim')) return <Scale className="w-6 h-6 text-amber-500" />;
        if (type.includes('Driv')) return <Car className="w-6 h-6 text-blue-500" />;
        if (type.includes('Bank')) return <Landmark className="w-6 h-6 text-emerald-500" />;
        return <FileText className="w-6 h-6 text-slate-500" />;
    };

    // Helper because Lucide imports might conflict
    const UsersIcon = ({ className }: { className: string }) => (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Template Vault</h1>
                    <p className="text-slate-500 mt-2">Smart archive for your past translations. Upload bulk files and let AI sort them.</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer mb-12 ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}`}>
                <input {...getInputProps()} />
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <p className="text-lg font-medium text-slate-700">Drag & Drop your template folder here</p>
                <p className="text-slate-500">Supports .docx and .pdf (bulk upload supported)</p>
            </div>

            {/* Processing / Review Area */}
            {scannedFiles.length > 0 && (
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Review & Import ({scannedFiles.length})</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setScannedFiles([])} className="px-4 py-2 text-slate-500 hover:text-red-500 text-sm font-medium">Clear All</button>
                            <button
                                onClick={handleSaveAll}
                                disabled={isProcessing || scannedFiles.every(f => f.status === 'complete')}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                                {isProcessing ? 'Importing...' : 'Import All to Vault'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scannedFiles.map((file) => (
                            <div key={file.id} className={`bg-white p-4 rounded-xl border shadow-sm relative group ${file.detected?.type !== 'Unknown' ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200'}`}>
                                <button onClick={() => removeFile(file.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        {file.status === 'scanning' ? <RefreshCw className="w-6 h-6 text-teal-500 animate-spin" /> : getIconForType(file.detected?.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {file.status === 'scanning' ? (
                                            <p className="text-sm font-medium text-slate-500 animate-pulse">Analyzing content...</p>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${file.detected?.confidence && file.detected.confidence > 50 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {file.detected?.type || 'Unknown'}
                                                    </span>
                                                    {file.detected?.language && (
                                                        <span className="text-xs px-1.5 py-0.5 border border-slate-200 rounded text-slate-500 uppercase">
                                                            {file.detected.language}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-slate-800 truncate text-sm" title={file.file.name}>{file.title}</h4>
                                                <p className="text-xs text-slate-400 mt-0.5 truncate">{file.file.name}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {file.status === 'complete' && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                        <div className="flex items-center gap-1 text-teal-600 font-bold">
                                            <Check className="w-5 h-5" /> Imported
                                        </div>
                                    </div>
                                )}
                                {file.status === 'error' && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                                        <span className="text-red-500 font-bold text-sm">Upload Failed</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateVault;
