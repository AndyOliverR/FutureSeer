"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testHoraryData = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/debug/astroapp-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'debug-user',
          type: 'horary',
          questionData: {
            question: 'Will I get the job?',
            questionTime: new Date().toISOString(),
            questionPlace: 'New York, USA',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: -5
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const testVedicData = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/debug/astroapp-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'debug-user',
          type: 'vedic',
          questionData: {
            birthDate: '1990-01-01',
            birthTime: '12:00:00',
            birthPlace: 'Mumbai, India',
            latitude: 19.0760,
            longitude: 72.8777,
            timezone: 5.5
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 starfield-ultra-sharp">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <h1 className="text-5xl font-bold text-yellow-400 mb-4">🔍 AstroApp Data Audit</h1>
          <p className="text-white text-lg">
            Debug tool to verify what data we're actually receiving from AstroApp API
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Buttons */}
          <div className="glass-card rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Test AstroApp API</h2>
            
            <div className="space-y-4">
              <button
                onClick={testHoraryData}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Horary Astrology Data'}
              </button>
              
              <button
                onClick={testVedicData}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Vedic Astrology Data'}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="glass-card rounded-3xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
            
            {results ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <h3 className="text-green-400 font-semibold mb-2">✅ Data Quality Check</h3>
                  <div className="text-white text-sm space-y-1">
                    <p>Raw Data Complete: {results.analysis?.dataQuality?.rawDataComplete ? '✅' : '❌'}</p>
                    <p>Processed Data Complete: {results.analysis?.dataQuality?.processedDataComplete ? '✅' : '❌'}</p>
                    <p>Chart Image Available: {results.analysis?.dataQuality?.chartImageAvailable ? '✅' : '❌'}</p>
                    <p>Has Real Data: {results.analysis?.dataQuality?.hasRealData ? '✅' : '❌'}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-blue-400 font-semibold mb-2">📊 Raw Data Structure</h3>
                  <div className="text-white text-sm space-y-1">
                    <p>Objects Count: {results.analysis?.rawDataStructure?.objectsCount}</p>
                    <p>House Cusps Count: {results.analysis?.rawDataStructure?.houseCuspsCount}</p>
                    <p>Aspects Count: {results.analysis?.rawDataStructure?.aspectsCount}</p>
                    <p>Has Chart Image: {results.analysis?.rawDataStructure?.hasImgPath ? '✅' : '❌'}</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <h3 className="text-purple-400 font-semibold mb-2">🎯 Processed Data Structure</h3>
                  <div className="text-white text-sm space-y-1">
                    <p>Planetary Positions: {results.analysis?.processedDataStructure?.planetaryPositionsCount}</p>
                    <p>House Analysis: {results.analysis?.processedDataStructure?.houseAnalysisCount}</p>
                    <p>Aspects: {results.analysis?.processedDataStructure?.aspectsCount}</p>
                    <p>Has Answer: {results.analysis?.processedDataStructure?.hasAnswer ? '✅' : '❌'}</p>
                  </div>
                </div>

                {results.analysis?.sampleData?.chartImage && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h3 className="text-yellow-400 font-semibold mb-2">🖼️ Chart Image</h3>
                    <img 
                      src={results.analysis.sampleData.chartImage} 
                      alt="Chart" 
                      className="w-full rounded-lg border border-white/20"
                      style={{ borderRadius: '200px' }}
                    />
                  </div>
                )}

                <details className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
                  <summary className="text-gray-400 font-semibold cursor-pointer">🔍 Full Raw Data</summary>
                  <pre className="text-white text-xs mt-2 overflow-auto max-h-96">
                    {JSON.stringify(results.rawData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-white/70">Click a test button to analyze AstroApp API data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
