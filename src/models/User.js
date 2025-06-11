// models/User.js - BACKEND CORREGIDO
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    lastName: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true,
      maxlength: [50, 'El apellido no puede exceder 50 caracteres']
    },
    phone: {
      type: String,
      trim: true,
      default: '', // ✅ CORREGIDO: Default string vacío en lugar de null
      match: [/^\+?[\d\s-()]*$/, 'Número de teléfono inválido'] // ✅ CORREGIDO: Permitir string vacío
    },
    avatar: {
      type: String,
      default: ''  // ✅ CORREGIDO: Default string vacío en lugar de null
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Índices (solo los adicionales necesarios)
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });

// Middleware para hash de contraseña
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

// ✅ AGREGADO: Middleware para limpiar campos phone vacíos
userSchema.pre('save', function(next) {
  if (this.profile && this.profile.phone === null) {
    this.profile.phone = '';
  }
  next();
});

// Virtual para nombre completo
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

module.exports = mongoose.model('User', userSchema);