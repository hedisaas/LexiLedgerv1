import { supabase } from '../lib/supabase';

export const translateText = async (text: string, sourceLang: string, targetLang: string, documentType: string) => {
    const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, sourceLang, targetLang, documentType }
    });

    if (error) {
        console.error('AI Translation Error:', error);
        throw error;
    }

    return data.translation;
};
