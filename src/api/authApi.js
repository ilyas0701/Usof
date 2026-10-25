import { request as apiRequest } from './client'

function request(endpoint, options = {}) {
  return apiRequest(`/auth${endpoint}`, { token: '', ...options })
}

export const authApi = {
  async login({ login, password }) {
    const data = await request('/login', {
      method: 'POST',
      body: { login, password },
    })

    if (typeof data?.token !== 'string' || !data.token) {
      throw new Error('The server did not return an access token.')
    }

    return data
  },

  async register({ login, email, password, passwordConfirmation }) {
    return request('/register', {
      method: 'POST',
      body: { login, email, password, passwordConfirmation },
    })
  },

  async verifyEmail(token, signal) {
    return request(`/verify-email/${encodeURIComponent(token)}`, { signal })
  },

  async requestPasswordReset({ email }) {
    return request('/password-reset', {
      method: 'POST',
      body: { email },
    })
  },

  async resetPassword({ token, newPassword, newPasswordConfirmation }) {
    return request(`/password-reset/${encodeURIComponent(token)}`, {
      method: 'POST',
      body: { newPassword, newPasswordConfirmation },
    })
  },

  async logout(token) {
    return request('/logout', {
      method: 'POST',
      token,
    })
  },
}
