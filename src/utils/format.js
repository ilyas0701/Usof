export function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
}

export function validateImages(files, limit = 5) {
  if (files.length > limit)
    return `Choose up to ${limit} ${limit === 1 ? 'image' : 'images'}.`
  if (
    files.some(
      (file) =>
        !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
          file.type,
        ),
    )
  ) {
    return 'Choose JPEG, PNG, WebP or GIF images.'
  }
  if (files.some((file) => file.size > 5 * 1024 * 1024))
    return 'Each image must be smaller than 5 MB.'
  return ''
}
