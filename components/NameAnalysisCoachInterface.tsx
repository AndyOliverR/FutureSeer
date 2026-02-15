"use client"

import { useMemo, useState } from "react"
import { devLog } from '@/lib/devLogger';
import { motion, AnimatePresence } from "framer-motion"
import { NameAnalysis } from "@/lib/nameAnalysisIntelligence"
import { createSynthesis, combineNameAndNumerology, combineNameAndVedic, combineNameAndWestern } from "@/lib/nameAnalysisSynthesis"
import { getAllNameMeanings } from "@/lib/nameMeanings"
import { calculateIdealNames } from "@/lib/idealNameAnalysis"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Hash, User, Sparkles, Target, Heart, Briefcase, 
  BookOpen, Star, Zap, TrendingUp, CheckCircle, 
  AlertTriangle, Info, Flame, Droplets, Wind, Mountain, ChevronDown, ChevronUp
} from "lucide-react"

interface NameAnalysisCoachInterfaceProps {
  analysis: NameAnalysis
  activeTab: string
  name: string
  birthDate?: string
  numerologyData?: any
  vedicData?: any
  westernData?: any
}

interface IdealNameSuggestionCardProps {
  suggestion: {
    suggestedFirstName: string;
    fullSuggestedName: string;
    destinyNumber: number;
    soulNumber: number;
    personalityNumber: number;
    elements: string[];
    alignmentScore: number;
    whyIdeal: string[];
    numerologyBenefits: string[];
    astrologyAlignment: string[];
    elementalBalance: string[];
    improvementAreas: string[];
  };
  index: number;
}

function IdealNameSuggestionCard({ suggestion, index }: IdealNameSuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 border-green-300 bg-green-100';
    if (score >= 60) return 'text-amber-700 border-amber-300 bg-amber-100';
    return 'text-orange-700 border-orange-300 bg-orange-100';
  };
  
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire': return <Flame className="w-3 h-3" />;
      case 'water': return <Droplets className="w-3 h-3" />;
      case 'air': return <Wind className="w-3 h-3" />;
      case 'earth': return <Mountain className="w-3 h-3" />;
      case 'ether': return <Sparkles className="w-3 h-3" />;
      default: return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/60 border border-amber-200 rounded-2xl overflow-hidden"
    >
      <div
        className="p-4 cursor-pointer hover:bg-amber-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="text-amber-900 font-semibold text-lg">{suggestion.fullSuggestedName}</h5>
              <Badge className={`${getScoreColor(suggestion.alignmentScore)} text-xs font-semibold`}>
                {suggestion.alignmentScore}/100
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-slate-100 border-slate-300 text-slate-700 text-xs">
                Destiny: {suggestion.destinyNumber}
              </Badge>
              <Badge className="bg-slate-100 border-slate-300 text-slate-700 text-xs">
                Soul: {suggestion.soulNumber}
              </Badge>
              <Badge className="bg-slate-100 border-slate-300 text-slate-700 text-xs">
                Personality: {suggestion.personalityNumber}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-slate-600 text-xs">Elements:</span>
              {suggestion.elements.map((el, idx) => (
                <Badge key={idx} className="bg-slate-100 border-slate-300 text-slate-700 text-xs flex items-center gap-1">
                  {getElementIcon(el)}
                  {el}
                </Badge>
              ))}
            </div>
          </div>
          <button className="text-amber-700 hover:text-amber-900 transition-colors ml-4">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4 border-t border-amber-300">
              {/* Why Ideal */}
              {suggestion.whyIdeal.length > 0 && (
                <div>
                  <h6 className="text-amber-900 font-semibold mb-2 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Why This Name
                  </h6>
                  <ul className="space-y-1">
                    {suggestion.whyIdeal.map((reason, idx) => (
                      <li key={idx} className="text-slate-700 text-xs flex items-start">
                        <span className="text-amber-700 mr-2 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Numerology Benefits */}
              {suggestion.numerologyBenefits.length > 0 && (
                <div>
                  <h6 className="text-amber-900 font-semibold mb-2 text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Numerology Benefits
                  </h6>
                  <ul className="space-y-1">
                    {suggestion.numerologyBenefits.map((benefit, idx) => (
                      <li key={idx} className="text-slate-700 text-xs flex items-start">
                        <span className="text-amber-700 mr-2 mt-0.5">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Astrology Alignment */}
              {suggestion.astrologyAlignment.length > 0 && (
                <div>
                  <h6 className="text-amber-900 font-semibold mb-2 text-sm flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Astrology Alignment
                  </h6>
                  <ul className="space-y-1">
                    {suggestion.astrologyAlignment.map((alignment, idx) => (
                      <li key={idx} className="text-slate-700 text-xs flex items-start">
                        <span className="text-amber-700 mr-2 mt-0.5">•</span>
                        {alignment}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Elemental Balance */}
              {suggestion.elementalBalance.length > 0 && (
                <div>
                  <h6 className="text-amber-900 font-semibold mb-2 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Elemental Balance
                  </h6>
                  <ul className="space-y-1">
                    {suggestion.elementalBalance.map((balance, idx) => (
                      <li key={idx} className="text-slate-700 text-xs flex items-start">
                        <span className="text-amber-700 mr-2 mt-0.5">•</span>
                        {balance}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Improvement Areas */}
              {suggestion.improvementAreas.length > 0 && (
                <div>
                  <h6 className="text-amber-900 font-semibold mb-2 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Improvements
                  </h6>
                  <ul className="space-y-1">
                    {suggestion.improvementAreas.map((improvement, idx) => (
                      <li key={idx} className="text-amber-900 text-xs flex items-start">
                        <span className="text-green-700 mr-2 mt-0.5">✓</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function NameAnalysisCoachInterface({
  analysis,
  activeTab,
  name,
  birthDate,
  numerologyData,
  vedicData,
  westernData
}: NameAnalysisCoachInterfaceProps) {
  
  // Create synthesis if additional data available
  const synthesis = (numerologyData || vedicData || westernData) 
    ? createSynthesis(analysis, numerologyData, vedicData, westernData)
    : null;

  const numerologySynthesis = numerologyData ? combineNameAndNumerology(analysis, numerologyData) : null;
  const vedicSynthesis = vedicData ? combineNameAndVedic(analysis, vedicData) : null;
  const westernSynthesis = westernData ? combineNameAndWestern(analysis, westernData) : null;

  // Check what data is available
  const hasNumerology = !!numerologyData;
  const hasVedic = !!vedicData;
  const hasWestern = !!westernData;

  // Get name meanings
  const nameMeanings = getAllNameMeanings(analysis.fullName);

  // Calculate ideal names if birthDate is available
  const idealNameAnalysis = useMemo(() => {
    if (!birthDate) return null;
    try {
      return calculateIdealNames(
        analysis,
        numerologyData,
        vedicData,
        westernData,
        birthDate,
        name || analysis.fullName
      );
    } catch (error) {
      devLog.error('Error calculating ideal names:', error, 'NameAnalysisCoachInterface');
      return null;
    }
  }, [analysis, numerologyData, vedicData, westernData, birthDate, name]);

  // Overview Tab
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        {/* Integration Badges */}
        {(hasNumerology || hasVedic || hasWestern) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hasNumerology && (
              <Badge className="bg-amber-500/20 border-amber-400/50 text-amber-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Numerology Connected
              </Badge>
            )}
            {hasVedic && (
              <Badge className="bg-amber-500/20 border-amber-400/50 text-amber-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Vedic Astrology Connected
              </Badge>
            )}
            {hasWestern && (
              <Badge className="bg-amber-500/20 border-amber-400/50 text-amber-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Western Astrology Connected
              </Badge>
            )}
          </div>
        )}

        {/* Name Meanings Card */}
        {nameMeanings.length > 0 && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <BookOpen className="w-5 h-5 text-amber-700" />
                Name Meanings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nameMeanings.map((nameData, idx) => (
                  <div key={idx} className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-amber-900 font-semibold">{nameData.name}</h4>
                          {nameData.gender && (
                            <Badge className="bg-blue-100 border-blue-300 text-blue-700 text-xs">
                              {nameData.gender === 'male' ? '♂' : nameData.gender === 'female' ? '♀' : '⚥'}
                            </Badge>
                          )}
                          {nameData.popularity && (
                            <Badge className={`text-xs ${
                              nameData.popularity === 'very_common' ? 'bg-green-100 border-green-300 text-green-700' :
                              nameData.popularity === 'common' ? 'bg-amber-100 border-amber-300 text-amber-700' :
                              nameData.popularity === 'uncommon' ? 'bg-orange-100 border-orange-300 text-orange-700' :
                              'bg-purple-100 border-purple-300 text-purple-700'
                            }`}>
                              {nameData.popularity.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm">{nameData.meaning}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {nameData.origin && (
                            <span className="text-slate-600 text-xs">Origin: {nameData.origin}</span>
                          )}
                          {nameData.countries && nameData.countries.length > 0 && (
                            <span className="text-slate-600 text-xs">
                              Popular in: {nameData.countries.slice(0, 3).join(', ')}
                              {nameData.countries.length > 3 && ` +${nameData.countries.length - 3} more`}
                            </span>
                          )}
                        </div>
                        {nameData.culturalContext && (
                          <p className="text-amber-700 text-xs mt-1 italic">{nameData.culturalContext}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {nameMeanings.length === 0 && (
                <p className="text-slate-600 text-sm text-center py-4">Name meanings not available</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Name Breakdown */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <User className="w-5 h-5 text-amber-700" />
              Name Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <p className="text-slate-600 text-sm mb-1">First Name</p>
                <p className="text-amber-900 text-lg font-semibold">{analysis.firstName}</p>
              </div>
              {analysis.middleName && (
                <div className="text-center p-4 bg-white/60 border border-amber-200 rounded-2xl">
                  <p className="text-slate-600 text-sm mb-1">Middle Name</p>
                  <p className="text-amber-900 text-lg font-semibold">{analysis.middleName}</p>
                </div>
              )}
              <div className="text-center p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <p className="text-slate-600 text-sm mb-1">Last Name</p>
                <p className="text-amber-900 text-lg font-semibold">{analysis.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Numbers Display */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Life Path", value: analysis.lifePathNumber, icon: Target },
            { label: "Destiny", value: analysis.destinyNumber, icon: Star },
            { label: "Soul", value: analysis.soulNumber, icon: Heart },
            { label: "Personality", value: analysis.personalityNumber, icon: User },
            { label: "Maturity", value: analysis.maturityNumber, icon: TrendingUp }
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label} elevation={1} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
              <CardContent className="p-4 text-center">
                <Icon className="w-5 h-5 text-amber-700 mx-auto mb-2" />
                <div className="text-3xl font-bold bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-1">
                  {value}
                  {(value === 11 || value === 22 || value === 33) && (
                    <span className="text-xs text-amber-700 ml-1">*</span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Master Numbers Indicator */}
        {(analysis.lifePathNumber === 11 || analysis.lifePathNumber === 22 || analysis.lifePathNumber === 33 ||
          analysis.destinyNumber === 11 || analysis.destinyNumber === 22 || analysis.destinyNumber === 33 ||
          analysis.soulNumber === 11 || analysis.soulNumber === 22 || analysis.soulNumber === 33) && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-700 mt-0.5" />
                <div>
                  <p className="text-amber-900 font-semibold mb-1">Master Number Detected</p>
                  <p className="text-slate-700 text-sm">
                    Your name contains master numbers (11, 22, or 33), indicating heightened spiritual potential and powerful vibrational energy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Personality Summary */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <BookOpen className="w-5 h-5 text-amber-700" />
              Quick Personality Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4 leading-relaxed">{analysis.personality.lifePurpose}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-amber-900 font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {analysis.personality.strengths.slice(0, 4).map((strength, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex items-start">
                      <span className="text-amber-700 mr-2 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-amber-900 font-semibold mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                  Challenges
                </h4>
                <ul className="space-y-1">
                  {analysis.personality.challenges.slice(0, 4).map((challenge, idx) => (
                    <li key={idx} className="text-slate-700 text-sm flex items-start">
                      <span className="text-amber-700 mr-2 mt-1">•</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elemental Balance */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Zap className="w-5 h-5 text-amber-700" />
              Elemental Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {[
                { name: "Fire", value: analysis.elements.fire, icon: Flame, color: "text-red-600" },
                { name: "Earth", value: analysis.elements.earth, icon: Mountain, color: "text-amber-700" },
                { name: "Air", value: analysis.elements.air, icon: Wind, color: "text-yellow-600" },
                { name: "Water", value: analysis.elements.water, icon: Droplets, color: "text-blue-600" },
                { name: "Ether", value: analysis.elements.ether || 0, icon: Sparkles, color: "text-purple-600" }
              ].map(({ name, value, icon: Icon, color }) => (
                <div key={name} className="text-center p-3 bg-white/60 border border-amber-200 rounded-2xl">
                  <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-amber-900 mb-1">{value}</div>
                  <p className="text-xs text-slate-600">{name}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
              <p className="text-slate-700 text-sm">
                <strong className="text-amber-900">Dominant Element:</strong> {analysis.dominantElement.charAt(0).toUpperCase() + analysis.dominantElement.slice(1)}
                {analysis.missingElements.length > 0 && (
                  <span className="ml-2">
                    <strong className="text-amber-900">Missing:</strong> {analysis.missingElements.join(", ")}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cross-System Harmony (if available) */}
        {synthesis && synthesis.numberHarmony.harmonyScore > 50 && (
          <Card elevation={2} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-700 mt-0.5" />
                <div>
                  <p className="text-green-900 font-semibold mb-1">Strong System Harmony Detected</p>
                  <p className="text-slate-700 text-sm mb-2">
                    Harmony Score: {synthesis.numberHarmony.harmonyScore}/100
                  </p>
                  <ul className="space-y-1">
                    {synthesis.numberHarmony.resonanceNotes.map((note, idx) => (
                      <li key={idx} className="text-slate-700 text-sm">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Personality Tab with Synthesis
  if (activeTab === "personality") {
    const combinedPersonality = synthesis?.combinedPersonality || analysis.personality;
    
    return (
      <div className="space-y-6">
        {/* Name-Based Personality */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <User className="w-5 h-5 text-amber-700" />
              Name-Based Personality Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Life Purpose</h4>
              <p className="text-slate-700 leading-relaxed">{analysis.personality.lifePurpose}</p>
            </div>
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Career Guidance</h4>
              <p className="text-slate-700 leading-relaxed">{analysis.personality.careerGuidance}</p>
            </div>
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Relationship Insights</h4>
              <p className="text-slate-700 leading-relaxed">{analysis.personality.relationshipInsights}</p>
            </div>
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Spiritual Path</h4>
              <p className="text-slate-700 leading-relaxed">{analysis.personality.spiritualPath}</p>
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {combinedPersonality.strengths.map((strength, idx) => (
                <div key={idx} className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
                  <p className="text-slate-700 text-sm flex items-start">
                    <span className="text-green-600 mr-2 mt-0.5">✓</span>
                    {strength}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenges */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Challenges & Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {combinedPersonality.challenges.map((challenge, idx) => (
                <div key={idx} className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
                  <p className="text-slate-700 text-sm flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">•</span>
                    {challenge}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Combined Insights (if synthesis available) */}
        {synthesis && (
          <>
            {numerologySynthesis && numerologySynthesis.harmonies.length > 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Hash className="w-5 h-5 text-amber-700" />
                    Name + Numerology Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {numerologySynthesis.harmonies.map((harmony: string, idx: number) => (
                      <li key={idx} className="text-slate-700 text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {harmony}
                      </li>
                    ))}
                  </ul>
                  {numerologySynthesis.numberComparison && (
                    <div className="mt-4 p-3 bg-white/60 border border-amber-200 rounded-2xl">
                      <p className="text-slate-600 text-xs mb-2">Number Comparison:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Name Life Path:</span>
                          <span className="text-amber-900 ml-2 font-bold">{numerologySynthesis.numberComparison.nameLifePath}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Birth Life Path:</span>
                          <span className="text-amber-900 ml-2 font-bold">{numerologySynthesis.numberComparison.numerologyLifePath}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Alignment:</span>
                          <span className={`ml-2 font-bold ${numerologySynthesis.numberComparison.nameLifePath === numerologySynthesis.numberComparison.numerologyLifePath ? 'text-green-700' : 'text-amber-700'}`}>
                            {numerologySynthesis.numberComparison.nameLifePath === numerologySynthesis.numberComparison.numerologyLifePath ? '✓ Match' : 'Different'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {vedicSynthesis && vedicSynthesis.insights.length > 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Star className="w-5 h-5 text-amber-700" />
                    Name + Vedic Astrology Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {vedicSynthesis.insights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-slate-700 text-sm flex items-start">
                        <Star className="w-4 h-4 text-amber-700 mr-2 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                  {vedicSynthesis.elementalAlignment && (
                    <div className="mt-4 p-3 bg-white/60 border border-amber-200 rounded-2xl">
                      <p className="text-slate-600 text-xs mb-1">Elemental Alignment:</p>
                      {vedicSynthesis.elementalAlignment.aligned.length > 0 && (
                        <p className="text-green-700 text-xs">
                          Aligned: {vedicSynthesis.elementalAlignment.aligned.join(", ")}
                        </p>
                      )}
                      {vedicSynthesis.elementalAlignment.missing.length > 0 && (
                        <p className="text-amber-700 text-xs">
                          Missing: {vedicSynthesis.elementalAlignment.missing.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {westernSynthesis && westernSynthesis.insights.length > 0 && (
              <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                    Name + Western Astrology Synthesis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {westernSynthesis.insights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-slate-700 text-sm flex items-start">
                        <Sparkles className="w-4 h-4 text-amber-700 mr-2 mt-0.5 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                  {westernSynthesis.sunSign && (
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white/60 border border-amber-200 rounded-2xl">
                        <span className="text-slate-600">Sun:</span>
                        <span className="text-amber-900 ml-1 font-semibold">{westernSynthesis.sunSign}</span>
                      </div>
                      <div className="p-2 bg-white/60 border border-amber-200 rounded-2xl">
                        <span className="text-slate-600">Moon:</span>
                        <span className="text-amber-900 ml-1 font-semibold">{westernSynthesis.moonSign}</span>
                      </div>
                      <div className="p-2 bg-white/60 border border-amber-200 rounded-2xl">
                        <span className="text-slate-600">Rising:</span>
                        <span className="text-amber-900 ml-1 font-semibold">{westernSynthesis.risingSign}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Elements & Vibrations Tab
  if (activeTab === "vibrations") {
    return (
      <div className="space-y-6">
        {/* Elemental Analysis */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Zap className="w-5 h-5 text-amber-700" />
              Elemental Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-slate-700 text-sm mb-4">
                Your name contains specific elemental energies that shape your personality and life path.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { name: "Fire", value: analysis.elements.fire, icon: Flame, color: "text-red-600", bg: "bg-red-100", border: "border-red-300", meaning: "Passion, action, leadership" },
                  { name: "Earth", value: analysis.elements.earth, icon: Mountain, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", meaning: "Stability, practicality, grounding" },
                  { name: "Air", value: analysis.elements.air, icon: Wind, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-300", meaning: "Intellect, communication, freedom" },
                  { name: "Water", value: analysis.elements.water, icon: Droplets, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-300", meaning: "Emotion, intuition, flow" },
                  { name: "Ether", value: analysis.elements.ether || 0, icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-300", meaning: "Spirituality, transcendence" }
                ].map(({ name, value, icon: Icon, color, bg, border, meaning }) => (
                  <div key={name} className={`p-4 rounded-2xl border-2 ${bg} ${border}`}>
                    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-center text-amber-900 mb-1">{value}</div>
                    <p className="text-xs text-slate-600 text-center mb-1">{name}</p>
                    <p className="text-xs text-slate-600 text-center">{meaning}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl">
              <p className="text-slate-700 text-sm">
                <strong className="text-amber-900">Dominant Element:</strong> {analysis.dominantElement.charAt(0).toUpperCase() + analysis.dominantElement.slice(1)}
              </p>
              {analysis.missingElements.length > 0 && (
                <p className="text-slate-700 text-sm mt-2">
                  <strong className="text-amber-900">Missing Elements:</strong> {analysis.missingElements.join(", ")}
                  <span className="text-slate-600 text-xs ml-2">(Consider balancing these in your life)</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Elemental Comparison (if astrology available) */}
        {synthesis && synthesis.elementalComparison && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <TrendingUp className="w-5 h-5 text-amber-700" />
                Elemental Comparison: Name vs Astrology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {synthesis.elementalComparison.vedicElements && (
                  <div>
                    <h4 className="text-amber-900 font-semibold mb-3">Name vs Vedic Astrology</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {(['fire', 'earth', 'air', 'water'] as const).map(element => {
                        const nameVal = synthesis.elementalComparison.nameElements[element];
                        const vedicVal = synthesis.elementalComparison.vedicElements![element];
                        return (
                          <div key={element} className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
                            <p className="text-xs text-slate-600 mb-2 capitalize">{element}</p>
                            <div className="text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-700">Name:</span>
                                <span className="text-amber-900 font-bold">{nameVal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Vedic:</span>
                                <span className="text-amber-900 font-bold">{vedicVal}</span>
                              </div>
                              {nameVal === vedicVal && (
                                <p className="text-green-700 text-xs mt-1">✓ Aligned</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {synthesis.elementalComparison.westernElements && (
                  <div>
                    <h4 className="text-amber-900 font-semibold mb-3">Name vs Western Astrology</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {(['fire', 'earth', 'air', 'water'] as const).map(element => {
                        const nameVal = synthesis.elementalComparison.nameElements[element];
                        const westernVal = synthesis.elementalComparison.westernElements![element];
                        return (
                          <div key={element} className="p-3 bg-white/60 border border-amber-200 rounded-2xl">
                            <p className="text-xs text-slate-600 mb-2 capitalize">{element}</p>
                            <div className="text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-700">Name:</span>
                                <span className="text-amber-900 font-bold">{nameVal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-700">Western:</span>
                                <span className="text-amber-900 font-bold">{westernVal}</span>
                              </div>
                              {nameVal === westernVal && (
                                <p className="text-green-700 text-xs mt-1">✓ Aligned</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Letter Frequency */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Hash className="w-5 h-5 text-amber-700" />
              Letter Frequency Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 text-sm mb-4">
              The frequency of letters in your name reveals vibrational patterns and hidden meanings.
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {Object.entries(analysis.letterFrequency)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 16)
                .map(([letter, frequency]) => (
                  <div key={letter} className="p-2 bg-white/60 border border-amber-200 rounded-2xl text-center">
                    <div className="text-lg font-bold text-amber-900">{letter}</div>
                    <div className="text-xs text-slate-600">{frequency}x</div>
                  </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-white/60 border border-amber-200 rounded-2xl">
              <p className="text-slate-700 text-sm">
                <strong className="text-amber-900">Most Frequent:</strong> {Object.entries(analysis.letterFrequency)
                  .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vibration Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card elevation={1} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2">
                {analysis.nameVibration}
              </div>
              <p className="text-xs text-slate-600">Name Vibration</p>
            </CardContent>
          </Card>
          <Card elevation={1} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2">
                {analysis.nameHarmony}
              </div>
              <p className="text-xs text-slate-600">Name Harmony</p>
            </CardContent>
          </Card>
          <Card elevation={1} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2">
                {analysis.namePower}
              </div>
              <p className="text-xs text-slate-600">Name Power</p>
            </CardContent>
          </Card>
          <Card elevation={1} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent mb-2">
                {analysis.nameBalance}
              </div>
              <p className="text-xs text-slate-600">Vowel-Consonant Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Vowel and Consonant Analysis */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Sparkles className="w-5 h-5 text-amber-700" />
              Vowel & Consonant Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <h4 className="text-amber-900 font-semibold mb-3">Vowels (Soul Energy)</h4>
                <p className="text-slate-600 text-xs mb-2">Letters: {analysis.vowels.join(", ") || "None"}</p>
                <p className="text-slate-700 text-sm">
                  <strong className="text-amber-900">Value:</strong> {analysis.vowelValue}
                </p>
                <p className="text-slate-600 text-xs mt-2">
                  Vowels represent your inner desires and soul's motivation.
                </p>
              </div>
              <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <h4 className="text-amber-900 font-semibold mb-3">Consonants (Personality Expression)</h4>
                <p className="text-slate-600 text-xs mb-2">Letters: {analysis.consonants.slice(0, 10).join(", ")}{analysis.consonants.length > 10 ? "..." : ""}</p>
                <p className="text-slate-700 text-sm">
                  <strong className="text-amber-900">Value:</strong> {analysis.consonantValue}
                </p>
                <p className="text-slate-600 text-xs mt-2">
                  Consonants reveal how you present yourself to the world.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Career & Purpose Tab
  if (activeTab === "purpose") {
    return (
      <div className="space-y-6">
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Target className="w-5 h-5 text-amber-700" />
              Life Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed text-lg mb-4">{analysis.personality.lifePurpose}</p>
            <p className="text-slate-700 leading-relaxed">{analysis.personality.spiritualPath}</p>
          </CardContent>
        </Card>

        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Briefcase className="w-5 h-5 text-amber-700" />
              Career Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-4">{analysis.personality.careerGuidance}</p>
            
            {/* Enhanced with Astrology if available */}
            {vedicData && (
              <div className="mt-4 p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <p className="text-amber-900 font-semibold mb-2 text-sm">Vedic Astrology Enhancement</p>
                <p className="text-slate-700 text-sm">
                  {vedicData.personality_analysis?.career_guidance || 
                   "Your 10th house (career) and planetary positions provide additional career insights when combined with your name analysis."}
                </p>
              </div>
            )}
            {westernData && (
              <div className="mt-4 p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <p className="text-amber-900 font-semibold mb-2 text-sm">Western Astrology Enhancement</p>
                <p className="text-slate-700 text-sm">
                  Your Midheaven sign and planetary positions align with your name's career vibration, suggesting specific professional paths.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Relationships Tab
  if (activeTab === "compatibility") {
    return (
      <div className="space-y-6">
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Heart className="w-5 h-5 text-amber-700" />
              Relationship Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed mb-4">{analysis.personality.relationshipInsights}</p>
            
            {/* Name compatibility patterns */}
            <div className="mt-4">
              <h4 className="text-amber-900 font-semibold mb-3">Name-Based Compatibility Patterns</h4>
              <p className="text-slate-700 text-sm mb-3">
                Your name's soul number ({analysis.soulNumber}) indicates what you seek in relationships, while your personality number ({analysis.personalityNumber}) shows how you present yourself to others.
              </p>
            </div>

            {/* Enhanced with Astrology if available */}
            {vedicData && (
              <div className="mt-4 p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <p className="text-amber-900 font-semibold mb-2 text-sm">Vedic Astrology Enhancement</p>
                <p className="text-slate-700 text-sm">
                  {vedicData.personality_analysis?.relationshipInsights || 
                   "Your 7th house (partnerships) and Venus/Moon positions provide deeper relationship insights when combined with your name analysis."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recommendations Tab
  if (activeTab === "advice") {
    return (
      <div className="space-y-6">
        {/* Name Optimization */}
        {analysis.recommendations.nameOptimization.length > 0 && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Sparkles className="w-5 h-5 text-amber-700" />
                Name Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.nameOptimization.map((suggestion, idx) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Nickname Suggestions */}
        {analysis.recommendations.nicknameSuggestions.length > 0 && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <User className="w-5 h-5 text-amber-700" />
                Nickname Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendations.nicknameSuggestions.map((nickname, idx) => (
                  <Badge key={idx} variant="outline" className="border-amber-300 text-amber-900 bg-white/60">
                    {nickname}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Name Ideas */}
        {analysis.recommendations.businessNameIdeas.length > 0 && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Briefcase className="w-5 h-5 text-amber-700" />
                Business Name Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.businessNameIdeas.map((idea, idx) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">•</span>
                    {idea}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Spiritual Names */}
        {analysis.recommendations.spiritualNames.length > 0 && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Star className="w-5 h-5 text-amber-700" />
                Spiritual Name Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendations.spiritualNames.map((spiritualName, idx) => (
                  <Badge key={idx} variant="outline" className="border-purple-300 text-purple-700 bg-white/60">
                    {spiritualName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coaching */}
        <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <BookOpen className="w-5 h-5 text-amber-700" />
              Coaching & Guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Current Focus</h4>
              <p className="text-slate-700 text-sm">{analysis.coaching.currentFocus}</p>
            </div>
            
            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {analysis.coaching.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Affirmations</h4>
              <ul className="space-y-2">
                {analysis.coaching.affirmations.map((affirmation, idx) => (
                  <li key={idx} className="text-slate-700 text-sm italic flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">"</span>
                    {affirmation}
                    <span className="text-amber-700 ml-1">"</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-amber-900 font-semibold mb-2">Next Steps</h4>
              <ul className="space-y-2">
                {analysis.coaching.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-slate-700 text-sm flex items-start">
                    <span className="text-amber-700 mr-2 mt-0.5">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Ideal Name Suggestions */}
        {idealNameAnalysis && (
          <Card elevation={2} className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Zap className="w-5 h-5 text-amber-700" />
                Ideal Name Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Name Alignment */}
              <div className="p-4 bg-white/60 border border-amber-200 rounded-2xl">
                <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Current Name Alignment
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-700 text-sm">Alignment Score</span>
                      <span className={`text-sm font-semibold ${
                        idealNameAnalysis.currentNameAnalysis.alignmentScore >= 80 ? 'text-green-700' :
                        idealNameAnalysis.currentNameAnalysis.alignmentScore >= 60 ? 'text-amber-700' :
                        'text-orange-700'
                      }`}>
                        {idealNameAnalysis.currentNameAnalysis.alignmentScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          idealNameAnalysis.currentNameAnalysis.alignmentScore >= 80 ? 'bg-gradient-to-r from-green-600 to-green-500' :
                          idealNameAnalysis.currentNameAnalysis.alignmentScore >= 60 ? 'bg-gradient-to-r from-amber-600 to-amber-500' :
                          'bg-gradient-to-r from-orange-600 to-orange-500'
                        }`}
                        style={{ width: `${idealNameAnalysis.currentNameAnalysis.alignmentScore}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm">{idealNameAnalysis.analysis.lifePathAlignment}</p>
                  {idealNameAnalysis.currentNameAnalysis.currentChallenges.length > 0 && (
                    <div>
                      <p className="text-slate-600 text-xs mb-1">Current Challenges:</p>
                      <ul className="space-y-1">
                        {idealNameAnalysis.currentNameAnalysis.currentChallenges.map((challenge, idx) => (
                          <li key={idx} className="text-slate-600 text-xs flex items-start">
                            <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 text-orange-600" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {idealNameAnalysis.analysis.optimizationOpportunities.length > 0 && (
                    <div>
                      <p className="text-slate-600 text-xs mb-1">Optimization Opportunities:</p>
                      <ul className="space-y-1">
                        {idealNameAnalysis.analysis.optimizationOpportunities.map((opp, idx) => (
                          <li key={idx} className="text-amber-900 text-xs flex items-start">
                            <TrendingUp className="w-3 h-3 mr-1 mt-0.5" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation Summary */}
              <div className="p-4 bg-amber-100 border border-amber-300 rounded-2xl">
                <p className="text-amber-900 text-sm italic">{idealNameAnalysis.analysis.recommendationSummary}</p>
              </div>

              {/* Ideal Name Suggestions */}
              {idealNameAnalysis.idealNameSuggestions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-amber-900 font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Top Suggestions ({idealNameAnalysis.idealNameSuggestions.length})
                  </h4>
                  {idealNameAnalysis.idealNameSuggestions.map((suggestion, idx) => (
                    <IdealNameSuggestionCard key={idx} suggestion={suggestion} index={idx} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Fallback for other tabs
  return (
    <div className="text-center py-8">
      <p className="text-slate-400">Content for "{activeTab}" tab coming soon...</p>
    </div>
  );
}