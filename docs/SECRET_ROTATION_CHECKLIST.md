# Secret Rotation Checklist (Post-Leak)

Use this checklist immediately after history rewrite and before force-pushing rewritten refs.

## 1) Revoke and rotate credentials

- Firebase service account key (create new key, revoke old key).
- reCAPTCHA Enterprise API key.
- reCAPTCHA site key (if operationally possible for your deployment).
- AstroApp API key.
- Any keys that were present in rewritten commits or scan reports.

## 2) Update secret stores

- GitHub Actions repository/environment secrets.
- Vercel project environment variables (Production/Preview/Development as applicable).
- Local `.env.local` values for trusted developer machines.

## 3) Verify app flows with rotated keys

- Sign-in captcha verification.
- Sign-up captcha verification.
- Guest community captcha verification.
- Any server-side integrations relying on rotated keys.

## 4) Confirm old secrets are unusable

- Validate revoked keys fail authentication.
- Confirm monitoring/alerts show no continued use of revoked keys.

## 5) Communicate cutover

- Notify collaborators that rewritten history + key rotation is complete.
- Instruct collaborators to re-clone or reset to rewritten refs.
