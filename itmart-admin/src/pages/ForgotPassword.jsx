import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPassword } from '../api/auth';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      // Backend always returns a generic success message, whether or not
      // the email matched an account — this is intentional, so this page
      // can't be used to discover which emails have admin accounts.
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent-500 flex items-center justify-center text-ink-950 mb-3">
            <Cpu size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-white font-bold text-xl">{t('login.forgotPasswordTitle')}</h1>
          <p className="text-ink-300 text-sm mt-1 text-center">{t('login.forgotPasswordSubtitle')}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl">
          {sent ? (
            <div className="text-center py-2">
              <MailCheck size={36} className="text-success-600 mx-auto mb-3" />
              <p className="text-sm text-ink-700">{t('login.resetLinkSent')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-danger-100 text-danger-600 text-sm">{error}</div>
              )}
              <Field label={t('login.email')} required>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@itmart.cm"
                  autoComplete="email"
                />
              </Field>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? t('common.loading') : t('login.sendResetLink')}
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 mt-5"
          >
            <ArrowLeft size={14} /> {t('login.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
