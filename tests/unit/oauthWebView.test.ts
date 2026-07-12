/** @jest-environment jsdom */

import {
  shouldPreferOAuthRedirect,
  shouldProcessOAuthRedirectReturn,
  markOAuthRedirectPending,
  clearOAuthRedirectPending,
  hasOAuthRedirectReturnInUrl,
  cleanupStaleOAuthUrlParams,
  OAUTH_REDIRECT_PENDING_KEY,
} from '@/lib/oauthWebView';

function setUserAgent(ua: string, maxTouchPoints = 0) {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: ua,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    configurable: true,
    value: maxTouchPoints,
  });
}

describe('shouldPreferOAuthRedirect', () => {
  afterEach(() => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    clearOAuthRedirectPending();
  });

  it('uses popup (not redirect) on Android mobile Chrome', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; T442A Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.178 Mobile Safari/537.36',
    );
    expect(shouldPreferOAuthRedirect()).toBe(false);
  });

  it('keeps popup on desktop Chrome', () => {
    setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    expect(shouldPreferOAuthRedirect()).toBe(false);
  });

  it('prefers redirect on iPhone Safari', () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    expect(shouldPreferOAuthRedirect()).toBe(true);
  });

  it('prefers redirect on Samsung Internet', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36',
    );
    expect(shouldPreferOAuthRedirect()).toBe(true);
  });
});

describe('OAuth redirect return gating', () => {
  afterEach(() => {
    clearOAuthRedirectPending();
    window.history.replaceState({}, '', '/');
  });

  it('does not process redirect without URL params or pending flag', () => {
    expect(shouldProcessOAuthRedirectReturn()).toBe(false);
  });

  it('processes redirect when pending flag is set', () => {
    markOAuthRedirectPending('google');
    expect(shouldProcessOAuthRedirectReturn()).toBe(true);
  });

  it('processes redirect when URL has Firebase return params', () => {
    window.history.replaceState({}, '', '/?apiKey=test&authType=signInViaRedirect');
    expect(hasOAuthRedirectReturnInUrl()).toBe(true);
    expect(shouldProcessOAuthRedirectReturn()).toBe(true);
  });

  it('cleans stale OAuth URL params when no pending redirect', () => {
    window.history.replaceState({}, '', '/?apiKey=test&authType=signInViaRedirect');
    cleanupStaleOAuthUrlParams();
    expect(window.location.search).toBe('');
  });

  it('stores pending redirect in sessionStorage', () => {
    markOAuthRedirectPending('google');
    expect(sessionStorage.getItem(OAUTH_REDIRECT_PENDING_KEY)).toContain('google');
    clearOAuthRedirectPending();
    expect(sessionStorage.getItem(OAUTH_REDIRECT_PENDING_KEY)).toBeNull();
  });
});
