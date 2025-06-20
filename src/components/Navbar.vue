<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm py-3">
    <div class="container-fluid">
      <RouterLink class="navbar-brand fw-bold" to="/">SigmaBank</RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/atm">ATM</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/profile">Profile</RouterLink>
          </li>
          <li class="nav-item" v-if="auth.isLoggedIn && !isAdmin">
            <RouterLink class="nav-link" to="/accountoverview">Account Details</RouterLink>
          </li>
          <li class="nav-item" v-if="auth.isLoggedIn">
            <RouterLink class="nav-link" to="/transfers">Transfers</RouterLink>
          </li>
          <li class="nav-item" v-if="auth.isLoggedIn">
            <RouterLink class="nav-link" to="/transactions">Transactions</RouterLink>
          </li>
          <li class="nav-item" v-if="auth.isLoggedIn && isAdmin">
            <RouterLink class="nav-link" to="/admin">Admin Panel</RouterLink>
          </li>
          <li class="nav-item" v-if="auth.isLoggedIn">
            <button class="btn btn-outline-light ms-2" @click="logout">Logout</button>
          </li>
          <li class="nav-item" v-else>
            <RouterLink class="nav-link" to="/auth">Login / Register</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted, watch } from "vue";
import api from "@/utils/api";

const router = useRouter();
const auth = useAuthStore();
const isAdmin = ref(false);

const checkUserRole = async () => {
  if (auth.isLoggedIn) {
    try {
      const response = await api.get('/users/me');
      isAdmin.value = response.data.role === 'ADMIN';
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      isAdmin.value = false;
    }
  } else {
    isAdmin.value = false;
  }
};

const logout = () => {
  auth.logout();
  router.push("/auth");
};

onMounted(checkUserRole);

// Watch for login/logout to update role instantly
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    checkUserRole();
  }
);
</script>

<style scoped>
.navbar {
  background-color: #003366 !important;
}
.navbar-brand {
  font-size: 1.5rem;
  letter-spacing: 0.5px;
}
.nav-link {
  font-size: 1rem;
  transition: color 0.2s ease-in-out;
}
.nav-link:hover {
  color: #ffcc00 !important;
}
</style>