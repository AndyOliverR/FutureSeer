/**
 * Newspaper / outreach outlets for admin article generator (copy-only — manual submission).
 */

export type NewspaperOutletId =
  | 'toi-citizen-reporter'
  | 'toi-blog'
  | 'toi-nri-contributor'
  | 'generic-press-pitch'
  | 'guest-post-pitch';

export type NewspaperArticleKind =
  | 'citizen_report'
  | 'op_ed'
  | 'nri_story'
  | 'press_pitch'
  | 'guest_pitch';

export interface NewspaperOutlet {
  id: NewspaperOutletId;
  label: string;
  description: string;
  kind: NewspaperArticleKind;
  /** Typical word count guidance for the model */
  targetWords: string;
  structureHint: string;
  /** Where to submit (opens in new tab from admin) */
  submissionUrl: string;
  submissionLabel: string;
  /** Editorial / paid notes shown to admin after generation */
  submissionNotes: string;
}

export const NEWSPAPER_OUTLETS: NewspaperOutlet[] = [
  {
    id: 'toi-citizen-reporter',
    label: 'Times of India — Citizen Reporter',
    description: 'Short civic or human-interest story (local angle, photo-friendly)',
    kind: 'citizen_report',
    targetWords: '150–350',
    structureHint:
      'Lead with a concrete local or civic hook (technology helping people, digital literacy, community). No hard sell. Factual tone. Mention FutureSeer only as context, not as an ad.',
    submissionUrl: 'https://m.timesofindia.com/citizen-reporter/crstories/curpg-1.cms',
    submissionLabel: 'Open Citizen Reporter',
    submissionNotes:
      'Submit via TOI Citizen Reporter app or web. Editorial team selects stories; not all submissions are published. Avoid promotional language.',
  },
  {
    id: 'toi-blog',
    label: 'Times of India — Blog (self-publish)',
    description: 'Opinion or informational article on AI, spirituality, or cultural tech',
    kind: 'op_ed',
    targetWords: '600–900',
    structureHint:
      'Thoughtful op-ed: hook → 2–3 sections with subheads → balanced conclusion. Explain how AI can support traditional divination literacy without replacing practitioners. Cite general traditions, not medical/financial claims.',
    submissionUrl: 'https://timesofindia.indiatimes.com/blog',
    submissionLabel: 'Open TOI Blog',
    submissionNotes:
      'Create a TOI Blog account to self-publish. Must meet editorial standards; plagiarized or pure promotional posts are rejected.',
  },
  {
    id: 'toi-nri-contributor',
    label: 'Times of India — NRI / diaspora story',
    description: 'Human-interest piece for Indian diaspora readers',
    kind: 'nri_story',
    targetWords: '400–700',
    structureHint:
      'Personal or community narrative connecting Indian heritage, modern life abroad, and thoughtful use of technology. Warm tone; one clear takeaway.',
    submissionUrl: 'https://timesofindia.indiatimes.com',
    submissionLabel: 'TOI home (NRI section)',
    submissionNotes:
      'Pitch via TOI contact or contributor channels. Frame as diaspora culture/tech story, not a product press release.',
  },
  {
    id: 'generic-press-pitch',
    label: 'Generic press pitch (email to editors)',
    description: 'Email-ready pitch for lifestyle / tech / culture desks',
    kind: 'press_pitch',
    targetWords: '250–400',
    structureHint:
      'subject line = email subject. headline = pitch title. primary = 3 short paragraphs (news hook, what FutureSeer is, why now). bullets = 3 fact bullets. notes = suggested outlets / follow-up.',
    submissionUrl: 'https://futureseer.app/about',
    submissionLabel: 'FutureSeer about (for boilerplate)',
    submissionNotes:
      'Email editors directly. No guarantee of coverage. Include founder contact only if admin adds it in optional fields.',
  },
  {
    id: 'guest-post-pitch',
    label: 'Guest post pitch (events / lifestyle)',
    description: 'Short non-promotional guest post proposal',
    kind: 'guest_pitch',
    targetWords: '200–350',
    structureHint:
      'Pitch letter: proposed title, 2-paragraph summary, 3 proposed section headings, why readers benefit. Non-promotional; educational angle on divination literacy or AI ethics.',
    submissionUrl: 'https://timesofindia.indiatimes.com',
    submissionLabel: 'TOI (events / guest guidelines)',
    submissionNotes:
      'Guest posts are accepted occasionally and must be original, non-promotional. TOI Events may have separate guidelines.',
  },
];

export function getNewspaperOutlet(outletId: string): NewspaperOutlet | undefined {
  return NEWSPAPER_OUTLETS.find((o) => o.id === outletId);
}
