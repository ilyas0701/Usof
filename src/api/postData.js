import { postsApi, reactionsApi } from './postsApi'

export async function loadPostCard(post, signal) {
  const [categories, comments, likes] = await Promise.all([
    postsApi.categories(post.id, signal),
    postsApi.comments(post.id, signal),
    reactionsApi.list('posts', post.id, signal),
  ])
  return { ...post, categories, commentsCount: comments.length, likes }
}

export async function loadMembership(id, signal) {
  const contains = async (load) => {
    let page = 1
    let result
    do {
      result = await load({ page, pageSize: 100 }, signal)
      if (result.posts.some((post) => String(post.id) === String(id)))
        return true
      page += 1
    } while ((page - 1) * 100 < result.total)
    return false
  }
  const [favorite, subscribed] = await Promise.all([
    contains(postsApi.favorites),
    contains(postsApi.subscriptions),
  ])
  return { favorite, subscribed }
}
