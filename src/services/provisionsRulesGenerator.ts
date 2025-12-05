import jsPDF from 'jspdf';

// Layout Konstanten
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 25;
const MARGIN_BOTTOM = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const LINE_HEIGHT = 5;

// Farben
const COLOR_PRIMARY = [0, 51, 102] as const; // Dunkelblau
const COLOR_SECONDARY = [0, 102, 153] as const;
const COLOR_TEXT = [40, 40, 40] as const;
const COLOR_GRAY = [100, 100, 100] as const;
const COLOR_LIGHT_GRAY = [200, 200, 200] as const;
const COLOR_TABLE_HEADER = [230, 236, 242] as const;
const COLOR_TABLE_ALT = [248, 250, 252] as const;

interface PDFContext {
  doc: jsPDF;
  y: number;
  pageNum: number;
}

/**
 * Generiert eine professionelle 80+ Seiten Provisionsbestimmungen PDF
 * für die "Alpha Versicherung AG"
 */
export function generateSampleProvisionsRules(): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ctx: PDFContext = { doc, y: MARGIN_TOP, pageNum: 1 };

  // Deckblatt
  renderCoverPage(ctx);

  // Inhaltsverzeichnis
  doc.addPage();
  ctx.pageNum++;
  ctx.y = MARGIN_TOP;
  renderTableOfContents(ctx);

  // Teil A: Allgemeiner Teil
  addNewPage(ctx);
  renderPartA(ctx);

  // Teil B: Provisionsarten
  addNewPage(ctx);
  renderPartB(ctx);

  // Teil C: Spartenspezifische Regelungen
  addNewPage(ctx);
  renderPartC(ctx);

  // Teil D: Stornohaftung und Stornoreserve
  addNewPage(ctx);
  renderPartD(ctx);

  // Teil E: Abrechnungsmodalitäten
  addNewPage(ctx);
  renderPartE(ctx);

  // Teil F: Sondervergütungen
  addNewPage(ctx);
  renderPartF(ctx);

  // Teil G: Besondere Regelungen
  addNewPage(ctx);
  renderPartG(ctx);

  // Teil H: Schlussbestimmungen
  addNewPage(ctx);
  renderPartH(ctx);

  // Anlagen: Provisionstabellen
  addNewPage(ctx);
  renderAnlagen(ctx);

  // Seitenzahlen hinzufügen
  addPageNumbers(doc);

  return doc.output('blob');
}

function addNewPage(ctx: PDFContext): void {
  ctx.doc.addPage();
  ctx.pageNum++;
  ctx.y = MARGIN_TOP;
}

function checkPageBreak(ctx: PDFContext, neededSpace: number = 30): void {
  if (ctx.y > PAGE_HEIGHT - MARGIN_BOTTOM - neededSpace) {
    addNewPage(ctx);
  }
}

function addPageNumbers(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_GRAY);
    doc.text(`Seite ${i} von ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
    doc.text('Alpha Versicherung AG – Allgemeine Provisionsbestimmungen', MARGIN_LEFT, PAGE_HEIGHT - 10);
  }
}

// ==================== DECKBLATT ====================
function renderCoverPage(ctx: PDFContext): void {
  const { doc } = ctx;

  // Logo-Bereich
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, PAGE_WIDTH, 60, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('ALPHA', MARGIN_LEFT, 35);
  doc.setFontSize(14);
  doc.text('VERSICHERUNG AG', MARGIN_LEFT, 45);

  // Titel
  doc.setTextColor(...COLOR_PRIMARY);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Allgemeine', PAGE_WIDTH / 2, 100, { align: 'center' });
  doc.text('Provisionsbestimmungen', PAGE_WIDTH / 2, 115, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_SECONDARY);
  doc.text('für Versicherungsvertreter der', PAGE_WIDTH / 2, 135, { align: 'center' });
  doc.text('Ausschließlichkeitsorganisation (AO)', PAGE_WIDTH / 2, 145, { align: 'center' });

  // Version und Datum
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_GRAY);
  doc.text('Stand: 01.01.2024', PAGE_WIDTH / 2, 170, { align: 'center' });
  doc.text('Version 4.2', PAGE_WIDTH / 2, 178, { align: 'center' });

  // Dokumentklassifizierung
  doc.setFillColor(...COLOR_TABLE_HEADER);
  doc.roundedRect(50, 200, 110, 40, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR_TEXT);
  doc.text('Anlage 1 zum Agenturvertrag', PAGE_WIDTH / 2, 215, { align: 'center' });
  doc.text('Dokumentennummer: APB-2024-001', PAGE_WIDTH / 2, 223, { align: 'center' });
  doc.text('Vertraulich – Nur für internen Gebrauch', PAGE_WIDTH / 2, 231, { align: 'center' });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_GRAY);
  doc.text('Alpha Versicherung AG · Versicherungsplatz 1 · 80333 München', PAGE_WIDTH / 2, 270, { align: 'center' });
  doc.text('HRB 12345 München · USt-IdNr.: DE123456789', PAGE_WIDTH / 2, 276, { align: 'center' });
}

// ==================== INHALTSVERZEICHNIS ====================
function renderTableOfContents(ctx: PDFContext): void {
  const { doc } = ctx;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text('Inhaltsverzeichnis', MARGIN_LEFT, ctx.y);
  ctx.y += 15;

  const tocEntries = [
    { title: 'A. Allgemeiner Teil', page: 4 },
    { title: '   § 1 Geltungsbereich', page: 4 },
    { title: '   § 2 Begriffsbestimmungen', page: 5 },
    { title: '   § 3 Entstehung des Provisionsanspruchs', page: 7 },
    { title: '   § 4 Verdienstprinzip', page: 8 },
    { title: 'B. Provisionsarten', page: 10 },
    { title: '   § 5 Abschlussprovision', page: 10 },
    { title: '   § 6 Bestandsprovision / Folgeprovision', page: 13 },
    { title: '   § 7 Dynamikprovision', page: 15 },
    { title: '   § 8 Superprovision / Führungsprovision', page: 17 },
    { title: '   § 9 Änderungsprovision', page: 19 },
    { title: '   § 10 Nachbearbeitungsprovision', page: 20 },
    { title: 'C. Spartenspezifische Regelungen', page: 22 },
    { title: '   § 11 Lebensversicherung', page: 22 },
    { title: '   § 12 Private Krankenversicherung', page: 28 },
    { title: '   § 13 Sachversicherung / Komposit', page: 33 },
    { title: '   § 14 Kraftfahrtversicherung', page: 38 },
    { title: '   § 15 Unfallversicherung', page: 41 },
    { title: 'D. Stornohaftung und Stornoreserve', page: 44 },
    { title: '   § 16 Haftungszeiträume', page: 44 },
    { title: '   § 17 Berechnung der Provisionsrückforderung', page: 47 },
    { title: '   § 18 Stornoreserve', page: 50 },
    { title: '   § 19 Stornotatbestände', page: 53 },
    { title: '   § 20 Stornonachbearbeitung', page: 55 },
    { title: 'E. Abrechnungsmodalitäten', page: 58 },
    { title: '   § 21 Abrechnungsintervalle', page: 58 },
    { title: '   § 22 Buchauszugsanspruch', page: 60 },
    { title: '   § 23 Saldierung und Kontoführung', page: 62 },
    { title: 'F. Sondervergütungen', page: 65 },
    { title: '   § 24 Produktionsabhängige Boni', page: 65 },
    { title: '   § 25 Qualitätsboni', page: 68 },
    { title: '   § 26 Sachkostenzuschüsse', page: 70 },
    { title: '   § 27 Garantieprovisionen', page: 71 },
    { title: 'G. Besondere Regelungen', page: 73 },
    { title: '   § 28 Bestandsübertragungen', page: 73 },
    { title: '   § 29 Vermittlerwechsel', page: 75 },
    { title: '   § 30 Gemeinschaftsgeschäfte', page: 77 },
    { title: 'H. Schlussbestimmungen', page: 79 },
    { title: '   § 31 Änderungsvorbehalte', page: 79 },
    { title: '   § 32 Salvatorische Klausel', page: 80 },
    { title: '   § 33 Inkrafttreten', page: 80 },
    { title: 'Anlagen', page: 81 },
    { title: '   Anlage 1: Provisionstabelle Lebensversicherung', page: 81 },
    { title: '   Anlage 2: Provisionstabelle Krankenversicherung', page: 83 },
    { title: '   Anlage 3: Provisionstabelle Sachversicherung', page: 85 },
    { title: '   Anlage 4: Bonusregelungen', page: 87 },
  ];

  doc.setFontSize(10);
  tocEntries.forEach(entry => {
    checkPageBreak(ctx, 8);
    const isMainSection = !entry.title.startsWith('   ');
    doc.setFont('helvetica', isMainSection ? 'bold' : 'normal');
    const textColor = isMainSection ? COLOR_PRIMARY : COLOR_TEXT;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const title = entry.title.trim();
    doc.text(title, MARGIN_LEFT + (isMainSection ? 0 : 5), ctx.y);

    // Punktlinie
    const titleWidth = doc.getTextWidth(title);
    const pageStr = entry.page.toString();
    const pageWidth = doc.getTextWidth(pageStr);
    const dotsStart = MARGIN_LEFT + (isMainSection ? 0 : 5) + titleWidth + 2;
    const dotsEnd = PAGE_WIDTH - MARGIN_RIGHT - pageWidth - 2;

    doc.setTextColor(...COLOR_LIGHT_GRAY);
    let dotX = dotsStart;
    while (dotX < dotsEnd) {
      doc.text('.', dotX, ctx.y);
      dotX += 2;
    }

    doc.setTextColor(...COLOR_TEXT);
    doc.text(pageStr, PAGE_WIDTH - MARGIN_RIGHT, ctx.y, { align: 'right' });

    ctx.y += isMainSection ? 7 : 5;
  });
}

// ==================== TEIL A: ALLGEMEINER TEIL ====================
function renderPartA(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'A', 'Allgemeiner Teil');

  renderParagraph(ctx, '§ 1', 'Geltungsbereich');
  renderText(ctx, `(1) Diese Allgemeinen Provisionsbestimmungen (APB) regeln die Vergütungsansprüche der Versicherungsvertreter der Alpha Versicherung AG (nachfolgend „Gesellschaft") im Rahmen ihrer Ausschließlichkeitsorganisation (AO).`);
  renderText(ctx, `(2) Die APB sind Bestandteil des Agenturvertrages und gelten für alle nach dessen Abschluss vermittelten Versicherungsverträge.`);
  renderText(ctx, `(3) Bei Widersprüchen zwischen dem Agenturvertrag und diesen APB geht der Agenturvertrag vor. Individuelle Vereinbarungen haben Vorrang vor allgemeinen Regelungen.`);
  renderText(ctx, `(4) Die in diesen Bestimmungen aufgeführten Provisionssätze und Berechnungsgrundlagen können durch gesonderte Provisionstabellen (Anlagen) konkretisiert werden. Die Anlagen sind integraler Bestandteil dieser APB.`);

  renderParagraph(ctx, '§ 2', 'Begriffsbestimmungen');
  renderText(ctx, `Im Sinne dieser Provisionsbestimmungen gelten folgende Definitionen:`);

  ctx.y += 3;
  const definitions = [
    { term: 'Agenturvertrag', def: 'Der zwischen der Gesellschaft und dem Versicherungsvertreter abgeschlossene Handelsvertretervertrag gemäß §§ 84 ff. HGB.' },
    { term: 'Bewertungssumme (BWS)', def: 'Berechnungsgrundlage für die Abschlussprovision bei Lebensversicherungen. BWS = Monatsbeitrag × 12 × Vertragslaufzeit in Jahren (maximal 35 Jahre).' },
    { term: 'Policierung', def: 'Der Zeitpunkt der Ausfertigung des Versicherungsscheins durch die Gesellschaft.' },
    { term: 'Technischer Beginn', def: 'Der im Versicherungsvertrag vereinbarte Beginn des Versicherungsschutzes.' },
    { term: 'Stornierung', def: 'Die vorzeitige Beendigung eines Versicherungsvertrages vor Ablauf der Stornohaftungszeit.' },
    { term: 'Stornohaftungszeit', def: 'Der Zeitraum, innerhalb dessen bei Vertragsbeendigung eine anteilige Rückzahlung der Abschlussprovision erfolgt.' },
    { term: 'Nettobeitrag', def: 'Der Versicherungsbeitrag ohne Versicherungssteuer und ohne gesetzlichen Zuschlag.' },
    { term: 'Monatsbeitrag (MB)', def: 'Der auf einen Monat bezogene Versicherungsbeitrag.' },
  ];

  definitions.forEach(d => {
    checkPageBreak(ctx, 15);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.setFontSize(10);
    ctx.doc.setTextColor(...COLOR_TEXT);
    ctx.doc.text(`• ${d.term}:`, MARGIN_LEFT + 5, ctx.y);
    ctx.y += 5;
    ctx.doc.setFont('helvetica', 'normal');
    const lines = ctx.doc.splitTextToSize(d.def, CONTENT_WIDTH - 10);
    lines.forEach((line: string) => {
      ctx.doc.text(line, MARGIN_LEFT + 8, ctx.y);
      ctx.y += LINE_HEIGHT;
    });
    ctx.y += 2;
  });

  renderParagraph(ctx, '§ 3', 'Entstehung des Provisionsanspruchs');
  renderText(ctx, `(1) Der Provisionsanspruch des Versicherungsvertreters entsteht gemäß § 92 Abs. 4 HGB erst, wenn der Versicherungsnehmer die Prämie gezahlt hat, aus der sich die Provision berechnet.`);
  renderText(ctx, `(2) Abweichend von Absatz 1 gewährt die Gesellschaft eine vorschüssige Auszahlung der Abschlussprovision bei Policierung. Diese vorschüssige Auszahlung steht unter dem Vorbehalt der Rückforderung gemäß den Regelungen zur Stornohaftung (Teil D).`);
  renderText(ctx, `(3) Die Bestandsprovision entsteht mit Fälligkeit der jeweiligen Folgeprämie und wird nach deren Zahlung durch den Versicherungsnehmer ausgezahlt.`);

  renderParagraph(ctx, '§ 4', 'Verdienstprinzip');
  renderText(ctx, `(1) Die Abschlussprovision wird sukzessive über die Stornohaftungszeit verdient. Bei einer Haftungszeit von 60 Monaten sind nach jedem vollen Monat 1/60 der Provision endgültig verdient.`);
  renderText(ctx, `(2) Die Verdienung ist an die tatsächliche Prämienzahlung durch den Versicherungsnehmer geknüpft. Verdient werden kann maximal der Betrag, der 50% der bis zum Stornozeitpunkt gezahlten Beiträge entspricht.`);

  renderInfoBox(ctx, 'Berechnungsformel Verdienung',
    'Verdiente Provision = (Gesamtprovision / 60) × bezahlte Monate\n' +
    'Rückforderung = Gesamtprovision − Verdiente Provision\n\n' +
    'Beispiel: AP 6.000 €, Storno nach 36 Monaten\n' +
    'Verdient: 6.000 € × (36/60) = 3.600 €\n' +
    'Rückforderung: 6.000 € − 3.600 € = 2.400 €'
  );
}

// ==================== TEIL B: PROVISIONSARTEN ====================
function renderPartB(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'B', 'Provisionsarten');

  renderParagraph(ctx, '§ 5', 'Abschlussprovision (AP)');
  renderText(ctx, `(1) Die Abschlussprovision vergütet den erfolgreichen Abschluss eines Versicherungsvertrages. Sie wird als einmalige Zahlung bei Policierung vorschüssig gewährt.`);
  renderText(ctx, `(2) Die Berechnungsgrundlage und der anzuwendende Provisionssatz richten sich nach der Versicherungssparte gemäß den Regelungen in Teil C und den jeweils gültigen Provisionstabellen.`);
  renderText(ctx, `(3) Bei Lebensversicherungen wird die Bewertungssumme (BWS) wie folgt berechnet:`);

  renderInfoBox(ctx, 'Berechnung der Bewertungssumme (BWS)',
    'BWS = Monatsbeitrag × 12 × Laufzeit (max. 35 Jahre)\n' +
    'Abschlussprovision = BWS × Promillesatz\n\n' +
    'Beispiel: Monatsbeitrag 200 €, Laufzeit 30 Jahre, Promillesatz 30‰\n' +
    'BWS = 200 € × 12 × 30 = 72.000 €\n' +
    'AP = 72.000 € × 0,030 = 2.160,00 €'
  );

  renderText(ctx, `(4) Die Auszahlung kann erfolgen als:`);
  renderBulletList(ctx, [
    'Diskontierte Auszahlung (Vorausprovision): Sofortige vollständige Zahlung bei Policierung unter Stornohaftungsvorbehalt',
    'Ratierliche Auszahlung: Verteilung über die Haftungszeit mit reduziertem Stornorisiko',
    'Mischform: Teilweise diskontiert (z.B. 70%), Rest ratierlich als "laufende Abschlussprovision"'
  ]);

  renderParagraph(ctx, '§ 6', 'Bestandsprovision / Folgeprovision (BP/FP)');
  renderText(ctx, `(1) Die Bestandsprovision vergütet die laufende Bestandspflege und Kundenbetreuung. Sie wird als Prozentsatz des Jahresbeitrags (netto) berechnet und jährlich mit der Hauptfälligkeit ausgezahlt.`);
  renderText(ctx, `(2) Der Anspruch auf Bestandsprovision entsteht erstmals:`);
  renderBulletList(ctx, [
    'Bei Lebens- und Krankenversicherungen: 12 Monate nach Vertragsbeginn',
    'Bei Sachversicherungen: Ab dem zweiten Versicherungsjahr',
    'Abweichende Regelungen gemäß Provisionstabelle bleiben unberührt'
  ]);
  renderText(ctx, `(3) Die Höhe der Bestandsprovision ergibt sich aus den Provisionstabellen. Sie beträgt typischerweise zwischen 1,0% und 3,0% des Jahresbeitrags.`);

  renderParagraph(ctx, '§ 7', 'Dynamikprovision');
  renderText(ctx, `(1) Für Lebensversicherungen mit Dynamikklausel (jährliche Beitragserhöhung typischerweise 3-5%) entsteht bei wirksamer Dynamikerhöhung eine separate Abschlussprovision.`);
  renderText(ctx, `(2) Die Berechnungsgrundlage ist:`);

  renderInfoBox(ctx, 'Berechnung der Dynamikprovision',
    'Dynamik-BWS = Erhöhungsbeitrag × 12 × Restlaufzeit\n' +
    'Dynamik-AP = Dynamik-BWS × Promillesatz\n\n' +
    'Beispiel: Erhöhung 10 €/Monat, Restlaufzeit 20 Jahre, Promillesatz 30‰\n' +
    'Dynamik-BWS = 10 € × 12 × 20 = 2.400 €\n' +
    'Dynamik-AP = 2.400 € × 0,030 = 72,00 €'
  );

  renderText(ctx, `(3) Der Anspruch auf Dynamikprovision besteht auch nach Beendigung des Agenturvertrages für alle nach Vertragsbeendigung wirksam werdenden Dynamikerhöhungen, sofern der Ursprungsvertrag während der Vertragszeit vermittelt wurde (BGH-Rechtsprechung).`);

  renderParagraph(ctx, '§ 8', 'Superprovision / Führungsprovision');
  renderText(ctx, `(1) Führungskräfte erhalten für das Geschäft ihrer Untervertreter eine Superprovision (auch Führungsprovision, Differenzprovision oder Override genannt).`);
  renderText(ctx, `(2) Die Berechnung erfolgt als Differenz zwischen der Provisionsstufe der Führungskraft und der Provisionsstufe des Untervertreters:`);

  renderInfoBox(ctx, 'Berechnung der Superprovision',
    'Superprovision = (Stufe FK − Stufe UV) × Provisionsbasis\n\n' +
    'Beispiel: Führungskraft Stufe 35‰, Untervertreter Stufe 25‰\n' +
    'BWS des Geschäfts: 50.000 €\n' +
    'Superprovision = (35‰ − 25‰) × 50.000 € = 500,00 €'
  );

  renderText(ctx, `(3) Superprovisionen sind gemäß § 4 Nr. 11 UStG umsatzsteuerfrei.`);
  renderText(ctx, `(4) Bei Stornierung unterliegt die Superprovision der proportionalen Rückzahlung analog zum Abschlussvermittler.`);

  renderParagraph(ctx, '§ 9', 'Änderungsprovision');
  renderText(ctx, `(1) Bei provisionspflichtigen Vertragsänderungen (Summenerhöhungen, Zuzahlungen, Tarifwechsel mit Leistungsverbesserung) wird eine Änderungsprovision auf den Erhöhungsbetrag gewährt.`);
  renderText(ctx, `(2) Die Änderungsprovision hat eine eigene Stornohaftungszeit, die mit dem Wirksamkeitsdatum der Änderung beginnt.`);
  renderText(ctx, `(3) Nicht provisionspflichtig sind:`);
  renderBulletList(ctx, [
    'Bloße Tarifwechsel ohne Leistungsverbesserung',
    'Vertragsherabsetzungen',
    'Administrative Änderungen (Adresse, Zahlungsweise)'
  ]);

  renderParagraph(ctx, '§ 10', 'Nachbearbeitungsprovision');
  renderText(ctx, `(1) Für erfolgreiche Stornoabwehrmaßnahmen bei „notleidenden" Verträgen kann eine Nachbearbeitungsprovision gewährt werden.`);
  renderText(ctx, `(2) Voraussetzungen sind:`);
  renderBulletList(ctx, [
    'Fristgerechte Stornogefahrmitteilung durch die Gesellschaft',
    'Dokumentierte Nachbearbeitungsmaßnahmen durch den Vertreter',
    'Erfolgreiche Abwendung des Stornos (Fortführung des Vertrages)'
  ]);
  renderText(ctx, `(3) Die Höhe beträgt typischerweise 10-20% der ursprünglichen Abschlussprovision oder einen Festbetrag gemäß Bonusregelung.`);
}

// ==================== TEIL C: SPARTENSPEZIFISCHE REGELUNGEN ====================
function renderPartC(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'C', 'Spartenspezifische Regelungen');

  renderParagraph(ctx, '§ 11', 'Lebensversicherung');
  renderText(ctx, `(1) Die Provision für Lebensversicherungsprodukte wird auf Basis der Bewertungssumme (BWS) berechnet. Die BWS ergibt sich aus:`);
  renderText(ctx, `BWS = Monatsbeitrag × 12 × Laufzeit (maximal 35 Jahre) × Bewertungsfaktor`);

  ctx.y += 5;
  renderText(ctx, `(2) Bewertungsfaktoren nach Produktkategorie:`);

  renderTable(ctx,
    ['Produktkategorie', 'Bewertungsfaktor', 'AP (Promille)', 'BP p.a.'],
    [
      ['Kapitallebensversicherung', '1,0', '25 - 40‰', '1,5%'],
      ['Risikolebensversicherung', '0,5', '25 - 40‰', '1,0%'],
      ['Rentenversicherung (klassisch)', '1,0', '25 - 40‰', '1,5%'],
      ['Fondsgebundene LV', '1,0', '25 - 40‰', '1,5%'],
      ['Riester-Rente', '0,5', '25 - 40‰', '1,5%'],
      ['Rürup-Rente (Basisrente)', '0,5', '25 - 40‰', '1,5%'],
      ['Berufsunfähigkeitsversicherung', '1,0', '25 - 50‰', '1,5%'],
      ['Einmalbeitragsversicherung', '0,125 - 0,75', '20 - 30‰', '0,5%'],
    ]
  );

  renderText(ctx, `(3) Die Stornohaftungszeit beträgt gemäß § 49 VAG zwingend 60 Monate.`);
  renderText(ctx, `(4) Besondere Regelungen für Einmalbeitragsversicherungen:`);
  renderBulletList(ctx, [
    'Bewertungsfaktor richtet sich nach der garantierten Laufzeit',
    'Bei sofort beginnenden Renten: Faktor 0,125',
    'Bei aufgeschobenen Renten: Faktor entsprechend Aufschubzeit (max. 0,75)',
  ]);

  addNewPage(ctx);
  renderParagraph(ctx, '§ 12', 'Private Krankenversicherung (PKV)');
  renderText(ctx, `(1) Die Provision für PKV-Produkte wird auf Basis des Monatsbeitrags berechnet. Der Monatsbeitrag versteht sich ohne:`);
  renderBulletList(ctx, [
    'Gesetzlichen Zuschlag (10% gemäß § 149 VAG)',
    'Beitrag zur Pflegepflichtversicherung',
    'Arbeitgeberzuschuss'
  ]);

  renderText(ctx, `(2) Provisionssätze nach Produktkategorie:`);

  renderTable(ctx,
    ['Produktkategorie', 'Monatsbeiträge (MB)', 'Max. Deckelung', 'BP p.a.'],
    [
      ['PKV-Vollversicherung', '6 - 9 MB', '9,0 MB (seit 2012)', '1,5%'],
      ['Zusatzversicherung ambulant', '5 - 8 MB', 'keine', '1,0%'],
      ['Zusatzversicherung stationär', '6 - 9 MB', 'keine', '1,0%'],
      ['Zusatzversicherung Zahn', '5 - 7 MB', 'keine', '1,0%'],
      ['Pflegezusatzversicherung', '4 - 6 MB', 'keine', '1,0%'],
      ['Krankentagegeld', '5 - 8 MB', 'keine', '1,0%'],
    ]
  );

  renderText(ctx, `(3) Die Stornohaftungszeit beträgt gemäß § 49 VAG zwingend 60 Monate für substitutive Krankenversicherung.`);
  renderText(ctx, `(4) Bei Zusatzversicherungen kann die Stornohaftungszeit vertraglich auf 24-36 Monate begrenzt werden.`);

  addNewPage(ctx);
  renderParagraph(ctx, '§ 13', 'Sachversicherung / Komposit');
  renderText(ctx, `(1) Die Provision für Sachversicherungen wird als laufende Courtage auf den Nettobeitrag (ohne 19% Versicherungssteuer) berechnet.`);
  renderText(ctx, `(2) Provisionssätze nach Produktkategorie:`);

  renderTable(ctx,
    ['Versicherungsart', 'Courtagesatz', 'Haftungszeit'],
    [
      ['Privathaftpflichtversicherung', '18 - 25%', '12 Monate'],
      ['Hausratversicherung', '18 - 25%', '12 Monate'],
      ['Wohngebäudeversicherung', '15 - 22%', '12 Monate'],
      ['Rechtsschutzversicherung', '18 - 25%', '12 Monate'],
      ['Tierhalterhaftpflicht', '15 - 20%', '12 Monate'],
      ['Glasversicherung', '15 - 20%', '12 Monate'],
      ['Gewerbliche Haftpflicht', '15 - 20%', '12 Monate'],
      ['Betriebsunterbrechung', '12 - 18%', '12 Monate'],
      ['Elektronikversicherung', '10 - 15%', '12 Monate'],
    ]
  );

  renderText(ctx, `(3) Bei Sachversicherungen erfolgt keine vordiskontierte Einmalzahlung. Die Provision wird jährlich mit Prämienzahlung fällig.`);
  renderText(ctx, `(4) Bei mehrjährigen Verträgen wird die volle Courtage nur für das erste Versicherungsjahr gezahlt; für Folgejahre kann der Satz reduziert sein.`);

  addNewPage(ctx);
  renderParagraph(ctx, '§ 14', 'Kraftfahrtversicherung');
  renderText(ctx, `(1) Die Kfz-Sparte weist aufgrund hoher Wettbewerbsintensität die niedrigsten Provisionssätze auf.`);
  renderText(ctx, `(2) Provisionssätze:`);

  renderTable(ctx,
    ['Produktart', 'Courtagesatz', 'Bemerkung'],
    [
      ['Kfz-Haftpflicht', '4 - 8%', 'Pflichtversicherung'],
      ['Kfz-Vollkasko', '6 - 10%', 'inkl. Teilkasko'],
      ['Kfz-Teilkasko', '5 - 8%', 'separat'],
      ['Motorrad', '5 - 8%', 'alle Deckungen'],
      ['Flottengeschäft', '2 - 5%', 'volumenabhängig'],
    ]
  );

  renderText(ctx, `(3) Die Stornohaftungszeit beträgt 12 Monate.`);
  renderText(ctx, `(4) Bei Flottengeschäft (ab 5 Fahrzeuge) gelten gesonderte volumenabhängige Vergütungsmodelle gemäß Anlage 4.`);

  renderParagraph(ctx, '§ 15', 'Unfallversicherung');
  renderText(ctx, `(1) Die Provision für Unfallversicherungen wird auf Basis des Nettojahresbeitrags berechnet.`);
  renderText(ctx, `(2) Provisionssätze:`);

  renderTable(ctx,
    ['Produktart', 'AP/Courtage', 'BP p.a.', 'Haftungszeit'],
    [
      ['Private Unfallversicherung', '20 - 40%', '1,0%', '24 Monate'],
      ['Kinderunfallversicherung', '25 - 40%', '1,0%', '24 Monate'],
      ['Gruppen-Unfallversicherung', '15 - 25%', '0,5%', '12 Monate'],
    ]
  );
}

// ==================== TEIL D: STORNOHAFTUNG ====================
function renderPartD(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'D', 'Stornohaftung und Stornoreserve');

  renderParagraph(ctx, '§ 16', 'Haftungszeiträume');
  renderText(ctx, `(1) Die gesetzlichen Haftungszeiträume gemäß § 49 VAG sind zwingend und betragen:`);

  renderTable(ctx,
    ['Versicherungssparte', 'Haftungszeit', 'Rechtsgrundlage'],
    [
      ['Lebensversicherung', '60 Monate', '§ 49 Abs. 1 VAG'],
      ['Substitutive Krankenversicherung', '60 Monate', '§ 49 Abs. 1 VAG'],
      ['Restschuldversicherung', '60 Monate', '§ 49 Abs. 1 VAG'],
      ['Sachversicherung', '12 - 24 Monate', 'Vertraglich'],
      ['Kfz-Versicherung', '12 Monate', 'Vertraglich'],
      ['Unfallversicherung', '24 Monate', 'Vertraglich'],
    ]
  );

  renderText(ctx, `(2) Vereinbarungen, die längere Haftungszeiten als 60 Monate vorsehen, sind gemäß § 49 Abs. 2 VAG i.V.m. § 134 BGB nichtig.`);
  renderText(ctx, `(3) Bei Verträgen mit kürzerer Laufzeit als der Haftungszeitraum endet die Haftung mit der regulären Vertragsbeendigung.`);

  renderParagraph(ctx, '§ 17', 'Berechnung der Provisionsrückforderung');
  renderText(ctx, `(1) Die Rückforderung erfolgt nach dem Pro-rata-temporis-Prinzip (1/60-Regelung bei 60 Monaten Haftungszeit):`);

  renderInfoBox(ctx, 'Berechnungsformel',
    'Verdiente Provision = (Gesamtprovision / Haftungsmonate) × bezahlte Monate\n' +
    'Rückforderung = Gesamtprovision − Verdiente Provision\n\n' +
    'Alternative Berechnung:\n' +
    'Rückforderung = Gesamtprovision × (verbleibende Haftungsmonate / Gesamthaftungszeit)'
  );

  renderText(ctx, `(2) Beispielrechnung:`);

  renderTable(ctx,
    ['Beispiel', 'AP', 'Storno nach', 'Verdient', 'Rückforderung'],
    [
      ['Fall 1', '6.000 €', '12 Mon.', '1.200 €', '4.800 €'],
      ['Fall 2', '6.000 €', '36 Mon.', '3.600 €', '2.400 €'],
      ['Fall 3', '6.000 €', '48 Mon.', '4.800 €', '1.200 €'],
      ['Fall 4', '6.000 €', '60 Mon.', '6.000 €', '0 €'],
    ]
  );

  renderText(ctx, `(3) Die maximale Verdienung ist auf 50% der tatsächlich gezahlten Beiträge begrenzt.`);

  addNewPage(ctx);
  renderParagraph(ctx, '§ 18', 'Stornoreserve');
  renderText(ctx, `(1) Zur Sicherung etwaiger Rückforderungsansprüche werden 10% der Abschlussprovision einbehalten.`);
  renderText(ctx, `(2) Die Stornoreserve wird auf einem separaten Konto geführt und ist unverzinslich.`);
  renderText(ctx, `(3) Die Freigabe erfolgt sukzessive je Einzelvertrag nach Ablauf des jeweiligen Provisionshaftungszeitraums – nicht erst bei Beendigung des Agenturvertrages.`);
  renderText(ctx, `(4) Eine „Ewigkeitsklausel" mit Einbehalt bis zum Ablauf des letzten Vertrages ist unwirksam.`);

  renderInfoBox(ctx, 'Kontoführung Stornoreserve',
    'Beispiel: AP 3.000 €, Stornoreserve 10% = 300 €\n\n' +
    'Freigabe nach 60 Monaten: 300 € (vollständig)\n' +
    'Bei Storno nach 30 Mon.: Verrechnung mit Rückforderung möglich'
  );

  renderParagraph(ctx, '§ 19', 'Stornotatbestände');
  renderText(ctx, `(1) Als Storno im Sinne dieser Bestimmungen gelten:`);
  renderBulletList(ctx, [
    'Kündigung durch den Versicherungsnehmer',
    'Widerruf des Versicherungsvertrages',
    'Beitragsfreistellung gemäß § 165 VVG',
    'Ruhendstellung gemäß § 193 Abs. 6 S. 4 VVG (PKV)',
    'Rückkauf der Versicherung',
    'Nichtzahlung der Erstprämie',
    'Qualifizierter Beitragsrückstand'
  ]);

  renderText(ctx, `(2) Kein Storno liegt vor bei:`);
  renderBulletList(ctx, [
    'Kündigung wegen Eintritt der GKV-Versicherungspflicht (§ 205 Abs. 2 VVG)',
    'Tod des Versicherungsnehmers',
    'Regulärem Vertragsablauf',
    'Kündigung durch die Gesellschaft aus wichtigem Grund'
  ]);

  addNewPage(ctx);
  renderParagraph(ctx, '§ 20', 'Stornonachbearbeitung');
  renderText(ctx, `(1) Bei Stornogefahr informiert die Gesellschaft den Vertreter unverzüglich, spätestens innerhalb von zwei Wochen nach Bekanntwerden, schriftlich (Stornogefahrmitteilung).`);
  renderText(ctx, `(2) Die Gesellschaft hat ein Wahlrecht zwischen:`);
  renderBulletList(ctx, [
    'Eigennachbearbeitung durch den Innendienst',
    'Mitteilung an den betreuenden Vertreter mit Nachbearbeitungsauftrag'
  ]);
  renderText(ctx, `(3) Die bloße Versendung der Stornogefahrmitteilung an den Bestandsnachfolger (statt an den Abschlussvermittler) genügt nicht (BGH VII ZR 130/11).`);
  renderText(ctx, `(4) Dem Vertreter ist eine angemessene Frist zur Nachbearbeitung einzuräumen (in der Regel 4 Wochen).`);
  renderText(ctx, `(5) Bei Widerruf ist keine Nachbearbeitung erforderlich; bei Beitragsfreistellung hingegen schon.`);
}

// ==================== TEIL E: ABRECHNUNGSMODALITÄTEN ====================
function renderPartE(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'E', 'Abrechnungsmodalitäten');

  renderParagraph(ctx, '§ 21', 'Abrechnungsintervalle');
  renderText(ctx, `(1) Die Provisionsabrechnung erfolgt monatlich gemäß § 87c Abs. 1 HGB.`);
  renderText(ctx, `(2) Die Abrechnung hat spätestens bis zum Ende des auf den Abrechnungszeitraum folgenden Monats zu erfolgen.`);
  renderText(ctx, `(3) Die Abrechnung enthält:`);
  renderBulletList(ctx, [
    'Alle im Abrechnungszeitraum entstandenen Provisionsansprüche',
    'Alle Rückbuchungen und Stornierungen',
    'Saldostand des Provisionskontos',
    'Saldostand des Stornoreservekontos'
  ]);

  renderParagraph(ctx, '§ 22', 'Buchauszugsanspruch');
  renderText(ctx, `(1) Der Vertreter kann gemäß § 87c Abs. 2 HGB jederzeit einen Buchauszug über alle provisionspflichtigen Geschäfte verlangen. Dieses Recht ist unverzichtbar.`);
  renderText(ctx, `(2) Der Buchauszug muss mindestens enthalten:`);
  renderBulletList(ctx, [
    'Name und Anschrift des Versicherungsnehmers',
    'Datum des Vertragsschlusses / der Policierung',
    'Art und Inhalt des Versicherungsvertrags (Sparte, Tarifart)',
    'Jahresbeitrag und Versicherungssumme',
    'Bei Lebensversicherungen: Eintrittsalter, Laufzeit, BWS',
    'Provisionssatz und berechnete Provision',
    'Bei Stornierungen: Datum, Gründe, ergriffene Bestandserhaltungsmaßnahmen'
  ]);
  renderText(ctx, `(3) Der Buchauszugsanspruch verjährt selbständig in drei Jahren (§ 195 BGB), beginnend mit Schluss des Jahres der abschließenden Abrechnung.`);

  renderParagraph(ctx, '§ 23', 'Saldierung und Kontoführung');
  renderText(ctx, `(1) Die Kontenstruktur umfasst:`);
  renderBulletList(ctx, [
    'Provisionskonto: Laufende Gutschriften und Belastungen',
    'Stornoreservekonto: Einbehaltene Reserven je Vertrag',
    'Auszahlungskonto: Zur Auszahlung freigegebene Provisionen'
  ]);
  renderText(ctx, `(2) Die Verrechnung von Rückforderungen mit fälligen Provisionsansprüchen ist zulässig.`);
  renderText(ctx, `(3) Eine pauschale Verrechnung ohne Einzelnachweis der Rückforderungen ist unzulässig.`);
}

// ==================== TEIL F: SONDERVERGÜTUNGEN ====================
function renderPartF(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'F', 'Sondervergütungen');

  renderParagraph(ctx, '§ 24', 'Produktionsabhängige Boni');
  renderText(ctx, `(1) Bei Erreichen definierter Produktionsziele können zusätzliche Boni gewährt werden:`);

  renderTable(ctx,
    ['Bonusart', 'Voraussetzung', 'Höhe'],
    [
      ['Staffelbonus', 'Überschreiten von Umsatzschwellen', '5 - 20% zusätzlich'],
      ['Jahresbonus', 'Jahreszielerreichung', 'Einmalzahlung'],
      ['Spartenbonus', 'Fokusprodukte', '5 - 15% zusätzlich'],
      ['Neukundenbonus', 'Neukundenquote > 30%', '10% auf NK-Geschäft'],
    ]
  );

  renderText(ctx, `(2) Die Bonusberechnung erfolgt kalenderjährlich. Die Auszahlung erfolgt im ersten Quartal des Folgejahres.`);

  renderParagraph(ctx, '§ 25', 'Qualitätsboni');
  renderText(ctx, `(1) Qualitätsboni belohnen nachhaltige Vermittlung und Kundenzufriedenheit:`);
  renderBulletList(ctx, [
    'Stornoquoten-Bonus: Bei Stornoquote unter 15%',
    'Kundenzufriedenheits-Bonus: Basierend auf NPS-Befragungen',
    'Schadenquoten-Bonus: Bei günstiger Schadenentwicklung',
    'Bestandswachstums-Bonus: Bei positiver Netto-Bestandsentwicklung'
  ]);

  renderParagraph(ctx, '§ 26', 'Sachkostenzuschüsse');
  renderText(ctx, `(1) Die Gesellschaft kann folgende Zuschüsse gewähren:`);
  renderBulletList(ctx, [
    'Bürokostenzuschuss: Monatliche Pauschale (typisch 200 - 500 €)',
    'Technikzuschuss: Hardware, Software, Kommunikation',
    'Marketingzuschuss: Lokale Werbemaßnahmen'
  ]);
  renderText(ctx, `(2) Diese Zuschüsse sind als freiwillige Leistungen deklariert und begründen keinen Rechtsanspruch für die Zukunft. Sie können jedoch nicht an eine Kündigung gekoppelt werden.`);

  renderParagraph(ctx, '§ 27', 'Garantieprovisionen');
  renderText(ctx, `(1) Berufsanfänger können eine Mindestprovision (Garantieprovision) erhalten:`);
  renderBulletList(ctx, [
    'Typische Höhe: 2.000 - 3.000 € monatlich',
    'Laufzeit: 12 - 24 Monate',
    'Verrechnung mit tatsächlich verdienter Provision'
  ]);
  renderText(ctx, `(2) Rückzahlungsklauseln bei Unterschreitung sind in der Regel unwirksam.`);
}

// ==================== TEIL G: BESONDERE REGELUNGEN ====================
function renderPartG(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'G', 'Besondere Regelungen');

  renderParagraph(ctx, '§ 28', 'Bestandsübertragungen');
  renderText(ctx, `(1) Bei Bestandsübertragungen gelten die GDV-Usancen als Orientierung:`);
  renderBulletList(ctx, [
    'Einjährige Verträge: Alt-Vermittler erhält Provision bis Vertragsablauf',
    'Mehrjährige Verträge: 50/50-Aufteilung für die Restlaufzeit',
    'Keine Stornohaftungsübertragung für bereits abgeschlossene Verträge'
  ]);

  renderParagraph(ctx, '§ 29', 'Vermittlerwechsel');
  renderText(ctx, `(1) Bei Ausscheiden des Vertreters gelten für Provisionsansprüche:`);
  renderBulletList(ctx, [
    'Dynamikprovisionen: Anspruch bleibt bestehen (BGH)',
    'Überhangprovisionen (§ 87 Abs. 3 HGB): Können nicht pauschal ausgeschlossen werden',
    'Bestandsprovisionen: Enden mit Bestandsübergabe'
  ]);
  renderText(ctx, `(2) Folgende Klausel ist unwirksam: „Mit der Beendigung des Vertragsverhältnisses erlischt jeder Anspruch des Vertreters gegen die Gesellschaft auf irgendwelche Provisionen..."`);

  renderParagraph(ctx, '§ 30', 'Gemeinschaftsgeschäfte');
  renderText(ctx, `(1) Bei Beteiligung mehrerer Vermittler muss die Provisionsaufteilung schriftlich vereinbart werden.`);
  renderText(ctx, `(2) Ohne Vereinbarung gilt hälftige Aufteilung.`);
  renderText(ctx, `(3) Die Stornohaftung folgt der Provisionsaufteilung.`);
}

// ==================== TEIL H: SCHLUSSBESTIMMUNGEN ====================
function renderPartH(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'H', 'Schlussbestimmungen');

  renderParagraph(ctx, '§ 31', 'Änderungsvorbehalte');
  renderText(ctx, `(1) Die Gesellschaft behält sich das Recht vor, diese Provisionsbestimmungen bei sachlich gerechtfertigten Gründen anzupassen.`);
  renderText(ctx, `(2) Änderungen werden dem Vertreter mindestens drei Monate vor Inkrafttreten schriftlich mitgeteilt.`);
  renderText(ctx, `(3) Bei wesentlichen Verschlechterungen steht dem Vertreter ein Sonderkündigungsrecht zu.`);

  renderParagraph(ctx, '§ 32', 'Salvatorische Klausel');
  renderText(ctx, `(1) Sollten einzelne Bestimmungen dieser APB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.`);
  renderText(ctx, `(2) Anstelle der unwirksamen Bestimmung gilt diejenige wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.`);

  renderParagraph(ctx, '§ 33', 'Inkrafttreten');
  renderText(ctx, `(1) Diese Allgemeinen Provisionsbestimmungen treten am 01.01.2024 in Kraft.`);
  renderText(ctx, `(2) Mit Inkrafttreten dieser Bestimmungen verlieren alle vorherigen Fassungen ihre Gültigkeit.`);

  ctx.y += 20;
  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(...COLOR_TEXT);
  ctx.doc.text('München, den 01. Januar 2024', MARGIN_LEFT, ctx.y);
  ctx.y += 20;
  ctx.doc.text('Alpha Versicherung AG', MARGIN_LEFT, ctx.y);
  ctx.y += 5;
  ctx.doc.text('Der Vorstand', MARGIN_LEFT, ctx.y);
}

// ==================== ANLAGEN ====================
function renderAnlagen(ctx: PDFContext): void {
  renderSectionHeader(ctx, 'Anlage 1', 'Provisionstabelle Lebensversicherung');

  renderText(ctx, `Gültig ab: 01.01.2024`);
  ctx.y += 5;

  renderTable(ctx,
    ['Produktgruppe', 'BWS-Faktor', 'Stufe 1', 'Stufe 2', 'Stufe 3', 'BP'],
    [
      ['Kapital-LV klassisch', '1,0', '25‰', '30‰', '35‰', '1,5%'],
      ['Kapital-LV fondsgebunden', '1,0', '25‰', '30‰', '35‰', '1,5%'],
      ['Risiko-LV', '0,5', '25‰', '30‰', '35‰', '1,0%'],
      ['Rentenversicherung klassisch', '1,0', '25‰', '30‰', '35‰', '1,5%'],
      ['Rentenversicherung fondsgebunden', '1,0', '25‰', '30‰', '35‰', '1,5%'],
      ['Riester-Rente', '0,5', '25‰', '30‰', '35‰', '1,5%'],
      ['Rürup-Rente', '0,5', '25‰', '30‰', '35‰', '1,5%'],
      ['BU-Versicherung', '1,0', '30‰', '35‰', '40‰', '1,5%'],
      ['SBU-Versicherung', '1,0', '30‰', '35‰', '40‰', '1,5%'],
      ['Erwerbsminderung', '1,0', '25‰', '30‰', '35‰', '1,5%'],
      ['Einmalbeitrag (sofort)', '0,125', '20‰', '25‰', '30‰', '0,5%'],
      ['Einmalbeitrag (aufgeschoben)', '0,5', '20‰', '25‰', '30‰', '0,5%'],
    ]
  );

  addNewPage(ctx);
  renderSectionHeader(ctx, 'Anlage 2', 'Provisionstabelle Krankenversicherung');
  renderText(ctx, `Gültig ab: 01.01.2024`);
  ctx.y += 5;

  renderTable(ctx,
    ['Produktgruppe', 'Stufe 1', 'Stufe 2', 'Stufe 3', 'Max.', 'BP'],
    [
      ['PKV Vollversicherung Arbeitnehmer', '6,0 MB', '7,5 MB', '9,0 MB', '9,0 MB', '1,5%'],
      ['PKV Vollversicherung Selbständige', '6,0 MB', '7,5 MB', '9,0 MB', '9,0 MB', '1,5%'],
      ['PKV Vollversicherung Beamte', '5,0 MB', '6,0 MB', '7,0 MB', '9,0 MB', '1,5%'],
      ['Zusatz ambulant', '5,0 MB', '6,0 MB', '7,0 MB', '-', '1,0%'],
      ['Zusatz stationär', '6,0 MB', '7,0 MB', '8,0 MB', '-', '1,0%'],
      ['Zusatz Zahn', '5,0 MB', '6,0 MB', '7,0 MB', '-', '1,0%'],
      ['Pflegezusatz', '4,0 MB', '5,0 MB', '6,0 MB', '-', '1,0%'],
      ['Krankentagegeld', '5,0 MB', '6,0 MB', '7,0 MB', '-', '1,0%'],
      ['Auslandsreise-KV', '3,0 MB', '4,0 MB', '5,0 MB', '-', '0,5%'],
    ]
  );

  addNewPage(ctx);
  renderSectionHeader(ctx, 'Anlage 3', 'Provisionstabelle Sachversicherung');
  renderText(ctx, `Gültig ab: 01.01.2024`);
  ctx.y += 5;

  renderTable(ctx,
    ['Versicherungsart', 'Courtage Stufe 1', 'Courtage Stufe 2', 'Courtage Stufe 3'],
    [
      ['Privathaftpflicht', '18%', '20%', '22%'],
      ['Hausrat', '18%', '20%', '22%'],
      ['Wohngebäude', '15%', '18%', '20%'],
      ['Glas', '15%', '18%', '20%'],
      ['Rechtsschutz', '18%', '20%', '22%'],
      ['Tierhalterhaftpflicht', '15%', '18%', '20%'],
      ['Unfallversicherung', '25%', '30%', '35%'],
      ['Kfz-Haftpflicht', '5%', '6%', '7%'],
      ['Kfz-Vollkasko', '7%', '8%', '9%'],
      ['Kfz-Teilkasko', '6%', '7%', '8%'],
      ['Gewerbe-Haftpflicht', '12%', '15%', '18%'],
      ['Gewerbe-Inhalte', '10%', '12%', '14%'],
    ]
  );

  addNewPage(ctx);
  renderSectionHeader(ctx, 'Anlage 4', 'Bonusregelungen');
  renderText(ctx, `Gültig ab: 01.01.2024`);
  ctx.y += 5;

  renderText(ctx, `1. Produktionsstaffel Leben/Kranken (jährlich)`);
  renderTable(ctx,
    ['BWS-Stufe', 'Zusatzprovision'],
    [
      ['bis 500.000 €', 'Grundsatz'],
      ['500.001 € - 1.000.000 €', '+5%'],
      ['1.000.001 € - 2.000.000 €', '+10%'],
      ['über 2.000.000 €', '+15%'],
    ]
  );

  ctx.y += 10;
  renderText(ctx, `2. Stornoquoten-Bonus`);
  renderTable(ctx,
    ['Stornoquote', 'Bonus'],
    [
      ['> 20%', 'kein Bonus'],
      ['15% - 20%', '5% auf AP'],
      ['10% - 15%', '10% auf AP'],
      ['< 10%', '15% auf AP'],
    ]
  );

  ctx.y += 10;
  renderText(ctx, `3. Neukundenbonus`);
  renderText(ctx, `Bei Neukundenquote über 30%: +10% auf das gesamte Neukundengeschäft`);
}

// ==================== HILFSFUNKTIONEN ====================

function renderSectionHeader(ctx: PDFContext, part: string, title: string): void {
  checkPageBreak(ctx, 30);

  ctx.doc.setFillColor(...COLOR_PRIMARY);
  ctx.doc.rect(MARGIN_LEFT, ctx.y - 5, CONTENT_WIDTH, 12, 'F');

  ctx.doc.setFontSize(14);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(255, 255, 255);
  ctx.doc.text(`${part}. ${title}`, MARGIN_LEFT + 5, ctx.y + 3);

  ctx.y += 15;
}

function renderParagraph(ctx: PDFContext, number: string, title: string): void {
  checkPageBreak(ctx, 20);
  ctx.y += 8;

  ctx.doc.setFontSize(11);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(...COLOR_PRIMARY);
  ctx.doc.text(`${number} ${title}`, MARGIN_LEFT, ctx.y);

  ctx.y += 8;
}

function renderText(ctx: PDFContext, text: string): void {
  checkPageBreak(ctx, 15);

  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(...COLOR_TEXT);

  const lines = ctx.doc.splitTextToSize(text, CONTENT_WIDTH);
  lines.forEach((line: string) => {
    checkPageBreak(ctx, LINE_HEIGHT + 2);
    ctx.doc.text(line, MARGIN_LEFT, ctx.y);
    ctx.y += LINE_HEIGHT;
  });
  ctx.y += 3;
}

function renderBulletList(ctx: PDFContext, items: string[]): void {
  ctx.doc.setFontSize(10);
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setTextColor(...COLOR_TEXT);

  items.forEach(item => {
    checkPageBreak(ctx, 10);
    const lines = ctx.doc.splitTextToSize(item, CONTENT_WIDTH - 10);
    ctx.doc.text('•', MARGIN_LEFT + 3, ctx.y);
    lines.forEach((line: string, idx: number) => {
      ctx.doc.text(line, MARGIN_LEFT + 8, ctx.y);
      ctx.y += LINE_HEIGHT;
      if (idx < lines.length - 1) checkPageBreak(ctx, LINE_HEIGHT);
    });
  });
  ctx.y += 2;
}

function renderInfoBox(ctx: PDFContext, title: string, content: string): void {
  checkPageBreak(ctx, 40);

  const lines = content.split('\n');
  const boxHeight = 12 + lines.length * 5;

  ctx.doc.setFillColor(...COLOR_TABLE_HEADER);
  ctx.doc.roundedRect(MARGIN_LEFT, ctx.y, CONTENT_WIDTH, boxHeight, 2, 2, 'F');

  ctx.doc.setDrawColor(...COLOR_SECONDARY);
  ctx.doc.setLineWidth(0.5);
  ctx.doc.line(MARGIN_LEFT, ctx.y, MARGIN_LEFT, ctx.y + boxHeight);

  ctx.y += 6;
  ctx.doc.setFontSize(9);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(...COLOR_SECONDARY);
  ctx.doc.text(title, MARGIN_LEFT + 5, ctx.y);

  ctx.y += 5;
  ctx.doc.setFont('courier', 'normal');
  ctx.doc.setFontSize(9);
  ctx.doc.setTextColor(...COLOR_TEXT);

  lines.forEach(line => {
    ctx.doc.text(line, MARGIN_LEFT + 5, ctx.y);
    ctx.y += 4.5;
  });

  ctx.y += 5;
}

function renderTable(ctx: PDFContext, headers: string[], rows: string[][]): void {
  const colCount = headers.length;
  const colWidth = CONTENT_WIDTH / colCount;

  checkPageBreak(ctx, 20 + rows.length * 7);

  // Header
  ctx.doc.setFillColor(...COLOR_TABLE_HEADER);
  ctx.doc.rect(MARGIN_LEFT, ctx.y, CONTENT_WIDTH, 7, 'F');

  ctx.doc.setFontSize(8);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setTextColor(...COLOR_TEXT);

  headers.forEach((header, i) => {
    ctx.doc.text(header, MARGIN_LEFT + i * colWidth + 2, ctx.y + 5);
  });
  ctx.y += 7;

  // Rows
  ctx.doc.setFont('helvetica', 'normal');
  rows.forEach((row, rowIdx) => {
    checkPageBreak(ctx, 7);

    if (rowIdx % 2 === 1) {
      ctx.doc.setFillColor(...COLOR_TABLE_ALT);
      ctx.doc.rect(MARGIN_LEFT, ctx.y, CONTENT_WIDTH, 6, 'F');
    }

    row.forEach((cell, i) => {
      const truncated = cell.length > 20 ? cell.substring(0, 18) + '..' : cell;
      ctx.doc.text(truncated, MARGIN_LEFT + i * colWidth + 2, ctx.y + 4);
    });
    ctx.y += 6;
  });

  ctx.y += 5;
}

export { generateSampleProvisionsRules as default };
