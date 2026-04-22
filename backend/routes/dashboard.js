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

        // Get 20 most recent logs from LogAktivitas (now covers both Pejabat and Tamu)
        const logs = await LogAktivitas.find()
            .sort({ waktu: -1 })
            .limit(20)
            .populate('pejabat_id', 'nama jabatan merk_hp tipe_hp custom_id')
            .populate('tamu_id', 'nama_tamu jabatan asal_instansi jenis_perangkat merk');

        const recent_activities = logs.map(log => {
            if (log.pejabat_id) {
                return {
                    _id: log._id,
                    tipe: 'pejabat',
                    nama: log.pejabat_id.nama,
                    jabatan: log.pejabat_id.jabatan || '-',
                    perangkat: `${log.pejabat_id.merk_hp || ''} ${log.pejabat_id.tipe_hp || ''}`.trim(),
                    custom_id: log.pejabat_id.custom_id,
                    status: log.status,
                    waktu: log.waktu
                };
            } else if (log.tamu_id) {
                return {
                    _id: log._id,
                    tipe: 'tamu',
                    nama: log.tamu_id.nama_tamu,
                    jabatan: log.tamu_id.jabatan || '-',
                    perangkat: `${log.tamu_id.jenis_perangkat} - ${log.tamu_id.merk}`,
                    custom_id: log.tamu_id.asal_instansi,
                    status: log.status,
                    waktu: log.waktu
                };
            } else {
                return {
                    _id: log._id,
                    tipe: 'unknown',
                    nama: 'Dihapus / Tidak Diketahui',
                    jabatan: '-',
                    perangkat: '-',
                    custom_id: '-',
                    status: log.status,
                    waktu: log.waktu
                };
            }
        });

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

// @route   DELETE /api/dashboard/riwayat/:id
// @desc    Delete a specific log (Admin only)
router.delete('/riwayat/:id', async (req, res) => {
    try {
        if (req.user && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Akses Ditolak: Hanya Admin yang dapat menghapus riwayat.' });
        }
        
        const deletedLog = await LogAktivitas.findByIdAndDelete(req.params.id);
        if (!deletedLog) {
            return res.status(404).json({ message: 'Riwayat tidak ditemukan.' });
        }
        
        res.json({ message: 'Riwayat berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
