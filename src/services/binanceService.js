import axios from 'axios';

const BASE_URL = 'https://api.binance.com';

/**
 * 将自定义时间间隔转换为Binance API支持的格式
 * @param {string} interval - 自定义时间间隔（如1s, 5m, 1h等）
 * @returns {string} - Binance API支持的时间间隔格式
 */
function normalizeInterval(interval) {
  // 提取数字和单位
  const match = interval.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('无效的时间间隔格式');
  }

  const [_, value, unit] = match;
  const numValue = parseInt(value);

  // Binance支持的时间间隔
  const supportedIntervals = {
    s: ['1'],
    m: ['1', '3', '5', '15', '30'],
    h: ['1', '2', '4', '6', '8', '12'],
    d: ['1', '3']
  };

  // 如果是直接支持的间隔，直接返回
  if (supportedIntervals[unit]?.includes(value)) {
    return interval;
  }

  // 对于不支持的间隔，找到最近的支持的间隔
  let bestInterval = '1h';
  let minDiff = Infinity;

  // 转换为分钟进行比较
  const intervalInMinutes = {
    s: numValue / 60,
    m: numValue,
    h: numValue * 60,
    d: numValue * 24 * 60
  }[unit];

  // 所有支持的间隔
  const allIntervals = [
    ...supportedIntervals.s.map(v => ({ value: parseInt(v), unit: 's' })),
    ...supportedIntervals.m.map(v => ({ value: parseInt(v), unit: 'm' })),
    ...supportedIntervals.h.map(v => ({ value: parseInt(v), unit: 'h' })),
    ...supportedIntervals.d.map(v => ({ value: parseInt(v), unit: 'd' }))
  ];

  // 找到最接近的支持的间隔
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

  console.warn(`不支持的时间间隔 ${interval}，使用最接近的支持间隔 ${bestInterval}`);
  return bestInterval;
}

/**
 * 获取比特币K线数据
 * @param {string} symbol - 交易对，默认为BTCUSDT
 * @param {string} interval - K线间隔，如1s, 1m, 5m, 15m, 1h, 4h, 1d等
 * @param {number} limit - 获取的K线数量，最大1000
 * @returns {Promise<Array>} - K线数据数组
 */
export async function getKlines(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
  try {
    const normalizedInterval = normalizeInterval(interval);
    const response = await axios.get(`${BASE_URL}/api/v3/klines`, {
      params: {
        symbol,
        interval: normalizedInterval,
        limit
      }
    });

    // 将数据转换为更易于使用的格式
    return response.data.map(kline => ({
      time: kline[0], // 开盘时间
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: kline[6],
      quoteAssetVolume: parseFloat(kline[7]),
      trades: parseInt(kline[8]),
      takerBuyBaseAssetVolume: parseFloat(kline[9]),
      takerBuyQuoteAssetVolume: parseFloat(kline[10])
    }));
  } catch (error) {
    console.error('获取K线数据失败:', error);
    if (error.response) {
      const { status, data } = error.response;
      throw new Error(`API错误 ${status}: ${data.msg || '未知错误'}`);
    }
    throw new Error('网络错误或服务器无响应');
  }
}

/**
 * 获取比特币24小时价格统计
 * @param {string} symbol - 交易对，默认为BTCUSDT
 * @returns {Promise<Object>} - 24小时价格统计数据
 */
export async function get24hTickerPrice(symbol = 'BTCUSDT') {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/24hr`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('获取24小时价格统计失败:', error);
    if (error.response) {
      const { status, data } = error.response;
      throw new Error(`API错误 ${status}: ${data.msg || '未知错误'}`);
    }
    throw new Error('网络错误或服务器无响应');
  }
}
// Add the getTicker alias
export const getTicker = get24hTickerPrice;
/**
 * 获取比特币最新价格
 * @param {string} symbol - 交易对，默认为BTCUSDT
 * @returns {Promise<Object>} - 最新价格数据
 */
export async function getCurrentPrice(symbol = 'BTCUSDT') {
  try {
    const response = await axios.get(`${BASE_URL}/api/v3/ticker/price`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('获取最新价格失败:', error);
    if (error.response) {
      const { status, data } = error.response;
      throw new Error(`API错误 ${status}: ${data.msg || '未知错误'}`);
    }
    throw new Error('网络错误或服务器无响应');
  }
}

/**
 * 获取支持的时间间隔列表
 * @returns {Array<string>} - 支持的时间间隔列表
 */
export function getSupportedIntervals() {
  return [
    '1s',
    '1m', '3m', '5m', '15m', '30m',
    '1h', '2h', '4h', '6h', '8h', '12h',
    '1d', '3d'
  ];
}
