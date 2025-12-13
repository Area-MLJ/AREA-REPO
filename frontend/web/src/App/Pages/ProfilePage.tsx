/**
 * ProfilePage.tsx
 * Page de profil utilisateur
 */

import { useAuth } from '../../temp-shared';
import { Card } from '../../DesignSystem/components/Card';
import { Button } from '../../DesignSystem/components/Button';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1A1A18]">Profil</h1>
        <p className="text-sm md:text-base text-[#6B6962] mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card variant="elevated" padding="md" className="md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-4 md:mb-6">
          Informations du compte
        </h2>

        <div className="space-y-4">
          <div>
            <div className="text-xs md:text-sm text-[#8B8980] mb-1">Email</div>
            <div className="text-sm md:text-base font-medium text-[#1A1A18] break-all">{user?.email}</div>
          </div>

          <div>
            <div className="text-xs md:text-sm text-[#8B8980] mb-1">ID Utilisateur</div>
            <div className="font-mono text-xs md:text-sm text-[#6B6962] break-all">{user?.id}</div>
          </div>

          <div>
            <div className="text-xs md:text-sm text-[#8B8980] mb-1">Créé le</div>
            <div className="text-sm md:text-base text-[#4D4C47]">
              {user?.created_at && new Date(user.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card variant="outlined" padding="md" className="md:p-8">
        <h2 className="text-lg md:text-xl font-semibold text-[#1A1A18] mb-3 md:mb-4">
          Zone de danger
        </h2>
        <p className="text-sm md:text-base text-[#6B6962] mb-4">
          Déconnectez-vous de votre compte
        </p>
        <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
          Se déconnecter
        </Button>
      </Card>
    </div>
  );
}
