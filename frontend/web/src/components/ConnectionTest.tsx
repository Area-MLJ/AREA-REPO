import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Button } from '../DesignSystem/components/Button';
import { Card } from '../DesignSystem/components/Card';
import { useToast } from './Toast';

export const ConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { showToast, ToastContainer } = useToast();

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getServerInfo();
      
      if (response.success) {
        setResult(response.data);
        showToast('Connexion au backend réussie !', 'success');
      } else {
        setResult({ error: response.error });
        showToast('Erreur de connexion: ' + response.error, 'error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Network error';
      setResult({ error: errorMsg });
      showToast('Erreur réseau: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await apiClient.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (response.success && response.data) {
        setResult({
          message: 'Login successful',
          user: response.data.user,
          tokenExists: !!response.data.token
        });
        showToast('Authentification réussie !', 'success');
      } else {
        setResult({ error: response.error });
        showToast('Erreur d\'authentification: ' + response.error, 'error');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Auth error';
      setResult({ error: errorMsg });
      showToast('Erreur d\'auth: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Test de Connexion Backend</h2>
        
        <div className="space-y-4">
          <Button 
            onClick={testConnection}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Test en cours...' : 'Tester la connexion'}
          </Button>

          <Button 
            onClick={testAuth}
            disabled={loading}
            fullWidth
            variant="secondary"
          >
            {loading ? 'Test auth...' : 'Tester l\'authentification'}
          </Button>

          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>
      <ToastContainer />
    </div>
  );
};