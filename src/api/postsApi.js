import { request, queryString } from './client'

export const postsApi = {
  list: (params, signal) => request(`/posts${queryString(params)}`, { signal }),
  search: (params, signal) =>
    request(`/posts/search${queryString(params)}`, { signal }),
  get: (id, signal) => request(`/posts/${id}`, { signal }),
  create: (body) => request('/posts', { method: 'POST', body }),
  update: (id, body) => request(`/posts/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  categories: (id, signal) => request(`/posts/${id}/categories`, { signal }),
  comments: (id, signal) => request(`/posts/${id}/comments`, { signal }),
  comment: (id, content, parentId = null) =>
    request(`/posts/${id}/comments`, {
      method: 'POST',
      body: { content, parent_id: parentId },
    }),
  images: (id, signal) => request(`/posts/${id}/images`, { signal }),
  image: (id, imageId, signal) =>
    request(`/posts/${id}/images/${imageId}/file`, {
      signal,
      responseType: 'blob',
    }),
  uploadImages: (id, files) => {
    const body = new FormData()
    files.forEach((file) => body.append('images', file))
    return request(`/posts/${id}/images`, { method: 'POST', body })
  },
  favorites: (params, signal) =>
    request(`/posts/favorites${queryString(params)}`, { signal }),
  subscriptions: (params, signal) =>
    request(`/posts/subscriptions${queryString(params)}`, { signal }),
  favorite: (id, enabled) =>
    request(`/posts/${id}/favorite`, { method: enabled ? 'POST' : 'DELETE' }),
  subscribe: (id, enabled) =>
    request(`/posts/${id}/subscribe`, { method: enabled ? 'POST' : 'DELETE' }),
}

export const reactionsApi = {
  list: (resource, id, signal) =>
    request(`/${resource}/${id}/like`, { signal }),
  add: (resource, id, type) =>
    request(`/${resource}/${id}/like`, { method: 'POST', body: { type } }),
  remove: (resource, id) =>
    request(`/${resource}/${id}/like`, { method: 'DELETE' }),
}

export const commentsApi = {
  get: (id, signal) => request(`/comments/${id}`, { signal }),
  update: (id, body) => request(`/comments/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
}
