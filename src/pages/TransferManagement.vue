<template>
  <div class="transfer-management">
    <h1 class="mb-4">
      <i class="bi bi-arrow-left-right"></i> Transfer Management
    </h1>

    <!-- Only show to non-admin users -->
    <div v-if="!isAdmin">
      <!-- Internal Transfer Section (Between Your Own Accounts) -->
      <div class="card p-4 shadow-sm mb-4 border-success">
        <h4 class="mb-3 text-success">🔄 Transfer Between Your Accounts</h4>
        <div class="alert alert-success alert-sm mb-3">
          <small><i class="bi bi-info-circle me-1"></i> 
          Internal transfers between your own accounts bypass the checking account restriction and have more flexible limits.
          </small>
        </div>
        <form @submit.prevent="performInternalTransfer">
          <div class="row g-3">
            <div class="col-md-5">
              <label class="form-label">From Account</label>
              <select v-model="internalTransferForm.fromIban" class="form-select" required>
                <option value="">Select source account</option>
                <option 
                  v-for="account in userAccounts" 
                  :key="account.id" 
                  :value="account.iban"
                  :disabled="account.iban === internalTransferForm.toIban"
                >
                  {{ account.iban }} ({{ account.type }}) - €{{ account.balance.toFixed(2) }}
                </option>
              </select>
            </div>
            <div class="col-md-2 d-flex align-items-end justify-content-center">
              <button 
                type="button" 
                class="btn btn-outline-success btn-sm"
                @click="swapInternalAccounts"
                :disabled="!internalTransferForm.fromIban || !internalTransferForm.toIban"
                title="Swap accounts"
              >
                <i class="bi bi-arrow-left-right"></i>
              </button>
            </div>
            <div class="col-md-5">
              <label class="form-label">To Account</label>
              <select v-model="internalTransferForm.toIban" class="form-select" required>
                <option value="">Select destination account</option>
                <option 
                  v-for="account in userAccounts" 
                  :key="account.id" 
                  :value="account.iban"
                  :disabled="account.iban === internalTransferForm.fromIban"
                >
                  {{ account.iban }} ({{ account.type }}) - €{{ account.balance.toFixed(2) }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">Amount (€)</label>
              <input 
                type="number" 
                v-model.number="internalTransferForm.amount" 
                class="form-control" 
                step="0.01" 
                min="0.01"
                :max="getMaxTransferAmount(internalTransferForm.fromIban)"
                required 
              />
              <div v-if="internalTransferForm.fromIban" class="form-text">
                Available: €{{ getAccountBalance(internalTransferForm.fromIban)?.toFixed(2) }}
              </div>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button 
                type="submit" 
                class="btn btn-success" 
                :disabled="internalTransferLoading || !isValidInternalTransfer"
              >
                <span v-if="internalTransferLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ internalTransferLoading ? 'Processing...' : '🔄 Transfer' }}
              </button>
            </div>
          </div>
        </form>
        
        <!-- Quick Amount Buttons -->
        <div v-if="internalTransferForm.fromIban" class="mt-3">
          <small class="text-muted d-block mb-2">Quick amounts:</small>
          <div class="btn-group" role="group">
            <button 
              v-for="amount in getQuickAmounts(internalTransferForm.fromIban)" 
              :key="amount"
              type="button" 
              class="btn btn-outline-success btn-sm"
              @click="internalTransferForm.amount = amount"
            >
              €{{ amount }}
            </button>
          </div>
        </div>
      </div>

      <!-- Transfer Funds Section -->
      <div class="card p-4 shadow-sm mb-4">
        <h4 class="mb-3">💸 Transfer Funds</h4>
        <form @submit.prevent="performTransfer">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">From Account (IBAN)</label>
              <select v-model="transferForm.fromIban" class="form-select" required>
                <option value="">Select your account</option>
                <option 
                  v-for="account in userAccounts.filter(acc => acc.type === 'CHECKING')" 
                  :key="account.id" 
                  :value="account.iban"
                >
                  {{ account.iban }} ({{ account.type }}) - €{{ account.balance.toFixed(2) }}
                </option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label">To Account (IBAN)</label>
              <input 
                type="text" 
                v-model="transferForm.toIban" 
                class="form-control" 
                placeholder="Enter destination IBAN"
                required 
              />
            </div>
            
            <!-- New Account Search Section -->
            <div class="col-12 mt-2">
              <div class="card border-light">
                <div class="card-body p-3">
                  <h6 class="card-title mb-3">🔍 Find Account by Name or IBAN</h6>
                  <div class="input-group">
                    <input 
                      type="text" 
                      v-model="searchTerm" 
                      class="form-control" 
                      placeholder="Enter customer name"
                      @keyup.enter="searchAccounts"
                    />
                    <button 
                      type="button" 
                      class="btn btn-outline-primary" 
                      @click="searchAccounts"
                    >
                      <i class="bi bi-search me-1"></i> Search
                    </button>
                  </div>
                  <div v-if="isSearching" class="mt-2 text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Searching...</span>
                    </div>
                    <span class="ms-2">Searching...</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <label class="form-label">Amount (€)</label>
              <input 
                type="number" 
                v-model.number="transferForm.amount" 
                class="form-control" 
                step="0.01" 
                min="0.01"
                required 
              />
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <button type="submit" class="btn btn-primary" :disabled="transferLoading">
                <span v-if="transferLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ transferLoading ? 'Processing...' : '💸 Transfer Funds' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Transfer Limits Info -->
        <div v-if="selectedAccountLimits" class="alert alert-info mt-3">
          <h6>Account Limits for {{ transferForm.fromIban }}:</h6>
          <div class="row">
            <div class="col-md-6">
              <small><strong>Available Balance:</strong> €{{ selectedAccountLimits.availableBalance?.toFixed(2) }}</small><br>
              <small><strong>Absolute Limit:</strong> €{{ selectedAccountLimits.absoluteLimit?.toFixed(2) }}</small>
            </div>
            <div class="col-md-6">
              <small><strong>Daily Limit:</strong> €{{ selectedAccountLimits.dailyLimit?.toFixed(2) }}</small><br>
              <small><strong>Remaining Today:</strong> €{{ selectedAccountLimits.remainingDailyLimit?.toFixed(2) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Account Search Results -->
    <div v-if="searchResults.length > 0" class="card p-4 shadow-sm mb-4 border-primary">
      <h5 class="card-title d-flex align-items-center mb-3">
        <i class="bi bi-person-lines-fill me-2"></i> 
        Account Search Results
        <span class="badge bg-primary ms-2">{{ searchResults.length }} found</span>
      </h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>Customer Name</th>
              <th>IBAN</th>
              <th>Account Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in searchResults" :key="result.iban">
              <td>{{ result.ownerName }}</td>
              <td><code>{{ result.iban }}</code></td>
              <td><span class="badge bg-info">{{ result.accountType }}</span></td>
              <td>
                <button 
                  class="btn btn-sm btn-success"
                  @click="selectDestinationAccount(result.iban)"
                >
                  <i class="bi bi-check-circle me-1"></i> Select
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions for Own Accounts
    <div class="card p-4 shadow-sm mb-4">
      <h4 class="mb-3">🏦 Quick Actions</h4>
      <div class="row g-3">
        <div class="col-md-6">
          <h6>Deposit</h6>
          <div class="input-group">
            <select v-model="quickActions.depositIban" class="form-select">
              <option value="">Select account</option>
              <option v-for="account in userAccounts" :key="account.id" :value="account.iban">
                {{ account.iban }} ({{ account.type }})
              </option>
            </select>
            <input 
              type="number" 
              v-model.number="quickActions.depositAmount" 
              class="form-control" 
              placeholder="Amount"
              step="0.01"
            />
            <button class="btn btn-success" @click="makeDeposit" :disabled="actionLoading">
              💰 Deposit
            </button>
          </div>
        </div>
        <div class="col-md-6">
          <h6>Withdraw</h6>
          <div class="input-group">
            <select v-model="quickActions.withdrawIban" class="form-select">
              <option value="">Select account</option>
              <option v-for="account in userAccounts" :key="account.id" :value="account.iban">
                {{ account.iban }} ({{ account.type }})
              </option>
            </select>
            <input 
              type="number" 
              v-model.number="quickActions.withdrawAmount" 
              class="form-control" 
              placeholder="Amount"
              step="0.01"
            />
            <button class="btn btn-warning" @click="makeWithdrawal" :disabled="actionLoading">
              🏧 Withdraw
            </button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Admin Section - Limit Management -->
    <div v-if="isAdmin" class="card p-4 shadow-sm mb-4 border-danger">
      <h4 class="mb-3 text-danger">🛡️ Admin: Manage Account Limits</h4>
      <form @submit.prevent="updateLimits">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Account IBAN</label>
            <input 
              type="text" 
              v-model="limitForm.iban" 
              class="form-control" 
              placeholder="Enter IBAN"
              required 
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Absolute Limit (€)</label>
            <input 
              type="number" 
              v-model.number="limitForm.absoluteLimit" 
              class="form-control" 
              step="0.01"
              placeholder="Minimum balance allowed"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Daily Limit (€)</label>
            <input 
              type="number" 
              v-model.number="limitForm.dailyLimit" 
              class="form-control" 
              step="0.01"
              placeholder="Max daily transfer amount"
            />
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-danger" :disabled="limitLoading">
              <span v-if="limitLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ limitLoading ? 'Updating...' : '🛡️ Update Limits' }}
            </button>
          </div>
        </div>
      </form>

      <!-- Admin Transfer Section -->
      <hr class="my-4">
      <h5 class="text-danger">Admin Transfer (Bypass Limits)</h5>
      <form @submit.prevent="performAdminTransfer">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">From IBAN</label>
            <input 
              type="text" 
              v-model="adminTransferForm.fromIban" 
              class="form-control" 
              placeholder="Source IBAN"
              required 
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">To IBAN</label>
            <input 
              type="text" 
              v-model="adminTransferForm.toIban" 
              class="form-control" 
              placeholder="Destination IBAN"
              required 
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Amount (€)</label>
            <input 
              type="number" 
              v-model.number="adminTransferForm.amount" 
              class="form-control" 
              step="0.01"
              required 
            />
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-outline-danger" :disabled="adminTransferLoading">
              <span v-if="adminTransferLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ adminTransferLoading ? 'Processing...' : '⚡ Admin Transfer' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// Reactive data
const userAccounts = ref([])
const transferForm = ref({
  fromIban: '',
  toIban: '',
  amount: ''
})
const adminTransferForm = ref({
  fromIban: '',
  toIban: '',
  amount: ''
})
const quickActions = ref({
  depositIban: '',
  depositAmount: '',
  withdrawIban: '',
  withdrawAmount: ''
})
const limitForm = ref({
  iban: '',
  absoluteLimit: '',
  dailyLimit: ''
})
const searchResults = ref([])
const selectedAccountLimits = ref(null)
const message = ref('')
const messageType = ref('success')
const transferLoading = ref(false)
const adminTransferLoading = ref(false)
const actionLoading = ref(false)
const limitLoading = ref(false)
const currentUser = ref(null)
// New search-related variables
const searchTerm = ref('')
const isSearching = ref(false)

// New reactive data
const internalTransferForm = ref({
  fromIban: '',
  toIban: '',
  amount: ''
})
const internalTransferLoading = ref(false)

// Computed properties
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
const isValidInternalTransfer = computed(() => {
  return internalTransferForm.value.fromIban && 
         internalTransferForm.value.toIban && 
         internalTransferForm.value.fromIban !== internalTransferForm.value.toIban &&
         internalTransferForm.value.amount > 0
})

// Watch for changes in selected account to fetch limits
watch(() => transferForm.value.fromIban, async (newIban) => {
  if (newIban) {
    await fetchAccountLimits(newIban)
  } else {
    selectedAccountLimits.value = null
  }
})

// Methods
const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/users/me')
    currentUser.value = response.data
  } catch (error) {
    console.error('Failed to fetch current user:', error)
  }
}

const fetchUserAccounts = async () => {
  try {
    if (!currentUser.value) return
    
    const response = await api.get(`/accounts/user/${currentUser.value.id}`)
    userAccounts.value = response.data
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    showMessage('Failed to load your accounts', 'error')
  }
}

const fetchAccountLimits = async (iban) => {
  try {
    const response = await api.get(`/accounts/limits/${iban}`)
    selectedAccountLimits.value = response.data
  } catch (error) {
    console.error('Failed to fetch account limits:', error)
  }
}

const performTransfer = async () => {
  transferLoading.value = true
  try {
    const response = await api.post('/transactions/customer', {
      fromIban: transferForm.value.fromIban,
      toIban: transferForm.value.toIban,
      amount: transferForm.value.amount
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      transferForm.value = { fromIban: '', toIban: '', amount: '' }
      await fetchUserAccounts() // Refresh account data
      selectedAccountLimits.value = null
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Transfer failed'
    showMessage(errorMessage, 'error')
  } finally {
    transferLoading.value = false
  }
}

const performAdminTransfer = async () => {
  adminTransferLoading.value = true
  try {
    const response = await api.post('/transactions/admin', {
      fromIban: adminTransferForm.value.fromIban,
      toIban: adminTransferForm.value.toIban,
      amount: adminTransferForm.value.amount
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      adminTransferForm.value = { fromIban: '', toIban: '', amount: '' }
      await fetchUserAccounts() // Refresh account data
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Admin transfer failed'
    showMessage(errorMessage, 'error')
  } finally {
    adminTransferLoading.value = false
  }
}

const makeDeposit = async () => {
  if (!quickActions.value.depositIban || !quickActions.value.depositAmount) {
    showMessage('Please select an account and enter an amount', 'error')
    return
  }

  actionLoading.value = true
  try {
    const response = await api.post('/transactions/deposit', {
      iban: quickActions.value.depositIban,
      amount: quickActions.value.depositAmount
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      quickActions.value.depositAmount = ''
      await fetchUserAccounts()
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Deposit failed'
    showMessage(errorMessage, 'error')
  } finally {
    actionLoading.value = false
  }
}

const makeWithdrawal = async () => {
  if (!quickActions.value.withdrawIban || !quickActions.value.withdrawAmount) {
    showMessage('Please select an account and enter an amount', 'error')
    return
  }

  actionLoading.value = true
  try {
    const response = await api.post('/transactions/withdraw', {
      iban: quickActions.value.withdrawIban,
      amount: quickActions.value.withdrawAmount
    })

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      quickActions.value.withdrawAmount = ''
      await fetchUserAccounts()
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Withdrawal failed'
    showMessage(errorMessage, 'error')
  } finally {
    actionLoading.value = false
  }
}

// Updated searchAccounts function to use the search input
const searchAccounts = async () => {
  if (!searchTerm.value.trim()) {
    showMessage('Please enter a name to search', 'error')
    return
  }

  isSearching.value = true
  searchResults.value = []
  
  try {
    // Try searching by name
    const response = await api.get(`/accounts/find-by-name?name=${encodeURIComponent(searchTerm.value.trim())}`)
    searchResults.value = response.data
    
    if (searchResults.value.length === 0) {
      showMessage('No accounts found for this name', 'error')
    }
  } catch (error) {
    // If search by name fails, try search by IBAN
    try {
      const ibanResponse = await api.get(`/accounts/search-iban?iban=${encodeURIComponent(searchTerm.value.trim())}`)
      searchResults.value = ibanResponse.data
      
      if (searchResults.value.length === 0) {
        showMessage('No accounts found', 'error')
      }
    } catch (ibanError) {
      showMessage('No accounts found', 'error')
    }
  } finally {
    isSearching.value = false
  }
}

const selectDestinationAccount = (iban) => {
  transferForm.value.toIban = iban
  showMessage(`Selected account: ${iban}`, 'success')
  // Scroll back to the transfer form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateLimits = async () => {
  if (!limitForm.value.iban) {
    showMessage('Please enter an IBAN', 'error')
    return
  }

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

    const response = await api.post(`/accounts/update-limits?${params}`)

    if (response.data.success) {
      showMessage(response.data.message, 'success')
      limitForm.value = { iban: '', absoluteLimit: '', dailyLimit: '' }
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update limits'
    showMessage(errorMessage, 'error')
  } finally {
    limitLoading.value = false
  }
}

const getAccountBalance = (iban) => {
  const account = userAccounts.value.find(acc => acc.iban === iban)
  return account ? account.balance : 0
}

const getMaxTransferAmount = (iban) => {
  const balance = getAccountBalance(iban)
  return balance > 0 ? balance : 0
}

const getQuickAmounts = (iban) => {
  const balance = getAccountBalance(iban)
  const amounts = [10, 25, 50, 100, 250, 500]
  return amounts.filter(amount => amount <= balance).slice(0, 4)
}

const swapInternalAccounts = () => {
  const temp = internalTransferForm.value.fromIban
  internalTransferForm.value.fromIban = internalTransferForm.value.toIban
  internalTransferForm.value.toIban = temp
}

const performInternalTransfer = async () => {
  internalTransferLoading.value = true
  try {
    // Try using admin transfer endpoint for internal transfers to bypass restrictions
    const response = await api.post('/transactions/internal', {
      fromIban: internalTransferForm.value.fromIban,
      toIban: internalTransferForm.value.toIban,
      amount: internalTransferForm.value.amount
    }).catch(async (error) => {
      // Fallback to regular customer endpoint if internal endpoint doesn't exist
      if (error.response?.status === 404) {
        return await api.post('/transactions/customer', {
          fromIban: internalTransferForm.value.fromIban,
          toIban: internalTransferForm.value.toIban,
          amount: internalTransferForm.value.amount
        })
      }
      throw error
    })

    if (response.data.success) {
      showMessage(`Successfully transferred €${internalTransferForm.value.amount.toFixed(2)} between your accounts`, 'success')
      internalTransferForm.value = { fromIban: '', toIban: '', amount: '' }
      await fetchUserAccounts() // Refresh account data
    } else {
      showMessage(response.data.message, 'error')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Internal transfer failed'
    showMessage(errorMessage, 'error')
  } finally {
    internalTransferLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await fetchCurrentUser()
  await fetchUserAccounts()
})
</script>

<style scoped>
.transfer-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  border-radius: 10px;
}

.alert {
  border-radius: 8px;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.input-group .form-control {
  border-radius: 0;
}

.input-group .form-control:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.input-group .btn {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* New styles for search results */
.table-responsive {
  border-radius: 6px;
  overflow: hidden;
}

code {
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 2px 4px;
  border-radius: 3px;
}
</style>