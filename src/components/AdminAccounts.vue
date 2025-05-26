<template>
  <div class="container py-4">
    <h1 class="mb-4">Customer Accounts Management</h1>
    
    <div v-if="loading" class="d-flex justify-content-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="accounts.length === 0" class="alert alert-info">
      No accounts found in the system.
    </div>
    
    <div v-else>
      <!-- Search and filter options -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search by account number or customer name" 
              v-model="searchQuery"
            >
            <button class="btn btn-outline-secondary" type="button" @click="clearSearch">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="statusFilter">
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="closed">Closed Only</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="typeFilter">
            <option value="all">All Account Types</option>
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
          </select>
        </div>
      </div>
      
      <!-- Accounts table -->
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">Account Number</th>
                <th scope="col">Type</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Balance</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in filteredAccounts" :key="account.id" :class="{'table-danger': !account.active}">
                <td>{{ account.iban }}</td>
                <td>
                  <span class="badge" :class="getAccountTypeBadgeClass(account.type)">
                    {{ account.type }}
                  </span>
                </td>
                <td>{{ account.owner?.name || 'Unknown' }}</td>
                <td class="fw-bold">€{{ account.balance?.toFixed(2) }}</td>
                <td>
                  <span v-if="account.active" class="badge bg-success">Active</span>
                  <span v-else class="badge bg-danger">Closed</span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button @click="viewDetails(account)" class="btn btn-outline-primary" title="View Details">
                      <i class="bi bi-info-circle"></i>
                    </button>
                    <button @click="viewTransactions(account)" class="btn btn-outline-info" title="View Transactions">
                      <i class="bi bi-list-ul"></i>
                    </button>
                    <button 
                      v-if="account.active"
                      @click="confirmCloseAccount(account)" 
                      class="btn btn-outline-danger" 
                      title="Close Account"
                      :disabled="account.balance > 0">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination controls -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted small">
          Showing {{ filteredAccounts.length }} of {{ accounts.length }} accounts
        </div>
        <nav v-if="totalPages > 1">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    
    <!-- Account Details Modal -->
    <div class="modal fade" id="accountDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" v-if="selectedAccount">
          <div class="modal-header">
            <h5 class="modal-title">Account Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="card border-0">
              <div class="card-body p-0">
                <h6 class="text-muted mb-3">Account Information</h6>
                <div class="mb-3 p-3 bg-light rounded">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Account Number:</span>
                    <span class="fw-bold">{{ selectedAccount.iban }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Type:</span>
                    <span class="badge" :class="getAccountTypeBadgeClass(selectedAccount.type)">
                      {{ selectedAccount.type }}
                    </span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Balance:</span>
                    <span class="fw-bold">€{{ selectedAccount.balance?.toFixed(2) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Status:</span>
                    <span v-if="selectedAccount.active" class="badge bg-success">Active</span>
                    <span v-else class="badge bg-danger">Closed</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Created:</span>
                    <span>{{ formatDate(selectedAccount.createdAt) }}</span>
                  </div>
                </div>
                
                <h6 class="text-muted mb-3 mt-4">Owner Information</h6>
                <div class="p-3 bg-light rounded" v-if="selectedAccount.owner">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Name:</span>
                    <span>{{ selectedAccount.owner.name }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Email:</span>
                    <span>{{ selectedAccount.owner.email }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Phone:</span>
                    <span>{{ selectedAccount.owner.phone }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">BSN:</span>
                    <span>{{ selectedAccount.owner.bsnNumber }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-muted">Address:</span>
                    <span>{{ selectedAccount.owner.address }}</span>
                  </div>
                </div>
                <div class="alert alert-warning" v-else>
                  Owner information not available
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button 
              v-if="selectedAccount.active && selectedAccount.balance === 0" 
              type="button" 
              class="btn btn-danger" 
              @click="confirmCloseAccount(selectedAccount)">
              Close Account
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Transactions Modal -->
    <div class="modal fade" id="transactionsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedAccount">
              Transactions - {{ selectedAccount.iban }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingTransactions" class="d-flex justify-content-center my-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="transactions.length === 0" class="alert alert-info">
              No transactions found for this account.
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transaction in transactions" :key="transaction.id">
                      <td>{{ formatDateTime(transaction.timestamp) }}</td>
                      <td>{{ transaction.fromAccount?.iban || 'N/A' }}</td>
                      <td>{{ transaction.toAccount?.iban || 'N/A' }}</td>
                      <td :class="getTransactionAmountClass(transaction)">
                        €{{ transaction.amount?.toFixed(2) }}
                      </td>
                      <td>{{ transaction.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Close Account Confirmation Modal -->
    <div class="modal fade" id="closeAccountModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" v-if="accountToClose">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Account Closure</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Warning:</strong> This action cannot be undone.
            </div>
            <p>
              Are you sure you want to close account <strong>{{ accountToClose.iban }}</strong>
              belonging to <strong>{{ accountToClose.owner?.name || 'Unknown' }}</strong>?
            </p>
            <p class="mb-0">
              <small class="text-muted">
                Note: Only accounts with a zero balance can be closed.
              </small>
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="closeAccount" 
              :disabled="isClosingAccount">
              <span v-if="isClosingAccount" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Confirm Close
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Toast -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
      <div 
        id="errorToast" 
        class="toast align-items-center text-white bg-danger border-0" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            {{ errorMessage }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

export default {
  setup() {
    // Data
    const accounts = ref([]);
    const loading = ref(true);
    const selectedAccount = ref(null);
    const transactions = ref([]);
    const loadingTransactions = ref(false);
    const accountToClose = ref(null);
    const isClosingAccount = ref(false);
    const errorMessage = ref('');
    
    // Filter and pagination state
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const typeFilter = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // Bootstrap Modal instances
    let detailsModal = null;
    let transactionsModal = null;
    let closeModal = null;
    let errorToast = null;
    
    // API base URL
    const API_BASE_URL = 'http://localhost:8080';
    
    // Computed properties
    const filteredAccounts = computed(() => {
      let result = accounts.value;
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(account => 
          (account.iban?.toLowerCase().includes(query)) || 
          (account.owner?.name?.toLowerCase().includes(query))
        );
      }
      
      // Apply status filter
      if (statusFilter.value !== 'all') {
        const isActive = statusFilter.value === 'active';
        result = result.filter(account => account.active === isActive);
      }
      
      // Apply type filter
      if (typeFilter.value !== 'all') {
        result = result.filter(account => account.type === typeFilter.value);
      }
      
      return result;
    });
    
    const paginatedAccounts = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredAccounts.value.slice(startIndex, endIndex);
    });
    
    const totalPages = computed(() => {
      return Math.ceil(filteredAccounts.value.length / itemsPerPage);
    });
    
    // Methods
    const fetchAccounts = async () => {
      loading.value = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/accounts`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });
        // Log the response to see the structure
        console.log('Accounts data:', response.data);
        accounts.value = response.data;
      } catch (error) {
        showError('Failed to fetch accounts. Please try again later.');
        console.error('Error fetching accounts:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const viewDetails = (account) => {
      selectedAccount.value = account;
      detailsModal.show();
    };
    
    const viewTransactions = async (account) => {
      selectedAccount.value = account;
      loadingTransactions.value = true;
      transactions.value = [];
      transactionsModal.show();
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/accounts/${account.id}/transactions`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });
        transactions.value = response.data;
      } catch (error) {
        showError('Failed to fetch transaction history.');
        console.error('Error fetching transactions:', error);
      } finally {
        loadingTransactions.value = false;
      }
    };
    
    const confirmCloseAccount = (account) => {
      if (account.balance > 0) {
        showError('Cannot close an account with a non-zero balance.');
        return;
      }
      
      accountToClose.value = account;
      closeModal.show();
    };
    
    const closeAccount = async () => {
      if (!accountToClose.value) return;
      
      isClosingAccount.value = true;
      
      try {
        await axios.post(`${API_BASE_URL}/api/admin/accounts/${accountToClose.value.id}/close`, {}, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`
          }
        });
        
        // Update local state
        const index = accounts.value.findIndex(a => a.id === accountToClose.value.id);
        if (index !== -1) {
          accounts.value[index].active = false;
        }
        
        // Close modal
        closeModal.hide();
        
        // Close details modal if it's the same account
        if (selectedAccount.value && selectedAccount.value.id === accountToClose.value.id) {
          selectedAccount.value.active = false;
        }
      } catch (error) {
        showError('Failed to close account. ' + (error.response?.data || ''));
        console.error('Error closing account:', error);
      } finally {
        isClosingAccount.value = false;
      }
    };
    
    const clearSearch = () => {
      searchQuery.value = '';
    };
    
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };
    
    const getAccountTypeBadgeClass = (type) => {
      return type === 'CHECKING' ? 'bg-primary' : 'bg-warning text-dark';
    };
    
    const getTransactionAmountClass = (transaction) => {
      if (!selectedAccount.value) return '';
      
      // For the selected account, highlight outgoing transactions in red, incoming in green
      if (transaction.fromAccount?.id === selectedAccount.value.id) {
        return 'text-danger';
      } else if (transaction.toAccount?.id === selectedAccount.value.id) {
        return 'text-success';
      }
      return '';
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    };
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-GB', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    const showError = (message) => {
      errorMessage.value = message;
      errorToast.show();
    };
    
    // Lifecycle hooks
    onMounted(() => {
      fetchAccounts();
      
      // Initialize Bootstrap components
      detailsModal = new bootstrap.Modal(document.getElementById('accountDetailsModal'));
      transactionsModal = new bootstrap.Modal(document.getElementById('transactionsModal'));
      closeModal = new bootstrap.Modal(document.getElementById('closeAccountModal'));
      errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
    });
    
    return {
      accounts,
      loading,
      selectedAccount,
      transactions,
      loadingTransactions,
      accountToClose,
      isClosingAccount,
      errorMessage,
      searchQuery,
      statusFilter,
      typeFilter,
      currentPage,
      filteredAccounts,
      totalPages,
      fetchAccounts,
      viewDetails,
      viewTransactions,
      confirmCloseAccount,
      closeAccount,
      clearSearch,
      changePage,
      getAccountTypeBadgeClass,
      getTransactionAmountClass,
      formatDate,
      formatDateTime
    };
  }
}
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.table th, .table td {
  vertical-align: middle;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
}

.modal-header, .modal-footer {
  border-color: #f0f0f0;
}

.text-muted {
  color: #6c757d !important;
}

.pagination .page-link {
  color: #0d6efd;
  background-color: #fff;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>