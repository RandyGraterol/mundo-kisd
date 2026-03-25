# Plan de Implementación: Mundo Kids Frontend

## Descripción General

Este plan implementa una aplicación web educativa gamificada para enseñar geografía a estudiantes de primaria en Venezuela. La aplicación funciona completamente offline usando Express.js, EJS templates y Tailwind CSS, con datos mock para 6 continentes y navegación completa entre 4 pantallas principales.

## Tareas

- [x] 1. Configurar estructura inicial del proyecto
  - Crear directorio raíz `mundo-kids-frontend/`
  - Crear archivo `package.json` con dependencias: express, ejs, express-ejs-layouts, express-session
  - Crear estructura de directorios: `data/`, `routes/`, `public/css/`, `public/images/`, `public/js/`, `views/`, `views/partials/`
  - Crear archivo `README.md` con instrucciones de instalación y ejecución
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.6_

- [x] 2. Implementar capa de datos mock
  - [x] 2.1 Crear archivo `data/continentes.js` con datos de los 6 continentes
    - Implementar array de continentes con estructura completa (id, nombre, emoji, color, descripcion, datosCuriosos, paisesPrincipales)
    - Incluir datos para: América, Europa, Asia, África, Oceanía, Antártida
    - Implementar función `obtenerContinentes()` que retorna todos los continentes
    - Implementar función `obtenerContinentePorId(id)` que retorna un continente específico
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.5_

  - [ ]* 2.2 Escribir property test para estructura de datos
    - **Property 7: Datos se pasan correctamente a templates**
    - **Valida: Requisitos 8.6**
    - Verificar que cada continente tiene todos los campos requeridos con tipos correctos

- [x] 3. Implementar servidor Express básico
  - [x] 3.1 Crear archivo `server.js` con configuración del servidor
    - Inicializar aplicación Express
    - Configurar middleware: express.urlencoded, express.static, express-session
    - Configurar EJS como view engine con express-ejs-layouts
    - Montar rutas desde `routes/index.js`
    - Iniciar servidor en puerto 3000
    - _Requisitos: 11.3, 10.5_

  - [ ]* 3.2 Escribir unit tests para configuración del servidor
    - Verificar que servidor inicia correctamente
    - Verificar que middleware está configurado
    - Verificar que view engine es EJS

- [x] 4. Implementar sistema de rutas y middleware
  - [x] 4.1 Crear archivo `routes/index.js` con todas las rutas
    - Implementar middleware `verificarSesion` para proteger rutas
    - Implementar ruta GET `/` para pantalla de bienvenida
    - Implementar ruta POST `/menu` para crear sesión con nombre de usuario
    - Implementar ruta GET `/menu` para menú principal (protegida)
    - Implementar ruta GET `/continentes` para selector de continentes (protegida)
    - Implementar ruta GET `/continente/:id` para vista de continente (protegida)
    - Implementar ruta GET `/salir` para destruir sesión
    - _Requisitos: 1.5, 2.7, 3.4, 3.6, 4.6, 6.2, 6.4_

  - [ ]* 4.2 Escribir property test para navegación con nombre válido
    - **Property 1: Navegación exitosa con nombre válido**
    - **Valida: Requisitos 1.5**
    - Verificar que cualquier nombre no vacío crea sesión y navega a menú

  - [ ]* 4.3 Escribir property test para preservación de sesión
    - **Property 3: Preservación de sesión durante navegación**
    - **Valida: Requisitos 6.1, 6.3**
    - Verificar que nombre se preserva durante cualquier secuencia de navegación

  - [ ]* 4.4 Escribir unit tests para manejo de errores en rutas
    - Verificar que POST /menu con nombre vacío redirige a /
    - Verificar que rutas protegidas sin sesión redirigen a /
    - Verificar que GET /continente/:id con ID inválido redirige a /continentes

- [x] 5. Checkpoint - Verificar servidor y rutas
  - Asegurarse de que el servidor inicia sin errores
  - Verificar que todas las rutas están definidas correctamente
  - Preguntar al usuario si hay dudas o problemas

- [x] 6. Crear layout base y estructura de templates
  - [x] 6.1 Crear archivo `views/layout.ejs` con estructura HTML base
    - Implementar estructura HTML5 con meta tags
    - Incluir Tailwind CSS via CDN
    - Definir estilos personalizados (fuente Comic Sans MS)
    - Definir área de contenido dinámico con `<%- body %>`
    - Aplicar fondo degradado azul oscuro
    - _Requisitos: 7.1, 7.6, 8.1, 8.2, 8.3_

  - [x] 6.2 Crear partials reutilizables
    - Crear `views/partials/header.ejs` con logo y título
    - Crear `views/partials/footer.ejs` con copyright y créditos
    - Crear `views/partials/boton.ejs` como componente de botón reutilizable
    - _Requisitos: 8.4_

- [x] 7. Implementar vista de bienvenida
  - [x] 7.1 Crear archivo `views/bienvenida.ejs`
    - Implementar formulario POST a `/menu` con campo de nombre (required)
    - Mostrar logo "Mundo Kids" con ícono de globo terráqueo
    - Mostrar slogan "¡Explora el mundo jugando!"
    - Mostrar dos avatares seleccionables (niño y niña)
    - Implementar botón "¡ENTRAR!" con color naranja (#ff9f43)
    - Aplicar diseño centrado tipo card con sombras
    - Usar layout: false para esta vista
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.3, 7.4, 7.5_

  - [ ]* 7.2 Escribir unit tests para vista de bienvenida
    - Verificar que formulario tiene campo de nombre requerido
    - Verificar que botón tiene color naranja
    - Verificar presencia de logo y slogan

- [x] 8. Implementar vista de menú principal
  - [x] 8.1 Crear archivo `views/menu.ejs`
    - Mostrar saludo personalizado "Hola, [Nombre]! 👋" usando nombreUsuario de locals
    - Mostrar pregunta "¿Qué aventura eliges hoy?"
    - Implementar 3 opciones de juego como cards: "📚 Estudiar Continentes" (verde/turquesa), "🎮 Trivia de Banderas" (naranja), "🧩 Puzzle Sudamérica" (morado)
    - Enlazar "Estudiar Continentes" a `/continentes`
    - Implementar botón "Salir" con color coral/rojo (#ff6b6b) enlazado a `/salir`
    - Aplicar diseño tipo card con sombras
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 7.3, 7.4, 7.5_

  - [ ]* 8.2 Escribir property test para saludo personalizado
    - **Property 2: Saludo personalizado en menú**
    - **Valida: Requisitos 2.1**
    - Verificar que HTML contiene "Hola, [nombre]!" para cualquier nombre

  - [ ]* 8.3 Escribir unit tests para vista de menú
    - Verificar que se muestran 3 opciones de juego
    - Verificar que botón "Salir" tiene color coral/rojo
    - Verificar que enlace a continentes funciona

- [x] 9. Implementar vista de selector de continentes
  - [x] 9.1 Crear archivo `views/continentes.ejs`
    - Mostrar título "📖 Elige un Continente"
    - Implementar grid responsive (2 columnas móvil, 3 desktop) con los 6 continentes
    - Iterar sobre array `continentes` pasado desde ruta
    - Renderizar cada continente como card con su color distintivo, emoji y nombre
    - Enlazar cada continente a `/continente/:id`
    - Implementar botón "🔙 Volver" con color turquesa (#4ecdc4) enlazado a `/menu`
    - Aplicar diseño tipo card con sombras
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.3, 7.4, 7.5_

  - [ ]* 9.2 Escribir property test para navegación a continente
    - **Property 4: Navegación a vista de continente**
    - **Valida: Requisitos 3.4**
    - Verificar que navegación funciona para cualquier continente válido

  - [ ]* 9.3 Escribir unit tests para vista de continentes
    - Verificar que grid muestra 6 continentes
    - Verificar que cada continente tiene su color distintivo
    - Verificar que botón "Volver" tiene color turquesa

- [x] 10. Implementar vista de continente individual
  - [x] 10.1 Crear archivo `views/continente.ejs`
    - Mostrar título con nombre del continente y emoji correspondiente
    - Mostrar descripción educativa del continente
    - Implementar sección "💡 ¿Sabías qué?" con fondo amarillo claro mostrando dato curioso
    - Implementar sección "📍 Países Principales:" con pills/badges de países
    - Implementar botón "🔙 Volver al Mapa" con color naranja (#ff9f43) enlazado a `/continentes`
    - Aplicar diseño tipo card con sombras
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 7.3, 7.4, 7.5_

  - [ ]* 10.2 Escribir property test para campos requeridos en vista
    - **Property 5: Vista de continente muestra todos los campos requeridos**
    - **Valida: Requisitos 4.1, 4.2, 4.3, 4.4**
    - Verificar que vista contiene nombre, emoji, descripción, dato curioso y países para cualquier continente

  - [ ]* 10.3 Escribir unit tests para vista de continente
    - Verificar que sección "¿Sabías qué?" tiene fondo amarillo
    - Verificar que países se muestran como pills/badges
    - Verificar que botón "Volver" tiene color naranja

- [x] 11. Checkpoint - Verificar todas las vistas
  - Asegurarse de que todas las vistas se renderizan correctamente
  - Verificar navegación completa entre pantallas
  - Preguntar al usuario si hay dudas o problemas

- [x] 12. Refinamiento de estilos y diseño responsive
  - [x] 12.1 Aplicar estilos finales con Tailwind CSS
    - Verificar que todos los botones tienen bordes redondeados y sombras
    - Verificar que tipografía es grande y legible
    - Verificar que paleta de colores es consistente en toda la aplicación
    - Optimizar diseño responsive para laptops Canaima
    - Agregar transiciones y efectos hover a elementos interactivos
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 10.1, 10.2_

  - [ ]* 12.2 Escribir property test para estilos de botones
    - **Property 6: Botones tienen estilos consistentes**
    - **Valida: Requisitos 7.3**
    - Verificar que todos los botones tienen clases rounded-* y shadow-*

- [x] 13. Agregar manejo de errores y middleware global
  - [x] 13.1 Implementar middleware de manejo de errores en `server.js`
    - Agregar middleware de error global para capturar errores 500
    - Crear vista `views/error.ejs` para mostrar errores amigables
    - Agregar logging de errores en consola
    - Implementar validación de datos mock al inicio del servidor
    - _Requisitos: 6.2, 9.1, 9.2, 9.4_

  - [ ]* 13.2 Escribir unit tests para manejo de errores
    - Verificar que errores 500 muestran página de error
    - Verificar que datos mock se validan al inicio
    - Verificar que mensajes de error son amigables

- [x] 14. Agregar assets estáticos (imágenes y recursos)
  - Crear o agregar logo "Mundo Kids" en `public/images/logo.png`
  - Crear o agregar avatar de niño en `public/images/avatar-nino.png`
  - Crear o agregar avatar de niña en `public/images/avatar-nina.png`
  - Verificar que todos los assets se cargan correctamente desde rutas estáticas
  - _Requisitos: 9.1, 9.3_

- [x] 15. Integración final y testing end-to-end
  - [x] 15.1 Verificar flujo completo de la aplicación
    - Probar flujo: Bienvenida → Menú → Continentes → Vista Continente → Volver
    - Probar flujo de logout: Menú → Salir → Bienvenida
    - Probar flujo de error: Acceso directo a ruta protegida sin sesión
    - Probar flujo de error: Acceso a continente inválido
    - Verificar que aplicación funciona completamente offline
    - _Requisitos: 6.1, 6.2, 6.3, 9.1, 9.2, 9.5_

  - [ ]* 15.2 Escribir tests de integración
    - Test de flujo completo de navegación
    - Test de flujo de logout
    - Test de manejo de errores de sesión
    - Test de funcionalidad offline

- [x] 16. Checkpoint final - Verificar todos los tests
  - Ejecutar todos los tests (unit y property-based)
  - Verificar cobertura de tests (objetivo: >80%)
  - Asegurarse de que no hay errores ni warnings
  - Preguntar al usuario si hay dudas o si está listo para desplegar

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental del progreso
- Los property tests validan propiedades de correctitud universales usando fast-check
- Los unit tests validan ejemplos específicos y casos edge
- La aplicación debe funcionar completamente offline sin conexión a internet
- Todos los datos son mock y están incluidos en el código fuente
