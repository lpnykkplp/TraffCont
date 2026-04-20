import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, QrCode, History } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/scan', name: 'Scan QR', icon: <QrCode size={20} /> },
    { path: '/pejabat', name: 'Data Pejabat', icon: <Users size={20} /> },
    { path: '/register', name: 'Register Pejabat', icon: <UserPlus size={20} /> },
    { path: '/riwayat', name: 'Riwayat Aktivitas', icon: <History size={20} /> },
  ];

  return (
    <div className="w-64 bg-white shadow-xl hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Traffic Controller
        </h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-blue-900">Electronic Traffic Control</p>
          <p className="text-xs text-blue-600 mt-1">Versi 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
