<template>
  <div id="app">
    <header class="header" v-if="!isAuthPage">
      <div class="header-content">
        <router-link to="/" class="logo">AI Resume Enhancer</router-link>
        
        <nav class="nav">
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="nav-link">Register</router-link>
          
          <template v-if="isAuthenticated">
            <router-link to="/resume-files" class="nav-link">Files</router-link>
            <router-link to="/sessions" class="nav-link">Sessions</router-link>
            <router-link to="/studio" class="nav-link">AI Assistant</router-link>
            <span class="nav-link">{{ user?.email || user?.username }}</span>
            <button @click="handleLogout" class="btn btn-secondary">Logout</button>
          </template>
        </nav>
      </div>
    </header>
    
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAuthPage = computed(() => route.name === 'Login' || route.name === 'Register')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

