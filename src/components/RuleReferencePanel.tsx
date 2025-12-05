import React, { useEffect, useRef } from 'react';
import { X, BookOpen, FileText, Link2, ChevronRight } from 'lucide-react';
import type { RuleReference } from '../types';

interface RuleReferencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  reference: RuleReference | null;
}

export const RuleReferencePanel: React.FC<RuleReferencePanelProps> = ({
  isOpen,
  onClose,
  reference
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!reference) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Regelwerk-Referenz</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-64px)] p-6">
          {/* Document Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FileText className="w-4 h-4" />
              <span>{reference.document}</span>
            </div>
            {reference.pageNumber && (
              <p className="text-sm text-gray-500 ml-6">Seite {reference.pageNumber}</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Paragraph Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {reference.paragraph}
            </h3>
          </div>

          {/* Context (before quote) */}
          {reference.context && (
            <div className="text-sm text-gray-500 mb-4 leading-relaxed">
              <p>[...]</p>
            </div>
          )}

          {/* Main Quote - Highlighted */}
          <div className="relative my-6">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
              <p className="text-base text-gray-800 leading-relaxed">
                {reference.quote}
              </p>
            </div>
            <div className="absolute -bottom-3 left-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded font-medium">
              Relevante Passage
            </div>
          </div>

          {/* Context (after quote) */}
          {reference.context && (
            <div className="text-sm text-gray-500 mt-6 leading-relaxed">
              <p>[...]</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Related Rules */}
          {reference.relatedRules && reference.relatedRules.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Verwandte Regelungen
              </h4>
              <ul className="space-y-2">
                {reference.relatedRules.map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 cursor-pointer transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-500" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Context Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Interpretationshinweis
            </h4>
            <p className="text-sm text-blue-800">
              Diese Regelung wurde auf Basis der hochgeladenen Provisionsbestimmungen
              identifiziert. Die genaue Anwendung kann von individuellen Vereinbarungen
              abweichen.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// Standalone hook for managing the panel state
export function useRuleReferencePanel() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reference, setReference] = React.useState<RuleReference | null>(null);

  const openPanel = (ref: RuleReference) => {
    setReference(ref);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
    // Delay clearing reference for animation
    setTimeout(() => setReference(null), 300);
  };

  return {
    isOpen,
    reference,
    openPanel,
    closePanel
  };
}

export default RuleReferencePanel;
