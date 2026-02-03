"use client"

import { CompatibilityReport } from '@/lib/types/profileTypes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface CompatibilityReportProps {
  report: CompatibilityReport
}

const ASSESSMENT_COLORS = {
  'Excellent': 'text-green-400 border-green-400/40 bg-green-500/10',
  'Good': 'text-emerald-400 border-emerald-400/40 bg-emerald-500/10',
  'Moderate': 'text-yellow-400 border-yellow-400/40 bg-yellow-500/10',
  'Challenging': 'text-orange-400 border-orange-400/40 bg-orange-500/10',
  'Poor': 'text-red-400 border-red-400/40 bg-red-500/10'
}

export function CompatibilityReport({ report }: CompatibilityReportProps) {
  const scoreColor = report.compatibilityScore >= 80
    ? 'text-green-400'
    : report.compatibilityScore >= 65
    ? 'text-emerald-400'
    : report.compatibilityScore >= 50
    ? 'text-yellow-400'
    : report.compatibilityScore >= 35
    ? 'text-orange-400'
    : 'text-red-400'

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
        <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <Star className="w-5 h-5" />
              Overall Compatibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${scoreColor}`}>
                  {report.compatibilityScore}
                </div>
                <div className="text-slate-400 text-sm mt-1">out of 100</div>
              </div>
              <div className="flex-1">
                <Badge className={`${ASSESSMENT_COLORS[report.overallAssessment]} text-lg px-4 py-2 mb-2`}>
                  {report.overallAssessment}
                </Badge>
                <div className="w-full bg-slate-800 rounded-full h-3 mt-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      report.compatibilityScore >= 80
                        ? 'bg-green-500'
                        : report.compatibilityScore >= 65
                        ? 'bg-emerald-500'
                        : report.compatibilityScore >= 50
                        ? 'bg-yellow-500'
                        : report.compatibilityScore >= 35
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${report.compatibilityScore}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview / General Consensus */}
        <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <Info className="w-5 h-5" />
              General Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed">
              This compatibility analysis provides insights into your relationship dynamics with {report.additionalProfile.name}. 
              The assessment considers various astrological and numerological factors to help you understand what to expect 
              and how to nurture this connection. Remember, every relationship has both strengths and areas for growth.
            </p>
          </CardContent>
        </Card>

        {/* Strengths - Good Things to Expect */}
        {report.strengths.length > 0 && (
          <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Strengths & Positive Aspects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                These are the good things you can expect in this relationship. Every person brings unique positive qualities - 
                here's what makes this connection special:
              </p>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Considerations - Things to Be Aware Of */}
        {report.challenges.length > 0 && (
          <Card className="bg-slate-900/50 border-amber-500/30 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Considerations & Things to Be Aware Of
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                These are areas where awareness and understanding can help strengthen your relationship. 
                Being mindful of these aspects will help you navigate challenges with grace:
              </p>
              <ul className="space-y-3">
                {report.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Friendship Insights - What Kind of Friend/Partner */}
        <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <Heart className="w-5 h-5" />
              Relationship Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed mb-4">
              Based on this compatibility analysis, here's what you can expect from your relationship with {report.additionalProfile.name}:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                {report.overallAssessment === 'Excellent' && 
                  `${report.additionalProfile.name} appears to be someone with whom you share excellent compatibility. ` +
                  `This person likely brings out the best in you and complements your nature well. Expect a relationship ` +
                  `characterized by mutual understanding, shared values, and harmonious interactions.`
                }
                {report.overallAssessment === 'Good' && 
                  `${report.additionalProfile.name} shows good compatibility with you. ` +
                  `You can expect a positive relationship with shared interests and good rapport. ` +
                  `This person is likely to be a supportive friend/partner who understands your perspective.`
                }
                {report.overallAssessment === 'Moderate' && 
                  `Your relationship with ${report.additionalProfile.name} shows moderate compatibility. ` +
                  `This suggests a balanced connection where both strengths and differences coexist. ` +
                  `With understanding and effort, this can develop into a meaningful relationship.`
                }
                {report.overallAssessment === 'Challenging' && 
                  `Your relationship with ${report.additionalProfile.name} may require more understanding and patience. ` +
                  `While there are differences, these can be opportunities for growth. ` +
                  `Focus on the positive aspects and work through challenges with open communication.`
                }
                {report.overallAssessment === 'Poor' && 
                  `Your compatibility with ${report.additionalProfile.name} shows areas that require attention. ` +
                  `However, remember that every relationship can be improved with understanding, respect, and effort. ` +
                  `Consider the strengths mentioned above and focus on building mutual respect.`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Suitability */}
        {report.businessSuitability && (
          <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-200">
                <Briefcase className="w-5 h-5" />
                Business Suitability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">
                      {report.businessSuitability.score}
                    </div>
                    <div className="text-slate-400 text-xs">Score</div>
                  </div>
                  <p className="text-slate-300 flex-1">{report.businessSuitability.analysis}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {report.businessSuitability.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Compatibility */}
        {report.personalCompatibility && (
          <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-200">
                <Heart className="w-5 h-5" />
                Personal Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-400">
                      {report.personalCompatibility.score}
                    </div>
                    <div className="text-slate-400 text-xs">Score</div>
                  </div>
                  <p className="text-slate-300 flex-1">{report.personalCompatibility.analysis}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {report.personalCompatibility.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300 text-sm">
                        <Heart className="w-4 h-4 text-amber-400 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations - Practical Expectations */}
        {report.recommendations.length > 0 && (
          <Card className="bg-slate-900/50 border-amber-500/50 backdrop-blur-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-200">
                <TrendingUp className="w-5 h-5" />
                Practical Recommendations & What to Expect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4">
                Here are practical suggestions to help you navigate and strengthen your relationship:
              </p>
              <ul className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <TrendingUp className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      </div>
    </ScrollArea>
  )
}

