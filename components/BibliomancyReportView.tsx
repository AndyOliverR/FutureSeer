'use client';

import { useState } from 'react';
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard';
import { BookOpen, Info, Sparkles, Compass, MessageCircle } from 'lucide-react';

export type BibliomancyTextId = 'bible' | 'quran' | 'gita' | 'torah' | 'hafez';

const TEXT_LABELS: Record<BibliomancyTextId, string> = {
  bible: 'Bible',
  quran: 'Quran',
  gita: 'Bhagavad Gita',
  torah: 'Torah',
  hafez: 'Hafez',
};

const TEXT_COLORS: Record<BibliomancyTextId, 'amber' | 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'> = {
  bible: 'amber',
  quran: 'green',
  gita: 'orange',
  torah: 'blue',
  hafez: 'purple',
};

const ACTIVE_BUTTON_CLASS: Record<BibliomancyTextId, string> = {
  bible: 'bg-sky-100 border-sky-400 text-sky-900',
  quran: 'bg-teal-100 border-teal-400 text-teal-900',
  gita: 'bg-cyan-100 border-cyan-400 text-cyan-900',
  torah: 'bg-indigo-100 border-indigo-400 text-indigo-900',
  hafez: 'bg-slate-100 border-slate-400 text-slate-900',
};

interface PassageReport {
  textId: string;
  citation: string;
  passage: string;
  version: string;
  literalMeaningSummary: string;
  primaryTheme: string;
  secondaryTheme?: string;
  archetype: string;
  tone: string;
  lifeDomainInterpretation: string;
  directive: string;
  polarity: string;
  sanskrit?: string;
  themeHint?: string;
}

interface BibliomancyReportViewProps {
  report: Record<string, unknown>;
  selectedText?: BibliomancyTextId;
  onSelectText?: (id: BibliomancyTextId) => void;
}

export function BibliomancyReportView({
  report,
  selectedText = 'bible',
  onSelectText,
}: BibliomancyReportViewProps) {
  const [activeText, setActiveText] = useState<BibliomancyTextId>(selectedText);

  const definitions = report.definitions as Record<string, unknown> | undefined;
  const rituals = report.rituals as Record<string, string> | undefined;
  const interpretations = report.interpretations as Record<string, string> | undefined;
  const texts = report.texts as Record<string, PassageReport> | undefined;
  const crossTraditionSummary = report.crossTraditionSummary as string | undefined;
  const generatedAt = report.generatedAt as string | undefined;

  const current = texts?.[activeText];

  const handleSelect = (id: BibliomancyTextId) => {
    setActiveText(id);
    onSelectText?.(id);
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-600 text-xs italic">
        This report is personalized to your profile. Passages were selected using a reproducible seed (generated at profile creation).
        {generatedAt && (
          <span className="block mt-1">Generated: {new Date(generatedAt).toLocaleString()}</span>
        )}
      </p>

      {definitions && (
        <DevotionistStyleCard
          icon={<Info className="w-5 h-5" />}
          title="Definitions"
          colorScheme="cyan"
          summary={definitions.bibliomancyVsSortilege as string}
          items={Object.entries((definitions.agentByTradition as Record<string, string>) ?? {}).map(
            ([key, text]) => ({ text: `${key}: ${text}` })
          )}
        />
      )}

      {rituals && (
        <DevotionistStyleCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Text-specific rituals"
          colorScheme="blue"
          items={[
            { text: `Quran: ${rituals.quran ?? ''}` },
            { text: `Hafez: ${rituals.hafez ?? ''}` },
            { text: `Bible/Torah: ${rituals.bibleTorah ?? ''}` },
          ]}
        />
      )}

      {interpretations && (
        <DevotionistStyleCard
          icon={<Compass className="w-5 h-5" />}
          title="Interpretative frameworks"
          colorScheme="pink"
          items={[
            { text: interpretations.ambiguity ?? '' },
            { text: interpretations.directVsMetaphor ?? '' },
          ]}
        />
      )}

      {crossTraditionSummary && (
        <DevotionistStyleCard
          icon={<Sparkles className="w-5 h-5" />}
          title="Cross-tradition theme"
          colorScheme="amber"
          summary={crossTraditionSummary}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(TEXT_LABELS) as BibliomancyTextId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSelect(id)}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
              activeText === id ? ACTIVE_BUTTON_CLASS[id] : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
            }`}
          >
            {TEXT_LABELS[id]}
          </button>
        ))}
      </div>

      {current && (
        <div className="space-y-4">
          <DevotionistStyleCard
            icon={<BookOpen className="w-5 h-5" />}
            title={`${TEXT_LABELS[activeText]} — Selected passage`}
            subtitle={current.citation}
            summary={current.passage}
            colorScheme={TEXT_COLORS[activeText]}
          />
          <DevotionistStyleCard
            icon={<Info className="w-5 h-5" />}
            title="Literal meaning summary"
            summary={current.literalMeaningSummary}
            colorScheme="blue"
          />
          <DevotionistStyleCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Symbolic theme"
            summary={`Primary: ${current.primaryTheme}${current.secondaryTheme ? `; Secondary: ${current.secondaryTheme}` : ''}. Archetype: ${current.archetype}. Tone: ${current.tone}.`}
            colorScheme="purple"
          />
          <DevotionistStyleCard
            icon={<Compass className="w-5 h-5" />}
            title="Life domain interpretation"
            summary={current.lifeDomainInterpretation}
            colorScheme="green"
          />
          <DevotionistStyleCard
            icon={<MessageCircle className="w-5 h-5" />}
            title="Directive & polarity"
            summary={`Directive: ${current.directive}. Polarity: ${current.polarity}.`}
            colorScheme="amber"
          />
          {current.sanskrit && (
            <DevotionistStyleCard
              icon={<BookOpen className="w-5 h-5" />}
              title="Sanskrit (Gita)"
              summary={current.sanskrit}
              colorScheme="orange"
            />
          )}
        </div>
      )}

      {!current && texts && (
        <p className="text-slate-600 text-sm">Select a sacred text above to view its passage and interpretation.</p>
      )}
    </div>
  );
}
