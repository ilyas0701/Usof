import { api } from './api.js'

export function updateCachedReactions(resource, id, likes) {
  return (dispatch, getState) => {
    const same = (value) => String(value) === String(id)
    for (const args of api.util.selectCachedArgsForQuery(getState(), 'resource')) {
      dispatch(api.util.updateQueryData('resource', args, (data) => {
        if (Array.isArray(data)) {
          if (args.path === `/${resource}/${id}/like`) return likes
          if (resource === 'comments' && /^\/posts\/\d+\/comments$/.test(args.path)) {
            for (const comment of data) if (same(comment.id)) comment.likes = likes
          }
          return
        }
        if (!data) return
        if (resource === 'posts') {
          if (same(data.post?.id)) data.likes = likes
          for (const post of data.posts || []) if (same(post.id)) post.likes = likes
        } else {
          for (const comment of data.comments || []) if (same(comment.id)) comment.likes = likes
        }
      }))
    }
  }
}
