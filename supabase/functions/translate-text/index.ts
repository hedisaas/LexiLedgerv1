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
        const { text, sourceLang, targetLang } = await req.json();

        if (!text) {
            throw new Error("Text is required");
        }

        // DEEPL API KEY (Free Tier)
        const apiKey = "3a75fb36-4bfa-4d4c-ae60-2b2dc05cfa20:fx";

        // Language Mapping
        let target = (targetLang || 'EN').toUpperCase();
        if (target === 'EN') target = 'EN-US'; // DeepL requires specific EN variant for target

        let source = (sourceLang || '').toUpperCase();
        if (source === 'AUTO') source = ''; // Let DeepL detect

        const p = new URLSearchParams();
        p.append('auth_key', apiKey);
        p.append('text', text);
        p.append('target_lang', target);
        if (source) p.append('source_lang', source);

        console.log(`DeepL Translating to ${target}...`);

        const response = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: p
        });

        const data = await response.json();

        if (response.status !== 200) {
            console.error("DeepL API Error:", data);
            throw new Error(data.message || "Failed to translate with DeepL");
        }

        if (!data.translations || !data.translations[0]) {
            throw new Error("No translation returned from DeepL");
        }

        const translatedText = data.translations[0].text;

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
