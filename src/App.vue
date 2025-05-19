<script setup>
import CryptoIndicators from './components/CryptoIndicators.vue'
</script>

<template>
  <div class="app">
    <CryptoIndicators />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 添加一些基础的响应式样式 */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
}
</style>
