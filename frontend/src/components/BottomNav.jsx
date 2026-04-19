import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, QrCode, UserCheck, MoreHorizontal, UserPlus, History, FileText, X } from 'lucide-react';

const BottomNav = () => {
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { path: '/', name: 'Dash', icon: <LayoutDashboard size={22} /> },
    { path: '/tamu', name: 'Tamu', icon: <UserCheck size={22} /> },
    { path: '/scan', name: 'Scan', icon: <QrCode size={28} /> },
    { path: '/pejabat', name: 'Data', icon: <Users size={22} /> },
  ];

  const moreItems = [
    { path: '/register', name: 'Registrasi Pejabat', icon: <UserPlus size={20} /> },
    { path: '/riwayat', name: 'Riwayat Aktivitas', icon: <History size={20} /> },
    { path: '/laporan', name: 'Laporan & Rekap', icon: <FileText size={20} /> },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-sm">Menu Lainnya</span>
              <button onClick={() => setShowMore(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            {moreItems.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => setShowMore(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }>
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
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

          {/* More Button */}
          <button onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${showMore ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <MoreHorizontal size={22} />
            <span className="text-[10px] mt-1 font-medium">Lagi</span>
          </button>
        </nav>
        <div className="h-safe-area-inset-bottom bg-white w-full"></div>
      </div>
    </>
  );
};

export default BottomNav;
