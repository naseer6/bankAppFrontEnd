export const API_BASE_URL = "http://localhost:8080/api";

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/users`,
  users: {
    login: `${API_BASE_URL}/users/login`,
    me: `${API_BASE_URL}/users/me`,
  },
  admin: {
    accounts: `${API_BASE_URL}/admin/accounts`,
    dashboardStats: `${API_BASE_URL}/admin/dashboard-stats`,
    unapprovedUsers: `${API_BASE_URL}/admin/unapproved-users`,
    approve: (userId) => `${API_BASE_URL}/admin/approve/${userId}`,
    accountTransactions: (accountId) => `${API_BASE_URL}/admin/accounts/${accountId}/transactions`,
    closeAccount: (accountId) => `${API_BASE_URL}/admin/accounts/${accountId}/close`,
  },
  accounts: {
    user: (userId) => `${API_BASE_URL}/accounts/user/${userId}`,
    create: `${API_BASE_URL}/accounts/create`,
    limits: (iban) => `${API_BASE_URL}/accounts/limits/${iban}`,
    updateLimits: `${API_BASE_URL}/accounts/update-limits`,
    findByName: `${API_BASE_URL}/accounts/find-by-name`,
    searchIban: `${API_BASE_URL}/accounts/search-iban`,
  },
  transactions: {
    withdraw: `${API_BASE_URL}/transactions/withdraw`,
    deposit: `${API_BASE_URL}/transactions/deposit`,
    transfer: `${API_BASE_URL}/transactions/transfer`,
    admin: `${API_BASE_URL}/transactions/admin/transfer`,
    atmStatus: `${API_BASE_URL}/transactions/atm/status`,
    atmRecent: `${API_BASE_URL}/transactions/atm/recent-transactions`,
  }
};
