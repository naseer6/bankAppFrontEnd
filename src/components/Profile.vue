<template>
  <div v-if="isLoading">Loading profile...</div>
  <div v-else-if="user">
    <pre>{{ user }}</pre>

    <div v-if="user.role === 'ADMIN'">
      <h1>👑 Admin Profile</h1>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Status:</strong>
        <span v-if="user.approved">✅ Approved</span>
        <span v-else>⏳ Pending admin approval</span>
      </p>
    </div>

    <div v-else>
      <h1>User Profile</h1>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Status:</strong>
        <span v-if="user.approved">✅ Approved</span>
        <span v-else>⏳ Pending approval</span>
      </p>
    </div>
  </div>

  <div v-if="error">
    <p style="color: red">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";
import { getAuthToken } from "@/utils/auth";

export default {
  data() {
    return {
      user: null,
      error: null,
      isLoading: true,
    };
  },
  async mounted() {
    try {
      const token = getAuthToken();

      if (!token) {
        this.error = "Not authenticated.";
        return;
      }

      const res = await axios.get("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      this.user = res.data;
    } catch (err) {
      console.error(err);
      this.error = "Failed to load user profile.";
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

