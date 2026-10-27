export function questionPath(id, title = '') {
  const slug = Array.from(String(title)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, ''))
    .slice(0, 100).join('').replace(/-+$/g, '') || 'question'
  return `/questions/${id}/${encodeURIComponent(slug)}`
}

export function questionIdFromPath(pathname) {
  return pathname.match(/^\/questions\/(\d+)(?:\/[^/]+)?\/?$/)?.[1]
    || pathname.match(/^\/posts\/(\d+)\/?$/)?.[1]
    || null
}
