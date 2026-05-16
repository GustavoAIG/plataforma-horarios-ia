const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

// Endpoint de Registro de Usuarios
router.post('/register', async (req, res) => {
  try {
      const { Email_User, Password_user, Name_User } = req.body;
      
      console.log('\n--------------------------------------------------');
      console.log(`[INFO] Trazabilidad: Petición de registro recibida en /api/auth/register`);
      
      if (!Email_User || !Password_user) {
          console.warn(`[WARN] Intento de registro fallido: Campos incompletos.`);
          return res.status(400).json({ message: 'Missing fields' });
      }

      const existing = await User.findOne({ Email_User });
      if (existing) {
          console.warn(`[WARN] Intento de registro fallido: El usuario ya existe -> ${Email_User}`);
          return res.status(409).json({ message: 'User already exists' });
      }

      // Control Preventivo: Cifrado Hashing irreversible de la credencial
      const hash = await bcrypt.hash(Password_user, 10);
      const user = new User({ Email_User, Password_user: hash, Name_User, Role: 'user' });
      await user.save();
      
      console.log(`[INFO] Estudiante registrado exitosamente en MongoDB Atlas: ${Email_User}`);
      console.log('--------------------------------------------------');

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, Email_User: user.Email_User, Name_User: user.Name_User } });
  } catch (err) {
      console.error(`[ERROR] Excepción en el proceso de registro: ${err.message}`);
      return res.status(500).json({ message: err.message });
  }
});

// Endpoint de Autenticación de Usuarios (Login con protección NoSQL e Injection Audit)
router.post('/login', async (req, res) => {
  try {
    const { Email_User, Password_user } = req.body;

    console.log('\n--------------------------------------------------');
    console.log(`[INFO] Trazabilidad: Petición de autenticación recibida en /api/auth/login`);
    console.log(`[INFO] Payload recibido en crudo (Body JSON):`, req.body);

    // CONTROL PREVENTIVO Y DETECTIVO: Detectar Inyección NoSQL / BSON (Objetos maliciosos como {"$ne": "123"})
    if ((Email_User && typeof Email_User === 'object') || (Password_user && typeof Password_user === 'object')) {
        console.warn(`[WARN] [ALERTA DE SEGURIDAD] Estructura maliciosa NoSQL detectada en los campos de autenticación.`);
        console.warn(`[WARN] Intento de Bypass perimetral manipulando operadores lógicos BSON.`);
        console.log('--------------------------------------------------');
        
        return res.status(401).json({ 
            status: "error",
            message: 'Estructura de datos inválida o maliciosa detectada por el filtro NoSQL.' 
        });
    }

    if (!Email_User || !Password_user) {
        console.warn(`[WARN] Intento de autenticación denegado: Campos de texto vacíos.`);
        return res.status(400).json({ message: 'Missing fields' });
    }

    // Búsqueda parametrizada mediante el ODM Mongoose
    const user = await User.findOne({ Email_User });
    if (!user) {
        console.warn(`[WARN] Intento de login fallido. Cuenta no registrada en la nube: ${Email_User}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validación criptográfica de la contraseña
    const match = await bcrypt.compare(Password_user, user.Password_user);
    if (!match) {
        console.warn(`[WARN] Intento de login fallido. Credenciales incorrectas para: ${Email_User}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[INFO] Autenticación satisfactoria. Sesión iniciada correctamente para: ${Email_User}`);
    console.log('--------------------------------------------------');

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, Email_User: user.Email_User, Name_User: user.Name_User } });
  } catch (err) {
    console.error(`[ERROR] Excepción crítica detectada en el endpoint de login: ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;