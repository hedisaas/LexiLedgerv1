
import { TMUnit, GlossaryTerm } from '../types';

// Mock Initial Glossary Data
const INITIAL_GLOSSARY: GlossaryTerm[] = [
  { id: 'g1', source: 'sworn translator', target: 'traducteur assermenté', langPair: 'en-fr' },
  { id: 'g2', source: 'birth certificate', target: 'acte de naissance', langPair: 'en-fr' },
  { id: 'g3', source: 'marriage certificate', target: 'acte de mariage', langPair: 'en-fr' },
  { id: 'g4', source: 'criminal record', target: 'casier judiciaire', langPair: 'en-fr' },
  { id: 'g5', source: 'bachelor degree', target: 'diplôme de licence', langPair: 'en-fr' },
  { id: 'g6', source: 'witness', target: 'témoin', langPair: 'en-fr' },
];

export const getGlossary = (): GlossaryTerm[] => {
  const saved = localStorage.getItem('lexiledger_glossary');
  return saved ? JSON.parse(saved) : INITIAL_GLOSSARY;
};

export const saveGlossary = (glossary: GlossaryTerm[]) => {
  localStorage.setItem('lexiledger_glossary', JSON.stringify(glossary));
};

export const addGlossaryTerm = (term: GlossaryTerm) => {
  const current = getGlossary();
  saveGlossary([term, ...current]);
};

export const deleteGlossaryTerm = (id: string) => {
  const current = getGlossary();
  saveGlossary(current.filter(t => t.id !== id));
};

export const findGlossaryMatches = (text: string, langPair: string): GlossaryTerm[] => {
  const glossary = getGlossary();
  if (!text) return [];
  // Simple case-insensitive match
  return glossary.filter(term =>
    text.toLowerCase().includes(term.source.toLowerCase())
  );
};

// Mock TM Data
const INITIAL_TM: TMUnit[] = [
  { id: 'tm1', sourceSegment: 'In witness whereof', targetSegment: 'En foi de quoi', langPair: 'en-fr', timestamp: Date.now() },
  { id: 'tm2', sourceSegment: 'Done at Tunis', targetSegment: 'Fait à Tunis', langPair: 'en-fr', timestamp: Date.now() },
  { id: 'tm3', sourceSegment: 'Ministry of Higher Education', targetSegment: 'Ministère de l\'Enseignement Supérieur', langPair: 'en-fr', timestamp: Date.now() },
];

export const getTM = (): TMUnit[] => {
  const saved = localStorage.getItem('lexiledger_tm');
  return saved ? JSON.parse(saved) : INITIAL_TM;
};

export const saveTM = (tm: TMUnit[]) => {
  localStorage.setItem('lexiledger_tm', JSON.stringify(tm));
};

export const findTMMatches = (text: string, threshold: number = 0.4): TMUnit[] => {
  const tm = getTM();
  if (!text) return [];

  return tm.filter(unit => {
    // Very basic similarity check (word overlap)
    const textWords = text.toLowerCase().split(/\s+/);
    const sourceWords = unit.sourceSegment.toLowerCase().split(/\s+/);
    const intersection = textWords.filter(w => sourceWords.includes(w));
    const similarity = intersection.length / Math.max(textWords.length, sourceWords.length);
    return similarity >= threshold;
  });
};

export const addToTM = (source: string, target: string, langPair: string) => {
  if (!source || !target) return;
  const tm = getTM();
  const newUnit: TMUnit = {
    id: crypto.randomUUID(),
    sourceSegment: source.trim(),
    targetSegment: target.trim(),
    langPair,
    timestamp: Date.now()
  };
  saveTM([newUnit, ...tm]);
};

// --- TMX Import/Export ---

export const exportTMX = (units: TMUnit[]): string => {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<tmx version="1.4">
  <header creationtool="LexiLedger" creationtoolversion="1.0" segtype="sentence" adminlang="en-us" srclang="en" datatype="PlainText"/>
  <body>`;

  const body = units.map(u => {
    const [srcLang, tgtLang] = u.langPair.split('-');
    return `    <tu tuid="${u.id}">
      <tuv xml:lang="${srcLang}">
        <seg>${u.sourceSegment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</seg>
      </tuv>
      <tuv xml:lang="${tgtLang}">
        <seg>${u.targetSegment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</seg>
      </tuv>
    </tu>`;
  }).join('\n');

  const footer = `
  </body>
</tmx>`;

  return header + '\n' + body + footer;
};

export const importTMX = async (xmlContent: string): Promise<TMUnit[]> => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const tus = xmlDoc.getElementsByTagName("tu");
  const newUnits: TMUnit[] = [];

  for (let i = 0; i < tus.length; i++) {
    const tu = tus[i];
    const tuvs = tu.getElementsByTagName("tuv");
    if (tuvs.length < 2) continue;

    let source = "";
    let target = "";
    let srcLang = "en";
    let tgtLang = "fr";

    // Naive assumption: first is source, second is target if not specified otherwise
    // In a real TMX, we should check xml:lang attributes against desired pair
    if (tuvs[0].getElementsByTagName("seg")[0]) {
      source = tuvs[0].getElementsByTagName("seg")[0].textContent || "";
      srcLang = tuvs[0].getAttribute("xml:lang") || "en";
    }
    if (tuvs[1].getElementsByTagName("seg")[0]) {
      target = tuvs[1].getElementsByTagName("seg")[0].textContent || "";
      tgtLang = tuvs[1].getAttribute("xml:lang") || "fr";
    }

    if (source && target) {
      newUnits.push({
        id: crypto.randomUUID(),
        sourceSegment: source,
        targetSegment: target,
        langPair: `${srcLang}-${tgtLang}`.toLowerCase(),
        timestamp: Date.now()
      });
    }
  }
  return newUnits;
};