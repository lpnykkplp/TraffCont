import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, Smartphone, LogIn, LogOut, Activity, UserCheck } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_pejabat: 0,
    total_hp: 0,
    jumlah_dalam: 0,
    jumlah_luar: 0,
    total_tamu: 0,
    tamu_dalam: 0,
    recent_activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/api/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md group`}>
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full translate-x-10 -translate-y-10 transition-transform group-hover:scale-110 ${gradientClass}`}></div>
      <div className={`p-4 rounded-xl ${colorClass} shadow-sm z-10`}>
        <Icon size={24} />
      </div>
      <div className="z-10">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Visual</h1>
          <p className="text-gray-500 mt-1">Status dan Statistik Electronic Traffic Control</p>
        </div>
        {!loading && (
          <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sistem Aktif
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Pejabat" value={stats.total_pejabat} icon={Users} colorClass="bg-blue-50 text-blue-600" gradientClass="bg-blue-600" />
            <StatCard title="HP Pejabat Di Dalam" value={stats.jumlah_dalam} icon={LogIn} colorClass="bg-orange-50 text-orange-600" gradientClass="bg-orange-600" />
            <StatCard title="Perangkat Tamu Di Dalam" value={stats.tamu_dalam || 0} icon={UserCheck} colorClass="bg-purple-50 text-purple-600" gradientClass="bg-purple-600" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Activity size={20} /></div>
              <h2 className="text-lg font-bold text-gray-800">Aktivitas Terakhir</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-400">
                    <th className="py-3 px-4 font-semibold">Tipe</th>
                    <th className="py-3 px-4 font-semibold">Nama</th>
                    <th className="py-3 px-4 font-semibold">Perangkat</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_activities.length > 0 ? (
                    stats.recent_activities.map((log) => (
                      <tr key={log._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.tipe === 'pejabat' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {log.tipe === 'pejabat' ? 'PEJABAT' : 'TAMU'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-800">{log.nama}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{log.jabatan || '-'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">{log.perangkat || '-'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${log.status === 'masuk' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {log.status === 'masuk' ? <LogIn size={14} /> : <LogOut size={14} />}
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 text-right">
                          {new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-400 text-sm">Belum ada aktivitas terekam.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
