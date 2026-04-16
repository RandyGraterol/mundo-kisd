// Servidor Express para Mundo Kids
// Plataforma educativa de geografía para estudiantes de primaria

const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const morgan = require('morgan');

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

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
  console.log(`[${time}] ➡️  ${req.method} ${req.url}`);
  next();
});

// Montar rutas
app.use('/', require('./routes/index'));

// Middleware de manejo de errores detallado (debe ir al final)
app.use((err, req, res, next) => {
  const time = new Date().toLocaleString();
  console.error(`[${time}] ❌ ERROR DETECTADO:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).render('error', { 
    mensaje: '¡Ups! 😅 Parece que algo salió mal. Intenta de nuevo.'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌍 Servidor Mundo Kids corriendo en http://localhost:${PORT}`);
  console.log(`📚 Listo para enseñar geografía a los niños de Valle Morín`);
});

module.exports = app;
