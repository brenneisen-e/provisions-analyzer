import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

/**
 * Initialisiert den Anthropic Client mit dem API-Key
 */
export function initAnthropicClient(apiKey: string): void {
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
}

/**
 * Prüft ob der Client initialisiert ist
 */
export function isClientInitialized(): boolean {
  return anthropicClient !== null;
}

/**
 * Sendet eine Anfrage an Claude
 */
export async function sendMessage(
  systemPrompt: string,
  userMessage: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  if (!anthropicClient) {
    throw new Error('Anthropic Client nicht initialisiert. Bitte API-Key eingeben.');
  }

  const { maxTokens = 4096, temperature = 0.3 } = options;

  const response = await anthropicClient.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage
      }
    ]
  });

  // Extract text from response
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Keine Textantwort von Claude erhalten');
  }

  return textContent.text;
}

/**
 * Validiert den API-Key durch einen Test-Request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testClient = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    await testClient.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });

    return true;
  } catch (error) {
    console.error('API Key validation failed:', error);
    return false;
  }
}

/**
 * Extrahiert JSON aus einer Claude-Antwort
 */
export function extractJSON<T>(response: string): T | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }

    // Try to find JSON array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]) as T;
    }

    return null;
  } catch (error) {
    console.error('JSON extraction failed:', error);
    return null;
  }
}

// Prompts für verschiedene Aufgaben

export const PROMPTS = {
  RULE_EXTRACTION: `Du analysierst einen Abschnitt aus Provisionsbestimmungen eines Versicherungsvermittlers.

Extrahiere alle Provisionsregeln in diesem Abschnitt als strukturiertes JSON. Sei präzise und vollständig.

Antworte NUR mit dem JSON, ohne zusätzlichen Text:
{
  "rules": [
    {
      "id": "unique-id (z.B. regel-001)",
      "name": "Regelname/Paragraph",
      "category": "Abschluss|Bestand|Storno|Dynamik|Sonstig",
      "products": ["Leben", "Sach", "Kranken", "KFZ", etc.],
      "conditions": "Wann greift diese Regel (Bedingungen)",
      "formula": "Berechnungsformel in Worten oder als Formel",
      "parameters": {
        "rate": "Prozentsatz oder Staffelbeschreibung",
        "basis": "Bewertungssumme|Jahresbeitrag|Monatsbeitrag|..."
      },
      "notes": "Besonderheiten, Ausnahmen, Stornohaftung etc."
    }
  ]
}

Falls keine Provisionsregeln im Abschnitt gefunden werden, antworte mit {"rules": []}.`,

  TRANSACTION_EXPLANATION: `Du bist ein Experte für Versicherungsprovisionen. Deine Aufgabe ist es, einem Vermittler zu erklären, wie ein Provisionsbetrag berechnet wurde.

## WICHTIGER KONTEXT
Die Provisionsabrechnung ist korrekt. Du erklärst die Berechnung, du prüfst nicht auf Fehler.
Der Vermittler möchte verstehen: "Wie kommt dieser Betrag zustande?"

## DEINE AUFGABE
Erkläre Schritt für Schritt, wie der Provisionsbetrag berechnet wurde. Jeder Schritt muss eine Regelwerk-Referenz haben.

## AUSGABEFORMAT (JSON)
Antworte NUR mit diesem JSON-Format:

{
  "summary": "Ein Satz, der die Berechnung zusammenfasst. Z.B. 'Abschlussprovision nach KV-Staffel Stufe 2 mit Qualitätsbonus.'",

  "appliedRules": [
    {"id": "regel-id", "name": "Regelname", "category": "Kategorie"}
  ],

  "explanation": "Ausführliche Erklärung in 2-3 Sätzen",

  "calculation": "Die finale Berechnung als Formel mit eingesetzten Werten = Ergebnis",

  "calculationSteps": [
    {
      "step": 1,
      "label": "Kurzer Titel des Schritts",
      "description": "Erklärung in 1-2 Sätzen, warum dieser Schritt gemacht wird",
      "formula": "Mathematische Formel mit sprechenden Variablennamen",
      "inputValues": {"variablenname": 123.45},
      "calculation": "Die Formel mit eingesetzten Zahlen = Ergebnis",
      "result": 123.45,
      "resultLabel": "Name des Zwischenergebnisses",
      "ruleReference": {
        "paragraph": "§X Abs. Y",
        "document": "Name des Regelwerks",
        "quote": "EXAKTER Wortlaut aus dem Regelwerk, der diesen Schritt begründet"
      }
    }
  ],

  "finalAmount": 1234.56,

  "confidence": "high|medium|low",

  "confidenceReasons": ["Warum du dir bei dieser Erklärung sicher/unsicher bist"],

  "notes": "Optionale zusätzliche Informationen zum besseren Verständnis"
}

## WICHTIGE REGELN

1. Jeder Berechnungsschritt MUSS eine Regelwerk-Referenz haben
2. Verwende IMMER den EXAKTEN Wortlaut aus den Provisionsregeln für "quote"
3. Die Berechnung muss mathematisch zum Endbetrag führen
4. Erkläre so, dass ein Vermittler ohne Taschenrechner folgen kann
5. Bei Annahmen: Dokumentiere sie klar in "notes"
6. Formatiere Beträge deutsch (1.234,56 €)
7. Sei nicht wertend - du erklärst, du bewertest nicht

## KONFIDENZ-BEWERTUNG
- high: Klare Regelzuordnung, Berechnung stimmt exakt überein
- medium: Regel wahrscheinlich korrekt, aber Annahmen nötig oder kleine Abweichungen
- low: Unsichere Zuordnung, Regel nicht gefunden, oder deutliche Abweichungen`,

  TRANSACTION_PARSING: `Extrahiere die Transaktionsdaten aus der folgenden Provisionsabrechnung.

Antworte NUR mit dem JSON:
{
  "transactions": [
    {
      "datum": "YYYY-MM-DD",
      "vertragsnummer": "Vertragsnummer",
      "produktart": "Produktbezeichnung",
      "sparte": "Leben|Sach|Kranken|KFZ|Sonstig",
      "beitrag": 1234.56,
      "bewertungssumme": 1234.56,
      "provisionsbetrag": 123.45,
      "provisionsart": "Abschluss|Bestand|Storno|Dynamik|Nachprovision|Sonstig",
      "vermittlernummer": "falls vorhanden",
      "kundenname": "falls vorhanden"
    }
  ]
}

Hinweise:
- Wandle deutsche Datumsformate (DD.MM.YYYY) in ISO-Format um
- Wandle deutsche Zahlenformate (1.234,56) in numerische Werte um
- Bei Stornos ist der Provisionsbetrag negativ
- Erkenne die Provisionsart aus dem Kontext (Storno, AP, BP, etc.)`
};
