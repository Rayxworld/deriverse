import type { Trade } from '../types';

export const generateMockTrades = (count: number = 50): Trade[] => {
  const symbols = ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'JUP-SPOT', 'PYTH-PERP'];
  const trades: Trade[] = [];
  const currentTime = Date.now();

  for (let i = 0; i < count; i++) {
    const isWin = Math.random() > 0.45;
    const pnl = isWin ? Math.random() * 500 : Math.random() * -400;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    trades.push({
      id: `trade-${i}`,
      symbol,
      type: Math.random() > 0.5 ? 'Long' : 'Short',
      entryPrice: Math.random() * 100 + 50,
      exitPrice: Math.random() * 100 + 50,
      size: Math.random() * 1000 + 100,
      pnl,
      fee: Math.random() * 5 + 1,
      duration: Math.floor(Math.random() * 1440), // Up to 24 hours
      timestamp: currentTime - (i * 3600000 * 4), // Every 4 hours back
      side: Math.random() > 0.5 ? 'Buy' : 'Sell',
      orderType: Math.random() > 0.8 ? 'Limit' : 'Market',
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
};
