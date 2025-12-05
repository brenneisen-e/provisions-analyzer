import jsPDF from 'jspdf';
import type { Transaction, TransactionExplanation } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

// Vermittler-Stammdaten für Musterabrechnung
const SAMPLE_VERMITTLER = {
  name: 'Mustermann Versicherungsmakler GmbH',
  inhaber: 'Max Mustermann',
  strasse: 'Finanzplatz 15',
  plz: '60311',
  ort: 'Frankfurt am Main',
  vermittlerNr: 'AMNR 12345',
  ihkRegisterNr: 'D-F0M1-XXXXX-12',
  vermittlerStatus: 'VM', // Versicherungsmakler
  steuernummer: '045/123/45678',
  ustIdNr: 'DE123456789',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'COBADEFFXXX',
  hierarchiestufe: 'HV', // Hauptvermittler
  courtagetabelle: 'Makler-Standard 2024',
  beteiligungssatz: '100%'
};

// Realistische Sample-Transaktionen nach Branchenstandard
interface SampleTransaction {
  buchungsDatum: string;
  vertragsNr: string;
  vsNummer: string;
  kunde: string;
  spartenCode: string;
  spartenBez: string;
  gesellschaft: string;
  produkt: string;
  tarif: string;
  vsBeginn: string;
  laufzeit: number;
  zahlweise: number;
  monatsBeitrag: number;
  jahresBeitrag: number;
  bewertungssumme: number;
  provisionsArt: string;
  buchungsArt: string;
  provisionsSatz: number;
  provisionsBetrag: number;
  stornoreserveEinbehalt: number;
  haftungsBeginn: string;
  haftungsEnde: string;
}

function generateSampleTransactions(): SampleTransaction[] {
  return [
    // Lebensversicherung - Neugeschäft (AP)
    {
      buchungsDatum: '05.11.2024',
      vertragsNr: '4514643532-001',
      vsNummer: 'VS-2024-0001234',
      kunde: 'Müller, M.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Allianz',
      produkt: 'PrivatRente Perspektive',
      tarif: 'PVN',
      vsBeginn: '01.12.2024',
      laufzeit: 35,
      zahlweise: 12,
      monatsBeitrag: 150.00,
      jahresBeitrag: 1800.00,
      bewertungssumme: 63000.00, // 150 × 12 × 35
      provisionsArt: 'AP',
      buchungsArt: 'NG',
      provisionsSatz: 40.0, // 40‰
      provisionsBetrag: 2520.00, // 63000 × 0.040
      stornoreserveEinbehalt: 252.00, // 10%
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2029'
    },
    // PKV - Neugeschäft
    {
      buchungsDatum: '08.11.2024',
      vertragsNr: '7821456789-001',
      vsNummer: 'VS-2024-0001456',
      kunde: 'Schmidt, K.',
      spartenCode: '020',
      spartenBez: '(Kranken)',
      gesellschaft: 'DKV',
      produkt: 'KomfortMed Premium',
      tarif: 'KMP-2024',
      vsBeginn: '01.01.2025',
      laufzeit: 25,
      zahlweise: 12,
      monatsBeitrag: 485.00,
      jahresBeitrag: 5820.00,
      bewertungssumme: 3527.27, // (485/1.10) × 8 MB
      provisionsArt: 'AP',
      buchungsArt: 'NG',
      provisionsSatz: 8.0, // 8 Monatsbeiträge
      provisionsBetrag: 3527.27,
      stornoreserveEinbehalt: 352.73,
      haftungsBeginn: '01.01.2025',
      haftungsEnde: '31.12.2029'
    },
    // BU-Versicherung - Neugeschäft
    {
      buchungsDatum: '10.11.2024',
      vertragsNr: '5523789456-001',
      vsNummer: 'VS-2024-0001567',
      kunde: 'Weber, S.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Nürnberger',
      produkt: 'BU-Schutz Plus',
      tarif: 'BU-Plus',
      vsBeginn: '01.12.2024',
      laufzeit: 30,
      zahlweise: 12,
      monatsBeitrag: 89.00,
      jahresBeitrag: 1068.00,
      bewertungssumme: 32040.00, // 89 × 12 × 30
      provisionsArt: 'AP',
      buchungsArt: 'NG',
      provisionsSatz: 45.0, // 45‰
      provisionsBetrag: 1441.80,
      stornoreserveEinbehalt: 144.18,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2029'
    },
    // Sachversicherung - Hausrat (Courtage)
    {
      buchungsDatum: '12.11.2024',
      vertragsNr: '9912345678-001',
      vsNummer: 'VS-2024-0001678',
      kunde: 'Fischer, A.',
      spartenCode: '050',
      spartenBez: '(SHUK)',
      gesellschaft: 'AXA',
      produkt: 'Hausrat Premium',
      tarif: 'HR-P-550',
      vsBeginn: '01.12.2024',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 18.50,
      jahresBeitrag: 222.00,
      bewertungssumme: 186.55, // Netto (÷1.19)
      provisionsArt: 'CTG',
      buchungsArt: 'NG',
      provisionsSatz: 20.0, // 20%
      provisionsBetrag: 37.31,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2025'
    },
    // Kfz-Versicherung - Neugeschäft
    {
      buchungsDatum: '14.11.2024',
      vertragsNr: '3345678912-001',
      vsNummer: 'VS-2024-0001789',
      kunde: 'Bauer, T.',
      spartenCode: '040',
      spartenBez: '(Kfz)',
      gesellschaft: 'HUK-COBURG',
      produkt: 'Kfz-Vollkasko Classic',
      tarif: 'VK-CL',
      vsBeginn: '01.12.2024',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 78.00,
      jahresBeitrag: 936.00,
      bewertungssumme: 786.55, // Netto
      provisionsArt: 'CTG',
      buchungsArt: 'NG',
      provisionsSatz: 8.0, // 8% (Kfz niedriger)
      provisionsBetrag: 62.92,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2025'
    },
    // Lebensversicherung - Bestandsprovision
    {
      buchungsDatum: '15.11.2024',
      vertragsNr: '4512345678-001',
      vsNummer: 'VS-2022-0000456',
      kunde: 'Hofmann, R.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Alte Leipziger',
      produkt: 'Fondsgebundene RV',
      tarif: 'FR21',
      vsBeginn: '01.03.2022',
      laufzeit: 35,
      zahlweise: 12,
      monatsBeitrag: 200.00,
      jahresBeitrag: 2400.00,
      bewertungssumme: 2400.00, // JB als Basis für BP
      provisionsArt: 'BP',
      buchungsArt: 'BS',
      provisionsSatz: 1.5, // 1,5%
      provisionsBetrag: 36.00,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '',
      haftungsEnde: ''
    },
    // Wohngebäude - Bestand
    {
      buchungsDatum: '16.11.2024',
      vertragsNr: '8876543210-001',
      vsNummer: 'VS-2021-0000234',
      kunde: 'Klein, H.',
      spartenCode: '050',
      spartenBez: '(SHUK)',
      gesellschaft: 'VGH',
      produkt: 'Wohngebäude Komfort',
      tarif: 'WG-K',
      vsBeginn: '01.07.2021',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 95.00,
      jahresBeitrag: 1140.00,
      bewertungssumme: 957.98, // Netto
      provisionsArt: 'CTG',
      buchungsArt: 'BS',
      provisionsSatz: 18.0, // 18%
      provisionsBetrag: 172.44,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '',
      haftungsEnde: ''
    },
    // Dynamikerhöhung Leben
    {
      buchungsDatum: '18.11.2024',
      vertragsNr: '4510987654-001',
      vsNummer: 'VS-2020-0000789',
      kunde: 'Braun, E.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Stuttgarter',
      produkt: 'FlexVorsorge',
      tarif: 'FV-Dyn',
      vsBeginn: '01.04.2020',
      laufzeit: 32, // Restlaufzeit
      zahlweise: 12,
      monatsBeitrag: 12.50, // Erhöhungsbetrag
      jahresBeitrag: 150.00,
      bewertungssumme: 4800.00, // 12.50 × 12 × 32
      provisionsArt: 'DYN',
      buchungsArt: 'DY',
      provisionsSatz: 40.0, // 40‰
      provisionsBetrag: 192.00,
      stornoreserveEinbehalt: 19.20,
      haftungsBeginn: '01.11.2024',
      haftungsEnde: '31.10.2029'
    },
    // STORNO - BU Versicherung
    {
      buchungsDatum: '20.11.2024',
      vertragsNr: '5520123456-001',
      vsNummer: 'VS-2023-0000567',
      kunde: 'Wagner, L.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Swiss Life',
      produkt: 'Berufsunfähigkeit Select',
      tarif: 'BU-SEL',
      vsBeginn: '01.08.2023',
      laufzeit: 28,
      zahlweise: 12,
      monatsBeitrag: 75.00,
      jahresBeitrag: 900.00,
      bewertungssumme: 25200.00,
      provisionsArt: 'SP', // Stornoprovision
      buchungsArt: 'ST',
      provisionsSatz: 40.0,
      provisionsBetrag: -604.80, // Rückforderung (60-16)/60 der AP
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.08.2023',
      haftungsEnde: '31.07.2028'
    },
    // Haftpflicht - Neugeschäft
    {
      buchungsDatum: '22.11.2024',
      vertragsNr: '6654321098-001',
      vsNummer: 'VS-2024-0001890',
      kunde: 'Neumann, J.',
      spartenCode: '050',
      spartenBez: '(SHUK)',
      gesellschaft: 'Haftpflichtkasse',
      produkt: 'PHV Exklusiv',
      tarif: 'PHV-EX',
      vsBeginn: '01.12.2024',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 8.25,
      jahresBeitrag: 99.00,
      bewertungssumme: 83.19, // Netto
      provisionsArt: 'CTG',
      buchungsArt: 'NG',
      provisionsSatz: 22.0, // 22%
      provisionsBetrag: 18.30,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2025'
    },
    // Unfallversicherung
    {
      buchungsDatum: '24.11.2024',
      vertragsNr: '7798765432-001',
      vsNummer: 'VS-2024-0001901',
      kunde: 'Zimmermann, P.',
      spartenCode: '030',
      spartenBez: '(Unfall)',
      gesellschaft: 'DEVK',
      produkt: 'UnfallSchutz Premium',
      tarif: 'USP-24',
      vsBeginn: '01.12.2024',
      laufzeit: 1,
      zahlweise: 12,
      monatsBeitrag: 24.50,
      jahresBeitrag: 294.00,
      bewertungssumme: 247.06, // Netto
      provisionsArt: 'CTG',
      buchungsArt: 'NG',
      provisionsSatz: 25.0, // 25%
      provisionsBetrag: 61.77,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2025'
    },
    // PKV Zusatz - Bestand
    {
      buchungsDatum: '25.11.2024',
      vertragsNr: '7823456789-001',
      vsNummer: 'VS-2022-0000890',
      kunde: 'Krause, D.',
      spartenCode: '020',
      spartenBez: '(Kranken)',
      gesellschaft: 'Barmenia',
      produkt: 'Zahnzusatz Premium',
      tarif: 'ZZP',
      vsBeginn: '01.05.2022',
      laufzeit: 25,
      zahlweise: 12,
      monatsBeitrag: 32.00,
      jahresBeitrag: 384.00,
      bewertungssumme: 384.00,
      provisionsArt: 'BP',
      buchungsArt: 'BS',
      provisionsSatz: 0.5, // 0,5%
      provisionsBetrag: 1.92,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '',
      haftungsEnde: ''
    },
    // Rechtsschutz - Neugeschäft
    {
      buchungsDatum: '27.11.2024',
      vertragsNr: '4456789012-001',
      vsNummer: 'VS-2024-0002012',
      kunde: 'Schulz, M.',
      spartenCode: '050',
      spartenBez: '(SHUK)',
      gesellschaft: 'ARAG',
      produkt: 'Rechtsschutz Komfort',
      tarif: 'RS-K',
      vsBeginn: '01.12.2024',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 28.00,
      jahresBeitrag: 336.00,
      bewertungssumme: 282.35, // Netto
      provisionsArt: 'CTG',
      buchungsArt: 'NG',
      provisionsSatz: 20.0, // 20%
      provisionsBetrag: 56.47,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '01.12.2024',
      haftungsEnde: '30.11.2025'
    },
    // Riester-Rente - Folgeprovision
    {
      buchungsDatum: '28.11.2024',
      vertragsNr: '4509876543-001',
      vsNummer: 'VS-2019-0000123',
      kunde: 'Maier, G.',
      spartenCode: '010',
      spartenBez: '(Leben)',
      gesellschaft: 'Zurich',
      produkt: 'Förder-Rente Classic',
      tarif: 'FRC',
      vsBeginn: '01.06.2019',
      laufzeit: 28,
      zahlweise: 12,
      monatsBeitrag: 175.00,
      jahresBeitrag: 2100.00,
      bewertungssumme: 2100.00,
      provisionsArt: 'FP', // Folgeprovision
      buchungsArt: 'BS',
      provisionsSatz: 2.0, // 2%
      provisionsBetrag: 42.00,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '',
      haftungsEnde: ''
    },
    // Kfz-Haftpflicht - Bestand
    {
      buchungsDatum: '29.11.2024',
      vertragsNr: '3398765432-001',
      vsNummer: 'VS-2023-0000678',
      kunde: 'Richter, B.',
      spartenCode: '040',
      spartenBez: '(Kfz)',
      gesellschaft: 'Allianz',
      produkt: 'Kfz-Haftpflicht Plus',
      tarif: 'KH-P',
      vsBeginn: '01.03.2023',
      laufzeit: 1,
      zahlweise: 1,
      monatsBeitrag: 52.00,
      jahresBeitrag: 624.00,
      bewertungssumme: 524.37,
      provisionsArt: 'CTG',
      buchungsArt: 'BS',
      provisionsSatz: 6.0, // 6%
      provisionsBetrag: 31.46,
      stornoreserveEinbehalt: 0,
      haftungsBeginn: '',
      haftungsEnde: ''
    }
  ];
}

/**
 * Generiert eine realistische Beispiel-Provisionsabrechnung als PDF
 * nach deutschen Branchenstandards (BiPRO/GDV)
 */
export function generateSampleProvisionStatement(): Blob {
  const doc = new jsPDF();
  const transactions = generateSampleTransactions();

  // ========== SEITE 1: HEADER UND TRANSAKTIONEN ==========

  // Absender (Versicherer/Pool)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('finanzpartner Maklerpool AG', 20, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Poolstraße 100 · 80333 München', 20, 20);
  doc.text('Tel: 089 123456-0 · info@finanzpartner-pool.de', 20, 24);

  // Dokumenttitel
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PROVISIONSABRECHNUNG', 105, 35, { align: 'center' });

  // Abrechnungsmetadaten
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Abrechnungsnummer:', 130, 45);
  doc.setFont('helvetica', 'bold');
  doc.text('2024-11-00042', 170, 45);
  doc.setFont('helvetica', 'normal');
  doc.text('Erstellungsdatum:', 130, 50);
  doc.text('05.12.2024', 170, 50);
  doc.text('Fälligkeitsdatum:', 130, 55);
  doc.text('19.12.2024', 170, 55);

  // Vermittler-Block
  doc.setDrawColor(0, 102, 153);
  doc.setLineWidth(0.5);
  doc.rect(20, 42, 100, 35);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Empfänger:', 22, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(SAMPLE_VERMITTLER.name, 22, 52);
  doc.text(`${SAMPLE_VERMITTLER.strasse}`, 22, 56);
  doc.text(`${SAMPLE_VERMITTLER.plz} ${SAMPLE_VERMITTLER.ort}`, 22, 60);
  doc.setFontSize(7);
  doc.text(`Vermittler-Nr: ${SAMPLE_VERMITTLER.vermittlerNr}`, 22, 66);
  doc.text(`IHK-Register: ${SAMPLE_VERMITTLER.ihkRegisterNr}`, 22, 70);
  doc.text(`IBAN: ${SAMPLE_VERMITTLER.iban}`, 22, 74);

  // Abrechnungszeitraum
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Abrechnungszeitraum: 01.11.2024 - 30.11.2024', 20, 88);

  // Trennlinie
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, 92, 190, 92);

  // Tabellenkopf
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 95, 170, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);

  const headers = ['Datum', 'Vertrag/VS-Nr.', 'Kunde', 'Gesellschaft/Produkt', 'Sparte', 'Art', 'BWS/Basis', 'Satz', 'Provision'];
  const colX = [21, 35, 58, 78, 115, 128, 142, 160, 175];

  headers.forEach((h, i) => {
    doc.text(h, colX[i], 100);
  });

  doc.line(20, 103, 190, 103);

  // Transaktionszeilen
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  let yPos = 108;

  transactions.forEach((t, idx) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      // Kopfzeile wiederholen
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 15, 170, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      headers.forEach((h, i) => {
        doc.text(h, colX[i], 20);
      });
      doc.line(20, 23, 190, 23);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      yPos = 28;
    }

    // Zeile 1: Hauptdaten
    doc.text(t.buchungsDatum, colX[0], yPos);
    doc.text(t.vertragsNr.substring(0, 15), colX[1], yPos);
    doc.text(t.kunde, colX[2], yPos);
    doc.text(t.gesellschaft, colX[3], yPos);
    doc.text(t.spartenBez, colX[4], yPos);
    doc.text(t.provisionsArt, colX[5], yPos);

    // BWS formatieren
    const bwsText = t.bewertungssumme >= 1000
      ? `${(t.bewertungssumme / 1000).toFixed(1)}T`
      : t.bewertungssumme.toFixed(0);
    doc.text(bwsText, colX[6], yPos);

    // Satz formatieren (‰ für Leben, % für Sach)
    const satzText = t.spartenCode === '010' || t.spartenCode === '020'
      ? `${t.provisionsSatz.toFixed(0)}‰`
      : `${t.provisionsSatz.toFixed(0)}%`;
    doc.text(satzText, colX[7], yPos);

    // Provision (negativ in rot)
    if (t.provisionsBetrag < 0) {
      doc.setTextColor(200, 0, 0);
    }
    doc.text(`${t.provisionsBetrag.toFixed(2)} €`, colX[8], yPos);
    doc.setTextColor(0, 0, 0);

    // Zeile 2: Details (kleinere Schrift, grau)
    yPos += 4;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(5.5);
    doc.text(`${t.vsNummer} | ${t.produkt} | ${t.tarif}`, colX[1], yPos);
    if (t.stornoreserveEinbehalt > 0) {
      doc.text(`SR: -${t.stornoreserveEinbehalt.toFixed(2)} €`, colX[8], yPos);
    }
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6.5);

    yPos += 6;

    // Trennlinie alle 3 Zeilen
    if ((idx + 1) % 3 === 0) {
      doc.setDrawColor(230, 230, 230);
      doc.line(20, yPos - 2, 190, yPos - 2);
    }
  });

  // ========== SUMMENBLOCK ==========
  yPos += 5;
  doc.setDrawColor(0, 102, 153);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  // Berechne Summen
  const summen = {
    apLeben: 0,
    apPkv: 0,
    bpLeben: 0,
    bpPkv: 0,
    fpLeben: 0,
    dynLeben: 0,
    stornoLeben: 0,
    ctgShuk: 0,
    ctgKfz: 0,
    stornoreserve: 0
  };

  transactions.forEach(t => {
    if (t.provisionsArt === 'AP' && t.spartenCode === '010') summen.apLeben += t.provisionsBetrag;
    if (t.provisionsArt === 'AP' && t.spartenCode === '020') summen.apPkv += t.provisionsBetrag;
    if (t.provisionsArt === 'BP' && t.spartenCode === '010') summen.bpLeben += t.provisionsBetrag;
    if (t.provisionsArt === 'BP' && t.spartenCode === '020') summen.bpPkv += t.provisionsBetrag;
    if (t.provisionsArt === 'FP') summen.fpLeben += t.provisionsBetrag;
    if (t.provisionsArt === 'DYN') summen.dynLeben += t.provisionsBetrag;
    if (t.provisionsArt === 'SP') summen.stornoLeben += t.provisionsBetrag;
    if (t.provisionsArt === 'CTG' && t.spartenCode === '040') summen.ctgKfz += t.provisionsBetrag;
    if (t.provisionsArt === 'CTG' && t.spartenCode !== '040') summen.ctgShuk += t.provisionsBetrag;
    summen.stornoreserve += t.stornoreserveEinbehalt;
  });

  const bruttoGesamt = transactions.reduce((sum, t) => sum + t.provisionsBetrag, 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PROVISIONSÜBERSICHT NACH SPARTEN', 20, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  // Tabelle Spartenübersicht
  const spartenData = [
    ['Lebensversicherung', summen.apLeben, summen.bpLeben + summen.fpLeben, summen.stornoLeben, summen.dynLeben],
    ['PKV', summen.apPkv, summen.bpPkv, 0, 0],
    ['SHUK/Komposit', summen.ctgShuk, 0, 0, 0],
    ['Kfz', summen.ctgKfz, 0, 0, 0]
  ];

  doc.setFont('helvetica', 'bold');
  doc.text('Sparte', 22, yPos);
  doc.text('Neugeschäft', 70, yPos);
  doc.text('Bestand', 100, yPos);
  doc.text('Storno', 125, yPos);
  doc.text('Dynamik', 145, yPos);
  doc.text('Summe', 170, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'normal');

  spartenData.forEach(row => {
    const summe = (row[1] as number) + (row[2] as number) + (row[3] as number) + (row[4] as number);
    doc.text(row[0] as string, 22, yPos);
    doc.text(`${(row[1] as number).toFixed(2)} €`, 70, yPos);
    doc.text(`${(row[2] as number).toFixed(2)} €`, 100, yPos);
    if ((row[3] as number) < 0) doc.setTextColor(200, 0, 0);
    doc.text(`${(row[3] as number).toFixed(2)} €`, 125, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${(row[4] as number).toFixed(2)} €`, 145, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${summe.toFixed(2)} €`, 170, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 4;
  });

  // ========== NEUE SEITE: STORNORESERVE UND KONTOAUSZUG ==========
  doc.addPage();
  yPos = 20;

  // Stornoreserve-Konto
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('STORNORESERVE-KONTO', 20, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const srData = [
    ['Saldovortrag (01.11.2024)', '8.500,00 €'],
    ['+ Zuführung (10% der AP)', `${summen.stornoreserve.toFixed(2)} €`],
    ['- Auflösung (fällige Verträge)', '-420,00 €'],
    ['- Verrechnung (Stornos)', '-185,00 €'],
    ['= Saldo neu (30.11.2024)', `${(8500 + summen.stornoreserve - 420 - 185).toFixed(2)} €`],
    ['', ''],
    ['Fällig in 12 Monaten (Info)', '650,00 €']
  ];

  srData.forEach((row, idx) => {
    if (idx === 4) {
      doc.setFont('helvetica', 'bold');
      doc.setDrawColor(0, 0, 0);
      doc.line(20, yPos - 2, 100, yPos - 2);
    }
    doc.text(row[0], 22, yPos);
    doc.text(row[1], 90, yPos, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    yPos += 5;
  });

  yPos += 10;

  // Kontoauszug / Abrechnungssaldo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('KONTOAUSZUG / ABRECHNUNGSSALDO', 20, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const kontoData = [
    ['Saldovortrag', '250,00 €'],
    ['+ Brutto-Provision', `${bruttoGesamt.toFixed(2)} €`],
    ['- Stornoreserve-Zuführung (10%)', `-${summen.stornoreserve.toFixed(2)} €`],
    ['+ Stornoreserve-Auflösung', '420,00 €'],
    ['- Vorschuss-Tilgung', '-300,00 €'],
    ['- Sonstige Abzüge', '0,00 €'],
    ['', ''],
    ['= Zwischensumme', `${(250 + bruttoGesamt - summen.stornoreserve + 420 - 300).toFixed(2)} €`],
    ['+/- USt (§4 Nr.11 UStG: steuerfrei)', '0,00 €'],
    ['', '']
  ];

  kontoData.forEach((row, idx) => {
    if (idx === 7) {
      doc.setDrawColor(0, 0, 0);
      doc.line(20, yPos - 2, 120, yPos - 2);
    }
    doc.text(row[0], 22, yPos);
    doc.text(row[1], 110, yPos, { align: 'right' });
    yPos += 5;
  });

  // Auszahlungsbetrag
  const auszahlung = 250 + bruttoGesamt - summen.stornoreserve + 420 - 300;
  doc.setFillColor(0, 102, 153);
  doc.rect(20, yPos - 2, 100, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AUSZAHLUNGSBETRAG', 25, yPos + 4);
  doc.text(`${auszahlung.toFixed(2)} €`, 115, yPos + 4, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  yPos += 18;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Zahlungsdatum: 19.12.2024', 22, yPos);
  doc.text(`auf Konto: ${SAMPLE_VERMITTLER.iban}`, 22, yPos + 5);

  // Rechtliche Hinweise
  yPos += 20;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Hinweise:', 20, yPos);
  yPos += 4;
  doc.text('• Courtagen für Versicherungsvermittlung sind gemäß § 4 Nr. 11 UStG umsatzsteuerfrei.', 20, yPos);
  yPos += 4;
  doc.text('• Die Stornohaftungszeit beträgt gemäß § 49 VAG 60 Monate für Leben und PKV.', 20, yPos);
  yPos += 4;
  doc.text('• Einsprüche gegen diese Abrechnung sind innerhalb von 6 Wochen schriftlich einzureichen.', 20, yPos);
  yPos += 4;
  doc.text('• Aufbewahrungspflicht gemäß § 257 HGB: 10 Jahre.', 20, yPos);
  doc.setTextColor(0, 0, 0);

  // Footer
  doc.setFontSize(7);
  doc.text('Dies ist eine maschinell erstellte Abrechnung. · finanzpartner Maklerpool AG · Seite 2 von 2', 105, 285, { align: 'center' });

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

  // Filter transactions if needed
  let filteredTransactions = [...transactions];
  if (options.filterLowConfidence) {
    filteredTransactions = filteredTransactions.filter(t => {
      const exp = explanations.get(t.id);
      return exp?.confidence === 'low';
    });
  }

  // Group by type if needed
  const grouped = options.groupByType
    ? groupTransactionsByType(filteredTransactions)
    : { 'Alle Transaktionen': filteredTransactions };

  // Header
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

    // Group header
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

      // Transaction details
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`${transaction.vertragsnummer} - ${transaction.produktart}`, 20, yPos);

      doc.setFont('helvetica', 'normal');
      doc.text(formatDate(transaction.datum), 150, yPos);
      doc.text(formatCurrency(transaction.provisionsbetrag), 175, yPos);
      yPos += 6;

      if (explanation) {
        // Confidence badge
        const confidenceText = {
          high: 'Konfidenz: Hoch',
          medium: 'Konfidenz: Mittel',
          low: 'Konfidenz: Niedrig'
        }[explanation.confidence];

        doc.setFontSize(8);
        doc.text(confidenceText, 20, yPos);
        yPos += 5;

        // Explanation
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

function groupTransactionsByType(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};

  for (const t of transactions) {
    const key = t.provisionsart || 'Sonstig';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(t);
  }

  return groups;
}

/**
 * Download helper
 */
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
