# Documento de Diseño Técnico: Mundo Kids Frontend

## Overview

Mundo Kids es una aplicación web educativa gamificada para enseñar geografía a estudiantes de primaria en Venezuela. El sistema está diseñado para funcionar completamente offline en equipos Canaima/Cebit con datos mock, utilizando una arquitectura simple basada en Express.js, EJS templates y Tailwind CSS.

### Objetivos del Diseño

- Proporcionar una experiencia de usuario fluida y atractiva para niños de primaria
- Garantizar funcionalidad offline completa sin dependencias externas
- Mantener una arquitectura simple y mantenible
- Optimizar rendimiento para hardware de especificaciones modestas
- Facilitar la futura integración con un backend real

### Alcance

Este diseño cubre el frontend completo de la aplicación, incluyendo:
- 4 pantallas principales con navegación completa
- Sistema de gestión de estado de usuario
- Datos mock para 6 continentes
- Arquitectura de templates EJS reutilizables
- Servidor Express.js mínimo para servir la aplicación

## Architecture

### Arquitectura General

La aplicación sigue un patrón MVC (Model-View-Controller) simplificado:

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Cliente)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Rendered HTML (EJS Templates)              │  │
│  │  - Pantalla Bienvenida                               │  │
│  │  - Menú Principal                                    │  │
│  │  - Selector Continentes                              │  │
│  │  - Vista Continente                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│                    HTTP Requests                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Server (Node.js)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Routes Layer                       │  │
│  │  - GET /                                             │  │
│  │  - POST /menu                                        │  │
│  │  - GET /continentes                                  │  │
│  │  - GET /continente/:id                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Session Management                   │  │
│  │  - express-session middleware                        │  │
│  │  - Almacena nombre de usuario                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Data Layer                         │  │
│  │  - Mock data (continentes.js)                        │  │
│  │  - Funciones de acceso a datos                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   View Engine (EJS)                   │  │
│  │  - Layout base                                       │  │
│  │  - Partials reutilizables                            │  │
│  │  - Templates de vistas                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Static Assets                           │
│  - Tailwind CSS (local)                                     │
│  - Imágenes y recursos                                      │
│  - JavaScript del cliente (opcional)                        │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Inicio de Sesión:**
   - Usuario accede a `/` → Pantalla de Bienvenida
   - Usuario ingresa nombre → POST `/menu` → Crea sesión con nombre
   - Servidor redirige a Menú Principal con sesión activa

2. **Navegación Principal:**
   - Usuario selecciona "Estudiar Continentes" → GET `/continentes`
   - Servidor renderiza Selector de Continentes con datos de sesión

3. **Visualización de Continente:**
   - Usuario selecciona continente → GET `/continente/:id`
   - Servidor obtiene datos mock del continente
   - Servidor renderiza Vista de Continente con datos

4. **Gestión de Estado:**
   - Todas las rutas verifican sesión activa
   - Nombre de usuario se pasa a todas las vistas mediante `res.locals`
   - Botones "Volver" navegan mediante enlaces GET

### Decisiones Arquitectónicas

**1. Express.js como servidor:**
- Ligero y simple para el alcance del proyecto
- Amplio soporte y documentación
- Fácil integración con EJS

**2. EJS como template engine:**
- Sintaxis simple similar a HTML
- Permite reutilización mediante partials y layouts
- No requiere compilación o build step
- Ideal para renderizado server-side

**3. Sesiones en memoria (express-session):**
- Suficiente para uso offline local
- No requiere base de datos
- Datos se pierden al reiniciar servidor (aceptable para el caso de uso)

**4. Datos mock en archivos JavaScript:**
- Fácil de mantener y modificar
- Estructura preparada para migración a base de datos
- No requiere parsing JSON en cada request

**5. Tailwind CSS:**
- Desarrollo rápido con clases utilitarias
- Diseño responsive out-of-the-box
- Puede usarse via CDN o archivo local para offline

## Components and Interfaces

### Estructura de Directorios

```
mundo-kids-frontend/
├── server.js                 # Punto de entrada de la aplicación
├── package.json              # Dependencias y scripts
├── README.md                 # Documentación del proyecto
├── data/
│   └── continentes.js        # Datos mock de continentes
├── routes/
│   └── index.js              # Definición de rutas
├── public/
│   ├── css/
│   │   └── tailwind.css      # Tailwind CSS local (opcional)
│   ├── images/
│   │   ├── logo.png          # Logo Mundo Kids
│   │   ├── avatar-nino.png   # Avatar masculino
│   │   └── avatar-nina.png   # Avatar femenino
│   └── js/
│       └── main.js           # JavaScript del cliente (opcional)
└── views/
    ├── layout.ejs            # Layout base con EJS-Layout
    ├── partials/
    │   ├── header.ejs        # Header común
    │   ├── footer.ejs        # Footer común
    │   └── boton.ejs         # Componente de botón reutilizable
    ├── bienvenida.ejs        # Pantalla de bienvenida
    ├── menu.ejs              # Menú principal
    ├── continentes.ejs       # Selector de continentes
    └── continente.ejs        # Vista de continente individual
```

### Componentes del Sistema

#### 1. Servidor Express (server.js)

**Responsabilidades:**
- Inicializar aplicación Express
- Configurar middleware (express-session, body-parser, static files)
- Configurar EJS como view engine
- Montar rutas
- Iniciar servidor en puerto especificado

**Interfaz:**
```javascript
// Configuración básica
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'mundo-kids-secret-key',
  resave: false,
  saveUninitialized: false
}));

// View engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Routes
app.use('/', require('./routes/index'));

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
```

#### 2. Rutas (routes/index.js)

**Responsabilidades:**
- Definir endpoints de la aplicación
- Gestionar sesiones de usuario
- Obtener datos mock
- Renderizar vistas con datos apropiados

**Interfaz de Rutas:**

```javascript
const express = require('express');
const router = express.Router();
const { obtenerContinentes, obtenerContinentePorId } = require('../data/continentes');

// Middleware para verificar sesión
function verificarSesion(req, res, next) {
  if (!req.session.nombreUsuario) {
    return res.redirect('/');
  }
  res.locals.nombreUsuario = req.session.nombreUsuario;
  next();
}

// GET / - Pantalla de Bienvenida
router.get('/', (req, res) => {
  res.render('bienvenida', { layout: false });
});

// POST /menu - Crear sesión y mostrar menú
router.post('/menu', (req, res) => {
  const { nombre } = req.body;
  if (nombre && nombre.trim()) {
    req.session.nombreUsuario = nombre.trim();
    res.redirect('/menu');
  } else {
    res.redirect('/');
  }
});

// GET /menu - Menú Principal
router.get('/menu', verificarSesion, (req, res) => {
  res.render('menu');
});

// GET /continentes - Selector de Continentes
router.get('/continentes', verificarSesion, (req, res) => {
  const continentes = obtenerContinentes();
  res.render('continentes', { continentes });
});

// GET /continente/:id - Vista de Continente
router.get('/continente/:id', verificarSesion, (req, res) => {
  const continente = obtenerContinentePorId(req.params.id);
  if (!continente) {
    return res.redirect('/continentes');
  }
  res.render('continente', { continente });
});

// GET /salir - Cerrar sesión
router.get('/salir', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
```

#### 3. Capa de Datos (data/continentes.js)

**Responsabilidades:**
- Almacenar datos mock de continentes
- Proporcionar funciones de acceso a datos
- Estructurar datos para fácil migración futura

**Interfaz de Datos:**

```javascript
const continentes = [
  {
    id: 'america',
    nombre: 'América',
    emoji: '🌎',
    color: '#ec4899', // Rosa/Fucsia
    descripcion: 'América es el segundo continente más grande del mundo...',
    datosCuriosos: 'El río Amazonas es el más caudaloso del mundo...',
    paisesPrincipales: ['Brasil', 'Estados Unidos', 'México', 'Argentina', 'Canadá', 'Venezuela']
  },
  {
    id: 'europa',
    nombre: 'Europa',
    emoji: '🏰',
    color: '#3b82f6', // Azul
    descripcion: 'Europa es un continente con una rica historia...',
    datosCuriosos: 'Europa tiene más de 200 idiomas diferentes...',
    paisesPrincipales: ['Rusia', 'Alemania', 'Francia', 'Reino Unido', 'Italia', 'España']
  },
  // ... más continentes
];

function obtenerContinentes() {
  return continentes;
}

function obtenerContinentePorId(id) {
  return continentes.find(c => c.id === id);
}

module.exports = {
  obtenerContinentes,
  obtenerContinentePorId
};
```

#### 4. Templates EJS

**4.1 Layout Base (views/layout.ejs)**

**Responsabilidades:**
- Definir estructura HTML común
- Incluir head con meta tags y CSS
- Definir área de contenido dinámico
- Incluir scripts comunes

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mundo Kids - Aprende Geografía Jugando</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
    }
  </style>
</head>
<body class="bg-gradient-to-br from-blue-900 to-blue-700 min-h-screen">
  <%- body %>
</body>
</html>
```

**4.2 Pantalla de Bienvenida (views/bienvenida.ejs)**

**Responsabilidades:**
- Mostrar logo y slogan
- Proporcionar campo de entrada para nombre
- Mostrar avatares seleccionables
- Enviar formulario a /menu

**Elementos clave:**
- Formulario POST a `/menu`
- Input text para nombre (required)
- Botón submit estilizado
- Diseño centrado y atractivo

**4.3 Menú Principal (views/menu.ejs)**

**Responsabilidades:**
- Mostrar saludo personalizado con nombre de usuario
- Mostrar 3 opciones de juego como cards
- Proporcionar botón de salir

**Elementos clave:**
- Acceso a `nombreUsuario` desde locals
- Enlaces a `/continentes` (Estudiar Continentes)
- Enlaces placeholder para Trivia y Puzzle
- Enlace a `/salir`

**4.4 Selector de Continentes (views/continentes.ejs)**

**Responsabilidades:**
- Mostrar grid de 6 continentes
- Renderizar cada continente con su color distintivo
- Proporcionar navegación de vuelta

**Elementos clave:**
- Grid responsive (2 columnas en móvil, 3 en desktop)
- Iteración sobre array `continentes`
- Enlaces a `/continente/:id`
- Botón volver a `/menu`

**4.5 Vista de Continente (views/continente.ejs)**

**Responsabilidades:**
- Mostrar información detallada del continente
- Renderizar descripción, datos curiosos y países
- Proporcionar navegación de vuelta

**Elementos clave:**
- Título con emoji del continente
- Sección de descripción
- Card de "¿Sabías qué?" con fondo amarillo
- Pills/badges de países
- Botón volver a `/continentes`

#### 5. Partials Reutilizables

**5.1 Header (views/partials/header.ejs)**

**Responsabilidades:**
- Mostrar logo y título de la aplicación
- Mostrar nombre de usuario si está en sesión

**5.2 Footer (views/partials/footer.ejs)**

**Responsabilidades:**
- Mostrar información de copyright
- Mostrar créditos de la U.E.E. "Jacinto Silva"

**5.3 Botón (views/partials/boton.ejs)**

**Responsabilidades:**
- Componente reutilizable para botones consistentes
- Acepta parámetros: texto, color, url, emoji

```html
<!-- Uso: <%- include('partials/boton', { texto: 'Volver', color: 'turquesa', url: '/menu', emoji: '🔙' }) %> -->
<a href="<%= url %>" 
   class="inline-block px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 <%= color === 'naranja' ? 'bg-orange-500' : color === 'turquesa' ? 'bg-teal-400' : 'bg-red-400' %>">
  <%= emoji %> <%= texto %>
</a>
```

### Gestión de Sesión

**Estrategia:**
- Usar `express-session` con almacenamiento en memoria
- Almacenar solo `nombreUsuario` en sesión
- Middleware `verificarSesion` protege rutas que requieren autenticación
- Sesión se destruye al hacer logout o cerrar servidor

**Flujo de Sesión:**
```
1. Usuario ingresa nombre → POST /menu
2. Servidor crea req.session.nombreUsuario
3. Todas las rutas protegidas verifican sesión
4. res.locals.nombreUsuario disponible en todas las vistas
5. Usuario hace logout → GET /salir → req.session.destroy()
```

## Data Models

### Modelo de Continente

```javascript
{
  id: String,              // Identificador único (kebab-case)
  nombre: String,          // Nombre del continente
  emoji: String,           // Emoji representativo
  color: String,           // Color hex para UI
  descripcion: String,     // Descripción educativa (2-3 párrafos)
  datosCuriosos: String,   // Dato curioso para sección "¿Sabías qué?"
  paisesPrincipales: Array<String>  // Lista de 6 países principales
}
```

**Ejemplo completo:**
```javascript
{
  id: 'america',
  nombre: 'América',
  emoji: '🌎',
  color: '#ec4899',
  descripcion: 'América es el segundo continente más grande del mundo, dividido en América del Norte, Central y del Sur. Tiene una gran diversidad de climas, desde el frío ártico hasta las selvas tropicales. Es hogar de culturas milenarias como los mayas, aztecas e incas.',
  datosCuriosos: 'El río Amazonas, que atraviesa América del Sur, es el más caudaloso del mundo y su selva produce el 20% del oxígeno de la Tierra.',
  paisesPrincipales: ['Brasil', 'Estados Unidos', 'México', 'Argentina', 'Canadá', 'Venezuela']
}
```

### Modelo de Sesión

```javascript
{
  nombreUsuario: String    // Nombre ingresado por el usuario
}
```

### Datos Mock Completos

Los 6 continentes con sus datos completos:

1. **América** (id: 'america', color: #ec4899 rosa/fucsia)
2. **Europa** (id: 'europa', color: #3b82f6 azul)
3. **Asia** (id: 'asia', color: #fbbf24 amarillo)
4. **África** (id: 'africa', color: #10b981 verde)
5. **Oceanía** (id: 'oceania', color: #8b5cf6 morado)
6. **Antártida** (id: 'antartida', color: #6b7280 gris)

Cada continente incluye:
- Descripción educativa de 2-3 oraciones
- Un dato curioso interesante para niños
- Lista de 6 países principales (excepto Antártida que no tiene países)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navegación exitosa con nombre válido

*For any* nombre de usuario no vacío (que contenga al menos un carácter no-whitespace), cuando se envía el formulario de bienvenida, el sistema debe crear una sesión y navegar al menú principal.

**Validates: Requirements 1.5**

### Property 2: Saludo personalizado en menú

*For any* nombre de usuario almacenado en sesión, cuando se accede al menú principal, el HTML renderizado debe contener el texto "Hola, [nombre]!" donde [nombre] es exactamente el nombre del usuario.

**Validates: Requirements 2.1**

### Property 3: Preservación de sesión durante navegación

*For any* nombre de usuario y cualquier secuencia válida de navegación entre pantallas (menú → continentes → continente individual → continentes → menú), el nombre del usuario debe permanecer sin cambios en la sesión y estar disponible en todas las vistas renderizadas.

**Validates: Requirements 6.1, 6.3**

### Property 4: Navegación a vista de continente

*For any* continente válido del conjunto {america, europa, asia, africa, oceania, antartida}, cuando se selecciona ese continente desde el selector, el sistema debe navegar a la vista de continente correspondiente con el ID correcto.

**Validates: Requirements 3.4**

### Property 5: Vista de continente muestra todos los campos requeridos

*For any* continente válido, cuando se renderiza su vista individual, el HTML debe contener: (1) el nombre del continente, (2) el emoji correspondiente, (3) la descripción completa, (4) un dato curioso en la sección "¿Sabías qué?", y (5) todos los países principales listados.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 6: Botones tienen estilos consistentes

*For any* botón interactivo en el sistema (botones de navegación, submit, etc.), el elemento HTML debe incluir clases de Tailwind CSS para bordes redondeados (rounded-*) y sombras (shadow-*).

**Validates: Requirements 7.3**

### Property 7: Datos se pasan correctamente a templates

*For any* ruta que renderice una vista EJS, los datos necesarios para esa vista deben estar disponibles en el objeto locals o como parámetros del render, y deben ser accesibles en el template sin errores de referencia.

**Validates: Requirements 8.6**

## Error Handling

### Estrategia General

La aplicación implementa manejo de errores en múltiples capas para garantizar una experiencia de usuario robusta:

1. **Validación de Entrada:**
   - Nombres vacíos o solo whitespace son rechazados en el formulario de bienvenida
   - Redirección a pantalla de bienvenida si no hay nombre válido

2. **Protección de Rutas:**
   - Middleware `verificarSesion` protege todas las rutas que requieren autenticación
   - Usuarios sin sesión son redirigidos automáticamente a la pantalla de bienvenida

3. **Manejo de Datos Inexistentes:**
   - Si se solicita un continente con ID inválido, redirección al selector de continentes
   - Verificación de existencia de datos antes de renderizar vistas

4. **Errores del Servidor:**
   - Middleware de manejo de errores global en Express
   - Logging de errores en consola para debugging
   - Página de error genérica para errores 500

### Casos de Error Específicos

#### 1. Nombre de Usuario Inválido

**Escenario:** Usuario intenta acceder al menú sin ingresar nombre o con nombre vacío

**Manejo:**
```javascript
router.post('/menu', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    // Redireccionar a bienvenida sin crear sesión
    return res.redirect('/');
  }
  req.session.nombreUsuario = nombre.trim();
  res.redirect('/menu');
});
```

#### 2. Acceso sin Sesión

**Escenario:** Usuario intenta acceder a rutas protegidas sin sesión activa

**Manejo:**
```javascript
function verificarSesion(req, res, next) {
  if (!req.session.nombreUsuario) {
    return res.redirect('/');
  }
  res.locals.nombreUsuario = req.session.nombreUsuario;
  next();
}
```

#### 3. Continente No Encontrado

**Escenario:** Usuario intenta acceder a un continente con ID inválido

**Manejo:**
```javascript
router.get('/continente/:id', verificarSesion, (req, res) => {
  const continente = obtenerContinentePorId(req.params.id);
  if (!continente) {
    return res.redirect('/continentes');
  }
  res.render('continente', { continente });
});
```

#### 4. Errores de Renderizado

**Escenario:** Error al renderizar template EJS (variable undefined, sintaxis incorrecta)

**Manejo:**
```javascript
// Middleware de error global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', { 
    mensaje: 'Ocurrió un error. Por favor, intenta de nuevo.',
    layout: false 
  });
});
```

#### 5. Datos Mock Faltantes

**Escenario:** Datos de continente incompletos o mal formateados

**Manejo:**
- Validación de estructura de datos al inicio del servidor
- Valores por defecto para campos opcionales
- Logging de advertencias si faltan datos

```javascript
function validarDatosContinente(continente) {
  return continente.id && 
         continente.nombre && 
         continente.descripcion && 
         continente.datosCuriosos && 
         Array.isArray(continente.paisesPrincipales);
}

// Al iniciar servidor
const continentes = obtenerContinentes();
continentes.forEach(c => {
  if (!validarDatosContinente(c)) {
    console.warn(`Advertencia: Datos incompletos para continente ${c.id}`);
  }
});
```

### Mensajes de Error Amigables

Todos los mensajes de error deben ser:
- Escritos en español
- Apropiados para niños de primaria
- Positivos y alentadores
- Con emojis para mantener el tono amigable

Ejemplos:
- "¡Ups! 😅 Parece que algo salió mal. Intenta de nuevo."
- "¡Oops! 🤔 No encontramos ese continente. Volvamos al mapa."
- "¡Hola! 👋 Por favor ingresa tu nombre para comenzar."

## Testing Strategy

### Enfoque Dual de Testing

La estrategia de testing combina dos enfoques complementarios:

1. **Unit Tests:** Verifican ejemplos específicos, casos edge y condiciones de error
2. **Property-Based Tests:** Verifican propiedades universales a través de múltiples inputs generados

Ambos tipos de tests son necesarios para cobertura comprehensiva:
- Los unit tests capturan bugs concretos y casos específicos
- Los property tests verifican correctitud general a través de muchos inputs

### Configuración de Property-Based Testing

**Librería:** Para Node.js/JavaScript, usaremos **fast-check** (https://github.com/dubzzz/fast-check)

**Instalación:**
```bash
npm install --save-dev fast-check jest
```

**Configuración de Tests:**
- Cada property test debe ejecutar mínimo 100 iteraciones
- Cada test debe referenciar su propiedad del documento de diseño mediante comentario
- Formato de tag: `// Feature: mundo-kids-frontend, Property X: [texto de la propiedad]`

### Plan de Testing por Componente

#### 1. Testing de Rutas (routes/index.js)

**Unit Tests:**
- Verificar que GET / renderiza vista de bienvenida
- Verificar que POST /menu con nombre válido crea sesión
- Verificar que POST /menu con nombre vacío redirige a /
- Verificar que GET /menu sin sesión redirige a /
- Verificar que GET /continente/:id con ID inválido redirige a /continentes
- Verificar que GET /salir destruye sesión

**Property Tests:**
```javascript
// Feature: mundo-kids-frontend, Property 1: Navegación exitosa con nombre válido
test('cualquier nombre no vacío crea sesión y navega a menú', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => s.trim().length > 0),
      (nombre) => {
        // Simular POST /menu con nombre
        // Verificar que sesión se crea
        // Verificar redirección a /menu
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: mundo-kids-frontend, Property 2: Saludo personalizado en menú
test('menú muestra saludo personalizado con cualquier nombre', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => s.trim().length > 0),
      (nombre) => {
        // Crear sesión con nombre
        // Renderizar menú
        // Verificar que HTML contiene "Hola, [nombre]!"
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: mundo-kids-frontend, Property 3: Preservación de sesión durante navegación
test('nombre se preserva durante cualquier secuencia de navegación', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => s.trim().length > 0),
      fc.array(fc.constantFrom('/menu', '/continentes', '/continente/america'), { minLength: 2, maxLength: 5 }),
      (nombre, rutasNavegacion) => {
        // Crear sesión con nombre
        // Navegar por cada ruta en secuencia
        // Verificar que nombre permanece en sesión
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: mundo-kids-frontend, Property 4: Navegación a vista de continente
test('navegación funciona para cualquier continente válido', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('america', 'europa', 'asia', 'africa', 'oceania', 'antartida'),
      (continenteId) => {
        // Navegar a /continente/:id
        // Verificar que vista se renderiza correctamente
        // Verificar que no hay redirección
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: mundo-kids-frontend, Property 5: Vista de continente muestra todos los campos requeridos
test('vista de continente contiene todos los campos para cualquier continente', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('america', 'europa', 'asia', 'africa', 'oceania', 'antartida'),
      (continenteId) => {
        // Obtener datos del continente
        // Renderizar vista
        // Verificar presencia de: nombre, emoji, descripción, dato curioso, países
      }
    ),
    { numRuns: 100 }
  );
});
```

#### 2. Testing de Datos Mock (data/continentes.js)

**Unit Tests:**
- Verificar que obtenerContinentes() retorna array de 6 elementos
- Verificar que cada continente tiene todos los campos requeridos
- Verificar que obtenerContinentePorId('america') retorna continente correcto
- Verificar que obtenerContinentePorId('invalido') retorna undefined
- Verificar estructura de cada continente (América, Europa, Asia, África, Oceanía, Antártida)

**Property Tests:**
```javascript
// Feature: mundo-kids-frontend, Property 7: Datos se pasan correctamente a templates
test('datos de continente tienen estructura válida', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('america', 'europa', 'asia', 'africa', 'oceania', 'antartida'),
      (continenteId) => {
        const continente = obtenerContinentePorId(continenteId);
        // Verificar que continente no es null/undefined
        // Verificar que tiene todos los campos requeridos
        // Verificar tipos de datos correctos
        expect(continente).toBeDefined();
        expect(continente.id).toBe(continenteId);
        expect(typeof continente.nombre).toBe('string');
        expect(typeof continente.descripcion).toBe('string');
        expect(Array.isArray(continente.paisesPrincipales)).toBe(true);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### 3. Testing de Templates EJS

**Unit Tests:**
- Verificar que layout.ejs contiene estructura HTML básica
- Verificar que bienvenida.ejs contiene formulario con campos requeridos
- Verificar que menu.ejs contiene 3 opciones de juego
- Verificar que continentes.ejs renderiza grid de 6 continentes
- Verificar que continente.ejs muestra secciones requeridas

**Property Tests:**
```javascript
// Feature: mundo-kids-frontend, Property 6: Botones tienen estilos consistentes
test('todos los botones tienen clases rounded y shadow', () => {
  const templates = ['bienvenida.ejs', 'menu.ejs', 'continentes.ejs', 'continente.ejs'];
  
  templates.forEach(template => {
    // Leer contenido del template
    // Extraer todos los elementos <a> y <button>
    // Verificar que cada uno tiene clases rounded-* y shadow-*
  });
});
```

#### 4. Testing de Integración

**Escenarios de Integración:**
- Flujo completo: Bienvenida → Menú → Continentes → Vista Continente → Volver
- Flujo de logout: Menú → Salir → Bienvenida
- Flujo de error: Acceso directo a ruta protegida sin sesión
- Flujo de error: Acceso a continente inválido

### Herramientas de Testing

**Framework de Testing:** Jest
- Ampliamente usado en Node.js
- Soporte para mocking y assertions
- Integración con fast-check

**Testing de Templates:**
- Renderizar templates con datos de prueba
- Usar JSDOM para parsear HTML resultante
- Verificar presencia de elementos y contenido

**Mocking:**
- Mock de express request/response objects
- Mock de sesiones para testing de rutas
- Mock de datos para testing de templates

### Cobertura de Testing

**Objetivos de Cobertura:**
- Rutas: 100% (todas las rutas y middleware)
- Datos: 100% (funciones de acceso a datos)
- Templates: 80% (verificar elementos críticos)
- Integración: Flujos principales cubiertos

**Métricas:**
- Usar Jest coverage reporter
- Generar reportes HTML de cobertura
- CI/CD debe fallar si cobertura < 80%

### Ejecución de Tests

**Scripts en package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:properties": "jest --testNamePattern='Property'"
  }
}
```

**Comandos:**
- `npm test` - Ejecutar todos los tests
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run test:coverage` - Generar reporte de cobertura
- `npm run test:properties` - Ejecutar solo property-based tests

### Balance entre Unit Tests y Property Tests

**Cuándo usar Unit Tests:**
- Verificar ejemplos específicos (ej: "América debe tener color #ec4899")
- Verificar casos edge (ej: nombre vacío, ID inválido)
- Verificar condiciones de error específicas
- Verificar estructura de archivos y configuración

**Cuándo usar Property Tests:**
- Verificar comportamiento que debe funcionar para cualquier input válido
- Verificar preservación de invariantes (ej: sesión se mantiene)
- Verificar transformaciones (ej: cualquier nombre → saludo personalizado)
- Verificar que propiedades se cumplen para todos los continentes

**Evitar:**
- Demasiados unit tests que verifican lo mismo con diferentes valores
- Property tests para casos muy específicos que son mejor como unit tests
- Tests que verifican implementación en lugar de comportamiento

