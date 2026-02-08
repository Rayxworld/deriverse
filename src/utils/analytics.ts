import type { Trade, PortfolioStats } from '../types';

export const calculateStats = (trades: Trade[]): PortfolioStats => {
  if (trades.length === 0) {
    return {
      totalPnL: 0,
      winRate: 0,
      totalTrades: 0,
      volume: 0,
      avgWin: 0,
      avgLoss: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      totalFees: 0,
    };
  }

  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const totalFees = trades.reduce((acc, t) => acc + t.fee, 0);
  const winners = trades.filter(t => t.pnl > 0);
  const losers = trades.filter(t => t.pnl <= 0);
  
  const totalWins = winners.reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(losers.reduce((acc, t) => acc + t.pnl, 0));
  
  // Drawdown calculation
  let peak = 0;
  let currentPnL = 0;
  let maxDrawdown = 0;
  
  [...trades].reverse().forEach(t => {
    currentPnL += t.pnl;
    if (currentPnL > peak) peak = currentPnL;
    const drawdown = peak - currentPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  return {
    totalPnL,
    winRate: (winners.length / trades.length) * 100,
    totalTrades: trades.length,
    volume: trades.reduce((acc, t) => acc + t.size, 0),
    avgWin: winners.length > 0 ? totalWins / winners.length : 0,
    avgLoss: losers.length > 0 ? totalLosses / losers.length : 0,
    maxDrawdown,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins,
    totalFees,
  };
};

export const getOrderTypeStats = (trades: Trade[]) => {
  const market = trades.filter(t => t.orderType === 'Market');
  const limit = trades.filter(t => t.orderType === 'Limit');
  
  return [
    { name: 'Market', pnl: market.reduce((acc, t) => acc + t.pnl, 0), count: market.length },
    { name: 'Limit', pnl: limit.reduce((acc, t) => acc + t.pnl, 0), count: limit.length }
  ];
};

export const getTimeOfDayStats = (trades: Trade[]) => {
  const sessions = {
    'Asian': 0,
    'London': 0,
    'New York': 0
  };

  trades.forEach(t => {
    const hour = new Date(t.timestamp).getUTCHours();
    if (hour >= 0 && hour < 8) sessions['Asian'] += t.pnl;
    else if (hour >= 8 && hour < 16) sessions['London'] += t.pnl;
    else sessions['New York'] += t.pnl;
  });

  return Object.entries(sessions).map(([name, pnl]) => ({ name, pnl }));
};

export const getLongShortData = (trades: Trade[]) => {
  const longs = trades.filter(t => t.type === 'Long').length;
  const shorts = trades.filter(t => t.type === 'Short').length;
  return [
    { name: 'Long', value: longs, color: 'var(--success)' },
    { name: 'Short', value: shorts, color: 'var(--error)' }
  ];
};
export const getAssetDistribution = (trades: Trade[]) => {
  const distribution: Record<string, number> = {};
  trades.forEach(t => {
    distribution[t.symbol] = (distribution[t.symbol] || 0) + t.size;
  });
  
  const total = Object.values(distribution).reduce((acc, v) => acc + v, 0);
  
  const colors = ['var(--brand-primary)', '#818cf8', '#60a5fa', '#34d399', '#fbbf24'];
  
  return Object.entries(distribution).map(([name, value], i) => ({
    name,
    value: (value / total) * 100,
    color: colors[i % colors.length]
  })).sort((a, b) => b.value - a.value);
};

export const calculateRiskProfile = (trades: Trade[]) => {
  if (trades.length === 0) return { label: 'Neutral', score: 50, color: 'var(--text-tertiary)' };
  
  const avgSize = trades.reduce((acc, t) => acc + t.size, 0) / trades.length;
  const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;
  
  // High avg size + Market orders = Aggressive
  const marketOrders = trades.filter(t => t.orderType === 'Market').length / trades.length;
  
  let score = 50;
  if (marketOrders > 0.7) score += 20;
  if (winRate > 60) score += 10;
  if (avgSize > 10000) score += 20;
  
  if (score >= 70) return { label: 'Aggressive', score, color: 'var(--error)' };
  if (score <= 40) return { label: 'Conservative', score, color: 'var(--brand-primary)' };
  return { label: 'Moderate', score, color: 'var(--warning)' };
};
