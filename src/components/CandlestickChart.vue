<template>
  <div class="chart-wrapper">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineExpose } from 'vue';
import { createChart } from 'lightweight-charts';

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  autosize: {
    type: Boolean,
    default: true
  },
  timeFormat: {
    type: String,
    default: 'HH:mm'
  }
});

const chartContainer = ref(null);
let chart = null;
let candleSeries = null;
let bbUpperSeries = null;
let bbLowerSeries = null;
let resizeObserver = null;

// 重置缩放
function resetZoom() {
  if (chart) {
    chart.timeScale().fitContent();
  }
}

// 暴露方法给父组件
defineExpose({
  resetZoom
});

// 创建图表
function initChart() {
  if (!chartContainer.value) return;

  // 销毁旧图表
  if (chart) {
    chart.remove();
    chart = null;
  }

  // 创建新图表
  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
    layout: {
      background: { color: '#ffffff' },
      textColor: '#333333',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time) => {
        const date = new Date(time * 1000);
        return date.getHours() + ':00';
      }
    },
    rightPriceScale: {
      borderColor: '#dcdcdc',
    },
    crosshair: {
      mode: 1,
      vertLine: {
        width: 1,
        color: '#2196f3',
        style: 0,
      },
      horzLine: {
        width: 1,
        color: '#2196f3',
        style: 0,
      },
    },
    ...props.options
  });

  // 添加蜡烛图系列
  candleSeries = chart.addCandlestickSeries({
    upColor: '#4caf50',
    downColor: '#f44336',
    borderUpColor: '#4caf50',
    borderDownColor: '#f44336',
    wickUpColor: '#4caf50',
    wickDownColor: '#f44336',
  });

  // 添加布林带系列
  bbUpperSeries = chart.addLineSeries({
    color: '#4caf50',
    lineWidth: 1,
    lineStyle: 2, // 虚线
    priceLineVisible: false,
    lastValueVisible: false,
  });

  bbLowerSeries = chart.addLineSeries({
    color: '#f44336',
    lineWidth: 1,
    lineStyle: 2, // 虚线
    priceLineVisible: false,
    lastValueVisible: false,
  });

  // 设置数据
  updateChartData();
}

// 更新图表数据
function updateChartData() {
  if (!chart || !candleSeries || !props.data || props.data.length === 0) return;

  // 准备蜡烛图数据
  const candleData = props.data.map(item => ({
    time: item.x.getTime() / 1000,
    open: item.o,
    high: item.h,
    low: item.l,
    close: item.c
  }));

  // 准备布林带数据
  const bbUpperData = props.data.filter(item => item.bbUpper).map(item => ({
    time: item.x.getTime() / 1000,
    value: item.bbUpper
  }));

  const bbLowerData = props.data.filter(item => item.bbLower).map(item => ({
    time: item.x.getTime() / 1000,
    value: item.bbLower
  }));

  // 设置数据
  candleSeries.setData(candleData);

  if (bbUpperData.length > 0) {
    bbUpperSeries.setData(bbUpperData);
  }

  if (bbLowerData.length > 0) {
    bbLowerSeries.setData(bbLowerData);
  }

  // 调整可见范围
  chart.timeScale().fitContent();
}

// 处理窗口大小变化
function handleResize() {
  if (chart && chartContainer.value) {
    chart.applyOptions({
      width: chartContainer.value.clientWidth,
      height: chartContainer.value.clientHeight
    });
  }
}

// 监听数据变化
watch(() => props.data, () => {
  updateChartData();
}, { deep: true });

// 监听选项变化
watch(() => props.options, () => {
  if (chart) {
    chart.applyOptions(props.options);
  }
}, { deep: true });

onMounted(() => {
  initChart();

  if (props.autosize) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainer.value);

    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  window.removeEventListener('resize', handleResize);

  if (chart) {
    chart.remove();
    chart = null;
  }
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
