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

        // Get all logs in date range from LogAktivitas
        const logs = await LogAktivitas.find({
            waktu: { $gte: start, $lt: end }
        }).sort({ waktu: 1 })
          .populate('pejabat_id', 'nama merk_hp tipe_hp custom_id')
          .populate('tamu_id', 'nama_tamu asal_instansi jenis_perangkat merk');

        let pejabatMasuk = 0;
        let pejabatKeluar = 0;
        let totalTamuMasuk = 0;
        let totalTamuKeluar = 0;
        
        // Structure for Tamu summary by device type
        const jenisPerangkatList = ['HP', 'Laptop', 'Tablet', 'Flashdisk', 'Hardisk', 'Lainnya'];
        const tamuRekapByJenis = {};
        jenisPerangkatList.forEach(j => tamuRekapByJenis[j] = { masuk: 0, keluar: 0 });

        const allRecords = logs.map(log => {
            if (log.pejabat_id) {
                if (log.status === 'masuk') pejabatMasuk++;
                else pejabatKeluar++;

                return {
                    kategori: 'Pejabat',
                    nama: log.pejabat_id.nama,
                    perangkat: `${log.pejabat_id.merk_hp || ''} ${log.pejabat_id.tipe_hp || ''}`.trim(),
                    jenis: 'HP',
                    status: log.status,
                    waktu: log.waktu
                };
            } else if (log.tamu_id) {
                if (log.status === 'masuk') totalTamuMasuk++;
                else totalTamuKeluar++;

                const jenis = log.tamu_id.jenis_perangkat;
                if (!tamuRekapByJenis[jenis]) {
                    tamuRekapByJenis[jenis] = { masuk: 0, keluar: 0 };
                }
                if (log.status === 'masuk') tamuRekapByJenis[jenis].masuk++;
                else tamuRekapByJenis[jenis].keluar++;

                return {
                    kategori: 'Tamu',
                    nama: `${log.tamu_id.nama_tamu} (${log.tamu_id.asal_instansi})`,
                    perangkat: `${jenis} - ${log.tamu_id.merk}`,
                    jenis: jenis,
                    status: log.status,
                    waktu: log.waktu
                };
            } else {
                return {
                    kategori: 'Hapus',
                    nama: 'Data Terhapus',
                    perangkat: '-',
                    jenis: '-',
                    status: log.status,
                    waktu: log.waktu
                }
            }
        });

        const tamuSummary = Object.keys(tamuRekapByJenis).map(jenis => {
            const data = tamuRekapByJenis[jenis];
            return {
                jenis_perangkat: jenis,
                masuk: data.masuk,
                keluar: data.keluar,
                selisih: data.masuk - data.keluar
            };
        }).filter(item => item.masuk > 0 || item.keluar > 0);

        const grandMasuk = pejabatMasuk + totalTamuMasuk;
        const grandKeluar = pejabatKeluar + totalTamuKeluar;

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
