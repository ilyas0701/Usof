import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import authReducer, { sessionStarted, sessionEnded, userUpdated } from './authSlice.js'
import { api } from './api.js'
import filtersReducer, { FILTERS_KEY, filterChanged, categoryToggled, filtersReset } from './filtersSlice.js'

const sessionListener = createListenerMiddleware()

sessionListener.startListening({
  matcher: isAnyOf(filterChanged, categoryToggled, filtersReset),
  effect: (action, listener) => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(listener.getState().filters))
    } catch {
      /* Filters still work without storage. */
    }
  },
})

sessionListener.startListening({
  matcher: isAnyOf(sessionStarted, sessionEnded, userUpdated),
  effect: (action, listener) => {
    const previous = listener.getOriginalState().auth
    const current = listener.getState().auth

    if (previous.token !== current.token || previous.user?.role !== current.user?.role) {
      listener.dispatch(api.util.resetApiState())
    }

    try {
      if (current.token) {
        localStorage.setItem('usof_auth_token', current.token)
        localStorage.setItem('usof_auth_user', JSON.stringify(current.user))
      } else {
        localStorage.removeItem('usof_auth_token')
        localStorage.removeItem('usof_auth_user')
      }
    } catch {
      /* The session can still work without persistent storage. */
    }
  },
})

export const store = configureStore({
  reducer: { auth: authReducer, filters: filtersReducer, [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(sessionListener.middleware).concat(api.middleware),
})
