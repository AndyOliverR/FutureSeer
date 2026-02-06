"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Star, Heart, Bookmark, Share2 } from 'lucide-react';
import { ComprehensiveRemedy } from '@/lib/comprehensiveRemedyDatabase';

interface PersonalizedRemedyCardProps {
  remedy: ComprehensiveRemedy;
  personalizationFactors: {
    personalityMatch: number;
    lifestyleAlignment: number;
    contextRelevance: number;
    preferenceMatch: number;
  };
  userContext?: {
    mood: string;
    timeOfDay: string;
    season: string;
    currentChallenges: string[];
  };
  onSave?: (remedy: ComprehensiveRemedy) => void;
  onShare?: (remedy: ComprehensiveRemedy) => void;
  onApply?: (remedy: ComprehensiveRemedy) => void;
}

export default function PersonalizedRemedyCard({
  remedy,
  personalizationFactors,
  userContext,
  onSave,
  onShare,
  onApply
}: PersonalizedRemedyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const overallScore = Math.round(
    (personalizationFactors.personalityMatch + 
     personalizationFactors.lifestyleAlignment + 
     personalizationFactors.contextRelevance + 
     personalizationFactors.preferenceMatch) / 4
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(remedy);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    onShare?.(remedy);
  };

  const handleApply = () => {
    onApply?.(remedy);
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{remedy.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {remedy.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{overallScore}% Match</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getScoreColor(overallScore)}`}
              >
                {getScoreLabel(overallScore)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
              aria-label={isLiked ? 'Unlike remedy' : 'Like remedy'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={isSaved ? 'text-blue-500' : ''}
              aria-label={isSaved ? 'Unsave remedy' : 'Save remedy'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              aria-label="Share remedy"
            >
              <Share2 className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Personalization Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Personality</div>
            <div className={`font-semibold ${getScoreColor(personalizationFactors.personalityMatch)}`}>
              {personalizationFactors.personalityMatch}%
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Lifestyle</div>
            <div className={`font-semibold ${getScoreColor(personalizationFactors.lifestyleAlignment)}`}>
              {personalizationFactors.lifestyleAlignment}%
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Context</div>
            <div className={`font-semibold ${getScoreColor(personalizationFactors.contextRelevance)}`}>
              {personalizationFactors.contextRelevance}%
            </div>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <div className="text-xs text-muted-foreground">Preferences</div>
            <div className={`font-semibold ${getScoreColor(personalizationFactors.preferenceMatch)}`}>
              {personalizationFactors.preferenceMatch}%
            </div>
          </div>
        </div>

        {/* Remedy Description */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {remedy.description}
          </p>
        </div>

        {/* User Context */}
        {userContext && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Why This Matches Your Current Situation:</h4>
            <div className="text-xs space-y-1">
              <p><strong>Mood:</strong> {userContext.mood}</p>
              <p><strong>Time:</strong> {userContext.timeOfDay}</p>
              <p><strong>Season:</strong> {userContext.season}</p>
              {userContext.currentChallenges.length > 0 && (
                <p><strong>Challenges:</strong> {userContext.currentChallenges.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Remedy Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium">View Details</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            
            {/* Instructions */}
            {remedy.instructions && (
              <div>
                <h5 className="font-medium text-sm mb-2">How to Apply:</h5>
                <div className="text-sm space-y-2">
                  {Array.isArray(remedy.instructions) ? (
                    remedy.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span>{instruction}</span>
                      </div>
                    ))
                  ) : (
                    <p>{remedy.instructions}</p>
                  )}
                </div>
              </div>
            )}

            {/* Duration */}
            {remedy.duration && (
              <div>
                <h5 className="font-medium text-sm mb-1">Duration:</h5>
                <p className="text-sm text-muted-foreground">{remedy.duration}</p>
              </div>
            )}

            {/* Frequency */}
            {remedy.frequency && (
              <div>
                <h5 className="font-medium text-sm mb-1">Frequency:</h5>
                <p className="text-sm text-muted-foreground">{remedy.frequency}</p>
              </div>
            )}

            {/* Benefits */}
            {remedy.benefits && (
              <div>
                <h5 className="font-medium text-sm mb-2">Expected Benefits:</h5>
                <div className="space-y-1">
                  {Array.isArray(remedy.benefits) ? (
                    remedy.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">{remedy.benefits}</p>
                  )}
                </div>
              </div>
            )}

            {/* Precautions */}
            {remedy.precautions && (
              <div>
                <h5 className="font-medium text-sm mb-2">Precautions:</h5>
                <div className="space-y-1">
                  {Array.isArray(remedy.precautions) ? (
                    remedy.precautions!.map((precaution: string, index: number) => (
                      <div key={index} className="flex gap-2 text-sm">
                        <span className="text-orange-500">⚠</span>
                        <span>{precaution}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm">{remedy.precautions}</p>
                  )}
                </div>
              </div>
            )}

            {/* Related Systems */}
            {remedy.relatedSystems && remedy.relatedSystems.length > 0 && (
              <div>
                <h5 className="font-medium text-sm mb-2">Related Systems:</h5>
                <div className="flex flex-wrap gap-1">
                  {remedy.relatedSystems!.map((system: string) => (
                    <Badge key={system} variant="outline" className="text-xs">
                      {system}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleApply}
            className="flex-1"
            size="sm"
          >
            Apply This Remedy
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            size="sm"
          >
            {isSaved ? 'Saved' : 'Save for Later'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 