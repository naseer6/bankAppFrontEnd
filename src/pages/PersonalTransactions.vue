<template>
  <div>
    <h1 class="mb-4">
      <i class="bi bi-receipt"></i> Personal Transactions
    </h1>

    <!-- Filters -->
    <div class="card p-3 shadow-sm mb-4">
      <h5>Filter Transactions</h5>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">IBAN</label>
          <input type="text" v-model="filters.iban" class="form-control" placeholder="e.g. NL91INHO0000000045" />
        </div>
        <div class="col-md-2">
          <label class="form-label">IBAN Type</label>
          <select v-model="filters.ibanType" class="form-select">
            <option value="">Both (default)</option>
            <option value="from">From Account</option>
            <option value="to">To Account</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Amount</label>
          <input type="number" v-model.number="filters.amount" class="form-control" />
        </div>
        <div class="col-md-1">
          <label class="form-label">Comparator</label>
          <select v-model="filters.comparator" class="form-select">
            <option value=">">></option>
            <option value="<"><</option>
            <option value="=">=</option>
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
        <div class="mb-3">
          <small class="text-muted">Found {{ transactions.length }} transaction(s)</small>
        </div>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>From IBAN</th>
              <th>To IBAN</th>
              <th>Amount (€)</th>
              <th>Date</th>
              <th>Type</th>
              <th>Direction</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ tx.id }}</td>
              <td>{{ tx.fromIban }}</td>
              <td>{{ tx.toIban }}</td>
              <td class="fw-bold" :class="getAmountClass(tx)">
                {{ formatAmount(tx) }}
              </td>
              <td>{{ formatDate(tx.date) }}</td>
              <td>{{ tx.description }}</td>
              <td>
                <span class="badge" :class="getDirectionBadgeClass(tx)">
                  {{ tx.direction }}
                </span>
              </td>
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
        ibanType: "",
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
        const params = new URLSearchParams();

        if (this.filters.iban) {
          params.append("iban", this.filters.iban);
          if (this.filters.ibanType) {
            params.append("ibanType", this.filters.ibanType);
          }
        }
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
        ibanType: "",
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
    formatAmount(tx) {
      // Use signedAmount if available, otherwise fall back to regular amount
      const amount = tx.signedAmount !== undefined ? tx.signedAmount : tx.amount;
      const sign = amount >= 0 ? '+' : '';
      return `${sign}€${Math.abs(amount).toFixed(2)}`;
    },
    getDirectionBadgeClass(tx) {
      switch (tx.direction) {
        case "Outgoing": 
          return "bg-danger";
        case "Incoming": 
          return "bg-success";
        case "Internal": 
          return "bg-info";
        case "External":
        default: 
          return "bg-secondary";
      }
    },
    getAmountClass(tx) {
      switch (tx.direction) {
        case "Outgoing": 
          return "text-danger";
        case "Incoming": 
          return "text-success";
        case "Internal": 
          return "text-info";
        default: 
          return "";
      }
    }
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

.fw-bold {
  font-weight: bold;
}
</style>