export function commentThreads(comments) {
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
