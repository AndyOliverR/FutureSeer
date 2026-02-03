'use client';

import { motion } from 'framer-motion';
import { Compass, Home, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { VastuMainEntranceAnalysis } from '@/lib/vastuIntelligence';

interface VastuMainEntranceGuideProps {
  analysis: VastuMainEntranceAnalysis;
}

export function VastuMainEntranceGuide({ analysis }: VastuMainEntranceGuideProps) {
  const { houseFacing, bestPadas, avoidPadas, colorRecommendations, doorOpening, remedies, ganeshaPlacement } = analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-amber-900">Main Entrance Analysis</h3>
          <p className="text-slate-600">32 Padas System - {houseFacing.charAt(0).toUpperCase() + houseFacing.slice(1)} Facing House</p>
        </div>
      </div>

      {/* Best Padas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="text-xl font-semibold text-amber-900">Auspicious Padas (Best for Entrance)</h4>
        </div>
        {bestPadas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bestPadas.map((pada, index) => (
              <motion.div
                key={pada.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-amber-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-800 text-lg">{pada.id}</span>
                  <span className="text-xs bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded-full">Auspicious</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">{pada.name}</h5>
                <p className="text-sm text-slate-600 mb-2">{pada.deity}</p>
                <div className="space-y-1">
                  <p className="text-xs text-amber-800 font-medium">Effects:</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    {pada.effects.map((effect, i) => (
                      <li key={i}>• {effect}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-xs text-slate-600">Element: {pada.element}</p>
                  <p className="text-xs text-slate-600">Color: {pada.color}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No auspicious padas found for this direction.</p>
        )}
      </motion.div>

      {/* Avoid Padas */}
      {avoidPadas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/80 border-2 border-red-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-xl font-semibold text-red-900">Inauspicious Padas (Avoid for Entrance)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {avoidPadas.map((pada, index) => (
              <motion.div
                key={pada.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 rounded-xl p-4 border-2 border-red-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-red-800 text-lg">{pada.id}</span>
                  <span className="text-xs bg-red-100 text-red-800 border border-red-300 px-2 py-1 rounded-full">Avoid</span>
                </div>
                <h5 className="font-semibold text-slate-800 mb-1">{pada.name}</h5>
                <p className="text-sm text-slate-600 mb-2">{pada.deity}</p>
                <div className="space-y-1">
                  <p className="text-xs text-red-700 font-medium">Effects:</p>
                  <ul className="text-xs text-slate-700 space-y-0.5">
                    {pada.effects.map((effect, i) => (
                      <li key={i}>• {effect}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-700" />
            <h4 className="text-lg font-semibold text-amber-900">Color Recommendations</h4>
          </div>
          <p className="text-slate-700 leading-relaxed">{colorRecommendations}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-amber-700" />
            <h4 className="text-lg font-semibold text-amber-900">Door Opening Direction</h4>
          </div>
          <p className="text-slate-700 leading-relaxed">{doorOpening}</p>
          <div className="mt-4 p-3 bg-amber-100 rounded-xl border-2 border-amber-200">
            <p className="text-sm text-amber-900">
              <strong>Tip:</strong> The main door should be larger than other doors in your house.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Ganesha Placement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-amber-700" />
          <h4 className="text-lg font-semibold text-amber-900">Lord Ganesha Placement</h4>
        </div>
        <div className="space-y-2">
          <p className="text-slate-700">
            <strong className="text-amber-800">Location:</strong> <span className="text-slate-800">{ganeshaPlacement.location}</span>
          </p>
          <p className="text-slate-700">
            <strong className="text-amber-800">Position:</strong> <span className="text-slate-800">{ganeshaPlacement.position}</span>
          </p>
          <p className="text-slate-600 text-sm mt-3">{ganeshaPlacement.notes}</p>
        </div>
      </motion.div>

      {/* Remedies */}
      {remedies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h4 className="text-lg font-semibold text-amber-900">Remedies & Solutions</h4>
          </div>
          <ul className="space-y-2">
            {remedies.map((remedy, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-amber-600 mt-1">•</span>
                <span className="text-slate-700 flex-1">{remedy}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* General Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-6 shadow-sm"
      >
        <h4 className="text-lg font-semibold text-amber-900 mb-4">General Vastu Tips for Main Entrance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium text-amber-900">Do&apos;s:</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>✓ Make main door larger than other doors</li>
              <li>✓ Ensure sufficient light at entrance</li>
              <li>✓ Use wooden door instead of metal</li>
              <li>✓ Place nameplate on right side</li>
              <li>✓ Keep entrance clean and obstacle-free</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium text-amber-900">Don&apos;ts:</h5>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>✗ Avoid irregularly shaped gates</li>
              <li>✗ Don&apos;t place bathroom near main door</li>
              <li>✗ Avoid shoe racks in front of entrance</li>
              <li>✗ Don&apos;t position mirror opposite entrance</li>
              <li>✗ Avoid staircase or lift directly facing door</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
