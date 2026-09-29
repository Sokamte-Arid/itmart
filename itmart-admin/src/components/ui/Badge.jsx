const tones = {
  neutral: 'bg-ink-900/5 text-ink-700',
  success: 'bg-success-100 text-success-600',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-600',
  info: 'bg-info-100 text-info-600',
  accent: 'bg-accent-100 text-accent-600',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
