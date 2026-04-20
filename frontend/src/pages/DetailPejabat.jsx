import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Download, Printer, Smartphone, User, Hash, Box, Phone, Trash2 } from 'lucide-react';

const DetailPejabat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pejabat, setPejabat] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Ref for the printable area
  const printRef = useRef();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/api/pejabat/${id}`);
        setPejabat(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pejabat ini?')) {
      try {
        await api.delete(`/api/pejabat/${id}`);
        navigate('/pejabat');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus data.');
      }
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    windowPrint.document.write(`
      <html>
        <head>
          <title>Cetak ID Card - ${pejabat?.nama}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', sans-serif;
              display: flex; justify-content: center; align-items: center;
              height: 100vh; margin: 0;
              background-color: #f0f2f5;
            }
            .card {
              width: 320px;
              background: linear-gradient(145deg, #1e3a5f 0%, #0f2847 40%, #0a1f3d 100%);
              border-radius: 20px;
              padding: 32px 28px 28px;
              text-align: center;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(15, 40, 71, 0.4);
            }
            .card::before {
              content: '';
              position: absolute;
              top: -60px; right: -60px;
              width: 200px; height: 200px;
              background: radial-gradient(circle, rgba(99,179,237,0.15) 0%, transparent 70%);
              border-radius: 50%;
            }
            .card::after {
              content: '';
              position: absolute;
              bottom: -40px; left: -40px;
              width: 160px; height: 160px;
              background: radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%);
              border-radius: 50%;
            }
            .logo-line {
              width: 40px; height: 3px;
              background: linear-gradient(90deg, #60a5fa, #818cf8);
              border-radius: 2px;
              margin: 0 auto 12px;
            }
            .title {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 2.5px;
              color: #ffffff;
              text-transform: uppercase;
              margin-bottom: 4px;
              position: relative;
              z-index: 1;
            }
            .subtitle {
              font-size: 10px;
              font-weight: 500;
              color: #93c5fd;
              letter-spacing: 1px;
              margin-bottom: 24px;
              position: relative;
              z-index: 1;
            }
            .qr-wrapper {
              background: white;
              padding: 16px;
              border-radius: 14px;
              display: inline-block;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15);
              position: relative;
              z-index: 1;
            }
            .qr-wrapper img { width: 180px; height: 180px; display: block; }
            .id-badge {
              margin-top: 18px;
              font-family: 'Courier New', monospace;
              font-size: 14px;
              font-weight: 700;
              color: #ffffff;
              background: linear-gradient(135deg, rgba(96,165,250,0.25), rgba(129,140,248,0.25));
              border: 1px solid rgba(147,197,253,0.3);
              padding: 8px 20px;
              border-radius: 8px;
              letter-spacing: 1.5px;
              display: inline-block;
              position: relative;
              z-index: 1;
            }
            .info-section {
              margin-top: 20px;
              text-align: center;
              position: relative;
              z-index: 1;
            }
            .divider {
              width: 100%; height: 1px;
              background: linear-gradient(90deg, transparent, rgba(147,197,253,0.3), transparent);
              margin-bottom: 14px;
            }
            .info-row {
              font-size: 12px;
              color: #cbd5e1;
              margin-bottom: 4px;
            }
            .info-row b {
              color: #e2e8f0;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="card">
             <div class="logo-line"></div>
             <div class="title">ELECTRONIC TRAFFIC CONTROL</div>
             <div class="subtitle">Lalu Lintas Perangkat</div>
             <div class="qr-wrapper">
               <img src="${pejabat?.qr_code}" alt="QR Code" />
             </div>
             <div class="id-badge">${pejabat?.custom_id}</div>
             <div class="info-section">
               <div class="divider"></div>
               <div class="info-row"><b>${pejabat?.nama}</b></div>
               <div class="info-row">${pejabat?.merk_hp} ${pejabat?.tipe_hp}</div>
             </div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    windowPrint.document.close();
  };

  const handleDownload = () => {
    if (!pejabat?.qr_code) return;
    const a = document.createElement('a');
    a.href = pejabat.qr_code;
    a.download = `QR_Code_${pejabat.custom_id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!pejabat) return <div className="text-center p-8 text-gray-500">Data pejabat tidak ditemukan</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate('/pejabat')}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </button>
        <button 
          onClick={handleDelete}
          className="flex items-center text-red-600 hover:text-white transition-colors bg-red-50 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-medium"
        >
          <Trash2 size={18} className="mr-2" />
          Hapus Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Info Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
              {pejabat.nama.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{pejabat.nama}</h2>
              <p className="text-gray-500 font-mono text-sm mt-1">{pejabat.custom_id}</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User size={14} /> Nama Lengkap</label>
                  <p className="font-semibold text-gray-800 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{pejabat.nama}</p>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone size={14} /> Nomor WA/HP</label>
                  <p className="font-semibold text-gray-800 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{pejabat.nomor_hp}</p>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Smartphone size={14} /> Merek HP</label>
                  <p className="font-semibold text-gray-800 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{pejabat.merk_hp}</p>
               </div>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Box size={14} /> Tipe HP</label>
                  <p className="font-semibold text-gray-800 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">{pejabat.tipe_hp}</p>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Hash size={14} /> Nomor IMEI</label>
                  <p className="font-mono text-sm font-semibold text-gray-800 bg-gray-50 py-2.5 px-3 rounded-lg border border-gray-100">{pejabat.imei}</p>
               </div>
            </div>
            
            {(pejabat.foto_hp && !pejabat.foto_hp.includes('null')) && (
              <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block text-center">Foto Perangkat (Barang Bukti)</label>
                <div className="w-full max-w-sm mx-auto rounded-xl border-4 border-gray-50 overflow-hidden shadow-sm">
                  <img 
                    src={pejabat.foto_hp.startsWith('http') ? pejabat.foto_hp : `/${pejabat.foto_hp.replace(/\\/g, '/')}`} 
                    alt="HP Pejabat" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
          <div className="z-10 bg-white p-6 rounded-2xl shadow-md border-2 border-dashed border-blue-200 mb-6">
             <img src={pejabat.qr_code} alt="QR Code" className="w-48 h-48 object-contain" />
          </div>
          
          <div className="z-10 w-full space-y-3">
             <button 
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all active:scale-95"
              >
                <Printer size={18} /> Cetak ID Card
             </button>
             <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-xl font-medium shadow-sm transition-all"
              >
                <Download size={18} /> Download QR Code PNG
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPejabat;
