/**
 * Hardcodierte Provisionsregeln aus dem Barmenia/Gothaer Vertretervertrag
 * Stand: 01.01.2026
 *
 * Diese Regeln wurden aus dem Original-Vertrag extrahiert und können
 * direkt für die Abrechnungsanalyse verwendet werden, ohne dass der
 * Vertrag jedes Mal hochgeladen werden muss.
 */

import type { ProvisionRule } from '../types';

/**
 * Krankenversicherung (KV) - Barmenia/Gothaer
 */
const kvRules: ProvisionRule[] = [
  {
    id: 'kv-ap-stufe1',
    name: 'KV Abschlussprovision Stufe 1',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'Krankheitskostenversicherung', 'Krankenhaustagegeld', 'Krankentagegeld', 'Pflege-Ergänzung', 'bKV'],
    conditions: 'Produktionsleistung unter 200 EUR (Ø letzte 2 Wertungsjahre)',
    formula: 'AP = Monatsbeitrag × 3,75',
    parameters: {
      rate: '3,75',
      basis: 'Monatsbeitrag (MB)',
      staffel: [
        { von: 0, bis: 200, rate: 3.75 },
        { von: 200, bis: 500, rate: 5.25 },
        { von: 500, bis: 1000, rate: 6.25 },
        { von: 1000, bis: 2000, rate: 6.75 },
        { von: 2000, bis: null, rate: 7.25 }
      ]
    },
    notes: 'MB ohne 10% gesetzlichen Zuschlag nach §149 VAG'
  },
  {
    id: 'kv-ap-stufe2',
    name: 'KV Abschlussprovision Stufe 2',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV'],
    conditions: 'Produktionsleistung 200 bis unter 500 EUR',
    formula: 'AP = Monatsbeitrag × 5,25',
    parameters: { rate: '5,25', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-ap-stufe3',
    name: 'KV Abschlussprovision Stufe 3',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV'],
    conditions: 'Produktionsleistung 500 bis unter 1.000 EUR',
    formula: 'AP = Monatsbeitrag × 6,25',
    parameters: { rate: '6,25', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-ap-stufe4',
    name: 'KV Abschlussprovision Stufe 4',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV'],
    conditions: 'Produktionsleistung 1.000 bis unter 2.000 EUR',
    formula: 'AP = Monatsbeitrag × 6,75',
    parameters: { rate: '6,75', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-ap-stufe5',
    name: 'KV Abschlussprovision Stufe 5',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV'],
    conditions: 'Produktionsleistung ab 2.000 EUR',
    formula: 'AP = Monatsbeitrag × 7,25',
    parameters: { rate: '7,25', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-pflege-pflicht',
    name: 'Pflege-Pflichtversicherung AP',
    category: 'Abschluss',
    products: ['Pflege-Pflichtversicherung', 'PPV'],
    conditions: 'Feststehende AP',
    formula: 'AP = Monatsbeitrag × 1,5',
    parameters: { rate: '1,5', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-foerderpflege',
    name: 'Förderpflegetarif AP',
    category: 'Abschluss',
    products: ['Förderpflegetarif'],
    conditions: 'Feststehende AP',
    formula: 'AP = Monatsbeitrag × 1,5',
    parameters: { rate: '1,5', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-student',
    name: 'Studententarif AP',
    category: 'Abschluss',
    products: ['Studententarif', 'PSKV'],
    conditions: 'Feststehende AP',
    formula: 'AP = Monatsbeitrag × 1,0',
    parameters: { rate: '1,0', basis: 'Monatsbeitrag (MB)' }
  },
  {
    id: 'kv-ausland-lang',
    name: 'Langfristiger Auslandstarif AP',
    category: 'Abschluss',
    products: ['Auslandstarif', 'Langfristige Auslandsversicherung'],
    conditions: 'Laufzeitabhängig',
    formula: 'AP = 6% vom Monatsbeitrag je Monat Laufzeit',
    parameters: { rate: '6%', basis: 'Monatsbeitrag × Laufzeit' }
  },
  {
    id: 'kv-fp',
    name: 'KV Folgeprovision',
    category: 'Bestand',
    products: ['Krankenversicherung', 'KV', 'Pflege-Ergänzung'],
    conditions: 'Ab 2. Versicherungsjahr, Vertrag >6 Monate bestehend',
    formula: 'FP = Monatsbeitrag × 1,5%',
    parameters: { rate: '1,5%', basis: 'Monatliches Beitragssoll' },
    notes: 'Kein Anspruch bei Soll-Saldo > 3 Monatsbeiträge'
  },
  {
    id: 'kv-fp-ppv',
    name: 'Pflege-Pflichtversicherung FP',
    category: 'Bestand',
    products: ['Pflege-Pflichtversicherung', 'PPV'],
    conditions: 'Ab 2. Versicherungsjahr, Vertrag >12 Monate bestehend',
    formula: 'FP = Zahlbeitrag × 0,6%',
    parameters: { rate: '0,6%', basis: 'Zahlbeitrag' }
  },
  {
    id: 'kv-reise',
    name: 'Reiseversicherung LP',
    category: 'Bestand',
    products: ['Reise-Krankenversicherung', 'Reisegepäck', 'Reise-Unfall'],
    conditions: 'Einzel-KV befristet/unbefristet',
    formula: 'LP = Beitrag × 15%',
    parameters: { rate: '15%', basis: 'Beitrag' }
  },
  {
    id: 'kv-firmen-klein',
    name: 'Firmengeschäft LP (bis 150 MA)',
    category: 'Bestand',
    products: ['Firmen-Krankenversicherung', 'Gruppenversicherung'],
    conditions: 'Bis 150 Mitarbeitende',
    formula: 'LP = Beitrag × 5%',
    parameters: { rate: '5%', basis: 'Beitrag' }
  }
];

/**
 * Sach/Haftpflicht/Unfall/Kraftfahrt (SHUK) - Gothaer Allgemeine
 */
const shukRules: ProvisionRule[] = [
  // Privatkunden (PK)
  {
    id: 'pk-ap-5j-stufe1',
    name: 'PK Abschlussprovision 5J Stufe 1',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat', 'Fahrrad'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion unter 2.500 EUR',
    formula: 'AP = Nettojahresbeitrag × 40%',
    parameters: {
      rate: '40%',
      basis: 'Nettojahresbeitrag (ohne VSt)',
      staffel: [
        { von: 0, bis: 2500, rate: 40 },
        { von: 2500, bis: 7500, rate: 60 },
        { von: 7500, bis: 15000, rate: 70 },
        { von: 15000, bis: 25000, rate: 80 },
        { von: 25000, bis: null, rate: 90 }
      ]
    }
  },
  {
    id: 'pk-ap-5j-stufe5',
    name: 'PK Abschlussprovision 5J Stufe 5 (Top)',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion ab 25.000 EUR',
    formula: 'AP = Nettojahresbeitrag × 90%',
    parameters: { rate: '90%', basis: 'Nettojahresbeitrag (ohne VSt)' }
  },
  {
    id: 'pk-ap-3-4j',
    name: 'PK Abschlussprovision 3-4 Jahre',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Sach-Privat'],
    conditions: 'Vertragsdauer 3-4 Jahre',
    formula: 'AP = Nettojahresbeitrag × 30-60% (je nach Produktionsstufe)',
    parameters: {
      rate: '30-60%',
      basis: 'Nettojahresbeitrag',
      staffel: [
        { von: 0, bis: 2500, rate: 30 },
        { von: 2500, bis: 7500, rate: 40 },
        { von: 7500, bis: 15000, rate: 45 },
        { von: 15000, bis: 25000, rate: 50 },
        { von: 25000, bis: null, rate: 60 }
      ]
    }
  },
  {
    id: 'pk-ap-1-2j',
    name: 'PK Abschlussprovision 1-2 Jahre',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Sach-Privat'],
    conditions: 'Vertragsdauer 1-2 Jahre',
    formula: 'AP = Nettojahresbeitrag × 15-30% (je nach Produktionsstufe)',
    parameters: {
      rate: '15-30%',
      basis: 'Nettojahresbeitrag',
      staffel: [
        { von: 0, bis: 2500, rate: 15 },
        { von: 2500, bis: 7500, rate: 20 },
        { von: 7500, bis: 15000, rate: 20 },
        { von: 15000, bis: 25000, rate: 25 },
        { von: 25000, bis: null, rate: 30 }
      ]
    }
  },
  {
    id: 'pk-fp',
    name: 'PK Folgeprovision',
    category: 'Bestand',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat', 'Sach-Privat'],
    conditions: 'Ab 2. Versicherungsjahr',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' },
    notes: 'Wachstumszuschlag 0-2% abhängig von produktionsabhängiger Bestandsänderung'
  },
  // Selbständige Kunden (SK)
  {
    id: 'sk-ap-5j',
    name: 'SK Abschlussprovision 5J',
    category: 'Abschluss',
    products: ['Betriebshaftpflicht', 'Feuer', 'Einbruch', 'Geschäftsversicherung', 'GewerbeProtect'],
    conditions: 'Vertragsdauer 5 Jahre, Selbständige Kunden',
    formula: 'AP = Nettojahresbeitrag × 40-80% (je nach Produktionsstufe)',
    parameters: {
      rate: '40-80%',
      basis: 'Nettojahresbeitrag',
      staffel: [
        { von: 0, bis: 2500, rate: 40 },
        { von: 2500, bis: 12500, rate: 60 },
        { von: 12500, bis: 25000, rate: 70 },
        { von: 25000, bis: null, rate: 80 }
      ]
    },
    notes: 'Architekten-HV und Bau-HV max. 60%, Vermögensschaden-HV max. 40%'
  },
  {
    id: 'sk-fp',
    name: 'SK Folgeprovision',
    category: 'Bestand',
    products: ['Betriebshaftpflicht', 'Feuer', 'Einbruch', 'Geschäftsversicherung'],
    conditions: 'Ab 2. Versicherungsjahr, Selbständige Kunden',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' }
  },
  // Unternehmerkunden (UK)
  {
    id: 'uk-ap',
    name: 'UK Abschlussprovision',
    category: 'Abschluss',
    products: ['Unternehmensversicherung', 'Industrieversicherung', 'Großrisiken'],
    conditions: 'Unternehmerkunden',
    formula: 'AP = Nettojahresbeitrag × 8-10%',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'uk-fp',
    name: 'UK Folgeprovision',
    category: 'Bestand',
    products: ['Unternehmensversicherung', 'Industrieversicherung'],
    conditions: 'Ab 2. Versicherungsjahr, Unternehmerkunden',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' }
  },
  // Kraftfahrt (K)
  {
    id: 'kfz-normal',
    name: 'Kraftfahrt Normalwagnisse',
    category: 'Bestand',
    products: ['Kfz-Haftpflicht', 'Kasko', 'Kraftfahrtversicherung'],
    conditions: 'Normalwagnisse (K-Nw)',
    formula: 'FP = Nettojahresbeitrag × 7%',
    parameters: { rate: '7%', basis: 'Nettojahresbeitrag' },
    notes: 'AP wird als FP ausgewiesen'
  },
  {
    id: 'kfz-sonder',
    name: 'Kraftfahrt Sonderwagnisse',
    category: 'Bestand',
    products: ['Kfz-Sonderwagnisse', 'Flottenversicherung'],
    conditions: 'Sonderwagnisse (K-Sw)',
    formula: 'FP = Nettojahresbeitrag × 2%',
    parameters: { rate: '2%', basis: 'Nettojahresbeitrag' }
  },
  // Technische Versicherungen
  {
    id: 'tv-m',
    name: 'Technische Vers. Gruppe 1',
    category: 'Abschluss',
    products: ['Maschinenversicherung', 'Montageversicherung'],
    conditions: 'TV-M',
    formula: 'AP/FP = Nettojahresbeitrag × 9%',
    parameters: { rate: '9%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'tv-a',
    name: 'Technische Vers. Gruppe 2',
    category: 'Abschluss',
    products: ['Bauleistungsversicherung'],
    conditions: 'TV-A',
    formula: 'AP/FP = Nettojahresbeitrag × 7%',
    parameters: { rate: '7%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'tv-elektronik-5j',
    name: 'Elektronikversicherung 5J',
    category: 'Abschluss',
    products: ['Elektronikversicherung'],
    conditions: 'Vertragslaufzeit 5 Jahre',
    formula: 'AP = Nettojahresbeitrag × 35%, FP = 8%',
    parameters: { rate: '35%', basis: 'Nettojahresbeitrag' }
  }
];

/**
 * Lebensversicherung (LV) - Gothaer Leben
 */
const lvRules: ProvisionRule[] = [
  {
    id: 'lv-ap-stufe1',
    name: 'LV Abschlussprovision Stufe 1',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'Berufsunfähigkeit', 'Risikolebensversicherung'],
    conditions: 'LV-Produktion unter 125.000 EUR bewertete Beitragssumme',
    formula: 'AP = Bewertete Beitragssumme × 15‰',
    parameters: {
      rate: '15‰',
      basis: 'Bewertete Beitragssumme',
      staffel: [
        { von: 0, bis: 125000, rate: 15 },
        { von: 125000, bis: 250000, rate: 20 },
        { von: 250000, bis: 375000, rate: 23 },
        { von: 375000, bis: 500000, rate: 25 },
        { von: 500000, bis: 625000, rate: 27 },
        { von: 625000, bis: 750000, rate: 28 },
        { von: 750000, bis: 1000000, rate: 30 },
        { von: 1000000, bis: 1250000, rate: 31 },
        { von: 1250000, bis: null, rate: 32 }
      ]
    },
    notes: 'Provisionshaftungszeitraum 60 Monate (5 Jahre)'
  },
  {
    id: 'lv-ap-stufe9',
    name: 'LV Abschlussprovision Stufe 9 (Top)',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'BU'],
    conditions: 'LV-Produktion ab 1.250.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 32‰',
    parameters: { rate: '32‰', basis: 'Bewertete Beitragssumme' }
  },
  {
    id: 'lv-fp',
    name: 'LV Folgeprovision',
    category: 'Bestand',
    products: ['Lebensversicherung', 'Rentenversicherung', 'Kapitallebensversicherung'],
    conditions: 'Ab 2. Versicherungsjahr',
    formula: 'FP = eingegangene Beiträge × 1,0%',
    parameters: { rate: '1,0%', basis: 'Eingegangene Beiträge' }
  },
  {
    id: 'lv-fp-bu',
    name: 'BU/Grundfähigkeit Folgeprovision',
    category: 'Bestand',
    products: ['Berufsunfähigkeitsversicherung', 'BU', 'Grundfähigkeit', 'SBU'],
    conditions: 'Ab 2. Versicherungsjahr, Überschussbezugsart Beitragsreduktion',
    formula: 'FP = Bruttobeitrag × 0,5%',
    parameters: { rate: '0,5%', basis: 'Bruttobeitrag' },
    notes: 'Bei Sofortbonus: 1,0%'
  }
];

/**
 * Barmenia Allgemeine - Spezialprodukte
 */
const barmeniaAllgRules: ProvisionRule[] = [
  {
    id: 'ba-tierop',
    name: 'Tier-OP und Tierkrankenversicherung LP',
    category: 'Bestand',
    products: ['Tier-OP', 'Tierkrankenversicherung', 'Tierversicherung'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'ba-fahrrad',
    name: 'Fahrradversicherung LP',
    category: 'Bestand',
    products: ['Fahrradversicherung'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'ba-kiss',
    name: 'Kinderinvaliditätsversicherung LP',
    category: 'Bestand',
    products: ['KISS', 'Kinderinvaliditätsversicherung'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' }
  },
  {
    id: 'ba-sonstige',
    name: 'Sonstige Sach/HUK LP',
    category: 'Bestand',
    products: ['Sach-Versicherung', 'Haftpflicht', 'Unfall'],
    conditions: 'Alle nicht explizit genannten S/H/U-Versicherungen',
    formula: 'LP = Nettojahresbeitrag × 15%',
    parameters: { rate: '15%', basis: 'Nettojahresbeitrag' }
  }
];

/**
 * Storno-Regelungen
 */
const stornoRules: ProvisionRule[] = [
  {
    id: 'storno-kv',
    name: 'KV Storno-Rückrechnung',
    category: 'Storno',
    products: ['Krankenversicherung', 'KV'],
    conditions: 'Storno innerhalb Haftungszeit',
    formula: 'Rückbelastung = AP × (verbleibende Monate / Haftungsmonate)',
    parameters: { stornohaftung: '60 Monate (5 Jahre) für KV' },
    notes: 'Pro rata temporis Rückrechnung'
  },
  {
    id: 'storno-lv',
    name: 'LV Storno-Rückrechnung',
    category: 'Storno',
    products: ['Lebensversicherung', 'LV', 'BU'],
    conditions: 'Storno oder Beitragsreduzierung innerhalb 60 Monaten',
    formula: 'Rückbelastung = AP × (verbleibende Monate / 60)',
    parameters: { stornohaftung: '60 Monate' },
    notes: 'Entsprechend der Beitragsreduzierung anteilige Rückrechnung'
  },
  {
    id: 'storno-shuk',
    name: 'SHUK Storno-Rückrechnung',
    category: 'Storno',
    products: ['Sachversicherung', 'Haftpflicht', 'Unfall'],
    conditions: 'Vorzeitiges Storno',
    formula: 'Rückbelastung entsprechend vereinbarter Vertragslaufzeit',
    parameters: { stornohaftung: 'Max. 5 Jahre entsprechend Vertragslaufzeit' }
  }
];

/**
 * Dynamik-Erhöhungen
 */
const dynamikRules: ProvisionRule[] = [
  {
    id: 'dynamik-lv',
    name: 'LV Dynamikerhöhung',
    category: 'Dynamik',
    products: ['Dynamische Lebensversicherung'],
    conditions: 'Erhöhung im Rahmen Dynamikklausel',
    formula: 'AP auf Erhöhungsbetrag nach gültiger Produktionsleistungsstufe',
    parameters: { rate: 'Je nach aktueller Stufe 15-32‰' },
    notes: 'Eigene Provisionshaftungszeit für Erhöhung'
  }
];

/**
 * Ersteinstufung laut Vertretervertrag (festgeschrieben bis 30.06.2028)
 */
export const ersteinstufung = {
  pk: { jahre5: 60, jahre3_4: 40, jahre1_2: 20 },
  sk: { jahre5: 60, jahre3_4: 40, jahre1_2: 20 },
  kv: 5.25, // in MB
  lv: 23, // in ‰
  wachstumszuschlag: 2 // in %
};

/**
 * Alle Provisionsregeln zusammengeführt
 */
export const barmeniaProvisionRules: ProvisionRule[] = [
  ...kvRules,
  ...shukRules,
  ...lvRules,
  ...barmeniaAllgRules,
  ...stornoRules,
  ...dynamikRules
];

/**
 * Hilfsfunktion: Regel nach Produkt finden
 */
export function findRulesByProduct(product: string): ProvisionRule[] {
  const searchTerm = product.toLowerCase();
  return barmeniaProvisionRules.filter(rule =>
    rule.products.some(p => p.toLowerCase().includes(searchTerm)) ||
    rule.name.toLowerCase().includes(searchTerm)
  );
}

/**
 * Hilfsfunktion: Regel nach Kategorie finden
 */
export function findRulesByCategory(category: ProvisionRule['category']): ProvisionRule[] {
  return barmeniaProvisionRules.filter(rule => rule.category === category);
}

/**
 * Hilfsfunktion: AP-Satz für KV basierend auf Produktionsleistung
 */
export function getKvApRate(produktionsleistung: number): number {
  if (produktionsleistung < 200) return 3.75;
  if (produktionsleistung < 500) return 5.25;
  if (produktionsleistung < 1000) return 6.25;
  if (produktionsleistung < 2000) return 6.75;
  return 7.25;
}

/**
 * Hilfsfunktion: AP-Satz für LV basierend auf Produktionsleistung
 */
export function getLvApRate(bewertetesBeitragssumme: number): number {
  if (bewertetesBeitragssumme < 125000) return 15;
  if (bewertetesBeitragssumme < 250000) return 20;
  if (bewertetesBeitragssumme < 375000) return 23;
  if (bewertetesBeitragssumme < 500000) return 25;
  if (bewertetesBeitragssumme < 625000) return 27;
  if (bewertetesBeitragssumme < 750000) return 28;
  if (bewertetesBeitragssumme < 1000000) return 30;
  if (bewertetesBeitragssumme < 1250000) return 31;
  return 32;
}

export default barmeniaProvisionRules;
