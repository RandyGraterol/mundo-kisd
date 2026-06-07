// Servidor Express para Mundo Kids
// Plataforma educativa de geografía para estudiantes de primaria

const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const morgan = require('morgan');

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 3041;

// Configurar middleware de logs detallados en terminal
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Configurar middleware básico
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
  secret: 'mundo-kids-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configurar EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware para loguear cada petición con fecha y hora
app.use((req, res, next) => {
  const time = new Date().toLocaleString();
  console.log(`[${time}] [REQ] ${req.method} ${req.url}`);
  next();
});

// Inicializar base de datos y ejecutar seed
const { inicializarBaseDeDatos } = require('./database/db');
const { ejecutarSeed } = require('./database/seed');

try {
  inicializarBaseDeDatos();
  ejecutarSeed();
  console.log('[DB] Base de datos lista');
} catch (err) {
  console.error('[ERROR] Error al inicializar base de datos:', err.message);
}

// Middleware para pasar datos del usuario y helpers a todas las vistas (ANTES de montar rutas)
const { ICONOS } = require('./public/js/iconos');
app.use((req, res, next) => {
  res.locals.rutaActual = req.path;
  // Helper para renderizar iconos SVG en las vistas EJS
  res.locals.icono = function(nombre, clases = '') {
    const svg = ICONOS[nombre];
    if (!svg) return '';
    return svg.replace('<svg', `<svg class="${clases}"`);
  };
  // Sistema de mensajes flash: pasar mensaje de sesión a la vista y limpiarlo
  res.locals.flashMessage = req.session.flashMessage || null;
  delete req.session.flashMessage;
  // Helper para establecer un mensaje flash
  res.locals.setFlash = function(tipo, texto) {
    req.session.flashMessage = { tipo, texto };
  };
  next();
});

// Montar rutas
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/sopa-letras', require('./routes/sopa-letras'));
app.use('/memoria', require('./routes/memoria'));
app.use('/puzzle', require('./routes/puzzle'));

// Middleware de manejo de errores detallado (debe ir al final)
app.use((err, req, res, next) => {
  const time = new Date().toLocaleString();
  console.error(`[${time}] [ERROR] ERROR DETECTADO:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).render('error', { 
    mensaje: '¡Ups! Parece que algo salió mal. Intenta de nuevo.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[SERVER] Servidor Mundo Kids corriendo en http://localhost:${PORT}`);
  console.log('[SERVER] Listo para enseñar geografía a los niños de Valle Morín');
});

module.exports = app;
