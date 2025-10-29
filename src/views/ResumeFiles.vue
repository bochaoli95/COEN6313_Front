<template>
  <div class="resume-files">
    <div class="card">
      <!-- Header with title and refresh button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ececf1;">Resume Files</h2>
        <button @click="loadFiles" class="btn btn-secondary">Refresh</button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading...</div>
      
      <!-- Empty state -->
      <div v-else-if="files.length === 0" class="empty-state">
        <h3>No Files</h3>
        <p>Generated resume files will appear here after upload</p>
      </div>
      
      <!-- Files grid -->
      <div v-else>
        <div class="grid">
          <div v-for="file in files" :key="file.file_id" class="card">
            <h3 style="margin-bottom: 10px; color: #ececf1;">{{ file.file_id }}</h3>
            <p style="color: #9ca3af; margin-bottom: 10px; font-size: 14px;">
              Created: {{ formatDate(file.created_at) }}
            </p>
            <a :href="file.file_url" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-block; margin-right: 10px;">
              View File
            </a>
            <button @click="deleteFile(file.file_id)" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { resumeFilesAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

// Store and reactive state
const authStore = useAuthStore()
const files = ref([])
const loading = ref(false)

// Load files on component mount
onMounted(() => {
  loadFiles()
})

// Fetch resume files from API
const loadFiles = async () => {
  loading.value = true
  try {
    // Get user ID using the store getter (handles all ID formats)
    const userId = authStore.userId
    if (userId) {
      console.log('📁 Loading files for user:', userId)
      // Load user-specific files
      files.value = await resumeFilesAPI.getByUserId(userId)
    } else {
      console.warn('⚠️ No user ID found, loading all files')
      // Load all files if no user ID (fallback)
      files.value = await resumeFilesAPI.getAll()
    }
  } catch (error) {
    console.error('Failed to load files:', error)
  } finally {
    loading.value = false
  }
}

// Delete a file
const deleteFile = async (fileId) => {
  if (!confirm('Are you sure you want to delete this file?')) return
  try {
    await resumeFilesAPI.delete(fileId)
    await loadFiles()
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('Failed to delete. Please try again.')
  }
}

// Format date for display
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US')
}
</script>
