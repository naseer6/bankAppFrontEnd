<template>
  <div class="container-fluid py-4 px-3 px-lg-4">
    <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
      <h1 class="mb-0">
        <i class="bi bi-wallet2 text-primary"></i> My Accounts
      </h1>
      <div class="text-center text-lg-end">
        <h6 class="text-muted mb-1">Total Balance</h6>
        <h2 class="text-primary fw-bold mb-0">€{{ totalBalance.toFixed(2) }}</h2>
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
      <div class="row g-3 g-lg-4 mb-5">
        <div v-for="account in accounts" :key="account.id" class="col-12 col-lg-6">
          <div class="account-card" :class="{ 'checking': account.type === 'CHECKING', 'savings': account.type === 'SAVINGS' }">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <h4 class="card-title h5 mb-2">
                    {{ account.type === 'CHECKING' ? '🏦 Checking Account' : '💰 Savings Account' }}
                  </h4>
                  <p class="text-muted mb-0 small">{{ account.iban }}</p>
                </div>
                <span :class="['badge', 'fs-6', account.type === 'CHECKING' ? 'bg-primary' : 'bg-warning']">
                  {{ account.type }}
                </span>
              </div>

              <div class="balance-section mb-4 text-center text-lg-start">
                <h3 class="balance mb-1">€{{ account.balance.toFixed(2) }}</h3>
                <small class="text-muted">Available Balance</small>
              </div>

              <!-- Account Limits -->
              <div class="limits-section mb-4">
                <h6 class="text-muted mb-3">Account Limits</h6>
                <div class="row g-2 g-lg-3">
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
                  <div class="d-flex justify-content-between mb-2">
                    <small class="text-muted">Daily Transfer Limit</small>
                    <small class="fw-semibold">€{{ account.remainingDailyLimit.toFixed(2) }} / €{{ account.dailyLimit.toFixed(2) }}</small>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div 
                      class="progress-bar"
                      :class="getDailyLimitClass(account)"
                      :style="{ width: getDailyLimitPercentage(account) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="d-flex flex-wrap gap-2">
                <router-link 
                  :to="{ path: '/transfers', query: { account: account.iban } }"
                  class="btn btn-primary btn-sm flex-fill flex-lg-grow-0"
                  v-if="account.type === 'CHECKING'"
                >
                  <i class="bi bi-send"></i> Transfer
                </router-link>
                <router-link 
                  :to="{ path: '/transactions', query: { iban: account.iban } }"
                  class="btn btn-outline-primary btn-sm flex-fill flex-lg-grow-0"
                >
                  <i class="bi bi-clock-history"></i> History
                </router-link>
                <button 
                  @click="showAccountDetails(account)"
                  class="btn btn-outline-secondary btn-sm flex-fill flex-lg-grow-0"
                >
                  <i class="bi bi-info-circle"></i> Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity 
      <div class="card">
        <div class="card-header bg-white border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
          <h5 class="mb-0">
            <i class="bi bi-clock-history text-primary me-2"></i>Recent Activity
          </h5>
          <router-link to="/transactions" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-arrow-right"></i> View All
          </router-link>
        </div>
        <div class="card-body p-0">
          <div v-if="recentTransactions.length === 0" class="text-center py-5 text-muted">
            <i class="bi bi-inbox display-4 mb-3 d-block text-muted opacity-50"></i>
            <p class="mb-0">No recent transactions</p>
          </div>
          <div v-else class="list-group list-group-flush">
            <div 
              v-for="transaction in recentTransactions.slice(0, 5)" 
              :key="transaction.id"
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                  <h6 class="mb-1">{{ transaction.description || transaction.transactionType }}</h6>
                  <small class="text-muted">
                    {{ formatDate(transaction.date || transaction.timestamp) }}
                    <span v-if="transaction.fromIban" class="d-block d-sm-inline"> • From: {{ transaction.fromIban }}</span>
                    <span v-if="transaction.toIban" class="d-block d-sm-inline"> • To: {{ transaction.toIban }}</span>
                  </small>
                </div>
                <div class="text-end ms-3">
                  <span 
                    class="fw-bold fs-6"
                    :class="getTransactionClass(transaction)"
                  >
                    {{ getTransactionSign(transaction) }}€{{ transaction.amount.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <!-- Account Details Modal -->
    <div class="modal fade" id="accountDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" v-if="selectedAccount">
          <div class="modal-header bg-light">
            <h5 class="modal-title">
              <i class="bi bi-info-circle text-primary me-2"></i>Account Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-borderless mb-0">
              <tbody>
                <tr>
                  <td class="text-muted fw-medium">Account Type:</td>
                  <td class="fw-bold">{{ selectedAccount.type }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">IBAN:</td>
                  <td class="fw-bold font-monospace">{{ selectedAccount.iban }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">Current Balance:</td>
                  <td class="fw-bold text-primary">€{{ selectedAccount.balance.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">Absolute Limit:</td>
                  <td class="fw-bold">€{{ selectedAccount.absoluteLimit.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">Daily Transfer Limit:</td>
                  <td class="fw-bold">€{{ selectedAccount.dailyLimit.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">Used Today:</td>
                  <td class="fw-bold">€{{ selectedAccount.dailySpent.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td class="text-muted fw-medium">Status:</td>
                  <td>
                    <span class="badge bg-success">
                      <i class="bi bi-check-circle me-1"></i>Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-lg me-1"></i>Close
            </button>
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
.container-fluid {
  max-width: 1400px;
}

.account-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
}

.account-card.savings::before {
  background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
}

.account-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.balance {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0d6efd;
  margin: 0;
  line-height: 1.2;
}

.limit-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.limit-box:hover {
  transform: translateY(-2px);
}

.limit-label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.limit-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
}

.progress {
  background-color: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  transition: width 0.6s ease;
}

.card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.list-group-item {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
}

.list-group-item:last-child {
  border-bottom: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-sm:hover {
  transform: translateY(-1px);
}

.modal-content {
  border: none;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header, .modal-footer {
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
}

.modal-footer {
  border-radius: 0 0 16px 16px;
}

.modal-body {
  padding: 1.5rem;
}

.table td {
  padding: 0.75rem 0;
  border: none;
  vertical-align: middle;
}

.table td:first-child {
  width: 45%;
}

.font-monospace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
}

.alert {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge {
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .balance {
    font-size: 2rem;
  }
  
  .limit-box {
    padding: 0.75rem;
  }
  
  .card-body {
    padding: 1.5rem !important;
  }
  
  .list-group-item {
    padding: 1rem;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
  
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 576px) {
  .d-flex.gap-2 .btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>