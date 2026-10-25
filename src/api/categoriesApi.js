import { request, queryString } from './client'

export const categoriesApi = {
  create: (body) => request('/categories', { method: 'POST', body }),
  list: (signal) => request('/categories', { signal }),
  get: (id, signal) => request(`/categories/${id}`, { signal }),
  posts: (id, params, signal) =>
    request(`/categories/${id}/posts${queryString(params)}`, { signal }),
}
