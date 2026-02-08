import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, subtitle }) => {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ backgroundColor: 'var(--glass)', padding: '10px', borderRadius: '12px' }}>
          <Icon size={20} color="var(--brand-primary)" />
        </div>
        {trend && (
          <div style={{ 
            color: trend.isPositive ? 'var(--success)' : 'var(--error)',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
        <h3 className="stat-value" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>
          <span className="glow-text">{value}</span>
        </h3>
        {subtitle && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;
