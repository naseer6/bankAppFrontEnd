<script>
import Login from "./Login.vue";
import Register from "./Register.vue";

export default {
  name: "Auth",
  data() {
    return {
      isLogin: true,
    };
  },
  components: {
    Login,
    Register,
  },
  methods: {
    toggleAuthMode() {
      this.isLogin = !this.isLogin;
    },
  },
};
</script>

<template>
  <div class="row justify-content-center align-items-center min-vh-100 m-0">
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card shadow">
        <div class="card-body p-4">
          <div class="text-center mb-4">
            <h2 class="card-title mb-3">
              {{ isLogin ? "Login" : "Register" }}
            </h2>
            <button class="btn btn-link p-0" @click="toggleAuthMode">
              {{ isLogin ? "Need an account?" : "Already have an account?" }}
            </button>
          </div>
          <Login v-if="isLogin" />  
          <Register v-else @switchToLogin="toggleAuthMode" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>