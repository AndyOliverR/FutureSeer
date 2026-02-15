"use client";

import React, { useState, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { AdvancedUserProfile } from '@/lib/advancedPersonalization';

/** Form state shape used by this component (nested objects for wizard steps). Submitted profile is cast to AdvancedUserProfile for API. */
export interface AdvancedProfileFormState extends Omit<Partial<AdvancedUserProfile>, 'spiritualBeliefs'> {
  lifestyle?: { sleepSchedule: string; diet: string; exercise: string; stressLevel: string; workLifeBalance: string };
  spiritualBeliefs?: { religion: string; spiritualPractices: string[]; meditationFrequency: string; beliefInDestiny: string; opennessToMystical: string };
  lifeGoals?: { shortTerm: string[]; longTerm: string[]; career: string; relationships: string; personalGrowth: string };
  currentContext?: { lifePhase: string; majorChanges: string[]; challenges: string[]; achievements: string[]; relationships: { romantic: string; family: string; friends: string; work: string } };
  preferences?: { colors: string[]; numbers: string[]; elements: string[]; activities: string[]; environments: string[] };
  healthProfile?: { physicalHealth: string; mentalHealth: string; energyLevels: string; stressTriggers: string[]; copingMechanisms: string[] };
}

interface AdvancedProfileSetupProps {
  onComplete?: (profile: AdvancedUserProfile) => void;
  onCancel?: () => void;
  initialData?: Partial<AdvancedProfileFormState>;
}

export default function AdvancedProfileSetup({ 
  onComplete, 
  onCancel, 
  initialData = {} 
}: AdvancedProfileSetupProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profile, setProfile] = useState<AdvancedProfileFormState>({
    // Personality & Psychology
    mbtiType: initialData.mbtiType || '',
    enneagramType: initialData.enneagramType || '',
    bigFiveTraits: initialData.bigFiveTraits || {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50
    },
    
    // Lifestyle & Habits
    lifestyle: initialData.lifestyle || {
      sleepSchedule: '',
      diet: '',
      exercise: '',
      stressLevel: '',
      workLifeBalance: ''
    },
    
    // Spiritual & Beliefs
    spiritualBeliefs: initialData.spiritualBeliefs || {
      religion: '',
      spiritualPractices: [],
      meditationFrequency: '',
      beliefInDestiny: '',
      opennessToMystical: ''
    },
    
    // Goals & Aspirations
    lifeGoals: initialData.lifeGoals || {
      shortTerm: [],
      longTerm: [],
      career: '',
      relationships: '',
      personalGrowth: ''
    },
    
    // Current Life Context
    currentContext: initialData.currentContext || {
      lifePhase: '',
      majorChanges: [],
      challenges: [],
      achievements: [],
      relationships: {
        romantic: '',
        family: '',
        friends: '',
        work: ''
      }
    },
    
    // Preferences & Interests
    preferences: initialData.preferences || {
      colors: [],
      numbers: [],
      elements: [],
      activities: [],
      environments: []
    },
    
    // Health & Wellness
    healthProfile: initialData.healthProfile || {
      physicalHealth: '',
      mentalHealth: '',
      energyLevels: '',
      stressTriggers: [],
      copingMechanisms: []
    }
  });

  const totalSteps = 8;

  useEffect(() => {
    setProgress((currentStep / totalSteps) * 100);
  }, [currentStep]);

  const updateProfile = (section: keyof AdvancedProfileFormState, data: Record<string, unknown> | string) => {
    setProfile(prev => {
      const current = prev[section];
      const next = typeof data === 'string'
        ? data
        : (typeof current === 'object' && current !== null && !Array.isArray(current)
          ? { ...current, ...data }
          : data);
      return { ...prev, [section]: next };
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/personalization/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          advancedProfile: profile
        })
      });

      if (response.ok) {
        onComplete?.(profile as unknown as AdvancedUserProfile);
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      devLog.error('Error saving advanced profile:', error, 'AdvancedProfileSetup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personality & Psychology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mbti">MBTI Type</Label>
                  <Select 
                    value={profile.mbtiType} 
                    onValueChange={(value) => updateProfile('mbtiType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your MBTI type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="enneagram">Enneagram Type</Label>
                  <Select 
                    value={profile.enneagramType} 
                    onValueChange={(value) => updateProfile('enneagramType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Enneagram type" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(type => (
                        <SelectItem key={type} value={type.toString()}>Type {type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Big Five Personality Traits</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(profile.bigFiveTraits ?? {}).map(([trait, value]) => (
                    <div key={trait} className="flex items-center justify-between">
                      <span className="capitalize">{trait}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Low</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => updateProfile('bigFiveTraits', {
                            ...profile.bigFiveTraits,
                            [trait]: parseInt(e.target.value)
                          })}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">High</span>
                        <span className="text-sm font-medium w-8">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle & Daily Habits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sleep">Sleep Schedule</Label>
                  <Select 
                    value={profile.lifestyle?.sleepSchedule} 
                    onValueChange={(value) => updateProfile('lifestyle', { sleepSchedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your sleep pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early-bird">Early Bird (6-8 AM)</SelectItem>
                      <SelectItem value="night-owl">Night Owl (10-12 PM)</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                      <SelectItem value="insomniac">Insomniac</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="diet">Diet Preference</Label>
                  <Select 
                    value={profile.lifestyle?.diet} 
                    onValueChange={(value) => updateProfile('lifestyle', { diet: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your diet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="omnivore">Omnivore</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="paleo">Paleo</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="exercise">Exercise Frequency</Label>
                  <Select 
                    value={profile.lifestyle?.exercise} 
                    onValueChange={(value) => updateProfile('lifestyle', { exercise: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="3-4-times-week">3-4 times/week</SelectItem>
                      <SelectItem value="1-2-times-week">1-2 times/week</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stress">Stress Level</Label>
                  <Select 
                    value={profile.lifestyle?.stressLevel} 
                    onValueChange={(value) => updateProfile('lifestyle', { stressLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stress level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="work-life">Work-Life Balance</Label>
                <Textarea
                  placeholder="Describe your work-life balance..."
                  value={profile.lifestyle?.workLifeBalance}
                  onChange={(e) => updateProfile('lifestyle', { workLifeBalance: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Beliefs & Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="religion">Religion/Spirituality</Label>
                  <Select 
                    value={profile.spiritualBeliefs?.religion} 
                    onValueChange={(value) => updateProfile('spiritualBeliefs', { religion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your belief system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hinduism">Hinduism</SelectItem>
                      <SelectItem value="buddhism">Buddhism</SelectItem>
                      <SelectItem value="christianity">Christianity</SelectItem>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="judaism">Judaism</SelectItem>
                      <SelectItem value="sikhism">Sikhism</SelectItem>
                      <SelectItem value="spiritual-not-religious">Spiritual but not religious</SelectItem>
                      <SelectItem value="agnostic">Agnostic</SelectItem>
                      <SelectItem value="atheist">Atheist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="meditation">Meditation Frequency</Label>
                  <Select 
                    value={profile.spiritualBeliefs?.meditationFrequency} 
                    onValueChange={(value) => updateProfile('spiritualBeliefs', { meditationFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meditation frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="rarely">Rarely</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Spiritual Practices</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Yoga', 'Prayer', 'Chanting', 'Crystal Healing', 'Tarot', 'Astrology', 
                    'Energy Healing', 'Shamanic Journeying', 'Reiki', 'Chakra Balancing'].map(practice => (
                    <div key={practice} className="flex items-center space-x-2">
                      <Checkbox
                        id={practice}
                        checked={profile.spiritualBeliefs?.spiritualPractices.includes(practice)}
                        onCheckedChange={(checked) => {
                          const practices = checked 
                            ? [...(profile.spiritualBeliefs?.spiritualPractices ?? []), practice]
                            : profile.spiritualBeliefs?.spiritualPractices.filter(p => p !== practice);
                          updateProfile('spiritualBeliefs', { spiritualPractices: practices });
                        }}
                      />
                      <Label htmlFor={practice} className="text-sm">{practice}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="destiny">Belief in Destiny</Label>
                  <Select 
                    value={profile.spiritualBeliefs?.beliefInDestiny} 
                    onValueChange={(value) => updateProfile('spiritualBeliefs', { beliefInDestiny: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your belief level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">Strong believer</SelectItem>
                      <SelectItem value="moderate">Moderate believer</SelectItem>
                      <SelectItem value="skeptical">Skeptical</SelectItem>
                      <SelectItem value="non-believer">Non-believer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mystical">Openness to Mystical</Label>
                  <Select 
                    value={profile.spiritualBeliefs?.opennessToMystical} 
                    onValueChange={(value) => updateProfile('spiritualBeliefs', { opennessToMystical: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your openness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-open">Very open</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="skeptical">Skeptical</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Life Goals & Aspirations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Short-term Goals (Next 6 months)</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Goal ${index + 1}`}
                      value={profile.lifeGoals?.shortTerm[index] || ''}
                      onChange={(e) => {
                        const goals = [...(profile.lifeGoals?.shortTerm ?? [])];
                        goals[index] = e.target.value;
                        updateProfile('lifeGoals', { shortTerm: goals });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Long-term Goals (Next 5 years)</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Goal ${index + 1}`}
                      value={profile.lifeGoals?.longTerm[index] || ''}
                      onChange={(e) => {
                        const goals = [...(profile.lifeGoals?.longTerm ?? [])];
                        goals[index] = e.target.value;
                        updateProfile('lifeGoals', { longTerm: goals });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="career">Career Aspirations</Label>
                  <Textarea
                    placeholder="Describe your career goals..."
                    value={profile.lifeGoals?.career}
                    onChange={(e) => updateProfile('lifeGoals', { career: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="relationships">Relationship Goals</Label>
                  <Textarea
                    placeholder="Describe your relationship aspirations..."
                    value={profile.lifeGoals?.relationships}
                    onChange={(e) => updateProfile('lifeGoals', { relationships: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="personal-growth">Personal Growth</Label>
                <Textarea
                  placeholder="What areas of personal growth are important to you?"
                  value={profile.lifeGoals?.personalGrowth}
                  onChange={(e) => updateProfile('lifeGoals', { personalGrowth: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Current Life Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="life-phase">Current Life Phase</Label>
                <Select 
                  value={profile.currentContext?.lifePhase} 
                  onValueChange={(value) => updateProfile('currentContext', { lifePhase: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current life phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="early-career">Early Career</SelectItem>
                    <SelectItem value="mid-career">Mid Career</SelectItem>
                    <SelectItem value="late-career">Late Career</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="transition">Life Transition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Major Recent Changes</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Change ${index + 1}`}
                      value={profile.currentContext?.majorChanges[index] || ''}
                      onChange={(e) => {
                        const changes = [...(profile.currentContext?.majorChanges ?? [])];
                        changes[index] = e.target.value;
                        updateProfile('currentContext', { majorChanges: changes });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Current Challenges</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Challenge ${index + 1}`}
                      value={profile.currentContext?.challenges[index] || ''}
                      onChange={(e) => {
                        const challenges = [...(profile.currentContext?.challenges ?? [])];
                        challenges[index] = e.target.value;
                        updateProfile('currentContext', { challenges: challenges });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="romantic">Romantic Relationship</Label>
                  <Select 
                    value={profile.currentContext?.relationships.romantic} 
                    onValueChange={(value) => updateProfile('currentContext', { 
                      relationships: { ...profile.currentContext?.relationships, romantic: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="dating">Dating</SelectItem>
                      <SelectItem value="committed">Committed</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="complicated">It's complicated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="family">Family Situation</Label>
                  <Select 
                    value={profile.currentContext?.relationships.family} 
                    onValueChange={(value) => updateProfile('currentContext', { 
                      relationships: { ...profile.currentContext?.relationships, family: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="close">Close family</SelectItem>
                      <SelectItem value="distant">Distant family</SelectItem>
                      <SelectItem value="strained">Strained relationships</SelectItem>
                      <SelectItem value="no-family">No family contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Favorite Colors</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 
                    'White', 'Gold', 'Silver', 'Brown'].map(color => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={color}
                        checked={profile.preferences?.colors.includes(color)}
                        onCheckedChange={(checked) => {
                          const colors = checked 
                            ? [...(profile.preferences?.colors ?? []), color]
                            : profile.preferences?.colors.filter(c => c !== color);
                          updateProfile('preferences', { colors });
                        }}
                      />
                      <Label htmlFor={color} className="text-sm">{color}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Lucky Numbers</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].map(number => (
                    <div key={number} className="flex items-center space-x-2">
                      <Checkbox
                        id={`num-${number}`}
                        checked={profile.preferences?.numbers?.includes(String(number))}
                        onCheckedChange={(checked) => {
                          const numbers = checked 
                            ? [...(profile.preferences?.numbers ?? []), String(number)]
                            : (profile.preferences?.numbers ?? []).filter(n => n !== String(number));
                          updateProfile('preferences', { numbers });
                        }}
                      />
                      <Label htmlFor={`num-${number}`} className="text-sm">{number}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Elements</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {['Fire', 'Earth', 'Air', 'Water', 'Metal', 'Wood'].map(element => (
                    <div key={element} className="flex items-center space-x-2">
                      <Checkbox
                        id={element}
                        checked={profile.preferences?.elements.includes(element)}
                        onCheckedChange={(checked) => {
                          const elements = checked 
                            ? [...(profile.preferences?.elements ?? []), element]
                            : profile.preferences?.elements.filter(e => e !== element);
                          updateProfile('preferences', { elements });
                        }}
                      />
                      <Label htmlFor={element} className="text-sm">{element}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Favorite Activities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['Reading', 'Writing', 'Music', 'Art', 'Sports', 'Cooking', 'Travel', 
                    'Meditation', 'Nature', 'Technology', 'Socializing', 'Solitude'].map(activity => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={profile.preferences?.activities.includes(activity)}
                        onCheckedChange={(checked) => {
                          const activities = checked 
                            ? [...(profile.preferences?.activities ?? []), activity]
                            : profile.preferences?.activities.filter(a => a !== activity);
                          updateProfile('preferences', { activities });
                        }}
                      />
                      <Label htmlFor={activity} className="text-sm">{activity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Health & Wellness Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="physical-health">Physical Health</Label>
                  <Select 
                    value={profile.healthProfile?.physicalHealth} 
                    onValueChange={(value) => updateProfile('healthProfile', { physicalHealth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mental-health">Mental Health</Label>
                  <Select 
                    value={profile.healthProfile?.mentalHealth} 
                    onValueChange={(value) => updateProfile('healthProfile', { mentalHealth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mental health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="energy">Energy Levels</Label>
                  <Select 
                    value={profile.healthProfile?.energyLevels} 
                    onValueChange={(value) => updateProfile('healthProfile', { energyLevels: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="fluctuating">Fluctuating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Stress Triggers</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Stress trigger ${index + 1}`}
                      value={profile.healthProfile?.stressTriggers[index] || ''}
                      onChange={(e) => {
                        const triggers = [...(profile.healthProfile?.stressTriggers ?? [])];
                        triggers[index] = e.target.value;
                        updateProfile('healthProfile', { stressTriggers: triggers });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Coping Mechanisms</Label>
                <div className="space-y-2 mt-2">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      placeholder={`Coping mechanism ${index + 1}`}
                      value={profile.healthProfile?.copingMechanisms[index] || ''}
                      onChange={(e) => {
                        const mechanisms = [...(profile.healthProfile?.copingMechanisms ?? [])];
                        mechanisms[index] = e.target.value;
                        updateProfile('healthProfile', { copingMechanisms: mechanisms });
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 8:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Review & Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Profile Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>MBTI:</strong> {profile.mbtiType || 'Not specified'}</p>
                      <p><strong>Enneagram:</strong> {profile.enneagramType || 'Not specified'}</p>
                      <p><strong>Religion:</strong> {profile.spiritualBeliefs?.religion || 'Not specified'}</p>
                      <p><strong>Life Phase:</strong> {profile.currentContext?.lifePhase || 'Not specified'}</p>
                    </div>
                    <div>
                      <p><strong>Sleep:</strong> {profile.lifestyle?.sleepSchedule || 'Not specified'}</p>
                      <p><strong>Exercise:</strong> {profile.lifestyle?.exercise || 'Not specified'}</p>
                      <p><strong>Stress Level:</strong> {profile.lifestyle?.stressLevel || 'Not specified'}</p>
                      <p><strong>Physical Health:</strong> {profile.healthProfile?.physicalHealth || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Selected Preferences</h3>
                  <div className="space-y-2">
                    {(profile.preferences?.colors?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-sm font-medium">Colors: </span>
                        {profile.preferences?.colors.map(color => (
                          <Badge key={color} variant="secondary" className="mr-1">{color}</Badge>
                        ))}
                      </div>
                    )}
                    {(profile.preferences?.numbers?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-sm font-medium">Numbers: </span>
                        {profile.preferences?.numbers.map(number => (
                          <Badge key={number} variant="secondary" className="mr-1">{number}</Badge>
                        ))}
                      </div>
                    )}
                    {(profile.preferences?.elements?.length ?? 0) > 0 && (
                      <div>
                        <span className="text-sm font-medium">Elements: </span>
                        {profile.preferences?.elements.map(element => (
                          <Badge key={element} variant="secondary" className="mr-1">{element}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This advanced profile will be used to generate highly personalized remedies, 
                    predictions, and insights tailored specifically to your unique characteristics, 
                    preferences, and life circumstances.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Advanced Profile Setup</h1>
        <p className="text-muted-foreground mb-4">
          Step {currentStep} of {totalSteps} - Let's create your personalized experience
        </p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
      </div>

      {renderStep()}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="space-x-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 