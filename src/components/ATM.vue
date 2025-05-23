<template>
  <div class="atm-container">
    <h2>🏦 Mock ATM</h2>

    <div v-if="!atmToken">
      <h3>🔐 ATM Login</h3>
      <form @submit.prevent="login">
        <label>Email:
          <input v-model="email" type="email" required />
        </label>
        <label>Password:
          <input v-model="password" type="password" required />
        </label>
        <button type="submit">Login</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else-if="user">
      <h3>Welcome, {{ user.username }}</h3>
      <div class="balances">
        <p><strong>Checking:</strong> €{{ balances.checking?.toFixed(2) || '0.00' }}</p>
        <p><strong>Savings:</strong> €{{ balances.savings?.toFixed(2) || '0.00' }}</p>
      </div>

      <div class="transaction">
        <label>Account:
          <select v-model="selectedAccount">
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </label>
        <label>Amount:
          <input v-model.number="amount" type="number" min="0.01" step="0.01" required />
        </label>
        <button @click="deposit">💰 Deposit</button>
        <button @click="withdraw">🏧 Withdraw</button>
        <button class="logout-btn" @click="logout">Exit ATM</button>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </div>

    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const email = ref('')
const password = ref('')
const user = ref(null)
const atmToken = ref(localStorage.getItem('atmToken') || null)
const balances = ref({ checking: 0, savings: 0 })
const amount = ref(0)
const selectedAccount = ref('CHECKING')
const error = ref(null)
const message = ref(null)

const API = 'http://localhost:8080'

import { setAuthToken } from "@/utils/auth";

const login = async () => {
  try {
    const res = await axios.post(`${API}/api/users/login`, {
      email: email.value,
      password: password.value
    });

    atmToken.value = res.data.token;
    localStorage.setItem('atmToken', atmToken.value);
    setAuthToken(atmToken.value); // ✅ Add this line
    await fetchUser();
  } catch (err) {
    error.value = '❌ Login failed';
    console.error(err);
  }
};


const logout = () => {
  localStorage.removeItem('atmToken')
  atmToken.value = null
  user.value = null
  balances.value = { checking: 0, savings: 0 }
  amount.value = 0
  message.value = null
  error.value = null
}

const fetchUser = async () => {
  try {
    const res = await axios.get(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    user.value = res.data
    await updateBalances()
  } catch (err) {
    error.value = '❌ Failed to load user info'
  }
}

const updateBalances = async () => {
  try {
    const res = await axios.get(`${API}/api/accounts/balance`, {
      params: { userId: user.value.id },
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    balances.value = res.data
  } catch (err) {
    console.error('❌ Failed to fetch balances', err)
    balances.value = { checking: 0, savings: 0 }
  }
}

const deposit = async () => {
  if (amount.value <= 0) return alert('Enter a valid amount')

  try {
    const res = await axios.post(`${API}/api/accounts/deposit`, {}, {
      params: {
        userId: user.value.id,
        amount: amount.value,
        type: selectedAccount.value
      },
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    message.value = res.data
    await updateBalances()
  } catch (err) {
    console.error(err)
    message.value = '❌ Deposit failed'
  }
}

const withdraw = async () => {
  if (amount.value <= 0) return alert('Enter a valid amount')

  const currentBalance = balances.value[selectedAccount.value.toLowerCase()]
  if (amount.value > currentBalance) {
    return message.value = '❌ Cannot withdraw more than current balance'
  }

  try {
    const res = await axios.post(`${API}/api/accounts/withdraw`, {}, {
      params: {
        userId: user.value.id,
        amount: amount.value,
        type: selectedAccount.value
      },
      headers: { Authorization: `Bearer ${atmToken.value}` }
    })
    message.value = res.data
    await updateBalances()
  } catch (err) {
    console.error(err)
    message.value = '❌ Withdrawal failed'
  }
}

onMounted(() => {
  if (atmToken.value) fetchUser()
})
</script>

<style scoped>
.atm-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: sans-serif;
}
label {
  display: block;
  margin-bottom: 10px;
}
input, select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
}
button {
  margin: 5px 10px 10px 0;
  padding: 8px 14px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #2980b9;
}
.logout-btn {
  background-color: #dc3545;
}
.logout-btn:hover {
  background-color: #c82333;
}
.error {
  color: red;
  margin-top: 10px;
}
.message {
  margin-top: 15px;
  font-weight: bold;
}
.transaction {
  margin-top: 20px;
}
.balances {
  margin-top: 20px;
}
</style>
