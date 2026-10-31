import { request, queryString } from './client'

export const postsApi = {
  search: (params, signal) =>
    request(`/posts/search${queryString(params)}`, { signal }),
  create: (body) => request('/posts', { method: 'POST', body }),
  update: (id, body) => request(`/posts/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  comment: (id, content, parentId = null) =>
    request(`/posts/${id}/comments`, {
      method: 'POST',
      body: { content, parent_id: parentId },
    }),
  removeImage: (id, imageId) => request(`/posts/${id}/images/${imageId}`, { method: 'DELETE' }),
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
  update: (id, body) => request(`/comments/${id}`, { method: 'PATCH', body }),
  remove: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
}
