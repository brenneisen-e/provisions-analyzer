# Provisions-Analyzer

Ein Web-Tool zur automatischen Erklärung von Provisionsabrechnungen basierend auf Provisionsbestimmungen eines Versicherungsvermittlers.

## Features

- **PDF-Chunking für Provisionsbestimmungen**: Analysiert PDFs mit Provisionsbestimmungen und extrahiert strukturierte Regeln
- **Provisionsabrechnung analysieren**: Liest Provisionsabrechnungen (PDF) und extrahiert alle Transaktionen
- **Matching & Erklärungsgenerierung**: Matcht jede Transaktion gegen die extrahierten Regeln und generiert verständliche Erklärungen
- **Sample-PDF Generator**: Generiert realistische Beispiel-Provisionsabrechnungen zum Testen
- **Export-Funktionalität**: Exportiert die Analyse als PDF-Report

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **PDF-Verarbeitung**: pdf.js (Lesen) + jsPDF (Generierung)
- **State Management**: Zustand
- **Icons**: Lucide React
- **LLM**: Anthropic Claude API (clientseitig)

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment auf Cloudflare Pages

### Option 1: Über Cloudflare Dashboard

1. Gehe zu [Cloudflare Pages](https://dash.cloudflare.com/pages)
2. Klicke auf "Create a project"
3. Wähle "Connect to Git"
4. Wähle das Repository `provisions-analyzer`
5. Konfiguriere die Build-Einstellungen:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18 oder höher
6. Klicke auf "Save and Deploy"

### Option 2: Über Wrangler CLI

```bash
# Mit Cloudflare API Token
export CLOUDFLARE_API_TOKEN="your-api-token"

# Projekt erstellen
npx wrangler pages project create provisions-analyzer --production-branch main

# Deployen
npx wrangler pages deploy dist
```

## Nutzung

1. **Setup**: Gib deinen Anthropic API-Key ein
2. **Provisionsbestimmungen hochladen**: Lade die PDF mit deinen Provisionsbestimmungen hoch
3. **Analyse starten**: Das Tool extrahiert automatisch alle Provisionsregeln
4. **Abrechnung analysieren**: Lade eine Provisionsabrechnung hoch
5. **Erklärungen erhalten**: Für jede Transaktion wird eine Erklärung generiert

## Datenschutz

- Alle Daten werden lokal im Browser verarbeitet
- Nur API-Anfragen werden an Anthropic gesendet
- Keine Daten werden auf einem Server gespeichert

## Lizenz

MIT
