# 比特币交易指标仪表板

这是一个实时监控比特币交易指标的仪表板应用，使用Vue.js构建。该应用可以连接到Binance API获取实时比特币数据，并计算和显示多种技术指标。

## 功能特点

- 实时显示比特币价格和24小时价格变化
- 价格图表可视化
- 技术指标计算和显示：
  - RSI (相对强弱指标)
  - MACD (移动平均线趋同散度)
  - 布林带 (Bollinger Bands)
- 买入/卖出信号指示（绿色表示买入，红色表示卖出，灰色表示中性）
- 信号汇总和交易建议

## 项目结构

```
crypto_dashboard/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # Vue组件
│   │   └── CryptoIndicators.vue  # 主要仪表板组件
│   ├── services/         # API服务
│   │   └── binanceService.js     # Binance API服务
│   ├── utils/            # 工具函数
│   │   └── indicators.js         # 技术指标计算
│   ├── App.vue           # 主应用组件
│   └── main.js           # 应用入口
├── index.html            # HTML模板
└── package.json          # 项目依赖
```

## 安装和运行

1. 确保已安装Node.js和npm

2. 安装项目依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 技术栈

- Vue 3 - 前端框架
- Chart.js - 图表库
- Axios - HTTP客户端
- technicalindicators - 技术指标计算库

## 自定义配置

### Binance API

默认情况下，应用使用Binance的公共API获取数据，不需要API密钥。如果需要使用私有API功能，请在`src/services/binanceService.js`中添加您的API密钥。

### 指标参数

可以在`src/utils/indicators.js`中调整技术指标的参数，如RSI周期、MACD参数等。

## 未来计划

- 添加更多技术指标
- 支持多种时间周期
- 添加自定义警报功能
- 支持多种加密货币
- 添加历史数据分析
