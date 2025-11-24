<template>
  <div class="users">
    <div class="card">
      <!-- Header with title and create button -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ececf1;">User Management Dashboard</h2>
        <button @click="showCreateModal = true" class="btn btn-primary">Create User</button>
      </div>

      <!-- Error message -->
      <div v-if="loadError" class="alert alert-error" style="margin-bottom: 20px;">
        {{ loadError }}
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading...</div>
      
      <!-- Empty state -->
      <div v-else-if="!loadError && users.length === 0" class="empty-state">
        <h3>No Users</h3>
        <p>Create your first user to get started</p>
      </div>
      
      <!-- Users table -->
      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id || user.id">
              <td>{{ user._id || user.id }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.username || '-' }}</td>
              <td>
                <span class="badge" :class="user.role === 'admin' ? 'badge-warning' : 'badge-info'">
                  {{ user.role || 'user' }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ formatDate(user.updated_at) }}</td>
              <td>
                <button @click="viewUser(user)" class="btn btn-secondary" style="margin-right: 10px; padding: 6px 12px; font-size: 12px;">View</button>
                <button @click="editUser(user)" class="btn btn-secondary" style="margin-right: 10px; padding: 6px 12px; font-size: 12px;">Edit</button>
                <button @click="deleteUser(user._id || user.id)" class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="color: #ececf1;">Create New User</h3>
          <button @click="closeCreateModal" class="btn btn-secondary" style="padding: 4px 12px;">✕</button>
        </div>
        <form @submit.prevent="handleCreateUser">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Email *</label>
            <input
              v-model="createForm.email"
              type="email"
              class="input"
              placeholder="user@example.com"
              required
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Username</label>
            <input
              v-model="createForm.username"
              type="text"
              class="input"
              placeholder="username"
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Password *</label>
            <input
              v-model="createForm.password"
              type="password"
              class="input"
              placeholder="Enter password"
              required
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Role</label>
            <select v-model="createForm.role" class="input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div v-if="createError" class="alert alert-error" style="margin-bottom: 20px;">{{ createError }}</div>
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
            <button type="button" @click="closeCreateModal" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal && editingUser" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="color: #ececf1;">Edit User</h3>
          <button @click="closeEditModal" class="btn btn-secondary" style="padding: 4px 12px;">✕</button>
        </div>
        <form @submit.prevent="handleUpdateUser">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Email</label>
            <input
              :value="editingUser.email"
              type="email"
              class="input"
              disabled
              style="opacity: 0.6; cursor: not-allowed;"
            />
            <small style="color: #9ca3af; display: block; margin-top: 4px;">Email cannot be changed</small>
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">Username</label>
            <input
              v-model="editForm.username"
              type="text"
              class="input"
              placeholder="username"
            />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #ececf1;">New Password</label>
            <input
              v-model="editForm.password"
              type="password"
              class="input"
              placeholder="Leave blank to keep current password"
            />
            <small style="color: #9ca3af; display: block; margin-top: 4px;">Leave blank if you don't want to change the password</small>
          </div>
          <div v-if="updateError" class="alert alert-error" style="margin-bottom: 20px;">{{ updateError }}</div>
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn btn-primary" :disabled="updating">
              {{ updating ? 'Updating...' : 'Update User' }}
            </button>
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View User Modal -->
    <div v-if="showViewModal && viewingUser" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000;">
      <div class="card" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="color: #ececf1;">User Details</h3>
          <button @click="closeViewModal" class="btn btn-secondary" style="padding: 4px 12px;">✕</button>
        </div>
        <div style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">User ID</label>
            <div style="color: #ececf1; padding: 8px; background: #2d2e3a; border-radius: 4px; font-family: monospace; word-break: break-all;">
              {{ viewingUser._id || viewingUser.id }}
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">Email</label>
            <div style="color: #ececf1; padding: 8px; background: #2d2e3a; border-radius: 4px;">
              {{ viewingUser.email }}
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">Username</label>
            <div style="color: #ececf1; padding: 8px; background: #2d2e3a; border-radius: 4px;">
              {{ viewingUser.username || '-' }}
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">Role</label>
            <div style="padding: 8px;">
              <span class="badge" :class="viewingUser.role === 'admin' ? 'badge-warning' : 'badge-info'">
                {{ viewingUser.role || 'user' }}
              </span>
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">Created At</label>
            <div style="color: #ececf1; padding: 8px; background: #2d2e3a; border-radius: 4px;">
              {{ formatDate(viewingUser.created_at) }}
            </div>
          </div>
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #9ca3af; font-size: 12px;">Updated At</label>
            <div style="color: #ececf1; padding: 8px; background: #2d2e3a; border-radius: 4px;">
              {{ formatDate(viewingUser.updated_at) }}
            </div>
          </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <button @click="editUser(viewingUser)" class="btn btn-primary">Edit User</button>
          <button @click="closeViewModal" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usersAPI } from '../services/api'

// Reactive state
const users = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const editingUser = ref(null)
const viewingUser = ref(null)
const creating = ref(false)
const updating = ref(false)
const createError = ref('')
const updateError = ref('')
const loadError = ref('')

// Form data
const createForm = ref({
  email: '',
  username: '',
  password: '',
  role: 'user'
})

const editForm = ref({
  username: '',
  password: ''
})

// Load users on component mount
onMounted(() => {
  loadUsers()
})

// Fetch all users from API
const loadUsers = async () => {
  loading.value = true
  loadError.value = ''
  try {
    users.value = await usersAPI.getAll()
  } catch (error) {
    console.error('Failed to load users:', error)
    // Extract detailed error message
    const errorMessage = error.userMessage || 
                        error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to load users. Please try again.'
    loadError.value = errorMessage
  } finally {
    loading.value = false
  }
}

// Create user
const handleCreateUser = async () => {
  creating.value = true
  createError.value = ''
  try {
    await usersAPI.register(createForm.value)
    await loadUsers()
    closeCreateModal()
  } catch (error) {
    console.error('Failed to create user:', error)
    createError.value = error.userMessage || error.response?.data?.detail || error.message || 'Failed to create user. Please try again.'
  } finally {
    creating.value = false
  }
}

// Close create modal
const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = {
    email: '',
    username: '',
    password: '',
    role: 'user'
  }
  createError.value = ''
}

// View user details
const viewUser = async (user) => {
  try {
    const userId = user._id || user.id
    viewingUser.value = await usersAPI.getById(userId)
    showViewModal.value = true
  } catch (error) {
    console.error('Failed to load user details:', error)
    alert('Failed to load user details. Please try again.')
  }
}

// Close view modal
const closeViewModal = () => {
  showViewModal.value = false
  viewingUser.value = null
}

// Edit user
const editUser = (user) => {
  editingUser.value = user
  editForm.value = {
    username: user.username || '',
    password: ''
  }
  showEditModal.value = true
  showViewModal.value = false
}

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  editForm.value = {
    username: '',
    password: ''
  }
  updateError.value = ''
}

// Update user
const handleUpdateUser = async () => {
  updating.value = true
  updateError.value = ''
  try {
    const userId = editingUser.value._id || editingUser.value.id
    const updateData = {}
    
    if (editForm.value.username) {
      updateData.username = editForm.value.username
    }
    
    if (editForm.value.password) {
      updateData.password = editForm.value.password
    }
    
    if (Object.keys(updateData).length === 0) {
      updateError.value = 'Please provide at least one field to update.'
      updating.value = false
      return
    }
    
    await usersAPI.update(userId, updateData)
    await loadUsers()
    closeEditModal()
  } catch (error) {
    console.error('Failed to update user:', error)
    updateError.value = error.userMessage || error.response?.data?.detail || error.message || 'Failed to update user. Please try again.'
  } finally {
    updating.value = false
  }
}

// Delete a user
const deleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
  try {
    await usersAPI.delete(userId)
    await loadUsers()
  } catch (error) {
    console.error('Failed to delete:', error)
    alert('Failed to delete user. Please try again.')
  }
}

// Format date for display
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US')
}
</script>
