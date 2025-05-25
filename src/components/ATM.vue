<template>
  <div class="atm-container">
    <div class="atm-header">
      <h2>🏧 SigmaBank ATM</h2>
      <div class="atm-status">
        <span class="status-indicator"></span>
        <span>{{ atmStatus }}</span>
      </div>
    </div>

    <div v-if="!atmToken" class="atm-login">
      <div class="login-screen">
        <h3>🔐 Please Insert Your Card</h3>
        <p class="text-muted">Enter your banking credentials to continue</p>
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label>📧 Email:</label>
            <input v-model="email" type="email" required class="atm-input" />
          </div>
          <div class="form-group">
            <label>🔒 PIN/Password:</label>
            <input v-model="password" type="password" required class="atm-input" />
          </div>
          <button type="submit" class="atm-btn atm-btn-primary" :disabled="loginLoading">
            <span v-if="loginLoading" class="spinner"></span>
            {{ loginLoading ? 'Authenticating...' : 'Insert Card' }}
          </button>
        </form>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>

    <div v-else-if="user" class="atm-main">
      <div class="atm-screen">
        <div class="user-welcome">
          <h3>Welcome, {{ user.name }}</h3>
          <p class="account-status">
            <span v-if="user.approved" class="status-approved">✅ Account Active</span>
            <span v-else class="status-pending">⏳ Account Pending</span>
          </p>
        </div>

        <!-- Account Selection -->
        <div v-if="!selectedAccount" class="account-selection">
          <h4>Select Account</h4>
          <div class="account-grid">
            <button 
              v-for="account in userAccounts" 
              :key="account.id"
              @click="selectAccount(account)"
              class="account-card"
            >
              <div class="account-type">
                {{ account.type === 'CHECKING' ? '🏦 Checking' : '💰 Savings' }}
              </div>
              <div class="account-iban">{{ account.iban }}</div>
              <div class="account-balance">€{{ account.balance.toFixed(2) }}</div>
              <div class="account-limits">
                <small>Available: €{{ Math.max(0, account.balance - (account.absoluteLimit || 0)).toFixed(2) }}</small>
                <br>
                <small v-if="account.type === 'CHECKING'">
                  Daily Remaining: €{{ (account.remainingDailyLimit || 0).toFixed(2) }}
                </small>
              </div>
            </button>
          </div>
        </div>

        <!-- Main ATM Functions -->
        <div v-else class="atm-functions">
          <div class="selected-account-info">
            <h4>{{ selectedAccount.type === 'CHECKING' ? '🏦 Checking Account' : '💰 Savings Account' }}</h4>
            <p><strong>IBAN:</strong> {{ selectedAccount.iban }}</p>
            <p><strong>Balance:</strong> €{{ selectedAccount.balance.toFixed(2) }}</p>
            
            <!-- Account Limits Display -->
            <div class="limits-display">
              <div class="limit-item">
                <span>Available to Withdraw:</span>
                <span class="limit-value">€{{ availableWithdraw.toFixed(2) }}</span>
              </div>
              <div class="limit-item" v-if="selectedAccount.type === 'CHECKING'">
                <span>Daily Limit Remaining:</span>
                <span class="limit-value">€{{ (selectedAccount.remainingDailyLimit || 0).toFixed(2) }}</span>
              </div>
              <div class="limit-item">
                <span>ATM Withdrawal Limit:</span>
                <span class="limit-value">€500 per transaction</span>
              </div>
            </div>
          </div>

          <!-- Transaction Options -->
          <div class="transaction-options">
            <div class="option-section">
              <h5>💰 Quick Cash</h5>
              <div class="quick-amounts">
                <button 
                  v-for="amount in quickAmounts" 
                  :key="amount"
                  @click="quickWithdraw(amount)"
                  :disabled="!canWithdraw(amount) || transactionLoading"
                  class="quick-amount-btn"
                  :class="{ 'disabled': !canWithdraw(amount) }"
                >
                  €{{ amount }}
                </button>
              </div>
            </div>

            <div class="option-section">
              <h5>🏧 Custom Transaction</h5>
              <div class="custom-transaction">
                <div class="transaction-type-selector">
                  <button 
                    @click="transactionType = 'withdraw'"
                    :class="['type-btn', { 'active': transactionType === 'withdraw' }]"
                  >
                    Withdraw
                  </button>
                  <button 
                    @click="transactionType = 'deposit'"
                    :class="['type-btn', { 'active': transactionType === 'deposit' }]"
                  >
                    Deposit
                  </button>
                  <button 
                    v-if="selectedAccount.type === 'CHECKING'"
                    @click="transactionType = 'transfer'"
                    :class="['type-btn', { 'active': transactionType === 'transfer' }]"
                  >
                    Transfer
                  </button>
                </div>

                <div class="transaction-form">
                  <div class="form-group">
                    <label>Amount (€):</label>
                    <input 
                      v-model.number="customAmount" 
                      type="number" 
                      step="10" 
                      min="10"
                      class="atm-input"
                      :max="getMaxAmount()"
                      placeholder="Enter amount (€10 increments)"
                    />
                    <small class="text-muted">
                      {{ transactionType === 'withdraw' ? 'Max: €500' : 
                         transactionType === 'deposit' ? 'Max: €2,000' : 
                         'Max: €1,000' }} per transaction
                    </small>
                  </div>
                  
                  <div v-if="transactionType === 'transfer'" class="form-group">
                    <label>To IBAN:</label>
                    <input 
                      v-model="transferToIban" 
                      type="text" 
                      class="atm-input"
                      placeholder="Enter destination IBAN"
                    />
                    <button 
                      type="button" 
                      @click="showAccountSearch = true"
                      class="search-btn"
                    >
                      🔍 Search
                    </button>
                  </div>

                  <button 
                    @click="performCustomTransaction"
                    :disabled="!isValidTransaction || transactionLoading"
                    class="atm-btn atm-btn-success"
                  >
                    <span v-if="transactionLoading" class="spinner"></span>
                    {{ transactionLoading ? 'Processing...' : `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} €${customAmount || 0}` }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Recent Transactions -->
            <div class="option-section">
              <h5>📋 Recent Transactions</h5>
              <div class="recent-transactions">
                <div v-if="recentTransactions.length === 0" class="no-transactions">
                  No recent transactions
                </div>
                <div 
                  v-else
                  v-for="transaction in recentTransactions.slice(0, 3)" 
                  :key="transaction.id"
                  class="transaction-item"
                >
                  <div class="transaction-info">
                    <span class="transaction-type">{{ transaction.description }}</span>
                    <span class="transaction-amount">€{{ transaction.amount.toFixed(2) }}</span>
                  </div>
                  <div class="transaction-date">{{ formatDate(transaction.date) }}</div>
                </div>
                <button @click="viewAllTransactions" class="view-all-btn">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="atm-actions">
            <button @click="selectedAccount = null" class="atm-btn atm-btn-secondary">
              ← Back to Accounts
            </button>
            <button @click="logout" class="atm-btn atm-btn-danger">
              🚪 Exit ATM
            </button>
          </div>
        </div>
      </div>

      <!-- Account Search Modal -->
      <div v-if="showAccountSearch" class="search-modal">
        <div class="search-modal-content">
          <h4>🔍 Find Account</h4>
          <div class="search-form">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Enter name or IBAN"
              class="atm-input"
            />
            <button @click="searchAccounts" class="atm-btn atm-btn-primary">Search</button>
          </div>
          
          <div v-if="searchResults.length > 0" class="search-results">
            <div 
              v-for="result in searchResults" 
              :key="result.iban"
              @click="selectSearchResult(result.iban)"
              class="search-result-item"
            >
              {{ result.iban }} - {{ result.ownerName }}
            </div>
          </div>

          <div class="search-modal-actions">
            <button @click="showAccountSearch = false" class="atm-btn atm-btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="message" :class="['atm-message', messageType === 'success' ? 'success' : 'error']">
        {{ message }}
      </div>
    </div>

    <div v-else class="loading-screen">
      <div class="spinner-large"></div>
      <p>Loading your account information...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { setAuthToken } from "@/utils/auth"

const email = ref('')
const password = ref('')
const user = ref(null)
const atmToken = ref(localStorage.getItem('atmToken') || null)
const userAccounts = ref([])
const selectedAccount = ref(null)
const customAmount = ref(0)
const transferToIban = ref('')
const transactionType = ref('withdraw')
const recentTransactions = ref([])
const searchResults = ref([])
const showAccountSearch = ref(false)
const searchQuery = ref('')
const error = ref(null)
const message = ref(null)
const messageType = ref('success')
const loginLoading = ref(false)
const transactionLoading = ref(false)
const atmStatus = ref('Online')

const API = 'http://localhost:8080'
const quickAmounts = [10, 20, 50, 100, 200, 500]

// Computed properties
const availableWithdraw = computed(() => {
  if (!selectedAccount.value) return 0
  const balanceLimit = selectedAccount.value.balance - (selectedAccount.value.absoluteLimit || 0)
  const dailyLimit = selectedAccount.value.remainingDailyLimit || selectedAccount.value.dailyLimit || 0
  const atmLimit = 500 // ATM per-transaction limit
  
  if (selectedAccount.value.type === 'SAVINGS') {
    return Math.max(0, Math.min(balanceLimit, atmLimit))
  }
  
  return Math.max(0, Math.min(balanceLimit, dailyLimit, atmLimit))
})

const isValidTransaction = computed(() => {
  if (!customAmount.value || customAmount.value <= 0) return false
  
  // Check ATM denomination (€10 increments)
  if (customAmount.value % 10 !== 0) return false
  
  if (transactionType.value === 'withdraw') {
    return customAmount.value <= availableWithdraw.value && customAmount.value <= 500
  }
  
  if (transactionType.value === 'deposit') {
    return customAmount.value <= 2000 // ATM deposit limit
  }
  
  if (transactionType.value === 'transfer') {
    return customAmount.value <= availableWithdraw.value && 
           customAmount.value <= 1000 && // ATM transfer limit
           transferToIban.value
  }
  
  return false
})

// Methods
const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = null
  }, 5000)
}

const getMaxAmount = () => {
  switch (transactionType.value) {
    case 'withdraw': return Math.min(availableWithdraw.value, 500)
    case 'deposit': return 2000
    case 'transfer': return Math.min(availableWithdraw.value, 1000)
    default: return 0
  }
}

const login = async () => {
  loginLoading.value = true
  error.value = null
  
  try {
    const res = await axios.post(`${API}/api/users/login`, {
      email: email.value,
      password: password.value
    })

    atmToken.value = res.data.token
    localStorage.setItem('atmToken', atmToken.value)
    setAuthToken(atmToken.value)
    
    await fetchUser()
    await checkATMStatus()
    showMessage('Welcome to SigmaBank ATM!', 'success')
  } catch (err) {
    error.value = '❌ Invalid credentials or login failed'
    console.error(err)
  } finally {
    loginLoading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('atmToken')
  atmToken.value = null
  user.value = null
  selectedAccount.value = null
  userAccounts.value = []
  customAmount.value = 0
  transferToIban.value = ''
  message.value = null
  error.value = null
  showMessage('Thank you for using SigmaBank ATM!', 'success')
}

const checkATMStatus = async () => {
  try {
    const res = await axios.get(`${API}/api/atm/status`, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    atmStatus.value = res.data.operational ? 'Online' : 'Service Unavailable'
  } catch (err) {
    atmStatus.value = 'Status Unknown'
  }
}

const fetchUser = async () => {
  try {
    const res = await axios.get(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    user.value = res.data
    await fetchUserAccounts()
    await fetchRecentTransactions()
  } catch (err) {
    error.value = '❌ Failed to load user information'
    console.error(err)
  }
}

const fetchUserAccounts = async () => {
  try {
    const res = await axios.get(`${API}/api/accounts/user/${user.value.id}`, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    userAccounts.value = res.data
  } catch (err) {
    console.error('❌ Failed to fetch accounts', err)
    showMessage('Failed to load account information', 'error')
  }
}

const fetchRecentTransactions = async () => {
  try {
    const res = await axios.get(`${API}/api/atm/recent-transactions?limit=5`, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    recentTransactions.value = res.data.transactions || []
  } catch (err) {
    console.error('Failed to fetch transactions', err)
  }
}

const selectAccount = (account) => {
  selectedAccount.value = account
  customAmount.value = 0
  transferToIban.value = ''
  transactionType.value = 'withdraw'
}

const canWithdraw = (amount) => {
  return amount <= availableWithdraw.value && amount % 10 === 0
}

const quickWithdraw = async (amount) => {
  if (!canWithdraw(amount)) {
    showMessage('Insufficient funds, exceeds limits, or invalid denomination', 'error')
    return
  }

  transactionLoading.value = true
  try {
    const res = await axios.post(`${API}/api/atm/withdraw`, {
      iban: selectedAccount.value.iban,
      amount: amount
    }, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })

    if (res.data.success) {
      showMessage(res.data.message, 'success')
      await refreshAccountData()
    } else {
      showMessage(res.data.message, 'error')
    }
  } catch (err) {
    console.error(err)
    const errorMessage = err.response?.data?.message || 'Transaction failed'
    showMessage(errorMessage, 'error')
  } finally {
    transactionLoading.value = false
  }
}

const performCustomTransaction = async () => {
  if (!isValidTransaction.value) return

  transactionLoading.value = true
  
  try {
    let endpoint = ''
    let payload = {}

    switch (transactionType.value) {
      case 'withdraw':
        endpoint = '/api/atm/withdraw'
        payload = {
          iban: selectedAccount.value.iban,
          amount: customAmount.value
        }
        break
      case 'deposit':
        endpoint = '/api/atm/deposit'
        payload = {
          iban: selectedAccount.value.iban,
          amount: customAmount.value
        }
        break
      case 'transfer':
        endpoint = '/api/atm/transfer'
        payload = {
          fromIban: selectedAccount.value.iban,
          toIban: transferToIban.value,
          amount: customAmount.value
        }
        break
    }

    const res = await axios.post(`${API}${endpoint}`, payload, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })

    if (res.data.success) {
      showMessage(res.data.message, 'success')
      customAmount.value = 0
      transferToIban.value = ''
      await refreshAccountData()
    } else {
      showMessage(res.data.message, 'error')
    }
  } catch (err) {
    console.error(err)
    const errorMessage = err.response?.data?.message || 'Transaction failed'
    showMessage(errorMessage, 'error')
  } finally {
    transactionLoading.value = false
  }
}

const refreshAccountData = async () => {
  await fetchUserAccounts()
  await fetchRecentTransactions()
  
  // Update selected account
  if (selectedAccount.value) {
    const updatedAccount = userAccounts.value.find(acc => acc.id === selectedAccount.value.id)
    if (updatedAccount) {
      selectedAccount.value = updatedAccount
    }
  }
}

const searchAccounts = async () => {
  if (!searchQuery.value.trim()) return

  try {
    let response
    try {
      response = await axios.get(`${API}/api/accounts/find-by-name?name=${searchQuery.value}`, {
        headers: { Authorization: `Bearer ${atmToken.value}` }
      })
    } catch (nameError) {
      response = await axios.get(`${API}/api/accounts/search-iban?iban=${searchQuery.value}`, {
        headers: { Authorization: `Bearer ${atmToken.value}` }
      })
    }

    searchResults.value = response.data
    if (searchResults.value.length === 0) {
      showMessage('No accounts found', 'error')
    }
  } catch (error) {
    showMessage('Search failed', 'error')
  }
}

const selectSearchResult = (iban) => {
  transferToIban.value = iban
  showAccountSearch.value = false
  searchResults.value = []
  searchQuery.value = ''
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const viewAllTransactions = () => {
  showMessage('Full transaction history available in main banking app', 'success')
}

onMounted(() => {
  if (atmToken.value) {
    fetchUser()
    checkATMStatus()
  }
})
</script>

<style scoped>
.atm-container {
  max-width: 600px;
  margin: 20px auto;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.atm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.atm-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.atm-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.atm-login, .atm-main, .loading-screen {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 25px;
  backdrop-filter: blur(10px);
}

.login-screen {
  text-align: center;
}

.login-screen h3 {
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.login-form {
  max-width: 300px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.atm-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  box-sizing: border-box;
}

.atm-input:focus {
  outline: 2px solid #4CAF50;
  background: white;
}

.atm-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.atm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.atm-btn-primary {
  background: #4CAF50;
  color: white;
}

.atm-btn-primary:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.atm-btn-success {
  background: #2196F3;
  color: white;
}

.atm-btn-success:hover:not(:disabled) {
  background: #1976D2;
}

.atm-btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.atm-btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.atm-btn-danger {
  background: #f44336;
  color: white;
}

.atm-btn-danger:hover:not(:disabled) {
  background: #d32f2f;
}

.user-welcome {
  text-align: center;
  margin-bottom: 25px;
}

.user-welcome h3 {
  margin: 0 0 10px 0;
  font-size: 1.4rem;
}

.status-approved {
  color: #4CAF50;
}

.status-pending {
  color: #FF9800;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.account-card {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-align: left;
}

.account-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.account-type {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.account-iban {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 8px;
}

.account-balance {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.account-limits small {
  opacity: 0.7;
}

.selected-account-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.limits-display {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.limit-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.limit-value {
  font-weight: 600;
  color: #4CAF50;
}

.option-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}

.option-section h5 {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-amount-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-amount-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.quick-amount-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.transaction-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.type-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.3);
}

.search-btn {
  margin-top: 5px;
  padding: 8px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.recent-transactions {
  max-height: 200px;
  overflow-y: auto;
}

.transaction-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.transaction-type {
  font-weight: 600;
}

.transaction-amount {
  color: #4CAF50;
  font-weight: 600;
}

.transaction-date {
  font-size: 0.8rem;
  opacity: 0.7;
}

.no-transactions {
  text-align: center;
  opacity: 0.7;
  padding: 20px;
}

.view-all-btn {
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.atm-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.atm-actions .atm-btn {
  flex: 1;
}

.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.search-modal-content {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 15px;
  padding: 25px;
  max-width: 400px;
  width: 90%;
  color: white;
}

.search-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-form input {
  flex: 1;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.search-result-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.search-modal-actions {
  display: flex;
  justify-content: flex-end;
}

.atm-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.atm-message.success {
  background: #4CAF50;
  color: white;
}

.atm-message.error {
  background: #f44336;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 10px;
  border-radius: 6px;
  margin-top: 15px;
  text-align: center;
}

.spinner, .spinner-large {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  animation: spin 1s linear infinite;
}

.spinner {
  width: 16px;
  height: 16px;
}

.spinner-large {
  width: 40px;
  height: 40px;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen {
  text-align: center;
  padding: 40px 20px;
}

.loading-screen p {
  margin-top: 20px;
  opacity: 0.8;
}

.text-muted {
  opacity: 0.7;
  font-size: 0.85rem;
  margin-top: 3px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .atm-container {
    margin: 10px;
    padding: 15px;
  }
  
  .account-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-amounts {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .atm-actions {
    flex-direction: column;
  }
  
  .transaction-type-selector {
    flex-direction: column;
  }
  
  .search-form {
    flex-direction: column;
  }
}

/* Accessibility */
.atm-btn:focus,
.atm-input:focus,
.account-card:focus {
  outline: 3px solid #4CAF50;
  outline-offset: 2px;
}
</style>