import jsPDF from 'jspdf';

/**
 * Umfassender Vergütungsnachweise-Generator basierend auf der Excel-Vorlage
 * Generiert ein mehrseitiges PDF mit allen Vergütungsnachweisen
 */

// Farben
const COLOR_PRIMARY = [0, 82, 147] as const;
const COLOR_GRAY_DARK = [60, 60, 60] as const;
const COLOR_GRAY_LIGHT = [120, 120, 120] as const;
const COLOR_TABLE_HEADER = [230, 240, 250] as const;
const COLOR_TABLE_ALT = [248, 250, 252] as const;
const COLOR_SECTION_BG = [240, 245, 250] as const;

// Stammdaten
const COMPANY_INFO = {
  name: 'Alpha',
  subName: 'Versicherung AG',
  address: 'Hauptverwaltung',
  city: '80331 München'
};

const VERMITTLER_INFO = {
  vertragsnummer: '2000034279',
  vermittlernummer: '0300/0001',
  admNummer: '00186418',
  monatJahr: '06/2024',
  laufId: '7890',
  abrechnungsdatum: '07.06.2024'
};

// ========================
// BEISPIEL-DATEN für alle Sektionen
// ========================

interface KVAbschlussRow {
  vn: string;
  vsNr: string;
  tarif: string;
  antragsDatum: string;
  vtsDatum: string;
  basis: number;
  provArt: string;
  satz: string;
  gesamtBetrag: number;
  abgerechnet: number;
  stornohaftung: string;
  provFallNr: string;
  abschlussVerm: string;
}

interface KVLaufendeRow {
  vn: string;
  vsNr: string;
  versZweig: string;
  faelligkeit: string;
  selbstVerm: string;
  zahlweise: string;
  basis: number;
  satz: string;
  betrag: number;
  provFallNr: string;
}

interface KVSuperRow {
  abschlussVerm: string;
  sparte: string;
  tarif: string;
  vsNrVn: string;
  antragsDatum: string;
  provArt: string;
  vtsDatum: string;
  basis: number;
  satz: string;
  uvmSatz: string;
  betrag: number;
  uvmBetrag: number;
  stornohaftungEnde: string;
  provFallNr: string;
}

interface SHUKAbschlussRow {
  vn: string;
  vsNr: string;
  tarifgruppe: string;
  antragsDatum: string;
  vtsDatum: string;
  basis: number;
  provArt: string;
  satz: string;
  gesamtBetrag: number;
  abgerechnet: number;
  stornohaftungEnde: string;
  provFallNr: string;
  buchmonat: string;
  abschlussVerm: string;
}

interface LVAbschlussRow {
  vn: string;
  vsNr: string;
  tarif: string;
  antragsDatum: string;
  vtsDatum: string;
  basis: number;
  provArt: string;
  satz: string;
  gesamtBetrag: number;
  abgerechnet: number;
  stornohaftungEnde: string;
  modus: string;
  faelligZum: string;
  faelligerBeitrag: number;
}

interface GesamtUebersichtRow {
  kategorie: string;
  bezeichnung: string;
  betrag: number;
}

interface KontoRow {
  erfassung: string;
  buchung: string;
  text: string;
  soll: number;
  haben: number;
}

// Beispieldaten generieren - mit realistischen Spezialfällen
function getKVAbschlussData(): { alphaKranken: KVAbschlussRow[], alphaPlus: KVAbschlussRow[] } {
  return {
    alphaKranken: [
      // Reguläre Neuabschlüsse
      { vn: 'Müller, Hans', vsNr: 'AK-2024-001234', tarif: 'PKV Premium Plus', antragsDatum: '15.03.2024', vtsDatum: '01.04.2024', basis: 575.58, provArt: 'AP', satz: '5,25 MB', gesamtBetrag: 3021.80, abgerechnet: 3021.80, stornohaftung: '31.03.2029', provFallNr: 'PF-001234', abschlussVerm: 'Eigenvermittlung' },
      { vn: 'Schmidt, Anna', vsNr: 'AK-2024-001456', tarif: 'PKV Comfort', antragsDatum: '22.03.2024', vtsDatum: '01.04.2024', basis: 493.97, provArt: 'AP', satz: '5,25 MB', gesamtBetrag: 2593.33, abgerechnet: 2593.33, stornohaftung: '31.03.2029', provFallNr: 'PF-001456', abschlussVerm: 'Eigenvermittlung' },
      // Zahnzusatz
      { vn: 'Weber, Thomas', vsNr: 'AK-2024-001789', tarif: 'Zahnzusatz Komfort', antragsDatum: '28.03.2024', vtsDatum: '01.04.2024', basis: 32.00, provArt: 'AP', satz: '4 MB', gesamtBetrag: 128.00, abgerechnet: 128.00, stornohaftung: '31.03.2029', provFallNr: 'PF-001789', abschlussVerm: 'Eigenvermittlung' },
      // STORNO-RÜCKABRECHNUNG: Vertrag aus 2022, Storno nach 28 Monaten, 32/60 = 53% Rückbelastung
      { vn: 'Berger, Otto', vsNr: 'AK-2022-000891', tarif: 'PKV Premium Plus', antragsDatum: '01.10.2022', vtsDatum: '01.11.2022', basis: 489.00, provArt: 'ST-AP', satz: '-53%', gesamtBetrag: -1361.42, abgerechnet: -1361.42, stornohaftung: 'Storno 28M', provFallNr: 'ST-000891', abschlussVerm: 'Storno-Rückr.' },
      // TARIFWECHSEL mit Mehrleistung - AP auf Differenzbeitrag
      { vn: 'Krause, Dirk', vsNr: 'AK-2021-005432', tarif: 'PKV Comfort→Premium', antragsDatum: '15.05.2024', vtsDatum: '01.06.2024', basis: 125.00, provArt: 'AP-Diff', satz: '5,25 MB', gesamtBetrag: 656.25, abgerechnet: 656.25, stornohaftung: '31.05.2029', provFallNr: 'TW-005432', abschlussVerm: 'Tarifwechsel' },
    ],
    alphaPlus: [
      { vn: 'Fischer, Maria', vsNr: 'AP-2024-002345', tarif: 'MediCompact', antragsDatum: '10.03.2024', vtsDatum: '01.04.2024', basis: 568.89, provArt: 'AP', satz: '5,25 MB', gesamtBetrag: 2986.67, abgerechnet: 2986.67, stornohaftung: '31.03.2029', provFallNr: 'PF-002345', abschlussVerm: 'Fremdordnung' },
      { vn: 'Bauer, Klaus', vsNr: 'AP-2024-002567', tarif: 'MediTop Plus', antragsDatum: '18.03.2024', vtsDatum: '01.04.2024', basis: 868.57, provArt: 'AP', satz: '5,25 MB', gesamtBetrag: 4560.00, abgerechnet: 4560.00, stornohaftung: '31.03.2029', provFallNr: 'PF-002567', abschlussVerm: 'Eigenvermittlung' },
      // RÜCKWIRKENDE KORREKTUR - Beitrag war falsch erfasst
      { vn: 'Lange, Herbert', vsNr: 'AP-2024-002123', tarif: 'MediCompact', antragsDatum: '05.02.2024', vtsDatum: '01.03.2024', basis: 45.00, provArt: 'AP-Korr', satz: '5,25 MB', gesamtBetrag: 236.25, abgerechnet: 236.25, stornohaftung: '28.02.2029', provFallNr: 'KO-002123', abschlussVerm: 'Rückw. Korrektur' },
    ]
  };
}

function getKVLaufendeData(): KVLaufendeRow[] {
  return [
    { vn: 'Huber, Fritz', vsNr: 'AK-2020-008901', versZweig: 'PKV', faelligkeit: '01.06.2024', selbstVerm: 'Ja', zahlweise: 'mtl', basis: 4200.00, satz: '1,5%', betrag: 63.00, provFallNr: 'PF-L001' },
    { vn: 'Klein, Sabine', vsNr: 'AK-2019-007654', versZweig: 'PKV', faelligkeit: '01.06.2024', selbstVerm: 'Ja', zahlweise: 'jährl', basis: 5640.00, satz: '1,5%', betrag: 84.60, provFallNr: 'PF-L002' },
    { vn: 'Braun, Peter', vsNr: 'AK-2021-009876', versZweig: 'Zusatz', faelligkeit: '01.06.2024', selbstVerm: 'Nein', zahlweise: 'mtl', basis: 384.00, satz: '1,5%', betrag: 5.76, provFallNr: 'PF-L003' },
    { vn: 'Wolf, Eva', vsNr: 'AK-2018-006543', versZweig: 'PKV', faelligkeit: '01.06.2024', selbstVerm: 'Ja', zahlweise: 'mtl', basis: 7920.00, satz: '1,5%', betrag: 118.80, provFallNr: 'PF-L004' },
  ];
}

function getKVSuperData(): KVSuperRow[] {
  return [
    { abschlussVerm: '0300/0002', sparte: 'PKV', tarif: 'Premium Plus', vsNrVn: 'AK-2024-003456 / Meier, Josef', antragsDatum: '05.04.2024', provArt: 'SP-AP', vtsDatum: '01.05.2024', basis: 4800.00, satz: '1,0%', uvmSatz: '0,5%', betrag: 48.00, uvmBetrag: 24.00, stornohaftungEnde: '30.04.2029', provFallNr: 'SP-001' },
    { abschlussVerm: '0300/0003', sparte: 'PKV', tarif: 'MediTop', vsNrVn: 'AP-2024-004567 / Schulz, Andrea', antragsDatum: '12.04.2024', provArt: 'SP-AP', vtsDatum: '01.05.2024', basis: 6200.00, satz: '1,0%', uvmSatz: '0,5%', betrag: 62.00, uvmBetrag: 31.00, stornohaftungEnde: '30.04.2029', provFallNr: 'SP-002' },
  ];
}

function getSHUKAbschlussData(): { alphaSach: SHUKAbschlussRow[], alphaKfz: SHUKAbschlussRow[] } {
  return {
    alphaSach: [
      // Reguläre Neuabschlüsse
      { vn: 'Hoffmann, Lisa', vsNr: 'AS-2024-010234', tarifgruppe: 'Hausrat Premium', antragsDatum: '05.04.2024', vtsDatum: '01.05.2024', basis: 289.00, provArt: 'AP', satz: '60%', gesamtBetrag: 173.40, abgerechnet: 173.40, stornohaftungEnde: '30.04.2029', provFallNr: 'SHUK-001', buchmonat: '05/2024', abschlussVerm: 'Eigenvermittlung' },
      { vn: 'Lang, Michael', vsNr: 'AS-2024-010456', tarifgruppe: 'Wohngebäude', antragsDatum: '10.04.2024', vtsDatum: '01.05.2024', basis: 1245.00, provArt: 'AP', satz: '60%', gesamtBetrag: 747.00, abgerechnet: 747.00, stornohaftungEnde: '30.04.2029', provFallNr: 'SHUK-002', buchmonat: '05/2024', abschlussVerm: 'Eigenvermittlung' },
      { vn: 'Roth, Sandra', vsNr: 'AS-2024-010789', tarifgruppe: 'PHV Exklusiv', antragsDatum: '15.04.2024', vtsDatum: '01.05.2024', basis: 128.00, provArt: 'AP', satz: '60%', gesamtBetrag: 76.80, abgerechnet: 76.80, stornohaftungEnde: '30.04.2029', provFallNr: 'SHUK-003', buchmonat: '05/2024', abschlussVerm: 'Fremdordnung' },
      // BEITRAGSERHÖHUNG - Versicherungssumme wurde erhöht
      { vn: 'Neu, Markus', vsNr: 'AS-2021-007890', tarifgruppe: 'Hausrat Premium', antragsDatum: '01.06.2024', vtsDatum: '01.06.2024', basis: 85.00, provArt: 'AP-Erhöh', satz: '60%', gesamtBetrag: 51.00, abgerechnet: 51.00, stornohaftungEnde: '31.05.2026', provFallNr: 'BE-007890', buchmonat: '06/2024', abschlussVerm: 'Beitragserhöh.' },
      // STORNO-RÜCKABRECHNUNG - 5J-Vertrag nach 2 Jahren gekündigt = 60% Rückbelastung
      { vn: 'Alt, Friedrich', vsNr: 'AS-2022-004567', tarifgruppe: 'Wohngebäude', antragsDatum: '01.06.2022', vtsDatum: '01.07.2022', basis: 980.00, provArt: 'ST-AP', satz: '-60%', gesamtBetrag: -352.80, abgerechnet: -352.80, stornohaftungEnde: 'Storno 24M', provFallNr: 'ST-004567', buchmonat: '06/2024', abschlussVerm: 'Storno-Rückr.' },
    ],
    alphaKfz: [
      // Kfz-Bestand (keine separate AP, nur FP)
      { vn: 'Koch, Stefan', vsNr: 'AK-2024-020123', tarifgruppe: 'Kfz-Vollkasko', antragsDatum: '08.04.2024', vtsDatum: '01.05.2024', basis: 856.00, provArt: 'FP', satz: '7%', gesamtBetrag: 59.92, abgerechnet: 59.92, stornohaftungEnde: '30.04.2025', provFallNr: 'SHUK-004', buchmonat: '05/2024', abschlussVerm: 'Eigenvermittlung' },
      // Unfall mit hoher AP
      { vn: 'Berg, Julia', vsNr: 'AS-2024-020456', tarifgruppe: 'Unfall Premium', antragsDatum: '20.04.2024', vtsDatum: '01.05.2024', basis: 324.00, provArt: 'AP', satz: '60%', gesamtBetrag: 194.40, abgerechnet: 194.40, stornohaftungEnde: '30.04.2029', provFallNr: 'SHUK-005', buchmonat: '05/2024', abschlussVerm: 'Eigenvermittlung' },
      // PRODUKTANPASSUNG - Tarifwechsel ohne neue AP
      { vn: 'Meyer, Karl', vsNr: 'AK-2023-015678', tarifgruppe: 'Kfz TK→VK', antragsDatum: '15.05.2024', vtsDatum: '15.05.2024', basis: 245.00, provArt: 'FP-Diff', satz: '7%', gesamtBetrag: 17.15, abgerechnet: 17.15, stornohaftungEnde: '14.05.2025', provFallNr: 'PA-015678', buchmonat: '05/2024', abschlussVerm: 'Produktanpass.' },
    ]
  };
}

function getLVAbschlussData(): { alphaLeben: LVAbschlussRow[], alphaRente: LVAbschlussRow[] } {
  return {
    alphaLeben: [
      // Reguläre Neuabschlüsse - Bewertete Beitragssumme = Jahresbeitrag × Laufzeit (max 35 J.)
      { vn: 'Schneider, Robert', vsNr: 'AL-2024-030123', tarif: 'FlexVorsorge Plus', antragsDatum: '01.04.2024', vtsDatum: '01.05.2024', basis: 48000.00, provArt: 'AP', satz: '23‰', gesamtBetrag: 1104.00, abgerechnet: 220.80, stornohaftungEnde: '30.04.2029', modus: '20%', faelligZum: '01.05.2025', faelligerBeitrag: 2400.00 },
      { vn: 'Wagner, Christine', vsNr: 'AL-2024-030456', tarif: 'BU-Schutz Komfort', antragsDatum: '10.04.2024', vtsDatum: '01.05.2024', basis: 36000.00, provArt: 'AP', satz: '23‰', gesamtBetrag: 828.00, abgerechnet: 165.60, stornohaftungEnde: '30.04.2029', modus: '20%', faelligZum: '01.05.2025', faelligerBeitrag: 1200.00 },
      // DYNAMIKERHÖHUNG - Erhöhung um 5% = 120 EUR/Jahr × 20 J. Restlaufzeit = 2.400 EUR Erhöhungsbeitragssumme
      { vn: 'Jansen, Maria', vsNr: 'AL-2019-025789', tarif: 'FlexVorsorge Dyn.', antragsDatum: '01.06.2024', vtsDatum: '01.06.2024', basis: 2400.00, provArt: 'DYN-AP', satz: '23‰', gesamtBetrag: 55.20, abgerechnet: 11.04, stornohaftungEnde: '31.05.2029', modus: '20%', faelligZum: '01.06.2025', faelligerBeitrag: 120.00 },
      // STORNO-RÜCKABRECHNUNG (Beitragsfreistellung nach 18 Monaten = 42/60 = 70% Rückbelastung)
      { vn: 'Franke, Heinrich', vsNr: 'AL-2023-028456', tarif: 'Kapital-LV', antragsDatum: '01.01.2023', vtsDatum: '01.02.2023', basis: 52500.00, provArt: 'ST-AP', satz: '-70%', gesamtBetrag: -845.25, abgerechnet: -845.25, stornohaftungEnde: 'Beitr.frei 18M', modus: '100%', faelligZum: '-', faelligerBeitrag: 0 },
      // NACHPROVISION (2. Jahr der ratierlichen Auszahlung)
      { vn: 'Vogel, Ernst', vsNr: 'AL-2023-022345', tarif: 'FlexVorsorge Plus', antragsDatum: '15.05.2023', vtsDatum: '01.06.2023', basis: 0, provArt: 'NP (2/5)', satz: '20%', gesamtBetrag: 276.00, abgerechnet: 276.00, stornohaftungEnde: '31.05.2028', modus: 'Rate 2', faelligZum: '01.06.2024', faelligerBeitrag: 2400.00 },
    ],
    alphaRente: [
      { vn: 'Hartmann, Frank', vsNr: 'AR-2024-040123', tarif: 'Renten-Invest', antragsDatum: '05.04.2024', vtsDatum: '01.05.2024', basis: 72000.00, provArt: 'AP', satz: '23‰', gesamtBetrag: 1656.00, abgerechnet: 331.20, stornohaftungEnde: '30.04.2029', modus: '20%', faelligZum: '01.05.2025', faelligerBeitrag: 3000.00 },
      { vn: 'Werner, Petra', vsNr: 'AR-2024-040456', tarif: 'Fondsgebundene RV', antragsDatum: '15.04.2024', vtsDatum: '01.05.2024', basis: 60000.00, provArt: 'AP', satz: '23‰', gesamtBetrag: 1380.00, abgerechnet: 276.00, stornohaftungEnde: '30.04.2029', modus: '20%', faelligZum: '01.05.2025', faelligerBeitrag: 2500.00 },
      // BEITRAGSREDUZIERUNG - 40% weniger Beitrag nach 24 Monaten = 40% × (36/60) = 24% Rückbelastung
      { vn: 'Sommer, Ingrid', vsNr: 'AR-2022-038901', tarif: 'Renten-Invest', antragsDatum: '01.05.2022', vtsDatum: '01.06.2022', basis: 24000.00, provArt: 'RED-AP', satz: '-24%', gesamtBetrag: -132.48, abgerechnet: -132.48, stornohaftungEnde: 'Reduz. 24M', modus: '100%', faelligZum: '-', faelligerBeitrag: 0 },
      // DYNAMIKERHÖHUNG für Rente
      { vn: 'Bach, Helmut', vsNr: 'AR-2020-035678', tarif: 'Renten-Invest Dyn.', antragsDatum: '01.06.2024', vtsDatum: '01.06.2024', basis: 3150.00, provArt: 'DYN-AP', satz: '23‰', gesamtBetrag: 72.45, abgerechnet: 14.49, stornohaftungEnde: '31.05.2029', modus: '20%', faelligZum: '01.06.2025', faelligerBeitrag: 150.00 },
    ]
  };
}

function getGesamtUebersicht(): GesamtUebersichtRow[] {
  return [
    { kategorie: 'KV', bezeichnung: 'Abschlussprovisionen', betrag: 15289.80 },
    { kategorie: 'KV', bezeichnung: 'Laufende Vergütungen', betrag: 89.95 },
    { kategorie: 'KV', bezeichnung: 'Superprovisionen', betrag: 165.00 },
    { kategorie: 'KV', bezeichnung: 'Dienstleistungen', betrag: 0.00 },
    { kategorie: 'KV', bezeichnung: 'Ventilgeschäft', betrag: 0.00 },
    { kategorie: 'KV', bezeichnung: 'Aufwandsentschädigungen', betrag: 0.00 },
    { kategorie: 'KV', bezeichnung: 'BBV/BABV', betrag: 0.00 },
    { kategorie: 'SHUK', bezeichnung: 'Abschlussprovisionen', betrag: 553.09 },
    { kategorie: 'SHUK', bezeichnung: 'Laufende/Folge', betrag: 125.40 },
    { kategorie: 'SHUK', bezeichnung: 'Superprovisionen', betrag: 45.00 },
    { kategorie: 'LV', bezeichnung: 'Abschlussprovisionen', betrag: 1735.20 },
    { kategorie: 'LV', bezeichnung: 'Folgeprovisionen', betrag: 320.00 },
    { kategorie: 'LV', bezeichnung: 'Superprovisionen', betrag: 85.00 },
  ];
}

function getKontoauszug(): KontoRow[] {
  return [
    { erfassung: '01.06.2024', buchung: '05.06.2024', text: 'Saldovortrag', soll: 0, haben: 1250.00 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'KV Abschlussprovisionen', soll: 0, haben: 15289.80 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'KV Laufende Vergütungen', soll: 0, haben: 89.95 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'KV Superprovisionen', soll: 0, haben: 165.00 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'SHUK Abschlussprovisionen', soll: 0, haben: 553.09 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'SHUK Laufende/Folge', soll: 0, haben: 125.40 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'SHUK Superprovisionen', soll: 0, haben: 45.00 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'LV Abschlussprovisionen', soll: 0, haben: 1735.20 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'LV Folgeprovisionen', soll: 0, haben: 320.00 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'LV Superprovisionen', soll: 0, haben: 85.00 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'Stornoreserve-Zuführung', soll: 528.50, haben: 0 },
    { erfassung: '05.06.2024', buchung: '05.06.2024', text: 'Vorschuss-Tilgung', soll: 500.00, haben: 0 },
  ];
}

// ========================
// PDF-Generator
// ========================

export function generateVergütungsnachweise(): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const ML = 12;
  const MR = 12;
  const MT = 12;
  const CW = PAGE_W - ML - MR;

  let pageNumber = 1;
  let y = MT;

  // Hilfsfunktionen
  const formatEuro = (val: number): string => {
    return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const drawHeader = (title: string, gesellschaft: string = COMPANY_INFO.name, subGesellschaft: string = COMPANY_INFO.subName) => {
    // Gesellschaft links oben
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(gesellschaft, ML, y);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(subGesellschaft, ML, y + 4);
    doc.text(COMPANY_INFO.address, ML, y + 8);
    doc.text(COMPANY_INFO.city, ML, y + 12);

    // Titel rechts
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, PAGE_W - MR, y, { align: 'right' });

    // Vermittlerdaten
    y += 18;
    doc.setFillColor(COLOR_SECTION_BG[0], COLOR_SECTION_BG[1], COLOR_SECTION_BG[2]);
    doc.rect(ML, y, CW, 12, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);

    const headerData = [
      { label: 'Vertragsnummer', value: VERMITTLER_INFO.vertragsnummer },
      { label: 'Vermittlernummer', value: VERMITTLER_INFO.vermittlernummer },
      { label: 'ADM-Nummer', value: VERMITTLER_INFO.admNummer },
      { label: 'Monat/Jahr', value: VERMITTLER_INFO.monatJahr },
      { label: 'Lauf-ID', value: VERMITTLER_INFO.laufId },
      { label: 'Datum', value: VERMITTLER_INFO.abrechnungsdatum },
    ];

    let hx = ML + 2;
    headerData.forEach((item, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, hx, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, hx, y + 9);
      hx += idx === 0 ? 28 : (idx === 1 ? 28 : (idx === 2 ? 22 : 22));
    });

    // Seite
    doc.setFont('helvetica', 'normal');
    doc.text(`Seite ${pageNumber}`, PAGE_W - MR - 2, y + 7, { align: 'right' });

    y += 18;
  };

  const drawSubsectionHeader = (title: string) => {
    doc.setFillColor(COLOR_SECTION_BG[0], COLOR_SECTION_BG[1], COLOR_SECTION_BG[2]);
    doc.rect(ML, y, CW, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(title, ML + 2, y + 4);
    y += 8;
  };

  const drawTableHeader = (headers: string[], colWidths: number[]) => {
    doc.setFillColor(COLOR_TABLE_HEADER[0], COLOR_TABLE_HEADER[1], COLOR_TABLE_HEADER[2]);
    doc.rect(ML, y, CW, 6, 'F');
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);

    let x = ML + 1;
    headers.forEach((header, idx) => {
      const lines = header.split('\n');
      lines.forEach((line, lineIdx) => {
        doc.text(line, x, y + 3 + (lineIdx * 2.5));
      });
      x += colWidths[idx];
    });
    y += 6;
  };

  const drawFooter = () => {
    doc.setFontSize(6);
    doc.setTextColor(COLOR_GRAY_LIGHT[0], COLOR_GRAY_LIGHT[1], COLOR_GRAY_LIGHT[2]);
    doc.text(`${COMPANY_INFO.name} ${COMPANY_INFO.subName} · ${COMPANY_INFO.address} · ${COMPANY_INFO.city}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
  };

  // ============================================
  // SEITE 1: GESAMTÜBERSICHT
  // ============================================
  drawHeader('Gesamtübersicht Vergütungen');

  const gesamtData = getGesamtUebersicht();

  // Tabelle Gesamtübersicht
  const gesamtHeaders = ['Bereich', 'Vergütungsart', 'Betrag in EUR'];
  const gesamtWidths = [25, 90, 40];
  drawTableHeader(gesamtHeaders, gesamtWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let lastKategorie = '';
  let kategorieSum = 0;
  let gesamtSum = 0;

  gesamtData.forEach((row, idx) => {
    if (lastKategorie && lastKategorie !== row.kategorie) {
      // Zwischensumme
      doc.setFillColor(250, 250, 250);
      doc.rect(ML, y, CW, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`Summe ${lastKategorie}`, ML + 26, y + 3.5);
      doc.text(formatEuro(kategorieSum), ML + CW - 5, y + 3.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += 6;
      kategorieSum = 0;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    doc.text(row.kategorie !== lastKategorie ? row.kategorie : '', ML + 1, y + 3.5);
    doc.text(row.bezeichnung, ML + 26, y + 3.5);
    doc.text(formatEuro(row.betrag), ML + CW - 5, y + 3.5, { align: 'right' });

    kategorieSum += row.betrag;
    gesamtSum += row.betrag;
    lastKategorie = row.kategorie;
    y += 5;
  });

  // Letzte Kategorie-Summe
  doc.setFillColor(250, 250, 250);
  doc.rect(ML, y, CW, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(`Summe ${lastKategorie}`, ML + 26, y + 3.5);
  doc.text(formatEuro(kategorieSum), ML + CW - 5, y + 3.5, { align: 'right' });
  y += 6;

  // Gesamtsumme
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('GESAMTSUMME VERGÜTUNGEN', ML + 5, y + 5);
  doc.text(formatEuro(gesamtSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });
  y += 12;

  drawFooter();

  // ============================================
  // SEITE 2: KONTOAUSZUG
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Kontoauszug');

  const kontoData = getKontoauszug();
  const kontoHeaders = ['Erfassung', 'Buchung', 'Buchungstext', 'Soll EUR', 'Haben EUR'];
  const kontoWidths = [22, 22, 80, 28, 28];
  drawTableHeader(kontoHeaders, kontoWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let sollSum = 0;
  let habenSum = 0;

  kontoData.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    doc.text(row.erfassung, ML + 1, y + 3.5);
    doc.text(row.buchung, ML + 23, y + 3.5);
    doc.text(row.text, ML + 45, y + 3.5);

    if (row.soll > 0) {
      doc.text(formatEuro(row.soll), ML + 125, y + 3.5, { align: 'right' });
    }
    if (row.haben > 0) {
      doc.text(formatEuro(row.haben), ML + CW - 5, y + 3.5, { align: 'right' });
    }

    sollSum += row.soll;
    habenSum += row.haben;
    y += 5;
  });

  // Summenzeile
  y += 2;
  doc.setDrawColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.setLineWidth(0.5);
  doc.line(ML, y, ML + CW, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Summen', ML + 45, y);
  doc.text(formatEuro(sollSum), ML + 125, y, { align: 'right' });
  doc.text(formatEuro(habenSum), ML + CW - 5, y, { align: 'right' });
  y += 6;

  const saldo = habenSum - sollSum;
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AUSZAHLUNGSBETRAG', ML + 5, y + 5);
  doc.text(formatEuro(saldo) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  drawFooter();

  // ============================================
  // SEITE 3: KV ABSCHLUSSPROVISIONEN
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Vergütungsnachweis Abschlussprovisionen*');

  const kvAbschlussData = getKVAbschlussData();

  // Alpha Kranken
  drawSubsectionHeader('Alpha Kranken (AK)');

  const kvAbschlussHeaders = ['VN', 'VS-Nr', 'Tarif', 'Antrag', 'VTS', 'Basis €', 'Art', 'Satz', 'Betrag €', 'Stornohaft.', 'Prov-Fall'];
  const kvAbschlussWidths = [22, 24, 22, 16, 16, 18, 10, 14, 18, 18, 18];
  drawTableHeader(kvAbschlussHeaders, kvAbschlussWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let bkSum = 0;
  kvAbschlussData.alphaKranken.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += kvAbschlussWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += kvAbschlussWidths[1];
    doc.text(row.tarif.substring(0, 12), x, y + 3.5); x += kvAbschlussWidths[2];
    doc.text(row.antragsDatum.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[3];
    doc.text(row.vtsDatum.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[4];
    doc.text(formatEuro(row.basis), x + kvAbschlussWidths[5] - 2, y + 3.5, { align: 'right' }); x += kvAbschlussWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += kvAbschlussWidths[6];
    doc.text(row.satz, x, y + 3.5); x += kvAbschlussWidths[7];
    doc.text(formatEuro(row.abgerechnet), x + kvAbschlussWidths[8] - 2, y + 3.5, { align: 'right' }); x += kvAbschlussWidths[8];
    doc.text(row.stornohaftung.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[9];
    doc.text(row.provFallNr, x, y + 3.5);

    bkSum += row.abgerechnet;
    y += 5;
  });

  // BK Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Kranken:', ML + 2, y + 3);
  doc.text(formatEuro(bkSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Alpha Plus
  drawSubsectionHeader('Alpha Plus (AP)');
  drawTableHeader(kvAbschlussHeaders, kvAbschlussWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let gkSum = 0;
  kvAbschlussData.alphaPlus.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += kvAbschlussWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += kvAbschlussWidths[1];
    doc.text(row.tarif.substring(0, 12), x, y + 3.5); x += kvAbschlussWidths[2];
    doc.text(row.antragsDatum.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[3];
    doc.text(row.vtsDatum.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[4];
    doc.text(formatEuro(row.basis), x + kvAbschlussWidths[5] - 2, y + 3.5, { align: 'right' }); x += kvAbschlussWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += kvAbschlussWidths[6];
    doc.text(row.satz, x, y + 3.5); x += kvAbschlussWidths[7];
    doc.text(formatEuro(row.abgerechnet), x + kvAbschlussWidths[8] - 2, y + 3.5, { align: 'right' }); x += kvAbschlussWidths[8];
    doc.text(row.stornohaftung.substring(0, 10), x, y + 3.5); x += kvAbschlussWidths[9];
    doc.text(row.provFallNr, x, y + 3.5);

    gkSum += row.abgerechnet;
    y += 5;
  });

  // GK Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Plus:', ML + 2, y + 3);
  doc.text(formatEuro(gkSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Gesamtsumme KV Abschluss
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SUMME KV ABSCHLUSSPROVISIONEN', ML + 5, y + 5);
  doc.text(formatEuro(bkSum + gkSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  doc.setFontSize(6);
  doc.setTextColor(COLOR_GRAY_LIGHT[0], COLOR_GRAY_LIGHT[1], COLOR_GRAY_LIGHT[2]);
  y += 12;
  doc.text('* Sortierung: aufsteigend nach Versicherungsnehmer', ML, y);
  doc.text('** Bei MB (Monatsbeiträgen): Jahresbeitrag als Berechnungsbasis', ML, y + 4);

  drawFooter();

  // ============================================
  // SEITE 4: KV LAUFENDE VERGÜTUNGEN
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Vergütungsnachweis Laufende & Folgende Vergütung*');

  const kvLaufendeData = getKVLaufendeData();

  drawSubsectionHeader('Alpha Kranken (AK) - Laufende Vergütungen');

  const kvLaufendeHeaders = ['VN', 'VS-Nr', 'Vers.-zweig', 'Fälligkeit', 'Selbst verm.', 'Zahlw.', 'Basis €', 'Satz', 'Betrag €', 'Prov-Fall'];
  const kvLaufendeWidths = [26, 26, 20, 18, 18, 14, 18, 14, 18, 18];
  drawTableHeader(kvLaufendeHeaders, kvLaufendeWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let laufendeSum = 0;
  kvLaufendeData.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 14), x, y + 3.5); x += kvLaufendeWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += kvLaufendeWidths[1];
    doc.text(row.versZweig, x, y + 3.5); x += kvLaufendeWidths[2];
    doc.text(row.faelligkeit, x, y + 3.5); x += kvLaufendeWidths[3];
    doc.text(row.selbstVerm, x, y + 3.5); x += kvLaufendeWidths[4];
    doc.text(row.zahlweise, x, y + 3.5); x += kvLaufendeWidths[5];
    doc.text(formatEuro(row.basis), x + kvLaufendeWidths[6] - 2, y + 3.5, { align: 'right' }); x += kvLaufendeWidths[6];
    doc.text(row.satz, x, y + 3.5); x += kvLaufendeWidths[7];
    doc.text(formatEuro(row.betrag), x + kvLaufendeWidths[8] - 2, y + 3.5, { align: 'right' }); x += kvLaufendeWidths[8];
    doc.text(row.provFallNr, x, y + 3.5);

    laufendeSum += row.betrag;
    y += 5;
  });

  // Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  y += 4;
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SUMME KV LAUFENDE VERGÜTUNGEN', ML + 5, y + 5);
  doc.text(formatEuro(laufendeSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  drawFooter();

  // ============================================
  // SEITE 5: KV SUPERPROVISIONEN
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Vergütungsnachweis Superprovisionen');

  const kvSuperData = getKVSuperData();

  drawSubsectionHeader('Alpha Kranken (AK)');

  const kvSuperHeaders = ['Abschl.-Verm.', 'Sparte', 'Tarif', 'VS-Nr / VN', 'Antrag', 'Prov.-Art', 'Basis €', 'Satz', 'Betrag €', 'Stornoh.'];
  const kvSuperWidths = [20, 14, 18, 36, 16, 20, 18, 12, 18, 18];
  drawTableHeader(kvSuperHeaders, kvSuperWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let superSum = 0;
  kvSuperData.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.abschlussVerm, x, y + 3.5); x += kvSuperWidths[0];
    doc.text(row.sparte, x, y + 3.5); x += kvSuperWidths[1];
    doc.text(row.tarif.substring(0, 10), x, y + 3.5); x += kvSuperWidths[2];
    doc.text(row.vsNrVn.substring(0, 22), x, y + 3.5); x += kvSuperWidths[3];
    doc.text(row.antragsDatum, x, y + 3.5); x += kvSuperWidths[4];
    doc.text(row.provArt.substring(0, 12), x, y + 3.5); x += kvSuperWidths[5];
    doc.text(formatEuro(row.basis), x + kvSuperWidths[6] - 2, y + 3.5, { align: 'right' }); x += kvSuperWidths[6];
    doc.text(row.satz, x, y + 3.5); x += kvSuperWidths[7];
    doc.text(formatEuro(row.betrag), x + kvSuperWidths[8] - 2, y + 3.5, { align: 'right' }); x += kvSuperWidths[8];
    doc.text(row.stornohaftungEnde.substring(0, 10), x, y + 3.5);

    superSum += row.betrag;
    y += 5;
  });

  // Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  y += 4;
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SUMME KV SUPERPROVISIONEN', ML + 5, y + 5);
  doc.text(formatEuro(superSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  drawFooter();

  // ============================================
  // SEITE 6: SHUK ABSCHLUSSPROVISIONEN
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Vergütungsnachweis Abschlussprovisionen*', 'Alpha', 'Allgemeine Versicherungs-AG');

  const shukAbschlussData = getSHUKAbschlussData();

  // Alpha Sach
  drawSubsectionHeader('Alpha Sach (AS)');

  const shukHeaders = ['VN', 'VS-Nr', 'Tarifgruppe', 'Antrag', 'VTS', 'Basis €', 'Art', 'Satz', 'Betrag €', 'Stornoh.', 'Buchm.'];
  const shukWidths = [22, 24, 22, 16, 16, 16, 10, 26, 16, 18, 14];
  drawTableHeader(shukHeaders, shukWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let baSum = 0;
  shukAbschlussData.alphaSach.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += shukWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += shukWidths[1];
    doc.text(row.tarifgruppe.substring(0, 12), x, y + 3.5); x += shukWidths[2];
    doc.text(row.antragsDatum, x, y + 3.5); x += shukWidths[3];
    doc.text(row.vtsDatum, x, y + 3.5); x += shukWidths[4];
    doc.text(formatEuro(row.basis), x + shukWidths[5] - 2, y + 3.5, { align: 'right' }); x += shukWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += shukWidths[6];
    doc.text(row.satz.substring(0, 16), x, y + 3.5); x += shukWidths[7];
    doc.text(formatEuro(row.abgerechnet), x + shukWidths[8] - 2, y + 3.5, { align: 'right' }); x += shukWidths[8];
    doc.text(row.stornohaftungEnde.substring(0, 10), x, y + 3.5); x += shukWidths[9];
    doc.text(row.buchmonat, x, y + 3.5);

    baSum += row.abgerechnet;
    y += 5;
  });

  // BA Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Sach:', ML + 2, y + 3);
  doc.text(formatEuro(baSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Alpha Kfz
  drawSubsectionHeader('Alpha Kfz (AK)');
  drawTableHeader(shukHeaders, shukWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let gaSum = 0;
  shukAbschlussData.alphaKfz.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += shukWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += shukWidths[1];
    doc.text(row.tarifgruppe.substring(0, 12), x, y + 3.5); x += shukWidths[2];
    doc.text(row.antragsDatum, x, y + 3.5); x += shukWidths[3];
    doc.text(row.vtsDatum, x, y + 3.5); x += shukWidths[4];
    doc.text(formatEuro(row.basis), x + shukWidths[5] - 2, y + 3.5, { align: 'right' }); x += shukWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += shukWidths[6];
    doc.text(row.satz.substring(0, 16), x, y + 3.5); x += shukWidths[7];
    doc.text(formatEuro(row.abgerechnet), x + shukWidths[8] - 2, y + 3.5, { align: 'right' }); x += shukWidths[8];
    doc.text(row.stornohaftungEnde.substring(0, 10), x, y + 3.5); x += shukWidths[9];
    doc.text(row.buchmonat, x, y + 3.5);

    gaSum += row.abgerechnet;
    y += 5;
  });

  // GA Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Kfz:', ML + 2, y + 3);
  doc.text(formatEuro(gaSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Gesamtsumme SHUK Abschluss
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SUMME SHUK ABSCHLUSSPROVISIONEN', ML + 5, y + 5);
  doc.text(formatEuro(baSum + gaSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  drawFooter();

  // ============================================
  // SEITE 7: LV ABSCHLUSSPROVISIONEN
  // ============================================
  doc.addPage();
  pageNumber++;
  y = MT;

  drawHeader('Vergütungsnachweis Abschlussprovisionen*', 'Alpha', 'Lebensversicherung AG');

  const lvAbschlussData = getLVAbschlussData();

  // Alpha Leben
  drawSubsectionHeader('Alpha Leben (AL)');

  const lvHeaders = ['VN', 'VS-Nr', 'Tarif', 'Antrag', 'VTS', 'Basis €', 'Art', 'Satz', 'Gesamt €', 'Abger. €', 'Modus', 'Fällig'];
  const lvWidths = [20, 22, 22, 16, 16, 18, 10, 12, 18, 16, 12, 16];
  drawTableHeader(lvHeaders, lvWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let blSum = 0;
  lvAbschlussData.alphaLeben.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += lvWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += lvWidths[1];
    doc.text(row.tarif.substring(0, 14), x, y + 3.5); x += lvWidths[2];
    doc.text(row.antragsDatum, x, y + 3.5); x += lvWidths[3];
    doc.text(row.vtsDatum, x, y + 3.5); x += lvWidths[4];
    doc.text(formatEuro(row.basis), x + lvWidths[5] - 2, y + 3.5, { align: 'right' }); x += lvWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += lvWidths[6];
    doc.text(row.satz, x, y + 3.5); x += lvWidths[7];
    doc.text(formatEuro(row.gesamtBetrag), x + lvWidths[8] - 2, y + 3.5, { align: 'right' }); x += lvWidths[8];
    doc.text(formatEuro(row.abgerechnet), x + lvWidths[9] - 2, y + 3.5, { align: 'right' }); x += lvWidths[9];
    doc.text(row.modus, x, y + 3.5); x += lvWidths[10];
    doc.text(row.faelligZum.substring(0, 10), x, y + 3.5);

    blSum += row.abgerechnet;
    y += 5;
  });

  // BL Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Leben:', ML + 2, y + 3);
  doc.text(formatEuro(blSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Alpha Rente
  drawSubsectionHeader('Alpha Rente (AR)');
  drawTableHeader(lvHeaders, lvWidths);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  let glSum = 0;
  lvAbschlussData.alphaRente.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(COLOR_TABLE_ALT[0], COLOR_TABLE_ALT[1], COLOR_TABLE_ALT[2]);
      doc.rect(ML, y, CW, 5, 'F');
    }

    doc.setTextColor(COLOR_GRAY_DARK[0], COLOR_GRAY_DARK[1], COLOR_GRAY_DARK[2]);
    let x = ML + 1;
    doc.text(row.vn.substring(0, 12), x, y + 3.5); x += lvWidths[0];
    doc.text(row.vsNr.substring(0, 14), x, y + 3.5); x += lvWidths[1];
    doc.text(row.tarif.substring(0, 14), x, y + 3.5); x += lvWidths[2];
    doc.text(row.antragsDatum, x, y + 3.5); x += lvWidths[3];
    doc.text(row.vtsDatum, x, y + 3.5); x += lvWidths[4];
    doc.text(formatEuro(row.basis), x + lvWidths[5] - 2, y + 3.5, { align: 'right' }); x += lvWidths[5];
    doc.text(row.provArt, x, y + 3.5); x += lvWidths[6];
    doc.text(row.satz, x, y + 3.5); x += lvWidths[7];
    doc.text(formatEuro(row.gesamtBetrag), x + lvWidths[8] - 2, y + 3.5, { align: 'right' }); x += lvWidths[8];
    doc.text(formatEuro(row.abgerechnet), x + lvWidths[9] - 2, y + 3.5, { align: 'right' }); x += lvWidths[9];
    doc.text(row.modus, x, y + 3.5); x += lvWidths[10];
    doc.text(row.faelligZum.substring(0, 10), x, y + 3.5);

    glSum += row.abgerechnet;
    y += 5;
  });

  // GL Summe
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Summe Alpha Rente:', ML + 2, y + 3);
  doc.text(formatEuro(glSum) + ' EUR', ML + CW - 5, y + 3, { align: 'right' });
  y += 8;

  // Gesamtsumme LV Abschluss
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SUMME LV ABSCHLUSSPROVISIONEN', ML + 5, y + 5);
  doc.text(formatEuro(blSum + glSum) + ' EUR', ML + CW - 5, y + 5, { align: 'right' });

  doc.setFontSize(6);
  doc.setTextColor(COLOR_GRAY_LIGHT[0], COLOR_GRAY_LIGHT[1], COLOR_GRAY_LIGHT[2]);
  y += 12;
  doc.text('* Sortierung: aufsteigend nach Versicherungsnehmer', ML, y);
  doc.text('** Modus: Prozentsatz der jährlichen Ratenzahlung (z.B. 20% = 5 Jahre Ratenzahlung)', ML, y + 4);

  drawFooter();

  return doc.output('blob');
}

export { generateVergütungsnachweise as generateComprehensiveVergütungsnachweise };
