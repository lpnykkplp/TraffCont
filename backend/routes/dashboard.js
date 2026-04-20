const express = require('express');
const router = express.Router();
const Pejabat = require('../models/Pejabat');
const LogAktivitas = require('../models/LogAktivitas');
const Tamu = require('../models/Tamu');

router.get('/', async (req, res) => {
    try {
        const total_pejabat = await Pejabat.countDocuments();
        const total_hp = total_pejabat;
        const jumlah_dalam = await Pejabat.countDocuments({ status: 'dalam' });
        const jumlah_luar = await Pejabat.countDocuments({ status: 'luar' });

        // Tamu stats
        const total_tamu = await Tamu.countDocuments();
        const tamu_dalam = await Tamu.countDocuments({ status: 'dalam' });

        // Get 20 most recent pejabat logs
        const pejabatLogs = await LogAktivitas.find()
            .sort({ waktu: -1 })
            .limit(20)
            .populate('pejabat_id', 'nama merk_hp tipe_hp custom_id');

        // Get 20 most recent tamu activities (those with waktu_masuk or waktu_keluar)
        const tamuMasukLogs = await Tamu.find({ waktu_masuk: { $ne: null } })
            .sort({ waktu_masuk: -1 })
            .limit(20)
            .select('nama_tamu asal_instansi jenis_perangkat merk waktu_masuk waktu_keluar status');

        // Merge and format into unified activity list
        const allActivities = [];

        pejabatLogs.forEach(log => {
            allActivities.push({
                _id: log._id,
                tipe: 'pejabat',
                nama: log.pejabat_id ? log.pejabat_id.nama : 'Dihapus',
                perangkat: log.pejabat_id ? `${log.pejabat_id.merk_hp || ''} ${log.pejabat_id.tipe_hp || ''}`.trim() : '-',
                custom_id: log.pejabat_id ? log.pejabat_id.custom_id : '-',
                status: log.status,
                waktu: log.waktu
            });
        });

        tamuMasukLogs.forEach(t => {
            // Add masuk event
            if (t.waktu_masuk) {
                allActivities.push({
                    _id: t._id + '_masuk',
                    tipe: 'tamu',
                    nama: t.nama_tamu,
                    perangkat: `${t.jenis_perangkat} - ${t.merk}`,
                    custom_id: t.asal_instansi,
                    status: 'masuk',
                    waktu: t.waktu_masuk
                });
            }
            // Add keluar event
            if (t.waktu_keluar) {
                allActivities.push({
                    _id: t._id + '_keluar',
                    tipe: 'tamu',
                    nama: t.nama_tamu,
                    perangkat: `${t.jenis_perangkat} - ${t.merk}`,
                    custom_id: t.asal_instansi,
                    status: 'keluar',
                    waktu: t.waktu_keluar
                });
            }
        });

        // Sort all by time descending, take top 20
        allActivities.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
        const recent_activities = allActivities.slice(0, 20);

        res.json({
            total_pejabat,
            total_hp,
            jumlah_dalam,
            jumlah_luar,
            total_tamu,
            tamu_dalam,
            recent_activities
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
