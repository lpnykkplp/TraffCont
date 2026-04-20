import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, UserCheck, UserPlus, History, FileText } from 'lucide-react';

const BottomNav = () => {
  const mainItems = [
    { path: '/', name: 'Dash', icon: <LayoutDashboard size={18} /> },
    { path: '/register', name: 'Daftar', icon: <UserPlus size={18} /> },
    { path: '/pejabat', name: 'Data', icon: <Users size={18} /> },
    { path: '/scan', name: 'Scan', icon: <QrCode size={24} /> },
    { path: '/tamu', name: 'Tamu', icon: <UserCheck size={18} /> },
    { path: '/riwayat', name: 'Riwayat', icon: <History size={18} /> },
    { path: '/laporan', name: 'Laporan', icon: <FileText size={18} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <nav className="flex justify-between items-center h-16 w-full px-1 mx-auto">
        {mainItems.map((item) => {
          const isScan = item.path === '/scan';
          return (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isScan ? 'relative -top-3' : isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }>
              {({ isActive }) => (
                <>
                  {isScan ? (
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-lg ${isActive ? 'bg-indigo-600' : 'bg-blue-600 hover:bg-blue-700'} text-white border-4 border-gray-50 transition-transform active:scale-95`}>
                      {item.icon}
                    </div>
                  ) : (
                    <>
                      {item.icon}
                      <span className={`text-[9px] mt-1 font-medium truncate w-full text-center px-0.5 ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="h-safe-area-inset-bottom bg-white w-full"></div>
    </div>
  );
};

export default BottomNav;
