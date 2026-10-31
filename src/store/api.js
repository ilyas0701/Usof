import { createApi } from '@reduxjs/toolkit/query/react'
import { request } from '../api/transport.js'

export function tagsForPath(path) {
  if (path === '/categories' || /^\/categories\/\d+$/.test(path)) return ['Categories']
  if (path.startsWith('/categories')) return ['Posts']
  if (path.startsWith('/users')) return ['Users']
  const post = path.match(/^\/posts\/(\d+)/)
  if (post) return [{ type: 'Post', id: post[1] }]
  if (path.startsWith('/posts/favorites')) return ['Favorites']
  if (path.startsWith('/posts/subscriptions')) return ['Subscriptions']
  if (path.startsWith('/posts')) return ['Posts']
  if (path.startsWith('/comments')) return ['Posts']
  return []
}

export const api = createApi({
  reducerPath: 'api',
  keepUnusedDataFor: 60,
  tagTypes: ['Categories', 'Users', 'Posts', 'Post', 'Resource', 'Favorites', 'Subscriptions'],
  baseQuery: async ({ path, ...options }, { signal, getState }) => {
    try {
      return { data: await request(path, { token: getState().auth.token, signal, ...options }) }
    } catch (error) {
      return { error: { status: error.status || 'FETCH_ERROR', message: error.message } }
    }
  },
  endpoints: (build) => ({
    resource: build.query({
      query: ({ path }) => ({ path }),
      providesTags: (result, error, { path }) => [...tagsForPath(path), { type: 'Resource', id: path }],
    }),
    change: build.mutation({
      query: (options) => options,
      invalidatesTags: (result, error, { path }) => {
        if (error) return []
        if (/\/like$/.test(path)) return [{ type: 'Resource', id: path }, 'Users']
        const membership = path.match(/^\/posts\/(\d+)\/(favorite|subscribe)$/)
        if (membership) return [
          { type: 'Resource', id: `/posts/${membership[1]}/membership` },
          membership[2] === 'favorite' ? 'Favorites' : 'Subscriptions',
        ]
        if (path.startsWith('/categories')) return ['Categories', 'Posts', 'Post', 'Favorites', 'Subscriptions']
        if (path.startsWith('/posts') || path.startsWith('/comments')) return ['Posts', 'Post', 'Favorites', 'Subscriptions', 'Users']
        if (path.startsWith('/users')) return ['Users', 'Posts', 'Post', 'Favorites', 'Subscriptions']
        return tagsForPath(path)
      },
    }),
  }),
})
