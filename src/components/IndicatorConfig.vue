<template>
  <div class="config-overlay" v-if="show" @click.self="close">
    <div class="config-dialog">
      <h3>{{ indicatorName }} 参数配置</h3>

      <div class="config-form">
        <div class="form-group" v-for="param in parameters" :key="param.name">
          <label>{{ param.label }}</label>
          <input
            type="number"
            v-model.number="currentValues[param.name]"
            :min="param.min"
            :max="param.max"
            :step="param.step || 1"
          >
          <span class="param-unit" v-if="param.unit">{{ param.unit }}</span>
        </div>
      </div>

      <div class="config-actions">
        <button @click="applyConfig" class="btn-primary">应用</button>
        <button @click="close" class="btn-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  indicatorName: String,
  parameters: Array,
  initialValues: Object
});

const emit = defineEmits(['update:show', 'apply']);

const currentValues = ref({...props.initialValues});

// 当初始值变化时更新当前值
watch(() => props.initialValues, (newValues) => {
  currentValues.value = {...newValues};
}, { deep: true });

function applyConfig() {
  emit('apply', {...currentValues.value});
  close();
}

function close() {
  emit('update:show', false);
}
</script>

<style scoped>
.config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.config-dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-dialog h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.config-form {
  margin: 15px 0;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-group label {
  width: 100px;
  font-size: 14px;
}

.form-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.param-unit {
  margin-left: 8px;
  color: #666;
  font-size: 14px;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
