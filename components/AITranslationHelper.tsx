import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { generateContent } from '../services/geminiService';

interface AITranslationHelperProps {
  sourceText?: string;
  targetText?: string;
  sourceLang: string;
  targetLang: string;
  onSuggestion?: (suggestion: string) => void;
}

export const AITranslationHelper: React.FC<AITranslationHelperProps> = ({
  sourceText,
  targetText,
  sourceLang,
  targetLang,
  onSuggestion
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    suggestions: string[];
  } | null>(null);

  const checkQuality = async () => {
    if (!sourceText || !targetText) return;
    
    setLoading(true);
    try {
      const prompt = `As a professional translation quality checker, analyze this translation:

Source (${sourceLang}): ${sourceText}
Translation (${targetLang}): ${targetText}

Provide:
1. Quality score (0-100)
2. Brief feedback
3. 2-3 specific improvement suggestions

Format as JSON: {"score": number, "feedback": string, "suggestions": [strings]}`;

      const response = await generateContent(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error('AI quality check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (type: 'quote' | 'invoice' | 'followup') => {
    setLoading(true);
    try {
      const prompts = {
        quote: 'Generate a professional email to send a translation quote to a client. Include greeting, quote details mention, and professional closing.',
        invoice: 'Generate a professional email to send an invoice for completed translation work. Be polite and include payment terms mention.',
        followup: 'Generate a polite follow-up email for an unpaid invoice. Be professional and friendly, not aggressive.'
      };

      const email = await generateContent(prompts[type]);
      if (onSuggestion) onSuggestion(email);
    } catch (error) {
      console.error('Email generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">AI Assistant</h3>
      </div>

      <div className="space-y-3">
        {/* Quality Check */}
        {sourceText && targetText && (
          <div>
            <button
              onClick={checkQuality}
              disabled={loading}
              className="w-full bg-white hover:bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Check Translation Quality
                </>
              )}
            </button>

            {result && (
              <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.score}%
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{result.feedback}</p>
                {result.suggestions.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-gray-600">Suggestions:</div>
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <AlertCircle className="w-3 h-3 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Email Templates */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => generateEmail('quote')}
            disabled={loading}
            className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs border border-blue-200 transition-colors disabled:opacity-50"
          >
            Quote Email
          </button>
          <button
            onClick={() => generateEmail('invoice')}
            disabled={loading}
            className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs border border-blue-200 transition-colors disabled:opacity-50"
          >
            Invoice Email
          </button>
          <button
            onClick={() => generateEmail('followup')}
            disabled={loading}
            className="bg-white hover:bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs border border-blue-200 transition-colors disabled:opacity-50"
          >
            Follow-up
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITranslationHelper;

