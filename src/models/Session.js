const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Índice para búsquedas por userId
  },
  token: {
    type: String,
    required: true,
    unique: true // Índice único definido aquí (sin duplicar con schema.index())
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Índice TTL para autoeliminación
  },
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices adicionales
sessionSchema.index({ createdAt: 1 }); // Índice para ordenar por fecha de creación

module.exports = mongoose.model('Session', sessionSchema);