"use client"

import { motion } from 'framer-motion';
import { ChakraAnalysis } from '@/lib/energyHealing/energyHealingImageAnalyzer';
import { CHAKRA_DATA } from '@/lib/energyHealing/energyHealingData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { AffiliateLink } from '@/components/AffiliateLink';
import { getCrystalAffiliateUrl } from '@/lib/affiliateConfig';

interface ChakraVisualizationProps {
  analysis: ChakraAnalysis;
}

export function ChakraVisualization({ analysis }: ChakraVisualizationProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'balanced':
        return <CheckCircle className="w-4 h-4 text-amber-600" />;
      case 'overactive':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case 'underactive':
        return <TrendingDown className="w-4 h-4 text-amber-700" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      default:
        return <Zap className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Balance */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-700" />
            Overall Chakra Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-amber-950 font-medium">Balance Score</span>
              <span className="text-2xl font-bold text-amber-950">{typeof analysis.overallBalance === 'number' ? analysis.overallBalance : '—'}%</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-amber-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${typeof analysis.overallBalance === 'number' ? Math.min(100, Math.max(0, analysis.overallBalance)) : 0}%` }}
              />
            </div>
            {Array.isArray(analysis.primaryIssues) && analysis.primaryIssues.length > 0 && (
              <div className="mt-4">
                <p className="text-amber-950 text-sm font-medium mb-2">Focus Areas:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.primaryIssues.map((issue, index) => (
                    <Badge key={index} variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chakra List */}
      <div className="space-y-4">
        {(Array.isArray(analysis.chakras) ? analysis.chakras : []).map((chakra, index) => {
          const chakraData = CHAKRA_DATA[chakra.name.toLowerCase().replace(/\s+/g, '').replace('chakra', '') as keyof typeof CHAKRA_DATA] || 
            Object.values(CHAKRA_DATA)[index];
          
          return (
            <motion.div
              key={chakra.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-amber-900 font-bold shadow-lg bg-amber-100 border-2 border-amber-300"
                        >
                          {chakra.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-amber-950 font-semibold">{chakra.name}</h3>
                          <p className="text-amber-900 text-sm font-medium">{chakraData?.sanskritName || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(chakra.status)}
                        <Badge variant="outline" className="border-amber-600 text-amber-950 bg-amber-100 font-medium">
                          {chakra.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-950 font-medium">Balance</span>
                        <span className="text-amber-950 font-semibold">{chakra.balance}%</span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${chakra.balance}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-amber-950 text-sm font-medium mb-3">{chakra.interpretation}</p>

                    {chakra.recommendations && chakra.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-amber-300">
                        <p className="text-amber-950 text-xs font-semibold mb-2">Recommendations:</p>
                        <ul className="space-y-1">
                          {chakra.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-amber-950 text-xs font-medium flex items-start gap-2">
                              <span className="text-amber-800 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <div className="mt-3 pt-3 border-t border-amber-300">
                    <div className="flex flex-wrap gap-2 items-center">
                      {(chakraData?.associatedCrystals ?? []).slice(0, 3).map((crystal, crystalIndex) => (
                        <Badge
                          key={crystalIndex}
                          variant="outline"
                          className="border-amber-400 text-amber-800 bg-amber-50 text-xs"
                        >
                          {crystal}
                        </Badge>
                      ))}
                      <AffiliateLink href={getCrystalAffiliateUrl(chakraData?.associatedCrystals?.[0] || `${chakra.name} crystal`)} label="Shop crystals" className="text-amber-800 font-medium text-xs" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-amber-950 font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-700" />
              General Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-amber-950 font-medium flex items-start gap-2">
                  <span className="text-amber-800 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
