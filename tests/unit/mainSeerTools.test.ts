import { getDocument } from '@/lib/firebase-admin';
import { executeMainSeerTool, isMainSeerToolName, MAIN_SEER_TOOL_NAMES } from '@/lib/mainSeerTools';

jest.mock('@/lib/firebase-admin', () => ({
  getDocument: jest.fn(),
}));

const mockGetDocument = getDocument as jest.MockedFunction<typeof getDocument>;

describe('mainSeerTools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes four read-only tool names', () => {
    expect(MAIN_SEER_TOOL_NAMES).toEqual([
      'list_ready_tools',
      'get_seer_master_summary',
      'get_tool_report',
      'search_occult_knowledge',
    ]);
    expect(isMainSeerToolName('get_tool_report')).toBe(true);
    expect(isMainSeerToolName('delete_user')).toBe(false);
  });

  it('list_ready_tools returns ready slugs from comprehensive profile', async () => {
    mockGetDocument.mockResolvedValue({
      vedic: { generationIdempotencyKey: 'h1', planets: [{ name: 'Sun' }] },
      tarot: { placeholder: true },
    });

    const result = await executeMainSeerTool('list_ready_tools', {}, 'user-1');
    expect(result.readyTools).toContain('vedic');
    expect(result.pendingToolSlugs).toContain('tarot');
    expect(result.readyCount).toBeGreaterThanOrEqual(1);
  });

  it('get_tool_report reads nested toolReports data', async () => {
    mockGetDocument.mockResolvedValue({
      toolReports: {
        western: {
          data: { sunSign: 'Leo', generationIdempotencyKey: 'h1' },
        },
      },
    });

    const result = await executeMainSeerTool('get_tool_report', { toolSlug: 'western' }, 'user-1');
    expect(result.found).toBe(true);
    expect(result.toolSlug).toBe('western');
    expect(String(result.report)).toContain('Leo');
  });

  it('get_tool_report rejects invalid slug', async () => {
    const result = await executeMainSeerTool('get_tool_report', { toolSlug: 'not-a-real-tool' }, 'user-1');
    expect(result.error).toMatch(/Invalid or missing toolSlug/);
  });

  it('search_occult_knowledge returns reference matches', async () => {
    const result = await executeMainSeerTool(
      'search_occult_knowledge',
      { query: 'vedic moon sign nakshatra' },
      'user-1',
    );
    expect(result.query).toBe('vedic moon sign nakshatra');
    expect(typeof result.matchCount).toBe('number');
  });
});
