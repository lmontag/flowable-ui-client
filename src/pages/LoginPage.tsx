import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function base64(str: string) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
  const resp = await fetch('/flowable-rest/service/management/engine', {
        headers: {
          'Authorization': 'Basic ' + base64(username + ':' + password),
        },
      });
      if (resp.ok) {
        sessionStorage.setItem('authUser', username);
        sessionStorage.setItem('authPass', password);
        navigate('/');
      } else {
        setError('Login failed: invalid credentials or API unreachable');
      }
    } catch (err) {
      setError('Network error or server unreachable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      <div className="flex-1 flex items-center justify-center w-full">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-4">
          <img src="/flowable-logo.png" alt="Flowable Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-center">Login</h1>
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
