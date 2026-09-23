export function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}
