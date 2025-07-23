"use client"

import { useState } from "react"
import { VastuTool } from "@/components/VastuTool"
import { VastuCoachInterface } from "@/components/VastuCoachInterface"
import { DataSourceStatus } from "@/components/DataSourceStatus"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from 'react'

export default function VastuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🏠 Vastu Shastra
            </h1>
            <p className="text-xl text-slate-300">
              Ancient Indian science of architecture and space harmony
            </p>
          </div>
          
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-600">
              <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Analysis
              </TabsTrigger>
              <TabsTrigger value="coach" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                AI Coach
              </TabsTrigger>
              <TabsTrigger value="status" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                System Status
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Data Source Status */}
                <div className="lg:col-span-1">
                  <DataSourceStatus />
                </div>
                
                {/* Main Vastu Tool */}
                <div className="lg:col-span-3">
                  <Suspense fallback={<LoadingSpinner />}>
                    <VastuTool />
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
                  <VastuCoachInterface />
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
                        FutureSeer's AI system continuously learns and improves to provide you with the most accurate and personalized Vastu guidance.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">94%</div>
                          <div className="text-sm text-slate-400">Internal Calculations</div>
                        </div>
                        <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">6%</div>
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
                    
                    {/* Vastu System Features */}
                    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Vastu Shastra Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Directional Analysis & Elements</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Room Placement Optimization</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Dosha Detection & Remedies</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Energy Flow Analysis</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Vastu Score Calculation</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Personalized Recommendations</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">Remedy Implementation Guide</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-300">AI-Powered Coaching</span>
                          </div>
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