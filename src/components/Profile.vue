<template>
  <div v-if="isLoading">Loading profile...</div>
  <div v-else-if="user">
   <!-- <pre>{{ user }}</pre> -->

    <div v-if="user.role === 'ADMIN'">
      <h1>👑 Admin Profile</h1>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Status:</strong>
        <span v-if="user.approved">✅ Approved</span>
        <span v-else>⏳ Pending admin approval</span>
      </p>
    </div>

    <div class="user-profile" v-if="user">
    <h1>User Profile</h1>
    <div class="card">
      
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Phone:</strong> {{ user.phone }}</p>
      <p><strong>Address:</strong> {{ user.address }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p><strong>BSN:</strong> {{ user.bsnNumber }}</p>
      <p>
        <strong>Status:</strong>
        <span v-if="user.approved" class="approved">✅ Approved</span>
        <span v-else class="pending">⏳ Pending approval</span>
      </p>
    </div>
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

<style>
.user-profile {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card p {
  margin: 10px 0;
  font-size: 16px;
}

.approved {
  color: green;
  font-weight: bold;
}

.pending {
  color: orange;
  font-weight: bold;
}
</style>
