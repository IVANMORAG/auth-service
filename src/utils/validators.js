// utils/validators.js - BACKEND CORREGIDO
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es requerido'
    }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La contraseña es requerida'
    }),
  profile: Joi.object({
    firstName: Joi.string()
      .trim()
      .max(50)
      .required()
      .messages({
        'string.max': 'El nombre no puede exceder 50 caracteres',
        'any.required': 'El nombre es requerido'
      }),
    lastName: Joi.string()
      .trim()
      .max(50)
      .required()
      .messages({
        'string.max': 'El apellido no puede exceder 50 caracteres',
        'any.required': 'El apellido es requerido'
      }),
    phone: Joi.string()
      .pattern(/^\+?[\d\s-()]+$/)
      .allow('') // ✅ CORREGIDO: Permitir string vacío en lugar de null
      .messages({
        'string.pattern.base': 'Número de teléfono inválido'
      })
  }).required()
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es requerido'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida'
    })
});

const updateProfileSchema = Joi.object({
  profile: Joi.object({
    firstName: Joi.string().trim().max(50),
    lastName: Joi.string().trim().max(50),
    phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).allow(''), // ✅ CORREGIDO
    avatar: Joi.string().uri().allow('')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema
};