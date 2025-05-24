<template>
  <div class="crypto-dashboard">
    <div class="header">
      <h1>比特币交易指标仪表板</h1>
      <div class="controls">
        <div class="interval-control">
          <select v-model="selectedInterval" @change="updateData">
            <option value="1m">1分钟</option>
            <option value="5m">5分钟</option>
            <option value="15m">15分钟</option>
            <option value="30m">30分钟</option>
            <option value="1h">1小时</option>
            <option value="4h">4小时</option>
            <option value="1d">1天</option>
          </select>
          <div v-if="showCustomInterval" class="custom-interval">
            <input v-model.number="customMinutes" type="number" min="1" placeholder="分钟数">
            <button @click="applyCustomInterval">应用</button>
          </div>
          <button @click="showCustomInterval = !showCustomInterval" class="toggle-btn">
            {{ showCustomInterval ? '取消' : '自定义' }}
          </button>
        </div>

        <div class="indicator-toggle">
          <label v-for="indicator in optionalIndicators" :key="indicator.name">
            <input type="checkbox" v-model="activeIndicators[indicator.name]">
            {{ indicator.label }}
          </label>
        </div>
      </div>

      <div class="price-info">
        <span class="current-price">${{ currentPrice }}</span>
        <span class="price-change" :class="priceChangeClass">
          {{ priceChange > 0 ? '+' : '' }}{{ priceChange }}%
        </span>
      </div>
    </div>

    <div class="chart-container">
      <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <div>加载中...</div>
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <CandlestickChart :data="chartData" :options="chartOptions"/>
    </div>

    <div class="indicators-grid">
      <!-- 基础指标 -->
      <IndicatorCard
        :value="lastRSI"
        :signal="signals.rsi"
        name="RSI(14)"
        @click="openConfig('rsi')"
      />

      <IndicatorCard
        :value="lastMACD"
        :signal="signals.macd"
        name="MACD(12,26,9)"
        @click="openConfig('macd')"
      />

      <IndicatorCard
        :value="lastBB"
        :signal="signals.bollingerBands"
        name="布林带(20,2)"
        @click="openConfig('bb')"
      />

      <!-- 可选指标 -->
      <template v-if="activeIndicators.sma">
        <IndicatorCard
          :value="lastSMA"
          :signal="signals.sma"
          name="SMA(20)"
          @click="openConfig('sma')"
        />
      </template>

      <template v-if="activeIndicators.ema">
        <IndicatorCard
          :value="lastEMA"
          :signal="signals.ema"
          name="EMA(20)"
          @click="openConfig('ema')"
        />
      </template>

      <template v-if="activeIndicators.kdj">
        <IndicatorCard
          :value="lastKDJ"
          :signal="signals.kdj"
          name="KDJ(14,3)"
          @click="openConfig('kdj')"
        />
      </template>

      <template v-if="activeIndicators.roc">
        <IndicatorCard
          :value="lastROC"
          :signal="signals.roc"
          name="ROC(12)"
          @click="openConfig('roc')"
        />
      </template>
    </div>

    <SignalSummary
      :signals="signals"
      :activeCount="activeIndicatorCount"
    />
  </div>
  <!-- 在controls中添加 -->
  <div class="export-controls">
    <button @click="exportData('csv')" class="export-btn">导出CSV</button>
    <button @click="exportData('json')" class="export-btn">导出JSON</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import CandlestickChart from './CandlestickChart.vue';
import IndicatorCard from './IndicatorCard.vue';
import SignalSummary from './SignalSummary.vue';
import { getKlines, getTicker, setupWebSocket } from '../services/binanceService';
import {
  calculateRSI, calculateMACD, calculateBollingerBands,
  calculateSMA, calculateEMA, calculateStochastic,
  calculateROC, getSignals
} from '../utils/indicators';

// 响应式状态
const currentPrice = ref(0);
const priceChange = ref(0);
const chartData = ref(null);
const selectedInterval = ref('1h');
const showCustomInterval = ref(false);
const customMinutes = ref(15);
const unsubscribe = ref(null);
const lastUpdateTime = ref(null);

// 指标数据
const lastRSI = ref(0);
const lastMACD = ref({});
const lastBB = ref({});
const lastSMA = ref(0);
const lastEMA = ref(0);
const lastKDJ = ref({ k: 50, d: 50, j: 50 });
const lastROC = ref(0);
const signals = ref({
  summary: { buy: 0, sell: 0, neutral: 0 },
  recommendation: 'neutral'
});

// 可选指标配置
const optionalIndicators = [
  { name: 'sma', label: 'SMA' },
  { name: 'ema', label: 'EMA' },
  { name: 'kdj', label: 'KDJ' },
  { name: 'roc', label: 'ROC' }
];

const activeIndicators = ref({
  sma: false,
  ema: false,
  kdj: false,
  roc: false
});

// 图表配置
const chartOptions = ref({
  layout: {
    textColor: '#d1d4dc',
    backgroundColor: '#1e222d',
  },
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
    barSpacing: 6,
    minBarSpacing: 0.5,
    fixLeftEdge: true,
    fixRightEdge: true,
    tickMarkFormatter: (time) => {
      const date = new Date(time * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      width: 1,
      color: '#2196F3',
      style: 0,
      labelBackgroundColor: '#2196F3',
    },
    horzLine: {
      visible: true,
      labelVisible: true,
    },
  },
  tooltip: {
    mode: 1,
    intersect: false,
    format: {
      price: (price) => price.toFixed(2),
    },
  },
  handleScale: {
    mouseWheel: true,
    pinch: true,
    axisPressedMouseMove: {
      time: true,
      price: false,
    },
  },
});

// 计算属性
const activeIndicatorCount = computed(() => {
  return Object.values(activeIndicators.value).filter(v => v).length + 3; // 基础指标3个
});

const priceChangeClass = computed(() => ({
  positive: priceChange.value > 0,
  negative: priceChange.value < 0
}));

const signalPercentages = computed(() => {
  const total = signals.value.summary.buy + signals.value.summary.sell + signals.value.summary.neutral;
  return {
    buy: total ? Math.round((signals.value.summary.buy / total) * 100) : 0,
    sell: total ? Math.round((signals.value.summary.sell / total) * 100) : 0,
    neutral: total ? Math.round((signals.value.summary.neutral / total) * 100) : 0
  };
});

// 生命周期钩子
onMounted(() => {
  updateData();
  setupRealTimeUpdates();
});

onUnmounted(() => {
  if (unsubscribe.value) unsubscribe.value();
});

// 监听器
watch(activeIndicators, () => {
  updateData();
}, { deep: true });

// 方法定义
function setupRealTimeUpdates() {
  unsubscribe.value = setupWebSocket('btcusdt', (data) => {
    currentPrice.value = data.close.toFixed(2);

    const now = new Date();
    if (!lastUpdateTime.value || now - lastUpdateTime.value > 60000) {
      updateData();
      lastUpdateTime.value = now;
    }
  });
}
// 添加状态变量
const isLoading = ref(false);
const errorMessage = ref('');
// 在 CryptoIndicators.vue 中修改 updateData 方法
async function updateData() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const klines = await getKlines('BTCUSDT', selectedInterval.value, 100);
    const prices = klines.map(k => k.close);
    const highs = klines.map(k => k.high);
    const lows = klines.map(k => k.low);

    // 计算基础指标
    const indicators = {
      prices,
      rsi: calculateRSI(prices),
      macd: calculateMACD(prices),
      bb: calculateBollingerBands(prices)
    };

    // 计算可选指标
    if (activeIndicators.value.sma) indicators.sma = calculateSMA(prices);
    if (activeIndicators.value.ema) indicators.ema = calculateEMA(prices);
    if (activeIndicators.value.kdj) indicators.kdj = calculateStochastic(highs, lows, prices);
    if (activeIndicators.value.roc) indicators.roc = calculateROC(prices);

    // 更新图表数据
    chartData.value = klines.map((k, i) => ({
      x: new Date(k.time),
      o: k.open,
      h: k.high,
      l: k.low,
      c: k.close,
      bbUpper: indicators.bb[i]?.upper,
      bbLower: indicators.bb[i]?.lower
    }));

    // 更新指标值
    lastRSI.value = indicators.rsi[indicators.rsi.length - 1];
    lastMACD.value = indicators.macd[indicators.macd.length - 1];
    lastBB.value = indicators.bb[indicators.bb.length - 1];
    if (indicators.sma) lastSMA.value = indicators.sma[indicators.sma.length - 1];
    if (indicators.ema) lastEMA.value = indicators.ema[indicators.ema.length - 1];
    if (indicators.kdj) lastKDJ.value = indicators.kdj[indicators.kdj.length - 1];
    if (indicators.roc) lastROC.value = indicators.roc[indicators.roc.length - 1];

    // 更新价格信息
    const ticker = await getTicker('BTCUSDT');
    currentPrice.value = parseFloat(ticker.lastPrice).toFixed(2);
    priceChange.value = parseFloat(ticker.priceChangePercent).toFixed(2);

    // 计算信号 - 传入activeIndicators
    signals.value = getSignals(indicators, activeIndicators.value);

  } catch (error) {
    console.error('更新数据失败:', error);
    errorMessage.value = '数据加载失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
}

function processChartData(klines, indicators) {
  return klines.map((k, i) => ({
    x: new Date(k.time),
    o: k.open,
    h: k.high,
    l: k.low,
    c: k.close,
    bbUpper: indicators.bb[i]?.upper,
    bbLower: indicators.bb[i]?.lower
  }));
}

async function updatePriceInfo() {
  const ticker = await getTicker('BTCUSDT');
  currentPrice.value = parseFloat(ticker.lastPrice).toFixed(2);
  priceChange.value = parseFloat(ticker.priceChangePercent).toFixed(2);
}

function applyCustomInterval() {
  selectedInterval.value = `${customMinutes.value}m`;
  updateData();
  showCustomInterval.value = false;
}

function openConfig(indicator) {
  console.log(`打开 ${indicator} 配置`);
  // 这里可以添加打开配置对话框的逻辑
}

function getSignalClass(signal) {
  return signal === 'buy' ? 'signal-buy' :
         signal === 'sell' ? 'signal-sell' : 'signal-neutral';
}

function getSignalText(signal) {
  return signal === 'buy' ? '买入' :
         signal === 'sell' ? '卖出' : '观望';
}
// 添加导出功能
function exportData(format = 'csv') {
  if (!chartData.value || chartData.value.length === 0) {
    alert('没有可导出的数据');
    return;
  }

  try {
    if (format === 'csv') {
      const headers = 'Date,Open,High,Low,Close\n';
      const rows = chartData.value.map(d => {
        const date = new Date(d.x).toISOString();
        return `${date},${d.o},${d.h},${d.l},${d.c}`;
      }).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitcoin-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const data = JSON.stringify(chartData.value, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bitcoin-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    alert('导出数据失败');
  }
}
</script>

<style scoped>
.crypto-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.interval-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.indicator-toggle {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.chart-container {
  height: 400px;
  margin-bottom: 20px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.price-info {
  font-size: 1.2em;
}

.current-price {
  font-weight: bold;
  margin-right: 10px;
}

.price-change {
  padding: 2px 8px;
  border-radius: 4px;
}

.positive {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.negative {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}
/* 添加样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #f44336;
  text-align: center;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 10px;
}
.export-controls {
  display: flex;
  gap: 10px;
}

.export-btn {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.export-btn:hover {
  background-color: #45a049;
}
/* 添加响应式样式 */
@media (max-width: 768px) {
    .header {
      flex-direction: column;
      align-items: flex-start;
    }

    .controls {
      flex-direction: column;
      width: 100%;
    }

    .interval-control {
      width: 100%;
      justify-content: space-between;
    }

    .indicator-toggle {
      margin-top: 10px;
      justify-content: space-between;
      width: 100%;
    }

    .chart-container {
      height: 300px;
    }

    .indicators-grid {
      grid-template-columns: 1fr;
    }

    .export-controls {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>