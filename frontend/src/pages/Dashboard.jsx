import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, LogIn, LogOut, UserCheck, BarChart3, TrendingUp } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

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

  // Compute chart data from recent_activities
  const getChartData = () => {
    const activities = stats.recent_activities || [];

    // --- Bar Chart: Activity by hour ---
    const hourCounts = {};
    activities.forEach(log => {
      const hour = new Date(log.waktu).getHours();
      const label = `${String(hour).padStart(2, '0')}:00`;
      if (!hourCounts[label]) hourCounts[label] = { masuk: 0, keluar: 0 };
      if (log.status === 'masuk') hourCounts[label].masuk++;
      else hourCounts[label].keluar++;
    });

    const sortedHours = Object.keys(hourCounts).sort();
    const barData = {
      labels: sortedHours,
      datasets: [
        {
          label: 'Masuk',
          data: sortedHours.map(h => hourCounts[h].masuk),
          backgroundColor: 'rgba(249, 115, 22, 0.75)',
          borderColor: 'rgb(249, 115, 22)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Keluar',
          data: sortedHours.map(h => hourCounts[h].keluar),
          backgroundColor: 'rgba(34, 197, 94, 0.75)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    // --- Doughnut: Pejabat vs Tamu ---
    let pejabatCount = 0, tamuCount = 0;
    activities.forEach(log => {
      if (log.tipe === 'pejabat') pejabatCount++;
      else tamuCount++;
    });

    const doughnutData = {
      labels: ['Pejabat', 'Tamu / Non-Pejabat'],
      datasets: [{
        data: [pejabatCount, tamuCount],
        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(168, 85, 247, 0.8)'],
        borderColor: ['rgb(99, 102, 241)', 'rgb(168, 85, 247)'],
        borderWidth: 2,
        hoverOffset: 8,
      }],
    };

    // --- Doughnut: Status Perangkat (Dalam vs Luar) ---
    const statusData = {
      labels: ['Di Dalam', 'Di Luar'],
      datasets: [{
        data: [stats.jumlah_dalam + (stats.tamu_dalam || 0), stats.jumlah_luar + ((stats.total_tamu || 0) - (stats.tamu_dalam || 0))],
        backgroundColor: ['rgba(249, 115, 22, 0.8)', 'rgba(34, 197, 94, 0.8)'],
        borderColor: ['rgb(249, 115, 22)', 'rgb(34, 197, 94)'],
        borderWidth: 2,
        hoverOffset: 8,
      }],
    };

    return { barData, doughnutData, statusData };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 12, weight: '600' }, usePointStyle: true, pointStyle: 'circle', padding: 16 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13, weight: '700' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' }, color: '#9ca3af' }
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 }, color: '#9ca3af' },
        grid: { color: 'rgba(229, 231, 235, 0.6)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12, weight: '600' }, usePointStyle: true, pointStyle: 'circle', padding: 14 }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 13, weight: '700' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 10,
      }
    }
  };

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

          {/* Charts Section */}
          {(() => {
            const { barData, doughnutData, statusData } = getChartData();
            return (
              <>
                {/* Bar Chart: Aktivitas per Jam */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart3 size={20} /></div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Aktivitas per Jam</h2>
                      <p className="text-xs text-gray-400">Berdasarkan 20 aktivitas terakhir</p>
                    </div>
                  </div>
                  <div className="h-64">
                    {barData.labels.length > 0 ? (
                      <Bar data={barData} options={barOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        Belum ada data aktivitas untuk ditampilkan.
                      </div>
                    )}
                  </div>
                </div>

                {/* Doughnut Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
                      <div>
                        <h2 className="text-base font-bold text-gray-800">Komposisi Aktivitas</h2>
                        <p className="text-xs text-gray-400">Pejabat vs Tamu</p>
                      </div>
                    </div>
                    <div className="h-52">
                      {(doughnutData.datasets[0].data[0] + doughnutData.datasets[0].data[1]) > 0 ? (
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          Belum ada data.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><LogIn size={20} /></div>
                      <div>
                        <h2 className="text-base font-bold text-gray-800">Status Perangkat</h2>
                        <p className="text-xs text-gray-400">Di Dalam vs Di Luar</p>
                      </div>
                    </div>
                    <div className="h-52">
                      {(statusData.datasets[0].data[0] + statusData.datasets[0].data[1]) > 0 ? (
                        <Doughnut data={statusData} options={doughnutOptions} />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          Belum ada data.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default Dashboard;
