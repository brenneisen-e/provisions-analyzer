/**
 * Hardcodierte Provisionsregeln aus dem Alpha Versicherung Vertretervertrag
 * Stand: 01.01.2026
 *
 * Diese Regeln wurden aus dem Original-Vertrag extrahiert und können
 * direkt für die Abrechnungsanalyse verwendet werden, ohne dass der
 * Vertrag jedes Mal hochgeladen werden muss.
 *
 * WICHTIG: Jede Regel enthält eine sourceReference (Quellenangabe) die
 * auf den entsprechenden Paragraphen im Vertrag verweist.
 */

import type { ProvisionRule } from '../types';

// ==============================================================
// KRANKENVERSICHERUNG (KV) - Alpha Kranken
// ==============================================================
const kvRules: ProvisionRule[] = [
  {
    id: 'kv-ap-stufe1',
    name: 'KV Abschlussprovision Stufe 1',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'Krankheitskostenversicherung', 'Krankenhaustagegeld', 'Krankentagegeld', 'Pflege-Ergänzung', 'bKV', 'PKV'],
    conditions: 'Produktionsleistung unter 200 EUR (Ø letzte 2 Wertungsjahre)',
    formula: 'AP = Monatsbeitrag × 3,75',
    parameters: {
      rate: '3,75 MB',
      basis: 'Monatsbeitrag (MB) ohne 10% VAG-Zuschlag',
      staffel: [
        { von: 0, bis: 200, rate: 3.75 },
        { von: 200, bis: 500, rate: 5.25 },
        { von: 500, bis: 1000, rate: 6.25 },
        { von: 1000, bis: 2000, rate: 6.75 },
        { von: 2000, bis: null, rate: 7.25 }
      ]
    },
    notes: 'MB ohne 10% gesetzlichen Zuschlag nach §149 VAG. Bei unterjährigem Beginn wird der Jahresbeitrag hochgerechnet.',
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen KV, Anlage 1 Staffeltabelle'
  },
  {
    id: 'kv-ap-stufe2',
    name: 'KV Abschlussprovision Stufe 2',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Produktionsleistung 200 bis unter 500 EUR',
    formula: 'AP = Monatsbeitrag × 5,25',
    parameters: { rate: '5,25 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen KV, Anlage 1 Staffeltabelle'
  },
  {
    id: 'kv-ap-stufe3',
    name: 'KV Abschlussprovision Stufe 3',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Produktionsleistung 500 bis unter 1.000 EUR',
    formula: 'AP = Monatsbeitrag × 6,25',
    parameters: { rate: '6,25 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen KV, Anlage 1 Staffeltabelle'
  },
  {
    id: 'kv-ap-stufe4',
    name: 'KV Abschlussprovision Stufe 4',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Produktionsleistung 1.000 bis unter 2.000 EUR',
    formula: 'AP = Monatsbeitrag × 6,75',
    parameters: { rate: '6,75 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen KV, Anlage 1 Staffeltabelle'
  },
  {
    id: 'kv-ap-stufe5',
    name: 'KV Abschlussprovision Stufe 5 (Top)',
    category: 'Abschluss',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Produktionsleistung ab 2.000 EUR',
    formula: 'AP = Monatsbeitrag × 7,25',
    parameters: { rate: '7,25 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen KV, Anlage 1 Staffeltabelle'
  },
  {
    id: 'kv-pflege-pflicht',
    name: 'Pflege-Pflichtversicherung AP',
    category: 'Abschluss',
    products: ['Pflege-Pflichtversicherung', 'PPV'],
    conditions: 'Feststehende AP unabhängig von Produktionsstufe',
    formula: 'AP = Monatsbeitrag × 1,5',
    parameters: { rate: '1,5 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 3 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-foerderpflege',
    name: 'Förderpflegetarif AP',
    category: 'Abschluss',
    products: ['Förderpflegetarif', 'Pflege-Bahr'],
    conditions: 'Feststehende AP',
    formula: 'AP = Monatsbeitrag × 1,5',
    parameters: { rate: '1,5 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 3 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-student',
    name: 'Studententarif AP',
    category: 'Abschluss',
    products: ['Studententarif', 'PSKV', 'Ausbildungstarif'],
    conditions: 'Feststehende AP für Ausbildungs-/Studententarife',
    formula: 'AP = Monatsbeitrag × 1,0',
    parameters: { rate: '1,0 MB', basis: 'Monatsbeitrag (MB)' },
    sourceReference: '§4 Abs. 4 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-zahnzusatz',
    name: 'Zahnzusatzversicherung AP',
    category: 'Abschluss',
    products: ['Zahnzusatzversicherung', 'Zahnzusatz', 'Dental'],
    conditions: 'Zusatztarife Zahn',
    formula: 'AP = Monatsbeitrag × 4,0',
    parameters: { rate: '4,0 MB', basis: 'Monatsbeitrag (MB)' },
    notes: 'Gilt für alle Zahnzusatztarife unabhängig von Produktionsstufe',
    sourceReference: '§4 Abs. 5 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-ausland-lang',
    name: 'Langfristiger Auslandstarif AP',
    category: 'Abschluss',
    products: ['Auslandstarif', 'Langfristige Auslandsversicherung', 'Expat'],
    conditions: 'Laufzeitabhängig',
    formula: 'AP = 6% vom Monatsbeitrag je Monat Laufzeit',
    parameters: { rate: '6%', basis: 'Monatsbeitrag × Laufzeit (Monate)' },
    sourceReference: '§4 Abs. 6 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-fp',
    name: 'KV Folgeprovision',
    category: 'Bestand',
    products: ['Krankenversicherung', 'KV', 'PKV', 'Pflege-Ergänzung'],
    conditions: 'Ab 2. Versicherungsjahr, Vertrag >6 Monate bestehend',
    formula: 'FP = Monatsbeitrag × 1,5%',
    parameters: { rate: '1,5%', basis: 'Monatliches Beitragssoll' },
    notes: 'Kein Anspruch bei Soll-Saldo > 3 Monatsbeiträge. FP wird monatlich nachträglich gezahlt.',
    sourceReference: '§5 Abs. 1-3 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-fp-ppv',
    name: 'Pflege-Pflichtversicherung FP',
    category: 'Bestand',
    products: ['Pflege-Pflichtversicherung', 'PPV'],
    conditions: 'Ab 2. Versicherungsjahr, Vertrag >12 Monate bestehend',
    formula: 'FP = Zahlbeitrag × 0,6%',
    parameters: { rate: '0,6%', basis: 'Zahlbeitrag' },
    sourceReference: '§5 Abs. 4 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-reise',
    name: 'Reiseversicherung LP',
    category: 'Bestand',
    products: ['Reise-Krankenversicherung', 'Reisegepäck', 'Reise-Unfall', 'Auslandsreise'],
    conditions: 'Einzel-KV befristet/unbefristet',
    formula: 'LP = Beitrag × 15%',
    parameters: { rate: '15%', basis: 'Beitrag' },
    sourceReference: '§4 Abs. 7 Provisionsbestimmungen KV'
  },
  {
    id: 'kv-firmen-klein',
    name: 'Firmengeschäft LP (bis 150 MA)',
    category: 'Bestand',
    products: ['Firmen-Krankenversicherung', 'Gruppenversicherung', 'bKV'],
    conditions: 'Bis 150 Mitarbeitende',
    formula: 'LP = Beitrag × 5%',
    parameters: { rate: '5%', basis: 'Beitrag' },
    sourceReference: '§6 Provisionsbestimmungen KV'
  }
];

// ==============================================================
// SACH/HAFTPFLICHT/UNFALL/KRAFTFAHRT (SHUK) - Alpha Allgemeine
// ==============================================================
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
    },
    notes: 'Nettojahresbeitrag = Bruttobeitrag ohne 19% Versicherungssteuer',
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen SHUK, Anlage 2 PK-Staffel'
  },
  {
    id: 'pk-ap-5j-stufe2',
    name: 'PK Abschlussprovision 5J Stufe 2',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion 2.500-7.500 EUR',
    formula: 'AP = Nettojahresbeitrag × 60%',
    parameters: { rate: '60%', basis: 'Nettojahresbeitrag (ohne VSt)' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen SHUK, Anlage 2 PK-Staffel'
  },
  {
    id: 'pk-ap-5j-stufe3',
    name: 'PK Abschlussprovision 5J Stufe 3',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion 7.500-15.000 EUR',
    formula: 'AP = Nettojahresbeitrag × 70%',
    parameters: { rate: '70%', basis: 'Nettojahresbeitrag (ohne VSt)' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen SHUK, Anlage 2 PK-Staffel'
  },
  {
    id: 'pk-ap-5j-stufe4',
    name: 'PK Abschlussprovision 5J Stufe 4',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion 15.000-25.000 EUR',
    formula: 'AP = Nettojahresbeitrag × 80%',
    parameters: { rate: '80%', basis: 'Nettojahresbeitrag (ohne VSt)' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen SHUK, Anlage 2 PK-Staffel'
  },
  {
    id: 'pk-ap-5j-stufe5',
    name: 'PK Abschlussprovision 5J Stufe 5 (Top)',
    category: 'Abschluss',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat'],
    conditions: 'Vertragsdauer 5 Jahre, PK-Produktion ab 25.000 EUR',
    formula: 'AP = Nettojahresbeitrag × 90%',
    parameters: { rate: '90%', basis: 'Nettojahresbeitrag (ohne VSt)' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen SHUK, Anlage 2 PK-Staffel'
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
    },
    sourceReference: '§3 Abs. 2 Provisionsbestimmungen SHUK'
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
    },
    sourceReference: '§3 Abs. 3 Provisionsbestimmungen SHUK'
  },
  {
    id: 'pk-fp',
    name: 'PK Folgeprovision',
    category: 'Bestand',
    products: ['Hausrat', 'Privathaftpflicht', 'Wohngebäude', 'Glas', 'Unfall-Privat', 'Sach-Privat'],
    conditions: 'Ab 2. Versicherungsjahr',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' },
    notes: 'Wachstumszuschlag 0-2% abhängig von produktionsabhängiger Bestandsänderung',
    sourceReference: '§4 Abs. 1-2 Provisionsbestimmungen SHUK'
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
    notes: 'Architekten-HV und Bau-HV max. 60%, Vermögensschaden-HV max. 40%',
    sourceReference: '§5 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'sk-fp',
    name: 'SK Folgeprovision',
    category: 'Bestand',
    products: ['Betriebshaftpflicht', 'Feuer', 'Einbruch', 'Geschäftsversicherung'],
    conditions: 'Ab 2. Versicherungsjahr, Selbständige Kunden',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§5 Abs. 3 Provisionsbestimmungen SHUK'
  },
  // Unternehmerkunden (UK)
  {
    id: 'uk-ap',
    name: 'UK Abschlussprovision',
    category: 'Abschluss',
    products: ['Unternehmensversicherung', 'Industrieversicherung', 'Großrisiken'],
    conditions: 'Unternehmerkunden',
    formula: 'AP = Nettojahresbeitrag × 8-10%',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§6 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'uk-fp',
    name: 'UK Folgeprovision',
    category: 'Bestand',
    products: ['Unternehmensversicherung', 'Industrieversicherung'],
    conditions: 'Ab 2. Versicherungsjahr, Unternehmerkunden',
    formula: 'FP = Nettojahresbeitrag × (8% + 0-2% Wachstumszuschlag)',
    parameters: { rate: '8-10%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§6 Abs. 2 Provisionsbestimmungen SHUK'
  },
  // Kraftfahrt (K)
  {
    id: 'kfz-normal',
    name: 'Kraftfahrt Normalwagnisse',
    category: 'Bestand',
    products: ['Kfz-Haftpflicht', 'Kasko', 'Kraftfahrtversicherung', 'Kfz'],
    conditions: 'Normalwagnisse (K-Nw)',
    formula: 'FP = Nettojahresbeitrag × 7%',
    parameters: { rate: '7%', basis: 'Nettojahresbeitrag' },
    notes: 'Bei Kfz wird die AP als FP ausgewiesen (keine separate Abschlussprovision)',
    sourceReference: '§7 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'kfz-sonder',
    name: 'Kraftfahrt Sonderwagnisse',
    category: 'Bestand',
    products: ['Kfz-Sonderwagnisse', 'Flottenversicherung', 'Fuhrpark'],
    conditions: 'Sonderwagnisse (K-Sw)',
    formula: 'FP = Nettojahresbeitrag × 2%',
    parameters: { rate: '2%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§7 Abs. 2 Provisionsbestimmungen SHUK'
  },
  // Technische Versicherungen
  {
    id: 'tv-m',
    name: 'Technische Vers. Gruppe 1',
    category: 'Abschluss',
    products: ['Maschinenversicherung', 'Montageversicherung'],
    conditions: 'TV-M',
    formula: 'AP/FP = Nettojahresbeitrag × 9%',
    parameters: { rate: '9%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§8 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'tv-a',
    name: 'Technische Vers. Gruppe 2',
    category: 'Abschluss',
    products: ['Bauleistungsversicherung'],
    conditions: 'TV-A',
    formula: 'AP/FP = Nettojahresbeitrag × 7%',
    parameters: { rate: '7%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§8 Abs. 2 Provisionsbestimmungen SHUK'
  },
  {
    id: 'tv-elektronik-5j',
    name: 'Elektronikversicherung 5J',
    category: 'Abschluss',
    products: ['Elektronikversicherung'],
    conditions: 'Vertragslaufzeit 5 Jahre',
    formula: 'AP = Nettojahresbeitrag × 35%, FP = 8%',
    parameters: { rate: '35%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§8 Abs. 3 Provisionsbestimmungen SHUK'
  },
  // Tier & Spezial
  {
    id: 'shuk-tierop',
    name: 'Tier-OP und Tierkrankenversicherung',
    category: 'Bestand',
    products: ['Tier-OP', 'Tierkrankenversicherung', 'Tierversicherung', 'Hunde-OP', 'Katzen-OP'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§9 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'shuk-fahrrad',
    name: 'Fahrradversicherung LP',
    category: 'Bestand',
    products: ['Fahrradversicherung', 'E-Bike-Versicherung'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§9 Abs. 2 Provisionsbestimmungen SHUK'
  },
  {
    id: 'shuk-kiss',
    name: 'Kinderinvaliditätsversicherung LP',
    category: 'Bestand',
    products: ['KISS', 'Kinderinvaliditätsversicherung'],
    conditions: 'Laufende Provision',
    formula: 'LP = Nettojahresbeitrag × 20%',
    parameters: { rate: '20%', basis: 'Nettojahresbeitrag' },
    sourceReference: '§9 Abs. 3 Provisionsbestimmungen SHUK'
  }
];

// ==============================================================
// LEBENSVERSICHERUNG (LV) - Alpha Leben
// ==============================================================
const lvRules: ProvisionRule[] = [
  {
    id: 'lv-ap-stufe1',
    name: 'LV Abschlussprovision Stufe 1',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'Berufsunfähigkeit', 'Risikolebensversicherung', 'LV'],
    conditions: 'LV-Produktion unter 125.000 EUR bewertete Beitragssumme',
    formula: 'AP = Bewertete Beitragssumme × 15‰',
    parameters: {
      rate: '15‰',
      basis: 'Bewertete Beitragssumme = Jahresbeitrag × Restlaufzeit (max. 35 Jahre)',
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
    notes: 'Provisionshaftungszeitraum 60 Monate (5 Jahre). Bei Einmalbeitrag: 4‰ der Versicherungssumme.',
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-ap-stufe2',
    name: 'LV Abschlussprovision Stufe 2',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'LV'],
    conditions: 'LV-Produktion 125.000-250.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 20‰',
    parameters: { rate: '20‰', basis: 'Bewertete Beitragssumme' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-ap-stufe3',
    name: 'LV Abschlussprovision Stufe 3',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'LV'],
    conditions: 'LV-Produktion 250.000-375.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 23‰',
    parameters: { rate: '23‰', basis: 'Bewertete Beitragssumme' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-ap-stufe4',
    name: 'LV Abschlussprovision Stufe 4',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'LV'],
    conditions: 'LV-Produktion 375.000-500.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 25‰',
    parameters: { rate: '25‰', basis: 'Bewertete Beitragssumme' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-ap-stufe5',
    name: 'LV Abschlussprovision Stufe 5',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'LV'],
    conditions: 'LV-Produktion 500.000-625.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 27‰',
    parameters: { rate: '27‰', basis: 'Bewertete Beitragssumme' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-ap-stufe9',
    name: 'LV Abschlussprovision Stufe 9 (Top)',
    category: 'Abschluss',
    products: ['Lebensversicherung', 'Rentenversicherung', 'BU'],
    conditions: 'LV-Produktion ab 1.250.000 EUR',
    formula: 'AP = Bewertete Beitragssumme × 32‰',
    parameters: { rate: '32‰', basis: 'Bewertete Beitragssumme' },
    sourceReference: '§3 Abs. 1 Provisionsbestimmungen LV, Anlage 3 LV-Staffel'
  },
  {
    id: 'lv-bu',
    name: 'Berufsunfähigkeitsversicherung AP',
    category: 'Abschluss',
    products: ['Berufsunfähigkeitsversicherung', 'BU', 'SBU', 'Grundfähigkeit'],
    conditions: 'Selbständige BU oder BU-Zusatz',
    formula: 'AP = Bewertete Beitragssumme × Staffelsatz (15-32‰)',
    parameters: { rate: '15-32‰', basis: 'Bewertete Beitragssumme' },
    notes: 'Bewertung: Jahresbeitrag × garantierte Laufzeit (max. 35 Jahre)',
    sourceReference: '§3 Abs. 2 Provisionsbestimmungen LV'
  },
  {
    id: 'lv-fp',
    name: 'LV Folgeprovision',
    category: 'Bestand',
    products: ['Lebensversicherung', 'Rentenversicherung', 'Kapitallebensversicherung', 'LV'],
    conditions: 'Ab 2. Versicherungsjahr',
    formula: 'FP = eingegangene Beiträge × 1,0%',
    parameters: { rate: '1,0%', basis: 'Eingegangene Beiträge' },
    notes: 'Wird auf tatsächlich eingegangene Beiträge berechnet, nicht auf Soll.',
    sourceReference: '§4 Abs. 1 Provisionsbestimmungen LV'
  },
  {
    id: 'lv-fp-bu',
    name: 'BU/Grundfähigkeit Folgeprovision',
    category: 'Bestand',
    products: ['Berufsunfähigkeitsversicherung', 'BU', 'Grundfähigkeit', 'SBU'],
    conditions: 'Ab 2. Versicherungsjahr, Überschussbezugsart Beitragsreduktion',
    formula: 'FP = Bruttobeitrag × 0,5%',
    parameters: { rate: '0,5%', basis: 'Bruttobeitrag' },
    notes: 'Bei Sofortbonus: 1,0%',
    sourceReference: '§4 Abs. 2 Provisionsbestimmungen LV'
  },
  {
    id: 'lv-risiko',
    name: 'Risikolebensversicherung AP',
    category: 'Abschluss',
    products: ['Risikolebensversicherung', 'RLV', 'Risiko-LV'],
    conditions: 'Reine Risikoabsicherung',
    formula: 'AP = Bewertete Beitragssumme × Staffelsatz',
    parameters: { rate: '15-32‰', basis: 'Jahresbeitrag × Laufzeit (max. 35 J.)' },
    notes: 'Bei fallender Versicherungssumme: Durchschnittssumme als Basis',
    sourceReference: '§3 Abs. 3 Provisionsbestimmungen LV'
  }
];

// ==============================================================
// STORNO-REGELUNGEN
// ==============================================================
const stornoRules: ProvisionRule[] = [
  {
    id: 'storno-kv-5j',
    name: 'KV Storno-Rückrechnung (5 Jahre)',
    category: 'Storno',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Storno innerhalb 60 Monate nach Vertragsbeginn',
    formula: 'Rückbelastung = AP × (verbleibende Monate / 60)',
    parameters: {
      stornohaftung: '60 Monate (5 Jahre)',
      rate: 'zeitanteilig'
    },
    notes: 'Pro rata temporis Rückrechnung. Bei Monat 36: Rückbelastung = AP × 24/60 = 40% der AP',
    sourceReference: '§7 Abs. 1-2 Provisionsbestimmungen KV'
  },
  {
    id: 'storno-kv-tarifwechsel',
    name: 'KV Tarifwechsel (kein Storno)',
    category: 'Storno',
    products: ['Krankenversicherung', 'KV', 'PKV'],
    conditions: 'Tarifwechsel innerhalb gleicher Gesellschaft',
    formula: 'Keine Stornierung bei internem Tarifwechsel',
    parameters: {},
    notes: 'Tarifwechsel nach §204 VVG gilt nicht als Storno, Haftungszeit läuft weiter.',
    sourceReference: '§7 Abs. 3 Provisionsbestimmungen KV'
  },
  {
    id: 'storno-lv',
    name: 'LV Storno-Rückrechnung',
    category: 'Storno',
    products: ['Lebensversicherung', 'LV', 'BU', 'Rentenversicherung'],
    conditions: 'Storno oder Beitragsreduzierung innerhalb 60 Monaten',
    formula: 'Rückbelastung = AP × (verbleibende Monate / 60)',
    parameters: { stornohaftung: '60 Monate' },
    notes: 'Bei Beitragsreduzierung: anteilige Rückrechnung entsprechend der Reduzierung. Beispiel: 50% Beitragsreduzierung = 50% der verbleibenden Haftung.',
    sourceReference: '§5 Abs. 1-3 Provisionsbestimmungen LV'
  },
  {
    id: 'storno-lv-beitragsfrei',
    name: 'LV Beitragsfreistellung',
    category: 'Storno',
    products: ['Lebensversicherung', 'LV', 'Rentenversicherung'],
    conditions: 'Beitragsfreistellung innerhalb Haftungszeit',
    formula: 'Rückbelastung = AP × (verbleibende Monate / 60) × (1 - Rückkaufswert/Summe aller Beiträge)',
    parameters: { stornohaftung: '60 Monate' },
    notes: 'Bei Beitragsfreistellung wird die AP anteilig zurückbelastet.',
    sourceReference: '§5 Abs. 4 Provisionsbestimmungen LV'
  },
  {
    id: 'storno-shuk',
    name: 'SHUK Storno-Rückrechnung',
    category: 'Storno',
    products: ['Sachversicherung', 'Haftpflicht', 'Unfall', 'Hausrat', 'Wohngebäude'],
    conditions: 'Vorzeitiges Storno vor Ablauf der vereinbarten Vertragslaufzeit',
    formula: 'Rückbelastung = AP × (verbleibende Vertragsjahre / Gesamtlaufzeit)',
    parameters: { stornohaftung: 'Entsprechend Vertragslaufzeit (max. 5 Jahre)' },
    notes: 'Bei 5-Jahres-Vertrag und Storno nach 2 Jahren: 3/5 = 60% Rückbelastung',
    sourceReference: '§10 Abs. 1-2 Provisionsbestimmungen SHUK'
  },
  {
    id: 'storno-kfz',
    name: 'Kfz Storno-Rückrechnung',
    category: 'Storno',
    products: ['Kfz-Haftpflicht', 'Kasko', 'Kraftfahrtversicherung'],
    conditions: 'Storno innerhalb des Versicherungsjahres',
    formula: 'Rückbelastung = FP × (verbleibende Monate / 12)',
    parameters: { stornohaftung: '12 Monate' },
    notes: 'Bei Kfz nur 1-Jahres-Haftung da keine separate AP.',
    sourceReference: '§10 Abs. 3 Provisionsbestimmungen SHUK'
  }
];

// ==============================================================
// DYNAMIK & BEITRAGSERHÖHUNGEN
// ==============================================================
const dynamikRules: ProvisionRule[] = [
  {
    id: 'dynamik-lv',
    name: 'LV Dynamikerhöhung',
    category: 'Dynamik',
    products: ['Dynamische Lebensversicherung', 'LV mit Dynamik', 'Rentenversicherung'],
    conditions: 'Automatische Erhöhung im Rahmen der Dynamikklausel',
    formula: 'AP auf Erhöhungsbetrag = Erhöhungsbeitragssumme × Staffelsatz',
    parameters: {
      rate: 'Je nach aktueller Produktionsstufe 15-32‰',
      basis: 'Erhöhungsbeitrag × Restlaufzeit'
    },
    notes: 'Eigene Provisionshaftungszeit (60 Monate) für den Erhöhungsbetrag. Die Dynamikerhöhung zählt zur Jahresproduktion.',
    sourceReference: '§6 Abs. 1-2 Provisionsbestimmungen LV'
  },
  {
    id: 'dynamik-lv-ablehnung',
    name: 'LV Dynamik-Ablehnung',
    category: 'Dynamik',
    products: ['Dynamische Lebensversicherung', 'LV mit Dynamik'],
    conditions: 'Kunde lehnt Dynamikerhöhung ab',
    formula: 'Keine Provision bei abgelehnter Dynamik',
    parameters: {},
    notes: 'Nach 2-maliger Ablehnung in Folge erlischt die Dynamikklausel. Keine Rückbelastung.',
    sourceReference: '§6 Abs. 3 Provisionsbestimmungen LV'
  },
  {
    id: 'dynamik-bu',
    name: 'BU Dynamikerhöhung',
    category: 'Dynamik',
    products: ['Berufsunfähigkeitsversicherung', 'BU', 'SBU'],
    conditions: 'Dynamische Erhöhung der BU-Rente',
    formula: 'AP = Erhöhungsbeitragssumme × Staffelsatz',
    parameters: { rate: '15-32‰', basis: 'Erhöhungsbeitrag × Restlaufzeit' },
    notes: 'Dynamikerhöhungen bei BU unterliegen ebenfalls der 60-Monats-Haftung.',
    sourceReference: '§6 Abs. 4 Provisionsbestimmungen LV'
  },
  {
    id: 'dynamik-kv',
    name: 'KV Beitragsanpassung (BAP)',
    category: 'Dynamik',
    products: ['Krankenversicherung', 'PKV'],
    conditions: 'Tarifliche Beitragsanpassung durch Versicherer',
    formula: 'Keine zusätzliche Provision bei BAP',
    parameters: {},
    notes: 'Beitragsanpassungen nach §203 VVG führen nicht zu neuer Abschlussprovision, aber FP steigt mit erhöhtem Beitrag.',
    sourceReference: '§8 Provisionsbestimmungen KV'
  }
];

// ==============================================================
// BEITRAGSERHÖHUNGEN & ÄNDERUNGEN
// ==============================================================
const beitragsaenderungRules: ProvisionRule[] = [
  {
    id: 'beitragserhoehung-shuk',
    name: 'SHUK Beitragserhöhung (Vertragserweiterung)',
    category: 'Beitragsänderung',
    products: ['Hausrat', 'Wohngebäude', 'Haftpflicht', 'Sachversicherung'],
    conditions: 'Kundenseitige Leistungserweiterung mit Beitragserhöhung',
    formula: 'AP = Mehrbeitrag × Provisionssatz der ursprünglichen Laufzeit',
    parameters: { rate: 'Je nach Produktionsstufe und Laufzeit', basis: 'Netto-Mehrbeitrag' },
    notes: 'Bei Vertragserweiterung (z.B. höhere Versicherungssumme) wird auf den Mehrbeitrag provisioniert.',
    sourceReference: '§11 Abs. 1 Provisionsbestimmungen SHUK'
  },
  {
    id: 'beitragserhoehung-kv',
    name: 'KV Tarifverbesserung',
    category: 'Beitragsänderung',
    products: ['Krankenversicherung', 'PKV'],
    conditions: 'Tarifwechsel mit Leistungsverbesserung',
    formula: 'AP = Mehrbeitrag × MB-Satz (neue Haftung)',
    parameters: { rate: 'Staffelsatz nach Produktionsleistung', basis: 'Monatlicher Mehrbeitrag' },
    notes: 'Bei Tarifwechsel mit Mehrleistung: AP auf Differenzbeitrag, neue 60-Monats-Haftung für den Mehrbetrag.',
    sourceReference: '§9 Abs. 1 Provisionsbestimmungen KV'
  },
  {
    id: 'beitragsreduzierung-lv',
    name: 'LV Beitragsreduzierung',
    category: 'Beitragsänderung',
    products: ['Lebensversicherung', 'LV', 'Rentenversicherung'],
    conditions: 'Reduzierung des laufenden Beitrags',
    formula: 'Rückbelastung = AP × Reduzierungsanteil × (verbleibende Monate / 60)',
    parameters: { stornohaftung: '60 Monate', basis: 'Anteilig nach Beitragsreduzierung' },
    notes: 'Beispiel: 30% Beitragsreduzierung im Monat 24 = 30% × (36/60) = 18% Rückbelastung der AP',
    sourceReference: '§5 Abs. 5 Provisionsbestimmungen LV'
  },
  {
    id: 'rueckwirkende-aenderung',
    name: 'Rückwirkende Vertragsänderung',
    category: 'Nachbearbeitung',
    products: ['Alle Sparten'],
    conditions: 'Korrektur mit rückwirkendem Datum',
    formula: 'Differenzabrechnung: Neue Provision - bereits gezahlte Provision',
    parameters: {},
    notes: 'Bei rückwirkenden Änderungen wird die Differenz zwischen neuer und alter Provision berechnet und entsprechend gutgeschrieben oder belastet.',
    sourceReference: '§12 Abs. 1 Allgemeine Provisionsbestimmungen'
  },
  {
    id: 'produktanpassung',
    name: 'Produktumstellung/-anpassung',
    category: 'Nachbearbeitung',
    products: ['Alle Sparten'],
    conditions: 'Umstellung auf Nachfolgeprodukt',
    formula: 'Keine Stornierung bei gleichwertigem Nachfolgeprodukt',
    parameters: {},
    notes: 'Bei Produktumstellung auf Nachfolger gleicher Risikoklasse: Haftungszeit läuft weiter, keine neue AP. Bei Verschlechterung: anteilige Storno-Behandlung.',
    sourceReference: '§12 Abs. 2 Allgemeine Provisionsbestimmungen'
  }
];

// ==============================================================
// NACHBEARBEITUNG & SONDERFÄLLE
// ==============================================================
const nachbearbeitungRules: ProvisionRule[] = [
  {
    id: 'stornoreserve',
    name: 'Stornoreserve-Einbehalt',
    category: 'Nachbearbeitung',
    products: ['Alle Sparten'],
    conditions: 'Monatlicher Einbehalt zur Absicherung',
    formula: 'Einbehalt = 10-15% der Abschlussprovisionen',
    parameters: { rate: '10-15%', basis: 'Brutto-Abschlussprovisionen' },
    notes: 'Die Stornoreserve dient zur Absicherung von Storno-Rückbelastungen. Wird jährlich geprüft und ggf. aufgelöst.',
    sourceReference: '§13 Abs. 1-3 Allgemeine Provisionsbestimmungen'
  },
  {
    id: 'stornoreserve-aufloesung',
    name: 'Stornoreserve-Auflösung',
    category: 'Nachbearbeitung',
    products: ['Alle Sparten'],
    conditions: 'Überschüssige Reserve nach Jahresabrechnung',
    formula: 'Auszahlung = Reserve - erwartete Stornos',
    parameters: {},
    notes: 'Nach Ablauf der Haftungszeiten wird die nicht benötigte Stornoreserve aufgelöst und ausgezahlt.',
    sourceReference: '§13 Abs. 4 Allgemeine Provisionsbestimmungen'
  },
  {
    id: 'nachprovision',
    name: 'Nachprovision bei Ratenzahlung',
    category: 'Nachbearbeitung',
    products: ['Lebensversicherung', 'LV', 'Rentenversicherung'],
    conditions: 'Ratierliche Provisionszahlung (z.B. 20% pro Jahr)',
    formula: 'Jahres-Rate = Gesamt-AP × 20%',
    parameters: { rate: '20%', basis: 'Gesamte Abschlussprovision' },
    notes: 'Bei LV wird die AP oft ratierlich über 5 Jahre ausgezahlt (20% p.a.). Die Nachprovision ist die jährliche Rate.',
    sourceReference: '§3 Abs. 5 Provisionsbestimmungen LV'
  },
  {
    id: 'superprovision',
    name: 'Superprovision (Führungskraft)',
    category: 'Sonstig',
    products: ['Alle Sparten'],
    conditions: 'Für untergeordnete Vermittler',
    formula: 'SP = AP der Untervermittler × Superquote',
    parameters: { rate: '0,5-2%', basis: 'AP der zugeordneten Vermittler' },
    notes: 'Führungskräfte erhalten Superprovision auf Abschlüsse ihrer Teamstruktur.',
    sourceReference: '§14 Allgemeine Provisionsbestimmungen'
  },
  {
    id: 'fremdordnung',
    name: 'Fremdordnung (Übertragung)',
    category: 'Sonstig',
    products: ['Alle Sparten'],
    conditions: 'Abschluss durch anderen Vermittler',
    formula: 'AP nach Aufteilung zwischen Abschluss- und Betreuungsvermittler',
    parameters: {},
    notes: 'Bei Fremdordnung wird die Provision zwischen dem abschließenden und dem betreuenden Vermittler aufgeteilt.',
    sourceReference: '§15 Allgemeine Provisionsbestimmungen'
  }
];

// ==============================================================
// ERSTEINSTUFUNG
// ==============================================================
/**
 * Ersteinstufung laut Vertretervertrag
 * Gilt bis 30.06.2028, danach reguläre Staffeleinstufung
 */
export const ersteinstufung = {
  pk: { jahre5: 60, jahre3_4: 40, jahre1_2: 20 },
  sk: { jahre5: 60, jahre3_4: 40, jahre1_2: 20 },
  kv: 5.25, // in MB
  lv: 23, // in ‰
  wachstumszuschlag: 2 // in %
};

// ==============================================================
// ALLE REGELN ZUSAMMENGEFÜHRT
// ==============================================================
export const barmeniaProvisionRules: ProvisionRule[] = [
  ...kvRules,
  ...shukRules,
  ...lvRules,
  ...stornoRules,
  ...dynamikRules,
  ...beitragsaenderungRules,
  ...nachbearbeitungRules
];

// Alias für bessere Lesbarkeit
export const alphaProvisionRules = barmeniaProvisionRules;

// ==============================================================
// HILFSFUNKTIONEN
// ==============================================================

/**
 * Findet Regeln nach Produktbezeichnung
 */
export function findRulesByProduct(product: string): ProvisionRule[] {
  const searchTerm = product.toLowerCase();
  return barmeniaProvisionRules.filter(rule =>
    rule.products.some(p => p.toLowerCase().includes(searchTerm)) ||
    rule.name.toLowerCase().includes(searchTerm)
  );
}

/**
 * Findet Regeln nach Kategorie
 */
export function findRulesByCategory(category: ProvisionRule['category']): ProvisionRule[] {
  return barmeniaProvisionRules.filter(rule => rule.category === category);
}

/**
 * Ermittelt den KV-AP-Satz basierend auf der Produktionsleistung
 */
export function getKvApRate(produktionsleistung: number): number {
  if (produktionsleistung < 200) return 3.75;
  if (produktionsleistung < 500) return 5.25;
  if (produktionsleistung < 1000) return 6.25;
  if (produktionsleistung < 2000) return 6.75;
  return 7.25;
}

/**
 * Ermittelt den LV-AP-Satz basierend auf der bewerteten Beitragssumme
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

/**
 * Ermittelt den SHUK-PK-AP-Satz basierend auf Laufzeit und Produktion
 */
export function getShukPkApRate(laufzeitJahre: number, produktionsleistung: number): number {
  const staffel = laufzeitJahre >= 5
    ? [{ von: 0, bis: 2500, rate: 40 }, { von: 2500, bis: 7500, rate: 60 }, { von: 7500, bis: 15000, rate: 70 }, { von: 15000, bis: 25000, rate: 80 }, { von: 25000, bis: Infinity, rate: 90 }]
    : laufzeitJahre >= 3
      ? [{ von: 0, bis: 2500, rate: 30 }, { von: 2500, bis: 7500, rate: 40 }, { von: 7500, bis: 15000, rate: 45 }, { von: 15000, bis: 25000, rate: 50 }, { von: 25000, bis: Infinity, rate: 60 }]
      : [{ von: 0, bis: 2500, rate: 15 }, { von: 2500, bis: 7500, rate: 20 }, { von: 7500, bis: 15000, rate: 20 }, { von: 15000, bis: 25000, rate: 25 }, { von: 25000, bis: Infinity, rate: 30 }];

  for (const s of staffel) {
    if (produktionsleistung < (s.bis ?? Infinity)) return s.rate;
  }
  return staffel[staffel.length - 1].rate;
}

/**
 * Berechnet die Storno-Rückbelastung
 */
export function berechneStornoRueckbelastung(
  urspruenglicheAP: number,
  haftungszeitMonate: number,
  verstricheneMonate: number
): number {
  const verbleibendeMonate = Math.max(0, haftungszeitMonate - verstricheneMonate);
  return urspruenglicheAP * (verbleibendeMonate / haftungszeitMonate);
}

/**
 * Formatiert eine Quellenangabe für die Anzeige
 */
export function formatSourceReference(rule: ProvisionRule): string {
  return rule.sourceReference || 'Keine Quellenangabe verfügbar';
}

export default barmeniaProvisionRules;
