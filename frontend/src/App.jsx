import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Scan from './pages/Scan';
import DaftarPejabat from './pages/DaftarPejabat';
import DetailPejabat from './pages/DetailPejabat';
import Riwayat from './pages/Riwayat';
import InputTamu from './pages/InputTamu';
import Laporan from './pages/Laporan';
import { ZoomIn, ZoomOut } from 'lucide-react';

function App() {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Removed body zoom to fix iOS glitches
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout zoomLevel={zoomLevel} />}>
          <Route index element={<Dashboard />} />
          <Route path="register" element={<Register />} />
          <Route path="scan" element={<Scan />} />
          <Route path="pejabat" element={<DaftarPejabat />} />
          <Route path="pejabat/:id" element={<DetailPejabat />} />
          <Route path="riwayat" element={<Riwayat />} />
          <Route path="tamu" element={<InputTamu />} />
          <Route path="laporan" element={<Laporan />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <button 
        onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
        className="bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
        aria-label="Zoom In"
      >
        <ZoomIn size={22} />
      </button>
      <button 
        onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
        className="bg-white p-3 rounded-full shadow-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
        aria-label="Zoom Out"
      >
        <ZoomOut size={22} />
      </button>
    </div>
    </>
  );
}

export default App;
