/**
 * Groq-backed admin social copy generator (Phase B — copy only, no publish).
 */

import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { getSocialPostTemplate } from '@/lib/growth/socialPostTemplates';
import {
  buildSocialPostPromptMessages,
  parseGeneratedSocialPostCopy,
  type GeneratedSocialPostCopy,
  type SocialPostCopyInput,
} from '@/lib/growth/socialPostCopyHelpers';

export type { GeneratedSocialPostCopy, SocialPostCopyInput } from '@/lib/growth/socialPostCopyHelpers';
export {
  buildAdminOptionalContext,
  buildSocialPostPromptMessages,
  parseGeneratedSocialPostCopy,
} from '@/lib/growth/socialPostCopyHelpers';

export const ADMIN_SOCIAL_POST_MODEL = 'llama-3.3-70b-versatile';

const OUTPUT_SCHEMA = {
  requiredKeys: ['primary', 'cta'] as string[],
};

export async function generateSocialPostCopy(
  input: SocialPostCopyInput,
  adminUserId: string,
): Promise<{ ok: true; copy: GeneratedSocialPostCopy } | { ok: false; error: string }> {
  const template = getSocialPostTemplate(input.templateId);
  if (!template) {
    return { ok: false, error: 'Unknown template' };
  }

  const { system, user, guardText } = buildSocialPostPromptMessages(template, input);

  const structured = await callStructuredAI({
    label: 'admin-social-post-copy',
    model: ADMIN_SOCIAL_POST_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.75,
    maxTokens: 1200,
    maxAttempts: 2,
    schema: OUTPUT_SCHEMA,
    responseFormat: { type: 'json_object' },
    jsonObjectMode: true,
    guardUserText: guardText.trim() ? guardText : undefined,
    userId: adminUserId,
  });

  if (!structured.ok || !structured.data) {
    const reason =
      structured.failureMode === 'prompt_injection'
        ? 'Input blocked by safety filter. Rephrase optional fields.'
        : structured.failureMode === 'circuit_open'
          ? 'AI service temporarily unavailable. Try again shortly.'
          : 'Could not generate copy. Try again or simplify optional fields.';
    return { ok: false, error: reason };
  }

  const copy = parseGeneratedSocialPostCopy(structured.data, template.id, template.channel);
  if (!copy.primary || !copy.cta) {
    return { ok: false, error: 'Generated copy was incomplete. Try again.' };
  }

  return { ok: true, copy };
}
