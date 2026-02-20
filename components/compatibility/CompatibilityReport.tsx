"use client"

import type { CompatibilityReport } from '@/lib/types/profileTypes'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Heart, 
  Briefcase,
  Star,
  Info,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DevotionistStyleCard } from '@/components/western/DevotionistStyleCard'

interface CompatibilityReportProps {
  report: CompatibilityReport
}

const ASSESSMENT_COLORS = {
  'Excellent': 'text-green-700 border-green-300 bg-green-100',
  'Good': 'text-emerald-700 border-emerald-300 bg-emerald-100',
  'Moderate': 'text-amber-700 border-amber-300 bg-amber-100',
  'Challenging': 'text-orange-700 border-orange-300 bg-orange-100',
  'Poor': 'text-red-700 border-red-300 bg-red-100'
}

export function CompatibilityReport({ report }: CompatibilityReportProps) {
  const scoreColor = report.compatibilityScore >= 80
    ? 'text-green-700'
    : report.compatibilityScore >= 65
    ? 'text-emerald-700'
    : report.compatibilityScore >= 50
    ? 'text-amber-700'
    : report.compatibilityScore >= 35
    ? 'text-orange-700'
    : 'text-red-700'

  const handleExport = () => {
    const reportText = `
COMPATIBILITY REPORT
====================

Tool: ${report.toolSlug}
Generated: ${new Date(report.generatedAt).toLocaleString()}

PROFILES
--------
User: ${report.userProfile.name}
Born: ${report.userProfile.dateOfBirth}

${report.additionalProfile.name}
Born: ${report.additionalProfile.dateOfBirth}
Relationship: ${report.additionalProfile.relationshipType}

OVERALL ASSESSMENT
------------------
Score: ${report.compatibilityScore}/100
Assessment: ${report.overallAssessment}

STRENGTHS
---------
${report.strengths.map(s => `• ${s}`).join('\n')}

CHALLENGES
----------
${report.challenges.map(c => `• ${c}`).join('\n')}

${report.businessSuitability ? `
BUSINESS SUITABILITY
--------------------
Score: ${report.businessSuitability.score}/100
${report.businessSuitability.analysis}

Recommendations:
${report.businessSuitability.recommendations.map(r => `• ${r}`).join('\n')}
` : ''}

${report.personalCompatibility ? `
PERSONAL COMPATIBILITY
----------------------
Score: ${report.personalCompatibility.score}/100
${report.personalCompatibility.analysis}

Recommendations:
${report.personalCompatibility.recommendations.map(r => `• ${r}`).join('\n')}
` : ''}

RECOMMENDATIONS
---------------
${report.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim()

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compatibility-report-${report.toolSlug}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] lg:h-[calc(100vh-250px)] pr-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-amber-200 mb-2">Compatibility Report</h2>
            <p className="text-slate-400 text-sm">
              Compatibility analysis between you and {report.additionalProfile.name}
            </p>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-amber-500/30 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>


        {/* Overall Score */}
        <DevotionistStyleCard
          icon={<Star className="w-5 h-5" />}
          title="Overall Compatibility"
          colorScheme="amber"
          variant="callout"
        >
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor}`}>
                {report.compatibilityScore}
              </div>
              <div className="text-slate-600 text-sm mt-1">out of 100</div>
            </div>
            <div className="flex-1">
              <Badge className={`${ASSESSMENT_COLORS[report.overallAssessment]} text-lg px-4 py-2 mb-2 border`}>
                {report.overallAssessment}
              </Badge>
              <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
                <div
                  className={`h-3 rounded-full transition-all ${
                    report.compatibilityScore >= 80
                      ? 'bg-green-500'
                      : report.compatibilityScore >= 65
                      ? 'bg-emerald-500'
                      : report.compatibilityScore >= 50
                      ? 'bg-amber-500'
                      : report.compatibilityScore >= 35
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${report.compatibilityScore}%` }}
                />
              </div>
            </div>
          </div>
        </DevotionistStyleCard>

        {/* Overview / General Consensus */}
        <DevotionistStyleCard
          icon={<Info className="w-5 h-5" />}
          title="General Overview"
          summary={`This compatibility analysis provides insights into your relationship dynamics with ${report.additionalProfile.name}. The assessment considers various astrological and numerological factors to help you understand what to expect and how to nurture this connection. Remember, every relationship has both strengths and areas for growth.`}
          colorScheme="amber"
          variant="callout"
        />

        {/* Strengths - Good Things to Expect */}
        {report.strengths.length > 0 && (
          <DevotionistStyleCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Strengths & Positive Aspects"
            summary="These are the good things you can expect in this relationship. Every person brings unique positive qualities - here's what makes this connection special:"
            items={report.strengths.map((text) => ({ text, type: 'positive' as const }))}
            colorScheme="green"
            variant="callout"
          />
        )}

        {/* Considerations - Things to Be Aware Of */}
        {report.challenges.length > 0 && (
          <DevotionistStyleCard
            icon={<AlertTriangle className="w-5 h-5" />}
            title="Considerations & Things to Be Aware Of"
            summary="These are areas where awareness and understanding can help strengthen your relationship. Being mindful of these aspects will help you navigate challenges with grace:"
            items={report.challenges.map((text) => ({ text, type: 'challenge' as const }))}
            colorScheme="orange"
            variant="callout"
          />
        )}

        {/* Relationship Insights */}
        <DevotionistStyleCard
          icon={<Heart className="w-5 h-5" />}
          title="Relationship Insights"
          summary={`Based on this compatibility analysis, here's what you can expect from your relationship with ${report.additionalProfile.name}:`}
          colorScheme="purple"
          variant="callout"
        >
          <div className="bg-purple-50/60 rounded-lg p-4 border border-purple-200">
            <p className="text-slate-700 text-sm leading-relaxed">
              {report.overallAssessment === 'Excellent' &&
                `${report.additionalProfile.name} appears to be someone with whom you share excellent compatibility. This person likely brings out the best in you and complements your nature well. Expect a relationship characterized by mutual understanding, shared values, and harmonious interactions.`}
              {report.overallAssessment === 'Good' &&
                `${report.additionalProfile.name} shows good compatibility with you. You can expect a positive relationship with shared interests and good rapport. This person is likely to be a supportive friend/partner who understands your perspective.`}
              {report.overallAssessment === 'Moderate' &&
                `Your relationship with ${report.additionalProfile.name} shows moderate compatibility. This suggests a balanced connection where both strengths and differences coexist. With understanding and effort, this can develop into a meaningful relationship.`}
              {report.overallAssessment === 'Challenging' &&
                `Your relationship with ${report.additionalProfile.name} may require more understanding and patience. While there are differences, these can be opportunities for growth. Focus on the positive aspects and work through challenges with open communication.`}
              {report.overallAssessment === 'Poor' &&
                `Your compatibility with ${report.additionalProfile.name} shows areas that require attention. However, remember that every relationship can be improved with understanding, respect, and effort. Consider the strengths mentioned above and focus on building mutual respect.`}
            </p>
          </div>
        </DevotionistStyleCard>

        {/* Business Suitability */}
        {report.businessSuitability && (
          <DevotionistStyleCard
            icon={<Briefcase className="w-5 h-5" />}
            title="Business Suitability"
            colorScheme="amber"
            variant="callout"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-700">
                    {report.businessSuitability.score}
                  </div>
                  <div className="text-slate-600 text-xs">Score</div>
                </div>
                <p className="text-slate-700 flex-1 text-sm">{report.businessSuitability.analysis}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {report.businessSuitability.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DevotionistStyleCard>
        )}

        {/* Personal Compatibility */}
        {report.personalCompatibility && (
          <DevotionistStyleCard
            icon={<Heart className="w-5 h-5" />}
            title="Personal Compatibility"
            colorScheme="pink"
            variant="callout"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-700">
                    {report.personalCompatibility.score}
                  </div>
                  <div className="text-slate-600 text-xs">Score</div>
                </div>
                <p className="text-slate-700 flex-1 text-sm">{report.personalCompatibility.analysis}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-pink-800 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {report.personalCompatibility.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <Heart className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DevotionistStyleCard>
        )}

        {/* Recommendations - Practical Expectations */}
        {report.recommendations.length > 0 && (
          <DevotionistStyleCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="Practical Recommendations & What to Expect"
            summary="Here are practical suggestions to help you navigate and strengthen your relationship:"
            items={report.recommendations.map((text) => ({ text, type: 'neutral' as const }))}
            colorScheme="amber"
            variant="callout"
          />
        )}

      </div>
    </ScrollArea>
  )
}

