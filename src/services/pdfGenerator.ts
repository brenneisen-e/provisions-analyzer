import jsPDF from 'jspdf';
import type { Transaction, TransactionExplanation } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

// Konstanten für Layout
const PAGE_WIDTH = 210;
const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;
const MARGIN_TOP = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Farben
const COLOR_PRIMARY = [0, 82, 147] as const; // Dunkelblau
const COLOR_GRAY_DARK = [60, 60, 60] as const;
const COLOR_GRAY_LIGHT = [120, 120, 120] as const;
const COLOR_RED = [180, 0, 0] as const;
const COLOR_TABLE_HEADER = [240, 244, 248] as const;
const COLOR_TABLE_ALT = [250, 251, 252] as const;

// Vermittler-Stammdaten
const VERMITTLER = {
  firma: 'Mustermann Versicherungsmakler GmbH',
  strasse: 'Finanzplatz 15',
  plz: '60311',
  ort: 'Frankfurt am Main',
  vermittlerNr: 'AMNR-12345',
  ihkNr: 'D-F0M1-XXXXX-12',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'COBADEFFXXX'
};

// Pool-Daten
const POOL = {
  name: 'FinanzPartner Maklerpool AG',
  strasse: 'Poolstraße 100',
  plz: '80333',
  ort: 'München',
  tel: '089 / 123 456-0',
  email: 'abrechnung@finanzpartner-pool.de'
};

// Sample Transaktionen
interface SampleTx {
  datum: string;
  vsnr: string;
  kunde: string;
  gesellschaft: string;
  produkt: string;
  sparte: string;
  art: string;
  artCode: string;
  beitrag: number;
  basis: number;
  satz: string;
  provision: number;
  sr: number;
}

function getSampleTransactions(): SampleTx[] {
  return [
    { datum: '05.11.2024', vsnr: '451-464353-2', kunde: 'Müller, M.', gesellschaft: 'Allianz', produkt: 'PrivatRente Perspektive', sparte: 'Leben', art: 'Neugeschäft', artCode: 'AP', beitrag: 1800, basis: 63000, satz: '40‰', provision: 2520.00, sr: 252.00 },
    { datum: '08.11.2024', vsnr: '782-145678-9', kunde: 'Schmidt, K.', gesellschaft: 'DKV', produkt: 'KomfortMed Premium', sparte: 'PKV', art: 'Neugeschäft', artCode: 'AP', beitrag: 5820, basis: 3527, satz: '8 MB', provision: 3527.27, sr: 352.73 },
    { datum: '10.11.2024', vsnr: '552-378945-6', kunde: 'Weber, S.', gesellschaft: 'Nürnberger', produkt: 'BU-Schutz Plus', sparte: 'Leben', art: 'Neugeschäft', artCode: 'AP', beitrag: 1068, basis: 32040, satz: '45‰', provision: 1441.80, sr: 144.18 },
    { datum: '12.11.2024', vsnr: '991-234567-8', kunde: 'Fischer, A.', gesellschaft: 'AXA', produkt: 'Hausrat Premium', sparte: 'Sach', art: 'Neugeschäft', artCode: 'CTG', beitrag: 222, basis: 187, satz: '20%', provision: 37.31, sr: 0 },
    { datum: '14.11.2024', vsnr: '334-567891-2', kunde: 'Bauer, T.', gesellschaft: 'HUK-COBURG', produkt: 'Kfz-Vollkasko', sparte: 'Kfz', art: 'Neugeschäft', artCode: 'CTG', beitrag: 936, basis: 787, satz: '8%', provision: 62.92, sr: 0 },
    { datum: '15.11.2024', vsnr: '451-234567-8', kunde: 'Hofmann, R.', gesellschaft: 'Alte Leipziger', produkt: 'Fondsgebundene RV', sparte: 'Leben', art: 'Bestand', artCode: 'BP', beitrag: 2400, basis: 2400, satz: '1,5%', provision: 36.00, sr: 0 },
    { datum: '16.11.2024', vsnr: '887-654321-0', kunde: 'Klein, H.', gesellschaft: 'VGH', produkt: 'Wohngebäude Komfort', sparte: 'Sach', art: 'Bestand', artCode: 'CTG', beitrag: 1140, basis: 958, satz: '18%', provision: 172.44, sr: 0 },
    { datum: '18.11.2024', vsnr: '451-098765-4', kunde: 'Braun, E.', gesellschaft: 'Stuttgarter', produkt: 'FlexVorsorge', sparte: 'Leben', art: 'Dynamik', artCode: 'DYN', beitrag: 150, basis: 4800, satz: '40‰', provision: 192.00, sr: 19.20 },
    { datum: '20.11.2024', vsnr: '552-012345-6', kunde: 'Wagner, L.', gesellschaft: 'Swiss Life', produkt: 'BU Select', sparte: 'Leben', art: 'Storno', artCode: 'ST', beitrag: 900, basis: 25200, satz: '40‰', provision: -604.80, sr: 0 },
    { datum: '22.11.2024', vsnr: '665-432109-8', kunde: 'Neumann, J.', gesellschaft: 'Haftpflichtkasse', produkt: 'PHV Exklusiv', sparte: 'Sach', art: 'Neugeschäft', artCode: 'CTG', beitrag: 99, basis: 83, satz: '22%', provision: 18.30, sr: 0 },
    { datum: '24.11.2024', vsnr: '779-876543-2', kunde: 'Zimmermann, P.', gesellschaft: 'DEVK', produkt: 'Unfallschutz Premium', sparte: 'Unfall', art: 'Neugeschäft', artCode: 'CTG', beitrag: 294, basis: 247, satz: '25%', provision: 61.77, sr: 0 },
    { datum: '25.11.2024', vsnr: '782-345678-9', kunde: 'Krause, D.', gesellschaft: 'Barmenia', produkt: 'Zahnzusatz Premium', sparte: 'PKV', art: 'Bestand', artCode: 'BP', beitrag: 384, basis: 384, satz: '0,5%', provision: 1.92, sr: 0 },
    { datum: '27.11.2024', vsnr: '445-678901-2', kunde: 'Schulz, M.', gesellschaft: 'ARAG', produkt: 'Rechtsschutz Komfort', sparte: 'Sach', art: 'Neugeschäft', artCode: 'CTG', beitrag: 336, basis: 282, satz: '20%', provision: 56.47, sr: 0 },
    { datum: '28.11.2024', vsnr: '450-987654-3', kunde: 'Maier, G.', gesellschaft: 'Zurich', produkt: 'Förder-Rente Classic', sparte: 'Leben', art: 'Bestand', artCode: 'FP', beitrag: 2100, basis: 2100, satz: '2%', provision: 42.00, sr: 0 },
    { datum: '29.11.2024', vsnr: '339-876543-2', kunde: 'Richter, B.', gesellschaft: 'Allianz', produkt: 'Kfz-Haftpflicht Plus', sparte: 'Kfz', art: 'Bestand', artCode: 'CTG', beitrag: 624, basis: 524, satz: '6%', provision: 31.46, sr: 0 },
  ];
}

// Hilfsfunktionen
function formatEuro(val: number): string {
  return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatEuroShort(val: number): string {
  return val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Generiert eine professionelle Beispiel-Provisionsabrechnung
 */
export function generateSampleProvisionStatement(): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const transactions = getSampleTransactions();

  let y = MARGIN_TOP;

  // ===== SEITE 1: KOPFBEREICH =====

  // Pool-Logo/Name (links oben)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(POOL.name, MARGIN_LEFT, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`${POOL.strasse} · ${POOL.plz} ${POOL.ort}`, MARGIN_LEFT, y + 4);
  doc.text(`Tel: ${POOL.tel} · ${POOL.email}`, MARGIN_LEFT, y + 8);

  // Dokumenttyp (rechts oben)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('PROVISIONSABRECHNUNG', PAGE_WIDTH - MARGIN_RIGHT, y + 2, { align: 'right' });

  y += 18;

  // Trennlinie
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);

  y += 8;

  // Empfänger-Block (links)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN_LEFT, y, 85, 32, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text('Empfänger', MARGIN_LEFT + 3, y + 4);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text(VERMITTLER.firma, MARGIN_LEFT + 3, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(VERMITTLER.strasse, MARGIN_LEFT + 3, y + 15);
  doc.text(`${VERMITTLER.plz} ${VERMITTLER.ort}`, MARGIN_LEFT + 3, y + 19);

  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`Vermittler-Nr: ${VERMITTLER.vermittlerNr}`, MARGIN_LEFT + 3, y + 25);
  doc.text(`IHK-Register: ${VERMITTLER.ihkNr}`, MARGIN_LEFT + 3, y + 29);

  // Abrechnungsdaten (rechts)
  const rightCol = 115;
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GRAY_DARK);

  const labels = ['Abrechnungsnummer:', 'Abrechnungszeitraum:', 'Erstellungsdatum:', 'Fälligkeitsdatum:'];
  const values = ['2024-11-00042', '01.11.2024 - 30.11.2024', '05.12.2024', '19.12.2024'];

  labels.forEach((label, i) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, rightCol, y + 4 + (i * 5));
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], rightCol + 40, y + 4 + (i * 5));
  });

  y += 40;

  // ===== TRANSAKTIONS-TABELLE =====

  // Tabellenkopf
  doc.setFillColor(...COLOR_TABLE_HEADER);
  doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 8, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);

  // Spalten-Definition: [x-Position, Breite, Ausrichtung, Header]
  const cols = [
    { x: MARGIN_LEFT + 2, header: 'Datum' },
    { x: MARGIN_LEFT + 22, header: 'VS-Nummer' },
    { x: MARGIN_LEFT + 48, header: 'Kunde' },
    { x: MARGIN_LEFT + 72, header: 'Gesellschaft' },
    { x: MARGIN_LEFT + 98, header: 'Sparte' },
    { x: MARGIN_LEFT + 116, header: 'Art' },
    { x: MARGIN_LEFT + 135, header: 'Basis €' },
    { x: MARGIN_LEFT + 152, header: 'Satz' },
    { x: MARGIN_LEFT + 168, header: 'Provision €' },
  ];

  cols.forEach(col => {
    doc.text(col.header, col.x, y + 5.5);
  });

  y += 8;

  // Trennlinie unter Header
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);

  // Transaktionszeilen
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  let rowIndex = 0;
  transactions.forEach((tx) => {
    // Seitenumbruch prüfen
    if (y > 265) {
      doc.addPage();
      y = MARGIN_TOP;

      // Header auf neuer Seite wiederholen
      doc.setFillColor(...COLOR_TABLE_HEADER);
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLOR_GRAY_DARK);
      cols.forEach(col => {
        doc.text(col.header, col.x, y + 5.5);
      });
      y += 8;
      doc.setLineWidth(0.2);
      doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
      doc.setFont('helvetica', 'normal');
      rowIndex = 0;
    }

    // Alternierende Zeilenfarbe
    if (rowIndex % 2 === 1) {
      doc.setFillColor(...COLOR_TABLE_ALT);
      doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 7, 'F');
    }

    doc.setTextColor(...COLOR_GRAY_DARK);

    // Daten eintragen
    doc.text(tx.datum, cols[0].x, y + 5);
    doc.text(tx.vsnr, cols[1].x, y + 5);
    doc.text(tx.kunde.substring(0, 12), cols[2].x, y + 5);
    doc.text(tx.gesellschaft.substring(0, 12), cols[3].x, y + 5);
    doc.text(tx.sparte, cols[4].x, y + 5);
    doc.text(tx.artCode, cols[5].x, y + 5);

    // Basis rechtsbündig
    const basisStr = tx.basis >= 1000 ? Math.round(tx.basis).toLocaleString('de-DE') : tx.basis.toFixed(0);
    doc.text(basisStr, cols[6].x + 14, y + 5, { align: 'right' });

    doc.text(tx.satz, cols[7].x, y + 5);

    // Provision rechtsbündig, rot wenn negativ
    if (tx.provision < 0) {
      doc.setTextColor(...COLOR_RED);
    }
    doc.text(formatEuroShort(tx.provision), cols[8].x + 22, y + 5, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);

    y += 7;
    rowIndex++;
  });

  // Summenzeile
  y += 2;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);

  const bruttoSumme = transactions.reduce((sum, tx) => sum + tx.provision, 0);
  const srSumme = transactions.reduce((sum, tx) => sum + tx.sr, 0);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Brutto-Provision gesamt:', MARGIN_LEFT + 2, y);
  doc.text(formatEuro(bruttoSumme), PAGE_WIDTH - MARGIN_RIGHT - 2, y, { align: 'right' });

  // ===== SEITE 2: ÜBERSICHTEN =====
  doc.addPage();
  y = MARGIN_TOP;

  // Header Seite 2
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('PROVISIONSABRECHNUNG 2024-11-00042', MARGIN_LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text('Seite 2 von 2', PAGE_WIDTH - MARGIN_RIGHT, y, { align: 'right' });

  y += 8;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 10;

  // ===== SPARTENÜBERSICHT =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Übersicht nach Sparten', MARGIN_LEFT, y);
  y += 6;

  // Berechne Sparten-Summen
  const spartenSummen: Record<string, { ng: number; bs: number; st: number; dyn: number }> = {};
  transactions.forEach(tx => {
    if (!spartenSummen[tx.sparte]) {
      spartenSummen[tx.sparte] = { ng: 0, bs: 0, st: 0, dyn: 0 };
    }
    if (tx.artCode === 'AP' || tx.artCode === 'CTG') {
      if (tx.art === 'Neugeschäft') spartenSummen[tx.sparte].ng += tx.provision;
      else spartenSummen[tx.sparte].bs += tx.provision;
    }
    if (tx.artCode === 'BP' || tx.artCode === 'FP') spartenSummen[tx.sparte].bs += tx.provision;
    if (tx.artCode === 'ST') spartenSummen[tx.sparte].st += tx.provision;
    if (tx.artCode === 'DYN') spartenSummen[tx.sparte].dyn += tx.provision;
  });

  // Tabelle Sparten
  doc.setFillColor(...COLOR_TABLE_HEADER);
  doc.rect(MARGIN_LEFT, y, 140, 6, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const sparteCols = [
    { x: MARGIN_LEFT + 2, header: 'Sparte', w: 30 },
    { x: MARGIN_LEFT + 35, header: 'Neugeschäft', w: 25 },
    { x: MARGIN_LEFT + 62, header: 'Bestand', w: 25 },
    { x: MARGIN_LEFT + 89, header: 'Storno', w: 22 },
    { x: MARGIN_LEFT + 113, header: 'Dynamik', w: 22 },
    { x: MARGIN_LEFT + 137, header: 'Summe', w: 25 },
  ];

  sparteCols.forEach(col => {
    doc.text(col.header, col.x, y + 4);
  });
  y += 6;

  doc.setFont('helvetica', 'normal');
  Object.entries(spartenSummen).forEach(([sparte, sums], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(...COLOR_TABLE_ALT);
      doc.rect(MARGIN_LEFT, y, 140, 5, 'F');
    }

    const total = sums.ng + sums.bs + sums.st + sums.dyn;
    doc.setTextColor(...COLOR_GRAY_DARK);
    doc.text(sparte, sparteCols[0].x, y + 3.5);
    doc.text(formatEuroShort(sums.ng), sparteCols[1].x + 23, y + 3.5, { align: 'right' });
    doc.text(formatEuroShort(sums.bs), sparteCols[2].x + 23, y + 3.5, { align: 'right' });

    if (sums.st < 0) doc.setTextColor(...COLOR_RED);
    doc.text(formatEuroShort(sums.st), sparteCols[3].x + 20, y + 3.5, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);

    doc.text(formatEuroShort(sums.dyn), sparteCols[4].x + 20, y + 3.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatEuroShort(total), sparteCols[5].x + 23, y + 3.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 5;
  });

  y += 15;

  // ===== STORNORESERVE-KONTO =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Stornoreserve-Konto', MARGIN_LEFT, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const srRows = [
    { label: 'Saldovortrag (01.11.2024)', value: 8500.00, bold: false },
    { label: '+ Zuführung (10% der AP)', value: srSumme, bold: false },
    { label: '– Auflösung (fällige Verträge)', value: -420.00, bold: false },
    { label: '– Verrechnung (Stornos)', value: -185.00, bold: false },
  ];

  srRows.forEach(row => {
    doc.text(row.label, MARGIN_LEFT + 2, y);
    doc.text(formatEuro(row.value), MARGIN_LEFT + 80, y, { align: 'right' });
    y += 5;
  });

  // Summenzeile SR
  doc.setDrawColor(150, 150, 150);
  doc.line(MARGIN_LEFT, y - 1, MARGIN_LEFT + 85, y - 1);
  const srSaldo = 8500 + srSumme - 420 - 185;
  doc.setFont('helvetica', 'bold');
  doc.text('= Saldo neu (30.11.2024)', MARGIN_LEFT + 2, y + 3);
  doc.text(formatEuro(srSaldo), MARGIN_LEFT + 80, y + 3, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.setFontSize(7);
  doc.text('Fällig in 12 Monaten (zur Information): 650,00 €', MARGIN_LEFT + 2, y);

  y += 20;

  // ===== KONTOAUSZUG =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Kontoauszug / Abrechnungssaldo', MARGIN_LEFT, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const kontoRows = [
    { label: 'Saldovortrag', value: 250.00 },
    { label: '+ Brutto-Provision', value: bruttoSumme },
    { label: '– Stornoreserve-Zuführung (10%)', value: -srSumme },
    { label: '+ Stornoreserve-Auflösung', value: 420.00 },
    { label: '– Vorschuss-Tilgung', value: -300.00 },
    { label: '– Sonstige Abzüge', value: 0.00 },
  ];

  kontoRows.forEach(row => {
    doc.text(row.label, MARGIN_LEFT + 2, y);
    const val = row.value;
    if (val < 0) doc.setTextColor(...COLOR_RED);
    doc.text(formatEuro(val), MARGIN_LEFT + 95, y, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);
    y += 5;
  });

  // Zwischensumme
  y += 2;
  doc.setDrawColor(150, 150, 150);
  doc.line(MARGIN_LEFT, y - 1, MARGIN_LEFT + 100, y - 1);

  const zwischensumme = 250 + bruttoSumme - srSumme + 420 - 300;
  doc.setFont('helvetica', 'bold');
  doc.text('= Zwischensumme', MARGIN_LEFT + 2, y + 3);
  doc.text(formatEuro(zwischensumme), MARGIN_LEFT + 95, y + 3, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('+/– USt (§ 4 Nr. 11 UStG: steuerfrei)', MARGIN_LEFT + 2, y);
  doc.text('0,00 €', MARGIN_LEFT + 95, y, { align: 'right' });

  y += 10;

  // ===== AUSZAHLUNGSBETRAG =====
  doc.setFillColor(...COLOR_PRIMARY);
  doc.roundedRect(MARGIN_LEFT, y, 110, 12, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AUSZAHLUNGSBETRAG', MARGIN_LEFT + 5, y + 8);
  doc.setFontSize(12);
  doc.text(formatEuro(zwischensumme), MARGIN_LEFT + 105, y + 8, { align: 'right' });

  y += 18;
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Zahlungsdatum: 19.12.2024`, MARGIN_LEFT + 2, y);
  doc.text(`Konto: ${VERMITTLER.iban}`, MARGIN_LEFT + 2, y + 5);

  // ===== RECHTLICHE HINWEISE =====
  y += 20;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 6;

  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.setFont('helvetica', 'bold');
  doc.text('Rechtliche Hinweise', MARGIN_LEFT, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  const hinweise = [
    '• Courtagen für Versicherungsvermittlung sind gemäß § 4 Nr. 11 UStG umsatzsteuerfrei.',
    '• Die Stornohaftungszeit beträgt gemäß § 49 VAG 60 Monate für Leben und PKV.',
    '• Einsprüche gegen diese Abrechnung sind innerhalb von 6 Wochen schriftlich einzureichen.',
    '• Aufbewahrungspflicht gemäß § 257 HGB: 10 Jahre.'
  ];

  hinweise.forEach(h => {
    doc.text(h, MARGIN_LEFT, y);
    y += 4;
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`${POOL.name} · ${POOL.strasse} · ${POOL.plz} ${POOL.ort}`, PAGE_WIDTH / 2, 287, { align: 'center' });

  return doc.output('blob');
}

/**
 * Generiert einen Export-Report der analysierten Transaktionen
 */
export function generateAnalysisReport(
  transactions: Transaction[],
  explanations: Map<string, TransactionExplanation>,
  options: {
    filterLowConfidence?: boolean;
    groupByType?: boolean;
    includeCalculations?: boolean;
  } = {}
): Blob {
  const doc = new jsPDF();

  let filteredTransactions = [...transactions];
  if (options.filterLowConfidence) {
    filteredTransactions = filteredTransactions.filter(t => {
      const exp = explanations.get(t.id);
      return exp?.confidence === 'low';
    });
  }

  const grouped = options.groupByType
    ? groupTransactionsByType(filteredTransactions)
    : { 'Alle Transaktionen': filteredTransactions };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Provisionsanalyse Report', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Erstellt am: ${formatDate(new Date().toISOString())}`, 105, 28, { align: 'center' });
  doc.text(`Anzahl Transaktionen: ${filteredTransactions.length}`, 105, 35, { align: 'center' });

  let yPos = 50;

  for (const [groupName, groupTransactions] of Object.entries(grouped)) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(groupName, 20, yPos);
    yPos += 10;

    for (const transaction of groupTransactions) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const explanation = explanations.get(transaction.id);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${transaction.vertragsnummer} - ${transaction.produktart}`, 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(transaction.datum), 150, yPos);
      doc.text(formatCurrency(transaction.provisionsbetrag), 175, yPos);
      yPos += 6;

      if (explanation) {
        const confidenceText = {
          high: 'Konfidenz: Hoch',
          medium: 'Konfidenz: Mittel',
          low: 'Konfidenz: Niedrig'
        }[explanation.confidence];

        doc.setFontSize(8);
        doc.text(confidenceText, 20, yPos);
        yPos += 5;

        const explanationLines = doc.splitTextToSize(explanation.explanation, 160);
        doc.text(explanationLines, 20, yPos);
        yPos += explanationLines.length * 4;

        if (options.includeCalculations && explanation.calculation) {
          doc.setFont('helvetica', 'italic');
          const calcLines = doc.splitTextToSize(`Berechnung: ${explanation.calculation}`, 160);
          doc.text(calcLines, 20, yPos);
          yPos += calcLines.length * 4;
          doc.setFont('helvetica', 'normal');
        }

        if (explanation.notes) {
          doc.setTextColor(100, 100, 100);
          const notesLines = doc.splitTextToSize(`Hinweis: ${explanation.notes}`, 160);
          doc.text(notesLines, 20, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += notesLines.length * 4;
        }
      }

      yPos += 8;
      doc.setDrawColor(230, 230, 230);
      doc.line(20, yPos - 4, 190, yPos - 4);
    }

    yPos += 5;
  }

  return doc.output('blob');
}

function groupTransactionsByType(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const key = t.provisionsart || 'Sonstig';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
