{/* Workbench Modal */ }
{
    workbenchJob && (
        <div className="fixed inset-0 z-[80] bg-white flex flex-col">
            <style>{`
            .editor-content {
              font-family: "Times New Roman", Times, serif !important;
              line-height: 1.6;
              padding: 1in;
              background: white;
              min-height: 11in;
              width: 8.5in;
              margin: 0 auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .editor-content p { margin-bottom: 0.5em; }
            .editor-content h1, .editor-content h2, .editor-content h3 { margin-top: 1em; margin-bottom: 0.5em; }
          `}</style>

            {/* Header */}
            <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={closeWorkbench} className="p-1.5 hover:bg-slate-800 rounded transition"><X className="w-5 h-5" /></button>
                    <h2 className="font-semibold">Translation Workbench - {workbenchJob.clientName}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleWorkbenchSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded text-sm font-medium"><Save className="w-4 h-4" /> Save</button>
                    <button onClick={() => { handleWorkbenchSave(); setIsCompletionModalOpen(true); setPendingCompletionJob(workbenchJob); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium"><CheckCircle className="w-4 h-4" /> Complete</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Document Viewer */}
                <div className="w-1/2 bg-slate-100 flex flex-col border-r border-slate-300">
                    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                        <span className="text-sm font-medium text-slate-700">Source Document</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))} className="p-1.5 hover:bg-slate-100 rounded"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-xs text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))} className="p-1.5 hover:bg-slate-100 rounded"><ZoomIn className="w-4 h-4" /></button>
                            <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-1.5 hover:bg-slate-100 rounded"><RotateCw className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                        {workbenchJob.attachments?.[0] ? (
                            <img src={workbenchJob.attachments[0]} alt="Source" style={{ transform: `rotate(${rotation}deg) scale(${zoomLevel})`, maxWidth: '100%', transition: 'transform 0.2s' }} />
                        ) : (
                            <div className="text-slate-400 text-sm">No source document</div>
                        )}
                    </div>
                </div>

                {/* Right: Editor + Sidebar */}
                <div className="w-1/2 flex flex-col">
                    {/* Editor */}
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
                            <span className="text-sm font-medium text-slate-700">Translation Editor</span>
                            <button onClick={() => { if (!workbenchJob.attachments?.[0]) { alert('No source document to translate'); return; } handleAutoTranslate(); }} disabled={isAiTranslating} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-3 py-1.5 rounded text-xs font-medium"><Sparkles className="w-3 h-3" /> {isAiTranslating ? 'Translating...' : 'Auto-Translate'}</button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 bg-slate-50">
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                className="editor-content outline-none"
                                dangerouslySetInnerHTML={{ __html: workbenchJob.translatedText || '<p>Start typing your translation here...</p>' }}
                            />
                        </div>
                    </div>

                    {/* TM/Glossary Sidebar */}
                    <div className="h-64 border-t border-slate-200 bg-slate-50 overflow-auto p-4">
                        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2"><Database className="w-3 h-3" /> TM Matches</div>
                        {tmMatches.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {tmMatches.slice(0, 3).map((match, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-slate-200 text-xs cursor-pointer hover:border-primary-300" onClick={() => { if (editorRef.current) { editorRef.current.innerHTML += `<p>${match.targetSegment}</p>`; } }}>
                                        <div className="text-slate-500 truncate">{match.sourceSegment}</div>
                                        <div className="text-primary-600 font-medium">{match.targetSegment}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 mb-4">No TM matches found</div>
                        )}
                        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Glossary</div>
                        {glossaryMatches.length > 0 ? (
                            <div className="space-y-1">
                                {glossaryMatches.slice(0, 5).map((term, idx) => (
                                    <div key={idx} className="text-xs bg-white p-1.5 rounded border border-slate-200"><span className="text-slate-600">{term.source}</span> → <span className="text-primary-600 font-medium">{term.target}</span></div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400">No glossary matches found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
