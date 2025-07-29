"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { AdvancedUserProfile } from '@/lib/advancedPersonalization';
import AdvancedProfileSetup from '@/components/AdvancedProfileSetup';

export default function AdvancedPersonalizationPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdvancedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/personalization/profile?userId=${user?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.advancedProfile);
        calculateCompletion(data.advancedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = (profileData: AdvancedUserProfile) => {
    let completed = 0;
    let total = 0;

    // Check personality data
    if (profileData.mbtiType) completed++;
    if (profileData.enneagramType) completed++;
    total += 2;

    // Check lifestyle data
    const lifestyleFields = Object.values(profileData.lifestyle);
    completed += lifestyleFields.filter(field => field && field !== '').length;
    total += lifestyleFields.length;

    // Check spiritual beliefs
    const spiritualFields = Object.values(profileData.spiritualBeliefs);
    completed += spiritualFields.filter(field => 
      field && (typeof field === 'string' ? field !== '' : Array.isArray(field) ? field.length > 0 : true)
    ).length;
    total += spiritualFields.length;

    // Check life goals
    const goalFields = Object.values(profileData.lifeGoals);
    completed += goalFields.filter(field => 
      field && (typeof field === 'string' ? field !== '' : Array.isArray(field) ? field.length > 0 : true)
    ).length;
    total += goalFields.length;

    // Check current context
    const contextFields = Object.values(profileData.currentContext);
    completed += contextFields.filter(field => 
      field && (typeof field === 'string' ? field !== '' : Array.isArray(field) ? field.length > 0 : true)
    ).length;
    total += contextFields.length;

    // Check preferences
    const preferenceFields = Object.values(profileData.preferences);
    completed += preferenceFields.filter(field => 
      Array.isArray(field) ? field.length > 0 : field && field !== ''
    ).length;
    total += preferenceFields.length;

    // Check health profile
    const healthFields = Object.values(profileData.healthProfile);
    completed += healthFields.filter(field => 
      field && (typeof field === 'string' ? field !== '' : Array.isArray(field) ? field.length > 0 : true)
    ).length;
    total += healthFields.length;

    setCompletionPercentage(Math.round((completed / total) * 100));
  };

  const handleProfileComplete = (newProfile: AdvancedUserProfile) => {
    setProfile(newProfile);
    setIsEditing(false);
    calculateCompletion(newProfile);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <AdvancedProfileSetup
        onComplete={handleProfileComplete}
        onCancel={() => setIsEditing(false)}
        initialData={profile || {}}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Personalization</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personalized experience and preferences
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          {profile ? 'Edit Profile' : 'Complete Profile'}
        </Button>
      </div>

      {/* Profile Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Progress</span>
              <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {completionPercentage < 50 
                ? "Complete your profile to unlock highly personalized insights and remedies."
                : completionPercentage < 80
                ? "Great progress! Complete more sections for even better personalization."
                : "Excellent! Your profile is well-completed for optimal personalization."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="spiritual">Spiritual</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Personality Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.mbtiType && (
                      <div className="flex justify-between">
                        <span className="text-sm">MBTI:</span>
                        <Badge variant="secondary">{profile.mbtiType}</Badge>
                      </div>
                    )}
                    {profile.enneagramType && (
                      <div className="flex justify-between">
                        <span className="text-sm">Enneagram:</span>
                        <Badge variant="secondary">Type {profile.enneagramType}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Lifestyle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.lifestyle.sleepSchedule && (
                      <div className="flex justify-between">
                        <span className="text-sm">Sleep:</span>
                        <span className="text-sm font-medium">{profile.lifestyle.sleepSchedule}</span>
                      </div>
                    )}
                    {profile.lifestyle.exercise && (
                      <div className="flex justify-between">
                        <span className="text-sm">Exercise:</span>
                        <span className="text-sm font-medium">{profile.lifestyle.exercise}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Spiritual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {profile.spiritualBeliefs.religion && (
                      <div className="flex justify-between">
                        <span className="text-sm">Religion:</span>
                        <span className="text-sm font-medium">{profile.spiritualBeliefs.religion}</span>
                      </div>
                    )}
                    {profile.spiritualBeliefs.meditationFrequency && (
                      <div className="flex justify-between">
                        <span className="text-sm">Meditation:</span>
                        <span className="text-sm font-medium">{profile.spiritualBeliefs.meditationFrequency}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personality Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">MBTI Type</h4>
                    {profile.mbtiType ? (
                      <Badge variant="outline" className="text-lg px-4 py-2">{profile.mbtiType}</Badge>
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Enneagram Type</h4>
                    {profile.enneagramType ? (
                      <Badge variant="outline" className="text-lg px-4 py-2">Type {profile.enneagramType}</Badge>
                    ) : (
                      <p className="text-muted-foreground">Not specified</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Big Five Personality Traits</h4>
                  <div className="space-y-3">
                    {Object.entries(profile.bigFiveTraits).map(([trait, value]) => (
                      <div key={trait} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{trait}</span>
                          <span className="font-medium">{value}%</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle & Habits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.lifestyle).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      {value ? (
                        <p className="text-sm">{value}</p>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not specified</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spiritual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Beliefs & Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.spiritualBeliefs).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      {Array.isArray(value) ? (
                        value.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {value.map((item, index) => (
                              <Badge key={index} variant="secondary">{item}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">None selected</p>
                        )
                      ) : value ? (
                        <p className="text-sm">{value}</p>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not specified</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Life Goals & Aspirations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Short-term Goals</h4>
                    {profile.lifeGoals.shortTerm.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.lifeGoals.shortTerm.map((goal, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No short-term goals set</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Long-term Goals</h4>
                    {profile.lifeGoals.longTerm.length > 0 ? (
                      <ul className="space-y-1">
                        {profile.lifeGoals.longTerm.map((goal, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No long-term goals set</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profile.lifeGoals).filter(([key]) => !['shortTerm', 'longTerm'].includes(key)).map(([key, value]) => (
                      <div key={key}>
                        <h4 className="font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        {value ? (
                          <p className="text-sm">{value}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm">Not specified</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferences & Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.preferences).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="font-medium mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                      {Array.isArray(value) && value.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((item, index) => (
                            <Badge key={index} variant="outline">{item}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">None selected</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!profile && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Complete Your Advanced Profile</h3>
            <p className="text-muted-foreground mb-4">
              Set up your advanced personalization profile to receive highly tailored insights, 
              remedies, and predictions based on your unique characteristics.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Start Profile Setup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 