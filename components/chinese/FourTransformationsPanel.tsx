/**
 * Four Transformations Panel Component
 * Displays 四化 (Lu, Quan, Ke, Ji) analysis
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  Shield,
  Award,
  AlertTriangle,
  Star,
  TrendingUp,
} from 'lucide-react'
import { ZiWeiChartData } from '@/lib/chinese/chineseAstrologyService'

interface FourTransformationsPanelProps {
  chartData: ZiWeiChartData
}

export default function FourTransformationsPanel({
  chartData,
}: FourTransformationsPanelProps) {
  // Extract four transformations from chart data
  // In a full implementation, this would come from actual chart calculations
  const transformations = {
    lu: {
      name: '禄 (Lu)',
      english: 'Wealth & Prosperity',
      star: '天梁',
      palace: 'Wealth Palace',
      meaning: 'Lu represents material wealth, income, and prosperity. This transformation brings opportunities for financial gain and stability.',
      influence: 'Positive influence on wealth accumulation and material success',
      color: 'green',
      icon: DollarSign,
    },
    quan: {
      name: '权 (Quan)',
      english: 'Power & Authority',
      star: '紫微',
      palace: 'Career Palace',
      meaning: 'Quan represents power, authority, and leadership. This transformation enhances your ability to lead and make important decisions.',
      influence: 'Strengthens leadership qualities and decision-making abilities',
      color: 'blue',
      icon: Shield,
    },
    ke: {
      name: '科 (Ke)',
      english: 'Fame & Recognition',
      star: '天府',
      palace: 'Fortune Palace',
      meaning: 'Ke represents fame, recognition, and intellectual achievements. This transformation brings opportunities for academic and professional recognition.',
      influence: 'Enhances reputation and intellectual pursuits',
      color: 'purple',
      icon: Award,
    },
    ji: {
      name: '忌 (Ji)',
      english: 'Challenges & Obstacles',
      star: '武曲',
      palace: 'Wealth Palace',
      meaning: 'Ji represents challenges, obstacles, and areas requiring careful attention. This transformation indicates areas where you need to be cautious and patient.',
      influence: 'Requires careful attention and patience in related matters',
      color: 'red',
      icon: AlertTriangle,
    },
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      green: 'bg-green-50/80 border-green-200 text-green-900',
      blue: 'bg-blue-50/80 border-blue-200 text-blue-900',
      purple: 'bg-purple-50/80 border-purple-200 text-purple-900',
      red: 'bg-red-50/80 border-red-200 text-red-900',
    }
    return colorMap[color] || 'bg-slate-50/80 border-slate-200 text-slate-700'
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-700" />
            Four Transformations (四化)
          </CardTitle>
          <p className="text-slate-700 text-sm mt-2">
            The Four Transformations represent changes in fortune through life cycles: Lu (Wealth), Quan (Power), Ke (Fame), and Ji (Challenges).
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(transformations).map(([key, trans], index) => {
          const Icon = trans.icon
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${getColorClasses(trans.color)} border-2`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${trans.color === 'green' ? 'bg-green-100' : trans.color === 'blue' ? 'bg-blue-100' : trans.color === 'purple' ? 'bg-purple-100' : 'bg-red-100'}`}>
                      <Icon className={`w-5 h-5 ${trans.color === 'green' ? 'text-green-700' : trans.color === 'blue' ? 'text-blue-700' : trans.color === 'purple' ? 'text-purple-700' : 'text-red-700'}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${trans.color === 'green' ? 'text-green-900' : trans.color === 'blue' ? 'text-blue-900' : trans.color === 'purple' ? 'text-purple-900' : 'text-red-900'}`}>{trans.name}</CardTitle>
                      <p className="text-sm text-slate-600">{trans.english}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Star & Palace</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-current/50 ${trans.color === 'green' ? 'text-green-700 bg-green-50' : trans.color === 'blue' ? 'text-blue-700 bg-blue-50' : trans.color === 'purple' ? 'text-purple-700 bg-purple-50' : 'text-red-700 bg-red-50'}`}>
                        {trans.star}
                      </Badge>
                      <span className="text-sm text-slate-700">in</span>
                      <Badge variant="outline" className={`border-current/50 ${trans.color === 'green' ? 'text-green-700 bg-green-50' : trans.color === 'blue' ? 'text-blue-700 bg-blue-50' : trans.color === 'purple' ? 'text-purple-700 bg-purple-50' : 'text-red-700 bg-red-50'}`}>
                        {trans.palace}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-1">Meaning</p>
                    <p className="text-sm leading-relaxed text-slate-700">{trans.meaning}</p>
                  </div>

                  <div className="p-3 bg-slate-100/60 rounded-lg border border-current/30">
                    <div className="flex items-start gap-2">
                      <TrendingUp className={`w-4 h-4 mt-0.5 flex-shrink-0 ${trans.color === 'green' ? 'text-green-700' : trans.color === 'blue' ? 'text-blue-700' : trans.color === 'purple' ? 'text-purple-700' : 'text-red-700'}`} />
                      <p className="text-xs leading-relaxed text-slate-700">{trans.influence}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Interpretation Guide */}
      <Card elevation={2} className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-200 shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle className="text-purple-900 text-lg">Understanding the Transformations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              The Four Transformations (四化) are fundamental concepts in Zi Wei Dou Shu that describe how stars change their influence over time. Each transformation represents a different aspect of fortune:
            </p>
            <ul className="space-y-2 list-disc list-inside ml-2">
              <li>
                <span className="font-semibold text-green-900">Lu (禄)</span>: Material wealth and prosperity. When activated, brings opportunities for financial gain.
              </li>
              <li>
                <span className="font-semibold text-blue-900">Quan (权)</span>: Power and authority. Enhances leadership abilities and decision-making.
              </li>
              <li>
                <span className="font-semibold text-purple-900">Ke (科)</span>: Fame and recognition. Brings intellectual achievements and reputation.
              </li>
              <li>
                <span className="font-semibold text-red-900">Ji (忌)</span>: Challenges and obstacles. Requires careful attention and patience.
              </li>
            </ul>
            <p className="pt-2 border-t border-purple-200 text-slate-700">
              These transformations interact with the stars in your chart to create different fortune cycles throughout your life. Understanding them helps you navigate opportunities and challenges more effectively.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

