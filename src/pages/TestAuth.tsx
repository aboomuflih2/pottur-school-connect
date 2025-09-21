import React, { useState } from 'react';
import { authService } from '../services/authService';

const TestAuth: React.FC = () => {
  const [email, setEmail] = useState('admin@pottur.edu');
  const [password, setPassword] = useState('admin123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await authService.login(email, password);
      setResult(`Login successful! Access token: ${response.access.substring(0, 50)}...`);
      
      // Test getting current user
      const user = await authService.getCurrentUser();
      setResult(prev => prev + `\n\nUser info: ${JSON.stringify(user, null, 2)}`);
    } catch (error) {
      setResult(`Login failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setResult('Logged out successfully');
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-x-2">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuth;