/** Express route params can be `string | string[]` in strict typings. */
export function paramAsString(
  value: string | string[] | undefined
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  return undefined;
}
