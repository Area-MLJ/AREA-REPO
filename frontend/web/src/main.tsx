import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/i18n'; // Initialiser i18n avant tout
import App from './App.tsx';
import './index.css';

// #region agent log
fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:6',message:'main.tsx entry',data:{rootExists:!!document.getElementById('root')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

try {
  const rootElement = document.getElementById('root');
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:12',message:'before createRoot',data:{rootElement:!!rootElement},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:22',message:'before render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:32',message:'after render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/abb7578f-ab51-4215-9b1b-56b2d12e7d0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:35',message:'error in main.tsx',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  console.error('Error rendering app:', error);
}
