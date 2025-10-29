import { defineStore } from 'pinia'
import api, { usersAPI } from '../services/api'

// Authentication store using Pinia
export const useAuthStore = defineStore('auth', {
  // Initial state from localStorage
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null
  }),

  // Getters
  getters: {
    // Check if user is authenticated
    // Relaxed: treat having a user object as authenticated to allow redirect
    // Token is still used for authenticated endpoints automatically by axios
    isAuthenticated: (state) => !!state.user,
    
    // Get user ID - tries multiple possible fields
    userId: (state) => {
      if (!state.user) return null
      return state.user.id || state.user.user_id || state.user.email || null
    },
    
    // Get user email
    userEmail: (state) => state.user?.email || null,
    
    // Get username
    username: (state) => state.user?.username || state.user?.email || null
  },

  // Actions
  actions: {
    // Login user and store credentials
    async login(credentials) {
      try {
        const response = await usersAPI.login(credentials)

        // Backend returns: { access_token, token_type, user_id }
        if (response.access_token) {
          this.token = response.access_token

          // Compose minimal user object
          this.user = {
            id: response.user_id,
            user_id: response.user_id,
            email: credentials.email
          }

          // Persist
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))

          // Ensure axios always sends Authorization header
          api.defaults.headers.Authorization = `Bearer ${this.token}`

          if (import.meta.env.DEV) {
            console.log('✅ Login successful - token stored, user_id:', response.user_id)
          }
        } else if (response.token) {
          // Fallback for previous API: { token, user? }
          this.token = response.token
          this.user = response.user || { id: response.user_id || credentials.email, user_id: response.user_id, email: credentials.email }
          if (!this.user.id) this.user.id = this.user.user_id || credentials.email
          if (!this.user.user_id) this.user.user_id = this.user.id
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          api.defaults.headers.Authorization = `Bearer ${this.token}`
        }
        return response
      } catch (error) {
        throw error
      }
    },

    // Register new user and store credentials
    async register(userData) {
      try {
        const response = await usersAPI.register(userData)
        if (response.token) {
          this.token = response.token
          
          // Build user object from response
          this.user = response.user || response || userData
          
          // Ensure user ID exists - prioritize id, then user_id, then email
          if (!this.user.id && !this.user.user_id) {
            this.user.id = response.id || response.user_id || userData.email
          }
          
          // Normalize user_id field - ensure both id and user_id are set
          if (this.user.id && !this.user.user_id) {
            this.user.user_id = this.user.id
          } else if (this.user.user_id && !this.user.id) {
            this.user.id = this.user.user_id
          }
          
          // Log user ID for debugging
          if (import.meta.env.DEV) {
            console.log('✅ Registration successful - User ID:', this.user.id || this.user.user_id || userData.email)
          }
          
          // Save to localStorage
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(this.user))
        }
        return response
      } catch (error) {
        throw error
      }
    },

    // Logout user and clear credentials
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.Authorization
    }
  }
})

