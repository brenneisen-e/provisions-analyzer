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
    model: 'claude-sonnet-4-20250514',
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
      model: 'claude-sonnet-4-20250514',
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

  TRANSACTION_EXPLANATION: `Du erklärst Provisionsabrechnungen basierend auf Provisionsbestimmungen.

Analysiere die folgende Transaktion und erkläre, wie der Provisionsbetrag zustande kommt.

Antworte NUR mit dem JSON:
{
  "appliedRules": ["regel-ids die greifen"],
  "explanation": "Klare, verständliche Erklärung welche Regel greift und warum",
  "calculation": "Die Berechnung: Formel mit eingesetzten Werten = Ergebnis",
  "confidence": "high|medium|low",
  "notes": "Hinweise bei Unklarheiten oder Abweichungen (optional)"
}

Konfidenz-Bewertung:
- high: Klare Regelzuordnung, Berechnung stimmt überein
- medium: Regel wahrscheinlich korrekt, aber kleine Abweichungen möglich
- low: Unsichere Zuordnung oder deutliche Abweichungen`,

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
