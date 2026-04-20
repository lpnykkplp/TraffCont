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
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
            .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; width: 300px; border: 2px solid #e5e7eb; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; color: #111827; }
            .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
            .qr-container { background: white; padding: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            img { width: 200px; height: 200px; }
            .id-text { font-family: monospace; font-size: 14px; margin-top: 15px; font-weight: bold; color: #374151; background: #f3f4f6; padding: 8px; border-radius: 6px; }
            .footer { margin-top: 20px; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="card">
             <div class="title">ELECTRONIC TRAFFIC CONTROL</div>
             <div class="subtitle">Valid untuk keluar/masuk HP</div>
             <div class="qr-container">
               <img src="${pejabat?.qr_code}" alt="QR Code" />
             </div>
             <div class="id-text">${pejabat?.custom_id}</div>
             <div style="margin-top: 15px; text-align: left; font-size: 12px; color: #4b5563;">
                <b>Nama:</b> ${pejabat?.nama}<br/>
                <b>HP:</b> ${pejabat?.merk_hp} ${pejabat?.tipe_hp}
             </div>
             <div class="footer">Cetak: ${new Date().toLocaleDateString('id-ID')}</div>
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
