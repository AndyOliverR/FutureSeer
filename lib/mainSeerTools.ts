import 'server-only';

import { getDocument } from '@/lib/firebase-admin';
import { searchKnowledge, formatKnowledgeForPrompt } from '@/lib/knowledgeLoader';
import {
  ALL_TOOL_SLUGS,
  isCurrentReadyToolReport,
  isReadyToolReport,
} from '@/lib/profileGenerationOrchestrator';
import { truncateToTokenBudget } from '@/lib/aiTokenBudget';

export const MAIN_SEER_TOOL_NAMES = [
  'list_ready_tools',
  'get_seer_master_summary',
  'get_tool_report',
  'search_occult_knowledge',
] as const;

export type MainSeerToolName = (typeof MAIN_SEER_TOOL_NAMES)[number];

const REPORT_MAX_CHARS = 6_000;
const SEER_MASTER_MAX_CHARS = 4_000;
const KNOWLEDGE_MAX_CHARS = 4_000;

export const MAIN_SEER_TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'list_ready_tools',
      description:
        'List divination tool slugs whose stored reports are ready for this user. Call before fetching individual reports.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_seer_master_summary',
      description:
        'Fetch the compact cross-tool Seer Master summary (identity, purpose, career, relationships, timing, remedies).',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_tool_report',
      description:
        'Fetch one stored tool report for the user. Use a slug from list_ready_tools (e.g. vedic, tarot, western).',
      parameters: {
        type: 'object',
        properties: {
          toolSlug: {
            type: 'string',
            description: 'Tool slug from list_ready_tools',
          },
        },
        required: ['toolSlug'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_occult_knowledge',
      description:
        'Search the occult knowledge base for reference material relevant to the user question.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query derived from the user question' },
          domains: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional knowledge domains (e.g. tarot, astrology/vedic)',
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
    },
  },
];

export function isMainSeerToolName(name: string): name is MainSeerToolName {
  return (MAIN_SEER_TOOL_NAMES as readonly string[]).includes(name);
}

function resolveToolReport(
  profile: Record<string, unknown>,
  toolSlug: string,
  profileHash?: string,
): Record<string, unknown> | null {
  const nested = profile.toolReports as Record<string, { data?: unknown }> | undefined;
  const val = profile[toolSlug] ?? nested?.[toolSlug]?.data;
  if (!val || typeof val !== 'object' || !isCurrentReadyToolReport(val, profileHash, toolSlug)) return null;
  return val as Record<string, unknown>;
}

function profileHashFromStored(profile: Record<string, unknown>): string | undefined {
  return typeof profile.profileDataHash === 'string' ? profile.profileDataHash : undefined;
}

function compactJson(value: unknown, maxChars: number): string {
  const raw = JSON.stringify(value);
  if (raw.length <= maxChars) return raw;
  return `${raw.slice(0, maxChars)}…[truncated]`;
}

export async function executeMainSeerTool(
  toolName: MainSeerToolName,
  args: Record<string, unknown>,
  userId: string,
): Promise<Record<string, unknown>> {
  switch (toolName) {
    case 'list_ready_tools': {
      const profile = ((await getDocument('comprehensiveMysticalProfiles', userId)) ||
        {}) as Record<string, unknown>;
      const profileHash = profileHashFromStored(profile);
      const readyTools = ALL_TOOL_SLUGS.filter(
        (slug) => resolveToolReport(profile, slug, profileHash) != null,
      );
      const pendingToolSlugs = ALL_TOOL_SLUGS.filter((slug) => !readyTools.includes(slug));
      return {
        readyTools,
        readyCount: readyTools.length,
        pendingToolSlugs,
        allReportsReady: pendingToolSlugs.length === 0,
      };
    }
    case 'get_seer_master_summary': {
      const storedProfile = ((await getDocument('comprehensiveMysticalProfiles', userId)) ||
        {}) as Record<string, unknown>;
      const profileHash = profileHashFromStored(storedProfile);
      const hasStaleReadyReport = ALL_TOOL_SLUGS.some((slug) => {
        const nested = storedProfile.toolReports as Record<string, { data?: unknown }> | undefined;
        const val = storedProfile[slug] ?? nested?.[slug]?.data;
        return isReadyToolReport(val, slug) && resolveToolReport(storedProfile, slug, profileHash) == null;
      });
      if (hasStaleReadyReport) {
        return { found: false, message: 'Seer Master summary is stale after a profile change.' };
      }
      const seerMaster = ((await getDocument('seerMaster', userId)) || null) as Record<
        string,
        unknown
      > | null;
      if (!seerMaster) {
        return { found: false, message: 'Seer Master summary not generated yet.' };
      }
      return {
        found: true,
        summary: compactJson(seerMaster, SEER_MASTER_MAX_CHARS),
      };
    }
    case 'get_tool_report': {
      const toolSlug = typeof args.toolSlug === 'string' ? args.toolSlug.trim() : '';
      if (!toolSlug || !ALL_TOOL_SLUGS.includes(toolSlug as (typeof ALL_TOOL_SLUGS)[number])) {
        return { error: 'Invalid or missing toolSlug. Call list_ready_tools first.' };
      }
      const profile = ((await getDocument('comprehensiveMysticalProfiles', userId)) ||
        {}) as Record<string, unknown>;
      const report = resolveToolReport(profile, toolSlug, profileHashFromStored(profile));
      if (!report) {
        return { found: false, toolSlug, message: 'Report not ready or not found.' };
      }
      return {
        found: true,
        toolSlug,
        report: compactJson(report, REPORT_MAX_CHARS),
      };
    }
    case 'search_occult_knowledge': {
      const query = typeof args.query === 'string' ? args.query.trim() : '';
      if (!query) return { error: 'query is required' };
      const domains = Array.isArray(args.domains)
        ? args.domains.filter((d): d is string => typeof d === 'string' && d.trim().length > 0)
        : undefined;
      const results = searchKnowledge(query, domains);
      const formatted = formatKnowledgeForPrompt(results);
      return {
        query,
        matchCount: results.length,
        reference: truncateToTokenBudget(formatted, Math.floor(KNOWLEDGE_MAX_CHARS / 4)),
      };
    }
    default:
      return { error: 'Unknown tool' };
  }
}
