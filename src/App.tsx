import React, { useEffect } from 'react';
import { FileText, BarChart3, Settings, Sparkles, Layers } from 'lucide-react';
import { ToastContainer } from './components/ui';
import { SetupView, AnalyzeView } from './views';
import { ArchitectureView } from './views/ArchitectureView';
import { useAppStore } from './stores/appStore';
import { useRulesStore } from './stores/rulesStore';
import { initAnthropicClient } from './services/anthropicClient';
import { PresenterOverlay } from './components/PresenterOverlay';

function App() {
  const {
    currentView,
    setCurrentView,
    apiConfig,
    notifications,
    removeNotification,
    demoMode
  } = useAppStore();
  const { rules } = useRulesStore();

  // Initialize Anthropic client if API key exists
  useEffect(() => {
    if (apiConfig.anthropicApiKey) {
      initAnthropicClient(apiConfig.anthropicApiKey);
    }
  }, [apiConfig.anthropicApiKey]);

  return (
    <PresenterOverlay>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${demoMode ? 'bg-blue-600' : 'bg-teal-600'}`}>
                  {demoMode ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Provisions-Analyzer
                    {demoMode && (
                      <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Provisionsabrechnungen automatisch erklärt
                  </p>
                </div>
              </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <NavButton
                icon={<Settings className="w-4 h-4" />}
                label="Setup"
                isActive={currentView === 'setup'}
                onClick={() => setCurrentView('setup')}
              />
              <NavButton
                icon={<BarChart3 className="w-4 h-4" />}
                label="Analyse"
                isActive={currentView === 'analyze'}
                onClick={() => setCurrentView('analyze')}
                disabled={rules.length === 0}
                badge={rules.length > 0 ? `${rules.length} Regeln` : undefined}
              />
              <NavButton
                icon={<Layers className="w-4 h-4" />}
                label="Architektur"
                isActive={currentView === 'architecture'}
                onClick={() => setCurrentView('architecture')}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'setup' && <SetupView />}
        {currentView === 'analyze' && <AnalyzeView />}
        {currentView === 'architecture' && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            Alle Daten werden lokal in Ihrem Browser verarbeitet.
            Nur API-Anfragen werden an Anthropic gesendet.
          </p>
        </div>
      </footer>

        {/* Toast Notifications */}
        <ToastContainer
          toasts={notifications}
          onClose={removeNotification}
        />
      </div>
    </PresenterOverlay>
  );
}

// Navigation Button Component
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  disabled,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-colors
        ${isActive
          ? 'bg-teal-50 text-teal-700'
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

export default App;
