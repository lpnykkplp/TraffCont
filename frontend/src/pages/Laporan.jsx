import React, { useState } from 'react';
import api from '../lib/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, BarChart3, LogIn, LogOut } from 'lucide-react';

const Laporan = () => {
  const [periode, setPeriode] = useState('harian');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date().toISOString().split('T')[0]);
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const url = periode === 'rentang' 
        ? `/api/laporan?periode=${periode}&tanggal=${tanggal}&tanggal_akhir=${tanggalAkhir}`
        : `/api/laporan?periode=${periode}&tanggal=${tanggal}`;
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodeLabel = () => {
    const d = new Date(tanggal);
    if (periode === 'harian') return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (periode === 'bulanan') return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (periode === 'rentang') return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} s/d ${new Date(tanggalAkhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    return d.getFullYear().toString();
  };

  const formatTime = (waktu) => {
    if (!waktu) return '-';
    return new Date(waktu).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const exportPDF = () => {
    if (!data) return;

    try {
      const doc = new jsPDF();
      const periodeLabel = getPeriodeLabel();

      // Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LAPORAN LALU LINTAS PERANGKAT ELEKTRONIK', 105, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Pengamanan Pintu Utama', 105, 24, { align: 'center' });

      doc.setFontSize(9);
      doc.text('Periode: ' + periode.charAt(0).toUpperCase() + periode.slice(1), 14, 36);
      doc.text('Tanggal: ' + periodeLabel, 14, 41);
      doc.text('Dicetak: ' + new Date().toLocaleString('id-ID'), 14, 46);

      // === TABEL A: DETAIL AKTIVITAS ===
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('A. Detail Aktivitas', 14, 55);

      const filteredDetailRecords = (data.detail_records || []).filter(r => {
        if (filterKategori === 'Semua') return true;
        return r.kategori === filterKategori;
      });

      const detailRows = filteredDetailRecords.map(function(r, i) {
        return [
          String(i + 1),
          r.waktu ? new Date(r.waktu).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          r.kategori,
          r.nama,
          r.perangkat,
          r.status === 'masuk' ? 'MASUK' : 'KELUAR',
          r.waktu ? new Date(r.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'
        ];
      });

      if (detailRows.length === 0) {
        detailRows.push(['-', '-', '-', 'Tidak ada data', '-', '-', '-']);
      }

      autoTable(doc, {
        startY: 59,
        head: [['No', 'Hari/Tanggal', 'Kategori', 'Nama', 'Perangkat', 'Status', 'Jam']],
        body: detailRows,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2.5 },
        columnStyles: { 
          0: { halign: 'center', cellWidth: 8 }, 
          1: { cellWidth: 24 }, // Ensure Date is wide enough 
          5: { halign: 'center' }, 
          6: { halign: 'center' } 
        },
      });

      // === TABEL B: RINGKASAN ===
      var summaryY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('B. Ringkasan', 14, summaryY);

      const summaryRows = [];
      summaryRows.push(['Pejabat', 'HP (Terdaftar)', String(data.pejabat.masuk), String(data.pejabat.keluar), String(data.pejabat.selisih)]);
      if (data.tamu && data.tamu.length > 0) {
        data.tamu.forEach(function(t) {
          summaryRows.push(['Tamu', t.jenis_perangkat, String(t.masuk), String(t.keluar), String(t.selisih)]);
        });
      }
      summaryRows.push(['TOTAL', '', String(data.grand_total.masuk), String(data.grand_total.keluar), String(data.grand_total.selisih)]);

      autoTable(doc, {
        startY: summaryY + 4,
        head: [['Kategori', 'Jenis Perangkat', 'Masuk', 'Keluar', 'Selisih']],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
        didParseCell: function(cellData) {
          if (cellData.row.index === summaryRows.length - 1 && cellData.section === 'body') {
            cellData.cell.styles.fontStyle = 'bold';
            cellData.cell.styles.fillColor = [243, 244, 246];
          }
        }
      });

      // Verification
      var verifyY = doc.lastAutoTable.finalY + 8;
      var selisih = data.grand_total.selisih;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      if (selisih === 0) {
        doc.setTextColor(22, 163, 74);
        doc.text('VERIFIKASI: Jumlah perangkat masuk dan keluar SEIMBANG.', 14, verifyY);
      } else {
        doc.setTextColor(220, 38, 38);
        doc.text('PERHATIAN: Terdapat selisih ' + Math.abs(selisih) + ' perangkat yang belum seimbang.', 14, verifyY);
      }

      doc.setTextColor(150);
      doc.setFontSize(7);
      doc.text('Dokumen ini digenerate otomatis oleh sistem Electronic Traffic Control.', 105, 285, { align: 'center' });

      doc.save('Laporan_' + periode + '_' + tanggal + '.pdf');
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Gagal mengexport PDF: ' + err.message);
    }
  };

  const SelisihBadge = ({ value }) => {
    if (value === 0) return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle size={12} /> 0
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
        <AlertTriangle size={12} /> {value > 0 ? '+' + value : value}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Lalu Lintas</h1>
            <p className="text-gray-500 mt-1">Rekap jumlah perangkat masuk & keluar per periode.</p>
          </div>
          {data && (
            <button onClick={exportPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm">
              <Download size={16} /> Export PDF
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap sm:flex-nowrap">
            {['harian', 'bulanan', 'rentang'].map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  periode === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {p === 'rentang' ? 'Pilih Tanggal' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1 w-full sm:max-w-md">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16} /></div>
              <input type={periode === 'bulanan' ? 'month' : 'date'}
                value={periode === 'bulanan' ? tanggal.substring(0, 7) : tanggal}
                onChange={(e) => {
                  if (periode === 'bulanan') setTanggal(e.target.value + '-01');
                  else setTanggal(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            {periode === 'rentang' && (
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><span className="text-xs font-bold pl-0.5">s/d</span></div>
                <input type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
            )}
          </div>
          <button onClick={fetchLaporan} disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all text-sm disabled:opacity-70">
            <BarChart3 size={16} /> {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-6">
            <div className="text-sm text-gray-500 font-medium">
              Periode: <span className="text-gray-800 font-bold">{getPeriodeLabel()}</span>
            </div>

            {/* Table A: Detail */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">A. Detail Aktivitas</h3>
                <select 
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 cursor-pointer shadow-sm"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Pejabat">Hanya Pejabat</option>
                  <option value="Tamu">Hanya Tamu</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-indigo-50 text-indigo-800 text-xs uppercase tracking-wider">
                      <th className="py-3 px-3 font-bold text-center w-10 rounded-tl-xl">No</th>
                      <th className="py-3 px-3 font-bold whitespace-nowrap">Hari/Tanggal</th>
                      <th className="py-3 px-3 font-bold">Kategori</th>
                      <th className="py-3 px-3 font-bold">Nama</th>
                      <th className="py-3 px-3 font-bold">Perangkat</th>
                      <th className="py-3 px-3 font-bold text-center">Status</th>
                      <th className="py-3 px-3 font-bold text-center rounded-tr-xl">Jam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.detail_records && (() => {
                      const filtered = data.detail_records.filter(r => {
                        if (filterKategori === 'Semua') return true;
                        return r.kategori === filterKategori;
                      });
                      if (filtered.length === 0) {
                        return <tr><td colSpan="7" className="py-8 text-center text-gray-400">Tidak ada data aktivitas pada periode ini untuk kategori tersebut.</td></tr>;
                      }
                      return filtered.map((r, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3 text-gray-400 text-center text-xs">{i + 1}</td>
                          <td className="py-3 px-3 text-gray-700 font-medium text-xs whitespace-nowrap">
                            {r.waktu ? new Date(r.waktu).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            r.kategori === 'Pejabat' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>{r.kategori}</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-gray-800 text-xs">{r.nama}</td>
                        <td className="py-3 px-3 text-gray-600 text-xs">{r.perangkat}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            r.status === 'masuk' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {r.status === 'masuk' ? <LogIn size={12} /> : <LogOut size={12} />}
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                          <td className="py-3 px-3 text-center text-gray-600 font-mono text-xs">
                            {r.waktu ? new Date(r.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table B: Summary */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">B. Ringkasan</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-blue-800 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold rounded-tl-xl">Kategori</th>
                      <th className="py-3 px-4 font-bold">Jenis Perangkat</th>
                      <th className="py-3 px-4 font-bold text-center">Masuk</th>
                      <th className="py-3 px-4 font-bold text-center">Keluar</th>
                      <th className="py-3 px-4 font-bold text-center rounded-tr-xl">Selisih</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-gray-800">Pejabat</td>
                      <td className="py-3 px-4 text-gray-600">HP (Terdaftar)</td>
                      <td className="py-3 px-4 text-center font-bold text-orange-600">{data.pejabat.masuk}</td>
                      <td className="py-3 px-4 text-center font-bold text-green-600">{data.pejabat.keluar}</td>
                      <td className="py-3 px-4 text-center"><SelisihBadge value={data.pejabat.selisih} /></td>
                    </tr>
                    {data.tamu && data.tamu.length > 0 ? data.tamu.map((t, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{i === 0 ? 'Tamu' : ''}</td>
                        <td className="py-3 px-4 text-gray-600">{t.jenis_perangkat}</td>
                        <td className="py-3 px-4 text-center font-bold text-orange-600">{t.masuk}</td>
                        <td className="py-3 px-4 text-center font-bold text-green-600">{t.keluar}</td>
                        <td className="py-3 px-4 text-center"><SelisihBadge value={t.selisih} /></td>
                      </tr>
                    )) : (
                      <tr className="border-b border-gray-50">
                        <td className="py-3 px-4 text-gray-400">Tamu</td>
                        <td className="py-3 px-4 text-gray-400">-</td>
                        <td className="py-3 px-4 text-center text-gray-400">0</td>
                        <td className="py-3 px-4 text-center text-gray-400">0</td>
                        <td className="py-3 px-4 text-center"><SelisihBadge value={0} /></td>
                      </tr>
                    )}
                    <tr className="bg-gray-50 font-bold text-gray-900">
                      <td className="py-4 px-4 rounded-bl-xl" colSpan={2}>GRAND TOTAL</td>
                      <td className="py-4 px-4 text-center text-orange-700 text-lg">{data.grand_total.masuk}</td>
                      <td className="py-4 px-4 text-center text-green-700 text-lg">{data.grand_total.keluar}</td>
                      <td className="py-4 px-4 text-center rounded-br-xl"><SelisihBadge value={data.grand_total.selisih} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Verification */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              data.grand_total.selisih === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {data.grand_total.selisih === 0 ? (
                <>
                  <CheckCircle className="text-green-600 shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-green-800">Verifikasi: SEIMBANG</p>
                    <p className="text-green-600 text-sm">Jumlah perangkat masuk dan keluar sesuai.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-red-600 shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-red-800">Perhatian: TIDAK SEIMBANG</p>
                    <p className="text-red-600 text-sm">Terdapat selisih {Math.abs(data.grand_total.selisih)} perangkat yang belum seimbang.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="mx-auto mb-3" size={48} />
            <p>Pilih periode dan tanggal, lalu klik <b>"Tampilkan"</b> untuk melihat laporan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
