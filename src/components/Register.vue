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
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        bsnNumber: "",
      },
      error: null,
      isLoading: false,
      success: null,
    };
  },
  computed: {
    passwordsMatch() {
      return this.formData.password === this.formData.confirmPassword;
    },
    showPasswordMismatch() {
      return this.formData.confirmPassword.length > 0 && !this.passwordsMatch;
    }
  },
  components: {
    Notification,
    Loading,
  },
  methods: {
    async handleSubmit() {
      try {
        this.error = null;
        
        // Validate passwords match
        if (this.formData.password !== this.formData.confirmPassword) {
          this.error = "❌ Passwords do not match";
          return;
        }
        
        this.isLoading = true;
        await axios.post(API_ENDPOINTS.auth + "/register", this.formData);

        this.success = "Registration successful";
        this.$emit("switchToLogin");
      } catch (error) {
        console.error(error);
        
        // Handle different error response formats
        let errorMessage = "An error occurred during registration";
        
        if (error?.response?.data) {
          // If backend returns string directly (your current setup)
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
          // If backend returns object with error field
          else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
          // If backend returns object with message field
          else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        this.error = errorMessage;
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
      <label for="name" class="form-label">Name</label>
      <input
        type="text"
        class="form-control"
        id="name"
        v-model="formData.name"
        required
        placeholder="Enter your name"
      />
    </div>
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input
        type="text"
        class="form-control"
        id="username"
        v-model="formData.username"
        required
        placeholder="Enter your username"
      />
    </div>
    <div class="mb-3">
      <label for="email" class="form-label">Email</label>
      <input
        type="email"
        class="form-control"
        id="email"
        v-model="formData.email"
        required
        placeholder="Enter your email"
      />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        id="password"
        v-model="formData.password"
        required
        placeholder="Enter your password"
      />
    </div>
    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control"
        :class="{ 'is-invalid': showPasswordMismatch }"
        id="confirmPassword"
        v-model="formData.confirmPassword"
        required
        placeholder="Confirm your password"
      />
      <div v-if="showPasswordMismatch" class="invalid-feedback">
        Passwords do not match
      </div>
    </div>
    <div class="mb-3">
      <label for="phone" class="form-label">Phone number</label>
      <input
        type="tel"
        class="form-control"
        id="phone"
        v-model="formData.phone"
        required
        placeholder="Enter your phone number"
      />
    </div>
    <div class="mb-3">
      <label for="address" class="form-label">Address</label>
      <input
        type="text"
        class="form-control"
        id="address"
        v-model="formData.address"
        required
        placeholder="Enter your address"
      />
    </div>
    <div class="mb-3">
      <label for="bsn" class="form-label">BSN Number</label>
      <input
        type="text"
        class="form-control"
        id="bsn"
        v-model="formData.bsnNumber"
        required
        placeholder="Enter your BSN number"
      />
    </div>

    <button type="submit" class="btn btn-primary w-100">Register</button>
    <Notification v-if="error" :isError="true" @close="error = null" class="mt-3">
      {{ error }}
    </Notification>
  </form>
</template>

<style scoped></style>