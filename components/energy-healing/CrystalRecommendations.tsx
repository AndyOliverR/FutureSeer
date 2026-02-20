"use client"

import { motion } from 'framer-motion';
import { CrystalRecommendation } from '@/lib/energyHealing/energyHealingImageAnalyzer';
import { CRYSTAL_DATABASE } from '@/lib/energyHealing/energyHealingData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, Star, Sparkles, Zap } from 'lucide-react';
import { AffiliateLink } from '@/components/AffiliateLink';
import { getCrystalAffiliateUrl } from '@/lib/affiliateConfig';

interface CrystalRecommendationsProps {
  recommendation: CrystalRecommendation;
}

export function CrystalRecommendations({ recommendation }: CrystalRecommendationsProps) {

  return (
    <div className="space-y-6">
      {/* Primary Crystal */}
      {recommendation.primaryCrystal && (
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-amber-900 gold-glow flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-600" />
              Primary Recommended Crystal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300">
                <Gem className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-900">{recommendation.primaryCrystal}</h3>
                <p className="text-amber-800 text-sm mt-1">
                  {CRYSTAL_DATABASE[recommendation.primaryCrystal]?.metaphysicalProperties || 
                   'Recommended for your energy healing journey'}
                </p>
                <AffiliateLink href={getCrystalAffiliateUrl(recommendation.primaryCrystal)} label="Buy here" className="mt-2 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Recommended Crystals */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-amber-900 gold-glow flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-600" />
            Recommended Crystals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Array.isArray(recommendation.crystals) ? recommendation.crystals : []).map((crystal, index) => {
              const crystalName = crystal?.name ?? `Crystal ${index + 1}`;
              const crystalData = CRYSTAL_DATABASE[crystalName] || {
                color: 'Clear',
                chakraAssociation: [],
                properties: [],
                howToUse: []
              };

              return (
                <motion.div
                  key={crystalName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-amber-100/50 border-2 border-amber-300 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-16 h-16 rounded-lg bg-amber-100 flex items-center justify-center border-2 border-amber-300 flex-shrink-0">
                          <Gem className="w-8 h-8 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-amber-900 font-semibold">{crystalName}</h3>
                            <Badge variant="outline" className="border-amber-500 text-amber-900 bg-amber-50 text-xs">
                              {(typeof crystal?.priority === 'string' ? crystal.priority : '—').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-amber-800 text-sm">{crystal?.reason ?? '—'}</p>
                        </div>
                      </div>

                      {crystalData.chakraAssociation && crystalData.chakraAssociation.length > 0 && (
                        <div className="mb-3">
                          <p className="text-amber-800 text-xs mb-1">Chakra Associations:</p>
                          <div className="flex flex-wrap gap-1">
                            {crystalData.chakraAssociation.slice(0, 3).map((chakra, chakraIndex) => (
                              <Badge
                                key={chakraIndex}
                                variant="outline"
                                className="border-amber-400 text-amber-800 bg-amber-50 text-xs"
                              >
                                {chakra}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {crystalData.properties && crystalData.properties.length > 0 && (
                        <div className="mb-3">
                          <p className="text-amber-800 text-xs mb-1">Properties:</p>
                          <div className="flex flex-wrap gap-1">
                            {crystalData.properties.slice(0, 3).map((prop, propIndex) => (
                              <Badge
                                key={propIndex}
                                variant="outline"
                                className="border-amber-400 text-amber-800 bg-amber-50 text-xs"
                              >
                                {prop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {Array.isArray(crystal?.usage) && crystal.usage.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-300">
                          <p className="text-amber-800 text-xs mb-2">How to Use:</p>
                          <ul className="space-y-1">
                            {crystal.usage.slice(0, 3).map((usage, usageIndex) => (
                              <li key={usageIndex} className="text-amber-800 text-xs flex items-start gap-2">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{usage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="mt-3 pt-2">
                        <AffiliateLink href={getCrystalAffiliateUrl(crystalName)} label="Buy here" className="text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Crystal Grid Suggestion */}
      {Array.isArray(recommendation.crystalGrid) && recommendation.crystalGrid.length > 0 && (
        <Card className="bg-slate-900/50 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white gold-glow flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Suggested Crystal Grid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendation.crystalGrid.map((gridItem, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-900/30 rounded-lg border border-amber-500/20">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm">{gridItem}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interpretation */}
      {recommendation.interpretation && (
        <Card className="bg-slate-900/50 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white gold-glow flex items-center gap-2">
              <Gem className="w-5 h-5 text-amber-400" />
              Crystal Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/90">{recommendation.interpretation}</p>
          </CardContent>
        </Card>
      )}

      {/* General Recommendations */}
      {Array.isArray(recommendation.recommendations) && recommendation.recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-900/50 to-amber-900/50 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Usage Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendation.recommendations.map((rec, index) => (
                <li key={index} className="text-white/90 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
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
