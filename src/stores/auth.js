import { defineStore } from "pinia";
import { getAuthToken, setAuthToken } from "@/utils/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAuthToken(),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
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
