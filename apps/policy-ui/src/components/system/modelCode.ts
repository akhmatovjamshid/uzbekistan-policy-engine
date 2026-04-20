export function toModelCode(modelId: string): string {
  const normalized = modelId.trim()
  if (!normalized) {
    return ''
  }
  const compact = normalized.toUpperCase()
  if (/^[A-Z0-9]{2,8}$/.test(compact)) {
    return compact
  }
  const head = normalized.split(/[_-\s]+/).find(Boolean) ?? normalized
  return head.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}
