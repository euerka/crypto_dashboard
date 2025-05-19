<template>
  <div
    class="indicator-card"
    :class="signalClass"
    @click="$emit('click')"
  >
    <h3>{{ name }}</h3>
    <div class="indicator-value">
      <template v-if="typeof value === 'number'">
        {{ value.toFixed(2) }}{{ name.includes('ROC') ? '%' : '' }}
      </template>
      <template v-else-if="value.MACD">
        <div>MACD: {{ value.MACD.toFixed(2) }}</div>
        <div>Signal: {{ value.signal.toFixed(2) }}</div>
      </template>
      <template v-else-if="value.upper">
        <div>上轨: {{ value.upper.toFixed(2) }}</div>
        <div>中轨: {{ value.middle.toFixed(2) }}</div>
        <div>下轨: {{ value.lower.toFixed(2) }}</div>
      </template>
      <template v-else-if="value.k">
        <div>K: {{ value.k.toFixed(2) }}</div>
        <div>D: {{ value.d.toFixed(2) }}</div>
        <div>J: {{ value.j.toFixed(2) }}</div>
      </template>
    </div>
    <div class="signal-text">
      信号: {{ signalText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String,
  value: [Number, Object],
  signal: String
});

const signalClass = computed(() => ({
  'signal-buy': props.signal === 'buy',
  'signal-sell': props.signal === 'sell',
  'signal-neutral': !props.signal || props.signal === 'neutral'
}));

const signalText = computed(() => {
  switch(props.signal) {
    case 'buy': return '买入';
    case 'sell': return '卖出';
    default: return '观望';
  }
});
</script>

<style scoped>
.indicator-card {
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.indicator-value {
  margin-bottom: 8px;
  font-size: 1.1em;
}

.signal-text {
  font-weight: bold;
}

.signal-buy {
  border-left: 4px solid #4caf50;
}
.signal-sell {
  border-left: 4px solid #f44336;
}
.signal-neutral {
  border-left: 4px solid #9e9e9e;
}
</style>
