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
export function getSignals(indicators, activeIndicators = {}) {
  const signals = {
    summary: { buy: 0, sell: 0, neutral: 0 }
  };

  // 获取单个指标的信号
  function getSignal(condition, name) {
    let signal = 'neutral';
    if (condition.buy) signal = 'buy';
    else if (condition.sell) signal = 'sell';
    signals[name] = signal;
    signals.summary[signal]++;
  }

  // RSI信号
  if (indicators.rsi?.length > 0) {
    const lastRSI = indicators.rsi[indicators.rsi.length - 1];
    getSignal({
      buy: lastRSI < 30,
      sell: lastRSI > 70
    }, 'rsi');
  }

  // MACD信号
  if (indicators.macd?.length > 0) {
    const lastMACD = indicators.macd[indicators.macd.length - 1];
    getSignal({
      buy: lastMACD.MACD > lastMACD.signal,
      sell: lastMACD.MACD < lastMACD.signal
    }, 'macd');
  }

  // 布林带信号
  if (indicators.bb?.length > 0 && indicators.prices) {
    const lastBB = indicators.bb[indicators.bb.length - 1];
    const lastPrice = indicators.prices[indicators.prices.length - 1];
    getSignal({
      buy: lastPrice < lastBB.lower,
      sell: lastPrice > lastBB.upper
    }, 'bollingerBands');
  }

  // SMA信号
  if (activeIndicators.sma && indicators.sma?.length > 1 && indicators.prices) {
    const lastPrice = indicators.prices[indicators.prices.length - 1];
    const prevPrice = indicators.prices[indicators.prices.length - 2];
    const lastSMA = indicators.sma[indicators.sma.length - 1];
    const prevSMA = indicators.sma[indicators.sma.length - 2];
    getSignal({
      buy: prevPrice < prevSMA && lastPrice > lastSMA,
      sell: prevPrice > prevSMA && lastPrice < lastSMA
    }, 'sma');
  }

  // EMA信号
  if (activeIndicators.ema && indicators.ema?.length > 1 && indicators.prices) {
    const lastPrice = indicators.prices[indicators.prices.length - 1];
    const prevPrice = indicators.prices[indicators.prices.length - 2];
    const lastEMA = indicators.ema[indicators.ema.length - 1];
    const prevEMA = indicators.ema[indicators.ema.length - 2];
    getSignal({
      buy: prevPrice < prevEMA && lastPrice > lastEMA,
      sell: prevPrice > prevEMA && lastPrice < lastEMA
    }, 'ema');
  }

  // KDJ信号
  if (activeIndicators.kdj && indicators.kdj?.length > 1) {
    const lastKDJ = indicators.kdj[indicators.kdj.length - 1];
    const prevKDJ = indicators.kdj[indicators.kdj.length - 2];
    getSignal({
      buy: (lastKDJ.k > lastKDJ.d && prevKDJ.k < prevKDJ.d) || (lastKDJ.k < 20 && lastKDJ.d < 20),
      sell: (lastKDJ.k < lastKDJ.d && prevKDJ.k > prevKDJ.d) || (lastKDJ.k > 80 && lastKDJ.d > 80)
    }, 'kdj');
  }

  // ROC信号
  if (activeIndicators.roc && indicators.roc?.length > 1) {
    const lastROC = indicators.roc[indicators.roc.length - 1];
    const prevROC = indicators.roc[indicators.roc.length - 2];
    getSignal({
      buy: (prevROC < 0 && lastROC > 0) || (lastROC > prevROC && lastROC > 0),
      sell: (prevROC > 0 && lastROC < 0) || (lastROC < prevROC && lastROC < 0)
    }, 'roc');
  }

  // OBV信号
  if (activeIndicators.obv && indicators.obv?.length > 1 && indicators.volumes) {
    const lastOBV = indicators.obv[indicators.obv.length - 1];
    const prevOBV = indicators.obv[indicators.obv.length - 2];
    const lastVolume = indicators.volumes[indicators.volumes.length - 1];
    const avgVolume = indicators.volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, indicators.volumes.length);
    
    getSignal({
      buy: (prevOBV < lastOBV) && (lastVolume > avgVolume * 1.5),
      sell: (prevOBV > lastOBV) && (lastVolume > avgVolume * 1.5)
    }, 'obv');
  }

  // ATR信号
  if (activeIndicators.atr && indicators.atr?.length > 1 && indicators.prices) {
    const lastATR = indicators.atr[indicators.atr.length - 1];
    const lastPrice = indicators.prices[indicators.prices.length - 1];
    const prevPrice = indicators.prices[indicators.prices.length - 2];
    const priceChange = Math.abs(lastPrice - prevPrice);
    
    getSignal({
      buy: priceChange > lastATR * 1.5 && lastPrice > prevPrice,
      sell: priceChange > lastATR * 1.5 && lastPrice < prevPrice
    }, 'atr');
  }

  // ADX信号
  if (activeIndicators.adx && indicators.adx?.length > 1) {
    const lastADX = indicators.adx[indicators.adx.length - 1];
    getSignal({
      buy: lastADX.adx > 25 && lastADX.plusDI > lastADX.minusDI,
      sell: lastADX.adx > 25 && lastADX.plusDI < lastADX.minusDI
    }, 'adx');
  }

  // CCI信号
  if (activeIndicators.cci && indicators.cci?.length > 0) {
    const lastCCI = indicators.cci[indicators.cci.length - 1];
    getSignal({
      buy: lastCCI > 100,
      sell: lastCCI < -100
    }, 'cci');
  }

  // 生成总体建议
  signals.recommendation = signals.summary.buy > signals.summary.sell ? 'buy' :
                          signals.summary.sell > signals.summary.buy ? 'sell' : 'neutral';

  return signals;
}
