import { z } from 'zod';

/** Analyst role identifiers (parallel panel). */
export const AnalystRoleSchema = z.enum([
  'natalWealth',
  'marketCycle',
  'mundaneCollective',
  'personalTiming',
]);

export type AnalystRole = z.infer<typeof AnalystRoleSchema>;

export const AnalystReportSchema = z.object({
  role: AnalystRoleSchema,
  summary: z.string().min(1),
  signals: z.array(z.string()).default([]),
  notableTransits: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});

export type AnalystReport = z.infer<typeof AnalystReportSchema>;

export const DebateTurnSchema = z.object({
  side: z.enum(['bull', 'bear']),
  round: z.number().int().min(1),
  citations: z.array(z.string()).default([]),
  argument: z.string().min(1),
});

export type DebateTurn = z.infer<typeof DebateTurnSchema>;

/** Five-tier posture (TradingAgents-style scale, divination-safe labels). */
export const FinancialPostureRatingSchema = z.enum([
  'expand',
  'leanForward',
  'steady',
  'leanDefensive',
  'conserve',
]);

export type FinancialPostureRating = z.infer<typeof FinancialPostureRatingSchema>;

export const FinancialPostureSchema = z.object({
  rating: FinancialPostureRatingSchema,
  executiveSummary: z.string().min(1),
  thesis: z.string().min(1),
  timeHorizonDays: z.number().int().min(1).max(730),
  riskBand: z.enum(['low', 'medium', 'high']),
});

export type FinancialPosture = z.infer<typeof FinancialPostureSchema>;

export const FinancialHistoryEntrySchema = z.object({
  generatedAt: z.string(),
  posture: FinancialPostureRatingSchema,
  executiveSummary: z.string(),
});

export type FinancialHistoryEntry = z.infer<typeof FinancialHistoryEntrySchema>;

export const MultiAgentResultSchema = z.object({
  analystReports: z.array(AnalystReportSchema).length(4),
  debate: z.array(DebateTurnSchema),
  posture: FinancialPostureSchema,
  generatedAt: z.string(),
});

export type MultiAgentResult = z.infer<typeof MultiAgentResultSchema>;

/** Partial result when one analyst fails — orchestrator may still fall back. */
export const PartialMultiAgentSchema = z.object({
  analystReports: z.array(AnalystReportSchema),
  debate: z.array(DebateTurnSchema),
  posture: FinancialPostureSchema.optional(),
  generatedAt: z.string(),
});
