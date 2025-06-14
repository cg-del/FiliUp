import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function AuthTest() {
  const { user } = useAuth();
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkToken = () => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken') || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('token');
    
    if (!token) {
      setError('No token found in localStorage');
      return;
    }
    
    try {
      // Decode token payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        setError('Invalid token format');
        return;
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      setAuthInfo({
        token: {
          header: JSON.parse(window.atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))),
          payload,
          signature: 'REDACTED'
        }
      });
    } catch (e) {
      setError(`Error decoding token: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const checkBackendAuth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/user/check-auth');
      setAuthInfo(prev => ({
        ...prev,
        backendAuth: response.data
      }));
    } catch (e) {
      setError(`Error checking auth: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current User from Context</h2>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto">
                {JSON.stringify(user, null, 2) || 'No user in context'}
              </pre>
            </div>
            
            <div className="flex space-x-4">
              <Button onClick={checkToken}>
                Decode Token
              </Button>
              <Button onClick={checkBackendAuth} disabled={loading}>
                {loading ? 'Checking...' : 'Check Backend Auth'}
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {authInfo && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Auth Information</h2>
                <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto">
                  {JSON.stringify(authInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 