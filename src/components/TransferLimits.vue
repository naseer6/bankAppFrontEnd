<template>
  <div class="transfer-limits-container">
    <h2>💰 Transfer Limits Management</h2>

    <!-- Account Selection -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Select Account</h5>
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">User ID:</label>
            <input 
              v-model="selectedUserId" 
              type="number" 
              class="form-control" 
              placeholder="Enter User ID"
              @change="fetchUserAccounts"
            />
          </div>
          <div class="col-md-6" v-if="userAccounts.length > 0">
            <label class="form-label">Account:</label>
            <select v-model="selectedAccount" class="form-control" @change="fetchAccountLimits">
              <option value="">Select an account</option>
              <option 
                v-for="account in userAccounts" 
                :key="account.accountId" 
                :value="account"
              >
                {{ account.iban }} ({{ account.type }}) - €{{ account.currentBalance.toFixed(2) }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Limits Display -->
    <div class="card mb-4" v-if="selectedAccount">
      <div class="card-body">
        <h5 class="card-title">📊 Current Account Status</h5>
        <div class="row">
          <div class="col-md-3">
            <div class="status-card">
              <strong>Current Balance</strong>
              <div class="value">€{{ selectedAccount.currentBalance.toFixed(2) }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="status-card">
              <strong>Available Balance</strong>
              <div class="value">€{{ selectedAccount.availableBalance.toFixed(2) }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="status-card">
              <strong>Daily Limit</strong>
              <div class="value">€{{ selectedAccount.dailyLimit.toFixed(2) }}</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="status-card">
              <strong>Remaining Today</strong>
              <div class="value">€{{ selectedAccount.remainingDailyLimit.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-6">
            <div class="status-card">
              <strong>Absolute Limit</strong>
              <div class="value">€{{ selectedAccount.absoluteLimit.toFixed(2) }}</div>
              <small class="text-muted">Minimum balance allowed</small>
            </div>
          </div>
          <div class="col-md-6">
            <div class="status-card">
              <strong>Transferred Today</strong>
              <div class="value">€{{ selectedAccount.totalTransferredToday.toFixed(2) }}</div>
              <small class="text-muted">Out of daily limit</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Limits Form -->
    <div class="card mb-4" v-if="selectedAccount">
      <div class="card-body">
        <h5 class="card-title">⚙️ Update Transfer Limits</h5>
        <form @submit.prevent="updateLimits">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Absolute Limit (€):</label>
              <input 
                v-model.number="newLimits.absoluteLimit" 
                type="number" 
                step="0.01" 
                min="0"
                :max="selectedAccount.currentBalance"
                class="form-control" 
                required
              />
              <small class="text-muted">
                Minimum balance that must remain in account. Max: €{{ selectedAccount.currentBalance.toFixed(2) }}
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label">Daily Transfer Limit (€):</label>
              <input 
                v-model.number="newLimits.dailyLimit" 
                type="number" 
                step="0.01" 
                min="0.01"
                class="form-control" 
                required
              />
              <small class="text-muted">
                Maximum amount that can be transferred per day
              </small>
            </div>
          </div>
          <div class="mt-3">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Update Limits
            </button>
            <button type="button" class="btn btn-secondary ms-2" @click="resetForm">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Account with Custom Limits -->
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">🏦 Create Account with Custom Limits</h5>
        <form @submit.prevent="createAccountWithLimits">
          <div class="row">
            <div class="col-md-3">
              <label class="form-label">User ID:</label>
              <input 
                v-model.number="newAccount.userId" 
                type="number" 
                class="form-control" 
                required
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Account Type:</label>
              <select v-model="newAccount.accountType" class="form-control" required>
                <option value="">Select type</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Absolute Limit (€):</label>
              <input 
                v-model.number="newAccount.absoluteLimit" 
                type="number" 
                step="0.01" 
                min="0"
                class="form-control" 
                required
              />
            </div>
            <div class="col-md-3">
              <label class="form-label">Daily Limit (€):</label>
              <input 
                v-model.number="newAccount.dailyLimit" 
                type="number" 
                step="0.01" 
                min="0.01"
                class="form-control" 
                required
              />
            </div>
          </div>
          <div class="mt-3">
            <button type="submit" class="btn btn-success" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']">
      {{ message }}
    </div>
  </div>
</template>

<script>
import api from "@/utils/api";

export default {
  name: "TransferLimits",
  data() {
    return {
      selectedUserId: null,
      userAccounts: [],
      selectedAccount: null,
      newLimits: {
        absoluteLimit: 0,
        dailyLimit: 1000
      },
      newAccount: {
        userId: null,
        accountType: '',
        absoluteLimit: 0,
        dailyLimit: 1000
      },
      isLoading: false,
      message: null,
      messageType: 'success'
    };
  },
  methods: {
    async fetchUserAccounts() {
      if (!this.selectedUserId) return;
      
      this.isLoading = true;
      try {
        const response = await api.get(`/admin/limits/user/${this.selectedUserId}`);
        this.userAccounts = response.data.accounts;
        this.selectedAccount = null;
        this.showMessage('User accounts loaded successfully', 'success');
      } catch (error) {
        this.showMessage('Failed to load user accounts: ' + (error.response?.data || error.message), 'error');
        this.userAccounts = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAccountLimits() {
      if (!this.selectedAccount) return;
      
      this.isLoading = true;
      try {
        const response = await api.get(`/admin/limits/account/${this.selectedAccount.accountId}`);
        this.selectedAccount = { ...this.selectedAccount, ...response.data };
        
        // Set current values in the form
        this.newLimits.absoluteLimit = this.selectedAccount.absoluteLimit;
        this.newLimits.dailyLimit = this.selectedAccount.dailyLimit;
        
        this.showMessage('Account limits loaded successfully', 'success');
      } catch (error) {
        this.showMessage('Failed to load account limits: ' + (error.response?.data || error.message), 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async updateLimits() {
      if (!this.selectedAccount) return;
      
      this.isLoading = true;
      try {
        const response = await api.post(`/admin/limits/account/${this.selectedAccount.accountId}`, {
          absoluteLimit: this.newLimits.absoluteLimit,
          dailyLimit: this.newLimits.dailyLimit
        });
        
        // Update the displayed account info
        this.selectedAccount = { ...this.selectedAccount, ...response.data };
        
        this.showMessage('Transfer limits updated successfully!', 'success');
      } catch (error) {
        this.showMessage('Failed to update limits: ' + (error.response?.data || error.message), 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async createAccountWithLimits() {
      this.isLoading = true;
      try {
        const response = await api.post('/admin/limits/create-account', this.newAccount);
        
        this.showMessage('Account created successfully with custom limits!', 'success');
        
        // Reset form
        this.newAccount = {
          userId: null,
          accountType: '',
          absoluteLimit: 0,
          dailyLimit: 1000
        };
        
        // Refresh user accounts if the same user
        if (this.selectedUserId === this.newAccount.userId) {
          await this.fetchUserAccounts();
        }
      } catch (error) {
        this.showMessage('Failed to create account: ' + (error.response?.data || error.message), 'error');
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      if (this.selectedAccount) {
        this.newLimits.absoluteLimit = this.selectedAccount.absoluteLimit;
        this.newLimits.dailyLimit = this.selectedAccount.dailyLimit;
      }
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = null;
      }, 5000);
    }
  }
};
</script>

<style scoped>
.transfer-limits-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.status-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  height: 100%;
}

.status-card .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0d6efd;
  margin: 10px 0;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-radius: 12px;
}

.card-title {
  color: #333;
  font-weight: 600;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
}

.alert {
  border-radius: 8px;
  border: none;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>