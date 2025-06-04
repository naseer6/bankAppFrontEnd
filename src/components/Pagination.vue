<template>
  <div class="pagination-wrapper" v-if="totalItems > 0">
    <div class="pagination-container">
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 0 || totalPages <= 1"
        class="pagination-btn nav-btn"
      >
        <i class="arrow-left"></i>
        <span>Previous</span>
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="totalPages > 1 ? goToPage(page - 1) : null"
          :class="['page-btn', { active: page - 1 === currentPage, disabled: totalPages <= 1 }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage >= totalPages - 1 || totalPages <= 1"
        class="pagination-btn nav-btn"
      >
        <span>Next</span>
        <i class="arrow-right"></i>
      </button>
    </div>
    
    <div class="pagination-info">
      <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <span>({{ totalItems }} total items)</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 0
    },
    totalPages: {
      type: Number,
      required: true,
      default: 0
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage);
      const end = Math.min(this.totalPages, this.currentPage + 4);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  methods: {
    goToPage(page) {
      if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
        this.$emit('page-changed', page);
      }
    }
  }
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-btn {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

.pagination-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* Custom Arrow Icons */
.arrow-left,
.arrow-right {
  width: 0;
  height: 0;
  display: inline-block;
}

.arrow-left {
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-right: 6px solid currentColor;
}

.arrow-right {
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid currentColor;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.page-btn.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-color: #007bff;
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.4);
  transform: translateY(-1px);
}

.page-btn.disabled {
  background: #f8f9fa;
  color: #6c757d;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-btn.disabled:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.85rem;
  color: #6c757d;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: row;
    gap: 1rem;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .pagination-btn {
    padding: 0.75rem;
  }
}
</style>
