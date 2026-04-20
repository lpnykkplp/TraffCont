import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { LogIn, LogOut } from 'lucide-react';

const Riwayat = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/dashboard');
        setLogs(res.data.recent_activities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Lalu Lintas</h1>
        <p className="text-gray-500 mt-1">Log aktivitas keluar masuk perangkat pejabat & tamu yang terekam sistem.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Tipe</th>
                <th className="py-4 px-6 font-semibold">Nama</th>
                <th className="py-4 px-6 font-semibold">Perangkat</th>
                <th className="py-4 px-6 font-semibold">Status Aksi</th>
                <th className="py-4 px-6 font-semibold text-right">Waktu Record</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        log.tipe === 'pejabat' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {log.tipe === 'pejabat' ? 'PEJABAT' : 'TAMU'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-800">{log.nama}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{log.jabatan || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                         {log.perangkat || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        log.status === 'masuk' 
                          ? 'border-orange-200 bg-orange-50 text-orange-700' 
                          : 'border-green-200 bg-green-50 text-green-700'
                      }`}>
                        {log.status === 'masuk' ? <LogIn size={14} /> : <LogOut size={14} />}
                        {log.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <p className="text-sm font-medium text-gray-800">
                         {new Date(log.waktu).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                       <p className="text-xs text-gray-500 font-mono mt-0.5">
                         {new Date(log.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                       </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <p>Tidak ada riwayat aktivitas ditemukan.</p>
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

export default Riwayat;
