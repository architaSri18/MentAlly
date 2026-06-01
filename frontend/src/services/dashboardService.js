const API_URL = 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

export class AuthError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthError'
  }
}

const fetchJson = async (url, options = {}) => {
  const token = getToken()
  if (!token) {
    throw new AuthError('Please sign in again to see your track.')
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (response.status === 401) {
    throw new AuthError(data?.message || 'Session expired. Please sign in again.')
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`)
  }

  return data
}

const emptyTrack = () => ({
  tasks: [],
  habits: [],
  moods: [],
  assessment: { score: 0 },
  assessments: [],
  breathing: [],
  counts: {
    moods: 0,
    habits: 0,
    tasks: 0,
    tasks_done: 0,
    assessments: 0,
    breathing_sessions: 0,
  },
})

export const dashboardService = {
  fetchAll: async () => {
    try {
      const summary = await fetchJson(`${API_URL}/dashboard/summary`)
      return {
        tasks: Array.isArray(summary.tasks) ? summary.tasks : [],
        habits: Array.isArray(summary.habits) ? summary.habits : [],
        moods: Array.isArray(summary.moods) ? summary.moods : [],
        assessment: summary.assessment || { score: 0 },
        assessments: Array.isArray(summary.assessments) ? summary.assessments : [],
        breathing: Array.isArray(summary.breathing) ? summary.breathing : [],
        counts: summary.counts || emptyTrack().counts,
      }
    } catch (err) {
      if (err instanceof AuthError) throw err
      console.warn('Dashboard summary failed, falling back:', err.message)

      const headers = getHeaders()
      const safeJson = async (response) => {
        if (!response.ok) return null
        try {
          return await response.json()
        } catch {
          return null
        }
      }

      const [tasks, habits, moods, assessment, assessments, breathing] = await Promise.all([
        fetch(`${API_URL}/habits/tasks`, { headers }).then(safeJson),
        fetch(`${API_URL}/habits/habits`, { headers }).then(safeJson),
        fetch(`${API_URL}/mood/history`, { headers }).then(safeJson),
        fetch(`${API_URL}/wellness/assessment/latest`, { headers }).then(safeJson),
        fetch(`${API_URL}/wellness/assessment/history`, { headers }).then(safeJson),
        fetch(`${API_URL}/wellness/breathing`, { headers }).then(safeJson),
      ])

      const moodList = Array.isArray(moods) ? moods : []
      const taskList = Array.isArray(tasks) ? tasks : []
      const habitList = Array.isArray(habits) ? habits : []
      const assessmentList = Array.isArray(assessments) ? assessments : []
      const breathingList = Array.isArray(breathing) ? breathing : []

      return {
        tasks: taskList,
        habits: habitList,
        moods: moodList,
        assessment: assessment || { score: 0 },
        assessments: assessmentList,
        breathing: breathingList,
        counts: {
          moods: moodList.length,
          habits: habitList.length,
          tasks: taskList.length,
          tasks_done: taskList.filter((t) => t.completed).length,
          assessments: assessmentList.length,
          breathing_sessions: breathingList.length,
        },
      }
    }
  },

  validateSession: async () => {
    return fetchJson(`${API_URL}/auth/me`)
  },
}
