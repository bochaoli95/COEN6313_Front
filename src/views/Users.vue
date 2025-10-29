<template>
  <div class="users">
    <div class="card">
      <!-- Page title -->
      <h2 style="margin-bottom: 20px; color: #ececf1;">User Management</h2>

      <!-- Loading state -->
      <div v-if="loading" class="loading">Loading...</div>
      
      <!-- Empty state -->
      <div v-else-if="users.length === 0" class="empty-state">
        <h3>No Users</h3>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.username || '-' }}</td>
              <td>
                <span class="badge badge-info">{{ user.role || 'user' }}</span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button @click="viewUser(user)" class="btn btn-secondary" style="margin-right: 10px;">View</button>
                <button @click="deleteUser(user.id)" class="btn btn-danger">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
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

// Load users on component mount
onMounted(() => {
  loadUsers()
})

// Fetch all users from API
const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await usersAPI.getAll()
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

// View user details
const viewUser = (user) => {
  alert(`User Details:\nID: ${user.id}\nEmail: ${user.email}\nUsername: ${user.username || 'Not set'}\nRole: ${user.role || 'user'}`)
}

// Delete a user
const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  try {
    await usersAPI.delete(id)
    await loadUsers()
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
