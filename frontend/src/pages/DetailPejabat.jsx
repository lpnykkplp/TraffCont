import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import html2canvas from 'html2canvas';
import { ArrowLeft, Download, Printer, Smartphone, User, Hash, Box, Phone, Trash2, Pencil, Save, X, ImageDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DetailPejabat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pejabat, setPejabat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
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

  const startEdit = () => {
    setEditData({
      nama: pejabat.nama,
      jabatan: pejabat.jabatan || '',
      nomor_hp: pejabat.nomor_hp,
      merk_hp: pejabat.merk_hp,
      tipe_hp: pejabat.tipe_hp,
      imei: pejabat.imei,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/pejabat/${id}`, editData);
      setPejabat(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
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
              background: linear-gradient(145deg, #3b6fa0 0%, #2c5a8a 40%, #1e4d7a 100%);
              border-radius: 20px;
              padding: 32px 28px 28px;
              text-align: center;
              position: relative;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(30, 77, 122, 0.35);
            }
            .card::before {
              content: '';
              position: absolute;
              top: -60px; right: -60px;
              width: 200px; height: 200px;
              background: radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%);
              border-radius: 50%;
            }
            .card::after {
              content: '';
              position: absolute;
              bottom: -40px; left: -40px;
              width: 160px; height: 160px;
              background: radial-gradient(circle, rgba(165,180,252,0.15) 0%, transparent 70%);
              border-radius: 50%;
            }
            .logo-line {
              width: 40px; height: 3px;
              background: linear-gradient(90deg, #93c5fd, #a5b4fc);
              border-radius: 2px;
              margin: 0 auto 12px;
            }
            .title {
              font-size: 13px; font-weight: 800; letter-spacing: 2.5px;
              color: #ffffff; text-transform: uppercase; margin-bottom: 4px;
              position: relative; z-index: 1;
            }
            .subtitle {
              font-size: 10px; font-weight: 500; color: #bfdbfe;
              letter-spacing: 1px; margin-bottom: 24px;
              position: relative; z-index: 1;
            }
            .qr-wrapper {
              background: white; padding: 16px; border-radius: 14px;
              display: inline-block; box-shadow: 0 4px 20px rgba(0,0,0,0.12);
              position: relative; z-index: 1;
            }
            .qr-wrapper img { width: 180px; height: 180px; display: block; }
            .name-badge {
              margin-top: 20px; font-size: 16px; font-weight: 800;
              color: #ffffff; letter-spacing: 0.5px;
              position: relative; z-index: 1;
            }
            .jabatan-text {
              font-size: 11px; font-weight: 500; color: #bfdbfe;
              margin-top: 3px; letter-spacing: 0.5px;
              position: relative; z-index: 1;
            }
            .info-section {
              margin-top: 16px; text-align: center;
              position: relative; z-index: 1;
            }
            .divider {
              width: 100%; height: 1px;
              background: linear-gradient(90deg, transparent, rgba(191,219,254,0.35), transparent);
              margin-bottom: 12px;
            }
            .device-text {
              font-size: 11px; color: #dbeafe; font-weight: 500;
              background: rgba(255,255,255,0.1); display: inline-block;
              padding: 5px 14px; border-radius: 6px;
              border: 1px solid rgba(191,219,254,0.2);
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
             <div class="name-badge">${pejabat?.nama}</div>
             <div class="jabatan-text">${pejabat?.jabatan || '-'}</div>
             <div class="info-section">
               <div class="divider"></div>
               <span class="device-text">${pejabat?.merk_hp} ${pejabat?.tipe_hp}</span>
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

  const downloadIdCard = async () => {
    if (!pejabat) return;

    // Create off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    container.innerHTML = `
      <div id="id-card-render" style="
        width: 400px;
        background: linear-gradient(145deg, #3b6fa0 0%, #2c5a8a 40%, #1e4d7a 100%);
        border-radius: 24px;
        padding: 40px 36px 36px;
        text-align: center;
        position: relative;
        overflow: hidden;
        font-family: 'Segoe UI', Arial, sans-serif;
      ">
        <div style="
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(147,197,253,0.2) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute; bottom: -40px; left: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(165,180,252,0.15) 0%, transparent 70%);
          border-radius: 50%;
        "></div>
        <div style="width:50px;height:4px;background:linear-gradient(90deg,#93c5fd,#a5b4fc);border-radius:2px;margin:0 auto 14px;"></div>
        <div style="font-size:16px;font-weight:800;letter-spacing:3px;color:#fff;text-transform:uppercase;margin-bottom:5px;position:relative;z-index:1;">ELECTRONIC TRAFFIC CONTROL</div>
        <div style="font-size:12px;font-weight:500;color:#bfdbfe;letter-spacing:1px;margin-bottom:28px;position:relative;z-index:1;">Lalu Lintas Perangkat</div>
        <div style="background:#fff;padding:20px;border-radius:16px;display:inline-block;box-shadow:0 4px 20px rgba(0,0,0,0.12);position:relative;z-index:1;">
          <img src="${pejabat.qr_code}" style="width:220px;height:220px;display:block;" />
        </div>
        <div style="margin-top:24px;font-size:20px;font-weight:800;color:#fff;letter-spacing:0.5px;position:relative;z-index:1;">${pejabat.nama}</div>
        <div style="font-size:13px;font-weight:500;color:#bfdbfe;margin-top:4px;position:relative;z-index:1;">${pejabat.jabatan || '-'}</div>
        <div style="margin-top:18px;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;width:100%;">
          <div style="width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(191,219,254,0.35),transparent);margin-bottom:12px;"></div>
          <div style="font-size:13px;color:#dbeafe;font-weight:500;letter-spacing:0.5px;">${pejabat.merk_hp} ${pejabat.tipe_hp}</div>
        </div>
      </div>
    `;

    try {
      const cardEl = container.querySelector('#id-card-render');
      const canvas = await html2canvas(cardEl, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `ID_Card_${pejabat.nama.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate ID card image:', err);
      alert('Gagal mengunduh ID Card.');
    } finally {
      document.body.removeChild(container);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-gray-800 bg-blue-50/50";
  const displayClass = "font-semibold text-gray-800 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100";

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
        <div className="flex gap-2">
          {user?.role === 'Admin' && (
            <>
              {!editing ? (
                <button 
                  onClick={startEdit}
                  className="flex items-center text-blue-600 hover:text-white transition-colors bg-blue-50 hover:bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  <Pencil size={18} className="mr-2" />
                  Edit
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSave} disabled={saving}
                    className="flex items-center text-green-600 hover:text-white transition-colors bg-green-50 hover:bg-green-600 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    <X size={18} className="mr-2" />
                    Batal
                  </button>
                </>
              )}
              <button 
                onClick={handleDelete}
                className="flex items-center text-red-600 hover:text-white transition-colors bg-red-50 hover:bg-red-600 px-4 py-2 rounded-xl text-sm font-medium"
              >
                <Trash2 size={18} className="mr-2" />
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Info Card */}
        <div className={`${user?.role === 'Admin' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden`}>
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
                  {editing ? (
                    <input name="nama" value={editData.nama} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className={displayClass}>{pejabat.nama}</p>
                  )}
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">Jabatan</label>
                  {editing ? (
                    <input name="jabatan" value={editData.jabatan} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className={displayClass}>{pejabat.jabatan || '-'}</p>
                  )}
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone size={14} /> Nomor WA/HP</label>
                  {editing ? (
                    <input name="nomor_hp" value={editData.nomor_hp} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className={displayClass}>{pejabat.nomor_hp}</p>
                  )}
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Smartphone size={14} /> Merek HP</label>
                  {editing ? (
                    <input name="merk_hp" value={editData.merk_hp} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className={displayClass}>{pejabat.merk_hp}</p>
                  )}
               </div>
            </div>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Box size={14} /> Tipe HP</label>
                  {editing ? (
                    <input name="tipe_hp" value={editData.tipe_hp} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className={displayClass}>{pejabat.tipe_hp}</p>
                  )}
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Hash size={14} /> Nomor IMEI</label>
                  {editing ? (
                    <input name="imei" value={editData.imei} onChange={handleEditChange} className={inputClass} />
                  ) : (
                    <p className="font-mono text-sm font-semibold text-gray-800 bg-gray-50 py-2.5 px-3 rounded-lg border border-gray-100">{pejabat.imei}</p>
                  )}
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
        {user?.role === 'Admin' && (
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
                  <Download size={18} /> Download QR Code
               </button>
               <button 
                  onClick={downloadIdCard}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all active:scale-95"
                >
                  <ImageDown size={18} /> Download ID Card PNG
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPejabat;
