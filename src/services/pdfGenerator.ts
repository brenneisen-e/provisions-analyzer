import jsPDF from 'jspdf';
import type { Transaction, TransactionExplanation } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

/**
 * Generiert eine Beispiel-Provisionsabrechnung als PDF
 */
export function generateSampleProvisionStatement(): Blob {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Provisionsabrechnung', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Muster Versicherungsvermittler GmbH', 105, 28, { align: 'center' });

  // Abrechnungszeitraum
  doc.setFontSize(11);
  doc.text('Abrechnungszeitraum: 01.11.2024 - 30.11.2024', 20, 45);
  doc.text('Vermittlernummer: VM-2024-0815', 20, 52);
  doc.text('Abrechnungsnummer: PA-2024-11-0042', 20, 59);

  // Trennlinie
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 65, 190, 65);

  // Tabellenkopf
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const headers = ['Datum', 'Vertrags-Nr.', 'Produkt', 'Art', 'Beitrag', 'Provision'];
  const colWidths = [22, 30, 45, 30, 28, 28];
  let xPos = 20;

  headers.forEach((header, i) => {
    doc.text(header, xPos, 75);
    xPos += colWidths[i];
  });

  doc.line(20, 78, 190, 78);

  // Sample transactions
  const transactions = [
    { datum: '02.11.2024', vertrag: 'LV-2024-00123', produkt: 'Lebensversicherung Plus', art: 'Abschluss', beitrag: '2.400,00', provision: '720,00' },
    { datum: '05.11.2024', vertrag: 'SV-2024-00456', produkt: 'Hausratversicherung', art: 'Abschluss', beitrag: '180,00', provision: '27,00' },
    { datum: '08.11.2024', vertrag: 'KV-2024-00789', produkt: 'Krankenzusatz Premium', art: 'Abschluss', beitrag: '1.800,00', provision: '360,00' },
    { datum: '10.11.2024', vertrag: 'LV-2023-00042', produkt: 'Rentenversicherung', art: 'Bestand', beitrag: '3.600,00', provision: '36,00' },
    { datum: '12.11.2024', vertrag: 'KFZ-2024-01234', produkt: 'KFZ-Vollkasko', art: 'Abschluss', beitrag: '960,00', provision: '96,00' },
    { datum: '15.11.2024', vertrag: 'LV-2022-00099', produkt: 'Lebensversicherung', art: 'Dynamik', beitrag: '300,00', provision: '90,00' },
    { datum: '18.11.2024', vertrag: 'SV-2023-00321', produkt: 'Wohngebäude', art: 'Bestand', beitrag: '850,00', provision: '17,00' },
    { datum: '20.11.2024', vertrag: 'LV-2024-00055', produkt: 'BU-Versicherung', art: 'Storno', beitrag: '1.200,00', provision: '-180,00' },
    { datum: '22.11.2024', vertrag: 'KV-2024-00456', produkt: 'Pflegezusatz', art: 'Abschluss', beitrag: '600,00', provision: '120,00' },
    { datum: '25.11.2024', vertrag: 'LV-2021-00077', produkt: 'Fondsgebundene LV', art: 'Nachprovision', beitrag: '5.000,00', provision: '250,00' },
    { datum: '28.11.2024', vertrag: 'SV-2024-00567', produkt: 'Haftpflicht Privat', art: 'Abschluss', beitrag: '85,00', provision: '12,75' },
    { datum: '30.11.2024', vertrag: 'KFZ-2023-00888', produkt: 'KFZ-Haftpflicht', art: 'Bestand', beitrag: '480,00', provision: '14,40' },
  ];

  doc.setFont('helvetica', 'normal');
  let yPos = 85;

  transactions.forEach((t) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }

    xPos = 20;
    doc.text(t.datum, xPos, yPos);
    xPos += colWidths[0];
    doc.text(t.vertrag, xPos, yPos);
    xPos += colWidths[1];
    doc.text(t.produkt.substring(0, 22), xPos, yPos);
    xPos += colWidths[2];
    doc.text(t.art, xPos, yPos);
    xPos += colWidths[3];
    doc.text(t.beitrag + ' EUR', xPos, yPos);
    xPos += colWidths[4];

    // Negative amounts in red
    if (t.provision.startsWith('-')) {
      doc.setTextColor(200, 0, 0);
    }
    doc.text(t.provision + ' EUR', xPos, yPos);
    doc.setTextColor(0, 0, 0);

    yPos += 8;
  });

  // Summenzeile
  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Summe Abschlussprovisionen:', 20, yPos);
  doc.text('1.425,75 EUR', 162, yPos, { align: 'right' });
  yPos += 7;
  doc.text('Summe Bestandsprovisionen:', 20, yPos);
  doc.text('67,40 EUR', 162, yPos, { align: 'right' });
  yPos += 7;
  doc.text('Summe Dynamikprovisionen:', 20, yPos);
  doc.text('90,00 EUR', 162, yPos, { align: 'right' });
  yPos += 7;
  doc.text('Summe Nachprovisionen:', 20, yPos);
  doc.text('250,00 EUR', 162, yPos, { align: 'right' });
  yPos += 7;
  doc.setTextColor(200, 0, 0);
  doc.text('Summe Stornierungen:', 20, yPos);
  doc.text('-180,00 EUR', 162, yPos, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  doc.setFontSize(12);
  doc.text('Gesamtbetrag:', 20, yPos);
  doc.text('1.653,15 EUR', 162, yPos, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Dies ist eine maschinell erstellte Abrechnung.', 105, 280, { align: 'center' });
  doc.text('Seite 1 von 1', 105, 285, { align: 'center' });

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
