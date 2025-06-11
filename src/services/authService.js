// services/authService.js - BACKEND CORREGIDO
const User = require('../models/User');
const Session = require('../models/Session');
const mongoose = require('mongoose'); // Agrega esta línea al inicio
const { generateToken, verifyToken } = require('../config/jwt');
const { comparePassword } = require('../utils/bcrypt');

class AuthService {
  async register(userData) {
    const { email, password, profile } = userData;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }
    
    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      profile
    });
    
    await user.save();
    
    // Generar token y crear sesión
    const token = generateToken({ userId: user._id, email: user.email });
    
    const session = new Session({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });
    
    await session.save();
    
    // ✅ CORREGIDO: Retornar estructura consistente
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isActive: user.isActive
      }
    };
  }
  
  async login(email, password, userAgent, ipAddress) {
    // Buscar usuario por email (incluir password para comparación)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    
    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }
    
    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }
    
    // Generar token
    const token = generateToken({ userId: user._id, email: user.email });
    
    // Crear sesión
    const session = new Session({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      userAgent,
      ipAddress
    });
    
    await session.save();
    
    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();
    
    // ✅ CORREGIDO: Retornar estructura consistente
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      }
    };
  }
  
  async logout(token) {
    try {
      // Marcar sesión como inactiva
      await Session.findOneAndUpdate(
        { token },
        { isActive: false }
      );
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  async validateToken(token) {
    try {
      // Verificar JWT
      const decoded = verifyToken(token);
      
      // Verificar que la sesión existe y está activa
      const session = await Session.findOne({ 
        token, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      });
      
      if (!session) {
        return null;
      }
      
      // Obtener usuario
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return null;
      }
      
      return user;
    } catch (error) {
      return null;
    }
  }
  
  async updateProfile(userId, profileData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { profile: profileData },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    return user;
  }
  
  async getUserSessions(userId) {
    const sessions = await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    return sessions;
  }

  async getUserById(userId) {
  // Validar que el ID sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID de usuario inválido');
  }
  
  const user = await User.findById(userId)
    .select('-password -refreshTokens -__v')
    .lean();
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  return user;
}

  async getPublicUserById(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID de usuario inválido');
  }
  
  const user = await User.findById(userId)
    .select('email profile role isActive createdAt') // Solo campos públicos
    .lean();
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  // Puedes agregar filtros adicionales aquí
  if (!user.isActive) {
    throw new Error('Usuario no disponible');
  }
  
  return user;
}
}

module.exports = new AuthService();