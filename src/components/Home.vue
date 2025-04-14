<template>
  <div>
    <!-- Hero Section -->
    <section class="hero d-flex align-items-center text-white text-center bg-primary">
      <div class="container">
        <h1 class="display-4 fw-bold">Welcome to SigmaBank</h1>
        <p class="lead">Your reliable partner in secure, modern digital banking.</p>
        <RouterLink to="/auth" class="btn btn-warning btn-lg mt-3">
          Get Started
        </RouterLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features py-5 bg-light">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-shield-lock display-5 text-primary mb-3"></i>
                <h5 class="card-title fw-bold">Secure Transactions</h5>
                <p class="card-text">Your data and money are protected with top-grade encryption.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-speedometer2 display-5 text-primary mb-3"></i>
                <h5 class="card-title fw-bold">Fast & Reliable</h5>
                <p class="card-text">Enjoy lightning-fast banking with zero compromises on safety.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <i class="bi bi-phone display-5 text-primary mb-3"></i>
                <h5 class="card-title fw-bold">Mobile Ready</h5>
                <p class="card-text">Access your account anywhere, anytime — desktop or mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped>
.hero {
  width: 100vw; /* Ensure the hero section spans the full width */
  margin-left: calc(-50vw + 50%); /* Center the full-width section */
  min-height: 70vh;
  background-image: url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1500&q=80');
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 50, 0.7);
  z-index: 1;
}

.hero > .container {
  position: relative;
  z-index: 2;
}

.features {
  width: 100vw; /* Ensure the features section spans the full width */
  margin-left: calc(-50vw + 50%); /* Center the full-width section */
}

.features .card i {
  color: #0d6efd;
}
</style>
