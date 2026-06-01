const API_URL = 'http://localhost:5000/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const habitService = {
  createHabit: async (name) => {
    const response = await fetch(`${API_URL}/habits/habits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    })
    return await response.json()
  },

  getHabits: async () => {
    const response = await fetch(`${API_URL}/habits/habits`, {
      headers: getHeaders(),
    })
    return await response.json()
  }
}

export const taskService = {
  createTask: async (text) => {
    const response = await fetch(`${API_URL}/habits/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    })
    return await response.json()
  },

  getTasks: async () => {
    const response = await fetch(`${API_URL}/habits/tasks`, {
      headers: getHeaders(),
    })
    return await response.json()
  },

  updateTask: async (id, completed) => {
    const response = await fetch(`${API_URL}/habits/tasks/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ completed }),
    })
    return await response.json()
  }
}

const parseResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }
  return data
}

export const wellnessService = {
  saveAssessment: async (score) => {
    const response = await fetch(`${API_URL}/wellness/assessment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ score }),
    })
    return parseResponse(response)
  },

  logBreathing: async (duration) => {
    const response = await fetch(`${API_URL}/wellness/breathing`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ duration }),
    })
    return parseResponse(response)
  }
}
