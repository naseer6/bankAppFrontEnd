<template>
  <Loading v-if="isLoading" />
  <Notification v-if="success" :isError="false" @close="success = null">
    {{ success }}
  </Notification>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input type="text" class="form-control" id="username" v-model="formData.username" required placeholder="Enter your username" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" v-model="formData.password" required placeholder="Enter your password" />
    </div>
    <button type="submit" class="btn btn-primary w-100">Login</button>
    <Notification v-if="error" :isError="true" @close="error = null" class="mt-3">
      {{ error }}
    </Notification>
  </form>
</template>

<script>
import axios from "axios";
import Notification from "./Notification.vue";
import Loading from "./Loading.vue";

export default {
  name: "Login",
  components: { Notification, Loading },
  data() {
    return {
      formData: {
        username: "",
        password: "",
      },
      error: null,
      isLoading: false,
      success: null,
    };
  },
  methods: {
    async handleSubmit() {
      try {
        this.error = null;
        this.isLoading = true;

        const res = await axios.post("http://localhost:8080/api/users/login", this.formData);

        if (res.data.token) {
          // ✅ Store token
          localStorage.setItem("token", res.data.token);

          // ✅ Redirect based on role
          if (res.data.role === "ADMIN") {
            this.$router.push("/admin");
          } else {
            this.$router.push("/profile");
          }
        } else {
          // If not approved, show message but proceed to profile
          this.success = res.data.message || "Login successful";
          this.$router.push("/profile");
        }
      } catch (error) {
        console.error(error);
        this.error = error?.response?.data || "Login failed.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

