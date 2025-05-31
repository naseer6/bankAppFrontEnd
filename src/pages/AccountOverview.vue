<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>
        <i class="bi bi-wallet2"></i> My Accounts
      </h1>
      <div class="text-end">
        <h5 class="text-muted mb-0">Total Balance</h5>
        <h2 class="text-primary fw-bold">€{{ totalBalance.toFixed(2) }}</h2>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else>
      <!-- User Status Alert -->
      <div v-if="user && !user.approved" class="alert alert-warning mb-4">
        <i class="bi bi-clock"></i> Your account is pending approval. Some features may be limited.
      </div>

      <!-- Account Cards -->
      <div class="row g-4 mb-4">
        <div v-for="account in accounts" :key="account.id" class="col-lg-6">
          <div class="account-card" :class="{ 'checking': account.type === 'CHECKING', 'savings': account.type === 'SAVINGS' }">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 class="card-title">
                    {{ account.type === 'CHECKING' ? '🏦 Checking Account' : '💰 Savings Account' }}
                  </h4>
                  <p class="text-muted mb-1">{{ account.iban }}</p>
                </div>
                <span :class="['badge', account.type === 'CHECKING' ? 'bg-primary' : 'bg-warning']">
                  {{ account.type }}
                </span>
              </div>

              <div class="balance-section mb-4">
                <h3 class="balance">€{{ account.balance.toFixed(2) }}</h3>
                <small class="text-muted">Available Balance</small>
              </div>

              <!-- Account Limits -->
              <div class="limits-section">
                <h6 class="text-muted mb-2">Account Limits</h6>
                <div class="row g-2">
                  <div class="col-6">
                    <div class="limit-box">
                      <div class="limit-label">Minimum Balance</div>
                      <div class="limit-value">€{{ account.absoluteLimit.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="limit-box">
                      <div class="limit-label">Available to Use</div>
                      <div class="limit-value text-success">
                        €{{ Math.max(0, account.balance - account.absoluteLimit).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="account.type === 'CHECKING'" class="mt-3">
                  <div class="d-flex justify-content-between mb-1">
                    <small>Daily Transfer Limit</small>
                    <small>€{{ account.remainingDailyLimit.toFixed(2) }} / €{{ account.dailyLimit.toFixed(2) }}</small>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div 
                      class="progress-bar"
                      :class="getDailyLimitClass(account)"
                      :style="{ width: getDailyLimitPercentage(account) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="mt-4 d-flex gap-2">
                <router-link 
                  :to="{ path: '/transfers', query: { account: account.iban } }"
                  class="btn btn-primary btn-sm"
                  v-if="account.type === 'CHECKING'"
                >
                  <i class="bi bi-send"></i> Transfer
                </router-link>
                <router-link 
                  :to="{ path: '/transactions', query: { iban: account.iban } }"
                  class="btn btn-outline-primary btn-sm"
                >
                  <i class="bi bi-clock-history"></i> History
                </router-link>
                <button 
                  @click="showAccountDetails(account)"
                  class="btn btn-outline-secondary btn-sm"
                >
                  <i class="bi bi-info-circle"></i> Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Recent Activity</h5>
          <router-link to="/transactions" class="btn btn-sm btn-outline-primary">
            View All
          </router-link>
        </div>
        <div class="card-body p-0">
          <div v-if="recentTransactions.length === 0" class="text-center py-4 text-muted">
            No recent transactions
          </div>
          <div v-else class="list-group list-group-flush">
            <div 
              v-for="transaction in recentTransactions.slice(0, 5)" 
              :key="transaction.id"
              class="list-group-item"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ transaction.description || transaction.transactionType }}</h6>
                  <small class="text-muted">
                    {{ formatDate(transaction.date || transaction.timestamp) }}
                    <span v-if="transaction.fromIban"> • From: {{ transaction.fromIban }}</span>
                    <span v-if="transaction.toIban"> • To: {{ transaction.toIban }}</span>
                  </small>
                </div>
                <div class="text-end">
                  <span 
                    class="fw-bold"
                    :class="getTransactionClass(transaction)"
                  >
                    {{ getTransactionSign(transaction) }}€{{ transaction.amount.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Details Modal -->
    <div class="modal fade" id="accountDetailsModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content" v-if="selectedAccount">
          <div class="modal-header">
            <h5 class="modal-title">Account Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Account Type:</td>
                  <td class="fw-bold">{{ selectedAccount.type }}</td>
                </tr>
                <tr>
                  <td class="text-muted">IBAN:</td>
                  <td class="fw-bold">{{ selectedAccount.iban }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Current Balance:</td>
                  <td class="fw-bold text-primary">€{{ selectedAccount.balance.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Absolute Limit:</td>
                  <td class="fw-bold">€{{ selectedAccount.absoluteLimit.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Daily Transfer Limit:</td>
                  <td class="fw-bold">€{{ selectedAccount.dailyLimit.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Used Today:</td>
                  <td class="fw-bold">€{{ selectedAccount.dailySpent.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Status:</td>
                  <td>
                    <span class="badge bg-success">Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()

// Reactive data
const accounts = ref([])
const user = ref(null)
const recentTransactions = ref([])
const selectedAccount = ref(null)
const isLoading = ref(true)
const error = ref(null)

let accountDetailsModal = null

// Computed properties
const totalBalance = computed(() => {
  return accounts.value.reduce((sum, acc) => sum + (acc.balance || 0), 0)
})

// Methods
const fetchData = async () => {
  try {
    // Fetch user info
    const userRes = await api.get('/users/me')
    user.value = userRes.data

    // Fetch accounts
    const accountsRes = await api.get(`/accounts/user/${user.value.id}`)
    accounts.value = accountsRes.data    // Fetch recent transactions
    const transactionsRes = await api.get('/transactions')
    
    // Ensure transactionsRes.data is an array before filtering
    const transactionsData = Array.isArray(transactionsRes.data) ? transactionsRes.data : []
    
    recentTransactions.value = transactionsData
      .filter(tx => {
        // Filter transactions related to user's accounts
        const userIbans = accounts.value.map(acc => acc.iban)
        return userIbans.includes(tx.fromIban) || userIbans.includes(tx.toIban)
      })
      .slice(0, 10)
  } catch (err) {
    console.error(err)
    error.value = err.response?.status === 401 
      ? 'Session expired. Please log in again.' 
      : 'Failed to load account information.'
  } finally {
    isLoading.value = false
  }
}

const getDailyLimitPercentage = (account) => {
  if (!account.dailyLimit) return 0
  const used = account.dailySpent || 0
  return Math.min(100, (used / account.dailyLimit) * 100)
}

const getDailyLimitClass = (account) => {
  const percentage = getDailyLimitPercentage(account)
  if (percentage >= 90) return 'bg-danger'
  if (percentage >= 70) return 'bg-warning'
  return 'bg-success'
}

const getTransactionClass = (transaction) => {
  const userIbans = accounts.value.map(acc => acc.iban)
  
  if (transaction.transactionType === 'WITHDRAWAL' || userIbans.includes(transaction.fromIban)) {
    return 'text-danger'
  }
  return 'text-success'
}

const getTransactionSign = (transaction) => {
  const userIbans = accounts.value.map(acc => acc.iban)
  
  if (transaction.transactionType === 'WITHDRAWAL' || userIbans.includes(transaction.fromIban)) {
    return '-'
  }
  return '+'
}

const showAccountDetails = (account) => {
  selectedAccount.value = account
  accountDetailsModal.show()
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  accountDetailsModal = new bootstrap.Modal(document.getElementById('accountDetailsModal'))
  fetchData()
})
</script>

<style scoped>
.account-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%);
}

.account-card.savings::before {
  background: linear-gradient(90deg, #ffc107 0%, #ffb300 100%);
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.balance {
  font-size: 2rem;
  font-weight: 700;
  color: #0d6efd;
  margin: 0;
}

.limit-box {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.limit-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.limit-value {
  font-size: 1rem;
  font-weight: 600;
}

.progress {
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #f0f0f0;
  padding: 1rem 1.5rem;
}

.list-group-item:last-child {
  border-bottom: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.modal-content {
  border: none;
  border-radius: 12px;
}

.table td:first-child {
  width: 40%;
}

@media (max-width: 992px) {
  .account-card {
    margin-bottom: 1rem;
  }
}
</style>