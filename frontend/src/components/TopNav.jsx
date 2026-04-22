import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut as LogOutIcon } from 'lucide-react';

const TopNav = () => {
  const [time, setTime] = useState(new Date());
  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 w-full relative">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Electronic Traffic Control</h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* Live Clock Indicator */}
        <div className="flex flex-col items-end justify-center text-right mr-1">
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">{formatDate(time)}</span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 w-fit">{formatTime(time)}</span>
        </div>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md uppercase">
            {user?.nama ? user.nama.substring(0, 2) : 'AD'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.nama || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Petugas Jaga'}</p>
          </div>
          <button 
            onClick={logout} 
            className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="Keluar / Logout"
          >
            <LogOutIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
