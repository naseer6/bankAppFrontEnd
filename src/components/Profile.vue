<template>
  <div>
    <h1>Welcome to your profile</h1>
    <p v-if="user && user.isApproved">Your account is approved!</p>
    <p v-if="user && !user.isApproved">Your account is pending approval by an admin.</p>
  </div>
</template>

<script>
import axios from "axios";
import { API_ENDPOINTS } from "@/config";
import { getAuthToken } from "@/utils/auth";

export default {
  data() {
    return {
      user: null,
      error: null,
      isLoading: true,
    };
  },
  mounted() {
    this.fetchUser();
  },
  methods: {
    async fetchUser() {
      const token = getAuthToken(); // Retrieve token from localStorage or state
      try {
        const response = await axios.get(`${API_ENDPOINTS.auth}/me`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT in the request header
          },
        });
        this.user = response.data; // Assign user data after login
      } catch (error) {
        console.error("Error fetching user data:", error);
        this.error = "Failed to load user data.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
