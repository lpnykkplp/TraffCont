const express = require('express');
const router = express.Router();
const Tamu = require('../models/Tamu');

// Get all guest records (optionally filter by status)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const tamuList = await Tamu.find(filter).sort({ created_at: -1 });
        res.json(tamuList);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new guest entry (status starts as 'luar' - belum masuk)
router.post('/', async (req, res) => {
    try {
        const { nama_tamu, jabatan, asal_instansi, jenis_perangkat, merk, keterangan, petugas } = req.body;
        const newTamu = new Tamu({
            nama_tamu,
            jabatan,
            asal_instansi,
            jenis_perangkat,
            merk,
            keterangan,
            petugas,
            status: 'luar'
        });
        const saved = await newTamu.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Toggle masuk
router.put('/:id/masuk', async (req, res) => {
    try {
        const tamu = await Tamu.findById(req.params.id);
        if (!tamu) return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
        
        tamu.status = 'dalam';
        tamu.waktu_masuk = new Date();
        tamu.waktu_keluar = null;
        await tamu.save();
        res.json({ message: 'Perangkat tamu berhasil dicatat MASUK', tamu });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle keluar
router.put('/:id/keluar', async (req, res) => {
    try {
        const tamu = await Tamu.findById(req.params.id);
        if (!tamu) return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
        
        tamu.status = 'luar';
        tamu.waktu_keluar = new Date();
        await tamu.save();
        res.json({ message: 'Perangkat tamu berhasil dicatat KELUAR', tamu });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete guest record
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Tamu.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
        res.json({ message: 'Data tamu berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
