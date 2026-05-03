import {
  extractJsonCandidate,
  parseJsonWithRepairs,
} from '@/lib/westernJsonParser';

describe('western comprehensive parser hardening', () => {
  it('extracts JSON from fenced markdown responses', () => {
    const response = "```json\n{\"chartOverview\":\"ok\"}\n```";
    expect(extractJsonCandidate(response)).toBe('{"chartOverview":"ok"}');
  });

  it('closes truncated arrays/objects and parses successfully', () => {
    const truncated =
      '{"chartOverview":"x","planetaryAnalysis":[{"planet":"Sun","analysis":"a"},{"planet":"Moon","analysis":"b"}';
    const parsed = parseJsonWithRepairs(truncated);
    expect(parsed.chartOverview).toBe('x');
    expect(Array.isArray(parsed.planetaryAnalysis)).toBe(true);
    expect(parsed.planetaryAnalysis).toHaveLength(2);
  });
});
