import { createRouter, createWebHistory } from "vue-router";
import Home from "./components/Home.vue";
import About from "./components/About.vue";
import Auth from "./components/Auth.vue";
import Profile from "./components/Profile.vue";
import Admin from "./components/Admin.vue";
import ATM from "./components/ATM.vue";
import AccountOverview from "./pages/AccountOverview.vue";
import TransferManagement from "./pages/TransferManagement.vue"; 
import { getAuthToken, setAuthToken } from "@/utils/auth";
import { createPinia } from "pinia";
import axios from "axios";
import AdminAccounts from "./components/AdminAccounts.vue";

axios.defaults.withCredentials = true;

// Import Bootstrap CSS and Icons

import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import Transactions from "./pages/Transactions.vue";

// Initialize auth token if it exists
const token = getAuthToken();
if (token) {
  setAuthToken(token);
}

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/about",
    component: About,
  },
  {
    path: "/auth",
    component: Auth,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/admin",
    component: Admin,
  },
  {
    path: "/atm",
    component: ATM,
  },
  {
    path: "/accountoverview",
    component: AccountOverview,
  },
  {
    path: "/transactions",
    component: Transactions,
  },
  {
    path: "/transfers",
    component: TransferManagement,
  },
 
  {
    path: "/admin/accounts",
    component: AdminAccounts,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.mount("#app");