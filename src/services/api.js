import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add authentication token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // Log request details in development mode
    if (import.meta.env.DEV) {
      const fullUrl = `${config.baseURL}${config.url}`
      console.log(`📤 Request: ${config.method?.toUpperCase()} ${fullUrl}`, {
        baseURL: config.baseURL,
        url: config.url,
        fullURL: fullUrl,
        data: config.data instanceof FormData ? '[FormData]' : config.data,
        params: config.params,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
        },
        target: 'Proxied to http://localhost:8006'
      })
    }
    
    return config
  },
  (error) => {
    console.error('Request setup error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and authentication
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Enhanced error logging for debugging
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
      fullError: error
    }

    // Log detailed error information to console
    console.group('❌ API Error Details')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🚨 ERROR DETAILS')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Status:', errorDetails.status || 'No Response', errorDetails.statusText || '')
    console.error('Method:', errorDetails.method || 'Unknown')
    console.error('URL:', errorDetails.url || 'Unknown')
    console.error('Full Request URL:', error.config?.url ? `${error.config.baseURL}${errorDetails.url}` : 'N/A')
    console.error('Target Server:', 'http://127.0.0.1:8006' + errorDetails.url)
    
    if (errorDetails.data) {
      console.error('\n📄 Response Data:')
      console.error(JSON.stringify(errorDetails.data, null, 2))
    }
    
    console.error('\n🔍 Request Configuration:')
    console.error('Headers:', error.config?.headers)
    if (error.config?.data) {
      console.error('Payload:', typeof error.config.data === 'string' 
        ? error.config.data 
        : JSON.stringify(error.config.data, null, 2))
    }
    
    console.error('\n📋 Full Error Object:')
    console.error(error)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.groupEnd()

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Redirect to login on 401 Unauthorized
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 500) {
      // Log 500 errors with extra details
      console.error('\n🚨 SERVER ERROR (500)')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Request was sent to: http://127.0.0.1:8006' + errorDetails.url)
      console.error('\n📄 Backend Response:')
      console.error(errorDetails.data || 'No response data')
      console.error('\n💡 Troubleshooting Steps:')
      console.error('  1. ✅ Proxy is working (request reached backend)')
      console.error('  2. ❌ Backend returned 500 error')
      console.error('  3. Check backend server terminal/logs for detailed error')
      console.error('  4. Common causes:')
      console.error('     - Database connection error')
      console.error('     - Missing environment variables')
      console.error('     - Invalid request data format')
      console.error('     - Server code exception')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    } else if (!error.response) {
      // Network error or server not reachable
      console.error('🌐 Network Error: Server may be down or unreachable')
      console.error('Error:', error.message)
      console.error('💡 Troubleshooting:')
      console.error('  1. Check if backend is running: curl http://localhost:8006/api/resume/optimization/health')
      console.error('  2. Verify proxy configuration in vite.config.js')
      console.error('  3. Check browser console for CORS errors')
      
      // Check if it's a CORS error
      if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
        console.error('🚫 CORS Error detected!')
        console.error('   - The request was blocked by CORS policy')
        console.error('   - Verify backend CORS configuration')
        console.error('   - Check if backend allows origin: http://localhost:3000')
      }
    }

    // Format error for easier debugging
    const formattedError = {
      ...errorDetails,
      // User-friendly error message
      userMessage: error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message ||
                   `Request failed: ${errorDetails.status || 'Unknown error'}`
    }

    return Promise.reject(formattedError)
  }
)

// Users API
export const usersAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (userData) => api.post('/users/login', userData),
  getAll: () => api.get('/users/'),
  getById: (userId) => api.get(`/users/${userId}`),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
  delete: (userId) => api.delete(`/users/${userId}`)
}

// Resumes API
export const resumesAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/resumes/'),
  getByUserId: (userId) => api.get(`/resumes/user/${userId}`),
  update: (resumeId, data) => api.put(`/resumes/${resumeId}`, new URLSearchParams(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  delete: (resumeId) => api.delete(`/resumes/${resumeId}`)
}

// Resume Files API
export const resumeFilesAPI = {
  getAll: () => api.get('/resume-files/'),
  create: (formData) => {
    // Don't set Content-Type manually for FormData - axios will automatically set it with boundary
    return api.post('/resume-files/', formData)
  },
  getByUserId: (userId) => api.get(`/resume-files/user/${userId}`),
  getById: (fileId) => api.get(`/resume-files/${fileId}`),
  updateFileName: (resumeId, newFileId) => {
    const formData = new URLSearchParams()
    formData.append('new_file_id', newFileId)
    return api.put(`/resume-files/${resumeId}/file-id`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  delete: (fileId) => api.delete(`/resume-files/${fileId}`)
}

// Chat/Optimization API
export const chatAPI = {
  sendMessage: (messageData) => api.post('/resume/optimization/chat', messageData),
  getHistory: (userId, sessionId) => api.get(`/resume/optimization/history/${userId}/${sessionId}`),
  health: () => api.get('/resume/optimization/health'),
  getAvailableModels: () => api.get('/resume/optimization/models'),
  getCurrentModel: () => api.get('/resume/optimization/model/current'),
  switchModel: (modelName) => api.post('/resume/optimization/model/switch', { model: modelName })
}

// Session API
export const sessionAPI = {
  getAllByUserId: (userId) => api.get(`/session/user/${userId}`),
  create: (sessionData) => api.post('/session/', sessionData),
  getById: (sessionId) => api.get(`/session/${sessionId}`),
  updateTitle: (sessionId, title) => api.patch(`/session/${sessionId}/title`, { title }),
  delete: (sessionId) => api.delete(`/session/${sessionId}`),
  getHistory: (sessionId) => api.get(`/session/${sessionId}/history`)
}

export default api

