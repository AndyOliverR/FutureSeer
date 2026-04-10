/** Display label for Western chart sign fields that may be a string or `{ signName }`. */
export function chartSignLabel(
  sign: string | { signName?: string } | null | undefined
): string {
  if (sign == null) return '';
  return typeof sign === 'string' ? sign : (sign.signName ?? '');
}
