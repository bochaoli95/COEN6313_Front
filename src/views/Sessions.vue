<template>
  <div class="sessions">
    <div class="card">
      <!-- Header with title and create button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ececf1;">Session List</h2>
        <button @click="createSession" class="btn btn-primary">New Session</button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading...</div>
      
      <!-- Empty state -->
      <div v-else-if="sessions.length === 0" class="empty-state">
        <h3>No Sessions</h3>
        <p>Create a new session to start chatting with AI</p>
      </div>
      
      <!-- Sessions grid -->
      <div v-else>
        <div class="grid">
          <div v-for="session in sessions" :key="session.session_id" class="card">
            <div style="margin-bottom: 10px;">
              <h3 
                v-if="editingSessionId !== session.session_id"
                @click="startEditSession(session.session_id, session.title)"
                style="color: #ececf1; cursor: text; display: inline-block;"
                title="Click to edit"
              >
                {{ session.title || 'Untitled Session' }}
              </h3>
              <input
                v-else
                v-model="editingTitle"
                @blur="saveSessionTitle(session.session_id)"
                @keyup.enter="saveSessionTitle(session.session_id)"
                @keyup.esc="cancelEditSession"
                style="width: 100%; padding: 8px; background: #40414f; border: 1px solid #565869; border-radius: 4px; color: #ececf1; font-size: 16px; font-weight: bold;"
                autofocus
              />
            </div>
            <p style="color: #9ca3af; margin-bottom: 10px; font-size: 14px;">
              Created: {{ formatDate(session.created_at) }}
            </p>
            <p style="color: #9ca3af; margin-bottom: 10px; font-size: 14px;">
              Messages: {{ session.messages?.length || 0 }}
            </p>
            <div style="display: flex; gap: 10px;">
              <router-link :to="`/studio/${session.session_id}`" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                Enter
              </router-link>
              <button @click="deleteSession(session.session_id)" class="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sessionAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

// Router and store setup
const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const sessions = ref([])
const loading = ref(false)
const editingSessionId = ref(null)
const editingTitle = ref('')

// Load sessions on component mount
onMounted(() => {
  loadSessions()
})

// Fetch user sessions from API
const loadSessions = async () => {
  const userId = authStore.userId
  if (!userId) return
  loading.value = true
  try {
    sessions.value = await sessionAPI.getAllByUserId(userId)
  } catch (error) {
    console.error('Failed to load sessions:', error)
  } finally {
    loading.value = false
  }
}

// Create a new session
const createSession = async () => {
  const userId = authStore.userId
  if (!userId) return
  try {
    const sessionData = {
      session_id: `session_${Date.now()}`,
      user_id: userId,
      title: null,
      messages: []
    }
    const newSession = await sessionAPI.create(sessionData)
    router.push(`/chat/${newSession.session_id}`)
  } catch (error) {
    console.error('Failed to create session:', error)
    alert('Failed to create session. Please try again.')
  }
}

// Delete a session
const deleteSession = async (sessionId) => {
  if (!confirm('Are you sure you want to delete this session?')) return
  try {
    await sessionAPI.delete(sessionId)
    await loadSessions()
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

// Edit session title
const startEditSession = (id, currentTitle) => {
  editingSessionId.value = id
  editingTitle.value = currentTitle || ''
}

const cancelEditSession = () => {
  editingSessionId.value = null
  editingTitle.value = ''
}

const saveSessionTitle = async (sessionId) => {
  if (!editingTitle.value.trim()) {
    cancelEditSession()
    return
  }
  
  try {
    await sessionAPI.updateTitle(sessionId, editingTitle.value.trim())
    await loadSessions()
    cancelEditSession()
  } catch (error) {
    console.error('Failed to update session title:', error)
    alert('Failed to update session title. Please try again.')
    cancelEditSession()
  }
}
</script>
