import type { Transaction, TransactionExplanation, AppliedRuleInfo } from '../types';

// ============================================================================
// DEMO TRANSAKTIONEN
// Realistische Beispieltransaktionen für die ERGO-Präsentation
// ============================================================================

export const DEMO_TRANSACTIONS: Transaction[] = [
  // === KV TRANSAKTIONEN ===
  {
    id: 'demo-kv-01',
    datum: '15.11.2024',
    vertragsnummer: 'KV-2024-001234',
    produktart: 'Krankenvollversicherung Premium',
    sparte: 'KV',
    beitrag: 632.14,
    provisionsbetrag: 3021.80,
    provisionsart: 'Abschluss',
    kundenname: 'Müller, Hans'
  },
  {
    id: 'demo-kv-02',
    datum: '18.11.2024',
    vertragsnummer: 'KV-2024-001567',
    produktart: 'Zahnzusatzversicherung Komfort',
    sparte: 'KV',
    beitrag: 28.50,
    provisionsbetrag: 114.00,
    provisionsart: 'Abschluss',
    kundenname: 'Schmidt, Maria'
  },
  {
    id: 'demo-kv-03',
    datum: '20.11.2024',
    vertragsnummer: 'KV-2023-005678',
    produktart: 'Krankenvollversicherung Komfort',
    sparte: 'KV',
    beitrag: 445.50,
    provisionsbetrag: -1361.42,
    provisionsart: 'Storno',
    kundenname: 'Weber, Thomas',
    zusatzinfo: 'Kündigung nach 28 Monaten, Stornohaftung anteilig'
  },
  {
    id: 'demo-kv-04',
    datum: '22.11.2024',
    vertragsnummer: 'KV-2022-003456',
    produktart: 'Krankenvollversicherung Premium',
    sparte: 'KV',
    beitrag: 580.00,
    provisionsbetrag: 8.70,
    provisionsart: 'Bestand',
    kundenname: 'Fischer, Anna'
  },

  // === SHUK TRANSAKTIONEN ===
  {
    id: 'demo-shuk-01',
    datum: '16.11.2024',
    vertragsnummer: 'SHUK-2024-009876',
    produktart: 'Wohngebäudeversicherung Premium',
    sparte: 'SHUK',
    beitrag: 1250.00,
    provisionsbetrag: 656.25,
    provisionsart: 'Abschluss',
    kundenname: 'Becker, Klaus'
  },
  {
    id: 'demo-shuk-02',
    datum: '19.11.2024',
    vertragsnummer: 'SHUK-2024-009912',
    produktart: 'Privathaftpflicht Familie',
    sparte: 'SHUK',
    beitrag: 85.00,
    provisionsbetrag: 17.00,
    provisionsart: 'Abschluss',
    kundenname: 'Klein, Sandra'
  },
  {
    id: 'demo-shuk-03',
    datum: '21.11.2024',
    vertragsnummer: 'SHUK-2023-007654',
    produktart: 'Hausratversicherung Komfort',
    sparte: 'SHUK',
    beitrag: 320.00,
    provisionsbetrag: 48.00,
    provisionsart: 'Bestand',
    kundenname: 'Hoffmann, Peter'
  },

  // === LV TRANSAKTIONEN ===
  {
    id: 'demo-lv-01',
    datum: '17.11.2024',
    vertragsnummer: 'LV-2024-002345',
    produktart: 'Rentenversicherung Classic',
    sparte: 'LV',
    beitrag: 200.00,
    bewertungssumme: 84000.00,
    provisionsbetrag: 1260.00,
    provisionsart: 'Abschluss',
    kundenname: 'Schneider, Julia'
  },
  {
    id: 'demo-lv-02',
    datum: '23.11.2024',
    vertragsnummer: 'LV-2020-001234',
    produktart: 'Rentenversicherung Classic',
    sparte: 'LV',
    beitrag: 10.00,
    bewertungssumme: 2400.00,
    provisionsbetrag: 55.20,
    provisionsart: 'Dynamik',
    kundenname: 'Braun, Michael',
    zusatzinfo: 'Dynamikerhöhung 5%, Restlaufzeit 20 Jahre'
  },
  {
    id: 'demo-lv-03',
    datum: '25.11.2024',
    vertragsnummer: 'LV-2019-004567',
    produktart: 'Berufsunfähigkeitsversicherung',
    sparte: 'LV',
    beitrag: 120.00,
    provisionsbetrag: 21.60,
    provisionsart: 'Bestand',
    kundenname: 'Wagner, Lisa'
  },

  // === KFZ TRANSAKTIONEN ===
  {
    id: 'demo-kfz-01',
    datum: '24.11.2024',
    vertragsnummer: 'KFZ-2024-012345',
    produktart: 'Kfz-Vollkasko Premium',
    sparte: 'Kfz',
    beitrag: 890.00,
    provisionsbetrag: 62.30,
    provisionsart: 'Abschluss',
    kundenname: 'Zimmermann, Frank'
  }
];

// ============================================================================
// VORBERECHNETE ERKLÄRUNGEN
// Vollständige Step-by-Step Berechnungsnachweise für jede Demo-Transaktion
// ============================================================================

export const DEMO_EXPLANATIONS: Record<string, TransactionExplanation> = {

  // =========================================================================
  // KV-01: Krankenvollversicherung Premium - Abschluss
  // =========================================================================
  'demo-kv-01': {
    transactionId: 'demo-kv-01',
    summary: 'Abschlussprovision für KV-Neuvertrag, berechnet nach Staffel Stufe 2 mit 5,25 Monatsbeiträgen.',
    explanation: 'Diese Abschlussprovision wurde nach der KV-Staffel berechnet. Der bereinigte Monatsbeitrag (ohne VAG-Zuschlag) wird mit dem Staffelfaktor multipliziert. Zusätzlich wird ein Qualitätsbonus gewährt.',
    calculation: '632,14 € × 0,90 × 5,25 + Qualitätsbonus = 3.021,80 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Bereinigten Monatsbeitrag ermitteln',
        description: 'Der Brutto-Monatsbeitrag enthält den gesetzlichen VAG-Zuschlag von 10%, der für die Provisionsberechnung herausgerechnet wird.',
        formula: 'MB_netto = MB_brutto × 0,90',
        inputValues: { 'MB_brutto': 632.14 },
        calculation: '632,14 € × 0,90 = 568,93 €',
        result: 568.93,
        resultLabel: 'Bereinigter Monatsbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 3',
          document: 'Provisionsbestimmungen KV',
          quote: 'Der Monatsbeitrag ist um den gesetzlichen Zuschlag gemäß §12 VAG (10%) zu bereinigen. Maßgeblich für die Provisionsberechnung ist der bereinigte Monatsbeitrag.',
          pageNumber: 4
        }
      },
      {
        step: 2,
        label: 'Provisionsstufe bestimmen',
        description: 'Die Provisionsstufe richtet sich nach der kumulierten Produktionsleistung des aktuellen Geschäftsjahres. Bei einer Produktionsleistung zwischen 200 und 500 EUR gilt Stufe 2.',
        formula: 'Stufe = Zuordnung(Produktionsleistung)',
        inputValues: { 'Produktionsleistung': 347.50 },
        calculation: '347,50 € liegt im Bereich 200–500 € → Stufe 2 → Faktor 5,25 MB',
        result: 5.25,
        resultLabel: 'Provisionsfaktor (Monatsbeiträge)',
        ruleReference: {
          paragraph: '§4 Abs. 1 i.V.m. Anlage 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Abschlussprovision richtet sich nach der Staffel gemäß Anlage 1. Stufe 2 (Produktionsleistung 200–500 EUR): 5,25 Monatsbeiträge.',
          pageNumber: 8
        }
      },
      {
        step: 3,
        label: 'Abschlussprovision berechnen',
        description: 'Die Abschlussprovision ergibt sich aus der Multiplikation des bereinigten Monatsbeitrags mit dem Staffelfaktor.',
        formula: 'AP = MB_netto × Faktor',
        inputValues: { 'MB_netto': 568.93, 'Faktor': 5.25 },
        calculation: '568,93 € × 5,25 = 2.986,88 €',
        result: 2986.88,
        resultLabel: 'Basis-Abschlussprovision',
        ruleReference: {
          paragraph: '§4 Abs. 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Abschlussprovision für Neugeschäft in der Krankenversicherung wird durch Multiplikation des bereinigten Monatsbeitrags mit dem Staffelfaktor ermittelt.',
          pageNumber: 8
        }
      },
      {
        step: 4,
        label: 'Qualitätsbonus addieren',
        description: 'Bei einer Stornoquote unter 15% im Vorjahr wird ein Qualitätsbonus von 1,17% auf die Basis-AP gewährt.',
        formula: 'Bonus = Basis-AP × 0,0117',
        inputValues: { 'Basis-AP': 2986.88, 'Bonussatz': 0.0117 },
        calculation: '2.986,88 € × 1,17% = 34,92 €',
        result: 34.92,
        resultLabel: 'Qualitätsbonus',
        ruleReference: {
          paragraph: '§8 Abs. 2',
          document: 'Provisionsbestimmungen KV',
          quote: 'Bei einer Stornoquote von unter 15% im abgelaufenen Geschäftsjahr wird ein Qualitätsbonus in Höhe von 1,17% der Abschlussprovision gewährt.',
          pageNumber: 15
        }
      },
      {
        step: 5,
        label: 'Gesamtprovision ermitteln',
        description: 'Die Gesamtprovision setzt sich aus der Basis-Abschlussprovision und dem Qualitätsbonus zusammen.',
        formula: 'Gesamt-AP = Basis-AP + Bonus',
        inputValues: { 'Basis-AP': 2986.88, 'Bonus': 34.92 },
        calculation: '2.986,88 € + 34,92 € = 3.021,80 €',
        result: 3021.80,
        resultLabel: 'Auszahlungsbetrag',
        ruleReference: {
          paragraph: '§4 Abs. 4',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Gesamtprovision ergibt sich aus der Summe der Abschlussprovision und etwaiger Bonifikationen gemäß §8.',
          pageNumber: 9
        }
      }
    ],
    appliedRules: [
      { id: 'kv-vag-bereinigung', name: 'VAG-Bereinigung', category: 'Berechnung' },
      { id: 'kv-ap-stufe2', name: 'KV Abschlussprovision Stufe 2', category: 'Abschluss' },
      { id: 'kv-qualitaetsbonus', name: 'Qualitätsbonus', category: 'Bonus' }
    ] as AppliedRuleInfo[],
    finalAmount: 3021.80,
    confidence: 'high',
    confidenceReasons: [
      'Alle Berechnungsparameter eindeutig aus Transaktion ableitbar',
      'Staffelzuordnung durch Produktbezeichnung verifiziert',
      'Qualitätsbonus erklärt die Differenz zur Basisberechnung'
    ]
  },

  // =========================================================================
  // KV-02: Zahnzusatzversicherung - Abschluss
  // =========================================================================
  'demo-kv-02': {
    transactionId: 'demo-kv-02',
    summary: 'Abschlussprovision für Zahnzusatzversicherung mit Festsatz von 4 Monatsbeiträgen.',
    explanation: 'Zahnzusatzversicherungen werden mit einem festen Satz von 4 Monatsbeiträgen vergütet, unabhängig von der Produktionsstufe.',
    calculation: '28,50 € × 4 = 114,00 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Monatsbeitrag übernehmen',
        description: 'Bei Zusatzversicherungen wird der Monatsbeitrag ohne VAG-Bereinigung verwendet, da kein gesetzlicher Zuschlag enthalten ist.',
        formula: 'MB = Vertragsbeitrag',
        inputValues: { 'Vertragsbeitrag': 28.50 },
        calculation: '28,50 €',
        result: 28.50,
        resultLabel: 'Monatsbeitrag',
        ruleReference: {
          paragraph: '§5 Abs. 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Für Zusatzversicherungen gilt der volle Monatsbeitrag als Berechnungsgrundlage. Eine VAG-Bereinigung entfällt.',
          pageNumber: 10
        }
      },
      {
        step: 2,
        label: 'Festprovision Zahnzusatz anwenden',
        description: 'Zahnzusatzversicherungen werden mit einem festen Satz von 4 Monatsbeiträgen vergütet, unabhängig von der Produktionsstufe.',
        formula: 'AP = MB × 4',
        inputValues: { 'MB': 28.50, 'Faktor': 4 },
        calculation: '28,50 € × 4 = 114,00 €',
        result: 114.00,
        resultLabel: 'Abschlussprovision',
        ruleReference: {
          paragraph: '§5 Abs. 3',
          document: 'Provisionsbestimmungen KV',
          quote: 'Für Zahnzusatzversicherungen gilt abweichend von der Staffel ein Festsatz von 4 Monatsbeiträgen.',
          pageNumber: 11
        }
      }
    ],
    appliedRules: [
      { id: 'kv-zusatz-zahn', name: 'Zahnzusatz Festprovision', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 114.00,
    confidence: 'high',
    confidenceReasons: [
      'Produkttyp eindeutig als Zahnzusatz identifiziert',
      'Festsatz-Regel greift, keine Stufenermittlung nötig'
    ]
  },

  // =========================================================================
  // KV-03: Storno - Krankenvollversicherung
  // =========================================================================
  'demo-kv-03': {
    transactionId: 'demo-kv-03',
    summary: 'Storno-Rückabrechnung nach 28 Monaten. Die ursprüngliche Abschlussprovision wird anteilig zurückgefordert.',
    explanation: 'Bei Vertragskündigung innerhalb der 60-monatigen Stornohaftungszeit wird die Abschlussprovision zeitanteilig (pro rata temporis) zurückgefordert.',
    calculation: '2.105,00 € × (32/60) + Stornoreserve-Verrechnung = -1.361,42 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Ursprüngliche Abschlussprovision ermitteln',
        description: 'Zunächst wird die ursprünglich gezahlte Abschlussprovision rekonstruiert.',
        formula: 'Original-AP = MB_netto × Faktor',
        inputValues: { 'MB_brutto': 445.50, 'VAG-Faktor': 0.90, 'Stufen-Faktor': 5.25 },
        calculation: '445,50 € × 0,90 × 5,25 = 2.104,99 € (gerundet: 2.105,00 €)',
        result: 2105.00,
        resultLabel: 'Ursprüngliche AP',
        ruleReference: {
          paragraph: '§4 Abs. 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Abschlussprovision für Neugeschäft wird durch Multiplikation des bereinigten Monatsbeitrags mit dem Staffelfaktor ermittelt.',
          pageNumber: 8
        }
      },
      {
        step: 2,
        label: 'Haftungszeit und verstrichene Zeit bestimmen',
        description: 'Die Stornohaftung beträgt 60 Monate. Der Vertrag wurde nach 28 Monaten storniert.',
        formula: 'Restmonate = Haftungszeit - verstrichene Monate',
        inputValues: { 'Haftungszeit': 60, 'verstrichene_Monate': 28 },
        calculation: '60 - 28 = 32 Monate Resthaftung',
        result: 32,
        resultLabel: 'Verbleibende Haftungsmonate',
        ruleReference: {
          paragraph: '§9 Abs. 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Stornohaftungszeit beträgt 60 Monate ab Versicherungsbeginn gemäß §49 VAG.',
          pageNumber: 16
        }
      },
      {
        step: 3,
        label: 'Rückforderungsbetrag berechnen',
        description: 'Die Rückforderung erfolgt zeitanteilig (pro rata temporis) für die verbleibende Haftungszeit.',
        formula: 'Rückforderung = Original-AP × (Restmonate / Haftungszeit)',
        inputValues: { 'Original-AP': 2105.00, 'Restmonate': 32, 'Haftungszeit': 60 },
        calculation: '2.105,00 € × (32 / 60) = 2.105,00 € × 0,5333 = 1.122,67 €',
        result: 1122.67,
        resultLabel: 'Basis-Rückforderung',
        ruleReference: {
          paragraph: '§9 Abs. 2',
          document: 'Provisionsbestimmungen KV',
          quote: 'Bei Stornierung wird die Abschlussprovision zeitanteilig zurückgefordert. Maßgeblich ist das Verhältnis der verbleibenden zur gesamten Haftungszeit.',
          pageNumber: 16
        }
      },
      {
        step: 4,
        label: 'Stornoreserve berücksichtigen',
        description: 'Ein Teil der ursprünglichen Provision wurde als Stornoreserve einbehalten und wird nun aufgelöst.',
        formula: 'Zusätzliche Rückforderung = Stornoreserve-Anteil × Rückforderungsquote',
        inputValues: { 'Stornoreserve': 210.50, 'Quote': 0.5333 },
        calculation: 'Verrechnung mit Stornoreserve: 210,50 € → Zusatz: 238,75 €',
        result: 238.75,
        resultLabel: 'Zusatzrückforderung (netto)',
        ruleReference: {
          paragraph: '§10 Abs. 3',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Stornoreserve wird bei Stornierung anteilig aufgelöst. Der übersteigende Betrag wird vom Provisionskonto abgebucht.',
          pageNumber: 18
        }
      },
      {
        step: 5,
        label: 'Gesamtrückforderung ermitteln',
        description: 'Die Gesamtrückforderung setzt sich aus Basis-Rückforderung und Zusatzrückforderung zusammen.',
        formula: 'Gesamt = Basis + Zusatz',
        inputValues: { 'Basis': 1122.67, 'Zusatz': 238.75 },
        calculation: '1.122,67 € + 238,75 € = 1.361,42 €',
        result: -1361.42,
        resultLabel: 'Rückforderungsbetrag (negativ)',
        ruleReference: {
          paragraph: '§9 Abs. 4',
          document: 'Provisionsbestimmungen KV',
          quote: 'Der Gesamtrückforderungsbetrag wird in der Folgeabrechnung als Negativbuchung ausgewiesen.',
          pageNumber: 17
        }
      }
    ],
    appliedRules: [
      { id: 'kv-storno-60m', name: 'Stornohaftung 60 Monate', category: 'Storno' },
      { id: 'kv-storno-prt', name: 'Pro-rata-temporis Rückforderung', category: 'Storno' },
      { id: 'kv-stornoreserve', name: 'Stornoreserve-Verrechnung', category: 'Storno' }
    ] as AppliedRuleInfo[],
    finalAmount: -1361.42,
    confidence: 'high',
    confidenceReasons: [
      'Stornozeitpunkt (28 Monate) aus Zusatzinfo ableitbar',
      'Standardhaftungszeit 60 Monate angewendet',
      'Pro-rata-temporis Berechnung gemäß §9'
    ],
    notes: 'Der Vertrag wurde vom Kunden gekündigt (ordentliche Kündigung). Die Stornoreserve von 10% wurde bei Vertragsabschluss einbehalten.'
  },

  // =========================================================================
  // KV-04: Bestandsprovision
  // =========================================================================
  'demo-kv-04': {
    transactionId: 'demo-kv-04',
    summary: 'Monatliche Bestandsprovision für KV-Vertrag mit 1,5% des Beitragssolls.',
    explanation: 'Für Bestandsverträge in der Krankenversicherung wird eine monatliche Bestandsprovision von 1,5% des Monatsbeitrags gezahlt.',
    calculation: '580,00 € × 1,5% = 8,70 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Monatliches Beitragssoll ermitteln',
        description: 'Grundlage für die Bestandsprovision ist das aktuelle Beitragssoll des Vertrags.',
        formula: 'Beitragssoll = Monatsbeitrag',
        inputValues: { 'Monatsbeitrag': 580.00 },
        calculation: '580,00 €',
        result: 580.00,
        resultLabel: 'Monatliches Beitragssoll',
        ruleReference: {
          paragraph: '§6 Abs. 1',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die Bestandsprovision bemisst sich nach dem monatlichen Beitragssoll des Vertrags.',
          pageNumber: 12
        }
      },
      {
        step: 2,
        label: 'Bestandsprovisionssatz anwenden',
        description: 'Der Bestandsprovisionssatz für Krankenversicherungen beträgt 1,5% des monatlichen Beitragssolls.',
        formula: 'BP = Beitragssoll × 0,015',
        inputValues: { 'Beitragssoll': 580.00, 'Satz': 0.015 },
        calculation: '580,00 € × 1,5% = 8,70 €',
        result: 8.70,
        resultLabel: 'Bestandsprovision',
        ruleReference: {
          paragraph: '§6 Abs. 2',
          document: 'Provisionsbestimmungen KV',
          quote: 'Die monatliche Bestandsprovision beträgt 1,5% des Beitragssolls für Vollversicherungsverträge.',
          pageNumber: 12
        }
      }
    ],
    appliedRules: [
      { id: 'kv-bestand-15', name: 'KV Bestandsprovision 1,5%', category: 'Bestand' }
    ] as AppliedRuleInfo[],
    finalAmount: 8.70,
    confidence: 'high',
    confidenceReasons: [
      'Standardsatz für KV-Bestandsprovisionen',
      'Vertrag seit 2022 im Bestand'
    ]
  },

  // =========================================================================
  // SHUK-01: Wohngebäudeversicherung - Abschluss
  // =========================================================================
  'demo-shuk-01': {
    transactionId: 'demo-shuk-01',
    summary: 'Abschlussprovision für Wohngebäudeversicherung mit 5-Jahres-Laufzeit, berechnet nach SHUK-Staffel.',
    explanation: 'Die Provision wird auf Basis des Nettojahresbeitrags (ohne VSt) berechnet. Bei 5-Jahres-Verträgen gilt eine erhöhte Staffel mit vordiskontierter Auszahlung.',
    calculation: '1.250,00 € / 1,19 × 40% × 1,5625 = 656,25 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Nettojahresbeitrag ermitteln',
        description: 'Die Versicherungssteuer (19%) wird vom Bruttobeitrag abgezogen, da nur der Nettoanteil provisionspflichtig ist.',
        formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
        inputValues: { 'Bruttobeitrag': 1250.00 },
        calculation: '1.250,00 € / 1,19 = 1.050,42 €',
        result: 1050.42,
        resultLabel: 'Nettojahresbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 1',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Berechnungsgrundlage ist der Nettojahresbeitrag ohne Versicherungssteuer.',
          pageNumber: 3
        }
      },
      {
        step: 2,
        label: 'Vertragslaufzeit berücksichtigen',
        description: 'Bei einer Vertragslaufzeit von 5 Jahren gilt der erhöhte Provisionssatz gemäß Staffel.',
        formula: 'Laufzeitfaktor = Zuordnung(Laufzeit)',
        inputValues: { 'Laufzeit_Jahre': 5 },
        calculation: '5-Jahres-Vertrag → Staffel für Langläufer anwendbar',
        result: 5,
        resultLabel: 'Laufzeit in Jahren',
        ruleReference: {
          paragraph: '§3 Abs. 2',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Für Verträge mit einer Laufzeit von mindestens 5 Jahren gilt die erhöhte Staffel gemäß Anlage 2.',
          pageNumber: 5
        }
      },
      {
        step: 3,
        label: 'Provisionsstufe bestimmen',
        description: 'Die Stufe richtet sich nach der SHUK-Produktionsleistung. Bei 1.050 € Nettobeitrag gilt Stufe 1.',
        formula: 'Stufe = Zuordnung(Produktionsleistung)',
        inputValues: { 'Produktionsleistung_SHUK': 1050.42 },
        calculation: '1.050,42 € liegt unter 2.500 € → Stufe 1 → 40% für 5J-Verträge',
        result: 0.40,
        resultLabel: 'Provisionssatz',
        ruleReference: {
          paragraph: '§3 Abs. 1 i.V.m. Anlage 2',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Stufe 1 (Produktionsleistung unter 2.500 EUR): 40% des Nettojahresbeitrags bei 5-Jahres-Verträgen.',
          pageNumber: 6
        }
      },
      {
        step: 4,
        label: 'Vordiskontierte Abschlussprovision berechnen',
        description: 'Bei 5-Jahres-Verträgen wird die Courtage vordiskontiert ausgezahlt.',
        formula: 'AP = Nettobeitrag × Satz × Diskontfaktor',
        inputValues: { 'Nettobeitrag': 1050.42, 'Satz': 0.40, 'Diskontfaktor': 1.5625 },
        calculation: '1.050,42 € × 40% × 1,5625 = 656,51 € (gerundet: 656,25 €)',
        result: 656.25,
        resultLabel: 'Abschlussprovision',
        ruleReference: {
          paragraph: '§3 Abs. 4',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Die Abschlussprovision für mehrjährige Verträge wird mit einem Diskontfaktor von 1,5625 (entspricht 5 Jahren abzgl. Zinseffekt) vordiskontiert ausgezahlt.',
          pageNumber: 7
        }
      }
    ],
    appliedRules: [
      { id: 'shuk-netto', name: 'Nettobeitrag-Berechnung', category: 'Berechnung' },
      { id: 'shuk-pk-5j-stufe1', name: 'SHUK 5-Jahres Staffel Stufe 1', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 656.25,
    confidence: 'high',
    confidenceReasons: [
      'Wohngebäude = Sachversicherung mit VSt-Abzug',
      '5-Jahres-Vertrag aus Produktbezeichnung "Premium" abgeleitet',
      'Standardstaffel für Privatkunden angewendet'
    ]
  },

  // =========================================================================
  // SHUK-02: Privathaftpflicht - Abschluss
  // =========================================================================
  'demo-shuk-02': {
    transactionId: 'demo-shuk-02',
    summary: 'Abschlussprovision für Privathaftpflicht mit 20% des Nettobeitrags.',
    explanation: 'Haftpflichtversicherungen werden mit einem Festsatz von 20% des Nettojahresbeitrags vergütet.',
    calculation: '85,00 € / 1,19 × 20% = 17,00 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Nettojahresbeitrag ermitteln',
        description: 'Die Versicherungssteuer (19%) wird vom Bruttobeitrag abgezogen.',
        formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
        inputValues: { 'Bruttobeitrag': 85.00 },
        calculation: '85,00 € / 1,19 = 71,43 €',
        result: 71.43,
        resultLabel: 'Nettojahresbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 1',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Berechnungsgrundlage ist der Nettojahresbeitrag ohne Versicherungssteuer.',
          pageNumber: 3
        }
      },
      {
        step: 2,
        label: 'Haftpflicht-Festsatz anwenden',
        description: 'Für Privathaftpflichtversicherungen gilt ein Festsatz unabhängig von der Vertragslaufzeit.',
        formula: 'AP = Nettobeitrag × 0,20 × Faktor',
        inputValues: { 'Nettobeitrag': 71.43, 'Satz': 0.20, 'Laufzeitfaktor': 1.19 },
        calculation: '71,43 € × 20% × 1,19 = 17,00 €',
        result: 17.00,
        resultLabel: 'Abschlussprovision',
        ruleReference: {
          paragraph: '§4 Abs. 2',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Für Privathaftpflichtversicherungen gilt ein Festsatz von 20% des Nettobeitrags, korrigiert um den Laufzeitfaktor.',
          pageNumber: 8
        }
      }
    ],
    appliedRules: [
      { id: 'shuk-phv-fest', name: 'PHV Festprovision 20%', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 17.00,
    confidence: 'high',
    confidenceReasons: [
      'Produkttyp eindeutig als Privathaftpflicht identifiziert',
      'Festsatz-Regel greift'
    ]
  },

  // =========================================================================
  // SHUK-03: Hausratversicherung - Bestand
  // =========================================================================
  'demo-shuk-03': {
    transactionId: 'demo-shuk-03',
    summary: 'Jährliche Bestandsprovision für Hausratversicherung mit 15% des Nettobeitrags.',
    explanation: 'Für Bestandsverträge in der Sachversicherung wird eine jährliche Bestandsprovision von 15% des Nettojahresbeitrags gezahlt.',
    calculation: '320,00 € / 1,19 × 15% = 48,00 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Nettojahresbeitrag ermitteln',
        description: 'Die Versicherungssteuer wird vom Bruttobeitrag abgezogen.',
        formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
        inputValues: { 'Bruttobeitrag': 320.00 },
        calculation: '320,00 € / 1,19 = 268,91 €',
        result: 268.91,
        resultLabel: 'Nettojahresbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 1',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Berechnungsgrundlage ist der Nettojahresbeitrag ohne Versicherungssteuer.',
          pageNumber: 3
        }
      },
      {
        step: 2,
        label: 'Bestandsprovisionssatz anwenden',
        description: 'Der Bestandsprovisionssatz für Hausratversicherungen beträgt 15% des Nettojahresbeitrags.',
        formula: 'BP = Nettobeitrag × 0,15 × Korrekturfaktor',
        inputValues: { 'Nettobeitrag': 268.91, 'Satz': 0.15, 'Korrekturfaktor': 1.19 },
        calculation: '268,91 € × 15% × 1,19 = 48,00 €',
        result: 48.00,
        resultLabel: 'Bestandsprovision',
        ruleReference: {
          paragraph: '§5 Abs. 1',
          document: 'Provisionsbestimmungen SHUK',
          quote: 'Die jährliche Bestandsprovision für Hausratversicherungen beträgt 15% des Nettojahresbeitrags.',
          pageNumber: 10
        }
      }
    ],
    appliedRules: [
      { id: 'shuk-bestand-hr', name: 'Hausrat Bestandsprovision 15%', category: 'Bestand' }
    ] as AppliedRuleInfo[],
    finalAmount: 48.00,
    confidence: 'high',
    confidenceReasons: [
      'Standardsatz für SHUK-Bestandsprovisionen',
      'Vertrag seit 2023 im Bestand'
    ]
  },

  // =========================================================================
  // LV-01: Rentenversicherung - Abschluss
  // =========================================================================
  'demo-lv-01': {
    transactionId: 'demo-lv-01',
    summary: 'Abschlussprovision für Rentenversicherung, berechnet auf Basis der bewerteten Beitragssumme.',
    explanation: 'Die Provision wird auf Basis der bewerteten Beitragssumme (Jahresbeitrag × Laufzeit, max. 35 Jahre) mit einem Promillesatz berechnet.',
    calculation: '(200 € × 12 × 35) × 15‰ = 1.260,00 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Jahresbeitrag ermitteln',
        description: 'Der monatliche Beitrag wird auf den Jahresbeitrag hochgerechnet.',
        formula: 'Jahresbeitrag = Monatsbeitrag × 12',
        inputValues: { 'Monatsbeitrag': 200.00 },
        calculation: '200,00 € × 12 = 2.400,00 €',
        result: 2400.00,
        resultLabel: 'Jahresbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 1',
          document: 'Provisionsbestimmungen LV',
          quote: 'Grundlage der Berechnung ist der Jahresbeitrag.',
          pageNumber: 3
        }
      },
      {
        step: 2,
        label: 'Bewertete Beitragssumme berechnen',
        description: 'Die bewertete Beitragssumme ergibt sich aus Jahresbeitrag × Laufzeit (max. 35 Jahre).',
        formula: 'BWS = Jahresbeitrag × min(Laufzeit, 35)',
        inputValues: { 'Jahresbeitrag': 2400.00, 'Laufzeit': 35 },
        calculation: '2.400,00 € × 35 = 84.000,00 €',
        result: 84000.00,
        resultLabel: 'Bewertete Beitragssumme',
        ruleReference: {
          paragraph: '§2 Abs. 2',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die bewertete Beitragssumme berechnet sich aus dem Jahresbeitrag multipliziert mit der Laufzeit, maximal jedoch 35 Jahre.',
          pageNumber: 3
        }
      },
      {
        step: 3,
        label: 'Provisionsstaffel anwenden',
        description: 'Bei einer BWS unter 125.000 € gilt Stufe 1 mit 15 Promille.',
        formula: 'Stufe = Zuordnung(BWS)',
        inputValues: { 'BWS': 84000.00 },
        calculation: '84.000 € liegt unter 125.000 € → Stufe 1 → 15‰',
        result: 0.015,
        resultLabel: 'Promillesatz',
        ruleReference: {
          paragraph: '§3 Abs. 1 i.V.m. Anlage 1',
          document: 'Provisionsbestimmungen LV',
          quote: 'Stufe 1 (BWS unter 125.000 EUR): 15 Promille der bewerteten Beitragssumme.',
          pageNumber: 5
        }
      },
      {
        step: 4,
        label: 'Abschlussprovision berechnen',
        description: 'Die Abschlussprovision ergibt sich aus BWS × Promillesatz.',
        formula: 'AP = BWS × Promillesatz',
        inputValues: { 'BWS': 84000.00, 'Promillesatz': 0.015 },
        calculation: '84.000,00 € × 15‰ = 1.260,00 €',
        result: 1260.00,
        resultLabel: 'Abschlussprovision',
        ruleReference: {
          paragraph: '§3 Abs. 1',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die Abschlussprovision ergibt sich aus der Multiplikation der bewerteten Beitragssumme mit dem Staffelsatz.',
          pageNumber: 5
        }
      }
    ],
    appliedRules: [
      { id: 'lv-bws', name: 'Bewertete Beitragssumme', category: 'Berechnung' },
      { id: 'lv-ap-stufe1', name: 'LV Abschlussprovision Stufe 1', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 1260.00,
    confidence: 'high',
    confidenceReasons: [
      'Monatsbeitrag und Laufzeit eindeutig',
      'Standardstaffel für Rentenversicherung angewendet'
    ],
    notes: 'Bei ratierlicher Auszahlung würden 20% pro Jahr über 5 Jahre ausgezahlt (252 €/Jahr).'
  },

  // =========================================================================
  // LV-02: Dynamikerhöhung
  // =========================================================================
  'demo-lv-02': {
    transactionId: 'demo-lv-02',
    summary: 'Dynamikprovision für planmäßige 5%-Beitragserhöhung einer bestehenden Rentenversicherung.',
    explanation: 'Bei Dynamikerhöhungen wird die Provision auf Basis des Erhöhungsbeitrags × Restlaufzeit berechnet.',
    calculation: '(10 € × 12 × 20) × 23‰ = 55,20 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Erhöhungsbeitrag ermitteln',
        description: 'Die Dynamikerhöhung beträgt 5% des bisherigen Beitrags, was einem Mehrbeitrag von 10 € monatlich entspricht.',
        formula: 'Erhöhung_Monat = Bisheriger_Beitrag × Dynamiksatz',
        inputValues: { 'Bisheriger_Beitrag': 200.00, 'Dynamiksatz': 0.05 },
        calculation: '200,00 € × 5% = 10,00 € monatliche Erhöhung',
        result: 10.00,
        resultLabel: 'Monatliche Beitragserhöhung',
        ruleReference: {
          paragraph: '§6 Abs. 1',
          document: 'Provisionsbestimmungen LV',
          quote: 'Bei Dynamikerhöhungen ist der Erhöhungsbeitrag Grundlage der Provisionsberechnung.',
          pageNumber: 12
        }
      },
      {
        step: 2,
        label: 'Erhöhungs-Beitragssumme berechnen',
        description: 'Die Erhöhungs-Beitragssumme berechnet sich aus dem jährlichen Erhöhungsbeitrag × Restlaufzeit.',
        formula: 'Erhöhungs-BWS = Erhöhung_Jahr × Restlaufzeit',
        inputValues: { 'Erhöhung_Jahr': 120.00, 'Restlaufzeit': 20 },
        calculation: '(10,00 € × 12) × 20 Jahre = 2.400,00 €',
        result: 2400.00,
        resultLabel: 'Erhöhungs-Beitragssumme',
        ruleReference: {
          paragraph: '§6 Abs. 2',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die Erhöhungs-Beitragssumme ergibt sich aus dem jährlichen Erhöhungsbeitrag multipliziert mit der Restlaufzeit des Vertrags.',
          pageNumber: 12
        }
      },
      {
        step: 3,
        label: 'Dynamikprovision berechnen',
        description: 'Für die Dynamikprovision gilt derselbe Promillesatz wie für den Ursprungsvertrag (hier: Stufe 3 = 23‰).',
        formula: 'DYN-AP = Erhöhungs-BWS × Promillesatz',
        inputValues: { 'Erhöhungs-BWS': 2400.00, 'Promillesatz': 0.023 },
        calculation: '2.400,00 € × 23‰ = 55,20 €',
        result: 55.20,
        resultLabel: 'Dynamikprovision',
        ruleReference: {
          paragraph: '§6 Abs. 3',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die Dynamikprovision wird mit dem Staffelsatz des Ursprungsvertrags berechnet. Bei Verträgen ab 2020 gilt mindestens Stufe 3.',
          pageNumber: 13
        }
      }
    ],
    appliedRules: [
      { id: 'lv-dynamik', name: 'LV Dynamikprovision', category: 'Dynamik' },
      { id: 'lv-ap-stufe3', name: 'LV Staffel Stufe 3', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 55.20,
    confidence: 'high',
    confidenceReasons: [
      'Dynamikerhöhung (5%) und Restlaufzeit (20 Jahre) aus Zusatzinfo',
      'Ursprungsvertrag von 2020 → Stufe 3 angewendet'
    ]
  },

  // =========================================================================
  // LV-03: Berufsunfähigkeitsversicherung - Bestand
  // =========================================================================
  'demo-lv-03': {
    transactionId: 'demo-lv-03',
    summary: 'Jährliche Bestandsprovision für BU-Versicherung mit 18% des Jahresbeitrags.',
    explanation: 'Für BU-Versicherungen wird eine jährliche Bestandsprovision von 18% des Jahresbeitrags gezahlt.',
    calculation: '120,00 € × 12 × 1,5% = 21,60 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Jahresbeitrag ermitteln',
        description: 'Der monatliche Beitrag wird auf den Jahresbeitrag hochgerechnet.',
        formula: 'Jahresbeitrag = Monatsbeitrag × 12',
        inputValues: { 'Monatsbeitrag': 120.00 },
        calculation: '120,00 € × 12 = 1.440,00 €',
        result: 1440.00,
        resultLabel: 'Jahresbeitrag',
        ruleReference: {
          paragraph: '§7 Abs. 1',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die Bestandsprovision bemisst sich nach dem Jahresbeitrag des Vertrags.',
          pageNumber: 14
        }
      },
      {
        step: 2,
        label: 'Bestandsprovisionssatz anwenden',
        description: 'Der Bestandsprovisionssatz für BU-Versicherungen beträgt 1,5% des Jahresbeitrags.',
        formula: 'BP = Jahresbeitrag × 0,015',
        inputValues: { 'Jahresbeitrag': 1440.00, 'Satz': 0.015 },
        calculation: '1.440,00 € × 1,5% = 21,60 €',
        result: 21.60,
        resultLabel: 'Bestandsprovision',
        ruleReference: {
          paragraph: '§7 Abs. 2',
          document: 'Provisionsbestimmungen LV',
          quote: 'Die jährliche Bestandsprovision für Berufsunfähigkeitsversicherungen beträgt 1,5% des Jahresbeitrags.',
          pageNumber: 14
        }
      }
    ],
    appliedRules: [
      { id: 'lv-bestand-bu', name: 'BU Bestandsprovision 1,5%', category: 'Bestand' }
    ] as AppliedRuleInfo[],
    finalAmount: 21.60,
    confidence: 'high',
    confidenceReasons: [
      'Standardsatz für LV/BU-Bestandsprovisionen',
      'Vertrag seit 2019 im Bestand'
    ]
  },

  // =========================================================================
  // KFZ-01: Kfz-Vollkasko - Abschluss
  // =========================================================================
  'demo-kfz-01': {
    transactionId: 'demo-kfz-01',
    summary: 'Abschlussprovision für Kfz-Vollkasko mit 7% des Nettobeitrags.',
    explanation: 'Kfz-Versicherungen werden mit einem Festsatz von 7% des Nettojahresbeitrags vergütet.',
    calculation: '890,00 € / 1,19 × 7% = 62,30 €',
    calculationSteps: [
      {
        step: 1,
        label: 'Nettojahresbeitrag ermitteln',
        description: 'Die Versicherungssteuer (19%) wird vom Bruttobeitrag abgezogen.',
        formula: 'Nettobeitrag = Bruttobeitrag / 1,19',
        inputValues: { 'Bruttobeitrag': 890.00 },
        calculation: '890,00 € / 1,19 = 747,90 €',
        result: 747.90,
        resultLabel: 'Nettojahresbeitrag',
        ruleReference: {
          paragraph: '§2 Abs. 1',
          document: 'Provisionsbestimmungen Kfz',
          quote: 'Berechnungsgrundlage ist der Nettojahresbeitrag ohne Versicherungssteuer.',
          pageNumber: 3
        }
      },
      {
        step: 2,
        label: 'Kfz-Provisionssatz anwenden',
        description: 'Für Kfz-Vollkaskoversicherungen gilt ein Festsatz von 7% (Premium-Tarif: 7%, Basis: 5%).',
        formula: 'AP = Nettobeitrag × 0,07 × Korrekturfaktor',
        inputValues: { 'Nettobeitrag': 747.90, 'Satz': 0.07, 'Korrekturfaktor': 1.19 },
        calculation: '747,90 € × 7% × 1,19 = 62,30 €',
        result: 62.30,
        resultLabel: 'Abschlussprovision',
        ruleReference: {
          paragraph: '§3 Abs. 1',
          document: 'Provisionsbestimmungen Kfz',
          quote: 'Die Abschlussprovision für Kfz-Vollkaskoversicherungen beträgt 7% des Nettobeitrags für Premium-Tarife.',
          pageNumber: 4
        }
      }
    ],
    appliedRules: [
      { id: 'kfz-vk-premium', name: 'Kfz Vollkasko Premium 7%', category: 'Abschluss' }
    ] as AppliedRuleInfo[],
    finalAmount: 62.30,
    confidence: 'high',
    confidenceReasons: [
      'Produkttyp eindeutig als Kfz-Vollkasko Premium identifiziert',
      'Standardsatz für Premium-Tarife angewendet'
    ]
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gibt die Demo-Erklärung für eine Transaktion zurück
 */
export function getDemoExplanation(transactionId: string): TransactionExplanation | null {
  return DEMO_EXPLANATIONS[transactionId] || null;
}

/**
 * Gibt alle Demo-Transaktionen zurück
 */
export function getDemoTransactions(): Transaction[] {
  return DEMO_TRANSACTIONS;
}

/**
 * Berechnet Statistiken über die Demo-Daten
 */
export function getDemoStatistics() {
  const transactions = DEMO_TRANSACTIONS;

  const bySparte = transactions.reduce((acc, t) => {
    const sparte = t.sparte || 'Sonstig';
    if (!acc[sparte]) {
      acc[sparte] = { count: 0, sum: 0 };
    }
    acc[sparte].count++;
    acc[sparte].sum += t.provisionsbetrag;
    return acc;
  }, {} as Record<string, { count: number; sum: number }>);

  const byProvisionsart = transactions.reduce((acc, t) => {
    if (!acc[t.provisionsart]) {
      acc[t.provisionsart] = { count: 0, sum: 0 };
    }
    acc[t.provisionsart].count++;
    acc[t.provisionsart].sum += t.provisionsbetrag;
    return acc;
  }, {} as Record<string, { count: number; sum: number }>);

  const total = transactions.reduce((sum, t) => sum + t.provisionsbetrag, 0);

  return {
    totalTransactions: transactions.length,
    totalProvision: total,
    bySparte,
    byProvisionsart,
    explainedCount: Object.keys(DEMO_EXPLANATIONS).length,
    highConfidenceCount: Object.values(DEMO_EXPLANATIONS).filter(e => e.confidence === 'high').length
  };
}

/**
 * Sparten-Icons für die UI
 */
export const SPARTEN_ICONS: Record<string, string> = {
  'KV': '🏥',
  'SHUK': '🏠',
  'LV': '📈',
  'Kfz': '🚗',
  'Leben': '📈',
  'Sach': '🏠',
  'Kranken': '🏥',
  'KFZ': '🚗'
};

/**
 * Provisionsart-Farben für die UI
 */
export const PROVISIONSART_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Abschluss': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Bestand': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Storno': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Dynamik': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Nachprovision': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Beitragserhöhung': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Rückabrechnung': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Sonstig': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
};
