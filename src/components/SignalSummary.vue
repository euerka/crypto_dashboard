<template>
  <div class="signal-summary">
    <h2>信号汇总 ({{ activeCount }}个指标)</h2>

    <div class="summary-stats">
      <div class="stat">
        <span class="stat-label">买入:</span>
        <span class="stat-value">{{ signals.summary?.buy || 0 }} ({{ buyPercentage }}%)</span>
      </div>
      <div class="stat">
        <span class="stat-label">中性:</span>
        <span class="stat-value">{{ signals.summary?.neutral || 0 }} ({{ neutralPercentage }}%)</span>
      </div>
      <div class="stat">
        <span class="stat-label">卖出:</span>
        <span class="stat-value">{{ signals.summary?.sell || 0 }} ({{ sellPercentage }}%)</span>
      </div>
    </div>

    <div class="ratio-bar">
      <div
        class="ratio-segment buy"
        :style="{ width: `${buyPercentage}%` }"
        :title="`买入 ${buyPercentage}%`"
      ></div>
      <div
        class="ratio-segment neutral"
        :style="{ width: `${neutralPercentage}%` }"
        :title="`中性 ${neutralPercentage}%`"
      ></div>
      <div
        class="ratio-segment sell"
        :style="{ width: `${sellPercentage}%` }"
        :title="`卖出 ${sellPercentage}%`"
      ></div>
    </div>

    <div class="recommendation" :class="recommendationClass">
      {{ recommendationText }}
      <span v-if="confidenceLevel === 'high'" class="confidence">(高置信度)</span>
      <span v-else-if="confidenceLevel === 'medium'" class="confidence">(中置信度)</span>
    </div>

    <div class="last-update">
      最后更新: {{ lastUpdateTime }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  signals: {
    type: Object,
    required: true,
    default: () => ({
      summary: {
        buy: 0,
        sell: 0,
        neutral: 0
      },
      recommendation: 'neutral'
    })
  },
  activeCount: {
    type: Number,
    required: true,
    default: 3
  },
  lastUpdate: {
    type: String,
    default: ''
  }
});

// 计算百分比
const totalSignals = computed(() => {
  return props.signals.summary.buy +
         props.signals.summary.sell +
         props.signals.summary.neutral;
});

const buyPercentage = computed(() => {
  return totalSignals.value > 0
    ? Math.round((props.signals.summary.buy / props.activeCount) * 100)
    : 0;
});

const neutralPercentage = computed(() => {
  return totalSignals.value > 0
    ? Math.round((props.signals.summary.neutral / props.activeCount) * 100)
    : 0;
});

const sellPercentage = computed(() => {
  return totalSignals.value > 0
    ? Math.round((props.signals.summary.sell / props.activeCount) * 100)
    : 0;
});

// 推荐信息
const recommendationClass = computed(() => {
  return {
    'recommendation-buy': props.signals.recommendation === 'buy',
    'recommendation-sell': props.signals.recommendation === 'sell',
    'recommendation-neutral': props.signals.recommendation === 'neutral'
  };
});

const recommendationText = computed(() => {
  switch(props.signals.recommendation) {
    case 'buy': return '建议买入';
    case 'sell': return '建议卖出';
    default: return '建议观望';
  }
});

// 置信度计算
const confidenceLevel = computed(() => {
  const maxPercentage = Math.max(
    buyPercentage.value,
    sellPercentage.value,
    neutralPercentage.value
  );

  if (maxPercentage >= 70) return 'high';
  if (maxPercentage >= 50) return 'medium';
  return 'low';
});

// 格式化更新时间
const lastUpdateTime = computed(() => {
  if (!props.lastUpdate) return '--';
  const date = new Date(props.lastUpdate);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});
</script>

<style scoped>
.signal-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-family: 'Arial', sans-serif;
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
  color: #333;
  text-align: center;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 15px;
  gap: 10px;
}

.stat {
  text-align: center;
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.stat-label {
  display: block;
  font-size: 0.85em;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1em;
  font-weight: bold;
}

.ratio-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  margin-bottom: 15px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.ratio-segment {
  height: 100%;
  transition: width 0.5s ease;
  position: relative;
}

.ratio-segment:hover::after {
  content: attr(title);
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: nowrap;
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
  margin-bottom: 10px;
}

.recommendation-buy {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.recommendation-sell {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid #f44336;
}

.recommendation-neutral {
  background-color: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  border: 1px solid #9e9e9e;
}

.confidence {
  font-size: 0.9em;
  opacity: 0.8;
  margin-left: 5px;
}

.last-update {
  text-align: right;
  font-size: 0.8em;
  color: #999;
  margin-top: 10px;
}

@media (max-width: 600px) {
  .summary-stats {
    flex-direction: column;
  }

  .stat {
    margin-bottom: 5px;
  }
}
</style>