const express = require('express');
const router = express.Router();
const Tamu = require('../models/Tamu');
const LogAktivitas = require('../models/LogAktivitas');
const { uploadBase64 } = require('../lib/cloudUpload');

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
        
        let fotoUrl = null;
        if (req.body.foto_bukti) {
            fotoUrl = await uploadBase64(req.body.foto_bukti);
        }

        tamu.status = 'dalam';
        tamu.waktu_masuk = new Date();
        tamu.waktu_keluar = null;
        await tamu.save();
        
        await new LogAktivitas({
            tamu_id: tamu._id,
            status: 'masuk',
            waktu: new Date(),
            foto_bukti: fotoUrl
        }).save();

        res.json({ message: 'Perangkat berhasil dicatat MASUK', tamu });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle keluar
router.put('/:id/keluar', async (req, res) => {
    try {
        const tamu = await Tamu.findById(req.params.id);
        if (!tamu) return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
        
        let fotoUrl = null;
        if (req.body.foto_bukti) {
            fotoUrl = await uploadBase64(req.body.foto_bukti);
        }

        tamu.status = 'luar';
        tamu.waktu_keluar = new Date();
        await tamu.save();
        
        await new LogAktivitas({
            tamu_id: tamu._id,
            status: 'keluar',
            waktu: new Date(),
            foto_bukti: fotoUrl
        }).save();

        res.json({ message: 'Perangkat berhasil dicatat KELUAR', tamu });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update tamu details
router.put('/:id', async (req, res) => {
    try {
        const { nama_tamu, jabatan, asal_instansi, jenis_perangkat, merk, keterangan } = req.body;
        const updated = await Tamu.findByIdAndUpdate(req.params.id, {
            nama_tamu, jabatan, asal_instansi, jenis_perangkat, merk, keterangan
        }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Data tamu tidak ditemukan' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
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
