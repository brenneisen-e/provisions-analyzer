import React, { useEffect, useState, useCallback } from 'react';
import { Monitor, ZoomIn, ZoomOut, X, Clock, Keyboard } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface PresenterOverlayProps {
  children: React.ReactNode;
}

export const PresenterOverlay: React.FC<PresenterOverlayProps> = ({ children }) => {
  const { presenterMode, setPresenterMode, presenterFontScale, setPresenterFontScale, togglePresenterMode } = useAppStore();
  const [showControls, setShowControls] = useState(false);
  const [spotlightEnabled, setSpotlightEnabled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          togglePresenterMode();
          if (!presenterMode) {
            setStartTime(Date.now());
          }
          break;
        case 's':
          if (presenterMode) {
            setSpotlightEnabled(prev => !prev);
          }
          break;
        case '+':
        case '=':
          if (presenterMode) {
            setPresenterFontScale(presenterFontScale + 0.1);
          }
          break;
        case '-':
          if (presenterMode) {
            setPresenterFontScale(presenterFontScale - 0.1);
          }
          break;
        case 'escape':
          if (presenterMode) {
            setPresenterMode(false);
            setSpotlightEnabled(false);
            setPresenterFontScale(1.0);
          }
          break;
        case '?':
          if (presenterMode) {
            setShowShortcuts(prev => !prev);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [presenterMode, presenterFontScale, togglePresenterMode, setPresenterMode, setPresenterFontScale]);

  // Track mouse position for spotlight
  useEffect(() => {
    if (!spotlightEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [spotlightEnabled]);

  // Timer for presentation
  useEffect(() => {
    if (!presenterMode || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [presenterMode, startTime]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Apply presenter mode styles
  const presenterStyles: React.CSSProperties = presenterMode
    ? {
        fontSize: `${presenterFontScale * 100}%`,
        transition: 'font-size 0.2s ease'
      }
    : {};

  return (
    <div style={presenterStyles} className={presenterMode ? 'presenter-active' : ''}>
      {children}

      {/* Spotlight overlay */}
      {presenterMode && spotlightEnabled && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0,0,0,0.75) 100%)`
          }}
        />
      )}

      {/* Presenter controls */}
      {presenterMode && (
        <>
          {/* Timer */}
          <div className="fixed bottom-4 left-4 z-40">
            <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-mono">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Controls toggle */}
          <div className="fixed bottom-4 right-4 z-40">
            <div className="flex items-center gap-2">
              {/* Show/hide controls */}
              <button
                onClick={() => setShowControls(prev => !prev)}
                className="bg-black/80 text-white p-3 rounded-full hover:bg-black transition-colors"
                title="Steuerung anzeigen"
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls panel */}
          {showControls && (
            <div className="fixed bottom-20 right-4 z-40 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Presenter-Modus</h4>
                <button
                  onClick={() => setShowControls(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Font scale */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Schriftgröße</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPresenterFontScale(presenterFontScale - 0.1)}
                      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">
                      {Math.round(presenterFontScale * 100)}%
                    </span>
                    <button
                      onClick={() => setPresenterFontScale(presenterFontScale + 0.1)}
                      className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Spotlight */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Spotlight</span>
                  <button
                    onClick={() => setSpotlightEnabled(prev => !prev)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      spotlightEnabled
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {spotlightEnabled ? 'An' : 'Aus'}
                  </button>
                </div>

                {/* Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="w-full text-left text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  Tastenkürzel anzeigen
                </button>

                {/* Exit */}
                <button
                  onClick={() => setPresenterMode(false)}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Presenter-Modus beenden
                </button>
              </div>
            </div>
          )}

          {/* Shortcuts modal */}
          {showShortcuts && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tastenkürzel</h3>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <ShortcutRow keys={['P']} description="Presenter-Modus an/aus" />
                  <ShortcutRow keys={['S']} description="Spotlight an/aus" />
                  <ShortcutRow keys={['+']} description="Schrift vergrößern" />
                  <ShortcutRow keys={['-']} description="Schrift verkleinern" />
                  <ShortcutRow keys={['?']} description="Hilfe anzeigen" />
                  <ShortcutRow keys={['Esc']} description="Alles zurücksetzen" />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Presenter mode indicator (when not in presenter mode) */}
      {!presenterMode && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            onClick={togglePresenterMode}
            className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg"
            title="Drücken Sie P für Presenter-Modus"
          >
            <Monitor className="w-4 h-4" />
            Presenter-Modus
          </button>
        </div>
      )}
    </div>
  );
};

// Shortcut row helper component
const ShortcutRow: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-gray-600">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

export default PresenterOverlay;
