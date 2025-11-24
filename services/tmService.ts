
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