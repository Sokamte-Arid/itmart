import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('account.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('account.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || t('login.resetLinkInvalid'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-xl text-center">
          <p className="text-sm text-danger-600 mb-4">{t('login.resetLinkInvalid')}</p>
          <Link to="/forgot-password" className="text-sm text-accent-600 hover:underline">
            {t('login.requestNewLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent-500 flex items-center justify-center text-ink-950 mb-3">
            <Cpu size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-white font-bold text-xl">{t('login.resetPasswordTitle')}</h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl">
          {done ? (
            <div className="text-center py-2">
              <CheckCircle2 size={36} className="text-success-600 mx-auto mb-3" />
              <p className="text-sm text-ink-700">{t('login.resetSuccess')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-danger-100 text-danger-600 text-sm">{error}</div>
              )}
              <Field label={t('account.newPassword')} required hint={t('account.passwordHint')}>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label={t('account.confirmPassword')} required>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? t('common.loading') : t('login.resetPasswordSubmit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
