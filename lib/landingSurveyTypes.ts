import type { Timestamp } from 'firebase-admin/firestore';

export type LandingSurveyTopic =
  | 'love'
  | 'career'
  | 'money'
  | 'personality'
  | 'timing'
  | 'other';

export type LandingTestimonialStatus = 'pending' | 'approved' | 'rejected';

export type LandingSurveyKind = 'testimonial' | 'hope';

export interface LandingTestimonialDoc {
  kind: LandingSurveyKind;
  rating: number | null;
  experienceText: string;
  topic: LandingSurveyTopic;
  displayName: string;
  roleLabel: string;
  sharePublicly: boolean;
  status: LandingTestimonialStatus;
  submittedAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string;
  userId?: string | null;
  source: 'landing_survey';
}

export interface PublicLandingTestimonial {
  id: string;
  rating: number;
  content: string;
  displayName: string;
  roleLabel: string;
  topic: LandingSurveyTopic;
  approvedAt: number | null;
}

export const LANDING_SURVEY_TOPICS: { id: LandingSurveyTopic; label: string }[] = [
  { id: 'love', label: 'Love & relationships' },
  { id: 'career', label: 'Career' },
  { id: 'money', label: 'Money' },
  { id: 'personality', label: 'Personality & self' },
  { id: 'timing', label: 'Timing & decisions' },
  { id: 'other', label: 'Something else' },
];

export function sanitizeSurveyText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function parseLandingSurveyTopic(value: unknown): LandingSurveyTopic {
  const allowed: LandingSurveyTopic[] = ['love', 'career', 'money', 'personality', 'timing', 'other'];
  return allowed.includes(value as LandingSurveyTopic) ? (value as LandingSurveyTopic) : 'other';
}

export function parseRating(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n;
}
