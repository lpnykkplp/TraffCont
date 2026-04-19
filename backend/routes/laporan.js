const express = require('express');
const router = express.Router();
const LogAktivitas = require('../models/LogAktivitas');
const Tamu = require('../models/Tamu');

// Helper to get date range based on period
function getDateRange(periode, tanggal) {
    const date = new Date(tanggal);
    let start, end;

    if (periode === 'harian') {
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if (periode === 'bulanan') {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    } else if (periode === 'tahunan') {
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear() + 1, 0, 1);
    }

    return { start, end };
}

router.get('/', async (req, res) => {
    try {
        const { periode = 'harian', tanggal = new Date().toISOString() } = req.query;
        const { start, end } = getDateRange(periode, tanggal);

        // === PEJABAT (from LogAktivitas) ===
        const pejabatMasuk = await LogAktivitas.countDocuments({
            status: 'masuk',
            waktu: { $gte: start, $lt: end }
        });
        const pejabatKeluar = await LogAktivitas.countDocuments({
            status: 'keluar',
            waktu: { $gte: start, $lt: end }
        });

        // === TAMU (from Tamu collection, grouped by jenis_perangkat) ===
        const tamuMasuk = await Tamu.aggregate([
            { $match: { waktu_masuk: { $gte: start, $lt: end } } },
            { $group: { _id: '$jenis_perangkat', count: { $sum: 1 } } }
        ]);

        const tamuKeluar = await Tamu.aggregate([
            { $match: { waktu_keluar: { $gte: start, $lt: end } } },
            { $group: { _id: '$jenis_perangkat', count: { $sum: 1 } } }
        ]);

        // Build tamu summary per device type
        const jenisPerangkatList = ['HP', 'Laptop', 'Tablet', 'Flashdisk', 'Hardisk', 'Lainnya'];
        const tamuSummary = jenisPerangkatList.map(jenis => {
            const masukItem = tamuMasuk.find(m => m._id === jenis);
            const keluarItem = tamuKeluar.find(k => k._id === jenis);
            const masuk = masukItem ? masukItem.count : 0;
            const keluar = keluarItem ? keluarItem.count : 0;
            return {
                jenis_perangkat: jenis,
                masuk,
                keluar,
                selisih: masuk - keluar
            };
        }).filter(item => item.masuk > 0 || item.keluar > 0); // Only include types with data

        // Total tamu
        const totalTamuMasuk = tamuSummary.reduce((sum, t) => sum + t.masuk, 0);
        const totalTamuKeluar = tamuSummary.reduce((sum, t) => sum + t.keluar, 0);

        // Grand totals
        const grandMasuk = pejabatMasuk + totalTamuMasuk;
        const grandKeluar = pejabatKeluar + totalTamuKeluar;

        res.json({
            periode,
            tanggal_awal: start,
            tanggal_akhir: end,
            pejabat: {
                masuk: pejabatMasuk,
                keluar: pejabatKeluar,
                selisih: pejabatMasuk - pejabatKeluar
            },
            tamu: tamuSummary,
            total_tamu: {
                masuk: totalTamuMasuk,
                keluar: totalTamuKeluar,
                selisih: totalTamuMasuk - totalTamuKeluar
            },
            grand_total: {
                masuk: grandMasuk,
                keluar: grandKeluar,
                selisih: grandMasuk - grandKeluar
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
