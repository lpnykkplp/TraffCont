import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:pb-24 pb-24">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
