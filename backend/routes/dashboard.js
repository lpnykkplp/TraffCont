const express = require('express');
const router = express.Router();
const Pejabat = require('../models/Pejabat');
const LogAktivitas = require('../models/LogAktivitas');

router.get('/', async (req, res) => {
    try {
        const total_pejabat = await Pejabat.countDocuments();
        
        // Since 1 pejabat is assumed to have 1 HP in this form, it's the same
        const total_hp = total_pejabat; 
        
        const jumlah_dalam = await Pejabat.countDocuments({ status: 'dalam' });
        const jumlah_luar = await Pejabat.countDocuments({ status: 'luar' });

        // Get 10 most recent logs
        const recent_activities = await LogAktivitas.find()
            .sort({ waktu: -1 })
            .limit(10)
            .populate('pejabat_id', 'nama merk_hp tipe_hp custom_id'); // populate name, etc.

        res.json({
            total_pejabat,
            total_hp,
            jumlah_dalam,
            jumlah_luar,
            recent_activities
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
