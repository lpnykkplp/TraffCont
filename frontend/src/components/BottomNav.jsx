import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, QrCode, History } from 'lucide-react';

const BottomNav = () => {
  const menuItems = [
    { path: '/', name: 'Dash', icon: <LayoutDashboard size={22} /> },
    { path: '/pejabat', name: 'Data', icon: <Users size={22} /> },
    { path: '/scan', name: 'Scan', icon: <QrCode size={28} /> },
    { path: '/register', name: 'Reg', icon: <UserPlus size={22} /> },
    { path: '/riwayat', name: 'Log', icon: <History size={22} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {menuItems.map((item, index) => {
          // Special styling for the middle Scan button
          const isScan = item.path === '/scan';
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isScan
                    ? 'relative -top-3' 
                    : isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isScan ? (
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg ${isActive ? 'bg-indigo-600' : 'bg-blue-600 hover:bg-blue-700'} text-white border-4 border-gray-50 transition-transform active:scale-95`}>
                      {item.icon}
                    </div>
                  ) : (
                    <>
                      {item.icon}
                      <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Padding space for iOS bottom safe area */}
      <div className="h-safe-area-inset-bottom bg-white w-full"></div>
    </div>
  );
};

export default BottomNav;
