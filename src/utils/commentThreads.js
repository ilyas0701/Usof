export function commentThreads(comments, sort) {
  const ids = new Set(comments.map((comment) => String(comment.id)))
  const children = new Map()
  for (const comment of comments) {
    const parent =
      comment.parent_id != null && ids.has(String(comment.parent_id))
        ? String(comment.parent_id)
        : null
    if (!children.has(parent)) children.set(parent, [])
    children.get(parent).push(comment)
  }
  if (sort) {
    const likeCounts = new Map(comments.map((comment) => [comment,
      (comment.likes || []).filter((reaction) => reaction.type === 'like').length,
    ]))
    const byDate = (a, b) =>
      (Date.parse(a.publish_date) || 0) - (Date.parse(b.publish_date) || 0) || Number(a.id) - Number(b.id)
    const compare = (a, b) => {
      if (sort === 'oldest') return byDate(a, b)
      if (sort === 'newest') return byDate(b, a)
      const difference = likeCounts.get(a) - likeCounts.get(b)
      return (sort === 'likes-desc' ? -difference : difference) || byDate(a, b)
    }
    for (const siblings of children.values()) siblings.sort(compare)
  }
  const stack = (children.get(null) || [])
    .map((comment) => ({ comment, depth: 0 }))
    .reverse()
  const ordered = []
  while (stack.length) {
    const item = stack.pop()
    ordered.push(item)
    const replies = children.get(String(item.comment.id)) || []
    for (let index = replies.length - 1; index >= 0; index -= 1) {
      stack.push({ comment: replies[index], depth: item.depth + 1 })
    }
  }
  return ordered
}
