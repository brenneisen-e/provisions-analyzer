# Provisions-Analyzer

Ein KI-gestütztes Web-Tool zur **automatischen Erklärung von Provisionsabrechnungen** für Versicherungsvermittler. Das Tool analysiert Provisionsbestimmungen aus PDF-Dokumenten und generiert verständliche, schrittweise Berechnungserklärungen für jede einzelne Provisionstransaktion.

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Hauptfunktionen](#hauptfunktionen)
3. [Technologie-Stack](#technologie-stack)
4. [Installation & Start](#installation--start)
5. [Benutzeranleitung](#benutzeranleitung)
6. [Architektur & Datenfluss](#architektur--datenfluss)
7. [Komponenten-Übersicht](#komponenten-übersicht)
8. [Provisionsregeln](#provisionsregeln)
9. [Demo-Modus](#demo-modus)
10. [Export-Funktionen](#export-funktionen)
11. [Datenschutz & Sicherheit](#datenschutz--sicherheit)
12. [Deployment](#deployment)
13. [Entwicklung](#entwicklung)

---

## Überblick

### Was macht das Tool?

Der **Provisions-Analyzer** löst ein häufiges Problem in der Versicherungsbranche: Provisionsabrechnungen sind oft komplex und schwer nachvollziehbar. Dieses Tool:

1. **Extrahiert Provisionsregeln** aus PDF-Dokumenten (Provisionsbestimmungen)
2. **Parst Transaktionen** aus Provisionsabrechnungen
3. **Generiert verständliche Erklärungen** mit schrittweisen Berechnungen
4. **Zeigt Quellenreferenzen** (z.B. "§4 Abs. 1") für jede Berechnung

### Für wen ist es gedacht?

- Versicherungsvermittler, die ihre Provisionsabrechnungen verstehen wollen
- Makler, die Provisionen gegenüber Kunden oder Mitarbeitern erklären müssen
- Versicherungsunternehmen für interne Schulungen

---

## Hauptfunktionen

### 1. PDF-Analyse & Regelextraktion

- **Intelligentes Chunking**: Große PDF-Dokumente werden in optimale Abschnitte (~40KB) aufgeteilt
- **KI-gestützte Extraktion**: Claude AI extrahiert strukturierte Regeln aus Fließtext
- **Duplikat-Erkennung**: Automatische Zusammenführung doppelter Regeln
- **Kategorisierung**: Automatische Zuordnung zu Provisionsarten (Abschluss, Bestand, Storno, etc.)

### 2. Transaktions-Analyse

- **Automatisches Parsing**: Erkennung von Transaktionen aus verschiedenen Abrechnungsformaten
- **Deutsche Formate**: Korrekte Verarbeitung von Datumsformaten (TT.MM.JJJJ) und Zahlen (1.234,56 €)
- **Intelligentes Matching**: Zuordnung von Transaktionen zu passenden Provisionsregeln

### 3. Erklärungsgenerierung

- **Schrittweise Berechnungen**: Jede Provision wird Schritt für Schritt erklärt
- **Quellenreferenzen**: Verweis auf konkrete Paragraphen (§3 Abs. 2)
- **Konfidenz-Bewertung**: Einschätzung der Erklärungsgenauigkeit (Hoch/Mittel/Niedrig)
- **Formel-Darstellung**: Transparente Darstellung der Berechnungsformeln

### 4. Dashboard & Statistiken

- **Gesamtübersicht**: Summe aller Provisionen auf einen Blick
- **Aufschlüsselung nach Typ**: Abschluss, Bestand, Storno, Dynamik, etc.
- **Aufschlüsselung nach Sparte**: KV, SHUK, LV, KFZ
- **Konfidenz-Verteilung**: Übersicht über die Erklärungsqualität

### 5. Export & Präsentation

- **PDF-Export**: Professionelle Reports mit allen Berechnungen
- **Präsentations-Modus**: Optimierte Ansicht für Bildschirmfreigabe
- **Filter & Suche**: Schnelles Finden spezifischer Transaktionen

---

## Technologie-Stack

| Komponente | Technologie | Version |
|------------|-------------|---------|
| **Frontend** | React + TypeScript | 19.2 |
| **Build Tool** | Vite | 7.2 |
| **Styling** | Tailwind CSS | 4.1 |
| **State Management** | Zustand | 5.0 |
| **PDF Lesen** | pdf.js | 5.4 |
| **PDF Erstellen** | jsPDF | 3.0 |
| **Icons** | Lucide React | 0.556 |
| **KI/LLM** | Anthropic Claude API | 0.71 |
| **Deployment** | Cloudflare Pages | - |

---

## Installation & Start

### Voraussetzungen

- Node.js 18 oder höher
- npm oder yarn
- Anthropic API-Key (für KI-Funktionen)

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd provisions-analyzer

# Abhängigkeiten installieren
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

Das Tool ist dann unter `http://localhost:5173` erreichbar.

### Produktions-Build erstellen

```bash
npm run build
```

Die Build-Dateien befinden sich im `dist/` Verzeichnis.

### Vorschau des Builds

```bash
npm run preview
```

---

## Benutzeranleitung

### Schritt 1: API-Key einrichten

1. Öffnen Sie das Tool im Browser
2. Geben Sie Ihren **Anthropic API-Key** ein
3. Klicken Sie auf "Validieren" um den Key zu prüfen

> **Tipp**: Der API-Key wird lokal im Browser gespeichert und nie an einen Server übertragen.

### Schritt 2: Provisionsbestimmungen laden

Sie haben drei Möglichkeiten:

#### Option A: Demo-Modus (empfohlen zum Testen)
- Klicken Sie auf "Demo starten"
- Alle Daten sind vorgeladen, kein API-Key erforderlich

#### Option B: Vordefinierte Regeln
- Klicken Sie auf "Alpha Insurance Regeln laden"
- Über 100 vordefinierte Regeln werden geladen

#### Option C: Eigene PDF hochladen
1. Klicken Sie auf "PDF hochladen" im Bereich "Provisionsbestimmungen"
2. Wählen Sie Ihre PDF-Datei aus
3. Warten Sie, bis die Regelextraktion abgeschlossen ist
4. Die Fortschrittsanzeige zeigt den aktuellen Status

### Schritt 3: Provisionsabrechnung analysieren

1. Wechseln Sie zum Tab "Analysieren"
2. Laden Sie Ihre Provisionsabrechnung (PDF) hoch
3. Das Tool parst automatisch alle Transaktionen
4. Für jede Transaktion wird eine Erklärung generiert

### Schritt 4: Ergebnisse verstehen

#### Dashboard
- **Gesamtsumme**: Alle Provisionen summiert
- **Nach Typ**: Verteilung auf Abschluss, Bestand, etc.
- **Nach Sparte**: Verteilung auf KV, SHUK, LV, KFZ
- **Konfidenz**: Qualität der Erklärungen

#### Transaktionsliste
- Klicken Sie auf eine Zeile, um Details zu sehen
- Nutzen Sie die Suchfunktion zum Filtern
- Filtern Sie nach Konfidenz-Level

#### Berechnungsdetails
- **Zusammenfassung**: Kurze Erklärung in einem Satz
- **Berechnungsschritte**: Schritt-für-Schritt Nachvollzug
- **Angewandte Regeln**: Welche Provisionsregeln greifen
- **Quellenreferenz**: Paragraphen-Verweis

### Schritt 5: Exportieren

1. Klicken Sie auf "Als PDF exportieren"
2. Wählen Sie die gewünschten Optionen
3. Der Report wird als PDF heruntergeladen

---

## Architektur & Datenfluss

### Gesamtarchitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client-Side)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   SetupView  │    │  AnalyzeView │    │  ExportModal │       │
│  │              │    │              │    │              │       │
│  │ - API-Key    │    │ - Upload     │    │ - PDF Gen    │       │
│  │ - PDF Upload │    │ - Dashboard  │    │ - Filter     │       │
│  │ - Rules      │    │ - Tabelle    │    │              │       │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘       │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    ZUSTAND STORES                        │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐  │    │
│  │  │  appStore   │ │ rulesStore  │ │ transactionsStore │  │    │
│  │  │  (API-Key,  │ │ (Regeln,    │ │ (Transaktionen,   │  │    │
│  │  │   UI-State) │ │  Chunks)    │ │  Erklärungen)     │  │    │
│  │  └─────────────┘ └─────────────┘ └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                      SERVICES                            │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────────────┐  │    │
│  │  │  pdfParser  │ │ruleExtractor│ │transactionMatcher │  │    │
│  │  │  (pdf.js)   │ │  (Claude)   │ │    (Claude)       │  │    │
│  │  └─────────────┘ └─────────────┘ └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Anthropic API  │
                    │  (Claude)       │
                    └─────────────────┘
```

### Datenfluss: Regelextraktion

```
PDF-Datei
    │
    ▼
extractTextFromPDF()          ─── pdf.js liest PDF
    │
    ▼
chunkDocument()               ─── Aufteilen in ~40KB Chunks
    │                             (mit 500 Zeichen Überlappung)
    ▼
extractRulesFromChunk()       ─── Für jeden Chunk:
    │                             Claude extrahiert Regeln
    ▼
Deduplizierung                ─── Zusammenführen doppelter Regeln
    │
    ▼
rulesStore                    ─── Speicherung im Zustand
                                  (persistiert in localStorage)
```

### Datenfluss: Transaktionsanalyse

```
Abrechnungs-PDF
    │
    ▼
extractTextFromPDF()          ─── pdf.js liest PDF
    │
    ▼
parseTransactionsFromText()   ─── Claude parst Transaktionen
    │
    ▼
transactionsStore             ─── Speicherung
    │
    ▼
Für jede Transaktion:
    │
    ├─► findMatchingRules()   ─── Scoring-Algorithmus findet
    │                             passende Regeln (Top 3)
    │
    └─► explainTransaction()  ─── Claude generiert:
            │                     - Zusammenfassung
            │                     - Berechnungsschritte
            │                     - Konfidenz
            ▼
    TransactionExplanation    ─── Gespeichert als Map
```

---

## Komponenten-Übersicht

### Projektstruktur

```
src/
├── components/                 # React-Komponenten
│   ├── ui/                    # Wiederverwendbare UI-Elemente
│   │   ├── Button.tsx         # Button mit Varianten
│   │   ├── Card.tsx           # Container-Karte
│   │   ├── Input.tsx          # Eingabefeld
│   │   ├── Select.tsx         # Dropdown
│   │   ├── Modal.tsx          # Dialog-Modal
│   │   ├── Badge.tsx          # Konfidenz-Badge
│   │   ├── Toast.tsx          # Benachrichtigungen
│   │   └── ProgressBar.tsx    # Fortschrittsbalken
│   │
│   ├── FileUpload.tsx         # Drag & Drop Upload
│   ├── CalculationBreakdown.tsx  # Detaillierte Berechnung
│   ├── SummaryDashboard.tsx   # Statistik-Dashboard
│   ├── RuleReferencePanel.tsx # Quellen-Seitenpanel
│   └── PresenterOverlay.tsx   # Präsentations-Modus
│
├── views/                     # Hauptansichten
│   ├── SetupView.tsx          # Einrichtung & Upload
│   ├── AnalyzeView.tsx        # Analyse & Ergebnisse
│   └── ExportModal.tsx        # PDF-Export Dialog
│
├── stores/                    # Zustand State-Management
│   ├── appStore.ts            # Globaler App-State
│   ├── rulesStore.ts          # Provisionsregeln
│   └── transactionsStore.ts   # Transaktionen & Erklärungen
│
├── services/                  # Business-Logik
│   ├── anthropicClient.ts     # Claude API Wrapper
│   ├── pdfParser.ts           # PDF-Text-Extraktion
│   ├── chunkAnalyzer.ts       # Dokument-Chunking
│   ├── ruleExtractor.ts       # Regelextraktion
│   ├── transactionMatcher.ts  # Matching & Erklärung
│   ├── pdfGenerator.ts        # PDF-Report-Generierung
│   └── provisionsRulesGenerator.ts  # Test-PDF Generator
│
├── data/                      # Statische Daten
│   ├── barmeniaRules.ts       # Vordefinierte Regeln (100+)
│   └── demoData.ts            # Demo-Transaktionen
│
├── types/                     # TypeScript-Definitionen
│   └── index.ts               # Alle Interfaces
│
└── utils/                     # Hilfsfunktionen
    └── helpers.ts             # Formatierung, etc.
```

### Wichtige TypeScript-Interfaces

```typescript
// Provisionsregel (aus PDF extrahiert)
interface ProvisionRule {
  id: string;
  name: string;                    // z.B. "Abschlussprovision KV Stufe 1"
  category: ProvisionCategory;     // 'Abschluss' | 'Bestand' | 'Storno' | ...
  products: string[];              // Passende Produkte
  conditions: string;              // Bedingungen als Text
  formula: string;                 // Berechnungsformel
  parameters: {
    rate?: number;                 // Provisionssatz (z.B. 0.12)
    basis?: string;                // Berechnungsbasis
    staffel?: StaffelItem[];       // Staffelung nach Produktion
  };
  sourceReference?: string;        // z.B. "§4 Abs. 1"
}

// Transaktion aus Abrechnung
interface Transaction {
  id: string;
  datum: string;                   // ISO-Format
  vertragsnummer: string;
  produktart: string;
  sparte: Sparte;                  // 'KV' | 'SHUK' | 'LV' | 'KFZ'
  beitrag?: number;
  bewertungssumme?: number;
  provisionsbetrag: number;
  provisionsart: ProvisionCategory;
  kundenname?: string;
  vermittlernummer?: string;
}

// Erklärung mit Berechnungsschritten
interface TransactionExplanation {
  transactionId: string;
  appliedRules: AppliedRuleInfo[];
  summary: string;                 // Kurze Zusammenfassung
  explanation: string;             // Ausführliche Erklärung
  calculationSteps: CalculationStep[];
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

// Einzelner Berechnungsschritt
interface CalculationStep {
  step: number;
  label: string;                   // z.B. "Beitragssumme ermitteln"
  formula: string;                 // z.B. "Monatsbeitrag × 12"
  inputValues: Record<string, number>;
  calculation: string;             // z.B. "52,68 € × 12 = 632,14 €"
  result: number;
  ruleReference: RuleReference;    // Quellenverweis
}
```

---

## Provisionsregeln

### Unterstützte Kategorien

| Kategorie | Beschreibung | Farbe |
|-----------|--------------|-------|
| **Abschluss** | Provision für Neuabschlüsse | Grün |
| **Bestand** | Laufende Bestandsprovision | Blau |
| **Storno** | Rückforderung bei Stornierung | Rot |
| **Dynamik** | Provision für Beitragserhöhungen | Violett |
| **Folge** | Folgeprovision nach Abschluss | Türkis |
| **Sonstige** | Andere Provisionsarten | Grau |

### Unterstützte Sparten

| Sparte | Beschreibung | Icon |
|--------|--------------|------|
| **KV** | Krankenversicherung | 🏥 |
| **SHUK** | Sach-, Haftpflicht-, Unfallversicherung | 🏠 |
| **LV** | Lebensversicherung | 💰 |
| **KFZ** | Kfz-Versicherung | 🚗 |

### Vordefinierte Regeln

Das Tool enthält über **100 vordefinierte Provisionsregeln** für "Alpha Insurance" (basierend auf typischen deutschen Versicherungsprovisionen):

- **KV-Regeln** (~17): Abschluss-, Folge-, Bestandsprovisionen mit Staffelung
- **SHUK-Regeln** (~20): Privat- und Gewerbekunden-Provisionen
- **LV-Regeln** (~15): Neugeschäft, Folge, Dynamik
- **KFZ-Regeln** (~10): Verschiedene Tarifarten

Jede Regel enthält:
- Quellenreferenz (z.B. "§4 Abs. 1")
- Berechnungsformel
- Parameter (Sätze, Staffeln)
- Bedingungen

---

## Demo-Modus

Der Demo-Modus ermöglicht das Testen des Tools **ohne API-Key**:

### Aktivierung

1. Auf der Startseite "Demo starten" klicken
2. Vordefinierte Daten werden geladen:
   - 100+ Provisionsregeln
   - 10 Beispiel-Transaktionen
   - Vorberechnete Erklärungen

### Demo-Transaktionen

| Typ | Sparte | Betrag | Konfidenz |
|-----|--------|--------|-----------|
| Abschluss | KV | 568,93 € | Hoch |
| Bestand | SHUK | 234,50 € | Hoch |
| Storno | LV | -1.250,00 € | Mittel |
| Dynamik | KV | 89,00 € | Hoch |
| ... | ... | ... | ... |

### Nutzung für Präsentationen

Der Demo-Modus eignet sich ideal für:
- Kundenpräsentationen
- Schulungen
- Evaluierung des Tools

---

## Export-Funktionen

### PDF-Report

Der Export erstellt einen professionellen PDF-Report mit:

1. **Deckblatt**
   - Dokumenttitel
   - Erstellungsdatum
   - Zusammenfassung

2. **Übersicht**
   - Gesamtprovision
   - Anzahl Transaktionen
   - Konfidenz-Verteilung

3. **Transaktionsliste**
   - Alle analysierten Transaktionen
   - Filterbar nach Kriterien

4. **Detailberechnungen**
   - Schrittweise Berechnungen
   - Angewandte Regeln
   - Quellenreferenzen

### Filter-Optionen

Vor dem Export können gefiltert werden:
- Nach Provisionsart
- Nach Sparte
- Nach Konfidenz-Level
- Nach Suchbegriff

---

## Datenschutz & Sicherheit

### Datenverarbeitung

| Aspekt | Beschreibung |
|--------|--------------|
| **PDF-Verarbeitung** | 100% lokal im Browser (pdf.js) |
| **Text-Extraktion** | Lokale Verarbeitung |
| **State-Speicherung** | localStorage (nur Browser) |
| **Server** | Kein eigener Backend-Server |

### API-Kommunikation

- Nur **anonymisierter Text** wird an Anthropic gesendet
- Keine personenbezogenen Daten in API-Anfragen
- API-Key wird **nur lokal** gespeichert
- HTTPS-Verschlüsselung für alle API-Calls

### Empfehlungen

1. **Sensible Daten**: Bei sehr sensiblen Dokumenten empfehlen wir die Nutzung des Demo-Modus
2. **API-Key**: Verwenden Sie API-Keys mit begrenztem Budget
3. **Browser-Cache**: Löschen Sie bei Bedarf localStorage

---

## Deployment

### Cloudflare Pages (empfohlen)

#### Option 1: Dashboard

1. [Cloudflare Pages](https://dash.cloudflare.com/pages) öffnen
2. "Create a project" klicken
3. Repository verbinden
4. Build-Einstellungen:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node.js**: 18+
5. "Save and Deploy"

#### Option 2: Wrangler CLI

```bash
# API-Token setzen
export CLOUDFLARE_API_TOKEN="your-token"

# Projekt erstellen
npx wrangler pages project create provisions-analyzer --production-branch main

# Deployen
npx wrangler pages deploy dist
```

### Andere Plattformen

Das Tool kann auf jeder statischen Hosting-Plattform deployed werden:

- **Vercel**: `vercel deploy`
- **Netlify**: Automatisch bei Git-Push
- **GitHub Pages**: Mit GitHub Actions

---

## Entwicklung

### Entwicklungsserver

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Type-Checking

```bash
npx tsc --noEmit
```

### Projektkonventionen

- **Komponenten**: PascalCase (z.B. `FileUpload.tsx`)
- **Hooks**: camelCase mit `use`-Prefix (z.B. `useAppStore`)
- **Services**: camelCase (z.B. `anthropicClient.ts`)
- **Typen**: PascalCase in `types/index.ts`

### State Management

Zustand wird für State Management verwendet:

```typescript
// Beispiel: appStore
const useAppStore = create(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      // ...
    }),
    { name: 'app-storage' }
  )
)
```

### Neue Regeln hinzufügen

Regeln können in `src/data/barmeniaRules.ts` hinzugefügt werden:

```typescript
{
  id: 'custom-rule-1',
  name: 'Meine Provisionsregel',
  category: 'Abschluss',
  products: ['Produktname'],
  conditions: 'Bedingungen hier...',
  formula: 'Beitrag × Satz',
  parameters: {
    rate: 0.12,
    basis: 'Monatsbeitrag'
  },
  sourceReference: '§X Abs. Y'
}
```

---

## Lizenz

MIT License

---

## Support & Feedback

Bei Fragen oder Problemen:
- GitHub Issues öffnen
- Pull Requests willkommen

---

*Entwickelt für die deutsche Versicherungsbranche*
