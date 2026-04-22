import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../lib/api';
import { Camera, CheckCircle, AlertCircle, ImagePlus, X, RefreshCw, Upload } from 'lucide-react';

const Scan = () => {
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fotoBukti, setFotoBukti] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  
  const scannerInstance = useRef(null);
  const fileInputRef = useRef(null);

  const startScanner = async () => {
    try {
      if (!scannerInstance.current) {
        scannerInstance.current = new Html5Qrcode("reader");
      }
      
      const config = { fps: 10, aspectRatio: 1.0 };
      
      await scannerInstance.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        () => {} // ignore failures
      );
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Gagal memulai scanner:", err);
      setError("Gagal mengakses kamera. Pastikan izin kamera aktif.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance.current && scannerInstance.current.isScanning) {
      try {
        await scannerInstance.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Gagal menghentikan scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanner immediately to prevent double scan
    await stopScanner();
    
    setFotoBukti(null);
    setFotoPreview(null);

    try {
      const res = await api.post('/api/scan', {
        qr_code: decodedText
      });
      setScannedData(res.data);
    } catch (err) {
      setScannedData(null);
      setError(err.response?.data?.message || 'Gagal memproses QR Code');
      // If error, maybe let user try again?
    }
  };

  const handleResetScan = async () => {
    setScannedData(null);
    setError(null);
    setFotoBukti(null);
    setFotoPreview(null);
    await startScanner();
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (scannerInstance.current && scannerInstance.current.isScanning) {
        scannerInstance.current.stop();
      }
    };
  }, []);

  const handleFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoBukti(reader.result);
      setFotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFoto = async () => {
    if (!fotoBukti || !scannedData?.log_id) return;
    setUploading(true);
    try {
      await api.put(`/api/logs/${scannedData.log_id}/photo`, {
        foto_bukti: fotoBukti
      });
      setFotoBukti(null);
      setFotoPreview('uploaded');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto bukti.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scanner Pintu Utama</h1>
        <p className="text-gray-500 text-center mb-8">Scan QR Code pejabat untuk merekam masuk atau keluarnya perangkat handphone.</p>
        
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-inner border-4 border-gray-100 relative bg-gray-900 mb-6 flex justify-center items-center">
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
          {!isScanning && !scannedData && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-10">
               <button onClick={startScanner} className="bg-white text-gray-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                 <Camera size={20} /> Aktifkan Kamera
               </button>
            </div>
          )}
          {!isScanning && scannedData && (
             <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[2px] z-10 pointer-events-none">
                <div className="bg-white/90 p-4 rounded-full shadow-xl animate-in zoom-in">
                   <CheckCircle size={48} className="text-green-500" />
                </div>
             </div>
          )}
        </div>

        {/* Hidden file input for file selection */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {error && (
          <div className="w-full space-y-4">
            <div className="w-full p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mt-4">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-sm">Scan Gagal</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <button onClick={handleResetScan} className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
              <RefreshCw size={18} /> Coba Lagi
            </button>
          </div>
        )}

        {scannedData && !error && (
          <div className="w-full space-y-4 mt-4">
            <div className={`w-full p-6 text-white rounded-xl flex items-start gap-4 shadow-lg ${
              scannedData.status === 'dalam' ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-green-500 to-teal-500'
            }`}>
              <CheckCircle className="shrink-0 mt-1" size={28} />
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

            {/* Photo Section */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload size={16} className="text-blue-600" /> Lampiran Bukti Perangkat
              </p>
              
              {fotoPreview === 'uploaded' ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">
                  <CheckCircle size={16} /> Foto bukti berhasil diunggah!
                </div>
              ) : fotoPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={fotoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button onClick={() => { setFotoBukti(null); setFotoPreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-lg hover:bg-black/70">
                      <X size={16} />
                    </button>
                  </div>
                  <button onClick={handleUploadFoto} disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all text-sm disabled:opacity-70">
                    <ImagePlus size={16} /> {uploading ? 'Mengunggah...' : 'Kirim Foto Bukti'}
                  </button>
                </div>
              ) : (
                <button onClick={handleFileClick}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
                  <Upload size={18} /> Pilih Foto dari Galeri / Penyimpanan
                </button>
              )}
            </div>

            {/* Reset Button */}
            <button onClick={handleResetScan} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 shadow-md transition-all mt-2">
              <RefreshCw size={20} /> Reset & Scan Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
