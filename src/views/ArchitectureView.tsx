import React, { useState } from 'react';
import {
  Building2,
  Cloud,
  Shield,
  ArrowLeftRight,
  ArrowRight,
  Server,
  Lock,
  CheckCircle,
  Zap,
  Users,
  Settings,
  FileText,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAppStore } from '../stores/appStore';

type ArchitectureOption = 'ergo-internal' | 'deloitte-managed' | null;

export const ArchitectureView: React.FC = () => {
  const { setCurrentView } = useAppStore();
  const [selectedOption, setSelectedOption] = useState<ArchitectureOption>(null);
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView('setup')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Zurück
        </Button>
      </div>

      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Implementierungsarchitektur
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Für die produktive Umsetzung des Provisions-Analyzers gibt es zwei
          Architekturoptionen. Beide gewährleisten Datensicherheit und Skalierbarkeit –
          sie unterscheiden sich in Betriebsmodell und Verantwortlichkeiten.
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Option A: Internal */}
        <ArchitectureOptionCard
          selected={selectedOption === 'ergo-internal'}
          onSelect={() => setSelectedOption(selectedOption === 'ergo-internal' ? null : 'ergo-internal')}
          icon={<Building2 className="h-12 w-12" />}
          title="Option A"
          subtitle="Interne Umsetzung"
          description="Der KI-Agent wird in der eigenen Infrastruktur betrieben. Alle Daten bleiben im Haus."
          highlights={[
            'Volle Datenkontrolle',
            'Keine externe Abhängigkeit',
            'Eigene KI-Governance'
          ]}
          requirements={[
            'KI-Agenten-Plattform (z.B. Azure AI, AWS Bedrock)',
            'Oder: API-Zugang zu LLM-Provider',
            'Interne ML/AI-Expertise'
          ]}
          color="blue"
        />

        {/* Option B: Managed */}
        <ArchitectureOptionCard
          selected={selectedOption === 'deloitte-managed'}
          onSelect={() => setSelectedOption(selectedOption === 'deloitte-managed' ? null : 'deloitte-managed')}
          icon={<Cloud className="h-12 w-12" />}
          title="Option B"
          subtitle="Managed Service"
          description="Der KI-Agent wird als Service bereitgestellt und extern betrieben."
          highlights={[
            'Schnelle Implementierung',
            'Kein interner Aufbau nötig',
            'Kontinuierliche Weiterentwicklung'
          ]}
          requirements={[
            'Sichere Datenschnittstelle',
            'Service Level Agreement',
            'Datenschutzvereinbarung (AVV)'
          ]}
          color="emerald"
        />
      </div>

      {/* Comparison Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowComparison(!showComparison)}
          className="mt-4"
          rightIcon={showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        >
          {showComparison ? 'Vergleich ausblenden' : 'Detailvergleich anzeigen'}
        </Button>
      </div>

      {/* Detailed Comparison */}
      {showComparison && <ComparisonTable />}

      {/* Architecture Diagrams */}
      {selectedOption && (
        <ArchitectureDiagram option={selectedOption} />
      )}

      {/* Data Security Section */}
      <DataSecuritySection selectedOption={selectedOption} />

      {/* Next Steps */}
      <NextStepsSection selectedOption={selectedOption} />
    </div>
  );
};

// ============================================
// Architecture Option Card Component
// ============================================

interface ArchitectureOptionCardProps {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  requirements: string[];
  color: 'blue' | 'emerald';
}

const ArchitectureOptionCard: React.FC<ArchitectureOptionCardProps> = ({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  description,
  highlights,
  requirements,
  color
}) => {
  const colorClasses = {
    blue: {
      border: selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
      icon: 'text-blue-600 bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
      button: selected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    },
    emerald: {
      border: selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-emerald-300',
      icon: 'text-emerald-600 bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-800',
      button: selected ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
    }
  };

  const classes = colorClasses[color];

  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300
        hover:shadow-lg ${classes.border}
        ${selected ? 'shadow-lg' : 'shadow-sm'}
      `}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute top-4 right-4">
          <CheckCircle className={`h-6 w-6 ${color === 'blue' ? 'text-blue-500' : 'text-emerald-500'}`} />
        </div>
      )}

      {/* Icon */}
      <div className={`inline-flex p-4 rounded-xl ${classes.icon} mb-6`}>
        {icon}
      </div>

      {/* Title */}
      <div className="mb-4">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${classes.badge}`}>
          {title}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 mt-3">
          {subtitle}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        {description}
      </p>

      {/* Highlights */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Zap className="h-4 w-4 mr-2" />
          Vorteile
        </h4>
        <ul className="space-y-2">
          {highlights.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Voraussetzungen
        </h4>
        <ul className="space-y-2">
          {requirements.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <div className="h-2 w-2 rounded-full bg-gray-400 mr-3 mt-2 flex-shrink-0" />
              <span className="text-gray-600 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Select Button */}
      <button
        className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${classes.button}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {selected ? 'Ausgewählt - Details unten' : 'Details anzeigen'}
      </button>
    </div>
  );
};

// ============================================
// Comparison Table Component
// ============================================

const ComparisonTable: React.FC = () => {
  const criteria = [
    {
      category: 'Implementierung',
      items: [
        { criterion: 'Time-to-Market', optionA: '3-6 Monate', optionB: '4-8 Wochen', winner: 'B' },
        { criterion: 'Initiale Kosten', optionA: 'Höher (Infrastruktur)', optionB: 'Niedriger (Service)', winner: 'B' },
        { criterion: 'Laufende Kosten', optionA: 'Variabel (Nutzung)', optionB: 'Fixiert (SLA)', winner: 'neutral' }
      ]
    },
    {
      category: 'Betrieb',
      items: [
        { criterion: 'Betriebsverantwortung', optionA: 'Intern', optionB: 'Extern', winner: 'neutral' },
        { criterion: 'Skalierung', optionA: 'Eigenverantwortlich', optionB: 'Inkludiert', winner: 'B' },
        { criterion: 'Updates & Wartung', optionA: 'Eigenverantwortlich', optionB: 'Inkludiert', winner: 'B' }
      ]
    },
    {
      category: 'Datensicherheit',
      items: [
        { criterion: 'Datenhoheit', optionA: '100% intern', optionB: 'Verschlüsselt extern', winner: 'A' },
        { criterion: 'Compliance', optionA: 'Eigene Governance', optionB: 'Gemeinsam definiert', winner: 'neutral' },
        { criterion: 'Audit-Fähigkeit', optionA: 'Volle Kontrolle', optionB: 'Über Schnittstelle', winner: 'A' }
      ]
    },
    {
      category: 'Flexibilität',
      items: [
        { criterion: 'Anpassbarkeit', optionA: 'Unbegrenzt', optionB: 'Nach Vereinbarung', winner: 'A' },
        { criterion: 'Erweiterbarkeit', optionA: 'Eigenentwicklung', optionB: 'Roadmap gemeinsam', winner: 'neutral' },
        { criterion: 'Exit-Strategie', optionA: 'Kein Lock-in', optionB: 'Transition möglich', winner: 'A' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8 animate-fadeIn">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Detailvergleich der Optionen</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Kriterium
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                <div className="flex items-center justify-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Option A: Intern
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">
                <div className="flex items-center justify-center">
                  <Cloud className="h-5 w-5 mr-2" />
                  Option B: Managed
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Category Header */}
                <tr className="bg-gray-100">
                  <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-gray-700">
                    {cat.category}
                  </td>
                </tr>

                {/* Items */}
                {cat.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.criterion}
                    </td>
                    <td className={`px-6 py-4 text-sm text-center ${
                      item.winner === 'A' ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600'
                    }`}>
                      {item.optionA}
                      {item.winner === 'A' && <CheckCircle className="inline ml-2 h-4 w-4" />}
                    </td>
                    <td className={`px-6 py-4 text-sm text-center ${
                      item.winner === 'B' ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-600'
                    }`}>
                      {item.optionB}
                      {item.winner === 'B' && <CheckCircle className="inline ml-2 h-4 w-4" />}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// Architecture Diagram Components
// ============================================

interface ArchitectureDiagramProps {
  option: 'ergo-internal' | 'deloitte-managed';
}

const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ option }) => {
  if (option === 'ergo-internal') {
    return <InternalArchitectureDiagram />;
  }
  return <ManagedArchitectureDiagram />;
};

// Diagram Box Component
interface DiagramBoxProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: 'gray' | 'blue' | 'emerald' | 'amber';
  highlighted?: boolean;
}

const DiagramBox: React.FC<DiagramBoxProps> = ({ icon, title, subtitle, color, highlighted }) => {
  const colorClasses = {
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600'
  };

  return (
    <div className={`
      p-4 rounded-lg border-2 ${colorClasses[color]}
      ${highlighted ? 'ring-2 ring-offset-2 ring-blue-400 shadow-md' : ''}
    `}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-medium text-gray-900 text-sm">{title}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

// Key Point Component
interface KeyPointProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const KeyPoint: React.FC<KeyPointProps> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <div className="font-medium text-gray-900 text-sm">{title}</div>
      <div className="text-xs text-gray-600 mt-1">{description}</div>
    </div>
  </div>
);

const InternalArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Building2 className="h-6 w-6 mr-3 text-blue-600" />
        Architektur: Interne Umsetzung
      </h3>

      <div className="relative">
        {/* Internal Environment Container */}
        <div className="border-2 border-blue-200 rounded-2xl p-6 bg-blue-50/30">
          <div className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Kundeninfrastruktur (On-Premise / Private Cloud)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Data Sources */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Datenquellen
              </div>
              <DiagramBox
                icon={<FileText className="h-5 w-5" />}
                title="Provisions-bestimmungen"
                subtitle="PDF / Regelwerk"
                color="gray"
              />
              <DiagramBox
                icon={<FileText className="h-5 w-5" />}
                title="Provisions-abrechnungen"
                subtitle="PDF / CSV"
                color="gray"
              />
              <DiagramBox
                icon={<Server className="h-5 w-5" />}
                title="Vermittler-stammdaten"
                subtitle="SAP / Datenbank"
                color="gray"
              />
            </div>

            {/* Arrows */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <ArrowLeftRight className="h-8 w-8 text-blue-400" />
                <div className="text-xs text-gray-500 text-center">
                  Interner<br/>Datentransfer
                </div>
              </div>
            </div>

            {/* KI Components */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KI-Komponenten
              </div>
              <DiagramBox
                icon={<Zap className="h-5 w-5" />}
                title="Provisions-Analyzer"
                subtitle="KI-Agent"
                color="blue"
                highlighted
              />
              <DiagramBox
                icon={<Server className="h-5 w-5" />}
                title="LLM Runtime"
                subtitle="Azure OpenAI / Bedrock"
                color="blue"
              />
              <DiagramBox
                icon={<Users className="h-5 w-5" />}
                title="Web-Frontend"
                subtitle="Vermittler-Portal"
                color="blue"
              />
            </div>
          </div>
        </div>

        {/* External API (Optional) */}
        <div className="mt-6 flex justify-center">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 max-w-md">
            <div className="text-sm text-gray-500 text-center">
              <span className="font-medium">Optional:</span> Externe LLM-API
              <div className="text-xs mt-1">
                (falls keine eigene KI-Infrastruktur)
              </div>
              <div className="flex justify-center flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-white rounded text-xs border">Azure OpenAI</span>
                <span className="px-2 py-1 bg-white rounded text-xs border">Anthropic API</span>
                <span className="px-2 py-1 bg-white rounded text-xs border">AWS Bedrock</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KeyPoint
          icon={<Lock className="h-5 w-5 text-green-600" />}
          title="Daten bleiben intern"
          description="Keine Übertragung sensibler Daten nach extern"
        />
        <KeyPoint
          icon={<Settings className="h-5 w-5 text-blue-600" />}
          title="Volle Kontrolle"
          description="Eigene Steuerung von Entwicklung und Betrieb"
        />
        <KeyPoint
          icon={<Shield className="h-5 w-5 text-purple-600" />}
          title="Eigene Governance"
          description="Integriert in bestehende IT-Richtlinien"
        />
      </div>
    </div>
  );
};

const ManagedArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Cloud className="h-6 w-6 mr-3 text-emerald-600" />
        Architektur: Managed Service
      </h3>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-stretch">

          {/* Customer Side */}
          <div className="md:col-span-3 border-2 border-blue-200 rounded-2xl p-6 bg-blue-50/30">
            <div className="text-sm font-semibold text-blue-600 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Kundenumgebung
            </div>

            <div className="space-y-4">
              <DiagramBox
                icon={<FileText className="h-5 w-5" />}
                title="Provisions-bestimmungen"
                subtitle="PDF / Regelwerk"
                color="gray"
              />
              <DiagramBox
                icon={<FileText className="h-5 w-5" />}
                title="Provisions-abrechnungen"
                subtitle="Anonymisiert"
                color="gray"
              />
              <DiagramBox
                icon={<Users className="h-5 w-5" />}
                title="Vermittler"
                subtitle="Web-Zugang"
                color="blue"
              />
            </div>
          </div>

          {/* Secure Connection */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-8">
            <div className="w-full h-1 md:h-full md:w-1 bg-gradient-to-b md:bg-gradient-to-b from-blue-400 via-emerald-400 to-emerald-400 rounded" />
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2 md:mt-4">
              <Lock className="h-3 w-3" />
              <span>TLS 1.3</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 mt-2 hidden md:block" />
          </div>

          {/* Provider Side */}
          <div className="md:col-span-3 border-2 border-emerald-200 rounded-2xl p-6 bg-emerald-50/30">
            <div className="text-sm font-semibold text-emerald-600 mb-4 flex items-center">
              <Cloud className="h-4 w-4 mr-2" />
              Managed Service Umgebung
            </div>

            <div className="space-y-4">
              <DiagramBox
                icon={<Zap className="h-5 w-5" />}
                title="Provisions-Analyzer"
                subtitle="KI-Agent"
                color="emerald"
                highlighted
              />
              <DiagramBox
                icon={<Server className="h-5 w-5" />}
                title="Agent Developer"
                subtitle="Plattform"
                color="emerald"
              />
              <DiagramBox
                icon={<Shield className="h-5 w-5" />}
                title="Monitoring & SLA"
                subtitle="24/7 Betrieb"
                color="emerald"
              />
            </div>
          </div>
        </div>

        {/* Data Flow Description */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Datenfluss</h4>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-blue-100 rounded">1. Dokumente hochladen</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="px-2 py-1 bg-gray-100 rounded">2. Verschlüsselte Übertragung</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="px-2 py-1 bg-emerald-100 rounded">3. Analyse durch KI</span>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <span className="px-2 py-1 bg-blue-100 rounded">4. Ergebnisse zurück</span>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <KeyPoint
          icon={<Zap className="h-5 w-5 text-amber-600" />}
          title="Schnelle Umsetzung"
          description="4-8 Wochen bis zum Go-Live"
        />
        <KeyPoint
          icon={<Settings className="h-5 w-5 text-emerald-600" />}
          title="Kein Aufbau nötig"
          description="Infrastruktur und Betrieb inklusive"
        />
        <KeyPoint
          icon={<ExternalLink className="h-5 w-5 text-blue-600" />}
          title="Skalierbar"
          description="Automatische Anpassung bei Lastspitzen"
        />
      </div>
    </div>
  );
};

// ============================================
// Data Security Section
// ============================================

interface DataSecuritySectionProps {
  selectedOption: ArchitectureOption;
}

const DataSecuritySection: React.FC<DataSecuritySectionProps> = ({ selectedOption }) => {
  return (
    <Card className="mt-8">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-green-600" />
          Datensicherheit bei beiden Optionen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SecurityFeature
            icon={<Lock className="h-6 w-6 text-green-600" />}
            title="Ende-zu-Ende Verschlüsselung"
            description="TLS 1.3 für alle Datenübertragungen"
          />
          <SecurityFeature
            icon={<Shield className="h-6 w-6 text-blue-600" />}
            title="DSGVO-konform"
            description="Verarbeitung nach EU-Datenschutzrecht"
          />
          <SecurityFeature
            icon={<Server className="h-6 w-6 text-purple-600" />}
            title="Keine Datenspeicherung"
            description="Nur temporäre Verarbeitung, keine Persistenz"
          />
          <SecurityFeature
            icon={<FileText className="h-6 w-6 text-amber-600" />}
            title="Audit-Trail"
            description="Vollständige Nachvollziehbarkeit"
          />
        </div>

        {selectedOption && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">
              {selectedOption === 'ergo-internal' ? 'Besonderheit Option A:' : 'Besonderheit Option B:'}
            </h4>
            <p className="text-sm text-gray-600">
              {selectedOption === 'ergo-internal'
                ? 'Alle Daten verbleiben vollständig in der eigenen Infrastruktur. Keine externe Datenübertragung notwendig.'
                : 'Daten werden verschlüsselt übertragen und nur für die Dauer der Analyse verarbeitet. Datenschutzvereinbarung (AVV) regelt alle Details.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({ icon, title, description }) => (
  <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <div className="mb-3">{icon}</div>
    <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

// ============================================
// Next Steps Section
// ============================================

interface NextStepsSectionProps {
  selectedOption: ArchitectureOption;
}

const NextStepsSection: React.FC<NextStepsSectionProps> = ({ selectedOption }) => {
  const internalSteps = [
    { step: 1, title: 'Infrastruktur-Assessment', description: 'Bewertung bestehender KI-Kapazitäten' },
    { step: 2, title: 'Architektur-Design', description: 'Detaillierte technische Planung' },
    { step: 3, title: 'Pilot-Implementierung', description: 'MVP mit ausgewählten Vermittlern' },
    { step: 4, title: 'Rollout', description: 'Schrittweise Einführung' }
  ];

  const managedSteps = [
    { step: 1, title: 'Anforderungsworkshop', description: 'Definition der spezifischen Bedürfnisse' },
    { step: 2, title: 'Datenschutz-Setup', description: 'AVV und Schnittstellendefinition' },
    { step: 3, title: 'Pilot-Phase', description: '4-6 Wochen Testbetrieb' },
    { step: 4, title: 'Go-Live', description: 'Produktiver Einsatz' }
  ];

  const steps = selectedOption === 'ergo-internal' ? internalSteps : managedSteps;

  return (
    <Card className="mt-8">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <ArrowRight className="h-6 w-6 mr-3 text-teal-600" />
          {selectedOption ? 'Nächste Schritte' : 'Wählen Sie eine Option für die nächsten Schritte'}
        </h3>

        {selectedOption ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold mb-3">
                    {step.step}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Wählen Sie oben eine Implementierungsoption, um die nächsten Schritte zu sehen.</p>
          </div>
        )}

        {/* CTA */}
        {selectedOption && (
          <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-200 text-center">
            <p className="text-teal-800 mb-3">
              Bereit für den nächsten Schritt?
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Workshop vereinbaren
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ArchitectureView;
