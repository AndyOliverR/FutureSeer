'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import {
  VASTU_REMEDIES_INTRO,
  TOP_10_REMEDIES,
  AREA_REMEDIES,
  KEY_TIPS,
  QUICK_DIRECTIONAL_TABLE,
} from '@/lib/vastuDocumentedRemedies';

export function VastuDocumentedRemedies() {
  const [expandedRemedy, setExpandedRemedy] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-amber-700" />
          <h3 className="text-xl font-bold text-amber-900">Documented Vastu Remedies</h3>
        </div>
        <p className="text-slate-700">{VASTU_REMEDIES_INTRO}</p>
      </div>

      {/* Top 10 Remedies */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <h4 className="text-lg font-bold text-amber-900 mb-4">Top 10 Documented Vastu Remedies</h4>
        <div className="space-y-2">
          {TOP_10_REMEDIES.map((remedy, index) => (
            <div
              key={index}
              className="bg-white/80 border-2 border-amber-200 rounded-xl p-4 shadow-sm"
            >
              <motion.button
                onClick={() =>
                  setExpandedRemedy(expandedRemedy === index ? null : index)
                }
                className="w-full text-left flex items-center justify-between gap-2"
              >
                <span className="font-semibold text-amber-900">
                  {index + 1}. {remedy.name}
                </span>
                <span className="text-amber-600 text-sm">
                  {expandedRemedy === index ? '▼' : '▶'}
                </span>
              </motion.button>
              <AnimatePresence>
                {expandedRemedy === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-slate-700 mt-3 pt-3 border-t border-amber-200">
                      {remedy.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Common Area-Specific Remedies */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <h4 className="text-lg font-bold text-amber-900 mb-4">
          Common Area-Specific Remedies
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-4">
            <h5 className="font-semibold text-amber-900 mb-2">Entrance</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              {AREA_REMEDIES.entrance.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-4">
            <h5 className="font-semibold text-amber-900 mb-2">Toilet / Bathroom</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              {AREA_REMEDIES.toiletBathroom.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-4">
            <h5 className="font-semibold text-amber-900 mb-2">Bedroom</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              {AREA_REMEDIES.bedroom.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-4">
            <h5 className="font-semibold text-amber-900 mb-2">Kitchen</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              {AREA_REMEDIES.kitchen.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/80 border-2 border-amber-200 rounded-xl p-4 md:col-span-2">
            <h5 className="font-semibold text-amber-900 mb-2">Northeast Corner</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              {AREA_REMEDIES.northeastCorner.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Tips to Avoid Negative Energy */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <h4 className="text-lg font-bold text-amber-900 mb-4">
          Key Tips to Avoid Negative Energy
        </h4>
        <ul className="space-y-2 text-sm text-slate-700">
          {KEY_TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-600 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Directional Remedies Table */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h4 className="text-lg font-bold text-amber-900 mb-4">
          Quick Directional Remedies
        </h4>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-amber-300">
              <th className="text-left py-3 px-4 font-semibold text-amber-900">
                Problem Area
              </th>
              <th className="text-left py-3 px-4 font-semibold text-amber-900">
                Remedy
              </th>
            </tr>
          </thead>
          <tbody>
            {QUICK_DIRECTIONAL_TABLE.map((row, i) => (
              <tr
                key={i}
                className="border-b border-amber-200 hover:bg-amber-50/50"
              >
                <td className="py-3 px-4 font-medium text-slate-800">
                  {row.problemArea}
                </td>
                <td className="py-3 px-4 text-slate-700">{row.remedy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
