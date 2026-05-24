/**
 * Groq-backed admin newspaper / outreach article generator (copy-only).
 */

import { callStructuredAI } from '@/lib/aiStructuredOutput';
import { getNewspaperOutlet } from '@/lib/growth/newspaperOutlets';
import {
  buildNewspaperArticlePromptMessages,
  parseGeneratedNewspaperArticleCopy,
  type GeneratedNewspaperArticleCopy,
  type NewspaperArticleCopyInput,
} from '@/lib/growth/newspaperArticleCopyHelpers';

export type { GeneratedNewspaperArticleCopy, NewspaperArticleCopyInput } from '@/lib/growth/newspaperArticleCopyHelpers';
export {
  buildNewspaperArticlePromptMessages,
  buildNewspaperOptionalContext,
  parseGeneratedNewspaperArticleCopy,
} from '@/lib/growth/newspaperArticleCopyHelpers';

export const ADMIN_NEWSPAPER_ARTICLE_MODEL = 'llama-3.3-70b-versatile';

const OUTPUT_SCHEMA = {
  requiredKeys: ['headline', 'body'] as string[],
};

export async function generateNewspaperArticleCopy(
  input: NewspaperArticleCopyInput,
  adminUserId: string,
): Promise<{ ok: true; copy: GeneratedNewspaperArticleCopy } | { ok: false; error: string }> {
  const outlet = getNewspaperOutlet(input.outletId);
  if (!outlet) {
    return { ok: false, error: 'Unknown outlet' };
  }

  const { system, user, guardText } = buildNewspaperArticlePromptMessages(outlet, input);

  const structured = await callStructuredAI({
    label: 'admin-newspaper-article-copy',
    model: ADMIN_NEWSPAPER_ARTICLE_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
    maxTokens: 2200,
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
          : 'Could not generate article. Try again or simplify optional fields.';
    return { ok: false, error: reason };
  }

  const copy = parseGeneratedNewspaperArticleCopy(structured.data, outlet.id);
  if (!copy.headline || !copy.body) {
    return { ok: false, error: 'Generated article was incomplete. Try again.' };
  }

  return { ok: true, copy };
}
