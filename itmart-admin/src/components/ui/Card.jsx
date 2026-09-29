export default function Card({ children, className = '', padded = true }) {
  return (
    <div
      className={`bg-white rounded-xl border border-surface-border ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
