<template>
  <div class="container mt-4">
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-content-center align-items-center" style="min-height: 300px;">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>
      <div>{{ error }}</div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="user" class="row justify-content-center">
      <div class="col-lg-8 col-xl-6">
        <!-- Main User Profile Card -->
        <div class="card shadow-lg main-profile-card">
          <div class="card-header bg-gradient-primary">
            <h3 class="card-title mb-0 text-black">
              <i class="bi bi-person-fill me-2"></i>
              User Profile<span v-if="user.role === 'ADMIN'"> (Admin)</span>
            </h3>
          </div>
          <div class="card-body p-4">
            <div class="row g-3">
                <!-- Name -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-person-fill text-blue"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">Full Name</small>
                    <strong>{{ user.name }}</strong>
                  </div>
                </div>
              </div>

              <!-- Username -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-at text-blue-light"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">Username</small>
                    <strong>{{ user.username }}</strong>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-envelope-fill text-blue-dark"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">Email Address</small>
                    <strong>{{ user.email }}</strong>
                  </div>
                </div>
              </div>

              <!-- Phone -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-telephone-fill text-blue"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">Phone Number</small>
                    <strong>{{ user.phone }}</strong>
                  </div>
                </div>
              </div>              <!-- Address -->
              <div class="col-md-6">
                <div class="d-flex align-items-start mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-geo-alt-fill text-blue-light"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">Address</small>
                    <strong>{{ user.address }}</strong>
                  </div>
                </div>
              </div>

              <!-- BSN -->
              <div class="col-md-6">
                <div class="d-flex align-items-center mb-3">
                  <div class="icon-wrapper me-3">
                    <i class="bi bi-card-text text-blue"></i>
                  </div>
                  <div>
                    <small class="text-muted d-block">BSN Number</small>
                    <strong>{{ user.bsnNumber }}</strong>
                  </div>
                </div>
              </div>

            </div><!-- Status Section -->
            <hr class="my-4">
            <div class="text-center">
              <h6 class="text-muted mb-3">Account Status</h6>
              <div v-if="user.approved" class="alert alert-blue-success d-flex align-items-center justify-content-center">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>Account Approved</strong>
              </div>
              <div v-else class="alert alert-blue-info d-flex align-items-center justify-content-center">
                <i class="bi bi-clock-fill me-2"></i>
                <strong>Pending Admin Approval</strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { API_ENDPOINTS } from "@/config";

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

      const res = await axios.get(API_ENDPOINTS.users.me, {
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

<style scoped>
/* Professional Blue Color Palette */
:root {
  --blue-primary: #1e40af;
  --blue-secondary: #3b82f6;
  --blue-light: #60a5fa;
  --blue-dark: #1e3a8a;
  --blue-gradient: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  --blue-gradient-dark: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
}

.icon-wrapper {
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.icon-wrapper:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #93c5fd;
  transform: scale(1.05);
}

.icon-wrapper i {
  font-size: 1.3rem;
}

.card {
  border: none;
  border-radius: 20px;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.main-profile-card {
  box-shadow: 0 20px 40px rgba(30, 64, 175, 0.1);
}

.admin-card {
  box-shadow: 0 15px 35px rgba(30, 64, 175, 0.15);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(30, 64, 175, 0.15) !important;
}

.card-header {
  border-radius: 20px 20px 0 0 !important;
  border-bottom: none;
  padding: 1.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}

.bg-gradient-primary {
  background: var(--blue-gradient) !important;
  color: white !important;
}

.card-body {
  padding: 2.5rem 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.badge {
  font-size: 0.875rem;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.bg-blue-gradient {
  background: var(--blue-gradient) !important;
  color: white !important;
}

.bg-blue-light {
  background-color: var(--blue-light) !important;
  color: white !important;
}

.alert {
  border-radius: 15px;
  border: none;
  padding: 1.25rem 1.5rem;
  font-weight: 500;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.alert-blue-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border-left: 4px solid #22c55e;
}

.alert-blue-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--blue-dark);
  border-left: 4px solid var(--blue-secondary);
}

.spinner-border {
  border-width: 0.25em;
  color: var(--blue-secondary) !important;
}

.text-muted {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b !important;
}

/* Custom Blue Text Colors */
.text-blue {
  color: var(--blue-primary) !important;
}

.text-blue-light {
  color: var(--blue-light) !important;
}

.text-blue-dark {
  color: var(--blue-dark) !important;
}

.text-primary {
  color: var(--blue-secondary) !important;
}

.border-primary {
  border-color: var(--blue-secondary) !important;
  border-width: 2px !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .card-body {
    padding: 2rem 1.5rem;
  }
  
  .icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .icon-wrapper i {
    font-size: 1.1rem;
  }
  
  .card-header {
    padding: 1.25rem 1.5rem;
  }
}

/* Enhanced animations */
.badge {
  animation: slideInUp 0.6s ease-out;
}

.card {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Professional blue loading spinner */
.spinner-border {
  animation: spin 1s linear infinite;
}

/* Enhanced focus states for accessibility */
.card:focus-within {
  outline: 2px solid var(--blue-light);
  outline-offset: 2px;
}

/* Professional status indicators */
.bg-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
}

.bg-info {
  background: var(--blue-gradient) !important;
}

/* Subtle gradient overlay for the entire container */
.container {
  position: relative;
}

.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  z-index: -1;
  pointer-events: none;
}
</style>
