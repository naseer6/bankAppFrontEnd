<template>
  <div v-if="isLoading">Loading account details...</div>
  <div v-else-if="error">
    <p style="color: red">{{ error }}</p>
  </div>
  <div v-else>
    <h1>Bank Account Overview</h1>
    <div class="mb-4 card p-3 shadow-sm" v-if="user">
      <h5>Customer Information</h5>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Status:</strong>
        <span v-if="user.approved">✅ Approved</span>
        <span v-else>⏳ Pending approval</span>
      </p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
    </div>
    <div v-if="accounts.length === 0">
      <p>No accounts found.</p>
    </div>
    <div v-else>
      <div
        v-for="account in accounts"
        :key="account.id"
        class="card mb-3 shadow-sm"
      >
        <div class="card-body">
          <h5 class="card-title">
            {{ account.type === 'CHECKING' ? '🏦 Checking Account' : '💰 Savings Account' }}
          </h5>
          <p class="card-text">
            <strong>IBAN:</strong> {{ account.iban }}<br />
            <strong>Balance:</strong> €{{ account.balance.toFixed(2) }}
          </p>
        </div>
      </div>
      <div class="alert alert-info mt-4">
        <strong>Total Balance:</strong>
        €{{ totalBalance.toFixed(2) }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
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
  async mounted() {
    try {
      const token = getAuthToken();
      if (!token) {
        this.error = "Not authenticated.";
        return;
      }
      // Get user info to fetch userId and display customer info
      const userRes = await axios.get("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.user = userRes.data;
      const userId = userRes.data.id;

      // Fetch accounts for this user
      const accountsRes = await axios.get(
        `http://localhost:8080/api/accounts/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      this.accounts = accountsRes.data;
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        this.error = "Session expired or unauthorized. Please log in again.";
      } else {
        this.error = "Failed to load account details.";
      }
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
.alert-info {
  font-size: 1.1rem;
}
</style>