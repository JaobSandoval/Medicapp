const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { name, email, password } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está registrado.',
        });
      }

      // Crear usuario
      const user = await User.create({ name, email, password });
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario.',
      });
    }
  },

  // Inicio de sesión
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas.',
        });
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas.',
        });
      }

      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión.',
      });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: req.user.toJSON(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil.',
      });
    }
  },

  // Actualizar perfil
  updateProfile: async (req, res) => {
    try {
      const { name } = req.body;
      
      await req.user.update({ name });

      res.json({
        success: true,
        message: 'Perfil actualizado.',
        data: {
          user: req.user.toJSON(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil.',
      });
    }
  },
};

module.exports = authController;
