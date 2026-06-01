const API_URL = 'http://localhost:5000/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const moodService = {
  logMood: async (text, emoji) => {
    const response = await fetch(`${API_URL}/mood/log`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, emoji }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to save mood')
    }
    return data
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/mood/history`, {
      headers: getHeaders(),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load mood history')
    }
    return Array.isArray(data) ? data : []
  }
}

export const chatService = {
  sendMessage: async (message) => {
    const response = await fetch(`${API_URL}/chat/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    })
    return await response.json()
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/chat/history`, {
      headers: getHeaders(),
    })
    return await response.json()
  }
}

export const profileService = {
    getProfile: async () => {
        const response = await fetch(`${API_URL}/profile/me`, {
            headers: getHeaders(),
        })
        return await response.json()
    },
    updateProfile: async (formData) => {
        const response = await fetch(`${API_URL}/profile/update`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData,
        })
        return await response.json()
    }
}

export const emergencyService = {
    getContacts: async () => {
        const response = await fetch(`${API_URL}/emergency/`, {
            headers: getHeaders(),
        })
        return await response.json()
    },
    addContact: async (contact) => {
        const response = await fetch(`${API_URL}/emergency/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(contact),
        })
        return await response.json()
    },
    deleteContact: async (id) => {
        const response = await fetch(`${API_URL}/emergency/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        })
        return await response.json()
    }
}
