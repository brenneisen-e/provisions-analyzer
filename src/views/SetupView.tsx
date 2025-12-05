import React, { useState, useCallback } from 'react';
import { Key, FileText, CheckCircle, Download, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, ProgressBar } from '../components/ui';
import { FileUpload } from '../components/FileUpload';
import { useAppStore } from '../stores/appStore';
import { useRulesStore } from '../stores/rulesStore';
import { initAnthropicClient, validateApiKey } from '../services/anthropicClient';
import { extractTextFromPDF } from '../services/pdfParser';
import { chunkDocument } from '../services/chunkAnalyzer';
import { extractRulesFromDocument } from '../services/ruleExtractor';
import { generateSampleProvisionStatement, downloadBlob } from '../services/pdfGenerator';
import { generateSampleProvisionsRules } from '../services/provisionsRulesGenerator';
import type { ExtractedDocument } from '../types';

export const SetupView: React.FC = () => {
  const { apiConfig, setApiKey, setCurrentView, addNotification } = useAppStore();
  const {
    rules,
    documentName,
    analysisProgress,
    setRules,
    setChunks,
    setDocumentName,
    setAnalysisProgress,
    resetProgress,
    clearAll
  } = useRulesStore();

  const [apiKeyInput, setApiKeyInput] = useState(apiConfig.anthropicApiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(!!apiConfig.anthropicApiKey);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validate API Key
  const handleValidateApiKey = async () => {
    if (!apiKeyInput.trim()) {
      addNotification({ type: 'error', message: 'Bitte geben Sie einen API-Key ein' });
      return;
    }

    setIsValidating(true);

    try {
      const isValid = await validateApiKey(apiKeyInput);

      if (isValid) {
        setApiKey(apiKeyInput);
        initAnthropicClient(apiKeyInput);
        setIsApiKeyValid(true);
        addNotification({ type: 'success', message: 'API-Key erfolgreich validiert' });
      } else {
        setIsApiKeyValid(false);
        addNotification({ type: 'error', message: 'Ungültiger API-Key' });
      }
    } catch (error) {
      setIsApiKeyValid(false);
      addNotification({ type: 'error', message: 'Fehler bei der API-Key Validierung' });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  // Process PDF
  const handleProcessPDF = async () => {
    if (!selectedFile) return;

    if (!isApiKeyValid) {
      addNotification({ type: 'error', message: 'Bitte validieren Sie zuerst den API-Key' });
      return;
    }

    try {
      // Stage 1: Parse PDF
      setAnalysisProgress({
        stage: 'parsing',
        current: 0,
        total: 100,
        message: 'PDF wird gelesen...'
      });

      const document = await extractTextFromPDF(selectedFile, (current, total) => {
        setAnalysisProgress({
          current: Math.round((current / total) * 100),
          message: `Seite ${current} von ${total} gelesen...`
        });
      });

      // Stage 2: Chunk document
      setAnalysisProgress({
        stage: 'chunking',
        current: 0,
        total: 100,
        message: 'Dokument wird in Abschnitte unterteilt...'
      });

      const chunks = chunkDocument(document as unknown as ExtractedDocument);
      setChunks(chunks);

      setAnalysisProgress({
        current: 100,
        message: `${chunks.length} Abschnitte erstellt`
      });

      // Stage 3: Extract rules
      setAnalysisProgress({
        stage: 'extracting',
        current: 0,
        total: chunks.length,
        message: 'Regeln werden extrahiert...'
      });

      const extractedRules = await extractRulesFromDocument(
        chunks,
        (current, total, message) => {
          setAnalysisProgress({ current, total, message });
        }
      );

      setRules(extractedRules);
      setDocumentName(selectedFile.name);

      setAnalysisProgress({
        stage: 'complete',
        current: extractedRules.length,
        total: extractedRules.length,
        message: `${extractedRules.length} Regeln erfolgreich extrahiert`
      });

      addNotification({
        type: 'success',
        message: `${extractedRules.length} Provisionsregeln aus "${selectedFile.name}" extrahiert`
      });

    } catch (error) {
      console.error('Fehler bei PDF-Verarbeitung:', error);
      setAnalysisProgress({
        stage: 'error',
        current: 0,
        total: 0,
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
      addNotification({
        type: 'error',
        message: 'Fehler bei der PDF-Verarbeitung'
      });
    }
  };

  // Generate sample PDF (Provisionsabrechnung)
  const handleGenerateSample = () => {
    const blob = generateSampleProvisionStatement();
    downloadBlob(blob, 'Beispiel-Provisionsabrechnung.pdf');
    addNotification({
      type: 'success',
      message: 'Beispiel-Provisionsabrechnung wurde heruntergeladen'
    });
  };

  // Generate sample Provisionsbestimmungen PDF
  const handleGenerateProvisionsRules = () => {
    addNotification({
      type: 'info',
      message: 'Generiere Provisionsbestimmungen (ca. 80 Seiten)...'
    });

    // Kurze Verzögerung für UI-Feedback
    setTimeout(() => {
      const blob = generateSampleProvisionsRules();
      downloadBlob(blob, 'Alpha-Versicherung-Provisionsbestimmungen.pdf');
      addNotification({
        type: 'success',
        message: 'Provisionsbestimmungen (80 Seiten) wurden heruntergeladen'
      });
    }, 100);
  };

  // Clear stored rules
  const handleClearRules = () => {
    clearAll();
    setSelectedFile(null);
    resetProgress();
    addNotification({ type: 'info', message: 'Gespeicherte Regeln wurden gelöscht' });
  };

  // Continue to analysis
  const handleContinue = () => {
    if (rules.length === 0) {
      addNotification({ type: 'error', message: 'Bitte laden Sie zuerst Provisionsbestimmungen hoch' });
      return;
    }
    setCurrentView('analyze');
  };

  const isProcessing = analysisProgress.stage !== 'idle' &&
    analysisProgress.stage !== 'complete' &&
    analysisProgress.stage !== 'error';

  const progressPercent = analysisProgress.total > 0
    ? Math.round((analysisProgress.current / analysisProgress.total) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* API Key Section */}
      <Card>
        <CardHeader
          title="API-Konfiguration"
          description="Geben Sie Ihren Anthropic API-Key ein"
        />

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              leftIcon={<Key className="w-4 h-4" />}
              rightIcon={isApiKeyValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : null}
              disabled={isValidating}
            />
          </div>
          <Button
            onClick={handleValidateApiKey}
            isLoading={isValidating}
            variant={isApiKeyValid ? 'secondary' : 'primary'}
          >
            {isApiKeyValid ? 'Validiert' : 'Validieren'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Der API-Key wird lokal in Ihrem Browser gespeichert und nur für Anfragen an die Anthropic API verwendet.
        </p>
      </Card>

      {/* Provisionsbestimmungen Upload */}
      <Card>
        <CardHeader
          title="Provisionsbestimmungen"
          description="Laden Sie die PDF mit Ihren Provisionsbestimmungen hoch"
          action={
            rules.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleClearRules}>
                Zurücksetzen
              </Button>
            ) : null
          }
        />

        {/* Show existing rules if any */}
        {rules.length > 0 && analysisProgress.stage === 'idle' && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {rules.length} Regeln geladen
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Aus: {documentName || 'Unbekanntes Dokument'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        {!isProcessing && (
          <FileUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={() => setSelectedFile(null)}
            label="Provisionsbestimmungen hochladen"
            description="PDF-Datei mit Ihren Provisionsbestimmungen"
            disabled={isProcessing}
          />
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-3">
            <ProgressBar
              progress={progressPercent}
              label={analysisProgress.stage === 'parsing' ? 'PDF lesen' :
                analysisProgress.stage === 'chunking' ? 'Strukturieren' :
                  'Regeln extrahieren'}
            />
            <p className="text-sm text-gray-600 text-center">
              {analysisProgress.message}
            </p>
          </div>
        )}

        {/* Error State */}
        {analysisProgress.stage === 'error' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Fehler</p>
                <p className="text-xs text-red-600 mt-1">{analysisProgress.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Complete State */}
        {analysisProgress.stage === 'complete' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Analyse abgeschlossen
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {analysisProgress.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleProcessPDF}
            disabled={!selectedFile || !isApiKeyValid || isProcessing}
            isLoading={isProcessing}
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Analysieren
          </Button>
        </div>
      </Card>

      {/* Sample Generator */}
      <Card>
        <CardHeader
          title="Test-Dokumente generieren"
          description="Generieren Sie Beispiel-PDFs zum Testen des Tools"
        />

        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Beispiel-Provisionsbestimmungen (Alpha Versicherung)
            </p>
            <p className="text-xs text-blue-600 mb-3">
              Generiert ein vollständiges 80-seitiges Dokument mit allen Provisionsregeln
            </p>
            <Button
              variant="outline"
              onClick={handleGenerateProvisionsRules}
              leftIcon={<FileText className="w-4 h-4" />}
              className="w-full"
            >
              Provisionsbestimmungen generieren (80 Seiten)
            </Button>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-800 mb-2">
              Beispiel-Provisionsabrechnung
            </p>
            <p className="text-xs text-gray-600 mb-3">
              Generiert eine Muster-Abrechnung mit 15 Transaktionen
            </p>
            <Button
              variant="outline"
              onClick={handleGenerateSample}
              leftIcon={<Download className="w-4 h-4" />}
              className="w-full"
            >
              Provisionsabrechnung generieren
            </Button>
          </div>
        </div>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={rules.length === 0}
          size="lg"
        >
          Weiter zur Analyse
        </Button>
      </div>
    </div>
  );
};
