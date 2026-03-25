# Mundo Kids - Plataforma Educativa de Geografía

Plataforma web educativa gamificada para enseñar geografía (banderas y continentes) a estudiantes de primaria de la U.E.E. "Jacinto Silva" en Valle Morín, Venezuela.

## Características

- ✨ Interfaz amigable y colorida para niños
- 🌍 Información educativa de 6 continentes
- 🗺️ **Mapa interactivo con Leaflet** - Visualiza los continentes con límites marcados
- 🎯 **Sistema de retos con preguntas** - 3 preguntas por continente (18 totales)
- 🎮 **Trivia de Banderas** - 10 preguntas sobre banderas de países
- 📊 **Sistema de niveles y puntos** - Progreso gamificado
- 👤 **Selección de género** - Avatares personalizados
- 📱 Diseño responsive
- 💾 Funciona completamente offline
- 🚀 Sin dependencias de internet (excepto CDN de Leaflet y Tailwind)

## Mapa Interactivo

La aplicación incluye un mapa mundial interactivo que permite:

- **Visualizar los 6 continentes** con sus límites geográficos marcados en colores distintivos
- **Etiquetas permanentes** con los nombres de cada continente
- **Interactividad**: Haz clic en cualquier continente del mapa para ver su información detallada
- **Efectos hover**: Los continentes se resaltan al pasar el mouse sobre ellos
- **Tooltips informativos**: Muestra el nombre del continente al pasar el mouse
- **Responsive**: Se adapta a diferentes tamaños de pantalla (móvil, tablet, desktop)

### Colores de los Continentes en el Mapa

- 🌎 **América**: Rosa/Fucsia (#ec4899)
- 🏰 **Europa**: Azul (#3b82f6)
- 🏯 **Asia**: Amarillo (#fbbf24)
- 🦁 **África**: Verde (#10b981)
- 🦘 **Oceanía**: Morado (#8b5cf6)
- 🐧 **Antártida**: Gris (#6b7280)

## Tecnologías

- **Backend:** Node.js + Express.js
- **Templates:** EJS + Express-EJS-Layouts
- **Estilos:** Tailwind CSS
- **Sesiones:** Express-Session

## Requisitos

- Node.js 14.x o superior
- npm 6.x o superior

## Instalación

1. Clonar o descargar el proyecto

2. Instalar dependencias:
```bash
npm install
```

## Ejecución

Iniciar el servidor:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Modo Desarrollo

Para desarrollo con reinicio automático:
```bash
npm run dev
```

## Testing

Ejecutar tests:
```bash
npm test
```

Ejecutar tests en modo watch:
```bash
npm run test:watch
```

Generar reporte de cobertura:
```bash
npm run test:coverage
```

## Estructura del Proyecto

```
mundo-kids-frontend/
├── server.js              # Servidor Express
├── package.json           # Dependencias
├── README.md             # Documentación
├── data/                 # Datos mock
│   ├── continentes.js    # Datos de continentes con preguntas
│   └── banderas.js       # Preguntas de trivia de banderas
├── routes/               # Rutas de la aplicación
│   └── index.js
├── public/               # Archivos estáticos
│   ├── css/
│   │   ├── estilos-globales.css
│   │   └── mapa-estilos.css
│   ├── images/
│   │   ├── avatar-nina.svg
│   │   ├── avatar-nino.svg
│   │   └── logo.svg
│   └── js/
│       └── mapa-continentes.js
└── views/                # Templates EJS
    ├── layout.ejs
    ├── partials/
    │   ├── header.ejs
    │   ├── footer.ejs
    │   └── boton.ejs
    ├── bienvenida.ejs
    ├── menu.ejs
    ├── continentes.ejs
    ├── continente.ejs
    ├── reto.ejs
    ├── resultado-reto.ejs
    ├── trivia-banderas.ejs
    ├── resultado-trivia.ejs
    └── error.ejs
```

## Uso

1. Acceder a `http://localhost:3000`
2. Ingresar tu nombre y seleccionar tu género en la pantalla de bienvenida
3. Explorar el menú principal con tu progreso (nivel, puntos, continentes visitados)
4. **Estudiar Continentes**: Navegar por el mapa interactivo y hacer retos de cada continente
5. **Trivia de Banderas**: Responder preguntas sobre banderas de diferentes países
6. Ganar puntos y subir de nivel completando retos

## Sistema de Puntos y Niveles

- **Retos de Continentes**: 10 puntos por respuesta correcta
- **Trivia de Banderas**: 15 puntos por respuesta correcta
- **Sistema de Niveles**: Cada 30 puntos = 1 nivel
- **Progreso**: Se guarda en sesión (nivel, puntos totales, continentes visitados, retos completados)

## Continentes Disponibles

- 🌎 América
- 🏰 Europa
- 🏯 Asia
- 🦁 África
- 🦘 Oceanía
- 🐧 Antártida

## Créditos

Desarrollado para la Unidad Educativa Estadal "Jacinto Silva"
Valle Morín, San Casimiro, Estado Aragua, Venezuela

## Licencia

MIT License - Uso educativo libre
