<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Dashboard</h1>
    
    <div class="row">
      <!-- User Approvals Card -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-person-check me-2"></i>User Approvals
            </h5>
            <p class="card-text">Review and approve new user registrations.</p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div v-if="loadingApprovals" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <span class="badge bg-primary rounded-pill mb-2">
                {{ pendingApprovals }} pending request(s)
              </span>
              <div class="d-grid">
                
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Account Management Card -->
      <div class="col-md-6 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-bank me-2"></i>Account Management
            </h5>
            <p class="card-text">View all customer accounts, transaction history, and manage account status.</p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-grid">
              <router-link to="/admin/accounts" class="btn btn-outline-primary">
                Manage Accounts
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- System Stats Card -->
      
    </div>
    
    <!-- User Approval Section (existing functionality) -->
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Pending User Approvals</h5>
      </div>
      <div class="card-body">
        <div v-if="loadingApprovals" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading users...</span>
          </div>
        </div>
        <div v-else-if="users.length === 0" class="alert alert-success">
          <i class="bi bi-check-circle me-2"></i>No users waiting for approval.
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>BSN</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.bsnNumber }}</td>
                  <td>
                    <button @click="approveUser(user.id)" class="btn btn-sm btn-success">
                      <i class="bi bi-check-circle me-1"></i>Approve
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthToken } from '@/utils/auth'

export default {
  setup() {
    const users = ref([])
    const loadingApprovals = ref(true)
    const error = ref(null)
    const pendingApprovals = ref(0)

    const API_BASE_URL = 'http://localhost:8080'

    const fetchUsers = async () => {
      loadingApprovals.value = true
      error.value = null
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/unapproved-users`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        users.value = response.data
        pendingApprovals.value = response.data.length
      } catch (err) {
        console.error("Error fetching users", err)
        error.value = "❌ Unauthorized or failed to fetch users"
      } finally {
        loadingApprovals.value = false
      }
    }

    const approveUser = async (userId) => {
      try {
        await axios.post(`${API_BASE_URL}/api/admin/approve/${userId}`, {}, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        users.value = users.value.filter(user => user.id !== userId)
        pendingApprovals.value = users.value.length
        
        // Show success alert
        alert("✅ User approved successfully!")
      } catch (err) {
        console.error("Approval failed", err)
        error.value = "❌ Could not approve user: " + (err.response?.data || "Unknown error")
      }
    }

    onMounted(fetchUsers)

    return {
      users,
      loadingApprovals,
      error,
      pendingApprovals,
      approveUser
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  border-radius: 10px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.card-title {
  font-weight: 600;
  color: #333;
}

.card-text {
  color: #6c757d;
}

h1 {
  font-weight: 700;
  color: #333;
}

.card-footer {
  background-color: transparent;
  padding: 1rem;
}
</style>