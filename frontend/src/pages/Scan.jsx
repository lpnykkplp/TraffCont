import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../lib/api';
import { Camera, CheckCircle, AlertCircle, ImagePlus, X } from 'lucide-react';

const Scan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fotoBukti, setFotoBukti] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let lastScanTime = 0;
    const html5QrCode = new Html5Qrcode("reader");

    const onScanSuccess = async (decodedText) => {
      const now = Date.now();
      if (now - lastScanTime < 3000) return;
      lastScanTime = now;

      setScanResult(decodedText);
      setError(null);
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
      }
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      { fps: 10, aspectRatio: 1.0 },
      onScanSuccess,
      () => {}
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

  const handleCapturePhoto = () => {
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
    if (!fotoBukti || !scanResult) return;
    setUploading(true);
    try {
      await api.post('/api/scan', {
        qr_code: scanResult,
        foto_bukti: fotoBukti
      });
      setFotoBukti(null);
      setFotoPreview('uploaded');
    } catch (err) {
      alert('Gagal mengunggah foto bukti.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scanner Pintu Utama</h1>
        <p className="text-gray-500 text-center mb-8">Scan QR Code pejabat untuk merekam masuk atau keluarnya perangkat handphone.</p>
        
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-inner border-4 border-gray-100 relative bg-gray-900 mb-6 flex justify-center items-center">
          <div id="reader" className="w-full" style={{ minHeight: '300px' }}></div>
        </div>

        {/* Hidden file input for camera capture */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          capture="environment" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {error && (
          <div className="w-full p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 mt-4">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-sm">Scan Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
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

            {/* Photo Capture Section */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Camera size={16} className="text-blue-600" /> Foto Bukti Perangkat (Opsional)
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
                <button onClick={handleCapturePhoto}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm">
                  <Camera size={18} /> Ambil Foto dari Kamera
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
