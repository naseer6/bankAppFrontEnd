<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">
      <i class="bi bi-shield-lock"></i> Admin Control Center
    </h1>
    
    <!-- Quick Stats -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h5 class="card-title">Pending Approvals</h5>
            <h2 class="mb-0">{{ stats.pendingApprovals }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h5 class="card-title">Active Accounts</h5>
            <h2 class="mb-0">{{ stats.activeAccounts }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <h5 class="card-title">Total Users</h5>
            <h2 class="mb-0">{{ stats.totalUsers }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <h5 class="card-title">Today's Transactions</h5>
            <h2 class="mb-0">{{ stats.todayTransactions }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-bs-toggle="tab" href="#approvals">
          <i class="bi bi-person-check"></i> User Approvals
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#accounts">
          <i class="bi bi-bank"></i> Account Management
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#limits">
          <i class="bi bi-sliders"></i> Limit Controls
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-bs-toggle="tab" href="#transfers">
          <i class="bi bi-arrow-left-right"></i> Admin Transfers
        </a>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- User Approvals Tab -->
      <div class="tab-pane fade show active" id="approvals">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Pending User Approvals</h5>
            <div v-if="loadingApprovals" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="pendingUsers.length === 0" class="alert alert-success">
              <i class="bi bi-check-circle"></i> No users waiting for approval.
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>BSN</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in pendingUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.bsnNumber }}</td>
                    <td>{{ user.phone }}</td>
                    <td>{{ user.address }}</td>
                    <td>
                      <button @click="approveUser(user.id)" class="btn btn-sm btn-success">
                        <i class="bi bi-check-circle"></i> Approve
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Management Tab -->
      <div class="tab-pane fade" id="accounts">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">All Customer Accounts</h5>
            
            <!-- Search and Filters -->
            <div class="row mb-3">
              <div class="col-md-4">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search by IBAN or owner name"
                  v-model="accountFilters.search"
                  @input="filterAccounts"
                >
              </div>
              <div class="col-md-2">
                <select class="form-select" v-model="accountFilters.type" @change="filterAccounts">
                  <option value="">All Types</option>
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select" v-model="accountFilters.status" @change="filterAccounts">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="col-md-4 text-end">
                <button class="btn btn-primary" @click="showCreateAccountModal">
                  <i class="bi bi-plus-circle"></i> Create Account
                </button>
              </div>
            </div>

            <!-- Accounts Table -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>IBAN</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Balance</th>
                    <th>Absolute Limit</th>
                    <th>Daily Limit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="account in filteredAccounts" :key="account.id">
                    <td>{{ account.iban }}</td>
                    <td>
                      <span :class="['badge', account.type === 'CHECKING' ? 'bg-primary' : 'bg-warning']">
                        {{ account.type }}
                      </span>
                    </td>
                    <td>{{ account.owner?.name }}</td>
                    <td class="fw-bold">€{{ account.balance?.toFixed(2) }}</td>
                    <td>€{{ account.absoluteLimit?.toFixed(2) }}</td>
                    <td>€{{ account.dailyLimit?.toFixed(2) }}</td>
                    <td>
                      <span :class="['badge', account.active ? 'bg-success' : 'bg-danger']">
                        {{ account.active ? 'Active' : 'Closed' }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button 
                          @click="viewAccountDetails(account)" 
                          class="btn btn-outline-info"
                          title="View Details"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                        <button 
                          @click="viewAccountTransactions(account)" 
                          class="btn btn-outline-primary"
                          title="View Transactions"
                        >
                          <i class="bi bi-list"></i>
                        </button>
                        <button 
                          v-if="account.active && account.balance === 0"
                          @click="closeAccount(account)" 
                          class="btn btn-outline-danger"
                          title="Close Account"
                        >
                          <i class="bi bi-x-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Limit Controls Tab -->
      <div class="tab-pane fade" id="limits">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Account Limit Management</h5>
            
            <form @submit.prevent="updateAccountLimits" class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Select Account</label>
                <select v-model="limitForm.iban" class="form-select" required>
                  <option value="">Choose account...</option>
                  <option v-for="account in allAccounts" :key="account.id" :value="account.iban">
                    {{ account.iban }} - {{ account.owner?.name }} ({{ account.type }})
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Absolute Limit (€)</label>
                <input 
                  type="number" 
                  v-model.number="limitForm.absoluteLimit" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="Min balance"
                >
              </div>
              <div class="col-md-3">
                <label class="form-label">Daily Limit (€)</label>
                <input 
                  type="number" 
                  v-model.number="limitForm.dailyLimit" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="Max daily transfer"
                >
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-primary w-100" :disabled="limitLoading">
                  <span v-if="limitLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Update Limits
                </button>
              </div>
            </form>

            <!-- Current Limits Display -->
            <div v-if="selectedAccountLimits" class="mt-4 p-3 bg-light rounded">
              <h6>Current Limits for {{ limitForm.iban }}</h6>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Absolute Limit:</strong> €{{ selectedAccountLimits.absoluteLimit?.toFixed(2) }}</p>
                  <p><strong>Daily Limit:</strong> €{{ selectedAccountLimits.dailyLimit?.toFixed(2) }}</p>
                </div>
                <div class="col-md-6">
                  <p><strong>Daily Spent Today:</strong> €{{ selectedAccountLimits.dailySpent?.toFixed(2) }}</p>
                  <p><strong>Remaining Today:</strong> €{{ selectedAccountLimits.remainingDailyLimit?.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Transfers Tab -->
      <div class="tab-pane fade" id="transfers">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Admin Transfer (Bypass Limits)</h5>
            
            <form @submit.prevent="performAdminTransfer" class="row g-3">
              <div class="col-md-4">
                <label class="form-label">From Account</label>
                <select v-model="adminTransfer.fromIban" class="form-select" required>
                  <option value="">Select source...</option>
                  <option v-for="account in allAccounts" :key="account.id" :value="account.iban">
                    {{ account.iban }} - {{ account.owner?.name }} (€{{ account.balance?.toFixed(2) }})
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">To Account</label>
                <select v-model="adminTransfer.toIban" class="form-select" required>
                  <option value="">Select destination...</option>
                  <option v-for="account in allAccounts" :key="account.id" :value="account.iban">
                    {{ account.iban }} - {{ account.owner?.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Amount (€)</label>
                <input 
                  type="number" 
                  v-model.number="adminTransfer.amount" 
                  class="form-control"
                  step="0.01"
                  min="0.01"
                  required
                >
              </div>
              <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-danger w-100" :disabled="transferLoading">
                  <span v-if="transferLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Transfer
                </button>
              </div>
            </form>

            <!-- Quick Actions -->
            <div class="row mt-4">
              <div class="col-md-6">
                <h6>Quick Deposit</h6>
                <div class="input-group">
                  <select v-model="quickDeposit.iban" class="form-select">
                    <option value="">Select account...</option>
                    <option v-for="account in allAccounts" :key="account.id" :value="account.iban">
                      {{ account.iban }} - {{ account.owner?.name }}
                    </option>
                  </select>
                  <input 
                    type="number" 
                    v-model.number="quickDeposit.amount" 
                    class="form-control"
                    placeholder="Amount"
                    step="0.01"
                  >
                  <button class="btn btn-success" @click="performQuickDeposit" :disabled="depositLoading">
                    <i class="bi bi-plus-circle"></i> Deposit
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <h6>Quick Withdrawal</h6>
                <div class="input-group">
                  <select v-model="quickWithdraw.iban" class="form-select">
                    <option value="">Select account...</option>
                    <option v-for="account in allAccounts" :key="account.id" :value="account.iban">
                      {{ account.iban }} - {{ account.owner?.name }}
                    </option>
                  </select>
                  <input 
                    type="number" 
                    v-model.number="quickWithdraw.amount" 
                    class="form-control"
                    placeholder="Amount"
                    step="0.01"
                  >
                  <button class="btn btn-warning" @click="performQuickWithdraw" :disabled="withdrawLoading">
                    <i class="bi bi-dash-circle"></i> Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Details Modal -->
    <div class="modal fade" id="accountDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" v-if="selectedAccount">
          <div class="modal-header">
            <h5 class="modal-title">Account Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Account Information</h6>
                <table class="table table-sm">
                  <tr>
                    <td>IBAN:</td>
                    <td class="fw-bold">{{ selectedAccount.iban }}</td>
                  </tr>
                  <tr>
                    <td>Type:</td>
                    <td>{{ selectedAccount.type }}</td>
                  </tr>
                  <tr>
                    <td>Balance:</td>
                    <td class="fw-bold">€{{ selectedAccount.balance?.toFixed(2) }}</td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td>
                      <span :class="['badge', selectedAccount.active ? 'bg-success' : 'bg-danger']">
                        {{ selectedAccount.active ? 'Active' : 'Closed' }}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Owner Information</h6>
                <table class="table table-sm" v-if="selectedAccount.owner">
                  <tr>
                    <td>Name:</td>
                    <td>{{ selectedAccount.owner.name }}</td>
                  </tr>
                  <tr>
                    <td>Email:</td>
                    <td>{{ selectedAccount.owner.email }}</td>
                  </tr>
                  <tr>
                    <td>Phone:</td>
                    <td>{{ selectedAccount.owner.phone }}</td>
                  </tr>
                  <tr>
                    <td>BSN:</td>
                    <td>{{ selectedAccount.owner.bsnNumber }}</td>
                  </tr>
                </table>
              </div>
            </div>
            
            <h6 class="mt-3">Recent Transactions</h6>
            <div v-if="accountTransactions.length > 0" class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in transactionsWithBalance" :key="tx.id">
                    <td>{{ formatDateTime(tx.timestamp) }}</td>
                    <td>{{ tx.transactionType }}</td>
                    <td :class="tx.fromAccount?.id === selectedAccount.id ? 'text-danger' : 'text-success'">
                      {{ tx.fromAccount?.id === selectedAccount.id ? '-' : '+' }}€{{ tx.amount?.toFixed(2) }}
                    </td>
                    <td class="fw-bold">€{{ tx.balanceAfter?.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="alert alert-info">
              No recent transactions
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div class="modal fade" id="createAccountModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createAccount">
              <div class="mb-3">
                <label class="form-label">Select User</label>
                <select v-model="newAccount.userId" class="form-select" required>
                  <option value="">Choose user...</option>
                  <option v-for="user in approvedUsers" :key="user.id" :value="user.id">
                    {{ user.name }} ({{ user.username }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Absolute Limit (€)</label>
                <input 
                  type="number" 
                  v-model.number="newAccount.absoluteLimit" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Daily Limit (€)</label>
                <input 
                  type="number" 
                  v-model.number="newAccount.dailyLimit" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="1000.00"
                >
              </div>
              <button type="submit" class="btn btn-primary" :disabled="createLoading">
                <span v-if="createLoading" class="spinner-border spinner-border-sm me-2"></span>
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="['alert', 'alert-dismissible', 'fade', 'show', 'position-fixed', 'bottom-0', 'end-0', 'm-3', messageType === 'success' ? 'alert-success' : 'alert-danger']" style="z-index: 9999;">
      {{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { getAuthToken } from '@/utils/auth'
import { API_ENDPOINTS } from '@/config'

// Reactive data
const stats = ref({
  pendingApprovals: 0,
  activeAccounts: 0,
  totalUsers: 0,
  todayTransactions: 0
})

const pendingUsers = ref([])
const allAccounts = ref([])
const filteredAccounts = ref([])
const approvedUsers = ref([])
const accountTransactions = ref([])
const selectedAccount = ref(null)
const selectedAccountLimits = ref(null)

const loadingApprovals = ref(false)
const limitLoading = ref(false)
const transferLoading = ref(false)
const depositLoading = ref(false)
const withdrawLoading = ref(false)
const createLoading = ref(false)

const message = ref('')
const messageType = ref('success')

// Forms
const limitForm = ref({
  iban: '',
  absoluteLimit: '',
  dailyLimit: ''
})

const adminTransfer = ref({
  fromIban: '',
  toIban: '',
  amount: ''
})

const quickDeposit = ref({
  iban: '',
  amount: ''
})

const quickWithdraw = ref({
  iban: '',
  amount: ''
})

const newAccount = ref({
  userId: '',
  absoluteLimit: 0,
  dailyLimit: 1000
})

const accountFilters = ref({
  search: '',
  type: '',
  status: ''
})

// Bootstrap modal instances
let accountDetailsModal = null
let createAccountModal = null

// Watch for limit form changes
watch(() => limitForm.value.iban, async (newIban) => {
  if (newIban) {
    await fetchAccountLimits(newIban)
  } else {
    selectedAccountLimits.value = null
  }
})

// Computed properties
const transactionsWithBalance = computed(() => {
  if (!selectedAccount.value || !accountTransactions.value.length) return []
  
  let currentBalance = selectedAccount.value.balance
  const transactions = [...accountTransactions.value].slice(0, 5).reverse()
  
  return transactions.map(tx => {
    const isOutgoing = tx.fromAccount?.id === selectedAccount.value.id
    const balanceAfter = currentBalance
    
    // Calculate what the balance was before this transaction
    if (isOutgoing) {
      currentBalance += tx.amount
    } else {
      currentBalance -= tx.amount
    }
    
    return {
      ...tx,
      balanceAfter: balanceAfter
    }
  }).reverse()
})

// Methods
const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.admin.dashboardStats, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const fetchPendingUsers = async () => {
  loadingApprovals.value = true
  try {
    const response = await axios.get(API_ENDPOINTS.admin.unapprovedUsers, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    pendingUsers.value = response.data
    stats.value.pendingApprovals = response.data.length
  } catch (error) {
    showMessage('Failed to fetch pending users', 'error')
  } finally {
    loadingApprovals.value = false
  }
}

const fetchAllAccounts = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.admin.accounts, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    allAccounts.value = response.data
    filterAccounts()
  } catch (error) {
    showMessage('Failed to fetch accounts', 'error')
  }
}

const fetchApprovedUsers = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.admin.unapprovedUsers, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    // This endpoint returns unapproved users, so we need to fetch all users
    // For now, we'll use a workaround by extracting unique users from accounts
    const uniqueUsers = new Map()
    allAccounts.value.forEach(account => {
      if (account.owner && account.owner.approved !== false) {
        uniqueUsers.set(account.owner.id, account.owner)
      }
    })
    approvedUsers.value = Array.from(uniqueUsers.values())
  } catch (error) {
    console.error('Failed to fetch approved users:', error)
  }
}

const fetchAccountLimits = async (iban) => {
  try {
    const response = await axios.get(API_ENDPOINTS.accounts.limits(iban), {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    selectedAccountLimits.value = response.data
  } catch (error) {
    console.error('Failed to fetch account limits:', error)
  }
}

const filterAccounts = () => {
  let result = allAccounts.value

  if (accountFilters.value.search) {
    const search = accountFilters.value.search.toLowerCase()
    result = result.filter(account => 
      account.iban?.toLowerCase().includes(search) ||
      account.owner?.name?.toLowerCase().includes(search)
    )
  }

  if (accountFilters.value.type) {
    result = result.filter(account => account.type === accountFilters.value.type)
  }

  if (accountFilters.value.status) {
    const isActive = accountFilters.value.status === 'active'
    result = result.filter(account => account.active === isActive)
  }

  filteredAccounts.value = result
}

const approveUser = async (userId) => {
  try {
    await axios.post(API_ENDPOINTS.admin.approve(userId), {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    showMessage('User approved and accounts created successfully', 'success')
    await fetchPendingUsers()
    await fetchAllAccounts()
    await fetchDashboardStats()
  } catch (error) {
    showMessage('Failed to approve user', 'error')
  }
}

const viewAccountDetails = async (account) => {
  selectedAccount.value = account
  try {
    const response = await axios.get(API_ENDPOINTS.admin.accountTransactions(account.id), {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    accountTransactions.value = response.data
  } catch (error) {
    accountTransactions.value = []
  }
  accountDetailsModal.show()
}

const closeAccount = async (account) => {
  if (!confirm(`Are you sure you want to close account ${account.iban}?`)) return
  
  try {
    await axios.post(API_ENDPOINTS.admin.closeAccount(account.id), {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    showMessage('Account closed successfully', 'success')
    await fetchAllAccounts()
  } catch (error) {
    showMessage('Failed to close account', 'error')
  }
}

const updateAccountLimits = async () => {
  limitLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('iban', limitForm.value.iban)
    if (limitForm.value.absoluteLimit !== '') {
      params.append('absoluteLimit', limitForm.value.absoluteLimit)
    }
    if (limitForm.value.dailyLimit !== '') {
      params.append('dailyLimit', limitForm.value.dailyLimit)
    }

    const response = await axios.post(`${API_ENDPOINTS.accounts.updateLimits}?${params}`, {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      await fetchAllAccounts()
      limitForm.value = { iban: '', absoluteLimit: '', dailyLimit: '' }
      selectedAccountLimits.value = null
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    showMessage(error.response?.data?.message || 'Failed to update limits', 'error')
  } finally {
    limitLoading.value = false
  }
}

const performAdminTransfer = async () => {
  transferLoading.value = true
  try {
    const response = await axios.post(API_ENDPOINTS.transactions.admin, {
      fromIban: adminTransfer.value.fromIban,
      toIban: adminTransfer.value.toIban,
      amount: adminTransfer.value.amount
    }, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      adminTransfer.value = { fromIban: '', toIban: '', amount: '' }
      await fetchAllAccounts()
      await fetchDashboardStats()
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    showMessage(error.response?.data?.message || 'Transfer failed', 'error')
  } finally {
    transferLoading.value = false
  }
}

const performQuickDeposit = async () => {
  if (!quickDeposit.value.iban || !quickDeposit.value.amount) {
    showMessage('Please select account and enter amount', 'error')
    return
  }

  depositLoading.value = true
  try {
    const response = await axios.post(API_ENDPOINTS.transactions.deposit, {
      iban: quickDeposit.value.iban,
      amount: quickDeposit.value.amount
    }, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      quickDeposit.value = { iban: '', amount: '' }
      await fetchAllAccounts()
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    showMessage(error.response?.data?.message || 'Deposit failed', 'error')
  } finally {
    depositLoading.value = false
  }
}

const performQuickWithdraw = async () => {
  if (!quickWithdraw.value.iban || !quickWithdraw.value.amount) {
    showMessage('Please select account and enter amount', 'error')
    return
  }

  withdrawLoading.value = true
  try {
    const response = await axios.post(API_ENDPOINTS.transactions.withdraw, {
      iban: quickWithdraw.value.iban,
      amount: quickWithdraw.value.amount
    }, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      quickWithdraw.value = { iban: '', amount: '' }
      await fetchAllAccounts()
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    showMessage(error.response?.data?.message || 'Withdrawal failed', 'error')
  } finally {
    withdrawLoading.value = false
  }
}

const showCreateAccountModal = () => {
  newAccount.value = { userId: '', absoluteLimit: 0, dailyLimit: 1000 }
  createAccountModal.show()
}

const createAccount = async () => {
  createLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('userId', newAccount.value.userId)
    params.append('absoluteLimit', newAccount.value.absoluteLimit)
    params.append('dailyLimit', newAccount.value.dailyLimit)

    const response = await axios.post(`${API_ENDPOINTS.accounts.create}?${params}`, {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    showMessage('Account created successfully', 'success')
    createAccountModal.hide()
    await fetchAllAccounts()
    await fetchDashboardStats()
  } catch (error) {
    showMessage(error.response?.data || 'Failed to create account', 'error')
  } finally {
    createLoading.value = false
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(async () => {
  // Initialize Bootstrap modals
  accountDetailsModal = new bootstrap.Modal(document.getElementById('accountDetailsModal'))
  createAccountModal = new bootstrap.Modal(document.getElementById('createAccountModal'))

  // Fetch initial data
  await fetchDashboardStats()
  await fetchPendingUsers()
  await fetchAllAccounts()
  await fetchApprovedUsers()
})
</script>

<style scoped>
.nav-tabs .nav-link {
  color: #495057;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  font-weight: 600;
}

.table th {
  font-weight: 600;
  background-color: #f8f9fa;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.badge {
  font-weight: 500;
}

.input-group .form-select,
.input-group .form-control {
  border-radius: 0;
}

.input-group .form-select:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.input-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.alert {
  max-width: 400px;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}
</style>