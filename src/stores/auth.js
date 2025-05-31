import { defineStore } from "pinia";
import { getAuthToken, setAuthToken, getUserRole } from "@/utils/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAuthToken(),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: () => getUserRole(),
    isAdmin: () => {
      const role = getUserRole();
      return role === 'ADMIN' || role === 'EMPLOYEE';
    },
  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token);
      setAuthToken(token);
    },
    logout() {
      this.token = null;
      localStorage.removeItem("token");
      setAuthToken(null);
    },
  },
});
