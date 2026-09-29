const variants = {
  primary: 'bg-accent-500 hover:bg-accent-600 text-ink-950 font-semibold',
  secondary: 'bg-white hover:bg-surface border border-surface-border text-ink-900',
  danger: 'bg-danger-600 hover:bg-red-700 text-white',
  ghost: 'hover:bg-ink-800/5 text-ink-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
