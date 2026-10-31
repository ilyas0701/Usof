import { createSlice } from '@reduxjs/toolkit'

export const FILTERS_KEY = 'usof_question_filters'

const defaults = { selectedTags: [], activeTab: 'all', dateFrom: '', dateTo: '', status: 'active' }

function readFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTERS_KEY)) || {}

    return {
      selectedTags: Array.isArray(saved.selectedTags) ? saved.selectedTags.filter((tag) => typeof tag === 'string') : [],
      activeTab: ['all', 'popular', 'disliked'].includes(saved.activeTab) ? saved.activeTab : 'all',
      dateFrom: /^\d{4}-\d{2}-\d{2}$/.test(saved.dateFrom) ? saved.dateFrom : '',
      dateTo: /^\d{4}-\d{2}-\d{2}$/.test(saved.dateTo) ? saved.dateTo : '',
      status: saved.status === 'inactive' ? 'inactive' : 'active',
    }
  } catch {
    return defaults
  }
}

const filters = createSlice({
  name: 'filters', initialState: readFilters,
  reducers: {
    filterChanged: (state, { payload: { name, value } }) => { state[name] = value },

    categoryToggled: (state, { payload }) => {
      state.selectedTags = state.selectedTags.includes(payload)
        ? state.selectedTags.filter((tag) => tag !== payload) : [...state.selectedTags, payload]
    },

    filtersReset: () => defaults,
  },
})

export const { filterChanged, categoryToggled, filtersReset } = filters.actions

export default filters.reducer
