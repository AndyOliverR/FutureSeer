"use client";

import { useState } from 'react';
import { devLog } from '@/lib/devLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { GiphyPicker } from '@/components/integrations/GiphyPicker';

interface DiscussionFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    title?: string;
    content?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

const categories = [
  { value: 'astrology', label: 'Astrology' },
  { value: 'tarot', label: 'Tarot' },
  { value: 'numerology', label: 'Numerology' },
  { value: 'palmistry', label: 'Palmistry' },
  { value: 'dream-analysis', label: 'Dream Analysis' },
  { value: 'angel-numbers', label: 'Angel Numbers' },
  { value: 'vedic', label: 'Vedic Astrology' },
  { value: 'western', label: 'Western Astrology' },
  { value: 'kabbalah', label: 'Kabbalah' },
  { value: 'iching', label: 'I Ching' },
  { value: 'runes', label: 'Runes' },
  { value: 'lenormand', label: 'Lenormand' },
  { value: 'geomancy', label: 'Geomancy' },
  { value: 'horary', label: 'Horary Astrology' },
  { value: 'synastry', label: 'Synastry' },
  { value: 'medical', label: 'Medical Astrology' },
  { value: 'financial', label: 'Financial Astrology' },
  { value: 'bazi', label: 'BaZi' },
  { value: 'kp', label: 'KP Astrology' },
  { value: 'vaastu', label: 'Vaastu' },
  { value: 'face-reading', label: 'Face Reading' },
  { value: 'general', label: 'General' },
];

export function DiscussionForm({ onSubmit, onCancel, initialData }: DiscussionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(initialData?.priority || 'medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), category, priority });
      setTitle('');
      setContent('');
      setCategory('general');
      setPriority('medium');
    } catch (error) {
      devLog.error('Error submitting discussion:', error, 'DiscussionForm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-900/95 backdrop-blur-sm border-amber-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-amber-200">
          {initialData ? 'Edit Discussion' : 'Create New Discussion'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" aria-hidden />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion title..."
              className="bg-slate-800/50 border-slate-600 text-gray-300"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <label className="text-sm font-medium text-gray-300 block">
                Content *
              </label>
              <GiphyPicker
                disabled={submitting}
                onInsert={(snippet) => setContent((prev) => `${prev}${snippet}`)}
              />
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or insights..."
              className="bg-slate-800/50 border-slate-600 text-gray-300"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Category *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-gray-300">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Priority
              </label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setPriority(value)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="low" className="text-gray-300">Low</SelectItem>
                  <SelectItem value="medium" className="text-gray-300">Medium</SelectItem>
                  <SelectItem value="high" className="text-gray-300">High</SelectItem>
                  <SelectItem value="critical" className="text-gray-300">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? 'Submitting...' : initialData ? 'Update' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

