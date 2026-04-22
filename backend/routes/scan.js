const express = require('express');
const router = express.Router();
const Pejabat = require('../models/Pejabat');
const LogAktivitas = require('../models/LogAktivitas');
const { uploadBase64 } = require('../lib/cloudUpload');

// Handle QR scan
router.post('/', async (req, res) => {
    try {
        const { qr_code, foto_bukti } = req.body;
        if (!qr_code) {
            return res.status(400).json({ message: 'QR Code data missing' });
        }

        const pejabat = await Pejabat.findOne({ custom_id: qr_code });
        if (!pejabat) {
            return res.status(404).json({ message: 'Pejabat not found' });
        }

        // Toggle status
        const newStatus = pejabat.status === 'luar' ? 'dalam' : 'luar';
        pejabat.status = newStatus;
        await pejabat.save();

        const logAction = newStatus === 'dalam' ? 'masuk' : 'keluar';

        // Upload photo if provided
        let fotoUrl = null;
        if (foto_bukti) {
            fotoUrl = await uploadBase64(foto_bukti);
        }

        // Save activity log
        const newLog = new LogAktivitas({
            pejabat_id: pejabat._id,
            status: logAction,
            foto_bukti: fotoUrl
        });
        await newLog.save();

        const message = newStatus === 'dalam' ? 'Berhasil masuk' : 'Keluar terdeteksi';
        
        res.json({ message, pejabat, status: newStatus });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
