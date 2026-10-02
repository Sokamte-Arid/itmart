export default function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-4 sm:p-5 flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div
        className={`shrink-0 h-9 w-9 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center ${
          accent ? 'bg-accent-100 text-accent-600' : 'bg-ink-900/5 text-ink-700'
        }`}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs sm:text-sm text-ink-500 truncate">{label}</p>
        <p className="text-lg sm:text-2xl leading-tight font-bold text-ink-900 font-mono-data break-words sm:truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
