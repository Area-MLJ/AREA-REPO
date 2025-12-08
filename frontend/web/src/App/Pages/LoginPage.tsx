/**
 * LoginPage.tsx
 * Page de connexion utilisateur
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../../temp-shared';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
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
      setError('Veuillez remplir tous les champs');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      showToast('Connexion réussie !', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
      showToast(result.error || 'Erreur de connexion', 'error');
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
            disabled={isLoading}
          />

          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
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
            {isLoading ? 'Connexion...' : 'Se connecter'}
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
      <ToastContainer />
    </div>
  );
}
