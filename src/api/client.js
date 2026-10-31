import { api } from '../store/api'
import { store } from '../store'
import { request as transportRequest } from './transport'

export async function request(endpoint, options = {}) {
  const { signal, ...init } = options

  if (endpoint.startsWith('/auth') || init.responseType === 'blob' || init.body instanceof FormData) {
    const result = await transportRequest(endpoint, { token: store.getState().auth.token, ...options })

    if (init.method && init.method !== 'GET' && !endpoint.startsWith('/auth')) {
      store.dispatch(api.util.invalidateTags(['Users', 'Posts', 'Post', 'Favorites', 'Subscriptions']))
    }

    return result
  }

  const session = store.getState().auth
  const scope = `${session.token}:${session.user?.role || ''}`
  const method = init.method || 'GET'
  const operation = method === 'GET'
    ? store.dispatch(api.endpoints.resource.initiate({ path: endpoint, scope }))
    : store.dispatch(api.endpoints.change.initiate({ path: endpoint, ...init }))

  try {
    const data = await operation.unwrap()

    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    return data
  } catch (failure) {
    if (failure.name === 'AbortError') throw failure

    const error = new Error(failure.message || 'Request failed')
    error.status = failure.status

    throw error
  } finally {
    operation.unsubscribe?.()
    operation.reset?.()
  }
}

export function queryString(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, value]) => {
    if (value !== '' && value != null) query.set(key, value)
  })

  return query.size ? `?${query}` : ''
}
