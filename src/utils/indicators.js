import { 
  RSI, MACD, BollingerBands, 
  SMA, EMA, Stochastic, ROC,
  OBV, ATR, ADX, CCI 
} from 'technicalindicators';

/**
 * 计算RSI指标
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} period - RSI周期，默认14
 * @returns {Array<number>} RSI值数组
 */
export function calculateRSI(prices, period = 14) {
  const rsi = new RSI({
    values: prices,
    period: period
  });
  return rsi.getResult();
}

/**
 * 计算MACD指标
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} fastPeriod - 快线周期，默认12
 * @param {number} slowPeriod - 慢线周期，默认26
 * @param {number} signalPeriod - 信号线周期，默认9
 * @returns {Object} 包含MACD线、信号线和柱状图数据的对象
 */
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const macd = new MACD({
    values: prices,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  return macd.getResult();
}

/**
 * 计算布林带指标
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} period - 周期，默认20
 * @param {number} stdDev - 标准差倍数，默认2
 * @returns {Object} 包含上轨、中轨和下轨的对象
 */
export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  const bb = new BollingerBands({
    values: prices,
    period,
    stdDev
  });
  return bb.getResult();
}

/**
 * 计算简单移动平均线(SMA)
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} period - 周期，默认20
 * @returns {Array<number>} SMA值数组
 */
export function calculateSMA(prices, period = 20) {
  const sma = new SMA({
    values: prices,
    period: period
  });
  return sma.getResult();
}

/**
 * 计算指数移动平均线(EMA)
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} period - 周期，默认20
 * @returns {Array<number>} EMA值数组
 */
export function calculateEMA(prices, period = 20) {
  const ema = new EMA({
    values: prices,
    period: period
  });
  return ema.getResult();
}

/**
 * 计算随机指标(KDJ)
 * @param {Array<number>} high - 最高价数组
 * @param {Array<number>} low - 最低价数组
 * @param {Array<number>} close - 收盘价数组
 * @param {number} period - 周期，默认14
 * @param {number} signalPeriod - 信号周期，默认3
 * @returns {Object} 包含K线、D线和J线的对象
 */
export function calculateStochastic(high, low, close, period = 14, signalPeriod = 3) {
  const stochastic = new Stochastic({
    high,
    low,
    close,
    period,
    signalPeriod
  });
  
  const result = stochastic.getResult();
  
  // 计算J线 (3*K - 2*D)
  return result.map(item => ({
    k: item.k,
    d: item.d,
    j: 3 * item.k - 2 * item.d
  }));
}

/**
 * 计算变动率(ROC)
 * @param {Array<number>} prices - 收盘价数组
 * @param {number} period - 周期，默认12
 * @returns {Array<number>} ROC值数组
 */
export function calculateROC(prices, period = 12) {
  const roc = new ROC({
    values: prices,
    period: period
  });
  return roc.getResult();
}

/**
 * 计算能量潮指标(OBV)
 * @param {Array<number>} prices - 收盘价数组
 * @param {Array<number>} volumes - 成交量数组
 * @returns {Array<number>} OBV值数组
 */
export function calculateOBV(prices, volumes) {
  const obv = new OBV({
    close: prices,
    volume: volumes
  });
  return obv.getResult();
}

/**
 * 计算平均真实波幅(ATR)
 * @param {Array<number>} highs - 最高价数组
 * @param {Array<number>} lows - 最低价数组
 * @param {Array<number>} closes - 收盘价数组
 * @param {number} period - 周期，默认14
 * @returns {Array<number>} ATR值数组
 */
export function calculateATR(highs, lows, closes, period = 14) {
  const atr = new ATR({
    high: highs,
    low: lows,
    close: closes,
    period: period
  });
  return atr.getResult();
}

/**
 * 计算平均趋向指数(ADX)
 * @param {Array<number>} highs - 最高价数组
 * @param {Array<number>} lows - 最低价数组
 * @param {Array<number>} closes - 收盘价数组
 * @param {number} period - 周期，默认14
 * @returns {Object} 包含ADX、+DI和-DI的对象
 */
export function calculateADX(highs, lows, closes, period = 14) {
  const adx = new ADX({
    high: highs,
    low: lows,
    close: closes,
    period: period
  });
  return adx.getResult();
}

/**
 * 计算商品通道指数(CCI)
 * @param {Array<number>} highs - 最高价数组
 * @param {Array<number>} lows - 最低价数组
 * @param {Array<number>} closes - 收盘价数组
 * @param {number} period - 周期，默认20
 * @returns {Array<number>} CCI值数组
 */
export function calculateCCI(highs, lows, closes, period = 20) {
  const cci = new CCI({
    high: highs,
    low: lows,
    close: closes,
    period: period
  });
  return cci.getResult();
}

/**
 * 获取指标的买卖信号
 * @param {Object} indicators - 包含各个指标计算结果的对象
 * @param {Object} activeIndicators - 激活的指标配置
 * @returns {Object} 包含各个指标买卖信号的对象
 */
// 修改getSignals函数签名和实现
/**
 * 获取指标的买卖信号
 * @param {Object} indicators - 包含各个指标计算结果的对象
 * @param {Object} activeIndicators - 激活的指标配置
 * @returns {Object} 包含各个指标买卖信号的对象
 */
export function getSignals(indicators, activeIndicators = {
  sma: false,
  ema: false,
  kdj: false,
  roc: false
}) {
  const signals = {
    summary: { buy: 0, sell: 0, neutral: 0 }
  };

  // 处理单个指标信号
  function processIndicator(name, data, type) {
    if (!data) return;

    let signal = 'neutral';
    const lastValue = Array.isArray(data) ? data[data.length - 1] : data;

    switch(type) {
      case 'rsi':
        signal = lastValue > 70 ? 'sell' : lastValue < 30 ? 'buy' : 'neutral';
        break;
      case 'macd':
        signal = lastValue.MACD > lastValue.signal ? 'buy' :
                lastValue.MACD < lastValue.signal ? 'sell' : 'neutral';
        break;
      case 'bb':
        if (!indicators.prices) return;
        const price = indicators.prices[indicators.prices.length - 1];
        signal = price > lastValue.upper ? 'sell' :
                price < lastValue.lower ? 'buy' : 'neutral';
        break;
      case 'sma':
      case 'ema':
        if (!indicators.prices) return;
        const currentPrice = indicators.prices[indicators.prices.length - 1];
        const prevPrice = indicators.prices[indicators.prices.length - 2];
        const prevValue = data[data.length - 2];
        signal = (prevPrice < prevValue && currentPrice > lastValue) ? 'buy' :
                (prevPrice > prevValue && currentPrice < lastValue) ? 'sell' : 'neutral';
        break;
      case 'kdj':
        signal = (lastValue.k > lastValue.d) ? 'buy' :
                (lastValue.k < lastValue.d) ? 'sell' : 'neutral';
        break;
      case 'roc':
        signal = lastValue > 0 ? 'buy' : lastValue < 0 ? 'sell' : 'neutral';
        break;
    }

    signals[name] = signal;
    signals.summary[signal]++;
  }

  // 处理基础指标
  processIndicator('rsi', indicators.rsi, 'rsi');
  processIndicator('macd', indicators.macd, 'macd');
  processIndicator('bollingerBands', indicators.bb, 'bb');

  // 处理可选指标
  if (activeIndicators.sma && indicators.sma) {
    processIndicator('sma', indicators.sma, 'sma');
  }
  if (activeIndicators.ema && indicators.ema) {
    processIndicator('ema', indicators.ema, 'ema');
  }
  if (activeIndicators.kdj && indicators.kdj) {
    processIndicator('kdj', indicators.kdj, 'kdj');
  }
  if (activeIndicators.roc && indicators.roc) {
    processIndicator('roc', indicators.roc, 'roc');
  }

  // 计算总体建议
  const { buy, sell, neutral } = signals.summary;
  const total = buy + sell + neutral;
  const buyRatio = buy / total;
  const sellRatio = sell / total;

  if (buyRatio >= 0.6) signals.recommendation = 'buy';
  else if (sellRatio >= 0.6) signals.recommendation = 'sell';
  else if (buy > sell) signals.recommendation = 'buy';
  else if (sell > buy) signals.recommendation = 'sell';
  else signals.recommendation = 'neutral';

  return signals;
}
