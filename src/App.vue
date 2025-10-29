<template>
  <div id="app">
    <!-- Header navigation bar - hidden on auth pages -->
    <header class="header" v-if="!isAuthPage">
      <div class="header-content">
        <!-- Logo/Title -->
        <router-link to="/" class="logo">AI Resume Enhancer</router-link>
        
        <!-- Navigation links -->
        <nav class="nav">
          <!-- Unauthenticated user links -->
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="nav-link">Register</router-link>
          
          <!-- Authenticated user links -->
          <template v-if="isAuthenticated">
            <router-link to="/resumes" class="nav-link">Resumes</router-link>
            <router-link to="/resume-files" class="nav-link">Files</router-link>
            <router-link to="/sessions" class="nav-link">Sessions</router-link>
            <router-link to="/chat" class="nav-link">AI Assistant</router-link>
            <span class="nav-link">{{ user?.email || user?.username }}</span>
            <button @click="handleLogout" class="btn btn-secondary">Logout</button>
          </template>
        </nav>
      </div>
    </header>
    
    <!-- Main content area -->
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

// Vue Router and store setup
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAuthPage = computed(() => route.name === 'Login' || route.name === 'Register')

// Logout handler
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

