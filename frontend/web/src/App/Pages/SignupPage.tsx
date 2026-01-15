/**
 * SignupPage.tsx
 * Page d'inscription utilisateur avec backend integration
 */

import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../temp-shared';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword || !displayName) {
      setError(t('auth.signup.fillFields'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.signup.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.signup.passwordTooShort'));
      return;
    }

    const result = await register(email, password, displayName);

    if (result.success) {
      showToast(t('auth.signup.success'), 'success');
      navigate('/dashboard');
    } else {
      setError(result.error || t('auth.signup.error'));
      showToast(result.error || t('auth.signup.error'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#0a4a0e] mb-2">
            {t('auth.signup.title')}
          </h1>
          <p className="text-[#4D4C47]">{t('auth.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label={t('auth.signup.displayName')}
            placeholder={t('auth.signup.displayNamePlaceholder')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="email"
            label={t('auth.signup.email')}
            placeholder={t('auth.signup.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label={t('auth.signup.password')}
            placeholder={t('auth.signup.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            type="password"
            label={t('auth.signup.confirmPassword')}
            placeholder={t('auth.signup.passwordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#4D4C47]">
            {t('auth.signup.hasAccount')}{' '}
            <a href="/login" className="text-[#0a4a0e] font-medium hover:underline">
              {t('auth.signup.login')}
            </a>
          </p>
        </div>
      </Card>
      <ToastContainer />
    </div>
  );
}