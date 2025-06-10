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
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="card-title mb-0">All Customer Accounts</h5>
              <div class="d-flex gap-2 align-items-center">
                <span class="badge bg-info">{{ totalAccounts }} total accounts</span>
                <button class="btn btn-primary" @click="showCreateAccountModal">
                  <i class="bi bi-plus-circle"></i> Create Account
                </button>
              </div>
            </div>
            
            <!-- Search and Filters -->
            <div class="row mb-3">
              <div class="col-md-3">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by IBAN or owner name"
                    v-model="accountFilters.search"
                    @input="filterAccounts"
                  >
                  <button class="btn btn-outline-secondary" @click="clearAccountSearch">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
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
              <div class="col-md-2">
                <select class="form-select" v-model="accountPageSize" @change="changeAccountPageSize">
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
              <div class="col-md-3 text-end">
                <button class="btn btn-outline-secondary" @click="clearAccountFilters">
                  <i class="bi bi-arrow-clockwise"></i> Reset Filters
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingAccounts" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">Loading accounts...</p>
            </div>

            <!-- Accounts Table -->
            <div v-else class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-light">
                  <tr>
                    <th scope="col">
                      <button class="btn btn-link p-0 text-decoration-none" @click="sortAccounts('iban')">
                        IBAN 
                        <i class="bi" :class="getSortIcon('iban')"></i>
                      </button>
                    </th>
                    <th scope="col">Type</th>
                    <th scope="col">
                      <button class="btn btn-link p-0 text-decoration-none" @click="sortAccounts('owner.name')">
                        Owner 
                        <i class="bi" :class="getSortIcon('owner.name')"></i>
                      </button>
                    </th>
                    <th scope="col">
                      <button class="btn btn-link p-0 text-decoration-none" @click="sortAccounts('balance')">
                        Balance 
                        <i class="bi" :class="getSortIcon('balance')"></i>
                      </button>
                    </th>
                    <th scope="col">Absolute Limit</th>
                    <th scope="col">Daily Limit</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="account in paginatedAccounts" :key="account.id">
                    <td class="font-monospace">{{ account.iban }}</td>
                    <td>
                      <span :class="['badge', account.type === 'CHECKING' ? 'bg-primary' : 'bg-warning']">
                        {{ account.type }}
                      </span>
                    </td>
                    <td class="fw-semibold">{{ account.owner?.name || 'Unknown' }}</td>
                    <td class="fw-bold text-success">€{{ account.balance?.toFixed(2) }}</td>
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

            <!-- Account Pagination -->
            <div v-if="filteredAccounts.length > 0" class="d-flex justify-content-between align-items-center mt-4">
              <div class="text-muted">
                Showing {{ accountStartIndex + 1 }} to {{ accountEndIndex }} of {{ filteredAccounts.length }} accounts
              </div>
              <nav aria-label="Account pagination">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: accountCurrentPage === 0 }">
                    <button class="page-link" @click="changeAccountPage(accountCurrentPage - 1)" :disabled="accountCurrentPage === 0">
                      <i class="bi bi-chevron-left"></i> Previous
                    </button>
                  </li>
                  
                  <li v-for="page in accountVisiblePages" :key="page" class="page-item" :class="{ active: page - 1 === accountCurrentPage }">
                    <button class="page-link" @click="changeAccountPage(page - 1)">
                      {{ page }}
                    </button>
                  </li>
                  
                  <li class="page-item" :class="{ disabled: accountCurrentPage >= accountTotalPages - 1 }">
                    <button class="page-link" @click="changeAccountPage(accountCurrentPage + 1)" :disabled="accountCurrentPage >= accountTotalPages - 1">
                      Next <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- No Results Message -->
            <div v-if="filteredAccounts.length === 0 && !loadingAccounts" class="text-center py-4">
              <i class="bi bi-bank display-4 text-muted"></i>
              <p class="text-muted mt-2">No accounts found matching your criteria.</p>
              <button class="btn btn-outline-primary" @click="clearAccountFilters">
                <i class="bi bi-arrow-clockwise"></i> Reset Filters
              </button>
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
                <div class="position-relative">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by IBAN or name" 
                    v-model="fromAccountSearch"
                    @input="filterFromAccounts"
                    @focus="showFromAccountDropdown = true"
                    @blur="setTimeout(() => { showFromAccountDropdown = false }, 200)"
                    required
                  >
                  <div v-if="showFromAccountDropdown && filteredFromAccounts.length > 0" class="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-2 z-3" style="max-height: 300px; overflow-y: auto;">
                    <div 
                      v-for="account in filteredFromAccounts" 
                      :key="account.id" 
                      class="p-2 border-bottom account-item"
                      @mousedown="selectFromAccount(account)"
                    >
                      <div class="fw-bold">{{ account.iban }}</div>
                      <div class="small text-muted">{{ account.owner?.name }} - €{{ account.balance?.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div v-if="adminTransfer.fromIban" class="mt-1 small text-success">
                    Selected: {{ adminTransfer.fromIban }}
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">To Account</label>
                <div class="position-relative">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search by IBAN or name" 
                    v-model="toAccountSearch"
                    @input="filterToAccounts"
                    @focus="showToAccountDropdown = true"
                    @blur="setTimeout(() => { showToAccountDropdown = false }, 200)"
                    required
                  >
                  <div v-if="showToAccountDropdown && filteredToAccounts.length > 0" class="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-2 z-3" style="max-height: 300px; overflow-y: auto;">
                    <div 
                      v-for="account in filteredToAccounts" 
                      :key="account.id" 
                      class="p-2 border-bottom account-item"
                      @mousedown="selectToAccount(account)"
                    >
                      <div class="fw-bold">{{ account.iban }}</div>
                      <div class="small text-muted">{{ account.owner?.name }}</div>
                    </div>
                  </div>
                  <div v-if="adminTransfer.toIban" class="mt-1 small text-success">
                    Selected: {{ adminTransfer.toIban }}
                  </div>
                </div>
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
                <div class="mb-2 position-relative">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search account by IBAN or name" 
                    v-model="depositAccountSearch"
                    @input="filterDepositAccounts"
                    @focus="showDepositAccountDropdown = true"
                    @blur="setTimeout(() => { showDepositAccountDropdown = false }, 200)"
                  >
                  <div v-if="showDepositAccountDropdown && filteredDepositAccounts.length > 0" class="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-2 z-3" style="max-height: 250px; overflow-y: auto;">
                    <div 
                      v-for="account in filteredDepositAccounts" 
                      :key="account.id" 
                      class="p-2 border-bottom account-item"
                      @mousedown="selectDepositAccount(account)"
                    >
                      <div class="fw-bold">{{ account.iban }}</div>
                      <div class="small text-muted">{{ account.owner?.name }} - €{{ account.balance?.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div v-if="quickDeposit.iban" class="mt-1 small text-success">
                    Selected: {{ quickDeposit.iban }}
                  </div>
                </div>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="quickDeposit.amount" 
                    class="form-control"
                    placeholder="Amount"
                    step="0.01"
                  >
                  <button class="btn btn-success" @click="performQuickDeposit" :disabled="depositLoading || !quickDeposit.iban">
                    <i class="bi bi-plus-circle"></i> Deposit
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <h6>Quick Withdrawal</h6>
                <div class="mb-2 position-relative">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Search account by IBAN or name" 
                    v-model="withdrawAccountSearch"
                    @input="filterWithdrawAccounts"
                    @focus="showWithdrawAccountDropdown = true"
                    @blur="setTimeout(() => { showWithdrawAccountDropdown = false }, 200)"
                  >
                  <div v-if="showWithdrawAccountDropdown && filteredWithdrawAccounts.length > 0" class="position-absolute w-100 mt-1 shadow-sm bg-white border rounded-2 z-3" style="max-height: 250px; overflow-y: auto;">
                    <div 
                      v-for="account in filteredWithdrawAccounts" 
                      :key="account.id" 
                      class="p-2 border-bottom account-item"
                      @mousedown="selectWithdrawAccount(account)"
                    >
                      <div class="fw-bold">{{ account.iban }}</div>
                      <div class="small text-muted">{{ account.owner?.name }} - €{{ account.balance?.toFixed(2) }}</div>
                    </div>
                  </div>
                  <div v-if="quickWithdraw.iban" class="mt-1 small text-success">
                    Selected: {{ quickWithdraw.iban }}
                  </div>
                </div>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="quickWithdraw.amount" 
                    class="form-control"
                    placeholder="Amount"
                    step="0.01"
                  >
                  <button class="btn btn-warning" @click="performQuickWithdraw" :disabled="withdrawLoading || !quickWithdraw.iban">
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
            <h5 class="modal-title">Account Details - {{ selectedAccount.iban }}</h5>
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
            
            <!-- Account Limits Section -->
            <div class="mt-4" v-if="selectedAccount.active">
              <h6>Account Limits</h6>
              <div v-if="selectedAccountLimits" class="p-3 bg-light rounded mb-3">
                <div class="row">
                  <div class="col-md-6">
                    <p class="mb-1"><strong>Absolute Limit:</strong> €{{ selectedAccountLimits.absoluteLimit?.toFixed(2) }}</p>
                    <p class="mb-1"><strong>Daily Limit:</strong> €{{ selectedAccountLimits.dailyLimit?.toFixed(2) }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-1"><strong>Daily Spent Today:</strong> €{{ selectedAccountLimits.dailySpent?.toFixed(2) }}</p>
                    <p class="mb-1"><strong>Remaining Today:</strong> €{{ selectedAccountLimits.remainingDailyLimit?.toFixed(2) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Edit Limits Form -->
              <form @submit.prevent="updateAccountLimitsFromModal" class="row g-3">
                <div class="col-md-5">
                  <label class="form-label">Absolute Limit (€)</label>
                  <input 
                    type="number" 
                    v-model.number="modalLimitForm.absoluteLimit" 
                    class="form-control"
                    step="0.01"
                    min="0"
                    :placeholder="selectedAccountLimits?.absoluteLimit?.toFixed(2) || '0.00'"
                  >
                </div>
                <div class="col-md-5">
                  <label class="form-label">Daily Limit (€)</label>
                  <input 
                    type="number" 
                    v-model.number="modalLimitForm.dailyLimit" 
                    class="form-control"
                    step="0.01"
                    min="0"
                    :placeholder="selectedAccountLimits?.dailyLimit?.toFixed(2) || '1000.00'"
                  >
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button type="submit" class="btn btn-primary w-100" :disabled="limitLoading">
                    <span v-if="limitLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Update
                  </button>
                </div>
              </form>
            </div>
            
            <h6 class="mt-4">Recent Transactions</h6>
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

// Account pagination
const accountCurrentPage = ref(0)
const accountPageSize = ref(10)
const accountSortField = ref('iban')
const accountSortDirection = ref('asc')
const loadingAccounts = ref(false)

// Search functionality for accounts
const fromAccountSearch = ref('')
const toAccountSearch = ref('')
const depositAccountSearch = ref('')
const withdrawAccountSearch = ref('')
const filteredFromAccounts = ref([])
const filteredToAccounts = ref([])
const filteredDepositAccounts = ref([])
const filteredWithdrawAccounts = ref([])
const showFromAccountDropdown = ref(false)
const showToAccountDropdown = ref(false)
const showDepositAccountDropdown = ref(false)
const showWithdrawAccountDropdown = ref(false)

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

const modalLimitForm = ref({
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

// Account pagination computed properties
const totalAccounts = computed(() => allAccounts.value.length)

const accountTotalPages = computed(() => {
  return Math.ceil(filteredAccounts.value.length / accountPageSize.value)
})

const accountStartIndex = computed(() => {
  return accountCurrentPage.value * accountPageSize.value
})

const accountEndIndex = computed(() => {
  return Math.min(accountStartIndex.value + accountPageSize.value, filteredAccounts.value.length)
})

const paginatedAccounts = computed(() => {
  const start = accountStartIndex.value
  const end = accountEndIndex.value
  return filteredAccounts.value.slice(start, end)
})

const accountVisiblePages = computed(() => {
  const pages = []
  const totalPages = accountTotalPages.value
  const current = accountCurrentPage.value
  
  // Show up to 5 page numbers
  let startPage = Math.max(0, current - 2)
  let endPage = Math.min(totalPages - 1, startPage + 4)
  
  // Adjust start if we're near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(0, endPage - 4)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i + 1)
  }
  
  return pages
})

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

// Account pagination methods
const filterAccounts = () => {
  let result = [...allAccounts.value]

  // Apply search filter
  if (accountFilters.value.search) {
    const search = accountFilters.value.search.toLowerCase()
    result = result.filter(account => 
      account.iban?.toLowerCase().includes(search) ||
      account.owner?.name?.toLowerCase().includes(search) ||
      account.owner?.email?.toLowerCase().includes(search)
    )
  }

  // Apply type filter
  if (accountFilters.value.type) {
    result = result.filter(account => account.type === accountFilters.value.type)
  }

  // Apply status filter
  if (accountFilters.value.status) {
    const isActive = accountFilters.value.status === 'active'
    result = result.filter(account => account.active === isActive)
  }

  // Apply sorting
  result.sort((a, b) => {
    let aValue, bValue
    
    if (accountSortField.value === 'owner.name') {
      aValue = a.owner?.name || ''
      bValue = b.owner?.name || ''
    } else if (accountSortField.value === 'balance') {
      aValue = a.balance || 0
      bValue = b.balance || 0
      // For numeric sorting
      if (accountSortDirection.value === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    } else {
      aValue = a[accountSortField.value] || ''
      bValue = b[accountSortField.value] || ''
    }
    
    if (accountSortDirection.value === 'asc') {
      return aValue.toString().localeCompare(bValue.toString())
    } else {
      return bValue.toString().localeCompare(aValue.toString())
    }
  })

  filteredAccounts.value = result
  
  // Reset to first page if current page is beyond the new total
  if (accountCurrentPage.value >= accountTotalPages.value) {
    accountCurrentPage.value = 0
  }
}

const clearAccountSearch = () => {
  accountFilters.value.search = ''
  filterAccounts()
}

const clearAccountFilters = () => {
  accountFilters.value = {
    search: '',
    type: '',
    status: ''
  }
  accountCurrentPage.value = 0
  filterAccounts()
}

const sortAccounts = (field) => {
  if (accountSortField.value === field) {
    accountSortDirection.value = accountSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    accountSortField.value = field
    accountSortDirection.value = 'asc'
  }
  filterAccounts()
}

const getSortIcon = (field) => {
  if (accountSortField.value !== field) {
    return 'bi-chevron-expand'
  }
  return accountSortDirection.value === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'
}

const changeAccountPage = (page) => {
  if (page >= 0 && page < accountTotalPages.value) {
    accountCurrentPage.value = page
  }
}

const changeAccountPageSize = () => {
  accountCurrentPage.value = 0
  filterAccounts()
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
  loadingAccounts.value = true
  try {
    const response = await axios.get(API_ENDPOINTS.admin.accounts, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    allAccounts.value = response.data
    filterAccounts()
  } catch (error) {
    showMessage('Failed to fetch accounts', 'error')
  } finally {
    loadingAccounts.value = false
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

const filterFromAccounts = () => {
  if (!fromAccountSearch.value.trim()) {
    filteredFromAccounts.value = []
    return
  }
  
  const search = fromAccountSearch.value.toLowerCase()
  filteredFromAccounts.value = allAccounts.value.filter(account => 
    account.iban?.toLowerCase().includes(search) || 
    account.owner?.name?.toLowerCase().includes(search)
  ).slice(0, 10)
}

const filterToAccounts = () => {
  if (!toAccountSearch.value.trim()) {
    filteredToAccounts.value = []
    return
  }
  
  const search = toAccountSearch.value.toLowerCase()
  filteredToAccounts.value = allAccounts.value.filter(account => 
    account.iban?.toLowerCase().includes(search) || 
    account.owner?.name?.toLowerCase().includes(search)
  ).slice(0, 10)
}

const selectFromAccount = (account) => {
  adminTransfer.value.fromIban = account.iban
  fromAccountSearch.value = `${account.iban} - ${account.owner?.name || 'Unknown'}`
  showFromAccountDropdown.value = false
}

const selectToAccount = (account) => {
  adminTransfer.value.toIban = account.iban
  toAccountSearch.value = `${account.iban} - ${account.owner?.name || 'Unknown'}`
  showToAccountDropdown.value = false
}

const filterDepositAccounts = () => {
  if (!depositAccountSearch.value.trim()) {
    filteredDepositAccounts.value = []
    return
  }
  
  const search = depositAccountSearch.value.toLowerCase()
  filteredDepositAccounts.value = allAccounts.value.filter(account => 
    account.iban?.toLowerCase().includes(search) || 
    account.owner?.name?.toLowerCase().includes(search)
  ).slice(0, 10)
}

const filterWithdrawAccounts = () => {
  if (!withdrawAccountSearch.value.trim()) {
    filteredWithdrawAccounts.value = []
    return
  }
  
  const search = withdrawAccountSearch.value.toLowerCase()
  filteredWithdrawAccounts.value = allAccounts.value.filter(account => 
    account.iban?.toLowerCase().includes(search) || 
    account.owner?.name?.toLowerCase().includes(search)
  ).slice(0, 10)
}

const selectDepositAccount = (account) => {
  quickDeposit.value.iban = account.iban
  depositAccountSearch.value = `${account.iban} - ${account.owner?.name || 'Unknown'}`
  showDepositAccountDropdown.value = false
}

const selectWithdrawAccount = (account) => {
  quickWithdraw.value.iban = account.iban
  withdrawAccountSearch.value = `${account.iban} - ${account.owner?.name || 'Unknown'}`
  showWithdrawAccountDropdown.value = false
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
  // Reset modal limit form
  modalLimitForm.value = {
    absoluteLimit: '',
    dailyLimit: ''
  }
  
  try {
    // Fetch account transactions
    const response = await axios.get(API_ENDPOINTS.admin.accountTransactions(account.id), {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    accountTransactions.value = response.data
    
    // Fetch account limits
    await fetchAccountLimits(account.iban)
  } catch (error) {
    accountTransactions.value = []
  }
  accountDetailsModal.show()
}

const viewAccountTransactions = (account) => {
  // Navigate to account details view which includes transactions
  viewAccountDetails(account)
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
      fromAccountSearch.value = ''
      toAccountSearch.value = ''
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
      depositAccountSearch.value = ''
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
      withdrawAccountSearch.value = ''
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

const updateAccountLimitsFromModal = async () => {
  if (!selectedAccount.value) return
  
  limitLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('iban', selectedAccount.value.iban)
    if (modalLimitForm.value.absoluteLimit !== '') {
      params.append('absoluteLimit', modalLimitForm.value.absoluteLimit)
    }
    if (modalLimitForm.value.dailyLimit !== '') {
      params.append('dailyLimit', modalLimitForm.value.dailyLimit)
    }

    const response = await axios.post(`${API_ENDPOINTS.accounts.updateLimits}?${params}`, {}, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      await fetchAllAccounts()
      await fetchAccountLimits(selectedAccount.value.iban)
      modalLimitForm.value = { absoluteLimit: '', dailyLimit: '' }
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    showMessage(error.response?.data?.message || 'Failed to update limits', 'error')
  } finally {
    limitLoading.value = false
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

.account-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.account-item:hover {
  background-color: #f5f5f5;
}

.z-3 {
  z-index: 1030;
}

/* Account pagination styles */
.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  color: #0d6efd;
  border-color: #dee2e6;
  padding: 0.375rem 0.75rem;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
}

.btn-link {
  border: none !important;
  color: #212529;
  text-decoration: none;
}

.btn-link:hover {
  color: #0d6efd;
}

/* Table sorting icons */
.bi-chevron-expand {
  opacity: 0.5;
}

.bi-chevron-up,
.bi-chevron-down {
  opacity: 1;
}

/* Account search and filter styling */
.input-group .btn {
  border-left: 0;
}

.input-group .form-control:not(:last-child) {
  border-right: 0;
}

/* Loading and empty states */
.spinner-border {
  width: 2rem;
  height: 2rem;
}

.display-4 {
  font-size: 3rem;
  opacity: 0.3;
}

/* Responsive pagination */
@media (max-width: 768px) {
  .pagination .page-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .pagination .page-item:not(.active):not(:first-child):not(:last-child) {
    display: none;
  }
}

/* Enhanced table styling */
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.fw-semibold {
  font-weight: 600;
}

.font-monospace {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.9em;
}

/* Modal enhancements */
.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

/* Badge styling */
.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-warning {
  background-color: #ffc107 !important;
  color: #000;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-primary {
  background-color: #0d6efd !important;
}

/* Search input enhancements */
.form-control:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.text-muted {
  font-size: 0.875rem;
}
</style>