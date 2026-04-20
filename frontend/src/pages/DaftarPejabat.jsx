import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { Users, Search, MoreVertical, LogIn, LogOut, Download } from 'lucide-react';

const DaftarPejabat = () => {
  const [pejabat, setPejabat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPejabat();
  }, []);

  const fetchPejabat = async () => {
    try {
      const res = await api.get('/api/pejabat');
      setPejabat(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPejabat = pejabat.filter(p => 
    p.nama.toLowerCase().includes(search.toLowerCase()) || 
    p.custom_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Master Pejabat</h1>
          <p className="text-gray-500 mt-1">Kelola data <b>{pejabat.length}</b> pejabat dan perangkat mereka.</p>
        </div>
        <div className="flex gap-3">
          {/* Action buttons could go here */}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Profil Pejabat</th>
                <th className="py-4 px-6 font-semibold">Jabatan</th>
                <th className="py-4 px-6 font-semibold">Perangkat</th>
                <th className="py-4 px-6 font-semibold">Status Saat Ini</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPejabat.length > 0 ? (
                filteredPejabat.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {p.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.nama}</p>
                          <p className="text-xs text-gray-500">{p.nomor_hp}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-700">{p.jabatan || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-700">{p.merk_hp} {p.tipe_hp}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">IMEI: {p.imei}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === 'dalam' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {p.status === 'dalam' ? <LogIn size={14} /> : <LogOut size={14} />}
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        to={`/pejabat/${p._id}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                      >
                        Detail & QR
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>Tidak ada data pejabat ditemukan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DaftarPejabat;
