
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Initialize the client with the API Key from environment variables
// In Vite, use import.meta.env instead of process.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSwornTranslation = async (
  sourceLang: string,
  targetLang: string,
  documentType: string,
  imageBase64: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  templateId?: string
): Promise<string> => {
  try {
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // PROMPT: WORD PROCESSOR STYLE
    const prompt = `
      Act as a professional Sworn Translator. 
      Target Language: ${targetLang}.
      
      TASK:
      1. Analyze the image and extract ALL text.
      2. Translate everything into ${targetLang}.
      3. Output COMPACT HTML suitable for a Word Document.

      RULES FOR HTML:
      - Use ONLY: <h1>, <h2>, <p>, <b>, <i>, <u>, <br>, <table>, <tr>, <td>.
      - DO NOT use <div>, <span>, or inline styles.
      - SINGLE MAIN TABLE: If the document is a form/certificate, use ONE main <table> width="100%" to structure the entire layout. This prevents formatting issues.
      - COMPACT SPACING: Do not add extra <br> tags between lines. Use single <br> only when necessary.
      - SEALS: Write [SEAL: description] in bold.
      - SIGNATURES: Write [SIGNATURE: Name] in bold.

      STRICT LANGUAGE RULES:
      - OUTPUT MUST BE 100% ${targetLang}. 
      - ABSOLUTELY NO ${sourceLang} CHARACTERS ALLOWED.
      - IF YOU SEE ARABIC, TRANSLATE IT OR DELETE IT. NEVER TRANSCRIBE IT.
      
      DOCUMENT STRUCTURE:
      - Start with: <p align="right"><i>(Translated from ${sourceLang})</i></p>
      - Content...
      - End with: <br><br><p align="center"><b>*** Certified true translation ***</b></p>
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.1, 
        maxOutputTokens: 8192,
        safetySettings: [
           { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
           { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      }
    });

    let cleanText = response.text || "";
    
    // 1. Clean Markdown
    cleanText = cleanText.replace(/```html/g, '').replace(/```/g, '').trim();

    // 2. NUCLEAR OPTION: Remove ALL Arabic unicode ranges
    cleanText = cleanText.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');

    // 3. Compact Spacing
    cleanText = cleanText.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
    cleanText = cleanText.replace(/<p>\s*<\/p>/g, '');

    return cleanText;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw new Error("Failed to translate document.");
  }
};

// General-purpose content generation for AI features
export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Content Generation Error:", error);
    throw new Error("Failed to generate content.");
  }
};

export const getFinancialInsights = async (
  jobs: any[],
  expenses: any[],
  currentMonth: string
): Promise<string> => {
  try {
    const simplifiedJobs = jobs.map(j => ({
      date: j.date,
      client: j.clientName,
      amount: j.priceTotal,
      status: j.status
    }));
    
    const simplifiedExpenses = expenses.map(e => ({
      date: e.date,
      category: e.category,
      amount: e.amount
    }));

    const prompt = `
      Act as a financial advisor for a freelance translator.
      Current Month: ${currentMonth}.
      
      Analyze these Jobs:
      ${JSON.stringify(simplifiedJobs)}

      Analyze these Expenses:
      ${JSON.stringify(simplifiedExpenses)}

      Task:
      Provide a short executive summary (max 150 words).
      1. Calculate estimated profit.
      2. Identify the best client.
      3. Give one specific tip to reduce expenses or improve cash flow.
      
      Format: Plain text, professional tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis not available.";
  } catch (error) {
    console.error("Gemini Financial Insight Error:", error);
    return "Could not generate financial insights.";
  }
};
