# Requirements Document

## Introduction

Mundo Kids es una plataforma web educativa gamificada diseñada para enseñar geografía (banderas y continentes) a estudiantes de primaria de la U.E.E. "Jacinto Silva" en Valle Morín, Venezuela. Esta especificación define los requisitos del frontend de la aplicación, que debe funcionar offline en equipos Canaima/Cebit con datos de prueba (mock data) y navegación completa entre pantallas.

## Glossary

- **Sistema**: La aplicación web frontend Mundo Kids
- **Usuario**: Estudiante de primaria que utiliza la plataforma
- **Pantalla_Bienvenida**: Interfaz inicial donde el usuario ingresa su nombre
- **Menu_Principal**: Interfaz que muestra las opciones de juego disponibles
- **Selector_Continentes**: Interfaz que muestra los 6 continentes disponibles
- **Vista_Continente**: Interfaz que muestra información detallada de un continente específico
- **Datos_Mock**: Datos de prueba estáticos incluidos en el frontend
- **Navegacion**: Sistema de transición entre pantallas de la aplicación
- **Componente_Reutilizable**: Partial de EJS que se puede usar en múltiples vistas

## Requirements

### Requirement 1: Pantalla de Bienvenida

**User Story:** Como estudiante, quiero ingresar mi nombre en una pantalla de bienvenida atractiva, para que la aplicación me reconozca y personalice mi experiencia.

#### Acceptance Criteria

1. THE Pantalla_Bienvenida SHALL display el logo "Mundo Kids" con ícono de globo terráqueo
2. THE Pantalla_Bienvenida SHALL display el slogan "¡Explora el mundo jugando!"
3. THE Pantalla_Bienvenida SHALL display dos avatares seleccionables (niño y niña)
4. THE Pantalla_Bienvenida SHALL provide un campo de entrada de texto para el nombre del usuario
5. WHEN el usuario ingresa un nombre y presiona el botón "¡ENTRAR!", THE Sistema SHALL navegar al Menu_Principal
6. THE Pantalla_Bienvenida SHALL use fondo azul oscuro (#1e3a5f)
7. THE Pantalla_Bienvenida SHALL use botón naranja (#ff9f43) para "¡ENTRAR!"

### Requirement 2: Menú Principal

**User Story:** Como estudiante, quiero ver un menú principal con opciones de juego claras, para que pueda elegir qué actividad realizar.

#### Acceptance Criteria

1. WHEN el usuario accede al Menu_Principal, THE Sistema SHALL display un saludo personalizado "Hola, [Nombre]! 👋"
2. THE Menu_Principal SHALL display la pregunta "¿Qué aventura eliges hoy?"
3. THE Menu_Principal SHALL display tres opciones de juego: "📚 Estudiar Continentes", "🎮 Trivia de Banderas", "🧩 Puzzle Sudamérica"
4. THE Menu_Principal SHALL display un botón "Salir" de color coral/rojo (#ff6b6b)
5. WHEN el usuario selecciona "📚 Estudiar Continentes", THE Sistema SHALL navegar al Selector_Continentes
6. THE Menu_Principal SHALL use colores distintivos para cada opción: verde/turquesa para Estudiar, naranja para Trivia, morado para Puzzle
7. WHEN el usuario presiona "Salir", THE Sistema SHALL navegar a la Pantalla_Bienvenida

### Requirement 3: Selector de Continentes

**User Story:** Como estudiante, quiero ver los 6 continentes en un grid visual, para que pueda seleccionar cuál quiero estudiar.

#### Acceptance Criteria

1. THE Selector_Continentes SHALL display el título "📖 Elige un Continente"
2. THE Selector_Continentes SHALL display un grid con los 6 continentes: América, Europa, Asia, África, Oceanía, Antártida
3. THE Selector_Continentes SHALL use colores distintivos para cada continente: rosa/fucsia para América, azul para Europa, amarillo para Asia, verde para África, morado para Oceanía, gris para Antártida
4. WHEN el usuario selecciona un continente, THE Sistema SHALL navegar a la Vista_Continente correspondiente
5. THE Selector_Continentes SHALL display un botón "🔙 Volver" de color turquesa (#4ecdc4)
6. WHEN el usuario presiona "🔙 Volver", THE Sistema SHALL navegar al Menu_Principal

### Requirement 4: Vista de Continente

**User Story:** Como estudiante, quiero ver información educativa sobre un continente específico, para que pueda aprender sobre su geografía y características.

#### Acceptance Criteria

1. WHEN el usuario accede a una Vista_Continente, THE Sistema SHALL display el nombre del continente con emoji correspondiente
2. THE Vista_Continente SHALL display una descripción educativa del continente usando Datos_Mock
3. THE Vista_Continente SHALL display una sección "💡 ¿Sabías qué?" con un dato curioso sobre fondo amarillo claro
4. THE Vista_Continente SHALL display una sección "📍 Países Principales:" con pills/badges de países
5. THE Vista_Continente SHALL display un botón "🔙 Volver al Mapa" de color naranja (#ff9f43)
6. WHEN el usuario presiona "🔙 Volver al Mapa", THE Sistema SHALL navegar al Selector_Continentes
7. THE Vista_Continente SHALL load información desde Datos_Mock para los 6 continentes

### Requirement 5: Datos Mock de Continentes

**User Story:** Como desarrollador, quiero tener datos de prueba para los 6 continentes, para que el frontend sea completamente navegable sin backend.

#### Acceptance Criteria

1. THE Sistema SHALL include Datos_Mock para América con descripción, dato curioso y lista de países principales
2. THE Sistema SHALL include Datos_Mock para Europa con descripción, dato curioso y lista de países principales
3. THE Sistema SHALL include Datos_Mock para Asia con descripción, dato curioso y lista de países principales
4. THE Sistema SHALL include Datos_Mock para África con descripción, dato curioso y lista de países principales
5. THE Sistema SHALL include Datos_Mock para Oceanía con descripción, dato curioso y lista de países principales
6. THE Sistema SHALL include Datos_Mock para Antártida con descripción, dato curioso y lista de países principales
7. THE Datos_Mock SHALL be estructurados en formato JSON o JavaScript object para fácil integración futura con backend

### Requirement 6: Sistema de Navegación

**User Story:** Como estudiante, quiero navegar fácilmente entre las diferentes pantallas, para que pueda explorar la aplicación sin confundirme.

#### Acceptance Criteria

1. THE Navegacion SHALL maintain el nombre del usuario durante toda la sesión
2. THE Navegacion SHALL allow transiciones entre Pantalla_Bienvenida, Menu_Principal, Selector_Continentes y Vista_Continente
3. WHEN el usuario navega entre pantallas, THE Sistema SHALL preserve el estado de la sesión
4. THE Navegacion SHALL use rutas de Express.js para cada pantalla
5. THE Navegacion SHALL implement botones "Volver" en todas las pantallas excepto Pantalla_Bienvenida

### Requirement 7: Diseño Visual y Estilos

**User Story:** Como estudiante, quiero una interfaz colorida y amigable, para que me sienta motivado a usar la aplicación.

#### Acceptance Criteria

1. THE Sistema SHALL use Tailwind CSS para todos los estilos
2. THE Sistema SHALL use tipografía grande y legible apropiada para niños de primaria
3. THE Sistema SHALL use botones redondeados con sombras para todos los elementos interactivos
4. THE Sistema SHALL use emojis en títulos y botones para hacer la interfaz más atractiva
5. THE Sistema SHALL use diseño tipo "card" centrado con sombras para contenedores principales
6. THE Sistema SHALL use la paleta de colores definida: azul oscuro (#1e3a5f) para fondo, naranja (#ff9f43) para botones primarios, turquesa (#4ecdc4) para botones secundarios, coral (#ff6b6b) para salir
7. THE Sistema SHALL implement diseño responsive que funcione en laptops Canaima

### Requirement 8: Arquitectura de Templates EJS

**User Story:** Como desarrollador, quiero una estructura de templates EJS bien organizada, para que el código sea mantenible y reutilizable.

#### Acceptance Criteria

1. THE Sistema SHALL use EJS como template engine
2. THE Sistema SHALL use EJS-Layout para layout principal
3. THE Sistema SHALL implement un layout base que incluya head, header y footer comunes
4. THE Sistema SHALL create partials reutilizables para componentes comunes: botones, cards, headers
5. THE Sistema SHALL organize templates en directorio views con subdirectorios por sección
6. THE Sistema SHALL pass datos desde rutas de Express a templates EJS usando locals

### Requirement 9: Funcionalidad Offline

**User Story:** Como estudiante en zona rural, quiero que la aplicación funcione sin conexión a internet, para que pueda usarla incluso cuando no haya conectividad.

#### Acceptance Criteria

1. THE Sistema SHALL include todos los assets (CSS, imágenes, datos) como archivos locales
2. THE Sistema SHALL NOT require conexión a internet para funcionar
3. THE Sistema SHALL use Tailwind CSS mediante CDN o archivo local
4. THE Sistema SHALL load todos los Datos_Mock desde archivos locales o variables en memoria
5. THE Sistema SHALL be ejecutable mediante servidor Express local (localhost)

### Requirement 10: Compatibilidad con Equipos Canaima

**User Story:** Como institución educativa, queremos que la aplicación funcione en nuestros equipos Canaima existentes, para que no tengamos que invertir en nuevo hardware.

#### Acceptance Criteria

1. THE Sistema SHALL be compatible con navegadores disponibles en equipos Canaima (Firefox, Chromium)
2. THE Sistema SHALL use tecnologías web estándar soportadas por navegadores modernos
3. THE Sistema SHALL optimize rendimiento para hardware de especificaciones modestas
4. THE Sistema SHALL NOT use librerías pesadas o frameworks frontend complejos
5. THE Sistema SHALL use Node.js y Express.js como servidor backend mínimo

### Requirement 11: Estructura del Proyecto

**User Story:** Como desarrollador, quiero una estructura de proyecto clara y organizada, para que sea fácil mantener y extender el código.

#### Acceptance Criteria

1. THE Sistema SHALL organize código en directorios: views/, public/, routes/, data/
2. THE Sistema SHALL include archivo package.json con dependencias: express, ejs, ejs-layout
3. THE Sistema SHALL include archivo server.js o app.js como punto de entrada
4. THE Sistema SHALL include archivo README.md con instrucciones de instalación y ejecución
5. THE Sistema SHALL include directorio data/ con archivos de Datos_Mock
6. THE Sistema SHALL include directorio public/ con subdirectorios: css/, images/, js/
7. THE Sistema SHALL use convenciones de nombres consistentes en español para archivos y variables
