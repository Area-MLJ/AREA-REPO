/**
 * SignupPage.tsx
 * Page d'inscription utilisateur avec backend integration
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../../temp-shared';
import { Button } from '../../DesignSystem/components/Button';
import { Input } from '../../DesignSystem/components/Input';
import { Card } from '../../DesignSystem/components/Card';
import { useToast } from '../../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
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
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const result = await register(email, password, displayName);

    if (result.success) {
      showToast('Compte créé avec succès !', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erreur lors de la création du compte');
      showToast(result.error || 'Erreur lors de la création du compte', 'error');
    }
  };

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
            type="text"
            label="Nom d'affichage"
            placeholder="Votre nom"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isLoading}
          />

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

          <Input
            type="password"
            label="Confirmer le mot de passe"
            placeholder="••••••••"
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
            {isLoading ? 'Création...' : 'Créer le compte'}
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
      <ToastContainer />
    </div>
  );
}