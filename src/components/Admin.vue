<template>
  <div class="admin-container">
    <h2>Pending User Approvals</h2>

    <div v-if="loading" class="status">Loading users...</div>
    <div v-else-if="users.length === 0" class="status">✅ No users waiting for approval.</div>

    <ul v-else class="user-list">
      <li v-for="user in users" :key="user.id" class="user-card">
        <div class="user-info">
          <strong>{{ user.username }}</strong>
          <span>({{ user.email }})</span>
        </div>
        <button @click="approveUser(user.id)" class="approve-btn">
          ✅ Approve
        </button>
      </li>
    </ul>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthToken } from '@/utils/auth'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const token = getAuthToken()
const API_BASE_URL = 'http://localhost:8080'

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/unapproved-users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    users.value = response.data
  } catch (err) {
    console.error("Error fetching users", err)
    error.value = "❌ Unauthorized or failed to fetch users"
  } finally {
    loading.value = false
  }
}

const approveUser = async (userId) => {
  try {
    await axios.post(`${API_BASE_URL}/api/admin/approve/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    users.value = users.value.filter(user => user.id !== userId)
    alert("✅ User approved!")
  } catch (err) {
    console.error("Approval failed", err)
    alert("❌ Could not approve user")
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.admin-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fefefe;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
}

.status {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 10px;
}

.user-list {
  list-style: none;
  padding: 0;
}

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #ddd;
  padding: 15px 20px;
  margin-bottom: 15px;
  border-radius: 8px;
}

.user-info {
  font-size: 1rem;
  color: #333;
}

.approve-btn {
  padding: 8px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.approve-btn:hover {
  background-color: #218838;
}

.error {
  color: red;
  margin-top: 15px;
  font-weight: 500;
}
</style>
