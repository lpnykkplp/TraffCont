import React, { useState } from 'react';
import api from '../lib/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, Calendar, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

const Laporan = () => {
  const [periode, setPeriode] = useState('harian');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/laporan?periode=${periode}&tanggal=${tanggal}`);
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
    return d.getFullYear().toString();
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const periodeLabel = getPeriodeLabel();

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN LALU LINTAS PERANGKAT ELEKTRONIK', 105, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Unit Pengamanan Pintu Utama (P2U)', 105, 27, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Periode: ${periode.charAt(0).toUpperCase() + periode.slice(1)}`, 14, 40);
    doc.text(`Tanggal: ${periodeLabel}`, 14, 46);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 52);

    // Build table data
    const tableRows = [];

    // Pejabat row
    tableRows.push(['Pejabat', 'HP (Terdaftar)', data.pejabat.masuk, data.pejabat.keluar, data.pejabat.selisih]);

    // Tamu rows
    if (data.tamu.length > 0) {
      data.tamu.forEach(t => {
        tableRows.push(['Tamu', t.jenis_perangkat, t.masuk, t.keluar, t.selisih]);
      });
    } else {
      tableRows.push(['Tamu', '-', 0, 0, 0]);
    }

    // Total row
    tableRows.push(['TOTAL', '', data.grand_total.masuk, data.grand_total.keluar, data.grand_total.selisih]);

    doc.autoTable({
      startY: 58,
      head: [['Kategori', 'Jenis Perangkat', 'Masuk', 'Keluar', 'Selisih']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      didParseCell: function(data) {
        // Style the TOTAL row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [243, 244, 246];
        }
        // Color selisih column
        if (data.column.index === 4 && data.section === 'body') {
          const val = data.cell.raw;
          if (val !== 0) {
            data.cell.styles.textColor = [220, 38, 38]; // red
          } else {
            data.cell.styles.textColor = [22, 163, 74]; // green
          }
        }
      }
    });

    // Verification note
    const finalY = doc.lastAutoTable.finalY + 10;
    const selisih = data.grand_total.selisih;
    doc.setFontSize(10);
    if (selisih === 0) {
      doc.setTextColor(22, 163, 74);
      doc.text('✓ VERIFIKASI: Jumlah perangkat masuk dan keluar SEIMBANG.', 14, finalY);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(`⚠ PERHATIAN: Terdapat selisih ${Math.abs(selisih)} perangkat yang belum seimbang.`, 14, finalY);
    }

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text('Dokumen ini digenerate otomatis oleh sistem P2U Scanner Gate.', 105, 285, { align: 'center' });

    doc.save(`Laporan_${periode}_${tanggal}.pdf`);
  };

  const SelisihBadge = ({ value }) => {
    if (value === 0) return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle size={12} /> 0
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
        <AlertTriangle size={12} /> {value > 0 ? `+${value}` : value}
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
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {['harian', 'bulanan', 'tahunan'].map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  periode === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Calendar size={16} /></div>
            <input type={periode === 'tahunan' ? 'number' : periode === 'bulanan' ? 'month' : 'date'}
              value={periode === 'tahunan' ? new Date(tanggal).getFullYear() : periode === 'bulanan' ? tanggal.substring(0, 7) : tanggal}
              onChange={(e) => {
                if (periode === 'tahunan') setTanggal(`${e.target.value}-01-01`);
                else if (periode === 'bulanan') setTanggal(`${e.target.value}-01`);
                else setTanggal(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <button onClick={fetchLaporan} disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all text-sm disabled:opacity-70">
            <BarChart3 size={16} /> {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 font-medium">
              Periode: <span className="text-gray-800 font-bold">{getPeriodeLabel()}</span>
            </div>

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
                  {/* Pejabat row */}
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-800">Pejabat</td>
                    <td className="py-3 px-4 text-gray-600">HP (Terdaftar)</td>
                    <td className="py-3 px-4 text-center font-bold text-orange-600">{data.pejabat.masuk}</td>
                    <td className="py-3 px-4 text-center font-bold text-green-600">{data.pejabat.keluar}</td>
                    <td className="py-3 px-4 text-center"><SelisihBadge value={data.pejabat.selisih} /></td>
                  </tr>

                  {/* Tamu rows */}
                  {data.tamu.length > 0 ? data.tamu.map((t, i) => (
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

                  {/* Grand Total */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-4 px-4 rounded-bl-xl" colSpan={2}>GRAND TOTAL</td>
                    <td className="py-4 px-4 text-center text-orange-700 text-lg">{data.grand_total.masuk}</td>
                    <td className="py-4 px-4 text-center text-green-700 text-lg">{data.grand_total.keluar}</td>
                    <td className="py-4 px-4 text-center rounded-br-xl"><SelisihBadge value={data.grand_total.selisih} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Verification Status */}
            <div className={`p-4 rounded-xl flex items-center gap-3 ${
              data.grand_total.selisih === 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {data.grand_total.selisih === 0 ? (
                <>
                  <CheckCircle className="text-green-600 shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-green-800">Verifikasi: SEIMBANG</p>
                    <p className="text-green-600 text-sm">Jumlah perangkat masuk dan keluar sesuai. Tidak ada selisih.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="text-red-600 shrink-0" size={24} />
                  <div>
                    <p className="font-bold text-red-800">Perhatian: TIDAK SEIMBANG</p>
                    <p className="text-red-600 text-sm">Terdapat selisih {Math.abs(data.grand_total.selisih)} perangkat yang belum seimbang. Harap verifikasi.</p>
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
