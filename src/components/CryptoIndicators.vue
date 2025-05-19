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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CandlestickChart from './CandlestickChart.vue';
import IndicatorCard from './IndicatorCard.vue';
import SignalSummary from './SignalSummary.vue';
import { getKlines, getTicker } from '../services/binanceService';
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

// 指标数据
const lastRSI = ref(0);
const lastMACD = ref({});
const lastBB = ref({});
const lastSMA = ref(0);
const lastEMA = ref(0);
const lastKDJ = ref({});
const lastROC = ref(0);
const signals = ref({});

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

const activeIndicatorCount = computed(() => {
  return Object.values(activeIndicators.value).filter(v => v).length + 3; // 基础指标3个
});

const priceChangeClass = computed(() => ({
  positive: priceChange.value > 0,
  negative: priceChange.value < 0
}));

// 数据更新
async function updateData() {
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
    if(activeIndicators.value.sma) indicators.sma = calculateSMA(prices);
    if(activeIndicators.value.ema) indicators.ema = calculateEMA(prices);
    if(activeIndicators.value.kdj) indicators.kdj = calculateStochastic(highs, lows, prices);
    if(activeIndicators.value.roc) indicators.roc = calculateROC(prices);

    // 更新图表数据
    chartData.value = processChartData(klines, indicators);

    // 更新价格信息
    updatePriceInfo();

    // 计算信号
    signals.value = getSignals(indicators);
  } catch (error) {
    console.error('更新数据失败:', error);
  }
}

// 辅助方法
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

onMounted(updateData);
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
</style>
