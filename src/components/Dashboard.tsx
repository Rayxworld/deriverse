import React, { useMemo, useState } from 'react';
import { 
  DollarSign, 
  BarChart3,
  Filter,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  ExternalLink,
  Share2
} from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import StatCard from './StatCard';
import { useTradingData } from '../hooks/useTradingData';
import { calculateStats, getLongShortData, getOrderTypeStats, getTimeOfDayStats, getAssetDistribution, calculateRiskProfile } from '../utils/analytics';
import { journalService } from '../services/journal';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { format } from 'date-fns';

const NewbieExplainer = () => (
  <div className="glass-card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--brand-primary)', background: 'linear-gradient(90deg, rgba(0, 255, 163, 0.05) 0%, transparent 100%)' }}>
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0, 255, 163, 0.1)' }}>
        <BookOpen color="var(--brand-primary)" size={24} />
      </div>
      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>New to Deriverse?</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '800px' }}>
          Deriverse is a decentralized trading protocol on Solana. This dashboard helps you track your performance 
          across on-chain perpetuals and spot markets. Connect your wallet to view your real-time PnL, risk metrics, 
          and trade history directly from the blockchain.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <a href="https://deriverse.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Official Site <ExternalLink size={14} />
          </a>
          <a href="https://docs.deriverse.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Documentation <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { trades, loading, isDemo, setIsDemo, walletAddress } = useTradingData();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  
  const filteredTrades = useMemo(() => {
    if (!assetFilter) return trades;
    return trades.filter(t => t.symbol.toLowerCase().includes(assetFilter.toLowerCase()));
  }, [trades, assetFilter]);

  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades]);
  const longShortData = useMemo(() => getLongShortData(filteredTrades), [filteredTrades]);
  const assetDistribution = useMemo(() => getAssetDistribution(filteredTrades), [filteredTrades]);
  const riskProfile = useMemo(() => calculateRiskProfile(filteredTrades), [filteredTrades]);

  const chartData = useMemo(() => {
    const data: { date: string; pnl: number; rawPnL: number }[] = [];
    let cumulative = 0;
    const reversed = [...trades].reverse();
    
    for (const t of reversed) {
      cumulative += t.pnl;
      data.push({
        date: format(t.timestamp, 'MMM dd'),
        pnl: cumulative,
        rawPnL: t.pnl
      });
    }
    return data;
  }, [trades]);

  const avgDuration = useMemo(() => {
    if (filteredTrades.length === 0) return 0;
    const total = filteredTrades.reduce((acc, t) => acc + t.duration, 0);
    return Math.round(total / filteredTrades.length);
  }, [filteredTrades]);

  const exportCSV = () => {
    const headers = ['Symbol', 'Type', 'Entry', 'Exit', 'Size', 'PnL', 'Fee', 'Duration', 'Timestamp'];
    const rows = filteredTrades.map(t => [
      t.symbol,
      t.type,
      t.entryPrice,
      t.exitPrice,
      t.size,
      t.pnl,
      t.fee,
      t.duration,
      format(t.timestamp, 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `deriverse_trades_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sharePerformance = () => {
    if (!walletAddress) return;
    let backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    if (!backendUrl.startsWith('http')) {
      backendUrl = `https://${backendUrl}`;
    }
    
    const params = new URLSearchParams({
      winRate: stats.winRate.toFixed(1),
      totalPnL: stats.totalPnL.toFixed(2),
      trades: trades.length.toString(),
    });

    if (avatarUrl) {
      params.append('avatar', avatarUrl);
    }
    
    const shareUrl = `${backendUrl}/api/share/${walletAddress}?${params.toString()}`;
    window.open(shareUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '700' }}>Initializing Analytics...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Trading Analytics</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Deriverse V1 Platform</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isDemo ? 'var(--warning)' : 'var(--success)', fontSize: '0.875rem' }}>
              {isDemo ? <ShieldCheck size={14} /> : <Zap size={14} className="pulse" fill="var(--success)" />}
              {isDemo ? 'Demo Preview' : `Connected: ${walletAddress}`}
            </div>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isDemo && walletAddress && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Avatar URL..." 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-primary)', 
                  padding: '8px 12px', 
                  borderRadius: '10px', 
                  fontSize: '0.8125rem',
                  width: '120px'
                }} 
              />
              <button 
                onClick={sharePerformance}
                className="glass-card" 
                style={{ 
                  padding: '8px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0, 255, 163, 0.1)',
                  border: '1px solid var(--brand-primary)',
                  color: 'var(--brand-primary)',
                  fontWeight: '600',
                  fontSize: '0.8125rem'
                }}
              >
                <Share2 size={14} /> Share Results
              </button>
            </div>
          )}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            <button 
              onClick={() => setIsDemo(true)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer',
                backgroundColor: isDemo ? 'var(--bg-tertiary)' : 'transparent',
                color: isDemo ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              Demo
            </button>
            <button 
              onClick={() => setIsDemo(false)}
              disabled={!walletAddress}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer',
                backgroundColor: !isDemo && walletAddress ? 'var(--bg-tertiary)' : 'transparent',
                color: !isDemo && walletAddress ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                opacity: !walletAddress ? 0.5 : 1
              }}
            >
              Live
            </button>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <NewbieExplainer />

      {/* Primary Metrics */}
      <div className="stats-grid">
        <StatCard 
          title="Total PnL" 
          value={`$${stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={DollarSign}
          trend={{ value: 14.2, isPositive: stats.totalPnL > 0 }}
        />
        <StatCard 
          title="Win Rate" 
          value={`${stats.winRate.toFixed(1)}%`} 
          icon={TrendingUp}
          subtitle={`${trades.filter(t => t.pnl > 0).length} wins / ${trades.length} trades`}
        />
        <StatCard 
          title="Profit Factor" 
          value={stats.profitFactor.toFixed(2)} 
          icon={BarChart3}
          subtitle="Win/Loss Ratio"
        />
        <StatCard 
          title="Portfolio Risk" 
          value={riskProfile.label} 
          icon={ShieldCheck}
          subtitle={`Risk Score: ${riskProfile.score}/100`}
        />
      </div>

      {/* Primary Charts Section */}
      <div className="charts-main-grid">
        {/* Main Performance Chart */}
        <div className="glass-card" style={{ height: '520px', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>PnL Curve & Drawdown Analysis</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cumulative PnL</span>
              </div>
            </div>
          </div>
          <div style={{ width: '100%', height: '80%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--brand-primary)' }}
                />
                <Area type="monotone" dataKey="pnl" stroke="var(--brand-primary)" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Directional Bias & Distribution */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '24px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '248px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Long/Short Ratio</h3>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              <div style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={longShortData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {longShortData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600' }}>Bias</span>
                <br />
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: longShortData[0].value > longShortData[1].value ? 'var(--success)' : 'var(--error)' }}>
                  {longShortData[0].value > longShortData[1].value ? 'Long' : 'Short'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '248px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Asset Allocation</h3>
            <div style={{ flex: 1, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number | string | undefined) => value !== undefined ? `${Number(value).toFixed(1)}%` : ''}
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Assets</span>
                <br />
                <span style={{ fontSize: '0.875rem', fontWeight: '800' }}>{assetDistribution.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
              {assetDistribution.slice(0, 3).map((asset, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: asset.color }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{asset.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-sub-grid">
        {/* Order Type Analysis */}
        <div className="glass-card" style={{ height: '350px', minWidth: 0 }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>PnL by Order Type</h3>
          <div style={{ width: '100%', height: '80%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getOrderTypeStats(trades)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" fontSize={12} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {getOrderTypeStats(trades).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--success)' : 'var(--error)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Analysis */}
        <div className="glass-card" style={{ height: '350px', minWidth: 0 }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Session Performance</h3>
          <div style={{ width: '100%', height: '80%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTimeOfDayStats(trades)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {getTimeOfDayStats(trades).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'var(--success)' : 'var(--error)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="footer-stats-grid">
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(0, 209, 255, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Clock size={24} color="var(--brand-secondary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg. Duration</p>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{avgDuration} min</h4>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px' }}>
            <LayoutGrid size={24} color="var(--text-primary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Fees</p>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>${stats.totalFees.toFixed(2)}</h4>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <ArrowUpRight size={24} color="var(--success)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Trade Count</p>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{trades.length}</h4>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Comprehensive Trade History</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Filter assets..." 
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                style={{ 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border)', 
                  color: 'var(--text-primary)', 
                  padding: '8px 16px 8px 34px', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '180px'
                }} 
              />
            </div>
            <button 
              onClick={exportCSV}
              style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
              <LayoutGrid size={14} /> Export CSV
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="trade-table">
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '12px 16px' }}>Asset</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>Size</th>
                <th>PnL</th>
                <th>Fee</th>
                <th>Duration</th>
                <th>Annotations</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    No trades found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTrades.slice(0, 15).map((trade, i) => (
                  <tr key={i} className="trade-row" style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9375rem', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{trade.symbol}</td>
                    <td>
                      <span style={{ 
                        color: trade.type === 'Long' ? 'var(--success)' : 'var(--error)',
                        backgroundColor: trade.type === 'Long' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {trade.type}
                      </span>
                    </td>
                    <td>${trade.entryPrice.toFixed(2)}</td>
                    <td>${trade.exitPrice.toFixed(2)}</td>
                    <td>${trade.size.toLocaleString()}</td>
                    <td style={{ color: trade.pnl > 0 ? 'var(--success)' : 'var(--error)', fontWeight: '700' }}>
                      {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)' }}>${trade.fee.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-tertiary)' }}>{trade.duration}m</td>
                    <td style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        placeholder="Add note..." 
                        defaultValue={i % 3 === 0 ? "Good entry, high vol" : ""}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', color: 'var(--text-primary)', fontSize: '0.8125rem', width: '150px' }}
                      />
                      {!isDemo && walletAddress && (
                        <button 
                          onClick={() => journalService.saveNote(null, trade.symbol + trade.timestamp, "Successful trade")}
                          style={{ background: 'var(--brand-primary)', border: 'none', color: 'black', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          SOL SAVE
                        </button>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', textAlign: 'right', paddingRight: '16px' }}>
                      {format(trade.timestamp, 'MMM dd, HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
