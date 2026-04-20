import React, { useState } from 'react';
import api from '../lib/api';
import { Camera, Save, Smartphone, Hash, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    nomor_hp: '',
    merk_hp: '',
    tipe_hp: '',
    imei: '',
  });
  const [fotoHp, setFotoHp] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoHp(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (fotoHp) {
        data.append('foto_hp', fotoHp);
      }

      await api.post('/api/pejabat', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate('/pejabat');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">Registrasi Pejabat & HP</h1>
          <p className="text-gray-500 mt-2">Daftarkan pejabat baru beserta detail smartphone untuk mendapatkan QR Code akses.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Informasi Pejabat</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="nama"
                    required
                    maxLength={50}
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="Bpk. Budi Santoso"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="Kalapas, Ka.KPLP, dll"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp/HP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Hash size={18} />
                  </div>
                  <input
                    type="text"
                    name="nomor_hp"
                    required
                    value={formData.nomor_hp}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="081234567890"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Informasi Perangkat</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Smartphone size={18} />
                    </div>
                    <input
                      type="text"
                      name="merk_hp"
                      required
                      value={formData.merk_hp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                      placeholder="Samsung"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                  <input
                    type="text"
                    name="tipe_hp"
                    required
                    value={formData.tipe_hp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="S23 Ultra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor IMEI</label>
                <input
                  type="text"
                  name="imei"
                  required
                  value={formData.imei}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm placeholder:text-gray-300"
                  placeholder="358000000000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto HP (Bukti Fisik)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-center hover:bg-gray-50 transition-colors group">
                      <Camera className="mx-auto text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" size={24} />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">Klik untuk upload foto</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                  </label>
                  {preview && (
                    <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shrink-0 relative bg-gray-50">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 mr-4"
              onClick={() => navigate('/pejabat')}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save size={18} />
              )}
              {loading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
