"use client"

import { useState, useEffect } from "react"
import { devLog } from '@/lib/devLogger';
import { useAuth } from "@/hooks/use-auth"
import { updateUserProfile } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { doc, setDoc, getFirestore, getDoc, collection, query, orderBy, getDocs, deleteDoc, Timestamp } from "firebase/firestore"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { AstrologyReportPDF } from "./AstrologyReportPDF"
import { LagnaChartSVG } from "./LagnaChartSVG"
import { NavamsaChartSVG } from "./NavamsaChartSVG"
import { Suspense } from 'react'
import { AstrologyTool } from '@/components/AstrologyTool'
import { DataSourceStatus } from '@/components/DataSourceStatus'
import { AstroCoachInterface } from '@/components/AstroCoachInterface'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Real AstroApp API integration
async function fetchAstroData({ birthDate, birthTime, birthPlace, displayName }: any, userId?: string) {
  try {
    devLog.debug('Fetching comprehensive astro data for:', { birthDate, birthTime, birthPlace, displayName, userId })
    
    // Use comprehensive astro data service with userId for caching
    const { getComprehensiveAstroData } = await import('@/lib/astroDataService')
    const comprehensiveData = await getComprehensiveAstroData(
      userId || 'anonymous',
      birthDate,
      birthPlace,
      birthTime
    )
    
    // Transform to expected format for backward compatibility
    return {
      sun_sign: comprehensiveData.sunSign,
      moon_sign: comprehensiveData.moonSign,
      rising_sign: comprehensiveData.risingSign,
      planets: comprehensiveData.planets.map(planet => ({
        name: planet.name,
        sign: planet.sign,
        degree: planet.degree,
        house: planet.house
      })),
      houses: comprehensiveData.houses.map(house => ({
        number: house.number,
        sign: house.sign,
        degree: house.degree
      })),
      aspects: comprehensiveData.aspects,
      elements: comprehensiveData.elements,
      modalities: comprehensiveData.modalities,
      personalityTraits: comprehensiveData.personalityTraits,
      lifePath: comprehensiveData.lifePath,
      challenges: comprehensiveData.challenges,
      strengths: comprehensiveData.strengths,
      compatibility: comprehensiveData.compatibility,
      currentTransits: comprehensiveData.currentTransits,
      metadata: comprehensiveData.metadata
    }
  } catch (error: any) {
    devLog.error('Error fetching comprehensive astro data:', error, 'page')
    throw new Error(`Failed to fetch astrological data: ${error.message}`)
  }
}

export default function AstrologyPage() {
  return (
    <div className="min-h-screen starfield-ultra-sharp">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gold-glow mb-4">
              Astrological Insights
            </h1>
            <p className="text-soft text-xl leading-relaxed">
              Discover your cosmic blueprint and unlock the secrets of the stars
            </p>
          </div>
          
          <Tabs defaultValue="chart" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-amber-500/30 rounded-xl">
              <TabsTrigger value="chart" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg">
                Birth Chart
              </TabsTrigger>
              <TabsTrigger value="coach" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg">
                AI Coach
              </TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-lg">
                System Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Data Source Status */}
                <div className="lg:col-span-1">
                  <DataSourceStatus />
                </div>
                
                {/* Main Astrology Tool */}
                <div className="lg:col-span-3">
                  <Suspense fallback={<LoadingSpinner />}>
                    <AstrologyTool />
                  </Suspense>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="coach" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Data Source Status */}
                <div className="lg:col-span-1">
                  <DataSourceStatus />
                </div>
                
                {/* AI Coach Interface */}
                <div className="lg:col-span-3">
                  <AstroCoachInterface />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="status" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Data Source Status */}
                <div className="lg:col-span-1">
                  <DataSourceStatus />
                </div>
                
                {/* System Status Details */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">System Intelligence Status</h3>
                      <p className="text-slate-300 mb-4">
                        FutureSeer's AI system continuously learns and improves to provide you with the most accurate and personalized astrological guidance.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">90%</div>
                          <div className="text-sm text-slate-400">Internal Calculations</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">10%</div>
                          <div className="text-sm text-slate-400">Learning Mode</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">24h</div>
                          <div className="text-sm text-slate-400">Data Freshness</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-400">AI</div>
                          <div className="text-sm text-slate-400">Powered</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 