/** Actions must match client `grecaptcha.enterprise.execute(..., { action })` and server `expectedAction`. */
export const RECAPTCHA_ACTIONS = {
  LOGIN: "LOGIN",
  SIGNUP: "SIGNUP",
  COMMUNITY_DISCUSSION: "COMMUNITY_DISCUSSION",
  COMMUNITY_COMMENT: "COMMUNITY_COMMENT",
} as const;

export type RecaptchaActionName = (typeof RECAPTCHA_ACTIONS)[keyof typeof RECAPTCHA_ACTIONS];
