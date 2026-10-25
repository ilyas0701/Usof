import { request } from './client'

export const usersApi = {
  list: (signal) => request('/users', { signal }),
  get: (id, signal) => request(`/users/${id}`, { signal }),
  update: (id, body) => request(`/users/${id}`, { method: 'PATCH', body }),
  uploadAvatar: (file) => {
    const body = new FormData()
    body.append('avatar', file)
    return request('/users/avatar', { method: 'PATCH', body })
  },
}
