/**
 * App.tsx
 * Composant racine avec routing et authentification
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import { AuthProvider, useAuth } from './temp-shared';
import { AppLayout } from './App/AppLayout';
import LoginPage from './App/Pages/LoginPage';
import SignupPage from './App/Pages/SignupPage';
import DashboardPage from './App/Pages/DashboardPage';
import ServicesPage from './App/Pages/ServicesPage';
import AreaCreatorPage from './App/Pages/AreaCreatorPage';
import ProfilePage from './App/Pages/ProfilePage';
import { ConnectionTest } from './components/ConnectionTest';
import i18n from './lib/i18n';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <div className="text-[#0a4a0e] text-xl">{t('common.loading')}</div>
      </div>
    );
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
          <p className="text-xl text-[#6B6962] mb-8">
            {t('home.subtitle')}
          </p>
          <p className="text-lg text-[#6B6962] mb-12">
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
            <p className="text-[#6B6962]">{t('home.connect.description')}</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">{t('home.automate.title')}</h3>
            <p className="text-[#6B6962]">{t('home.automate.description')}</p>
          </div>
          <div className="bg-white/50 p-6 rounded-lg">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-[#0a4a0e] mb-2">{t('home.optimize.title')}</h3>
            <p className="text-[#6B6962]">{t('home.optimize.description')}</p>
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:187',message:'App component entry',data:{i18nReady:i18n.isInitialized,language:i18n.language},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:192',message:'useEffect entry',data:{language:i18n.language},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = i18n.language;
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:196',message:'after setting lang',data:{lang:document.documentElement.lang},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Écouter les changements de langue
    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:210',message:'before return JSX',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

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
