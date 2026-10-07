import React from 'react';
import { Star } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, accentColor = '#6366F1', isRating = false }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div
          className="stat-icon-wrap"
          style={{
            background: `${accentColor}20`,
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          {Icon && <Icon size={20} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <div className="stat-value">{value}</div>
        {isRating && Number(value) > 0 && (
          <span style={{ color: '#FBBF24', display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '1rem' }}>
            <Star size={16} fill="#FBBF24" /> / 5.0
          </span>
        )}
      </div>

      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
