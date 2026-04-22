const express = require('express');
const router = express.Router();
const LogAktivitas = require('../models/LogAktivitas');
const { uploadBase64 } = require('../lib/cloudUpload');

// Update log with photo
router.put('/:id/photo', async (req, res) => {
    try {
        const { foto_bukti } = req.body;
        if (!foto_bukti) {
            return res.status(400).json({ message: 'Foto bukti tidak ditemukan' });
        }

        const log = await LogAktivitas.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: 'Riwayat tidak ditemukan' });
        }

        // Upload photo
        const fotoUrl = await uploadBase64(foto_bukti);
        if (!fotoUrl) {
            return res.status(500).json({ message: 'Gagal mengunggah foto' });
        }

        // Update log with photo URL
        log.foto_bukti = fotoUrl;
        await log.save();

        res.json({ message: 'Foto bukti berhasil diunggah', log });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
