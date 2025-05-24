import axios from 'axios';

const BASE_URL = 'https://api.binance.com';
const WS_URL = 'wss://stream.binance.com:9443/ws';

// 改进的时间间隔标准化函数
function normalizeInterval(interval) {
  const match = interval.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('无效的时间间隔格式');

  const [_, value, unit] = match;
  const numValue = parseInt(value);

  // 扩展支持的时间间隔
  const supportedIntervals = {
    s: ['1', '5', '10', '15', '30'],
    m: ['1', '3', '5', '15', '30', '45'],
    h: ['1', '2', '4', '6', '8', '12'],
    d: ['1', '3', '7']
  };

  if (supportedIntervals[unit]?.includes(value)) return interval;

  // 改进的最近间隔查找算法
  const intervalInMinutes = {
    s: numValue / 60,
    m: numValue,
    h: numValue * 60,
    d: numValue * 24 * 60
  }[unit];

  const allIntervals = [
    ...supportedIntervals.s.map(v => ({ value: parseInt(v), unit: 's' })),
    ...supportedIntervals.m.map(v => ({ value: parseInt(v), unit: 'm' })),
    ...supportedIntervals.h.map(v => ({ value: parseInt(v), unit: 'h' })),
    ...supportedIntervals.d.map(v => ({ value: parseInt(v), unit: 'd' }))
  ];

  let bestInterval = '1m';
  let minDiff = Infinity;

  for (const int of allIntervals) {
    const intInMinutes = {
      s: int.value / 60,
      m: int.value,
      h: int.value * 60,
      d: int.value * 24 * 60
    }[int.unit];

    const diff = Math.abs(intervalInMinutes - intInMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      bestInterval = `${int.value}${int.unit}`;
    }
  }

  console.warn(`使用最接近的间隔 ${bestInterval} 替代 ${interval}`);
  return bestInterval;
}

// 改进的K线数据获取
export async function getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
  try {
    const normalizedInterval = normalizeInterval(interval);
    const response = await axios.get(`${BASE_URL}/api/v3/klines`, {
      params: { symbol, interval: normalizedInterval, limit }
    });

    return response.data.map(kline => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
      quoteVolume: parseFloat(kline[7]),
      trades: kline[8],
      takerBuyVolume: parseFloat(kline[9])
    }));
  } catch (error) {
    console.error('获取K线数据失败:', error);
    throw error;
  }
}

// 实时数据WebSocket连接
// 修改 setupWebSocket 函数，添加重连机制
export function setupWebSocket(symbol, callback) {
  const ws = new WebSocket(`${WS_URL}/${symbol.toLowerCase()}@kline_1m`);
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  let reconnectTimer = null;

  ws.onmessage = (event) => {
    reconnectAttempts = 0; // 重置重连计数
    const data = JSON.parse(event.data);
    const kline = data.k;

    callback({
      time: kline.t,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      isClosed: kline.x,
      eventTime: data.E
    });
  };

  ws.onclose = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`WebSocket连接关闭，${reconnectAttempts}秒后尝试重连...`);
      reconnectTimer = setTimeout(() => setupWebSocket(symbol, callback), 1000 * reconnectAttempts);
    } else {
      console.error('WebSocket重连次数超过上限，停止重连');
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket错误:', error);
  };

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}

// 价格数据API
export async function get24hTickerPrice(symbol = 'BTCUSDT') {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/24hr`, {
      params: { symbol }
    });
    return {
      ...response.data,
      priceChangePercent: parseFloat(response.data.priceChangePercent),
      lastPrice: parseFloat(response.data.lastPrice)
    };
  } catch (error) {
    console.error('获取24小时价格失败:', error);
    throw error;
  }
}

export const getTicker = get24hTickerPrice;

// 支持的时间间隔
export function getSupportedIntervals() {
  return [
    '1s', '5s', '10s', '15s', '30s',
    '1m', '3m', '5m', '15m', '30m', '45m',
    '1h', '2h', '4h', '6h', '8h', '12h',
    '1d', '3d', '7d'
  ];
}