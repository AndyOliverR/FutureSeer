"use client"

import { motion, AnimatePresence } from "framer-motion";
import { DreamAnalysis, DreamSymbol } from "@/lib/dreamSymbolsIntelligence";
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Eye, 
  Lightbulb, 
  BookOpen,
  Star,
  Moon,
  Sun,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DreamSymbolsCoachInterfaceProps {
  analysis: DreamAnalysis;
  activeTab: string;
  dreamDescription?: string;
  symbols?: string;
}

const categoryIcons: { [key: string]: any } = {
  'animals': '🦋',
  'objects': '🔑',
  'people': '👤',
  'places': '🏔️',
  'actions': '✨',
  'elements': '🔥',
  'colors': '🌈',
  'numbers': '🔢'
};

// All cards use Material 3 devotionist styling
const cardClassName = "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg rounded-3xl";
const cardHeaderClassName = "bg-gradient-to-r from-amber-100 to-yellow-100";
const cardTitleClassName = "text-amber-900";
const cardContentClassName = "bg-gradient-to-br from-amber-50 to-yellow-50";
const textPrimaryClassName = "text-slate-700";
const textSecondaryClassName = "text-slate-600";
const accentClassName = "text-amber-800";

export function DreamSymbolsCoachInterface({ 
  analysis, 
  activeTab, 
  dreamDescription,
  symbols 
}: DreamSymbolsCoachInterfaceProps) {
  
  // Group symbols by category
  const symbolsByCategory = analysis.symbols.reduce((acc, symbol) => {
    const category = symbol.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(symbol);
    return acc;
  }, {} as Record<string, DreamSymbol[]>);

  const renderOverview = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Moon className="w-6 h-6 text-amber-700" />
              Dream Overview
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${cardContentClassName}`}>
            {dreamDescription && (
              <p className={`${textPrimaryClassName} mb-4 leading-relaxed italic border-l-4 border-amber-400 pl-4`}>
                "{dreamDescription}"
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                <p className={`text-sm ${textSecondaryClassName} mb-2`}>Overall Theme</p>
                <p className={`text-lg font-semibold ${accentClassName}`}>{analysis.overallTheme}</p>
              </div>
              <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                <p className={`text-sm ${textSecondaryClassName} mb-2`}>Emotional Tone</p>
                <p className={`text-lg font-semibold ${accentClassName}`}>{analysis.emotionalTone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Sparkles className="w-6 h-6 text-amber-700" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-6 pt-6 ${cardContentClassName}`}>
            <div className="bg-amber-100 rounded-lg p-4 border-l-4 border-amber-400">
              <p className={`text-sm ${textSecondaryClassName} mb-2`}>Spiritual Message</p>
              <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.spiritualMessage}</p>
            </div>
            <div className="bg-amber-100 rounded-lg p-4 border-l-4 border-amber-400">
              <p className={`text-sm ${textSecondaryClassName} mb-2`}>Psychological Insight</p>
              <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.psychologicalInsight}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderSymbols = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis.symbols.map((symbol, index) => (
          <motion.div
            key={symbol.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{}}
          >
            <Card className={`${cardClassName} overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
              <CardContent className={`p-5 ${cardContentClassName}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[symbol.category] || '✨'}</span>
                    <div>
                      <h4 className={`font-bold ${accentClassName} capitalize text-lg group-hover:text-amber-900 transition-colors`}>
                        {symbol.symbol}
                      </h4>
                      <p className={`text-xs ${textSecondaryClassName} capitalize`}>{symbol.category}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {symbol.meanings.slice(0, 3).map((meaning, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300"
                      >
                        {meaning}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {Object.keys(symbolsByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className={`${cardClassName} overflow-hidden`}>
            <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
              <CardTitle className={`text-xl ${cardTitleClassName}`}>Symbols by Category</CardTitle>
            </CardHeader>
            <CardContent className={cardContentClassName}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(symbolsByCategory).map(([category, symbols]) => (
                  <div key={category} className="text-center">
                    <div className="text-3xl mb-2">{categoryIcons[category] || '✨'}</div>
                    <p className={`text-sm ${textSecondaryClassName} capitalize`}>{category}</p>
                    <p className={`text-lg font-bold ${accentClassName}`}>{symbols.length}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  const renderSymbolDetails = () => (
    <div className="space-y-6">
      {analysis.symbols.map((symbol, index) => (
        <motion.div
          key={symbol.symbol}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${cardClassName} hover:border-amber-400 hover:shadow-xl transition-all duration-300`}>
            <CardHeader className={cardHeaderClassName}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{categoryIcons[symbol.category] || '✨'}</span>
                <div>
                  <CardTitle className={`text-2xl ${cardTitleClassName} capitalize`}>{symbol.symbol}</CardTitle>
                  <p className={`text-sm ${textSecondaryClassName} capitalize`}>{symbol.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`space-y-4 ${cardContentClassName}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-amber-700" />
                    <h4 className={`font-semibold ${accentClassName}`}>Positive Meaning</h4>
                  </div>
                  <p className={`${textPrimaryClassName} text-sm`}>{symbol.positiveInterpretation}</p>
                </div>
                <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-amber-700" />
                    <h4 className={`font-semibold ${accentClassName}`}>Caution</h4>
                  </div>
                  <p className={`${textPrimaryClassName} text-sm`}>{symbol.negativeInterpretation}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-700" />
                    <h4 className={`font-semibold ${accentClassName}`}>Spiritual Meaning</h4>
                  </div>
                  <p className={`${textPrimaryClassName} text-sm`}>{symbol.spiritualMeaning}</p>
                </div>
                <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-amber-700" />
                    <h4 className={`font-semibold ${accentClassName}`}>Psychological Meaning</h4>
                  </div>
                  <p className={`${textPrimaryClassName} text-sm`}>{symbol.psychologicalMeaning}</p>
                </div>
              </div>

              <div className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-amber-700" />
                  <h4 className={`font-semibold ${accentClassName}`}>Practical Advice</h4>
                </div>
                <p className={`${textPrimaryClassName} text-sm`}>{symbol.advice}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderMeaning = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <BookOpen className="w-6 h-6 text-amber-700" />
              Overall Meaning
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${cardContentClassName}`}>
            <div>
              <p className={`text-sm ${textSecondaryClassName} mb-2`}>Dream Theme</p>
              <p className={`text-lg ${textPrimaryClassName} leading-relaxed`}>{analysis.overallTheme}</p>
            </div>
            <div>
              <p className={`text-sm ${textSecondaryClassName} mb-2`}>Emotional Context</p>
              <p className={`text-lg ${textPrimaryClassName} leading-relaxed`}>{analysis.emotionalTone}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Eye className="w-6 h-6 text-amber-700" />
              Psychological Perspective
            </CardTitle>
          </CardHeader>
          <CardContent className={cardContentClassName}>
            <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.psychologicalInsight}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Star className="w-6 h-6 text-amber-700" />
              Spiritual Perspective
            </CardTitle>
          </CardHeader>
          <CardContent className={cardContentClassName}>
            <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.spiritualMessage}</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderGuidance = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Heart className="w-6 h-6 text-amber-700" />
              Life Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${cardContentClassName}`}>
            <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.spiritualMessage}</p>
            <p className={`${textPrimaryClassName} leading-relaxed`}>{analysis.psychologicalInsight}</p>
          </CardContent>
        </Card>
      </motion.div>

      {analysis.practicalAdvice && analysis.practicalAdvice.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`${cardClassName} overflow-hidden`}>
            <CardHeader className={cardHeaderClassName}>
              <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
                <Lightbulb className="w-6 h-6 text-amber-700" />
                Practical Steps
              </CardTitle>
            </CardHeader>
            <CardContent className={`${cardContentClassName} pt-4`}>
              <ul className="space-y-3">
                {analysis.practicalAdvice.map((advice, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-amber-100 rounded-lg border-l-4 border-amber-400"
                  >
                    <span className={`${accentClassName} font-bold mt-1`}>{index + 1}.</span>
                    <p className={`${textPrimaryClassName} leading-relaxed flex-1`}>{advice}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  const renderArchetypes = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Sparkles className="w-6 h-6 text-amber-700" />
              Jungian Archetypes
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${cardContentClassName}`}>
            <p className={`${textSecondaryClassName} mb-6 text-sm`}>
              These symbols connect to universal archetypes from the collective unconscious, 
              representing fundamental patterns of human experience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {analysis.symbols.slice(0, 6).map((symbol, index) => (
                <div
                  key={symbol.symbol}
                  className="bg-amber-100 rounded-lg p-4 border-2 border-amber-300"
                >
                  <h4 className={`font-semibold ${accentClassName} capitalize mb-2`}>{symbol.symbol}</h4>
                  <p className={`text-sm ${textPrimaryClassName} leading-relaxed`}>{symbol.spiritualMeaning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderAdvice = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Lightbulb className="w-6 h-6 text-amber-700" />
              Actionable Advice
            </CardTitle>
          </CardHeader>
          <CardContent className={cardContentClassName}>
            {analysis.practicalAdvice && analysis.practicalAdvice.length > 0 ? (
              <div className="space-y-3">
                {analysis.practicalAdvice.map((advice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-amber-100 rounded-lg border-l-4 border-amber-400"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-amber-300 flex items-center justify-center flex-shrink-0">
                      <span className={`${accentClassName} font-bold`}>{index + 1}</span>
                    </div>
                    <p className={`${textPrimaryClassName} leading-relaxed flex-1`}>{advice}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className={textPrimaryClassName}>No specific advice available for this dream.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`${cardClassName} overflow-hidden`}>
          <CardHeader className={`${cardHeaderClassName} rounded-t-3xl`}>
            <CardTitle className={`text-xl ${cardTitleClassName} flex items-center gap-3`}>
              <Star className="w-6 h-6 text-amber-700" />
              Symbol-Specific Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className={cardContentClassName}>
            <div className="space-y-3">
              {analysis.symbols.slice(0, 5).map((symbol) => (
                <div
                  key={symbol.symbol}
                  className="p-3 bg-amber-100 rounded-lg border-l-4 border-amber-400"
                >
                  <h4 className={`font-semibold ${accentClassName} capitalize mb-1`}>{symbol.symbol}</h4>
                  <p className={`text-sm ${textPrimaryClassName}`}>{symbol.advice}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'symbols' && renderSymbols()}
        {activeTab === 'meaning' && renderMeaning()}
        {activeTab === 'guidance' && renderGuidance()}
        {activeTab === 'archetypes' && renderArchetypes()}
        {activeTab === 'advice' && renderAdvice()}
      </motion.div>
    </AnimatePresence>
  );
}