/**
 * PROVISIONSREGELN
 * 63 Demo-Regeln für die ERGO-Präsentation
 * Organisiert nach Sparte und Kategorie
 */

export interface ProvisionRule {
  id: string;
  name: string;
  shortName: string;
  category: 'Abschluss' | 'Bestand' | 'Storno' | 'Dynamik' | 'Korrektur' | 'Berechnung' | 'Bonus' | 'Änderung' | 'Auszahlung' | 'Anpassung';
  sparte: 'KV' | 'SHUK' | 'LV' | 'Kfz' | 'Allgemein';
  description: string;
  formula?: string;
  paragraph: string;
  document: string;
  pageNumber: number;
  examples?: string[];
}

// ============================================================================
// KRANKENVERSICHERUNG (KV) - 18 Regeln
// ============================================================================

export const KV_RULES: ProvisionRule[] = [
  // === Berechnungsgrundlagen ===
  {
    id: 'kv-vag-bereinigung',
    name: 'VAG-Bereinigung des Monatsbeitrags',
    shortName: 'VAG-Bereinigung',
    category: 'Berechnung',
    sparte: 'KV',
    description: 'Der Brutto-Monatsbeitrag wird um den gesetzlichen VAG-Zuschlag von 10% bereinigt.',
    formula: 'MB_netto = MB_brutto × 0,90',
    paragraph: '§2 Abs. 3',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 4
  },
  {
    id: 'kv-monatsbeitrag-basis',
    name: 'Monatsbeitrag als Berechnungsbasis',
    shortName: 'MB-Basis',
    category: 'Berechnung',
    sparte: 'KV',
    description: 'Der bereinigte Monatsbeitrag bildet die Grundlage für alle Provisionsberechnungen in der KV.',
    paragraph: '§2 Abs. 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 3
  },

  // === Abschlussprovisionen ===
  {
    id: 'kv-ap-stufe1',
    name: 'KV Abschlussprovision Staffel Stufe 1',
    shortName: 'KV AP Stufe 1',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Abschlussprovision bei Produktionsleistung unter 200 EUR: 4,50 Monatsbeiträge.',
    formula: 'AP = MB_netto × 4,50',
    paragraph: '§4 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 8
  },
  {
    id: 'kv-ap-stufe2',
    name: 'KV Abschlussprovision Staffel Stufe 2',
    shortName: 'KV AP Stufe 2',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Abschlussprovision bei Produktionsleistung 200-500 EUR: 5,25 Monatsbeiträge.',
    formula: 'AP = MB_netto × 5,25',
    paragraph: '§4 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 8
  },
  {
    id: 'kv-ap-stufe3',
    name: 'KV Abschlussprovision Staffel Stufe 3',
    shortName: 'KV AP Stufe 3',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Abschlussprovision bei Produktionsleistung über 500 EUR: 6,00 Monatsbeiträge.',
    formula: 'AP = MB_netto × 6,00',
    paragraph: '§4 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 8
  },
  {
    id: 'kv-zusatz-zahn',
    name: 'Zahnzusatzversicherung Festprovision',
    shortName: 'Zahnzusatz Fest',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Zahnzusatzversicherungen werden mit einem festen Satz von 4 Monatsbeiträgen vergütet.',
    formula: 'AP = MB × 4',
    paragraph: '§5 Abs. 3',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 11
  },
  {
    id: 'kv-zusatz-krankentagegeld',
    name: 'Krankentagegeld Festprovision',
    shortName: 'KTG Fest',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Krankentagegeldversicherungen werden mit 3,5 Monatsbeiträgen vergütet.',
    formula: 'AP = MB × 3,5',
    paragraph: '§5 Abs. 4',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 11
  },
  {
    id: 'kv-zusatz-pflege',
    name: 'Pflegezusatzversicherung Festprovision',
    shortName: 'Pflege Fest',
    category: 'Abschluss',
    sparte: 'KV',
    description: 'Pflegezusatzversicherungen werden mit 5 Monatsbeiträgen vergütet.',
    formula: 'AP = MB × 5',
    paragraph: '§5 Abs. 5',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 11
  },

  // === Bestandsprovisionen ===
  {
    id: 'kv-bestand-15',
    name: 'KV Bestandsprovision 1,5%',
    shortName: 'KV Bestand',
    category: 'Bestand',
    sparte: 'KV',
    description: 'Monatliche Bestandsprovision für KV-Vollversicherungsverträge: 1,5% des Beitragssolls.',
    formula: 'BP = Beitragssoll × 0,015',
    paragraph: '§6 Abs. 2',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 12
  },
  {
    id: 'kv-bestand-zusatz',
    name: 'KV Bestandsprovision Zusatzversicherung',
    shortName: 'KV Bestand Zusatz',
    category: 'Bestand',
    sparte: 'KV',
    description: 'Bestandsprovision für Zusatzversicherungen: 1,0% des Beitragssolls.',
    formula: 'BP = Beitragssoll × 0,01',
    paragraph: '§6 Abs. 3',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 12
  },

  // === Storno ===
  {
    id: 'kv-storno-60m',
    name: 'Stornohaftung 60 Monate',
    shortName: 'Storno 60M',
    category: 'Storno',
    sparte: 'KV',
    description: 'Die Stornohaftungszeit für KV-Verträge beträgt 60 Monate ab Versicherungsbeginn.',
    paragraph: '§9 Abs. 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 16
  },
  {
    id: 'kv-storno-prt',
    name: 'Pro-rata-temporis Rückforderung',
    shortName: 'Storno PRT',
    category: 'Storno',
    sparte: 'KV',
    description: 'Bei Stornierung wird die Provision zeitanteilig (pro rata temporis) zurückgefordert.',
    formula: 'Rückforderung = AP × (Restmonate / Haftungszeit)',
    paragraph: '§9 Abs. 2',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 16
  },
  {
    id: 'kv-stornoreserve',
    name: 'Stornoreserve-Verrechnung',
    shortName: 'Stornoreserve',
    category: 'Storno',
    sparte: 'KV',
    description: 'Die Stornoreserve (10% der AP) wird bei Storno anteilig aufgelöst und verrechnet.',
    paragraph: '§10 Abs. 3',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 18
  },

  // === Bonus ===
  {
    id: 'kv-qualitaetsbonus',
    name: 'Qualitätsbonus bei niedriger Stornoquote',
    shortName: 'Qualitätsbonus',
    category: 'Bonus',
    sparte: 'KV',
    description: 'Bei Stornoquote unter 15% wird ein Qualitätsbonus von 1,17% auf die AP gewährt.',
    formula: 'Bonus = AP × 0,0117',
    paragraph: '§8 Abs. 2',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 15
  },
  {
    id: 'kv-neukundenbonus',
    name: 'Neukundenbonus',
    shortName: 'Neukundenbonus',
    category: 'Bonus',
    sparte: 'KV',
    description: 'Für Neukunden ohne Bestandsvertrag: 2% Bonus auf die Abschlussprovision.',
    formula: 'Bonus = AP × 0,02',
    paragraph: '§8 Abs. 4',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 15
  },

  // === Änderungen ===
  {
    id: 'kv-rueckwirkend',
    name: 'Rückwirkende Vertragsänderung',
    shortName: 'Rückwirkend',
    category: 'Korrektur',
    sparte: 'KV',
    description: 'Bei rückwirkenden Änderungen wird die Provisionsdifferenz für den betroffenen Zeitraum korrigiert.',
    paragraph: '§12 Abs. 1',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 22
  },
  {
    id: 'kv-tarifwechsel',
    name: 'Tarifwechsel Provisionsanpassung',
    shortName: 'Tarifwechsel',
    category: 'Änderung',
    sparte: 'KV',
    description: 'Bei Tarifwechsel gilt der Staffelsatz des neuen Tarifs ab dem Änderungsdatum.',
    paragraph: '§4 Abs. 2',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 9
  },
  {
    id: 'kv-prov-differenz',
    name: 'Provisionsdifferenz-Berechnung',
    shortName: 'Differenz',
    category: 'Berechnung',
    sparte: 'KV',
    description: 'Die Provisionsdifferenz wird monatlich berechnet und für den Korrekturzeitraum summiert.',
    paragraph: '§12 Abs. 3',
    document: 'Provisionsbestimmungen KV',
    pageNumber: 23
  }
];

// ============================================================================
// SACH-, HAFTPFLICHT-, UNFALL-, KFZ (SHUK) - 15 Regeln
// ============================================================================

export const SHUK_RULES: ProvisionRule[] = [
  // === Berechnungsgrundlagen ===
  {
    id: 'shuk-netto',
    name: 'Nettobeitrag-Berechnung (ohne VSt)',
    shortName: 'Netto-Basis',
    category: 'Berechnung',
    sparte: 'SHUK',
    description: 'Der Bruttobeitrag wird um die Versicherungssteuer (19%) bereinigt.',
    formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
    paragraph: '§2 Abs. 1',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 3
  },
  {
    id: 'shuk-jahresbeitrag',
    name: 'Jahresbeitrag als Berechnungsbasis',
    shortName: 'JB-Basis',
    category: 'Berechnung',
    sparte: 'SHUK',
    description: 'Für SHUK gilt der Nettojahresbeitrag als Berechnungsgrundlage.',
    paragraph: '§2 Abs. 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 3
  },

  // === Abschlussprovisionen ===
  {
    id: 'shuk-pk-1j-stufe1',
    name: 'SHUK 1-Jahres-Vertrag Stufe 1',
    shortName: 'SHUK 1J S1',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Provision für 1-Jahres-Verträge, Produktionsleistung unter 2.500 EUR: 20% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,20',
    paragraph: '§3 Abs. 1 i.V.m. Anlage 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 5
  },
  {
    id: 'shuk-pk-3j-stufe1',
    name: 'SHUK 3-Jahres-Vertrag Stufe 1',
    shortName: 'SHUK 3J S1',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Provision für 3-Jahres-Verträge, Stufe 1: 30% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,30',
    paragraph: '§3 Abs. 2 i.V.m. Anlage 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 6
  },
  {
    id: 'shuk-pk-5j-stufe1',
    name: 'SHUK 5-Jahres-Vertrag Stufe 1',
    shortName: 'SHUK 5J S1',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Provision für 5-Jahres-Verträge, Stufe 1: 40% des Nettobeitrags × Diskontfaktor.',
    formula: 'AP = Nettobeitrag × 0,40 × 1,5625',
    paragraph: '§3 Abs. 4 i.V.m. Anlage 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 7
  },
  {
    id: 'shuk-phv-fest',
    name: 'Privathaftpflicht Festprovision',
    shortName: 'PHV Fest',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Privathaftpflichtversicherungen: Festsatz von 20% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,20 × Laufzeitfaktor',
    paragraph: '§4 Abs. 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 8
  },
  {
    id: 'shuk-wohngebaeude',
    name: 'Wohngebäudeversicherung Provision',
    shortName: 'Wohngebäude',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Wohngebäudeversicherungen werden nach Laufzeitstaffel vergütet.',
    paragraph: '§3 Abs. 3',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 6
  },
  {
    id: 'shuk-hausrat',
    name: 'Hausratversicherung Provision',
    shortName: 'Hausrat',
    category: 'Abschluss',
    sparte: 'SHUK',
    description: 'Hausratversicherungen werden nach Laufzeitstaffel vergütet.',
    paragraph: '§3 Abs. 3',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 6
  },

  // === Bestand ===
  {
    id: 'shuk-bestand-hr',
    name: 'Hausrat Bestandsprovision 15%',
    shortName: 'HR Bestand',
    category: 'Bestand',
    sparte: 'SHUK',
    description: 'Jährliche Bestandsprovision für Hausratversicherungen: 15% des Nettobeitrags.',
    formula: 'BP = Nettobeitrag × 0,15',
    paragraph: '§5 Abs. 1',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 10
  },
  {
    id: 'shuk-bestand-wg',
    name: 'Wohngebäude Bestandsprovision',
    shortName: 'WG Bestand',
    category: 'Bestand',
    sparte: 'SHUK',
    description: 'Jährliche Bestandsprovision für Wohngebäudeversicherungen: 12% des Nettobeitrags.',
    formula: 'BP = Nettobeitrag × 0,12',
    paragraph: '§5 Abs. 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 10
  },

  // === Folgeprovision ===
  {
    id: 'shuk-folge-5j',
    name: 'Folgeprovision 5-Jahres-Vertrag',
    shortName: 'Folge 5J',
    category: 'Bestand',
    sparte: 'SHUK',
    description: 'Bei 5-Jahres-Verträgen wird die AP ratierlich über 5 Jahre ausgezahlt.',
    paragraph: '§3 Abs. 5',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 7
  },
  {
    id: 'shuk-ratierlich',
    name: 'Ratierliche Auszahlung',
    shortName: 'Ratierlich',
    category: 'Auszahlung',
    sparte: 'SHUK',
    description: 'Degressive Verteilung: J1: 40%, J2: 25%, J3: 15%, J4: 10%, J5: 10%.',
    paragraph: '§3 Abs. 5',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 7
  },
  {
    id: 'shuk-beitragsanpassung',
    name: 'Beitragsanpassung Folgeprovision',
    shortName: 'Beitragsanpassung',
    category: 'Anpassung',
    sparte: 'SHUK',
    description: 'Folgeprovisionen werden bei Beitragsänderungen proportional angepasst.',
    formula: 'Rate_neu = Rate_alt × (Beitrag_neu / Beitrag_alt)',
    paragraph: '§3 Abs. 6',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 8
  },

  // === Storno ===
  {
    id: 'shuk-storno-36m',
    name: 'SHUK Stornohaftung 36 Monate',
    shortName: 'Storno 36M',
    category: 'Storno',
    sparte: 'SHUK',
    description: 'Die Stornohaftungszeit für SHUK-Verträge beträgt 36 Monate.',
    paragraph: '§7 Abs. 1',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 14
  },
  {
    id: 'shuk-storno-prt',
    name: 'SHUK Pro-rata-temporis Rückforderung',
    shortName: 'SHUK Storno PRT',
    category: 'Storno',
    sparte: 'SHUK',
    description: 'Zeitanteilige Rückforderung bei Storno innerhalb der Haftungszeit.',
    paragraph: '§7 Abs. 2',
    document: 'Provisionsbestimmungen SHUK',
    pageNumber: 14
  }
];

// ============================================================================
// LEBENSVERSICHERUNG (LV) - 16 Regeln
// ============================================================================

export const LV_RULES: ProvisionRule[] = [
  // === Berechnungsgrundlagen ===
  {
    id: 'lv-bws',
    name: 'Bewertete Beitragssumme (BWS)',
    shortName: 'BWS',
    category: 'Berechnung',
    sparte: 'LV',
    description: 'BWS = Jahresbeitrag × Laufzeit (max. 35 Jahre).',
    formula: 'BWS = Jahresbeitrag × min(Laufzeit, 35)',
    paragraph: '§2 Abs. 2',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 3
  },
  {
    id: 'lv-jahresbeitrag',
    name: 'Jahresbeitrag als Berechnungsbasis',
    shortName: 'JB LV',
    category: 'Berechnung',
    sparte: 'LV',
    description: 'Der Jahresbeitrag wird aus dem Monatsbeitrag × 12 ermittelt.',
    formula: 'JB = MB × 12',
    paragraph: '§2 Abs. 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 3
  },
  {
    id: 'lv-laufzeit-max35',
    name: 'Laufzeitbegrenzung 35 Jahre',
    shortName: 'Max 35J',
    category: 'Berechnung',
    sparte: 'LV',
    description: 'Für die BWS-Berechnung wird die Laufzeit auf maximal 35 Jahre begrenzt.',
    paragraph: '§2 Abs. 2',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 3
  },

  // === Abschlussprovisionen ===
  {
    id: 'lv-ap-stufe1',
    name: 'LV Abschlussprovision Stufe 1',
    shortName: 'LV AP S1',
    category: 'Abschluss',
    sparte: 'LV',
    description: 'Provision bei BWS unter 125.000 EUR: 15 Promille.',
    formula: 'AP = BWS × 0,015',
    paragraph: '§3 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 5
  },
  {
    id: 'lv-ap-stufe2',
    name: 'LV Abschlussprovision Stufe 2',
    shortName: 'LV AP S2',
    category: 'Abschluss',
    sparte: 'LV',
    description: 'Provision bei BWS 125.000-250.000 EUR: 18 Promille.',
    formula: 'AP = BWS × 0,018',
    paragraph: '§3 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 5
  },
  {
    id: 'lv-ap-stufe3',
    name: 'LV Abschlussprovision Stufe 3',
    shortName: 'LV AP S3',
    category: 'Abschluss',
    sparte: 'LV',
    description: 'Provision bei BWS über 250.000 EUR: 23 Promille.',
    formula: 'AP = BWS × 0,023',
    paragraph: '§3 Abs. 1 i.V.m. Anlage 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 5
  },
  {
    id: 'lv-bu-provision',
    name: 'BU-Versicherung Provision',
    shortName: 'BU AP',
    category: 'Abschluss',
    sparte: 'LV',
    description: 'Berufsunfähigkeitsversicherungen: Jahresbeitrag × Laufzeit × 20‰.',
    formula: 'AP = JB × Laufzeit × 0,020',
    paragraph: '§3 Abs. 3',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 6
  },

  // === Dynamik ===
  {
    id: 'lv-dynamik',
    name: 'Dynamikprovision',
    shortName: 'Dynamik',
    category: 'Dynamik',
    sparte: 'LV',
    description: 'Bei Dynamikerhöhungen: Provision auf Erhöhungs-BWS mit Ursprungs-Staffelsatz.',
    formula: 'DYN-AP = Erhöhungs-BWS × Promillesatz',
    paragraph: '§6 Abs. 3',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 13
  },
  {
    id: 'lv-dynamik-erhoehung',
    name: 'Dynamik-Erhöhungsbeitrag',
    shortName: 'Dyn-Erhöhung',
    category: 'Dynamik',
    sparte: 'LV',
    description: 'Der Erhöhungsbeitrag ist Grundlage der Dynamikprovision.',
    paragraph: '§6 Abs. 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 12
  },
  {
    id: 'lv-dynamik-restlaufzeit',
    name: 'Dynamik Restlaufzeit',
    shortName: 'Dyn-RLZ',
    category: 'Dynamik',
    sparte: 'LV',
    description: 'Die Erhöhungs-BWS berechnet sich mit der Restlaufzeit des Vertrags.',
    formula: 'Erhöhungs-BWS = Erhöhung_Jahr × Restlaufzeit',
    paragraph: '§6 Abs. 2',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 12
  },

  // === Bestand ===
  {
    id: 'lv-bestand-rv',
    name: 'Rentenversicherung Bestandsprovision',
    shortName: 'RV Bestand',
    category: 'Bestand',
    sparte: 'LV',
    description: 'Jährliche Bestandsprovision für Rentenversicherungen: 1,0% des Jahresbeitrags.',
    formula: 'BP = JB × 0,01',
    paragraph: '§7 Abs. 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 14
  },
  {
    id: 'lv-bestand-bu',
    name: 'BU Bestandsprovision 1,5%',
    shortName: 'BU Bestand',
    category: 'Bestand',
    sparte: 'LV',
    description: 'Jährliche Bestandsprovision für BU-Versicherungen: 1,5% des Jahresbeitrags.',
    formula: 'BP = JB × 0,015',
    paragraph: '§7 Abs. 2',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 14
  },

  // === Produktänderungen ===
  {
    id: 'lv-produktupgrade',
    name: 'Produktupgrade Nachprovision',
    shortName: 'Upgrade',
    category: 'Änderung',
    sparte: 'LV',
    description: 'Bei Produktupgrade wird die Beitragsdifferenz als Nachprovisionsbasis verwendet.',
    paragraph: '§8 Abs. 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 16
  },
  {
    id: 'lv-nachprovision',
    name: 'LV Nachprovision',
    shortName: 'Nachprov',
    category: 'Abschluss',
    sparte: 'LV',
    description: 'Nachprovision auf Differenz-BWS mit Staffelsatz des Neugeschäfts.',
    formula: 'Nachprov = Diff-BWS × Promillesatz',
    paragraph: '§8 Abs. 4',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 17
  },
  {
    id: 'lv-nachprov-max15j',
    name: 'Nachprovision Restlaufzeit max. 15 Jahre',
    shortName: 'NP Max15J',
    category: 'Änderung',
    sparte: 'LV',
    description: 'Bei Produktupgrades wird die Restlaufzeit auf max. 15 Jahre begrenzt.',
    paragraph: '§8 Abs. 3',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 17
  },

  // === Storno ===
  {
    id: 'lv-storno-60m',
    name: 'LV Stornohaftung 60 Monate',
    shortName: 'LV Storno 60M',
    category: 'Storno',
    sparte: 'LV',
    description: 'Die Stornohaftungszeit für LV-Verträge beträgt 60 Monate.',
    paragraph: '§9 Abs. 1',
    document: 'Provisionsbestimmungen LV',
    pageNumber: 18
  }
];

// ============================================================================
// KFZ-VERSICHERUNG - 8 Regeln
// ============================================================================

export const KFZ_RULES: ProvisionRule[] = [
  // === Berechnungsgrundlagen ===
  {
    id: 'kfz-netto',
    name: 'Kfz Nettobeitrag',
    shortName: 'Kfz Netto',
    category: 'Berechnung',
    sparte: 'Kfz',
    description: 'Berechnungsgrundlage ist der Nettojahresbeitrag ohne Versicherungssteuer.',
    formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
    paragraph: '§2 Abs. 1',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 3
  },

  // === Abschlussprovisionen ===
  {
    id: 'kfz-hpv',
    name: 'Kfz-Haftpflicht Provision',
    shortName: 'Kfz HPV',
    category: 'Abschluss',
    sparte: 'Kfz',
    description: 'Kfz-Haftpflichtversicherung: 5% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,05',
    paragraph: '§3 Abs. 1',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 4
  },
  {
    id: 'kfz-tk-basis',
    name: 'Kfz-Teilkasko Basis',
    shortName: 'TK Basis',
    category: 'Abschluss',
    sparte: 'Kfz',
    description: 'Kfz-Teilkasko Basis-Tarif: 5% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,05',
    paragraph: '§3 Abs. 2',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 4
  },
  {
    id: 'kfz-vk-basis',
    name: 'Kfz-Vollkasko Basis',
    shortName: 'VK Basis',
    category: 'Abschluss',
    sparte: 'Kfz',
    description: 'Kfz-Vollkasko Basis-Tarif: 5% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,05',
    paragraph: '§3 Abs. 3',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 4
  },
  {
    id: 'kfz-vk-premium',
    name: 'Kfz-Vollkasko Premium',
    shortName: 'VK Premium',
    category: 'Abschluss',
    sparte: 'Kfz',
    description: 'Kfz-Vollkasko Premium-Tarif: 7% des Nettobeitrags.',
    formula: 'AP = Nettobeitrag × 0,07',
    paragraph: '§3 Abs. 1',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 4
  },
  {
    id: 'kfz-schutzbrief',
    name: 'Kfz-Schutzbrief Provision',
    shortName: 'Schutzbrief',
    category: 'Abschluss',
    sparte: 'Kfz',
    description: 'Kfz-Schutzbrief: Festbetrag von 3,00 EUR pro Vertrag.',
    formula: 'AP = 3,00 €',
    paragraph: '§3 Abs. 5',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 5
  },

  // === Bestand & Storno ===
  {
    id: 'kfz-bestand',
    name: 'Kfz Bestandsprovision',
    shortName: 'Kfz Bestand',
    category: 'Bestand',
    sparte: 'Kfz',
    description: 'Jährliche Bestandsprovision: 2% des Nettobeitrags (nur bei Laufzeit > 1 Jahr).',
    formula: 'BP = Nettobeitrag × 0,02',
    paragraph: '§4 Abs. 1',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 6
  },
  {
    id: 'kfz-storno-12m',
    name: 'Kfz Stornohaftung 12 Monate',
    shortName: 'Kfz Storno',
    category: 'Storno',
    sparte: 'Kfz',
    description: 'Die Stornohaftungszeit für Kfz-Verträge beträgt 12 Monate.',
    paragraph: '§5 Abs. 1',
    document: 'Provisionsbestimmungen Kfz',
    pageNumber: 7
  }
];

// ============================================================================
// ALLGEMEINE REGELN - 6 Regeln
// ============================================================================

export const ALLGEMEIN_RULES: ProvisionRule[] = [
  {
    id: 'korrektur-nachzahlung',
    name: 'Fehlerkorrektur Nachzahlung',
    shortName: 'Korrektur',
    category: 'Korrektur',
    sparte: 'Allgemein',
    description: 'Berechnungsfehler werden nach Entdeckung in der nächstmöglichen Abrechnung korrigiert.',
    paragraph: '§15 Abs. 1',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 28
  },
  {
    id: 'korrektur-zinsen',
    name: 'Zinsausgleich bei Verspätung',
    shortName: 'Zinsen',
    category: 'Korrektur',
    sparte: 'Allgemein',
    description: 'Bei verspäteten Nachzahlungen wird ein Zinsausgleich von 5% p.a. gewährt.',
    formula: 'Zinsen = Differenz × 0,05 × (Monate/12)',
    paragraph: '§15 Abs. 3',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 29
  },
  {
    id: 'korrektur-pauschale',
    name: 'Entschädigungspauschale',
    shortName: 'Pauschale',
    category: 'Korrektur',
    sparte: 'Allgemein',
    description: 'Bei systemseitigen Berechnungsfehlern erhält der Vermittler eine Entschädigungspauschale.',
    paragraph: '§15 Abs. 5',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 29
  },
  {
    id: 'korrektur-gesamt',
    name: 'Gesamtkorrektur-Berechnung',
    shortName: 'Gesamt',
    category: 'Korrektur',
    sparte: 'Allgemein',
    description: 'Die Gesamtkorrektur umfasst Fehlbetrag, Zinsausgleich und Entschädigungspauschalen.',
    formula: 'Korrektur = Differenz + Zinsen + Pauschale',
    paragraph: '§15 Abs. 6',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 30
  },
  {
    id: 'auszahlung-monatlich',
    name: 'Monatliche Auszahlung',
    shortName: 'Monatlich',
    category: 'Auszahlung',
    sparte: 'Allgemein',
    description: 'Provisionen werden monatlich zum 15. des Folgemonats ausgezahlt.',
    paragraph: '§14 Abs. 1',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 26
  },
  {
    id: 'mindestprovision',
    name: 'Mindestprovision',
    shortName: 'Minimum',
    category: 'Berechnung',
    sparte: 'Allgemein',
    description: 'Die Mindestprovision pro Transaktion beträgt 1,00 EUR.',
    paragraph: '§3 Abs. 7',
    document: 'Provisionsbestimmungen Allgemein',
    pageNumber: 7
  }
];

// ============================================================================
// ALLE REGELN ZUSAMMENGEFASST
// ============================================================================

export const ALL_PROVISION_RULES: ProvisionRule[] = [
  ...KV_RULES,      // 18 Regeln
  ...SHUK_RULES,    // 15 Regeln
  ...LV_RULES,      // 16 Regeln
  ...KFZ_RULES,     // 8 Regeln
  ...ALLGEMEIN_RULES // 6 Regeln
];                   // = 63 Regeln

// ============================================================================
// TRANSAKTION-REGEL-MAPPING
// ============================================================================

export interface TransactionRuleMapping {
  transactionId: string;
  transactionName: string;
  sparte: string;
  provisionsart: string;
  provisionsbetrag: number;
  appliedRuleIds: string[];
  primaryRule: string;
  calculationType: string;
}

export const DEMO_TRANSACTION_RULE_MAPPINGS: TransactionRuleMapping[] = [
  // === KV TRANSAKTIONEN ===
  {
    transactionId: 'demo-kv-01',
    transactionName: 'Müller, Hans - KV Vollversicherung Premium',
    sparte: 'KV',
    provisionsart: 'Abschluss',
    provisionsbetrag: 3021.80,
    appliedRuleIds: ['kv-vag-bereinigung', 'kv-ap-stufe2', 'kv-qualitaetsbonus'],
    primaryRule: 'kv-ap-stufe2',
    calculationType: 'Abschlussprovision mit VAG-Bereinigung und Qualitätsbonus'
  },
  {
    transactionId: 'demo-kv-02',
    transactionName: 'Schmidt, Maria - Zahnzusatzversicherung',
    sparte: 'KV',
    provisionsart: 'Abschluss',
    provisionsbetrag: 114.00,
    appliedRuleIds: ['kv-zusatz-zahn'],
    primaryRule: 'kv-zusatz-zahn',
    calculationType: 'Festprovision Zahnzusatz'
  },
  {
    transactionId: 'demo-kv-03',
    transactionName: 'Weber, Thomas - Storno KV Komfort',
    sparte: 'KV',
    provisionsart: 'Storno',
    provisionsbetrag: -1361.42,
    appliedRuleIds: ['kv-storno-60m', 'kv-storno-prt', 'kv-stornoreserve'],
    primaryRule: 'kv-storno-prt',
    calculationType: 'Storno-Rückabrechnung mit Stornoreserve'
  },
  {
    transactionId: 'demo-kv-04',
    transactionName: 'Fischer, Anna - KV Bestandsprovision',
    sparte: 'KV',
    provisionsart: 'Bestand',
    provisionsbetrag: 8.70,
    appliedRuleIds: ['kv-bestand-15'],
    primaryRule: 'kv-bestand-15',
    calculationType: 'Monatliche Bestandsprovision 1,5%'
  },

  // === SHUK TRANSAKTIONEN ===
  {
    transactionId: 'demo-shuk-01',
    transactionName: 'Becker, Klaus - Wohngebäudeversicherung',
    sparte: 'SHUK',
    provisionsart: 'Abschluss',
    provisionsbetrag: 656.25,
    appliedRuleIds: ['shuk-netto', 'shuk-pk-5j-stufe1', 'shuk-wohngebaeude'],
    primaryRule: 'shuk-pk-5j-stufe1',
    calculationType: '5-Jahres-Vertrag mit Diskontfaktor'
  },
  {
    transactionId: 'demo-shuk-02',
    transactionName: 'Klein, Sandra - Privathaftpflicht',
    sparte: 'SHUK',
    provisionsart: 'Abschluss',
    provisionsbetrag: 17.00,
    appliedRuleIds: ['shuk-netto', 'shuk-phv-fest'],
    primaryRule: 'shuk-phv-fest',
    calculationType: 'Festprovision PHV 20%'
  },
  {
    transactionId: 'demo-shuk-03',
    transactionName: 'Hoffmann, Peter - Hausrat Bestand',
    sparte: 'SHUK',
    provisionsart: 'Bestand',
    provisionsbetrag: 48.00,
    appliedRuleIds: ['shuk-netto', 'shuk-bestand-hr'],
    primaryRule: 'shuk-bestand-hr',
    calculationType: 'Jährliche Bestandsprovision 15%'
  },

  // === LV TRANSAKTIONEN ===
  {
    transactionId: 'demo-lv-01',
    transactionName: 'Schneider, Julia - Rentenversicherung',
    sparte: 'LV',
    provisionsart: 'Abschluss',
    provisionsbetrag: 1260.00,
    appliedRuleIds: ['lv-jahresbeitrag', 'lv-bws', 'lv-laufzeit-max35', 'lv-ap-stufe1'],
    primaryRule: 'lv-ap-stufe1',
    calculationType: 'BWS-Berechnung mit 15‰ Staffel'
  },
  {
    transactionId: 'demo-lv-02',
    transactionName: 'Braun, Michael - Dynamikerhöhung',
    sparte: 'LV',
    provisionsart: 'Dynamik',
    provisionsbetrag: 55.20,
    appliedRuleIds: ['lv-dynamik', 'lv-dynamik-erhoehung', 'lv-dynamik-restlaufzeit', 'lv-ap-stufe3'],
    primaryRule: 'lv-dynamik',
    calculationType: 'Dynamikprovision auf Erhöhungs-BWS'
  },
  {
    transactionId: 'demo-lv-03',
    transactionName: 'Wagner, Lisa - BU Bestandsprovision',
    sparte: 'LV',
    provisionsart: 'Bestand',
    provisionsbetrag: 21.60,
    appliedRuleIds: ['lv-jahresbeitrag', 'lv-bestand-bu'],
    primaryRule: 'lv-bestand-bu',
    calculationType: 'Jährliche BU-Bestandsprovision 1,5%'
  },

  // === KFZ TRANSAKTION ===
  {
    transactionId: 'demo-kfz-01',
    transactionName: 'Zimmermann, Frank - Kfz Vollkasko',
    sparte: 'Kfz',
    provisionsart: 'Abschluss',
    provisionsbetrag: 62.30,
    appliedRuleIds: ['kfz-netto', 'kfz-vk-premium'],
    primaryRule: 'kfz-vk-premium',
    calculationType: 'Premium-Tarif 7%'
  },

  // === SONDERFÄLLE ===
  {
    transactionId: 'demo-rueckwirkend-01',
    transactionName: 'Neumann, Stefan - Rückwirkende Änderung',
    sparte: 'KV',
    provisionsart: 'Rückabrechnung',
    provisionsbetrag: -234.78,
    appliedRuleIds: ['kv-rueckwirkend', 'kv-tarifwechsel', 'kv-prov-differenz', 'kv-vag-bereinigung'],
    primaryRule: 'kv-rueckwirkend',
    calculationType: 'Rückwirkende Differenzberechnung'
  },
  {
    transactionId: 'demo-produktanpassung-01',
    transactionName: 'Meyer, Claudia - Produktupgrade LV',
    sparte: 'LV',
    provisionsart: 'Nachprovision',
    provisionsbetrag: 187.50,
    appliedRuleIds: ['lv-produktupgrade', 'lv-nachprovision', 'lv-nachprov-max15j', 'lv-ap-stufe1'],
    primaryRule: 'lv-produktupgrade',
    calculationType: 'Nachprovision auf Differenz-BWS'
  },
  {
    transactionId: 'demo-folgeprovision-01',
    transactionName: 'Schmidt, Andreas - Folgeprovision SHUK',
    sparte: 'SHUK',
    provisionsart: 'Bestand',
    provisionsbetrag: 72.50,
    appliedRuleIds: ['shuk-netto', 'shuk-folge-5j', 'shuk-ratierlich', 'shuk-beitragsanpassung'],
    primaryRule: 'shuk-folge-5j',
    calculationType: 'Folgeprovision Jahr 5/5 mit Beitragsanpassung'
  },
  {
    transactionId: 'demo-fehleranpassung-01',
    transactionName: 'Müller, Hans - Fehlerkorrektur',
    sparte: 'KV',
    provisionsart: 'Nachprovision',
    provisionsbetrag: 156.42,
    appliedRuleIds: ['korrektur-nachzahlung', 'kv-qualitaetsbonus', 'korrektur-zinsen', 'korrektur-pauschale', 'korrektur-gesamt'],
    primaryRule: 'korrektur-nachzahlung',
    calculationType: 'Fehlerkorrektur mit Zinsen und Pauschale'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gibt alle Regeln für eine Sparte zurück
 */
export function getRulesBySparte(sparte: string): ProvisionRule[] {
  return ALL_PROVISION_RULES.filter(r => r.sparte === sparte || r.sparte === 'Allgemein');
}

/**
 * Gibt eine Regel nach ID zurück
 */
export function getRuleById(id: string): ProvisionRule | undefined {
  return ALL_PROVISION_RULES.find(r => r.id === id);
}

/**
 * Gibt alle Regeln für eine Kategorie zurück
 */
export function getRulesByCategory(category: ProvisionRule['category']): ProvisionRule[] {
  return ALL_PROVISION_RULES.filter(r => r.category === category);
}

/**
 * Gibt das Mapping für eine Transaktion zurück
 */
export function getMappingForTransaction(transactionId: string): TransactionRuleMapping | undefined {
  return DEMO_TRANSACTION_RULE_MAPPINGS.find(m => m.transactionId === transactionId);
}

/**
 * Gibt alle Transaktionen zurück, die eine bestimmte Regel verwenden
 */
export function getTransactionsUsingRule(ruleId: string): TransactionRuleMapping[] {
  return DEMO_TRANSACTION_RULE_MAPPINGS.filter(m => m.appliedRuleIds.includes(ruleId));
}

/**
 * Zählt wie oft jede Regel verwendet wird
 */
export function getRuleUsageStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  DEMO_TRANSACTION_RULE_MAPPINGS.forEach(mapping => {
    mapping.appliedRuleIds.forEach(ruleId => {
      stats[ruleId] = (stats[ruleId] || 0) + 1;
    });
  });
  return stats;
}
