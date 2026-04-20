const express = require('express');
const router = express.Router();
const LogAktivitas = require('../models/LogAktivitas');
const Tamu = require('../models/Tamu');

function getDateRange(periode, tanggal, tanggal_akhir) {
    const date = new Date(tanggal);
    let start, end;
    if (periode === 'harian') {
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if (periode === 'bulanan') {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else if (periode === 'rentang') {
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endDate = new Date(tanggal_akhir);
        end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
    } else {
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    return { start, end };
}

router.get('/', async (req, res) => {
    try {
        const { periode = 'harian', tanggal = new Date().toISOString(), tanggal_akhir = new Date().toISOString() } = req.query;
        const { start, end } = getDateRange(periode, tanggal, tanggal_akhir);

        // === PEJABAT detail records ===
        const pejabatLogs = await LogAktivitas.find({
            waktu: { $gte: start, $lt: end }
        }).sort({ waktu: 1 }).populate('pejabat_id', 'nama merk_hp tipe_hp custom_id');

        const pejabatRecords = pejabatLogs.map(log => ({
            kategori: 'Pejabat',
            nama: log.pejabat_id ? log.pejabat_id.nama : 'Dihapus',
            perangkat: log.pejabat_id ? `${log.pejabat_id.merk_hp || ''} ${log.pejabat_id.tipe_hp || ''}`.trim() : '-',
            jenis: 'HP',
            status: log.status,
            waktu: log.waktu
        }));

        const pejabatMasuk = pejabatRecords.filter(r => r.status === 'masuk').length;
        const pejabatKeluar = pejabatRecords.filter(r => r.status === 'keluar').length;

        // === TAMU detail records ===
        const tamuMasukList = await Tamu.find({
            waktu_masuk: { $gte: start, $lt: end }
        }).sort({ waktu_masuk: 1 });

        const tamuKeluarList = await Tamu.find({
            waktu_keluar: { $gte: start, $lt: end }
        }).sort({ waktu_keluar: 1 });

        const tamuRecords = [];
        tamuMasukList.forEach(t => {
            tamuRecords.push({
                kategori: 'Tamu',
                nama: `${t.nama_tamu} (${t.asal_instansi})`,
                perangkat: `${t.jenis_perangkat} - ${t.merk}`,
                jenis: t.jenis_perangkat,
                status: 'masuk',
                waktu: t.waktu_masuk
            });
        });
        tamuKeluarList.forEach(t => {
            tamuRecords.push({
                kategori: 'Tamu',
                nama: `${t.nama_tamu} (${t.asal_instansi})`,
                perangkat: `${t.jenis_perangkat} - ${t.merk}`,
                jenis: t.jenis_perangkat,
                status: 'keluar',
                waktu: t.waktu_keluar
            });
        });

        const totalTamuMasuk = tamuMasukList.length;
        const totalTamuKeluar = tamuKeluarList.length;

        // Tamu summary by device type
        const jenisPerangkatList = ['HP', 'Laptop', 'Tablet', 'Flashdisk', 'Hardisk', 'Lainnya'];
        const tamuSummary = jenisPerangkatList.map(jenis => {
            const masuk = tamuMasukList.filter(t => t.jenis_perangkat === jenis).length;
            const keluar = tamuKeluarList.filter(t => t.jenis_perangkat === jenis).length;
            return { jenis_perangkat: jenis, masuk, keluar, selisih: masuk - keluar };
        }).filter(item => item.masuk > 0 || item.keluar > 0);

        const grandMasuk = pejabatMasuk + totalTamuMasuk;
        const grandKeluar = pejabatKeluar + totalTamuKeluar;

        // Merge all detail records sorted by time
        const allRecords = [...pejabatRecords, ...tamuRecords].sort((a, b) => new Date(a.waktu) - new Date(b.waktu));

        res.json({
            periode,
            tanggal_awal: start,
            tanggal_akhir: end,
            pejabat: { masuk: pejabatMasuk, keluar: pejabatKeluar, selisih: pejabatMasuk - pejabatKeluar },
            tamu: tamuSummary,
            total_tamu: { masuk: totalTamuMasuk, keluar: totalTamuKeluar, selisih: totalTamuMasuk - totalTamuKeluar },
            grand_total: { masuk: grandMasuk, keluar: grandKeluar, selisih: grandMasuk - grandKeluar },
            detail_records: allRecords
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
