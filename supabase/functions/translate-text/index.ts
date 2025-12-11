import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { text, sourceLang, targetLang, documentType } = await req.json();

        if (!text) {
            throw new Error("Text is required");
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const prompt = `
      You are a professional sworn translator. 
      Translate the following "${documentType || 'document'}" from ${sourceLang || 'auto'} to ${targetLang || 'English'}.
      Maintain the original formatting and professional tone.
      Do not include any conversational text, only the translation.
      
      Text to translate:
      ${text}
    `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            throw new Error(data.error.message || "Failed to generate translation");
        }

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error("No translation generated");
        }

        const translatedText = data.candidates[0].content.parts[0].text;

        return new Response(
            JSON.stringify({ translation: translatedText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
