import { request } from './client'

export const categoriesApi = {
  create: (body) => request('/categories', { method: 'POST', body }),
}
