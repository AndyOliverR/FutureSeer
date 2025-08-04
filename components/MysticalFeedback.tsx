'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Star, Send, Sparkles, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ratingOptions = [
  { value: 1, label: 'Poor', color: 'from-red-400 to-red-600', bgColor: 'bg-gradient-to-r from-red-400/20 to-red-600/20', borderColor: 'border-red-400/40', glowColor: 'shadow-red-400/60' },
  { value: 2, label: 'Fair', color: 'from-orange-400 to-orange-600', bgColor: 'bg-gradient-to-r from-orange-400/20 to-orange-600/20', borderColor: 'border-orange-400/40', glowColor: 'shadow-orange-400/60' },
  { value: 3, label: 'Good', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20', borderColor: 'border-yellow-400/40', glowColor: 'shadow-yellow-400/60' },
  { value: 4, label: 'Very Good', color: 'from-blue-400 to-gray-400', bgColor: 'bg-gradient-to-r from-blue-400/20 to-gray-400/20', borderColor: 'border-blue-400/40', glowColor: 'shadow-blue-400/60' },
  { value: 5, label: 'Excellent', color: 'from-amber-400 to-yellow-400', bgColor: 'bg-gradient-to-r from-amber-400/20 to-yellow-400/20', borderColor: 'border-amber-400/40', glowColor: 'shadow-amber-400/60' }
];

export function MysticalFeedback() {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Feedback Icon Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-4 p-3 bg-transparent border border-amber-500/30 text-amber-300 rounded-full hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300 z-50 shadow-lg hover:shadow-xl transform hover:scale-110 button-glow"
        title="Share Feedback"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Animated mystical glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-transparent to-amber-500/8 rounded-2xl animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-amber-500/5 rounded-2xl"></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-12 right-8 w-1 h-1 bg-blue-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-8 left-10 w-1 h-1 bg-amber-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between p-6 border-b border-amber-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-amber-200">✨ Mystical Feedback ✨</h2>
                    <p className="text-sm text-gray-400">Share your cosmic experience with us</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Rating Section */}
                <div className="space-y-4">
                  <label className="text-lg font-medium text-amber-200">
                    ✨ How would you rate your mystical experience? ✨
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRating(option.value)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          rating === option.value
                            ? `${option.bgColor} ${option.borderColor} ${option.glowColor} shadow-lg`
                            : 'bg-slate-900/60 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-blue-400 to-amber-500 rounded-full blur-md opacity-20 scale-125" />
                        <div className="relative z-10">
                          <Star className={`w-8 h-8 mx-auto mb-2 ${
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
                <div className="space-y-4">
                  <label htmlFor="feedback" className="text-lg font-medium text-amber-200">
                    💫 Tell us about your mystical journey (optional) 💫
                  </label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts, experiences, or suggestions for improving FutureSeer's mystical offerings..."
                    className="min-h-[120px] bg-slate-900/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 resize-none"
                    rows={5}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!rating || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span className="text-white">✨</span>
                        Submit Feedback
                        <span className="text-white">✨</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 