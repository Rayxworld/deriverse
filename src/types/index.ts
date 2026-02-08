export interface Trade {
  id: string;
  symbol: string;
  type: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  fee: number;
  duration: number; // in minutes
  timestamp: number;
  side: 'Buy' | 'Sell';
  orderType: 'Market' | 'Limit';
}

export interface PortfolioStats {
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  volume: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  profitFactor: number;
  totalFees: number;
}
