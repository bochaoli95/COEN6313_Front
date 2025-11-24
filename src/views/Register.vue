<template>
  <div class="register" style="max-width: 400px; margin: 60px auto;">
    <div class="card">
      <!-- Registration form header -->
      <h2 style="margin-bottom: 30px; text-align: center; color: #ececf1;">Register</h2>
      
      <!-- Error message display -->
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      
      <!-- Registration form -->
      <form @submit.prevent="handleRegister">
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
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="input"
            placeholder="Enter your username"
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
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      
      <!-- Login link -->
      <p style="text-align: center; margin-top: 20px; color: #9ca3af;">
        Already have an account?
        <router-link to="/login" style="color: #10a37f; text-decoration: none;">Login now</router-link>
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
  username: '',
  password: ''
})

// Loading and error states
const loading = ref(false)
const error = ref('')

// Handle registration submission
const handleRegister = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.register(form.value)
    // Redirect to resume files page after successful registration
    router.push('/resume-files')
  } catch (err) {
    // Enhanced error handling with detailed messages
    console.error('Registration error:', err)
    error.value = err.userMessage || 
                  err.response?.data?.detail || 
                  err.response?.data?.message ||
                  err.message ||
                  `Registration failed (${err.status || 'Unknown error'}). Please try again.`
  } finally {
    loading.value = false
  }
}
</script>
