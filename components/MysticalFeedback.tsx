'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, Send, Sparkles, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ratingOptions = [
  { value: 1, label: 'Poor', color: 'from-red-400 to-red-600', bgColor: 'bg-gradient-to-r from-red-400/20 to-red-600/20', borderColor: 'border-red-400/40', glowColor: 'shadow-red-400/60' },
  { value: 2, label: 'Fair', color: 'from-orange-400 to-orange-600', bgColor: 'bg-gradient-to-r from-orange-400/20 to-orange-600/20', borderColor: 'border-orange-400/40', glowColor: 'shadow-orange-400/60' },
  { value: 3, label: 'Good', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20', borderColor: 'border-orange-400/40', glowColor: 'shadow-yellow-400/60' },
  { value: 4, label: 'Very Good', color: 'from-blue-400 to-gray-400', bgColor: 'bg-gradient-to-r from-blue-400/20 to-gray-400/20', borderColor: 'border-blue-400/40', glowColor: 'shadow-blue-400/60' },
  { value: 5, label: 'Excellent', color: 'from-amber-400 to-yellow-400', bgColor: 'bg-gradient-to-r from-amber-400/20 to-yellow-400/20', borderColor: 'border-amber-400/40', glowColor: 'shadow-amber-400/60' }
];

export function MysticalFeedback() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "✨ Feedback Submitted! ✨",
        description: "Thank you for sharing your mystical experience with us. Your insights help us grow! 🌟",
      });

      // Reset form
      setRating(null);
      setFeedback('');
      setIsExpanded(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (rating || feedback) {
      if (confirm('Are you sure you want to close? Your feedback will be lost.')) {
        setRating(null);
        setFeedback('');
        setIsExpanded(false);
      }
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div 
      className="fixed pointer-events-auto"
      style={{
        position: 'fixed',
        bottom: '8px',
        left: '48px',
        zIndex: 9999,
        pointerEvents: 'auto',
        transform: 'translateZ(0)'
      }}
    >
      {/* Main Feedback Panel */}
      <div className={`transition-all duration-500 ease-in-out ${
        isExpanded ? 'bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl w-[400px] sm:w-[500px] h-[500px] sm:h-[600px] absolute bottom-12 left-0 z-50' : 'w-14 h-14 sm:w-16 sm:h-16'
      }`}>
        
        {/* Animated mystical glow effect - Only show when expanded */}
        {isExpanded && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-amber-500/8 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl"></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-12 right-8 w-1 h-1 bg-blue-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-8 left-10 w-1 h-1 bg-amber-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </>
        )}

        {/* Collapsed State - Just Icon */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full h-full flex items-center justify-center text-amber-300 hover:text-amber-200 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-blue-500/60"
            title="Open Feedback Panel"
          >
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-300" />
          </button>
        )}

        {/* Expanded State - Full Feedback Form */}
        {isExpanded && (
          <div className="relative h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-amber-500/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-amber-200">✨ Feedback ✨</h3>
                  <p className="text-xs text-gray-400">Share your experience</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-300 p-1.5 sm:p-2"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-300 p-1.5 sm:p-2"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-70px)] sm:h-[calc(100%-80px)] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Rating Section */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium text-amber-200">
                    ✨ Rate your experience ✨
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRating(option.value)}
                        className={`relative p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                          rating === option.value
                            ? `${option.bgColor} ${option.borderColor} ${option.glowColor} shadow-lg`
                            : 'bg-slate-900/60 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-blue-400 to-amber-500 rounded-full blur-md opacity-20 scale-125" />
                        <div className="relative z-10">
                          <Star className={`w-4 h-4 sm:w-5 sm:w-5 mx-auto mb-1 ${
                            rating === option.value 
                              ? 'text-white' 
                              : 'text-gray-400'
                          }`} />
                          <p className={`text-xs font-medium ${
                            rating === option.value 
                              ? 'text-white' 
                              : 'text-gray-300'
                          }`}>
                            {option.label}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="feedback" className="text-xs sm:text-sm font-medium text-amber-200">
                    💫 Share your thoughts (optional) 💫
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about your mystical journey..."
                    className="min-h-[80px] sm:min-h-[100px] bg-slate-900/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-lg backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 resize-none text-xs sm:text-sm"
                    rows={3}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-lg transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!rating || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-xs sm:text-sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Send className="w-2.5 h-3 sm:w-3 sm:h-3" />
                        Submit
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 