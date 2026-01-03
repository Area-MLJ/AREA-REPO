import { initializeRegistry } from '@/core/nodes/registry-init';

// Initialiser le registry au démarrage de l'application
initializeRegistry();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

