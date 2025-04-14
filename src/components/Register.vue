<script>
import { API_ENDPOINTS } from "@/config";
import axios from "axios";
import Notification from "./Notification.vue";
import Loading from "./Loading.vue";

export default {
  name: "Register",
  data() {
    return {
      formData: {
        email: "",
        password: "",
        confirmPassword: "",
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
      if (this.formData.password !== this.formData.confirmPassword) {
        this.error = "Passwords do not match";
        return;
      }

      try {
        this.error = null;
        this.isLoading = true;
        await axios.post(API_ENDPOINTS.auth + "/register", this.formData);

        this.success = "Registration successful";
        this.$emit("switchToLogin");
      } catch (error) {
        console.error(error);
        this.error =
          error?.response?.data?.error ||
          "An error occurred during registration";
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
      <label for="email" class="form-label">Email</label>
      <input type="email" class="form-control" id="email" v-model="formData.email" required placeholder="Enter your email" />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input type="password" class="form-control" id="password" v-model="formData.password" required placeholder="Enter your password" />
    </div>
    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input type="password" class="form-control" id="confirmPassword" v-model="formData.confirmPassword" required placeholder="Confirm your password" />
    </div>
    <button type="submit" class="btn btn-primary w-100">Register</button>
    <Notification v-if="error" :isError="true" @close="error = null" class="mt-3">
      {{ error }}
    </Notification>
  </form>
</template>

<style scoped></style>