<template>
  <div class="login" style="max-width: 400px; margin: 60px auto;">
    <div class="card">
      <!-- Login form header -->
      <h2 style="margin-bottom: 30px; text-align: center; color: #ececf1;">Login</h2>
      
      <!-- Error message display -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      
      <!-- Login form -->
      <form @submit.prevent="handleLogin">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input"
            placeholder="Enter your email"
            required
          />
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <!-- Register link -->
      <p style="text-align: center; margin-top: 20px; color: #9ca3af;">
        Don't have an account?
        <router-link to="/register" style="color: #10a37f; text-decoration: none;">Register now</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Router and store setup
const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = ref({
  email: '',
  password: ''
})

// Loading and error states
const loading = ref(false)
const error = ref('')

// Handle login submission
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value)
    // Redirect to resumes page after successful login
    router.push('/resumes')
  } catch (err) {
    // Enhanced error handling with detailed messages
    console.error('Login error:', err)
    error.value = err.userMessage || 
                  err.response?.data?.detail || 
                  err.response?.data?.message ||
                  err.message ||
                  `Login failed (${err.status || 'Unknown error'}). Please check your credentials.`
  } finally {
    loading.value = false
  }
}
</script>
