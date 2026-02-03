// Medical Database Service
// Comprehensive search, filtering, and astrological correlation service for medical databases

import icd10Data from './icd10-medical-database.json';
import homeopathyData from './homeopathic-materia-medica.json';
import herbalData from './culpeper-herbal.json';
import acupunctureData from './acupuncture-formulas.json';

export interface MedicalSearchCriteria {
  planets?: string[];
  zodiacSigns?: string[];
  houses?: number[];
  aspects?: string[];
  bodyParts?: string[];
  keywords?: string[];
  severity?: 'acute' | 'chronic' | 'critical' | 'routine' | 'moderate' | 'severe';
  categories?: string[];
}

export interface ICD10Entry {
  code: string;
  name: string;
  category: string;
  bodyPart: string;
  zodiacSign: string;
  planets: string[];
  houses: number[];
  aspects: string[];
  severity: string;
  keywords: string[];
}

export interface HomeopathicEntry {
  id: string;
  name: string;
  latinName: string;
  keynotes: string[];
  modalities: string;
  aggravations: string[];
  ameliorations: string[];
  zodiacRuler: string;
  planetaryRuler: string;
  element: string;
  bodyParts: string[];
  symptoms: string[];
  dosage: string;
}

export interface HerbalEntry {
  id: string;
  name: string;
  planetaryRuler: string;
  zodiacSign: string;
  element: string;
  bodyParts: string[];
  virtues: string[];
  preparation: string;
  dosage: string;
  contraindications: string[];
  astrologicalTiming: string;
}

export interface AcupunctureEntry {
  id: string;
  name: string;
  meridians: string[];
  points: string[];
  indications: string[];
  contraindications: string[];
  zodiacCorrelation: string;
  elementalBalance: string;
  seasonalTiming: string;
}

export class MedicalDatabaseService {
  private icd10Cache: ICD10Entry[] = icd10Data as ICD10Entry[];
  private homeopathyCache: HomeopathicEntry[] = homeopathyData as HomeopathicEntry[];
  private herbalCache: HerbalEntry[] = herbalData as HerbalEntry[];
  private acupunctureCache: AcupunctureEntry[] = acupunctureData as AcupunctureEntry[];

  // Search ICD10 Database
  searchICD10(criteria: MedicalSearchCriteria): ICD10Entry[] {
    return this.icd10Cache.filter(entry => {
      let matches = true;

      if (criteria.planets && criteria.planets.length > 0) {
        matches = matches && criteria.planets.some(planet => entry.planets.includes(planet));
      }

      if (criteria.zodiacSigns && criteria.zodiacSigns.length > 0) {
        matches = matches && criteria.zodiacSigns.includes(entry.zodiacSign);
      }

      if (criteria.houses && criteria.houses.length > 0) {
        matches = matches && criteria.houses.some(house => entry.houses.includes(house));
      }

      if (criteria.aspects && criteria.aspects.length > 0) {
        matches = matches && criteria.aspects.some(aspect => entry.aspects.includes(aspect));
      }

      if (criteria.bodyParts && criteria.bodyParts.length > 0) {
        matches = matches && entry.bodyPart.includes(criteria.bodyParts[0]);
      }

      if (criteria.keywords && criteria.keywords.length > 0) {
        matches = matches && criteria.keywords.some(kw => 
          entry.name.toLowerCase().includes(kw.toLowerCase()) ||
          entry.keywords.some(k => k.toLowerCase().includes(kw.toLowerCase()))
        );
      }

      if (criteria.severity) {
        matches = matches && entry.severity === criteria.severity;
      }

      if (criteria.categories && criteria.categories.length > 0) {
        matches = matches && criteria.categories.includes(entry.category);
      }

      return matches;
    });
  }

  // Search Homeopathic Materia Medica
  searchHomeopathy(criteria: MedicalSearchCriteria): HomeopathicEntry[] {
    return this.homeopathyCache.filter(entry => {
      let matches = true;

      if (criteria.planets && criteria.planets.length > 0) {
        matches = matches && criteria.planets.some(planet => 
          entry.planetaryRuler === planet || entry.zodiacRuler === planet
        );
      }

      if (criteria.zodiacSigns && criteria.zodiacSigns.length > 0) {
        matches = matches && criteria.zodiacSigns.some(sign => 
          entry.keynotes.some(keynote => keynote.toLowerCase().includes(sign.toLowerCase()))
        );
      }

      if (criteria.bodyParts && criteria.bodyParts.length > 0) {
        matches = matches && criteria.bodyParts.some(part => entry.bodyParts.includes(part));
      }

      if (criteria.keywords && criteria.keywords.length > 0) {
        matches = matches && criteria.keywords.some(kw => 
          entry.name.toLowerCase().includes(kw.toLowerCase()) ||
          entry.keynotes.some(k => k.toLowerCase().includes(kw.toLowerCase())) ||
          entry.symptoms.some(s => s.toLowerCase().includes(kw.toLowerCase()))
        );
      }

      return matches;
    });
  }

  // Search Culpeper's Herbal
  searchHerbal(criteria: MedicalSearchCriteria): HerbalEntry[] {
    return this.herbalCache.filter(entry => {
      let matches = true;

      if (criteria.planets && criteria.planets.length > 0) {
        matches = matches && criteria.planets.includes(entry.planetaryRuler);
      }

      if (criteria.zodiacSigns && criteria.zodiacSigns.length > 0) {
        matches = matches && criteria.zodiacSigns.includes(entry.zodiacSign);
      }

      if (criteria.bodyParts && criteria.bodyParts.length > 0) {
        matches = matches && criteria.bodyParts.some(part => entry.bodyParts.includes(part));
      }

      if (criteria.keywords && criteria.keywords.length > 0) {
        matches = matches && criteria.keywords.some(kw => 
          entry.name.toLowerCase().includes(kw.toLowerCase()) ||
          entry.virtues.some(v => v.toLowerCase().includes(kw.toLowerCase()))
        );
      }

      return matches;
    });
  }

  // Search Acupuncture Formulas
  searchAcupuncture(criteria: MedicalSearchCriteria): AcupunctureEntry[] {
    return this.acupunctureCache.filter(entry => {
      let matches = true;

      if (criteria.zodiacSigns && criteria.zodiacSigns.length > 0) {
        matches = matches && criteria.zodiacSigns.includes(entry.zodiacCorrelation);
      }

      if (criteria.keywords && criteria.keywords.length > 0) {
        matches = matches && criteria.keywords.some(kw => 
          entry.name.toLowerCase().includes(kw.toLowerCase()) ||
          entry.indications.some(i => i.toLowerCase().includes(kw.toLowerCase())) ||
          entry.meridians.some(m => m.toLowerCase().includes(kw.toLowerCase()))
        );
      }

      return matches;
    });
  }

  // Cross-reference between databases
  crossReference(bodyPart: string, astrologicalFormula: string): {
    conditions: ICD10Entry[];
    homeopathic: HomeopathicEntry[];
    herbal: HerbalEntry[];
    acupuncture: AcupunctureEntry[];
  } {
    const criteria: MedicalSearchCriteria = {
      bodyParts: [bodyPart],
      keywords: [astrologicalFormula]
    };

    return {
      conditions: this.searchICD10(criteria),
      homeopathic: this.searchHomeopathy(criteria),
      herbal: this.searchHerbal(criteria),
      acupuncture: this.searchAcupuncture(criteria)
    };
  }

  // Find remedies for specific condition
  findRemedies(conditionCode: string) {
    const condition = this.icd10Cache.find(c => c.code === conditionCode);
    if (!condition) return null;

    const criteria: MedicalSearchCriteria = {
      bodyParts: [condition.bodyPart],
      zodiacSigns: [condition.zodiacSign],
      keywords: condition.keywords
    };

    return {
      condition,
      homeopathic: this.searchHomeopathy(criteria),
      herbal: this.searchHerbal(criteria),
      acupuncture: this.searchAcupuncture(criteria)
    };
  }

  // Get all unique categories
  getCategories(): string[] {
    return [...new Set(this.icd10Cache.map(entry => entry.category))];
  }

  // Get all unique body parts
  getBodyParts(): string[] {
    const allParts = [
      ...this.icd10Cache.map(e => e.bodyPart),
      ...this.homeopathyCache.flatMap(e => e.bodyParts),
      ...this.herbalCache.flatMap(e => e.bodyParts)
    ];
    return [...new Set(allParts)];
  }

  // Formula-based search (planet in sign in house + aspects)
  formulaSearch(formula: {
    planet: string;
    sign: string;
    house?: number;
    aspects?: string[];
  }) {
    // This will be enhanced with chart data integration
    const criteria: MedicalSearchCriteria = {
      planets: [formula.planet],
      zodiacSigns: [formula.sign],
      houses: formula.house ? [formula.house] : undefined,
      aspects: formula.aspects
    };

    return {
      icd10: this.searchICD10(criteria),
      homeopathic: this.searchHomeopathy(criteria),
      herbal: this.searchHerbal(criteria),
      acupuncture: this.searchAcupuncture(criteria)
    };
  }
}

export const medicalDatabaseService = new MedicalDatabaseService();

