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

export default {
  data() {
    return {
      user: null,
      error: null,
      isLoading: true,
    };
  },
  async mounted() {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      this.user = res.data;
    } catch (err) {
      console.error(err);
      this.error = "Failed to load user data";
    } finally {
      this.isLoading = false;
    }
  },
};
</script>


