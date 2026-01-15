import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/i18n'; // Initialiser i18n avant tout
import App from './App.tsx';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
}
