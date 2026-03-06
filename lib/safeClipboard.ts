/**
 * Safe clipboard write for WebView/Capacitor on Android.
 * Android 10+ denies clipboard access when the app is not in focus; calling
 * navigator.clipboard when the user has switched away causes "Denying clipboard
 * access" in logcat. This helper only writes when the window has focus and
 * catches errors so we don't surface unnecessary failures.
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    if (typeof document !== 'undefined' && !document.hasFocus()) {
      return false;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
