import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, ShieldCheck, FileText, Calendar, User, Hash, Loader2, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import Logo from './Logo';

interface VerificationResult {
    document_uuid: string;
    status: string;
    client_name: string;
    document_type: string;
    date_issued: string;
    hash: string;
    issuer_name: string;
}

const VerificationPage: React.FC<{ docId: string }> = ({ docId }) => {
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                // Remove any 'fac-' or 'dev-' prefixes if present in URL
                const cleanId = docId.replace(/^(fac|dev)-/i, '');

                // Basic UUID validation
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(cleanId)) {
                    throw new Error("Invalid Document ID format");
                }

                const { data, error } = await supabase.rpc('verify_document', { doc_id: cleanId });

                if (error) throw error;
                if (data && data.length > 0) {
                    setResult(data[0]);
                } else {
                    setError("Document not found in the official registry.");
                }
            } catch (err: any) {
                console.error("Verification error:", err);
                setError(err.message || "Failed to verify document.");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [docId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Verifying document authenticity...</p>
                <p className="text-slate-400 text-sm mt-2">Connecting to LexiLedger Secure Registry</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
                        <p className="text-slate-600 mb-6">{error || "Document not found."}</p>
                        <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-sm text-rose-700 mb-6 text-left">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <p>This document ID does not exist in our registry or may have been tampered with. Please contact the issuer directly.</p>
                            </div>
                        </div>
                        <a href="/" className="inline-flex items-center text-rose-600 font-medium hover:underline">
                            Return to Homepage <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                        <Logo size="small" />
                    </div>
                </div>
            </div>
        );
    }

    const isValid = result.status !== 'Cancelled' && result.status !== 'Rejected';

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header Logo */}
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                    {/* Status Header */}
                    <div className={`p-8 text-center ${isValid ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-amber-50 border-b border-amber-100'}`}>
                        <div className={`w-24 h-24 ${isValid ? 'bg-emerald-100' : 'bg-amber-100'} rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm`}>
                            {isValid ? (
                                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="w-12 h-12 text-amber-600" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            {isValid ? "Valid Document" : "Document Invalid"}
                        </h1>
                        <p className="text-slate-600">
                            This document has been officially verified by the LexiLedger Registry.
                        </p>
                    </div>

                    {/* Details List */}
                    <div className="p-8 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Document Type
                                </label>
                                <p className="font-semibold text-slate-900 text-lg">{result.document_type}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Document ID
                                </label>
                                <p className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block text-sm">
                                    {result.document_uuid}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <User className="w-3 h-3" /> Issued By
                                </label>
                                <p className="font-semibold text-slate-900">{result.issuer_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Date Issued
                                </label>
                                <p className="font-semibold text-slate-900">{result.date_issued}</p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-6" />

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                                <Hash className="w-3 h-3" /> Digital Signature (SHA-256)
                            </label>
                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 break-all select-all">
                                {result.hash}
                            </div>
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                The cryptographic hash ensures this document has not been altered since issuance.
                            </p>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Secured by LexiLedger Blockchain Tech</span>
                        </div>
                        <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 disabled:opacity-50" disabled title="Not available for public view">
                            <Download className="w-4 h-4" /> Download Original (Restricted)
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-sm mt-8">
                    © 2025 LexiLedger. All rights reserved. registry-v1.0.4
                </p>
            </div>
        </div>
    );
};

export default VerificationPage;
