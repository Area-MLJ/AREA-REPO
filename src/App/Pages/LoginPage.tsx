/**
 * LoginPage.tsx
 * Page de connexion utilisateur
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../../Shared/SharedIndex';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#0a4a0e] mb-2">
            ACTION-REACTION
          </h1>
          <p className="text-[#6B6962]">Connectez-vous à votre compte</p>
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B6962]">
            Pas encore de compte ?{' '}
            <a href="/signup" className="text-[#0a4a0e] font-medium hover:underline">
              Créer un compte
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
