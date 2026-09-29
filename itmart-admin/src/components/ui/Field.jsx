export function Field({ label, required, error, children, hint }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-ink-800 mb-1.5">
          {label} {required && <span className="text-danger-600">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}

const baseInputClasses =
  'w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors';

export function Input(props) {
  return <input className={baseInputClasses} {...props} />;
}

export function Textarea(props) {
  return <textarea className={`${baseInputClasses} min-h-[90px] resize-y`} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={baseInputClasses} {...props}>
      {children}
    </select>
  );
}
