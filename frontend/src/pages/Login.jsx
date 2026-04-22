import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(window.innerWidth < 768 ? 0.67 : 1);

  useEffect(() => {
    const handleResize = () => setZoomLevel(window.innerWidth < 768 ? 0.67 : 1);
    window.addEventListener('resize', handleResize);
    
    // Auto trigger creation of p2u user from backend
    api.get('/api/auth/create-p2u').catch(console.error);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="bg-gray-50 flex flex-col justify-center items-center p-4 absolute top-0 left-0"
      style={{
        width: `${100 / zoomLevel}vw`,
        height: `${100 / zoomLevel}vh`,
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left'
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Electronic Traffic</h1>
          <p className="text-blue-100 text-sm">Control Pengamanan Pintu Utama</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="Masukkan kata sandi"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              <LogIn size={20} />
              {loading ? 'Memeriksa...' : 'Masuk ke Sistem'}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-sm font-medium">© 2026 Pengamanan Lapas</p>
    </div>
  );
};

export default Login;
