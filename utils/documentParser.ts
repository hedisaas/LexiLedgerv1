import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


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
            fr: ['permis de conduire', 'permis de circul'],
            de: ['führerschein', 'fahrerlaubnis'],
            it: ['patente di guida', 'permesso di guida'],
            es: ['permiso de conducir', 'carnet de conducir', 'licencia de conducir'],
            ar: ['رخصة سياقة', 'إجازة سوق']
        }
    },
    {
        type: 'Identity Document',
        category: 'ID Documents',
        keywords: {
            en: ['identity card', 'id card', 'passport', 'national id', 'residence permit'],
            fr: ['carte d\'identité', 'cin', 'passeport', 'titre de séjour', 'carte nationale'],
            de: ['personalausweis', 'reisepass', 'aufenthaltstitel'],
            it: ['carta d\'identità', 'passaporto', 'permesso di soggiorno'],
            es: ['documento de identidad', 'dni', 'pasaporte', 'permiso de residencia'],
            ar: ['بطاقة تعريف', 'جواز سفر', 'بطاقة هوية']
        }
    },
    {
        type: 'Business Document',
        category: 'Legal',
        keywords: {
            en: ['business registration', 'certificate of incorporation', 'articles of association', 'tax registration', 'trade register'],
            fr: ['registre de commerce', 'kbis', 'statuts', 'matricule fiscale', 'entreprise individuelle', 'déclaration d\'existence'],
            de: ['handelsregisterauszug', 'gewerbeanmeldung', 'satzung', 'gesellschaftervertrag'],
            it: ['registro delle imprese', 'visura camerale', 'atto costitutivo', 'statuto'],
            es: ['registro mercantil', 'escritura de constitución', 'estatutos', 'nif'],
            ar: ['سجل تجاري', 'باتيندا', 'نظام أساسي', 'رخصة تجارية']
        }
    },
    {
        type: 'Legal Certification',
        category: 'Legal',
        keywords: {
            en: ['sworn statement', 'affidavit', 'certificate of', 'attestation', 'declaration'],
            fr: ['déclaration sur l\'honneur', 'attestation', 'certificat de', 'témoignage'],
            de: ['eidesstattliche versicherung', 'beglaubigung', 'bescheinigung'],
            it: ['autocertificazione', 'dichiarazione sostitutiva', 'attestato'],
            es: ['declaración jurada', 'certificado de', 'testimonio'],
            ar: ['تصريح بالشرف', 'شهادة', 'إشهاد']
        }
    },
    {
        type: 'Technical Document',
        category: 'Technical',
        keywords: {
            en: ['technical sheet', 'specification', 'user manual', 'guide', 'datasheet'],
            fr: ['fiche technique', 'manuel d\'utilisation', 'guide utilisateur', 'spécifications'],
            de: ['technisches datenblatt', 'bedienungsanleitung', 'handbuch'],
            it: ['scheda tecnica', 'manuale d\'uso', 'specifiche tecniche'],
            es: ['ficha técnica', 'manual de usuario', 'especificaciones'],
            ar: ['بطاقة تقنية', 'دليل المستخدم', 'مواصفات']
        }
    },
    {
        type: 'Employment Document',
        category: 'Professional',
        keywords: {
            en: ['cv', 'resume', 'curriculum vitae', 'cover letter', 'employment contract'],
            fr: ['cv', 'curriculum vitae', 'lettre de motivation', 'contrat de travail'],
            de: ['lebenslauf', 'bewerbungsschreiben', 'arbeitsvertrag'],
            it: ['curriculum vitae', 'lettera di presentazione', 'contratto di lavoro'],
            es: ['curriculum vitae', 'carta de presentación', 'contrato de trabajo'],
            ar: ['سيرة ذاتية', 'عقد عمل', 'رسالة تحفيز']
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
