/**
 * SignupPage.tsx
 * Page d'inscription utilisateur
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../../Shared/SharedIndex';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-[#0a4a0e] mb-2">
            Compte créé !
          </h2>
          <p className="text-[#6B6962] mb-6">
            Vous pouvez maintenant vous connecter
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#0a4a0e] mb-2">
            ACTION-REACTION
          </h1>
          <p className="text-[#6B6962]">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            helperText="Minimum 6 caractères"
          />

          <Input
            type="password"
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B6962]">
            Déjà un compte ?{' '}
            <a href="/login" className="text-[#0a4a0e] font-medium hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
