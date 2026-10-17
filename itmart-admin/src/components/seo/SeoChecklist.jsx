import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 size={15} className="text-success-600 shrink-0 mt-0.5" />,
  warning: <AlertCircle size={15} className="text-warning-600 shrink-0 mt-0.5" />,
  danger: <XCircle size={15} className="text-danger-600 shrink-0 mt-0.5" />,
};

// checks: [{ key, tone: 'success'|'warning'|'danger', text }]
export default function SeoChecklist({ checks }) {
  const { t } = useTranslation();
  const good = checks.filter((c) => c.tone === 'success').length;
  const score = checks.length ? good / checks.length : 0;
  const overall = score >= 0.8 ? 'success' : score >= 0.5 ? 'warning' : 'danger';
  const dot = { success: 'bg-success-600', warning: 'bg-warning-600', danger: 'bg-danger-600' }[overall];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} aria-hidden="true" />
        <p className="text-sm font-medium text-ink-900">
          {t(`seo.score_${overall}`)} <span className="text-ink-500 font-normal">({good}/{checks.length})</span>
        </p>
      </div>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2 text-[13px] text-ink-700">
            {ICONS[c.tone]}
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
