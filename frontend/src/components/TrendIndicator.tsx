type TrendIndicatorProps = {
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
};

export default function TrendIndicator({ trend, change, changePercent }: TrendIndicatorProps) {
  const safeChange = typeof change === 'number' ? change : 0;
  const safeChangePercent = typeof changePercent === 'number' ? changePercent : 0;

  const color =
    trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#6b7280';
  const arrow = trend === 'up' ? '\u25B2' : trend === 'down' ? '\u25BC' : '\u25C6';
  const label = trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'Stable';

  return (
    <span
      style={{
        color,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
      title={`${label}: ${safeChange >= 0 ? '+' : ''}${safeChange.toFixed(2)} (${safeChangePercent >= 0 ? '+' : ''}${safeChangePercent.toFixed(2)}%)`}
    >
      {arrow} {safeChangePercent >= 0 ? '+' : ''}{safeChangePercent.toFixed(1)}%
    </span>
  );
}
