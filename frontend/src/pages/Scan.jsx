import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../lib/api';
import { Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Scan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let lastScanTime = 0;
    const html5QrCode = new Html5Qrcode("reader");

    const onScanSuccess = async (decodedText) => {
      const now = Date.now();
      if (now - lastScanTime < 3000) return;
      lastScanTime = now;

      setScanResult(decodedText);
      setError(null);

      try {
        const res = await api.post('/api/scan', {
          qr_code: decodedText
        });
        setScannedData(res.data);
      } catch (err) {
        setScannedData(null);
        setError(err.response?.data?.message || 'Gagal memproses QR Code');
      }
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      { 
        fps: 10,
        aspectRatio: 1.0,
      },
      onScanSuccess,
      () => {} // ignore scan failures
    ).catch(err => {
      console.error("Gagal memulai kamera otomatis:", err);
      setError("Gagal mengakses kamera. Pastikan izin kamera aktif.");
    });
    
    scannerRef.current = html5QrCode;

    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => scannerRef.current.clear());
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scanner Pintu P2U</h1>
        <p className="text-gray-500 text-center mb-8">Scan QR Code pejabat untuk merekam masuk atau keluarnya perangkat handphone.</p>
        
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-inner border-4 border-gray-100 relative bg-gray-900 mb-6 flex justify-center items-center">
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
        </div>

        {error && (
          <div className="w-full p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-sm">Scan Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {scannedData && !error && (
          <div className={`w-full p-6 text-white rounded-xl flex items-start gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 shadow-lg ${
            scannedData.status === 'dalam' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-teal-500'
          }`}>
            {scannedData.status === 'dalam' ? (
              <CheckCircle className="shrink-0 mt-1" size={28} />
            ) : (
              <CheckCircle className="shrink-0 mt-1" size={28} />
            )}
            <div className="w-full">
              <div className="flex justify-between items-center w-full">
                <p className="font-bold text-lg">{scannedData.message}</p>
                <span className="px-2 py-1 bg-white/20 rounded font-mono text-xs shadow-sm">
                  {scannedData.pejabat?.custom_id}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex gap-6">
                 <div>
                    <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Nama Pejabat</p>
                    <p className="font-semibold">{scannedData.pejabat?.nama}</p>
                 </div>
                 <div>
                    <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Perangkat</p>
                    <p className="font-semibold">{scannedData.pejabat?.merk_hp} {scannedData.pejabat?.tipe_hp}</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
