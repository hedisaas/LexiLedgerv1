import { supabase } from '../lib/supabase';
import { TranslationJob, Quote, BusinessProfile } from '../types';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const initEmailService = () => {
    // No init needed for Edge Functions
};

export const sendQuoteEmail = async (
    clientEmail: string,
    quote: Quote,
    profile: BusinessProfile,
    pdfBlob: Blob
) => {
    try {
        const base64Pdf = await blobToBase64(pdfBlob);

        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: clientEmail,
                subject: `Devis - ${quote.id.slice(0, 6)} - ${profile.businessName}`,
                html: `
          <h1>Devis de Traduction</h1>
          <p>Cher ${quote.clientName},</p>
          <p>Veuillez trouver ci-joint le devis pour votre demande de traduction.</p>
          <p><strong>Référence:</strong> DEV-${quote.id.slice(0, 6)}<br>
          <strong>Total:</strong> ${quote.priceTotal.toFixed(3)} TND</p>
          <p>Cordialement,<br>${profile.translatorName}<br>${profile.businessName}</p>
        `,
                attachments: [{
                    filename: `Devis_${quote.id.slice(0, 6)}.pdf`,
                    content: base64Pdf
                }]
            }
        });

        if (error) throw error;
        return { success: true, response: data };
    } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error };
    }
};

export const sendInvoiceEmail = async (
    clientEmail: string,
    invoice: TranslationJob,
    profile: BusinessProfile,
    pdfBlob: Blob
) => {
    try {
        const base64Pdf = await blobToBase64(pdfBlob);

        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: clientEmail,
                subject: `Facture - ${invoice.id.slice(0, 6)} - ${profile.businessName}`,
                html: `
          <h1>Facture de Traduction</h1>
          <p>Cher ${invoice.clientName},</p>
          <p>Veuillez trouver ci-joint la facture pour votre traduction terminée.</p>
          <p><strong>Référence:</strong> FAC-${invoice.id.slice(0, 6)}<br>
          <strong>Total:</strong> ${invoice.priceTotal.toFixed(3)} TND</p>
          <p>Cordialement,<br>${profile.translatorName}<br>${profile.businessName}</p>
        `,
                attachments: [{
                    filename: `Facture_${invoice.id.slice(0, 6)}.pdf`,
                    content: base64Pdf
                }]
            }
        });

        if (error) throw error;
        return { success: true, response: data };
    } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error };
    }
};
