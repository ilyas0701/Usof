import { createSlice } from '@reduxjs/toolkit'

export function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(decodeURIComponent(Array.from(atob(base64), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')))
  } catch {
    return null
  }
}

function initialSession() {
  try {
    const token = localStorage.getItem('usof_auth_token') || ''
    const payload = parseJwt(token)

    if (payload?.exp * 1000 > Date.now()) {
      return { token, user: { ...payload, ...JSON.parse(localStorage.getItem('usof_auth_user') || '{}') } }
    }
  } catch {

  }

  return { token: '', user: null }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialSession,
  reducers: {
    sessionStarted: (state, { payload }) => ({ token: payload.token, user: { ...parseJwt(payload.token), ...payload.user } }),

    sessionEnded: () => ({ token: '', user: null }),

    userUpdated: (state, { payload }) => {
      if (state.token) state.user = { ...parseJwt(state.token), ...payload }
    },
  },
})

export const { sessionStarted, sessionEnded, userUpdated } = authSlice.actions

export default authSlice.reducer
