const mongoose = require('mongoose');

const logAktivitasSchema = new mongoose.Schema({
    pejabat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pejabat' },
    tamu_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tamu' },
    waktu: { type: Date, default: Date.now },
    status: { type: String, enum: ['masuk', 'keluar'], required: true },
    foto_bukti: { type: String, default: null }
});

module.exports = mongoose.model('LogAktivitas', logAktivitasSchema);
