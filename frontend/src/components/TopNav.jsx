import React from 'react';
import { Menu, Bell } from 'lucide-react';

const TopNav = () => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 w-full relative">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">P2U Scanner Gate</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-700 leading-tight">Admin P2U</p>
            <p className="text-xs text-gray-500">Petugas Jaga</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
