import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// In a Vite environment, we might need a specific worker configuration.
// For now, we'll try to use the CDN worker or let the bundler handle it if possible.
// Common issue with pdfjs in Vite: worker needs to be explicit or copied.
// Let's rely on standard import if possible, or fallback to CDN.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


export interface DetectedDocType {
    type: string;
    category: string;
    confidence: number;
    tags: string[];
    language?: string;
}

// Multi-language Dictionary
const DOCUMENT_TYPES = [
    {
        type: 'Birth Certificate',
        category: 'Civil Status',
        keywords: {
            en: ['birth certificate', 'certificate of birth', 'date of birth'],
            fr: ['acte de naissance', 'extrait de naissance', 'bulletin de naissance'],
            de: ['geburtsurkunde', 'abstammungsurkunde', 'geburtsbescheinigung'],
            it: ['certificato di nascita', 'estratto di nascita', 'atto di nascita'],
            es: ['certificado de nacimiento', 'acta de nacimiento', 'partida de nacimiento'],
            ar: ['شهادة ميلاد', 'عقد ازدياد', 'مضمون ولادة']
        }
    },
    {
        type: 'Marriage Contract',
        category: 'Civil Status',
        keywords: {
            en: ['marriage certificate', 'certificate of marriage', 'marriage contract'],
            fr: ['acte de mariage', 'contrat de mariage', 'certificat de mariage'],
            de: ['eheurkunde', 'heiratsurkunde', 'ehevertrag'],
            it: ['certificato di matrimonio', 'atto di matrimonio', 'estratto di matrimonio'],
            es: ['certificado de matrimonio', 'acta de matrimonio', 'partida de matrimonio'],
            ar: ['عقد زواج', 'شهادة زواج', 'وثيقة زواج']
        }
    },
    {
        type: 'Criminal Record',
        category: 'Legal',
        keywords: {
            en: ['criminal record', 'police check', 'certificate of good conduct', 'police clearance'],
            fr: ['casier judiciaire', 'bulletin n°3', 'bonne conduite', 'extrait du casier_judiciaire'],
            de: ['führungszeugnis', 'strafregisterauszug', 'polizeiliches führungszeugnis'],
            it: ['casellario giudiziale', 'carichi pendenti', 'fedina penale'],
            es: ['antecedentes penales', 'certificado de antecedentes', 'buena conducta'],
            ar: ['سجل عدلي', 'بطاقة عدد 3', 'حسن السيرة', 'سوابق عدلية']
        }
    },
    {
        type: 'Diploma/Degree',
        category: 'Academic',
        keywords: {
            en: ['diploma', 'degree certificate', 'transcript of records', 'bachelor degree', 'master degree'],
            fr: ['diplôme', 'baccalauréat', 'licence', 'master', 'relevé de notes', 'attestation de réussite'],
            de: ['diplom', 'abitur', 'zeugnis', 'urkunde', 'semesterzeugnis', 'bachelorzeugnis'],
            it: ['diploma', 'laurea', 'certificato di laurea', 'pagella'],
            es: ['diploma', 'título universitario', 'certificado de estudios', 'bachillerato'],
            ar: ['شهادة تخرج', 'دبلوم', 'كشف نقاط', 'شهادة نجاح', 'بكalooria']
        }
    },
    {
        type: 'Driving License',
        category: 'ID Documents',
        keywords: {
            en: ['driving license', 'driver license', 'driving permit'],
            fr: ['permis de conduire', 'permis de conduc'],
            de: ['führerschein', 'fahrerlaubnis'],
            it: ['patente di guida', 'permesso di guida'],
            es: ['permiso de conducir', 'carnet de conducir', 'licencia de conducir'],
            ar: ['رخصة سياقة', 'إجازة سوق']
        }
    },
    {
        type: 'Bank Statement',
        category: 'Financial',
        keywords: {
            en: ['bank statement', 'account statement', 'balance'],
            fr: ['relevé bancaire', 'extrait de compte', 'situation de compte'],
            de: ['kontoauszug', 'bankauszug'],
            it: ['estratto conto', 'saldo contabile'],
            es: ['estado de cuenta', 'extracto bancario'],
            ar: ['كشف حساب', 'بيان بنكي']
        }
    },
    {
        type: 'Invoice',
        category: 'Financial',
        keywords: {
            en: ['invoice', 'bill', 'receipt', 'payment due'],
            fr: ['facture', 'reçu', 'quittance', 'note d\'honoraires'],
            de: ['rechnung', 'quittung', 'zahlungsbeleg'],
            it: ['fattura', 'ricevuta', 'scontrino'],
            es: ['factura', 'recibo', 'cuenta'],
            ar: ['فاتورة', 'إيصال', 'وصل']
        }
    }
];

export const parseFileContent = async (file: File): Promise<DetectedDocType | null> => {
    try {
        let text = '';

        if (file.name.endsWith('.docx')) {
            text = await parseDocx(file);
        } else if (file.name.endsWith('.pdf')) {
            text = await parsePdf(file);
        } else {
            // Fallback: try to detect from filename only
            text = file.name.replace(/[_-]/g, ' ');
        }

        return detectType(text, file.name);

    } catch (error) {
        console.error('Error parsing file:', error);
        // Fallback detection from filename on error
        return detectType(file.name.replace(/[_-]/g, ' '), file.name);
    }
};

const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.toLowerCase();
};

const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    // Limit to first 2 pages for performance
    const pagesToRead = Math.min(pdf.numPages, 2);

    for (let i = 1; i <= pagesToRead; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
    }

    return fullText.toLowerCase();
};

const detectType = (content: string, filename: string): DetectedDocType => {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    // Weights: Content match = 1, Filename match = 2 (Filename is usually a strong indicator if present)
    let bestMatch: DetectedDocType = {
        type: 'Unknown',
        category: 'Uncategorized',
        confidence: 0,
        tags: []
    };

    for (const docType of DOCUMENT_TYPES) {
        let score = 0;
        let detectedLang = '';

        for (const [lang, keywords] of Object.entries(docType.keywords)) {
            for (const keyword of keywords) {
                if (lowerFilename.includes(keyword)) {
                    score += 20; // Strong match on filename
                    detectedLang = lang;
                }
                if (lowerContent.includes(keyword)) {
                    score += 10; // Good match on content
                    if (!detectedLang) detectedLang = lang;
                }
            }
        }

        if (score > bestMatch.confidence) {
            bestMatch = {
                type: docType.type,
                category: docType.category,
                confidence: score,
                tags: [docType.category, detectedLang.toUpperCase()],
                language: detectedLang
            };
        }
    }

    // Normalize confidence (cap at 100)
    bestMatch.confidence = Math.min(bestMatch.confidence, 100);

    // If very low confidence, remain unknown
    if (bestMatch.confidence < 10) {
        return {
            type: 'Unknown',
            category: 'Uncategorized',
            confidence: 0,
            tags: []
        }
    }

    return bestMatch;
};
