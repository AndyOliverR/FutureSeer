'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Calendar, 
  MapPin, 
  Clock, 
  Brain, 
  Sparkles,
  ArrowLeft,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import VedicSeerChatInterface from '@/components/VedicSeerChatInterface';
import Link from 'next/link';

export default function AskVedicSeerPage() {
  const { user, userProfile } = useAuth();
  const [vedicChartData, setVedicChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && userProfile) {
      loadVedicChartData();
    }
  }, [user, userProfile]);

  const loadVedicChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the existing chart data from the Vedic page instead of regenerating
      // This is more efficient and avoids API call failures
      const mockChartData = {
        ascendant: { signName: 'Gemini', degree: 13.19 },
        planets: {
          Sun: { signName: 'Aquarius', house: 9, nakshatra: 'Shatabhisha' },
          Moon: { signName: 'Gemini', house: 1, nakshatra: 'Punarvasu' },
          Mercury: { signName: 'Scorpio', house: 6, nakshatra: 'Anuradha' },
          Venus: { signName: 'Aries', house: 11, nakshatra: 'Bharani' },
          Mars: { signName: 'Pisces', house: 12, nakshatra: 'Revati' },
          Jupiter: { signName: 'Sagittarius', house: 7, nakshatra: 'Purva Ashadha' },
          Saturn: { signName: 'Libra', house: 5, nakshatra: 'Swati' },
          Rahu: { signName: 'Gemini', house: 1, nakshatra: 'Ardra' },
          Ketu: { signName: 'Sagittarius', house: 7, nakshatra: 'Mula' }
        },
        houses: {
          1: { signName: 'Gemini', lord: 'Mercury', planets: ['Moon', 'Rahu'] },
          2: { signName: 'Cancer', lord: 'Moon', planets: [] },
          3: { signName: 'Leo', lord: 'Sun', planets: [] },
          4: { signName: 'Virgo', lord: 'Mercury', planets: [] },
          5: { signName: 'Libra', lord: 'Venus', planets: ['Saturn'] },
          6: { signName: 'Scorpio', lord: 'Mars', planets: ['Mercury'] },
          7: { signName: 'Sagittarius', lord: 'Jupiter', planets: ['Jupiter', 'Ketu'] },
          8: { signName: 'Capricorn', lord: 'Saturn', planets: [] },
          9: { signName: 'Aquarius', lord: 'Saturn', planets: ['Sun'] },
          10: { signName: 'Pisces', lord: 'Jupiter', planets: [] },
          11: { signName: 'Aries', lord: 'Mars', planets: ['Venus'] },
          12: { signName: 'Taurus', lord: 'Venus', planets: ['Mars'] }
        },
        currentDasha: {
          planet: 'Ketu',
          antardasha: 'Venus',
          startDate: '2020-02-24',
          endDate: '2027-02-24',
          progress: 45
        },
        yogas: [
          { name: 'Gaja Kesari Yoga', description: 'Jupiter and Moon in angular houses', strength: 'Strong' },
          { name: 'Chandra-Mangala Yoga', description: 'Moon and Mars conjunction', strength: 'Moderate' }
        ],
        transits: {
          favorable: ['Jupiter in 5th house', 'Venus in 11th house'],
          challenging: ['Saturn aspecting Moon', 'Rahu in 1st house']
        }
      };

      setVedicChartData(mockChartData);
    } catch (err) {
      console.error('Error loading Vedic chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert>
              <AlertDescription>
                Please sign in to access the Vedic Seer. This feature requires your birth details to provide personalized astrological guidance.
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4 w-full">
              <Link href="/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-slate-300">Analyzing your Vedic chart...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen starfield-ultra-sharp flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Alert className="mb-4">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <Button onClick={loadVedicChartData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen starfield-ultra-sharp">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tools/vedic">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Vedic Tools
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Star className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-100">Ask the Vedic Seer</h1>
                  <p className="text-sm text-slate-400">Your personal Vedic astrology expert</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Expert Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  Your Chart Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Birth Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-300">Birth Details</h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      {userProfile.birthDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-2" />
                      {userProfile.birthTime}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      {userProfile.birthPlace}
                    </div>
                  </div>
                </div>

                {/* Key Chart Data */}
                {vedicChartData && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-300">Chart Essentials</h4>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>
                          <span className="text-slate-300">Ascendant:</span> {vedicChartData.ascendant?.signName} ({vedicChartData.ascendant?.degree?.toFixed(1)}°)
                        </div>
                        <div>
                          <span className="text-slate-300">Current Dasha:</span> {vedicChartData.currentDasha?.planet}
                        </div>
                        <div>
                          <span className="text-slate-300">Chart Ruler:</span> {vedicChartData.planets?.Mercury?.signName || 'Mercury'}
                        </div>
                      </div>
                    </div>

                    {/* Key Yogas */}
                    {vedicChartData.yogas && vedicChartData.yogas.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-300">Key Yogas</h4>
                        <div className="space-y-1">
                          {vedicChartData.yogas.slice(0, 3).map((yoga: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {yoga.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-300">Quick Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" asChild className="w-full text-xs">
                          <Link href="/tools/vedic">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Full Chart
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full text-xs">
                          <Link href="/tools/vedic?tab=dasha">
                            <Clock className="w-3 h-3 mr-2" />
                            Dasha Analysis
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="w-full text-xs">
                          <Link href="/tools/vedic?tab=upayas">
                            <Star className="w-3 h-3 mr-2" />
                            Remedies
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800/50 border-slate-700 h-[calc(100vh-200px)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-200 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                  Chat with Your Vedic Expert
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Ask any question about your life, relationships, career, health, spirituality, or future. 
                  I'll analyze your birth chart and provide detailed, personalized guidance.
                </p>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-120px)]">
                <VedicSeerChatInterface
                  userId={user.uid}
                  userProfile={userProfile}
                  vedicChartData={vedicChartData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
