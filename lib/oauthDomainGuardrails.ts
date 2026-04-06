export type OAuthCheckStatus = "pass" | "warn" | "fail";

export interface OAuthCheckResult {
  id: string;
  status: OAuthCheckStatus;
  summary: string;
  details?: string;
  remediation?: string;
}

export interface OAuthGuardrailReport {
  appHost: string | null;
  firebaseAuthDomain: string | null;
  expectedAuthHandlerUrl: string | null;
  checks: OAuthCheckResult[];
}

function normalizeHost(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (trimmed.includes("://")) return new URL(trimmed).host.toLowerCase();
    return new URL(`https://${trimmed}`).host.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeAppHost(rawAppUrl: string | null | undefined): string | null {
  return normalizeHost(rawAppUrl);
}

function normalizeAuthDomain(rawAuthDomain: string | null | undefined): string | null {
  return normalizeHost(rawAuthDomain);
}

function makeExpectedAuthHandlerUrl(firebaseAuthDomain: string | null): string | null {
  if (!firebaseAuthDomain) return null;
  return `https://${firebaseAuthDomain}/__/auth/handler`;
}

function buildChecks(appHost: string | null, firebaseAuthDomain: string | null): OAuthCheckResult[] {
  const checks: OAuthCheckResult[] = [];

  if (!firebaseAuthDomain) {
    checks.push({
      id: "firebase-auth-domain-present",
      status: "fail",
      summary: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing",
      remediation:
        "Set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in environment variables (firebaseapp.com locally or your verified custom domain in production).",
    });
    return checks;
  }

  checks.push({
    id: "firebase-auth-domain-present",
    status: "pass",
    summary: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is set",
    details: firebaseAuthDomain,
  });

  if (!appHost) {
    checks.push({
      id: "app-host-present",
      status: "warn",
      summary: "NEXT_PUBLIC_APP_URL is missing or invalid",
      remediation:
        "Set NEXT_PUBLIC_APP_URL to your canonical host (for example https://futureseer.app) so auth and SEO diagnostics remain consistent.",
    });
    return checks;
  }

  checks.push({
    id: "app-host-present",
    status: "pass",
    summary: "NEXT_PUBLIC_APP_URL host is readable",
    details: appHost,
  });

  if (appHost === firebaseAuthDomain) {
    checks.push({
      id: "auth-domain-alignment",
      status: "pass",
      summary: "Firebase auth domain matches canonical app host",
    });
  } else if (firebaseAuthDomain.endsWith(".firebaseapp.com")) {
    checks.push({
      id: "auth-domain-alignment",
      status: "warn",
      summary: "Firebase auth domain differs from app host (firebaseapp.com mode)",
      details: `app=${appHost}, auth=${firebaseAuthDomain}`,
      remediation:
        "This can be valid for local development. For production custom-domain auth, align NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN with the canonical app host and keep provider redirect URIs in sync.",
    });
  } else {
    checks.push({
      id: "auth-domain-alignment",
      status: "warn",
      summary: "Firebase auth domain differs from canonical app host",
      details: `app=${appHost}, auth=${firebaseAuthDomain}`,
      remediation:
        "Confirm Firebase Authorized Domains includes both hosts and provider redirect URIs use the exact auth-domain host.",
    });
  }

  return checks;
}

export function getServerOAuthGuardrailReport(): OAuthGuardrailReport {
  const appHost = normalizeAppHost(process.env.NEXT_PUBLIC_APP_URL);
  const firebaseAuthDomain = normalizeAuthDomain(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

  return {
    appHost,
    firebaseAuthDomain,
    expectedAuthHandlerUrl: makeExpectedAuthHandlerUrl(firebaseAuthDomain),
    checks: buildChecks(appHost, firebaseAuthDomain),
  };
}

export function getClientOAuthGuardrailReport(): OAuthGuardrailReport {
  const appHost =
    typeof window !== "undefined" && window.location?.host ? window.location.host.toLowerCase() : null;
  const firebaseAuthDomain = normalizeAuthDomain(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);

  return {
    appHost,
    firebaseAuthDomain,
    expectedAuthHandlerUrl: makeExpectedAuthHandlerUrl(firebaseAuthDomain),
    checks: buildChecks(appHost, firebaseAuthDomain),
  };
}
