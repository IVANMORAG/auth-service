// controllers/authController.js - CORREGIDO
const authService = require('../services/authService');
const { verifyToken } = require('../config/jwt');
const mongoose = require('mongoose'); // Añade esta línea al inicio

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result // ✅ CORREGIDO: data contiene { token, user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.login(email, password, userAgent, ipAddress);
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result // ✅ CORREGIDO: data contiene { token, user }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        await authService.logout(token);
      }
      
      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body.profile);
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  async validateToken(req, res) {
    try {
      // 1. Extrae el token del header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token requerido en el header Authorization (formato: Bearer <token>)'
        });
      }
      
      // 2. Valida el token
      const user = await authService.validateToken(token);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido o expirado'
        });
      }
      
      // 3. Respuesta exitosa - ✅ CORREGIDO: Estructura consistente
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          user: {
            id: user._id,
            email: user.email,
            profile: user.profile,
            role: user.role,
            isActive: user.isActive
          }
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token inválido',
        data: { valid: false }
      });
    }
  }
  
  async getSessions(req, res) {
    try {
      const sessions = await authService.getUserSessions(req.user._id);
      
      res.status(200).json({
        success: true,
        data: { sessions }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getUserById(req, res) {
  try {
    const userId = req.params.id;
    
    // Verificar si el usuario que hace la petición es admin o está solicitando su propio perfil
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para acceder a este recurso'
      });
    }
    
    const user = await authService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async getPublicUserById(req, res) {
  try {
    const userId = req.params.id;
    
    // Validación básica del ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }
    
    const user = await authService.getPublicUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
}

module.exports = new AuthController();