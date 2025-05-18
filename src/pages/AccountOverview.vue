<template>
  <div v-if="isLoading" class="text-center mt-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-3">Loading account details...</p>
  </div>

  <div v-else-if="error" class="alert alert-danger text-center">
    {{ error }}
  </div>

  <div v-else class="container mt-4">
    <h1 class="mb-4 text-center">🏛️ Bank Account Overview</h1>

    <div v-if="user" class="card p-4 shadow-sm mb-4">
      <h4 class="mb-3">👤 Customer Information</h4>
      <div class="row">
        <div class="col-md-6">
          <p><strong>Username:</strong> {{ user.username }}</p>
          <p><strong>Status: </strong>
            <span v-if="user.approved" class="text-success">✅ Approved</span>
            <span v-else class="text-warning">⏳ Pending approval</span>
          </p>
        </div>
        <div class="col-md-6">
          <p><strong>Role:</strong> {{ user.role }}</p>
          <p><strong>Name:</strong> {{ user.name }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
        </div>
      </div>
    </div>

    <div v-if="accounts.length === 0" class="alert alert-warning text-center">
      No accounts found.
    </div>

    <div v-else>
      <div class="row">
        <div
          class="col-md-6"
          v-for="account in accounts"
          :key="account.id"
        >
          <div class="card mb-4 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">
                {{ account.type === 'CHECKING' ? '🏦 Checking Account' : '💰 Savings Account' }}
              </h5>
              <p class="card-text">
                <strong>IBAN:</strong> {{ account.iban }}<br />
                <strong>Balance:</strong> €{{ (account.balance || 0).toFixed(2) }}
              </p>
              <button
                class="btn btn-outline-primary"
                @click="goToTransactions(account.id)"
              >
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-info text-center mt-4">
        <strong>Total Balance:</strong>
        €{{ totalBalance.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/utils/api";
import { getAuthToken } from "@/utils/auth";

export default {
  name: "AccountOverview",
  data() {
    return {
      accounts: [],
      user: null,
      isLoading: true,
      error: null,
    };
  },
  computed: {
    totalBalance() {
      return this.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    },
  },
  methods: {
    goToTransactions(accountId) {
      this.$router.push(`/accounts/${accountId}/transactions`);
    },
  },
  async mounted() {
    try {
      const token = getAuthToken();
      if (!token) {
        this.error = "Not authenticated.";
        return;
      }

      const userRes = await api.get("/users/me");
      this.user = userRes.data;
      const userId = this.user.id;

      const accountsRes = await api.get(`/accounts/user/${userId}`);
      this.accounts = accountsRes.data;
    } catch (err) {
      console.error(err);
      this.error =
        err.response && err.response.status === 401
          ? "Session expired or unauthorized. Please log in again."
          : "Failed to load account details.";
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
.card-title {
  font-size: 1.2rem;
}
</style>
