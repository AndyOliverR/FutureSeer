import { validateProxyImageUrl } from '@/lib/security/proxyImageValidation';

describe('validateProxyImageUrl', () => {
  it('accepts allowed astroapp https host', () => {
    const result = validateProxyImageUrl('https://astroapp.com/assets/img.png');
    expect(result.ok).toBe(true);
  });

  it('rejects non-https urls', () => {
    const result = validateProxyImageUrl('http://astroapp.com/assets/img.png');
    expect(result.ok).toBe(false);
  });

  it('rejects non-allowlisted hosts', () => {
    const result = validateProxyImageUrl('https://evil-astroapp.com/assets/img.png');
    expect(result.ok).toBe(false);
  });
});

