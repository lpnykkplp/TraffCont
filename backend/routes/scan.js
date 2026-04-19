const express = require('express');
const router = express.Router();
const Pejabat = require('../models/Pejabat');
const LogAktivitas = require('../models/LogAktivitas');

// Handle QR scan
router.post('/', async (req, res) => {
    try {
        const { qr_code } = req.body; // Actually custom_id received from QR data
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

        // Save activity log
        const newLog = new LogAktivitas({
            pejabat_id: pejabat._id,
            status: logAction
        });
        await newLog.save();

        const message = newStatus === 'dalam' ? 'Berhasil masuk' : 'Keluar terdeteksi';
        
        res.json({ message, pejabat, status: newStatus });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
