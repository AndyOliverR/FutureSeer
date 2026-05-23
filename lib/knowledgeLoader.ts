import fs from 'fs';
import path from 'path';
import { allocateTokenBudget, APPROX_CHARS_PER_TOKEN } from '@/lib/aiTokenBudget';

export interface KnowledgeResult {
  tool: string;
  topic: string;
  filePath: string;
  content: string;
  relevanceScore: number;
}

const KNOWLEDGE_ROOT = path.join(process.cwd(), 'knowledge');
const MAX_CONTEXT_TOKENS = 2000;
const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * APPROX_CHARS_PER_TOKEN;

const fileCache = new Map<string, string>();
const indexCache: { entries: KnowledgeIndexEntry[] | null } = { entries: null };

interface KnowledgeIndexEntry {
  tool: string;
  topic: string;
  filePath: string;
  keywords: string[];
}

function resolveKnowledgePath(tool: string, topic: string): string {
  return path.join(KNOWLEDGE_ROOT, tool, `${topic}.md`);
}

function readFileWithCache(filePath: string): string | null {
  if (fileCache.has(filePath)) return fileCache.get(filePath)!;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(filePath, 'utf-8');
    fileCache.set(filePath, content);
    return content;
  } catch {
    return null;
  }
}

function buildIndex(): KnowledgeIndexEntry[] {
  if (indexCache.entries) return indexCache.entries;

  const entries: KnowledgeIndexEntry[] = [];

  function walkDir(dir: string, toolPath: string[] = []) {
    let items: fs.Dirent[];
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      if (item.isDirectory()) {
        walkDir(path.join(dir, item.name), [...toolPath, item.name]);
      } else if (item.name.endsWith('.md') && item.name !== 'README.md') {
        const filePath = path.join(dir, item.name);
        const topic = item.name.replace(/\.md$/, '');
        const tool = toolPath.join('/');
        const content = readFileWithCache(filePath);
        const keywords = extractKeywords(content || '', topic, tool);
        entries.push({ tool, topic, filePath, keywords });
      }
    }
  }

  walkDir(KNOWLEDGE_ROOT);
  indexCache.entries = entries;
  return entries;
}

function extractKeywords(content: string, topic: string, tool: string): string[] {
  const words = new Set<string>();

  for (const part of topic.split('-')) {
    if (part.length > 2) words.add(part.toLowerCase());
  }
  for (const part of tool.split('/')) {
    if (part.length > 2) words.add(part.toLowerCase());
  }

  const headings = content.match(/^#{1,3}\s+(.+)$/gm) || [];
  for (const h of headings) {
    const text = h.replace(/^#+\s+/, '').toLowerCase();
    for (const word of text.split(/\s+/)) {
      if (word.length > 3) words.add(word.replace(/[^a-z0-9]/g, ''));
    }
  }

  return [...words].filter(Boolean);
}

function scoreRelevance(entry: KnowledgeIndexEntry, queryTerms: string[]): number {
  let score = 0;
  const lowerTool = entry.tool.toLowerCase();
  const lowerTopic = entry.topic.toLowerCase();

  for (const term of queryTerms) {
    const t = term.toLowerCase();
    if (lowerTool.includes(t)) score += 3;
    if (lowerTopic.includes(t)) score += 5;
    for (const kw of entry.keywords) {
      if (kw.includes(t) || t.includes(kw)) score += 2;
    }
  }

  return score;
}

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Load a specific knowledge file by tool path and topic.
 * Example: loadKnowledge('astrology/vedic', 'nakshatras-advanced')
 */
export function loadKnowledge(tool: string, topic: string): string | null {
  const filePath = resolveKnowledgePath(tool, topic);
  return readFileWithCache(filePath);
}

/**
 * Search knowledge files by query string, optionally restricted to specific tools.
 * Returns results sorted by relevance, with content truncated to fit token limits.
 */
export function searchKnowledge(
  query: string,
  tools?: string[],
): KnowledgeResult[] {
  const index = buildIndex();
  const queryTerms = tokenizeQuery(query);
  if (queryTerms.length === 0) return [];

  let candidates = index;
  if (tools && tools.length > 0) {
    const lowerTools = tools.map((t) => t.toLowerCase());
    candidates = index.filter((e) =>
      lowerTools.some((lt) => e.tool.toLowerCase().includes(lt)),
    );
  }

  const scored = candidates
    .map((entry) => ({
      entry,
      score: scoreRelevance(entry, queryTerms),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const chunks = scored
    .map(({ entry, score }, index) => {
      const content = readFileWithCache(entry.filePath);
      if (!content) return null;
      return {
        id: `${entry.tool}/${entry.topic}`,
        priority: index,
        text: content,
        entry,
        score,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const allocated = allocateTokenBudget(
    chunks.map((c) => ({ id: c.id, priority: c.priority, text: c.text })),
    MAX_CONTEXT_TOKENS,
  );

  const byId = new Map(chunks.map((c) => [c.id, c]));
  const results: KnowledgeResult[] = [];

  for (const { id, text, truncated } of allocated.chunks) {
    const chunk = byId.get(id);
    if (!chunk) continue;
    results.push({
      tool: chunk.entry.tool,
      topic: chunk.entry.topic,
      filePath: chunk.entry.filePath,
      content: truncated ? text : chunk.text,
      relevanceScore: chunk.score,
    });
  }

  return results;
}

/**
 * Get all knowledge file topics for a specific tool.
 * Example: getToolKnowledge('tarot') returns ['major-arcana-esoteric', 'court-card-mastery', ...]
 */
export function getToolKnowledge(tool: string): string[] {
  const index = buildIndex();
  return index
    .filter((e) => e.tool.toLowerCase().includes(tool.toLowerCase()))
    .map((e) => e.topic);
}

/**
 * Format knowledge results for injection into a system prompt.
 * Returns a single string block suitable for appending to the prompt.
 */
export function formatKnowledgeForPrompt(results: KnowledgeResult[]): string {
  if (results.length === 0) return '';

  const sections = results.map(
    (r) => `### ${r.topic.replace(/-/g, ' ')} (${r.tool})\n\n${r.content}`,
  );

  return `\n\n## Reference Material\n\nThe following reference material is provided to ground your interpretation in traditional sources. Use it to enrich your response where relevant.\n\n${sections.join('\n\n---\n\n')}`;
}

/**
 * Extract key topics from a user question for knowledge base search.
 * Uses simple NLP: removes stop words, extracts noun-like terms.
 */
export function extractKeyTopics(question: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'must', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'what',
    'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'it',
    'its', 'my', 'your', 'his', 'her', 'our', 'their', 'me', 'him', 'us',
    'them', 'i', 'you', 'he', 'she', 'we', 'they', 'tell', 'know', 'mean',
    'please', 'thanks', 'thank', 'help', 'explain', 'describe',
  ]);

  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}
