"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTools } from '@/hooks/useTools'
import { useAnalytics } from '@/lib/analytics'
import { ToolSymbol } from '@/components/MysticalSymbol'
import { MysticalCard } from '@/components/MysticalBackground'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolIntroductionTab } from '@/components/ToolIntroductionTab'
import { CompatibilityTab } from '@/components/compatibility/CompatibilityTab'
import { ToolPageHeader } from '@/components/navigation/ToolPageHeader'
import { Sparkles, Star, Clock, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ToolPage() {
  const params = useParams()
  const { tools } = useTools()
  const { trackToolAccess, trackPageView } = useAnalytics()
  const [activeTab, setActiveTab] = useState<'introduction' | 'about' | 'compatibility'>('introduction')
  
  const slug = params.slug as string
  const tool = tools.find(t => t.slug === slug)

  useEffect(() => {
    if (tool) {
      // Track tool access
      trackToolAccess(tool.name, tool.category, {
        tool_slug: slug,
        is_premium: tool.isPremium,
        is_coming_soon: tool.isComingSoon
      })
      
      // Track page view
      trackPageView()
    }
  }, [tool, slug, trackToolAccess, trackPageView])

  if (!tool) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Tool Not Found</h1>
          <p className="text-gray-400 mb-6">The mystical tool you're looking for doesn't exist.</p>
          <Link href="/tools">
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 starfield-ultra-sharp">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ToolPageHeader
          toolName={tool.name}
          toolSlug={slug}
          toolDescription={tool.description}
          toolCategory={tool.category}
          isPremium={tool.isPremium}
          isComingSoon={tool.isComingSoon}
        />

        {/* Tool Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border-amber-500/50 backdrop-blur-md rounded-2xl p-1 mb-6">
            <TabsTrigger 
              value="introduction" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Introduction
            </TabsTrigger>
            <TabsTrigger 
              value="compatibility" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              Compare Profiles
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-3 py-2"
            >
              About & Use
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-6">
            <ToolIntroductionTab toolSlug={slug} />
          </TabsContent>

          <TabsContent value="compatibility" className="space-y-6">
            <CompatibilityTab toolSlug={slug} />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <MysticalCard
              tool={slug}
              showBackground={true}
              className="mb-8"
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">About {tool.name}</h2>
                  <p className="text-soft leading-relaxed">{tool.longDescription ?? tool.description ?? 'No long description available.'}</p>
                </div>
                
                {tool.features && tool.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {tool.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-soft">
                          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {tool.quote && (
                  <blockquote className="border-l-4 border-amber-400 pl-4 italic text-soft">
                    "{tool.quote}"
                  </blockquote>
                )}
              </div>
            </MysticalCard>

            {/* Tool Interface */}
            {!tool.isComingSoon && (
              <MysticalCard tool={slug}>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Ready to join the experiment?</h3>
                  <p className="text-soft mb-6">Experience the mystical power of {tool.name}</p>
                  <Link href={`/tools/${slug}/analyze`}>
                    <Button size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
                      <Star className="w-4 h-4 mr-2" />
                      Start {tool.name} Reading
                    </Button>
                  </Link>
                </div>
              </MysticalCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tool Stats */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Tool Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-soft">Accuracy Rate</span>
                  <span className="text-amber-400 font-semibold">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-soft">Response Time</span>
                  <span className="text-amber-400 font-semibold">~2s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-soft">User Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-amber-400 font-semibold">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Tools */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Related Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tools
                    .filter(t => t.category === tool.category && t.slug !== slug)
                    .slice(0, 3)
                    .map((relatedTool) => (
                      <Link
                        key={relatedTool.slug}
                        href={`/tools/${relatedTool.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <ToolSymbol
                          toolName={relatedTool.slug}
                          size="sm"
                          variant="default"
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{relatedTool.name}</p>
                          <p className="text-soft text-xs">{relatedTool.description}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Share Reading
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Track Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
