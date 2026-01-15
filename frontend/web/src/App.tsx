/**
 * App.tsx
 * Composant racine avec routing et authentification
 */

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { AuthProvider, useAuth } from './temp-shared';
import { AppLayout } from './App/AppLayout';
import LoginPage from './App/Pages/LoginPage';
import SignupPage from './App/Pages/SignupPage';
import i18n from './lib/i18n';

// Lazy load des pages pour améliorer les performances
const DashboardPage = lazy(() => import('./App/Pages/DashboardPage').then(m => ({ default: m.default })));
const ServicesPage = lazy(() => import('./App/Pages/ServicesPage').then(m => ({ default: m.default })));
const AreaCreatorPage = lazy(() => import('./App/Pages/AreaCreatorPage').then(m => ({ default: m.default })));
const ProfilePage = lazy(() => import('./App/Pages/ProfilePage').then(m => ({ default: m.default })));
const ConnectionTest = lazy(() => import('./components/ConnectionTest').then(m => ({ default: m.ConnectionTest })));

// Composant de chargement pour le lazy loading
function LoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
      <div className="text-[#0a4a0e] text-xl">{t('common.loading')}</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function HomePage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">{t('common.loading')}</div>
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
            {t('home.title')}
          </h1>
          <p className="text-xl text-[#4D4C47] mb-8">
            {t('home.subtitle')}
          </p>
          <p className="text-lg text-[#4D4C47] mb-12">
            {t('home.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a 
            href="/signup"
            className="bg-[#0a4a0e] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a4a0e]/90 transition-colors min-w-[200px]"
          >
            {t('home.createAccount')}
          </a>
          <a 
            href="/login"
            className="border-2 border-[#0a4a0e] text-[#0a4a0e] px-8 py-4 rounded-lg font-semibold hover:bg-[#0a4a0e] hover:text-white transition-colors min-w-[200px]"
          >
            {t('home.login')}
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">{t('home.connect.title')}</h3>
            <p className="text-[#4D4C47]">{t('home.connect.description')}</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">{t('home.automate.title')}</h3>
            <p className="text-[#4D4C47]">{t('home.automate.description')}</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">{t('home.optimize.title')}</h3>
            <p className="text-[#4D4C47]">{t('home.optimize.description')}</p>
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
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ServicesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/area/create"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AreaCreatorPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ConnectionTest />
          </Suspense>
        }
      />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = i18n.language;
    
    // Écouter les changements de langue
    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
