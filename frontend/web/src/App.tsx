/**
 * App.tsx
 * Composant racine avec routing et authentification
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './temp-shared';
import { AppLayout } from './App/AppLayout';
import LoginPage from './App/Pages/LoginPage';
import SignupPage from './App/Pages/SignupPage';
import DashboardPage from './App/Pages/DashboardPage';
import ServicesPage from './App/Pages/ServicesPage';
import AreaCreatorPage from './App/Pages/AreaCreatorPage';
import ProfilePage from './App/Pages/ProfilePage';
import { ConnectionTest } from './components/ConnectionTest';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">Chargement...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">Chargement...</div>
      </div>
    );
  }

  // Si connecté → dashboard, sinon → page d'accueil
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-[#0a4a0e] mb-4">
            ACTION-REACTION
          </h1>
          <p className="text-xl text-[#6B6962] mb-8">
            Automatisez vos tâches en connectant vos services préférés
          </p>
          <p className="text-lg text-[#6B6962] mb-12">
            Créez des automatisations intelligentes : quand une action se produit, déclenchez une réaction
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a 
            href="/signup"
            className="bg-[#0a4a0e] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a4a0e]/90 transition-colors min-w-[200px]"
          >
            Créer un compte
          </a>
          <a 
            href="/login"
            className="border-2 border-[#0a4a0e] text-[#0a4a0e] px-8 py-4 rounded-lg font-semibold hover:bg-[#0a4a0e] hover:text-white transition-colors min-w-[200px]"
          >
            Se connecter
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">Connectez</h3>
            <p className="text-[#6B6962]">Gmail, GitHub, Discord et plus encore</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">Automatisez</h3>
            <p className="text-[#6B6962]">Créez des workflows intelligents</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">Optimisez</h3>
            <p className="text-[#6B6962]">Gagnez du temps sur vos tâches</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/area/create"
        element={
          <ProtectedRoute>
            <AreaCreatorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={<ConnectionTest />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
