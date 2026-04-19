const mongoose = require('mongoose');

const logAktivitasSchema = new mongoose.Schema({
    pejabat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pejabat', required: true },
    waktu: { type: Date, default: Date.now },
    status: { type: String, enum: ['masuk', 'keluar'], required: true }
});

module.exports = mongoose.model('LogAktivitas', logAktivitasSchema);
