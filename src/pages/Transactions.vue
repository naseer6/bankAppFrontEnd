<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">
        <i class="bi bi-receipt title-icon"></i> 
        <span>{{ isAdmin ? 'All Transactions' : 'Personal Transactions' }}</span>
      </h1>
      <div class="title-divider"></div>
    </div>

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
        </div>        <div class="col-md-1">
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
        <div v-if="isAdmin" class="col-md-3">
          <label class="form-label">Initiated By</label>
          <input type="text" v-model="filters.initiatedBy" class="form-control" placeholder="Username" />
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
          <small class="text-muted">Found {{ totalItems }} transaction(s)</small>
        </div>
        <div class="table-container">
          <table class="transactions-table">
            <thead>
              <tr>
                <th v-if="isAdmin">ID</th>
                <th>From IBAN</th>
                <th>To IBAN</th>
                <th>Amount (€)</th>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Direction</th>
                <th>Initiated By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td v-if="isAdmin">{{ tx.id }}</td>
                <td>{{ tx.fromIban || 'N/A' }}</td>
                <td>{{ tx.toIban || 'N/A' }}</td>
                <td class="fw-bold" :class="getAmountClass(tx)">
                  €{{ (tx.signedAmount !== undefined ? tx.signedAmount : tx.amount).toFixed(2) }}
                </td>
                <td>{{ formatDate(tx.date) }}</td>
                <td>{{ tx.description || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="getDirectionBadgeClass(tx)">
                    {{ tx.direction || 'N/A' }}
                  </span>
                </td>
                <td>{{ tx.initiatedBy || 'System' }}</td>
              </tr>
            </tbody>
          </table>
          
          <!-- Use the Pagination component -->
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            :totalItems="totalItems"
            @page-changed="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/utils/api";
import { getUserRole } from "@/utils/auth";
import Pagination from '@/components/Pagination.vue';

export default {
  name: "PersonalTransactions",
  components: {
    Pagination
  },
  data() {
    return {
      transactions: [],
      isLoading: true,
      error: null,
      isAdmin: false,
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
      filters: {
        iban: "",
        ibanType: "",
        amount: "",
        comparator: ">",
        startDate: "",
        endDate: "",
        initiatedBy: "",
      },
    };
  },
  methods: {
    async fetchTransactions() {
      this.isLoading = true;
      this.error = null;

      try {
        const params = new URLSearchParams({
          page: this.currentPage.toString(),
          size: this.pageSize.toString(),
        });

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
        if (this.isAdmin && this.filters.initiatedBy) {
          params.append("initiatedBy", this.filters.initiatedBy);
        }

        // Use different endpoint for admin vs personal transactions
        const endpoint = this.isAdmin ? `/transactions/all?${params.toString()}` : `/transactions?${params.toString()}`;
        const res = await api.get(endpoint);

        console.log('API Response:', res.data); // Debug log

        // Handle the new paginated response structure
        if (res.data.transactions) {
          this.transactions = res.data.transactions;
          this.currentPage = res.data.currentPage;
          this.totalPages = res.data.totalPages;
          this.totalItems = res.data.totalItems;
          
          // Detect backend pagination issue - if total items equals page size, 
          // it's likely filtering is happening in-memory after pagination
          if (this.totalItems === this.pageSize && this.transactions.length === this.pageSize) {
            console.warn('Possible backend pagination issue detected - total items suspiciously equals page size');
            // For now, hide pagination to avoid confusion
            this.totalPages = 1;
          }
        } else {
          // Fallback for non-paginated response
          this.transactions = res.data;
          this.totalPages = 1;
          this.totalItems = res.data.length;
          this.currentPage = 0;
        }
        
        console.log('Pagination state:', { 
          currentPage: this.currentPage, 
          totalPages: this.totalPages, 
          totalItems: this.totalItems 
        }); // Debug log

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
        initiatedBy: "",
      };
      this.fetchTransactions();
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.fetchTransactions();
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
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
    // Check if user is admin/employee
    const userRole = getUserRole();
    console.log("User role from token:", userRole);
    
    this.isAdmin = userRole === 'EMPLOYEE' || 
                   userRole === 'ADMIN' || 
                   userRole === 'ROLE_EMPLOYEE' || 
                   userRole === 'ROLE_ADMIN';
    
    console.log("Is admin:", this.isAdmin);
    
    const iban = this.$route.query.iban;
    if (iban) {
      this.filters.iban = iban;
    }
    this.fetchTransactions();
  },
};
</script>

<style scoped>
.page-header {
  margin-top: 2rem;
  margin-bottom: 2.5rem;
  text-align: center;
}

.page-title {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #1a252f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(44, 62, 80, 0.15);
  background-color: rgba(44, 62, 80, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(44, 62, 80, 0.1);
}

.title-icon {
  font-size: 2.2rem;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.3);
}

.title-divider {
  width: 100px;
  height: 4px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  margin: 1.5rem auto 0;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.3);
}

.table th, .table td {
  vertical-align: middle;
}

.fw-bold {
  font-weight: bold;
}

.table-container {
  margin-top: 1rem;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th, .transactions-table td {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  text-align: left;
}

.transactions-table th {
  background-color: #f8f9fa;
  font-weight: 500;
}
</style>