import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cpu, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('itmart_admin_lang', lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center rounded-lg border border-white/15 overflow-hidden text-sm">
        <button
          onClick={() => switchLang('fr')}
          className={`px-3 py-1.5 flex items-center gap-1 ${
            i18n.language === 'fr' ? 'bg-accent-500 text-ink-950 font-semibold' : 'text-ink-300 hover:bg-white/5'
          }`}
        >
          <Globe size={13} /> FR
        </button>
        <button
          onClick={() => switchLang('en')}
          className={`px-3 py-1.5 flex items-center gap-1 border-l border-white/15 ${
            i18n.language === 'en' ? 'bg-accent-500 text-ink-950 font-semibold' : 'text-ink-300 hover:bg-white/5'
          }`}
        >
          <Globe size={13} /> EN
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent-500 flex items-center justify-center text-ink-950 mb-3">
            <Cpu size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-white font-bold text-xl">{t('login.title')}</h1>
          <p className="text-ink-300 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-xl">
          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-danger-100 text-danger-600 text-sm">
              {error}
            </div>
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
          <Field label={t('login.password')} required>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <div className="text-right -mt-2 mb-4">
            <Link to="/forgot-password" className="text-xs text-ink-500 hover:text-accent-600">
              {t('login.forgotPassword')}
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('login.submit')}
          </Button>
        </form>
      </div>
    </div>
  );
}
