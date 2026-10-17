import { useTranslation } from 'react-i18next';
import { shopHost } from './seoUtils';

// What the page looks like in Google's results
export default function GooglePreview({ title, description, path = '' }) {
  const { t } = useTranslation();
  const host = shopHost();
  const crumbs = path.split('/').filter(Boolean);
  return (
    <div className="rounded-lg border border-surface-border bg-white p-3.5">
      <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-2">{t('seo.previewLabel')}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="h-6 w-6 rounded-full bg-surface border border-surface-border flex items-center justify-center text-[10px] font-bold text-ink-500">
          {host.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-[13px] text-ink-900 truncate">{host}</p>
          <p className="text-[12px] text-ink-500 truncate">
            https://{host}
            {crumbs.length > 0 && ` › ${crumbs.join(' › ')}`}
          </p>
        </div>
      </div>
      <p className="text-[18px] leading-snug text-[#1a0dab] line-clamp-1 break-all sm:break-normal">
        {title || t('seo.previewNoTitle')}
      </p>
      <p className="text-[13px] leading-snug text-[#4d5156] line-clamp-2 mt-0.5">
        {description || t('seo.previewNoDescription')}
      </p>
    </div>
  );
}
