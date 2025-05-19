<template>
  <div class="signal-summary">
    <h2>信号汇总 ({{ activeCount }}个指标)</h2>

    <div class="summary-stats">
      <div class="stat">
        <span class="stat-label">买入:</span>
        <span class="stat-value">{{ signals.summary?.buy || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">中性:</span>
        <span class="stat-value">{{ signals.summary?.neutral || 0 }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">卖出:</span>
        <span class="stat-value">{{ signals.summary?.sell || 0 }}</span>
      </div>
    </div>

    <div class="ratio-bar">
      <div
        class="ratio-segment buy"
        :style="{ width: `${buyRatio}%` }"
        :title="`买入 ${buyRatio}%`"
      ></div>
      <div
        class="ratio-segment neutral"
        :style="{ width: `${neutralRatio}%` }"
        :title="`中性 ${neutralRatio}%`"
      ></div>
      <div
        class="ratio-segment sell"
        :style="{ width: `${sellRatio}%` }"
        :title="`卖出 ${sellRatio}%`"
      ></div>
    </div>

    <div class="recommendation" :class="recommendationClass">
      {{ recommendationText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  signals: Object,
  activeCount: Number
});

const buyRatio = computed(() => {
  const total = props.activeCount;
  return total ? Math.round((props.signals.summary?.buy || 0) / total * 100) : 0;
});

const neutralRatio = computed(() => {
  const total = props.activeCount;
  return total ? Math.round((props.signals.summary?.neutral || 0) / total * 100) : 0;
});

const sellRatio = computed(() => {
  const total = props.activeCount;
  return total ? Math.round((props.signals.summary?.sell || 0) / total * 100) : 0;
});

const recommendationClass = computed(() => ({
  'recommendation-buy': props.signals.recommendation === 'buy',
  'recommendation-sell': props.signals.recommendation === 'sell',
  'recommendation-neutral': !props.signals.recommendation || props.signals.recommendation === 'neutral'
}));

const recommendationText = computed(() => {
  switch(props.signals.recommendation) {
    case 'buy': return '强烈建议买入';
    case 'sell': return '强烈建议卖出';
    default: return '建议观望';
  }
});
</script>

<style scoped>
.signal-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #666;
}

.stat-value {
  font-size: 1.2em;
  font-weight: bold;
}

.ratio-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  margin-bottom: 15px;
}

.ratio-segment {
  height: 100%;
  transition: width 0.5s ease;
}

.buy {
  background-color: #4caf50;
}

.neutral {
  background-color: #9e9e9e;
}

.sell {
  background-color: #f44336;
}

.recommendation {
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.1em;
}

.recommendation-buy {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.recommendation-sell {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.recommendation-neutral {
  background-color: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
}
</style>
