<script>
import { API_ENDPOINTS } from "@/config";
import axios from "axios";
import Notification from "./Notification.vue";
import Loading from "./Loading.vue";
import { setAuthToken } from "@/utils/auth";

export default {
  name: "Login",
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
  components: {
    Notification,
    Loading,
  },
  methods: {
    async handleSubmit() {
      try {
        this.error = null;
        this.isLoading = true;
        const response = await axios.post(API_ENDPOINTS.auth + "/login", this.formData);

        this.success = "Login successful";
        localStorage.setItem("token", response.data.token);
        setAuthToken(response.data.token);
        this.$router.push("/profile");
      } catch (error) {
        console.error(error);
        this.error =
          error?.response?.data?.error ||
          "An error occurred during login";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<template>
  <Loading v-if="isLoading" />
  <Notification v-if="success" :isError="false" @close="success = null">
    {{ success }}
  </Notification>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input type="username" class="form-control" id="username" v-model="formData.username" required placeholder="Enter your username" />
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

<style scoped></style>