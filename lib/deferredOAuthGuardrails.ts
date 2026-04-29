export async function getClientOAuthGuardrailReportDeferred(): Promise<Record<string, unknown>> {
  try {
    const mod = await import("@/lib/oauthDomainGuardrails");
    return mod.getClientOAuthGuardrailReport() as unknown as Record<string, unknown>;
  } catch {
    return {};
  }
}

