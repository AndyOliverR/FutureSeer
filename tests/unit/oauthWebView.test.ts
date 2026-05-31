/** @jest-environment jsdom */

import { shouldPreferOAuthRedirect } from '@/lib/oauthWebView';

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
  });

  it('prefers redirect on Android mobile Chrome', () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 14; T442A Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.178 Mobile Safari/537.36',
    );
    expect(shouldPreferOAuthRedirect()).toBe(true);
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
});
