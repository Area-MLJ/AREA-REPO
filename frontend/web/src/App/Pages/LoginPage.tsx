/**
 * LoginPage.tsx
 * Page de connexion utilisateur
 */

import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../temp-shared';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.login.fillFields'));
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      showToast(t('auth.login.success'), 'success');
      navigate('/dashboard');
    } else {
      setError(result.error || t('auth.login.error'));
      showToast(result.error || t('auth.login.error'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#0a4a0e] mb-2">
            {t('auth.login.title')}
          </h1>
          <p className="text-[#4D4C47]">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label={t('auth.login.email')}
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label={t('auth.login.password')}
            placeholder={t('auth.login.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && (
            <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#4D4C47]">
            {t('auth.login.noAccount')}{' '}
            <a href="/signup" className="text-[#0a4a0e] font-medium hover:underline">
              {t('auth.login.createAccount')}
            </a>
          </p>
        </div>
      </Card>
      <ToastContainer />
    </div>
  );
}
