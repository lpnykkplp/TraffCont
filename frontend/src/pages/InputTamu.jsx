import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { UserPlus, LogIn, LogOut, Trash2, Building2, Smartphone, Laptop, Tablet, HardDrive, Usb, Package, AlertCircle, CheckCircle } from 'lucide-react';

const jenisIcons = {
  HP: <Smartphone size={16} />,
  Laptop: <Laptop size={16} />,
  Tablet: <Tablet size={16} />,
  Flashdisk: <Usb size={16} />,
  Hardisk: <HardDrive size={16} />,
  Lainnya: <Package size={16} />,
};

const InputTamu = () => {
  const [tamuList, setTamuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nama_tamu: '',
    asal_instansi: '',
    jenis_perangkat: 'HP',
    merk: '',
    keterangan: '',
  });

  const fetchTamu = async () => {
    try {
      const res = await api.get('/api/tamu');
      setTamuList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTamu(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/tamu', formData);
      setSuccess('Data tamu berhasil disimpan!');
      setFormData({ nama_tamu: '', asal_instansi: '', jenis_perangkat: 'HP', merk: '', keterangan: '' });
      fetchTamu();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data tamu.');
    } finally {
      setSubmitting(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 3000);
    }
  };

  const handleMasuk = async (id) => {
    try {
      await api.put(`/api/tamu/${id}/masuk`);
      fetchTamu();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal');
    }
  };

  const handleKeluar = async (id) => {
    try {
      await api.put(`/api/tamu/${id}/keluar`);
      fetchTamu();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data tamu ini?')) return;
    try {
      await api.delete(`/api/tamu/${id}`);
      fetchTamu();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  const dalamList = tamuList.filter(t => t.status === 'dalam');
  const luarList = tamuList.filter(t => t.status === 'luar');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Form Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Input Perangkat Tamu</h1>
          <p className="text-gray-500 mt-1">Catat perangkat elektronik tamu yang melintas melalui P2U.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tamu</label>
            <input type="text" name="nama_tamu" required value={formData.nama_tamu} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Nama pengunjung" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asal Instansi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Building2 size={16} /></div>
              <input type="text" name="asal_instansi" required value={formData.asal_instansi} onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Kantor / Instansi" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Perangkat</label>
            <select name="jenis_perangkat" value={formData.jenis_perangkat} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white">
              {['HP', 'Laptop', 'Tablet', 'Flashdisk', 'Hardisk', 'Lainnya'].map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Merek Perangkat</label>
            <input type="text" name="merk" required value={formData.merk} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Samsung, Lenovo, dll" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
            <input type="text" name="keterangan" value={formData.keterangan} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" placeholder="Catatan (opsional)" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 text-sm">
              <UserPlus size={18} /> {submitting ? 'Menyimpan...' : 'Simpan Tamu'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel perangkat di dalam */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-orange-50/50 flex items-center gap-2">
          <LogIn size={18} className="text-orange-600" />
          <h2 className="font-bold text-gray-800">Perangkat Tamu di Dalam ({dalamList.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Nama Tamu</th>
                <th className="py-3 px-4 font-semibold">Instansi</th>
                <th className="py-3 px-4 font-semibold">Perangkat</th>
                <th className="py-3 px-4 font-semibold">Waktu Masuk</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dalamList.length > 0 ? dalamList.map(t => (
                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{t.nama_tamu}</td>
                  <td className="py-3 px-4 text-gray-600">{t.asal_instansi}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                      {jenisIcons[t.jenis_perangkat]} {t.jenis_perangkat} - {t.merk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {t.waktu_masuk ? new Date(t.waktu_masuk).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleKeluar(t._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors border border-green-200">
                      <LogOut size={14} /> Keluar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-8 text-center text-gray-400">Tidak ada perangkat tamu di dalam saat ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel semua tamu (riwayat) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Package size={18} className="text-gray-600" />
          <h2 className="font-bold text-gray-800">Semua Data Tamu ({tamuList.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Nama</th>
                <th className="py-3 px-4 font-semibold">Instansi</th>
                <th className="py-3 px-4 font-semibold">Perangkat</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></td></tr>
              ) : tamuList.length > 0 ? tamuList.map(t => (
                <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-800">{t.nama_tamu}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{t.asal_instansi}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                      {jenisIcons[t.jenis_perangkat]} {t.merk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.status === 'dalam' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {t.status === 'dalam' ? <LogIn size={12} /> : <LogOut size={12} />}
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right flex gap-2 justify-end">
                    {t.status === 'luar' && (
                      <button onClick={() => handleMasuk(t._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold hover:bg-orange-100 transition-colors border border-orange-200">
                        <LogIn size={14} /> Masuk
                      </button>
                    )}
                    {t.status === 'dalam' && (
                      <button onClick={() => handleKeluar(t._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors border border-green-200">
                        <LogOut size={14} /> Keluar
                      </button>
                    )}
                    <button onClick={() => handleDelete(t._id)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 transition-colors border border-red-200">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="py-8 text-center text-gray-400">Belum ada data tamu.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InputTamu;
