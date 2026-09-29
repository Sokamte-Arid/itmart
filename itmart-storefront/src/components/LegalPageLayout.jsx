import { AlertTriangle } from 'lucide-react';

export default function LegalPageLayout({ title, lastUpdated, disclaimer, sections }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-navy-900 mb-1">{title}</h1>
      <p className="text-xs text-ink-400 mb-6">{lastUpdated}</p>

      {disclaimer && (
        <div className="flex items-start gap-2.5 bg-warning-100 text-warning-600 rounded-lg px-4 py-3 text-sm mb-8">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{disclaimer}</p>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-base font-semibold text-navy-900 mb-2">{section.heading}</h2>
            <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
