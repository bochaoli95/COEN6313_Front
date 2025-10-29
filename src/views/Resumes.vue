<template>
  <div class="resumes">
    <div class="card">
      <!-- Header with title and upload button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ececf1;">Resume Management</h2>
        <div style="display:flex; gap:10px;">
          <button @click="goChat" class="btn btn-secondary">Open AI Assistant</button>
          <button @click="showUploadModal = true" class="btn btn-primary">Upload Resume</button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading...</div>
      
      <!-- Empty state -->
      <div v-else-if="resumes.length === 0" class="empty-state">
        <h3>No Resumes</h3>
        <p>Upload your first resume to get started</p>
      </div>
      
      <!-- Resumes table -->
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Source</th>
              <th>Upload Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="resume in resumes" :key="resume.id">
              <td>{{ resume.filename }}</td>
              <td>
                <span class="badge" :class="resume.source === 'ai' ? 'badge-info' : 'badge-success'">
                  {{ resume.source === 'ai' ? 'AI' : 'User' }}
                </span>
              </td>
              <td>{{ formatDate(resume.uploaded_at) }}</td>
              <td>
                <button @click="viewResume(resume)" class="btn btn-secondary" style="margin-right: 10px;">View</button>
                <button @click="deleteResume(resume.id)" class="btn btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Upload modal -->
    <div v-if="showUploadModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="max-width: 500px; width: 90%;">
        <h3 style="margin-bottom: 20px; color: #ececf1;">Upload Resume</h3>
        <form @submit.prevent="handleUpload">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Select File</label>
            <input type="file" @change="handleFileChange" class="input" accept=".pdf,.doc,.docx" required />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Job Link (Optional)</label>
            <input v-model="uploadData.job_link" type="url" class="input" placeholder="https://..." />
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary" :disabled="uploading">
              {{ uploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button type="button" @click="showUploadModal = false" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View resume modal -->
    <div v-if="selectedResume" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="color: #ececf1;">{{ selectedResume.filename }}</h3>
          <button @click="selectedResume = null" class="btn btn-secondary">Close</button>
        </div>
        <pre style="white-space: pre-wrap; background: #2d2e3a; padding: 20px; border-radius: 6px; max-height: 500px; overflow-y: auto; color: #ececf1;">{{ selectedResume.content }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { resumesAPI } from '../services/api'
import { useAuthStore } from '../stores/auth'

// Store and reactive state
const authStore = useAuthStore()
const router = useRouter()
const resumes = ref([])
const loading = ref(false)
const showUploadModal = ref(false)
const selectedResume = ref(null)
const uploading = ref(false)
const uploadData = ref({
  file: null,
  job_link: ''
})

// Load resumes on component mount
onMounted(() => {
  loadResumes()
})

// Fetch resumes from API
const loadResumes = async () => {
  loading.value = true
  try {
    // Get user ID using the store getter (handles all ID formats)
    const userId = authStore.userId
    if (userId) {
      console.log('📄 Loading resumes for user:', userId)
      // Load user-specific resumes
      resumes.value = await resumesAPI.getByUserId(userId)
    } else {
      console.warn('⚠️ No user ID found, loading all resumes')
      // Load all resumes if no user ID (fallback)
      resumes.value = await resumesAPI.getAll()
    }
  } catch (error) {
    console.error('Failed to load resumes:', error)
  } finally {
    loading.value = false
  }
}

// Handle file selection
const handleFileChange = (e) => {
  uploadData.value.file = e.target.files[0]
}

// Handle resume upload
const handleUpload = async () => {
  if (!uploadData.value.file) return
  
  uploading.value = true
  const formData = new FormData()
  formData.append('file', uploadData.value.file)
  if (uploadData.value.job_link) {
    formData.append('job_link', uploadData.value.job_link)
  }

  try {
    await resumesAPI.upload(formData)
    showUploadModal.value = false
    uploadData.value = { file: null, job_link: '' }
    await loadResumes()
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Upload failed. Please try again.')
  } finally {
    uploading.value = false
  }
}

// View resume content
const viewResume = (resume) => {
  selectedResume.value = resume
}

// Delete resume
const deleteResume = async (id) => {
  if (!confirm('Are you sure you want to delete this resume?')) return
  try {
    await resumesAPI.delete(id)
    await loadResumes()
  } catch (error) {
    console.error('Delete failed:', error)
    alert('Delete failed. Please try again.')
  }
}

// Format date for display
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US')
}

// Navigate to Chat page to start optimization
const goChat = () => {
  router.push('/chat')
}
</script>
