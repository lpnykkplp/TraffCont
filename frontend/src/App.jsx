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


function App() {
  const [zoomLevel, setZoomLevel] = useState(window.innerWidth < 768 ? 0.67 : 1);

  useEffect(() => {
    const handleResize = () => {
      setZoomLevel(window.innerWidth < 768 ? 0.67 : 1);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    </>
  );
}

export default App;
