export default function StatCard({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 flex items-center gap-4">
      <div
        className={`shrink-0 h-11 w-11 rounded-lg flex items-center justify-center ${
          accent ? 'bg-accent-100 text-accent-600' : 'bg-ink-900/5 text-ink-700'
        }`}
      >
        {Icon && <Icon size={20} />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-ink-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-ink-900 font-mono-data truncate">{value}</p>
      </div>
    </div>
  );
}
