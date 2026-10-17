import { useTranslation } from 'react-i18next';
import { Field, Input, Textarea } from '../../components/ui/Field';
import GooglePreview from '../../components/seo/GooglePreview';
import SeoChecklist from '../../components/seo/SeoChecklist';
import {
  SEO_TITLE,
  SEO_DESC,
  lengthTone,
  containsKeyword,
  firstSentences,
  normalize,
} from '../../components/seo/seoUtils';

const toneText = { success: 'text-success-600', warning: 'text-warning-600', danger: 'text-danger-600' };

/**
 * "Référencement (Google)" card of the product form, like Yoast SEO:
 * the title and description Google shows, a search word to aim for, a
 * preview of the Google result and a checklist with advice.
 * Empty fields fall back to the product's name / short description.
 */
export default function ProductSeoPanel({ form, setForm, slug, imageCount, siteName = 'IT Mart' }) {
  const { t } = useTranslation();

  const title = form.seoTitle.trim() || form.nameFr.trim();
  const fullTitle = title ? `${title} — ${siteName}` : '';
  const description =
    form.seoDescription.trim() ||
    form.shortDescriptionFr.trim() ||
    firstSentences(form.descriptionFr);
  const keyword = form.seoKeyword.trim();
  const productText = `${form.shortDescriptionFr} ${form.descriptionFr}`;
  const words = normalize(form.descriptionFr).split(' ').filter(Boolean).length;

  const titleTone = lengthTone(fullTitle.length, SEO_TITLE);
  const descTone = lengthTone(description.length, SEO_DESC);
  const yes = (ok) => (ok ? 'success' : 'danger');

  const checks = [
    keyword
      ? null
      : { key: 'kw', tone: 'warning', text: t('seo.checkKeywordMissing') },
    keyword && { key: 'kwTitle', tone: yes(containsKeyword(title, keyword)), text: t('seo.checkKeywordTitle') },
    keyword && {
      key: 'kwDesc',
      tone: yes(containsKeyword(description, keyword)),
      text: t('seo.checkKeywordDescription'),
    },
    keyword && {
      key: 'kwText',
      tone: containsKeyword(productText, keyword) ? 'success' : 'warning',
      text: t('seo.checkKeywordText'),
    },
    keyword && slug && {
      key: 'kwSlug',
      tone: containsKeyword(slug.replace(/-/g, ' '), keyword) ? 'success' : 'warning',
      text: t('seo.checkKeywordSlug'),
    },
    {
      key: 'titleLen',
      tone: titleTone,
      text: t('seo.checkTitleLength', { count: fullTitle.length, min: SEO_TITLE.min, max: SEO_TITLE.max }),
    },
    {
      key: 'descLen',
      tone: descTone,
      text: t('seo.checkDescriptionLength', { count: description.length, min: SEO_DESC.min, max: SEO_DESC.max }),
    },
    {
      key: 'words',
      tone: words >= 80 ? 'success' : words >= 30 ? 'warning' : 'danger',
      text: t('seo.checkWords', { count: words }),
    },
    { key: 'image', tone: imageCount > 0 ? 'success' : 'danger', text: t('seo.checkImage') },
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500 -mt-2">{t('seo.productIntro')}</p>

      <Field label={t('seo.keyword')} hint={t('seo.keywordHint')}>
        <Input
          value={form.seoKeyword}
          maxLength={60}
          onChange={(e) => setForm((f) => ({ ...f, seoKeyword: e.target.value }))}
          placeholder={t('seo.keywordPlaceholder')}
        />
      </Field>

      <Field
        label={t('seo.title')}
        hint={
          <span>
            {t('seo.titleHint')}{' '}
            <span className={`font-medium ${toneText[titleTone]}`}>
              {fullTitle.length}/{SEO_TITLE.max}
            </span>
          </span>
        }
      >
        <Input
          value={form.seoTitle}
          maxLength={SEO_TITLE.hard}
          onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
          placeholder={form.nameFr || t('seo.titlePlaceholder')}
        />
      </Field>

      <Field
        label={t('seo.description')}
        hint={
          <span>
            {t('seo.descriptionHint')}{' '}
            <span className={`font-medium ${toneText[descTone]}`}>
              {description.length}/{SEO_DESC.max}
            </span>
          </span>
        }
      >
        <Textarea
          rows={3}
          value={form.seoDescription}
          maxLength={SEO_DESC.hard}
          onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
          placeholder={description || t('seo.descriptionPlaceholder')}
        />
      </Field>

      <GooglePreview title={fullTitle} description={description} path={slug ? `products/${slug}` : 'products'} />

      <SeoChecklist checks={checks} />
    </div>
  );
}
