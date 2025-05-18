<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-receipt"></i> Personal Transactions
    </h1>

    <!-- Filters -->
    <div class="card p-3 shadow-sm mb-4">
      <h5>Filter Transactions</h5>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">IBAN</label>
          <input type="text" v-model="filters.iban" class="form-control" placeholder="e.g. NL91INHO0000000045" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Amount</label>
          <input type="number" v-model.number="filters.amount" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Comparator</label>
          <select v-model="filters.comparator" class="form-select">
            <option value=">">Greater than</option>
            <option value="<">Less than</option>
            <option value="=">Equal to</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Start Date</label>
          <input type="date" v-model="filters.startDate" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">End Date</label>
          <input type="date" v-model="filters.endDate" class="form-control" />
        </div>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" @click="fetchTransactions">
          <i class="bi bi-search"></i> Apply Filters
        </button>
        <button class="btn btn-secondary ms-2" @click="resetFilters">
          <i class="bi bi-arrow-clockwise"></i> Reset
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="isLoading">Loading transactions...</div>
    <div v-else-if="error">
      <p style="color: red">{{ error }}</p>
    </div>
    <div v-else>
      <div v-if="transactions.length === 0">
        <p>No transactions found.</p>
      </div>
      <div v-else>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>From IBAN</th>
              <th>To IBAN</th>
              <th>Amount (€)</th>
              <th>Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ tx.id }}</td>
              <td>{{ tx.fromIban }}</td>
              <td>{{ tx.toIban }}</td>
              <td>€{{ tx.amount.toFixed(2) }}</td>
              <td>{{ formatDate(tx.date) }}</td>
              <td>{{ tx.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/utils/api";
import { getAuthToken } from "@/utils/auth";

export default {
  name: "PersonalTransactions",
  data() {
    return {
      transactions: [],
      isLoading: true,
      error: null,
      filters: {
        iban: "",
        amount: "",
        comparator: ">",
        startDate: "",
        endDate: "",
      },
    };
  },
  methods: {
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;

      try {
        // No need to get token, api instance handles it
        const params = new URLSearchParams();

        if (this.filters.iban) params.append("iban", this.filters.iban);
        if (this.filters.amount) {
          params.append("amount", this.filters.amount);
          params.append("comparator", this.filters.comparator);
        }
        if (this.filters.startDate) params.append("start", this.filters.startDate);
        if (this.filters.endDate) params.append("end", this.filters.endDate);

        const res = await api.get(`/transactions?${params.toString()}`);
        this.transactions = res.data;
      } catch (err) {
        console.error(err);
        this.error = "Failed to load transactions.";
      } finally {
        this.isLoading = false;
      }
    },
    resetFilters() {
      this.filters = {
        iban: "",
        amount: "",
        comparator: ">",
        startDate: "",
        endDate: "",
      };
      this.fetchTransactions();
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
  },
  mounted() {
    const iban = this.$route.query.iban;
    if (iban) {
      this.filters.iban = iban;
    }
    this.fetchTransactions();
  },
};
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>
