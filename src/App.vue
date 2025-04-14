<script>
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';

export default {
  components: {
    Navbar,
    Footer,
  },
  setup() {
  },
};
</script>
<template>
  <div class="app-container">
    <Navbar />
    <div class="container flex-grow-1">
      <main>
        <RouterView />
      </main>
    </div>
    <Footer />
  </div>
</template>

<style>
/* Ensure the app container takes up the full height of the viewport */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw; /* Ensure the app container spans the full width */
}

/* Allow the main content to grow and push the footer to the bottom */
.flex-grow-1 {
  flex: 1;
}
</style>
