import jsPDF from 'jspdf';
import type { Transaction, TransactionExplanation } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { DEMO_TRANSACTIONS } from '../data/demoData';

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

// Mapping for art codes based on provisionsart
const PROVISIONSART_TO_ARTCODE: Record<string, { art: string; artCode: string }> = {
  'Abschluss': { art: 'Neugeschäft', artCode: 'AP' },
  'Bestand': { art: 'Bestand', artCode: 'BP' },
  'Storno': { art: 'Storno', artCode: 'ST' },
  'Dynamik': { art: 'Dynamik', artCode: 'DYN' },
  'Nachprovision': { art: 'Nachprovision', artCode: 'NP' },
  'Rückabrechnung': { art: 'Rückabrechnung', artCode: 'RA' },
  'Beitragserhöhung': { art: 'Beitragserhöhung', artCode: 'BE' },
  'Sonstig': { art: 'Sonstig', artCode: 'SO' }
};

// Mapping sparte to display name
const SPARTE_DISPLAY: Record<string, string> = {
  'KV': 'PKV',
  'SHUK': 'Sach',
  'LV': 'Leben',
  'Kfz': 'Kfz'
};

// Mapping sparte to gesellschaft
const SPARTE_GESELLSCHAFT: Record<string, string> = {
  'KV': 'Alpha Versicherung',
  'SHUK': 'Alpha Versicherung',
  'LV': 'Alpha Versicherung',
  'Kfz': 'Alpha Versicherung'
};

/**
 * Converts DEMO_TRANSACTIONS to SampleTx format for PDF generation
 */
function getSampleTransactions(): SampleTx[] {
  return DEMO_TRANSACTIONS.slice(0, 15).map(tx => {
    const artInfo = PROVISIONSART_TO_ARTCODE[tx.provisionsart] || { art: 'Sonstig', artCode: 'SO' };
    const sparte = tx.sparte || 'LV';
    const beitrag = tx.beitrag || 0;
    const bewertungssumme = tx.bewertungssumme || beitrag * 12;

    // Calculate rate string based on transaction type
    let satz = '';
    let basis = beitrag;
    if (sparte === 'LV' && tx.provisionsart === 'Abschluss') {
      satz = '15‰';
      basis = bewertungssumme;
    } else if (sparte === 'KV' && tx.provisionsart === 'Abschluss') {
      satz = '5,25 MB';
      basis = beitrag * 0.9; // VAG-bereinigt
    } else if (sparte === 'SHUK' && tx.provisionsart === 'Abschluss') {
      satz = '40%';
      basis = beitrag / 1.19; // ohne VSt
    } else if (sparte === 'Kfz') {
      satz = '7%';
      basis = beitrag / 1.19;
    } else if (tx.provisionsart === 'Bestand') {
      satz = '1,5%';
      basis = beitrag * 12;
    } else if (tx.provisionsart === 'Dynamik') {
      satz = '23‰';
      basis = bewertungssumme;
    } else if (tx.provisionsart === 'Storno') {
      satz = 'PRT';
      basis = Math.abs(tx.provisionsbetrag) * 2;
    } else {
      satz = 'var.';
      basis = beitrag;
    }

    // Stornoreserve only for Abschluss
    const sr = tx.provisionsart === 'Abschluss' && tx.provisionsbetrag > 0
      ? Math.round(tx.provisionsbetrag * 0.1 * 100) / 100
      : 0;

    return {
      datum: tx.datum,
      vsnr: tx.vertragsnummer,
      kunde: tx.kundenname || 'Unbekannt',
      gesellschaft: SPARTE_GESELLSCHAFT[sparte] || 'Alpha Versicherung',
      produkt: tx.produktart.substring(0, 25),
      sparte: SPARTE_DISPLAY[sparte] || sparte,
      art: artInfo.art,
      artCode: artInfo.artCode,
      beitrag: Math.round(beitrag),
      basis: Math.round(basis),
      satz,
      provision: tx.provisionsbetrag,
      sr
    };
  });
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
 * Im Querformat (Landscape) für alle Spalten
 */
export function generateSampleProvisionStatement(): Blob {
  // Querformat für mehr Platz
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const transactions = getSampleTransactions();

  // Landscape: 297mm breit, 210mm hoch
  const PAGE_W = 297;
  const PAGE_H = 210;
  const ML = 12; // Margin Left
  const MR = 12; // Margin Right
  const MT = 12; // Margin Top
  const CW = PAGE_W - ML - MR; // Content Width = 273mm

  let y = MT;

  // ===== SEITE 1: KOPFBEREICH =====

  // Pool-Logo/Name (links oben)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(POOL.name, ML, y);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`${POOL.strasse} · ${POOL.plz} ${POOL.ort} · Tel: ${POOL.tel}`, ML, y + 5);

  // Dokumenttyp (rechts oben)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('PROVISIONSABRECHNUNG', PAGE_W - MR, y + 2, { align: 'right' });

  y += 14;

  // Trennlinie
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PAGE_W - MR, y);

  y += 6;

  // Empfänger-Block (links)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(ML, y, 90, 28, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text('Empfänger', ML + 3, y + 4);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text(VERMITTLER.firma, ML + 3, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${VERMITTLER.strasse}, ${VERMITTLER.plz} ${VERMITTLER.ort}`, ML + 3, y + 14);

  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`Vermittler-Nr: ${VERMITTLER.vermittlerNr} | IHK: ${VERMITTLER.ihkNr}`, ML + 3, y + 19);
  doc.text(`IBAN: ${VERMITTLER.iban}`, ML + 3, y + 24);

  // Abrechnungsdaten (Mitte-rechts)
  const rightCol = 120;
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GRAY_DARK);

  const labels = ['Abrechnungsnummer:', 'Abrechnungszeitraum:', 'Erstellungsdatum:', 'Fälligkeitsdatum:'];
  const values = ['2024-11-00042', '01.11.2024 - 30.11.2024', '05.12.2024', '19.12.2024'];

  labels.forEach((label, i) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, rightCol, y + 4 + (i * 5));
    doc.setFont('helvetica', 'bold');
    doc.text(values[i], rightCol + 42, y + 4 + (i * 5));
  });

  y += 34;

  // ===== SPALTENLEGENDE =====
  doc.setFillColor(255, 251, 235); // Leichtes Gelb
  doc.roundedRect(ML, y, CW, 12, 1, 1, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(ML, y, CW, 12, 1, 1, 'S');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 53, 15); // Amber-900
  doc.text('Spaltenlegende:', ML + 3, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  const legendText = [
    'VS-Nr = Versicherungsschein-Nummer | Sparte: PKV=Kranken, Leben=Lebensversicherung, Sach=Sachversicherung, Kfz=Kraftfahrzeug',
    'Art: AP=Abschlussprovision, BP=Bestandsprovision, ST=Storno, DYN=Dynamik, NP=Nachprovision | Basis = Berechnungsgrundlage (z.B. BWS oder Beitrag)',
    'Satz = Provisionssatz (‰=Promille, MB=Monatsbeiträge, %=Prozent) | SR = Stornoreserve (10% Einbehalt bei Neugeschäft)'
  ];
  legendText.forEach((line, idx) => {
    doc.text(line, ML + 3, y + 7 + (idx * 2.5));
  });

  y += 16;

  // ===== TRANSAKTIONS-TABELLE (LANDSCAPE MIT ALLEN SPALTEN) =====

  // Tabellenkopf
  doc.setFillColor(...COLOR_TABLE_HEADER);
  doc.rect(ML, y, CW, 7, 'F');

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);

  // Spalten für Landscape (273mm Breite) - 12 Spalten - optimierte Breiten
  // Total: 20+26+28+26+40+16+14+22+26+18+26+18 = 280 (passt bei 273mm wenn x-Offset berücksichtigt)
  const cols = [
    { x: ML + 1, header: 'Datum', w: 19 },
    { x: ML + 20, header: 'VS-Nr', w: 25 },
    { x: ML + 46, header: 'Kunde', w: 27 },
    { x: ML + 74, header: 'Gesellschaft', w: 25 },
    { x: ML + 100, header: 'Produkt', w: 38 },
    { x: ML + 139, header: 'Sparte', w: 15 },
    { x: ML + 155, header: 'Art', w: 13 },
    { x: ML + 169, header: 'Beitrag €', w: 21 },
    { x: ML + 191, header: 'Basis €', w: 25 },
    { x: ML + 217, header: 'Satz', w: 17 },
    { x: ML + 235, header: 'Provision €', w: 25 },
    { x: ML + 261, header: 'SR €', w: 17 },
  ];

  cols.forEach(col => {
    doc.text(col.header, col.x, y + 4.5);
  });

  y += 7;

  // Trennlinie unter Header
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(ML, y, PAGE_W - MR, y);

  // Transaktionszeilen
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);

  let rowIndex = 0;
  transactions.forEach((tx) => {
    // Seitenumbruch prüfen (Landscape: Höhe 210mm, unten ~15mm Platz lassen)
    if (y > PAGE_H - 20) {
      doc.addPage();
      y = MT;

      // Header auf neuer Seite wiederholen
      doc.setFillColor(...COLOR_TABLE_HEADER);
      doc.rect(ML, y, CW, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...COLOR_GRAY_DARK);
      cols.forEach(col => {
        doc.text(col.header, col.x, y + 4.5);
      });
      y += 7;
      doc.setLineWidth(0.2);
      doc.line(ML, y, PAGE_W - MR, y);
      doc.setFont('helvetica', 'normal');
      rowIndex = 0;
    }

    // Alternierende Zeilenfarbe
    if (rowIndex % 2 === 1) {
      doc.setFillColor(...COLOR_TABLE_ALT);
      doc.rect(ML, y, CW, 6, 'F');
    }

    doc.setTextColor(...COLOR_GRAY_DARK);
    doc.setFontSize(6);

    // Alle 12 Spalten mit Daten füllen (angepasste Zeichenlängen)
    doc.text(tx.datum, cols[0].x, y + 4);
    doc.text(tx.vsnr.substring(0, 14), cols[1].x, y + 4);
    doc.text(tx.kunde.substring(0, 16), cols[2].x, y + 4);
    doc.text(tx.gesellschaft.substring(0, 15), cols[3].x, y + 4);
    doc.text(tx.produkt.substring(0, 22), cols[4].x, y + 4);
    doc.text(tx.sparte, cols[5].x, y + 4);
    doc.text(tx.artCode, cols[6].x, y + 4);

    // Beitrag rechtsbündig
    doc.text(tx.beitrag.toLocaleString('de-DE'), cols[7].x + cols[7].w - 2, y + 4, { align: 'right' });

    // Basis rechtsbündig
    const basisStr = tx.basis >= 1000 ? Math.round(tx.basis).toLocaleString('de-DE') : tx.basis.toFixed(0);
    doc.text(basisStr, cols[8].x + cols[8].w - 2, y + 4, { align: 'right' });

    // Satz
    doc.text(tx.satz, cols[9].x, y + 4);

    // Provision rechtsbündig (rot wenn negativ)
    if (tx.provision < 0) {
      doc.setTextColor(...COLOR_RED);
    }
    doc.text(formatEuroShort(tx.provision), cols[10].x + cols[10].w - 2, y + 4, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);

    // SR (Stornoreserve) rechtsbündig
    if (tx.sr > 0) {
      doc.text(formatEuroShort(tx.sr), cols[11].x + cols[11].w - 2, y + 4, { align: 'right' });
    } else {
      doc.text('-', cols[11].x + cols[11].w - 6, y + 4, { align: 'right' });
    }

    y += 6;
    rowIndex++;
  });

  // Summenzeile
  y += 2;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PAGE_W - MR, y);

  const bruttoSumme = transactions.reduce((sum, tx) => sum + tx.provision, 0);
  const srSumme = transactions.reduce((sum, tx) => sum + tx.sr, 0);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Brutto-Provision gesamt:', ML + 2, y);
  doc.text(formatEuro(bruttoSumme), cols[10].x + cols[10].w - 2, y, { align: 'right' });
  doc.text('SR gesamt:', cols[11].x - 15, y);
  doc.text(formatEuro(srSumme), cols[11].x + cols[11].w - 2, y, { align: 'right' });

  // ===== SEITE 2: ÜBERSICHTEN (auch Landscape) =====
  doc.addPage();
  y = MT;

  // Header Seite 2
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('PROVISIONSABRECHNUNG 2024-11-00042 – Übersichten', ML, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text('Seite 2 von 2', PAGE_W - MR, y, { align: 'right' });

  y += 8;
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 10;

  // Layout: Drei Spalten nebeneinander für mehr Platz im Landscape

  // ===== LINKE SPALTE: SPARTENÜBERSICHT =====
  const leftCol = ML;
  let yLeft = y;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Übersicht nach Sparten', leftCol, yLeft);
  yLeft += 6;

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
  doc.rect(leftCol, yLeft, 130, 6, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const sparteCols = [
    { x: leftCol + 2, header: 'Sparte', w: 28 },
    { x: leftCol + 32, header: 'Neugeschäft', w: 22 },
    { x: leftCol + 56, header: 'Bestand', w: 22 },
    { x: leftCol + 80, header: 'Storno', w: 20 },
    { x: leftCol + 102, header: 'Dynamik', w: 20 },
    { x: leftCol + 124, header: 'Summe', w: 22 },
  ];

  sparteCols.forEach(col => {
    doc.text(col.header, col.x, yLeft + 4);
  });
  yLeft += 6;

  doc.setFont('helvetica', 'normal');
  Object.entries(spartenSummen).forEach(([sparte, sums], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(...COLOR_TABLE_ALT);
      doc.rect(leftCol, yLeft, 130, 5, 'F');
    }

    const total = sums.ng + sums.bs + sums.st + sums.dyn;
    doc.setTextColor(...COLOR_GRAY_DARK);
    doc.text(sparte, sparteCols[0].x, yLeft + 3.5);
    doc.text(formatEuroShort(sums.ng), sparteCols[1].x + 20, yLeft + 3.5, { align: 'right' });
    doc.text(formatEuroShort(sums.bs), sparteCols[2].x + 20, yLeft + 3.5, { align: 'right' });

    if (sums.st < 0) doc.setTextColor(...COLOR_RED);
    doc.text(formatEuroShort(sums.st), sparteCols[3].x + 18, yLeft + 3.5, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);

    doc.text(formatEuroShort(sums.dyn), sparteCols[4].x + 18, yLeft + 3.5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatEuroShort(total), sparteCols[5].x + 20, yLeft + 3.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    yLeft += 5;
  });

  yLeft += 10;

  // ===== MITTLERE SPALTE: STORNORESERVE-KONTO =====
  const midCol = 160;
  let yMid = y;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Stornoreserve-Konto', midCol, yMid);
  yMid += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const srRows = [
    { label: 'Saldovortrag (01.11.2024)', value: 8500.00 },
    { label: '+ Zuführung (10% der AP)', value: srSumme },
    { label: '– Auflösung (fällige Verträge)', value: -420.00 },
    { label: '– Verrechnung (Stornos)', value: -185.00 },
  ];

  srRows.forEach(row => {
    doc.text(row.label, midCol + 2, yMid);
    doc.text(formatEuro(row.value), midCol + 70, yMid, { align: 'right' });
    yMid += 5;
  });

  // Summenzeile SR
  doc.setDrawColor(150, 150, 150);
  doc.line(midCol, yMid - 1, midCol + 75, yMid - 1);
  const srSaldo = 8500 + srSumme - 420 - 185;
  doc.setFont('helvetica', 'bold');
  doc.text('= Saldo neu (30.11.2024)', midCol + 2, yMid + 3);
  doc.text(formatEuro(srSaldo), midCol + 70, yMid + 3, { align: 'right' });

  yMid += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.setFontSize(7);
  doc.text('Fällig in 12 Monaten: 650,00 €', midCol + 2, yMid);

  // ===== RECHTE SPALTE: KONTOAUSZUG =====
  const rightColX = 245;
  let yRight = y;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY_DARK);
  doc.text('Abrechnungssaldo', rightColX, yRight);
  yRight += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const kontoRows = [
    { label: 'Saldovortrag', value: 250.00 },
    { label: '+ Brutto-Provision', value: bruttoSumme },
    { label: '– SR-Zuführung (10%)', value: -srSumme },
    { label: '+ SR-Auflösung', value: 420.00 },
    { label: '– Vorschuss-Tilgung', value: -300.00 },
  ];

  kontoRows.forEach(row => {
    doc.text(row.label, rightColX + 2, yRight);
    const val = row.value;
    if (val < 0) doc.setTextColor(...COLOR_RED);
    doc.text(formatEuro(val), PAGE_W - MR, yRight, { align: 'right' });
    doc.setTextColor(...COLOR_GRAY_DARK);
    yRight += 5;
  });

  // Zwischensumme
  yRight += 2;
  doc.setDrawColor(150, 150, 150);
  doc.line(rightColX, yRight - 1, PAGE_W - MR, yRight - 1);

  const zwischensumme = 250 + bruttoSumme - srSumme + 420 - 300;
  doc.setFont('helvetica', 'bold');
  doc.text('= Auszahlung', rightColX + 2, yRight + 3);
  doc.text(formatEuro(zwischensumme), PAGE_W - MR, yRight + 3, { align: 'right' });

  // ===== AUSZAHLUNGSBETRAG (unten) =====
  y = Math.max(yLeft, yMid) + 15;

  doc.setFillColor(...COLOR_PRIMARY);
  doc.roundedRect(ML, y, CW, 14, 2, 2, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('AUSZAHLUNGSBETRAG', ML + 10, y + 9);
  doc.setFontSize(14);
  doc.text(formatEuro(zwischensumme), PAGE_W - MR - 10, y + 9, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Zahlungsdatum: 19.12.2024  |  Konto: ${VERMITTLER.iban}`, ML + 100, y + 9);

  // ===== RECHTLICHE HINWEISE =====
  y += 22;
  doc.setDrawColor(220, 220, 220);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 5;

  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Courtagen für Versicherungsvermittlung sind gemäß § 4 Nr. 11 UStG umsatzsteuerfrei. ' +
    'Die Stornohaftungszeit beträgt gemäß § 49 VAG 60 Monate für Leben und PKV. ' +
    'Einsprüche gegen diese Abrechnung sind innerhalb von 6 Wochen schriftlich einzureichen. ' +
    'Aufbewahrungspflicht gemäß § 257 HGB: 10 Jahre.',
    ML, y, { maxWidth: CW }
  );

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_GRAY_LIGHT);
  doc.text(`${POOL.name} · ${POOL.strasse} · ${POOL.plz} ${POOL.ort}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });

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
