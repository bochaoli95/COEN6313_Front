<template>
  <div class="home">
    <!-- Hero section -->
    <div class="card" style="text-align: center; padding: 60px 20px;">
      <h1 style="font-size: 48px; margin-bottom: 20px; color: #10a37f;">
        AI Resume Enhancer
      </h1>
      <p style="font-size: 20px; color: #9ca3af; margin-bottom: 40px;">
        Enhance your resume with AI technology and stand out in your job search
      </p>
      <!-- Action buttons -->
      <div style="display: flex; gap: 20px; justify-content: center;">
        <router-link v-if="!isAuthenticated" to="/register" class="btn btn-primary" style="text-decoration: none;">
          Get Started
        </router-link>
        <router-link v-if="isAuthenticated" to="/studio" class="btn btn-primary" style="text-decoration: none;">
          AI Assistant
        </router-link>
      </div>
    </div>

    <!-- Feature cards - shown when authenticated -->
    <div class="grid" v-if="isAuthenticated">
      <div class="card">
        <h2 style="color: #ececf1;">💬 AI Chat</h2>
        <p style="color: #9ca3af; margin: 10px 0;">Chat with AI assistant to optimize your resume</p>
        <router-link to="/studio" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
          Start Chat
        </router-link>
      </div>
      <div class="card">
        <h2 style="color: #ececf1;">📁 File Management</h2>
        <p style="color: #9ca3af; margin: 10px 0;">View and manage your resume files</p>
        <router-link to="/resume-files" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
          View
        </router-link>
      </div>
      <div class="card">
        <h2 style="color: #ececf1;">📋 Sessions</h2>
        <p style="color: #9ca3af; margin: 10px 0;">View and manage your chat sessions</p>
        <router-link to="/sessions" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
          View
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

// Get authentication state from store
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

