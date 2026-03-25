# Guía de Pruebas Manuales - Mundo Kids

Este documento describe los flujos de prueba para verificar que la aplicación funciona correctamente.

## Requisitos Previos

1. Instalar dependencias: `npm install`
2. Iniciar servidor: `npm start`
3. Abrir navegador en: `http://localhost:3000`

## Flujo 1: Navegación Completa (Happy Path)

### Pasos:
1. **Pantalla de Bienvenida**
   - ✅ Verificar que se muestra el logo "Mundo Kids"
   - ✅ Verificar que se muestra el slogan "¡Explora el mundo jugando!"
   - ✅ Verificar que se muestran dos avatares (niño y niña)
   - ✅ Ingresar un nombre (ej: "Daniel")
   - ✅ Hacer clic en "¡ENTRAR!"

2. **Menú Principal**
   - ✅ Verificar que se muestra "¡Hola, Daniel! 👋"
   - ✅ Verificar que se muestra "¿Qué aventura eliges hoy?"
   - ✅ Verificar que hay 3 opciones: Estudiar Continentes, Trivia de Banderas, Puzzle Sudamérica
   - ✅ Verificar que hay un botón "Salir"
   - ✅ Hacer clic en "📚 Estudiar Continentes"

3. **Selector de Continentes**
   - ✅ Verificar que se muestra el título "🌍 Explora los Continentes"
   - ✅ Verificar que se muestra el mapa interactivo con Leaflet
   - ✅ Verificar que se muestran 6 continentes en el mapa con colores distintivos
   - ✅ Verificar que hay etiquetas con nombres de continentes en el mapa
   - ✅ Verificar que hay botones de selección rápida a la derecha
   - ✅ Hacer hover sobre un continente en el mapa (debe resaltarse)
   - ✅ Hacer clic en "América" (desde el mapa o botón)

4. **Vista de Continente (América)**
   - ✅ Verificar que se muestra el emoji 🌎
   - ✅ Verificar que se muestra el título "América" en color rosa
   - ✅ Verificar que se muestra la descripción educativa
   - ✅ Verificar que se muestra la sección "💡 ¿Sabías qué?" con fondo amarillo
   - ✅ Verificar que se muestran los países principales como pills/badges
   - ✅ Verificar que hay un botón "🔙 Volver al Mapa"
   - ✅ Hacer clic en "🔙 Volver al Mapa"

5. **Volver al Selector**
   - ✅ Verificar que regresa al selector de continentes
   - ✅ Hacer clic en "🔙 Volver al Menú"

6. **Volver al Menú**
   - ✅ Verificar que regresa al menú principal
   - ✅ Verificar que el nombre del usuario sigue siendo "Daniel"

## Flujo 2: Logout

### Pasos:
1. Desde el Menú Principal
2. ✅ Hacer clic en "🚪 Salir"
3. ✅ Verificar que regresa a la pantalla de bienvenida
4. ✅ Verificar que la sesión se destruyó (no hay nombre guardado)

## Flujo 3: Acceso sin Sesión (Error Handling)

### Pasos:
1. Cerrar sesión o abrir navegador en modo incógnito
2. ✅ Intentar acceder directamente a: `http://localhost:3000/menu`
3. ✅ Verificar que redirige automáticamente a la pantalla de bienvenida
4. ✅ Intentar acceder directamente a: `http://localhost:3000/continentes`
5. ✅ Verificar que redirige automáticamente a la pantalla de bienvenida

## Flujo 4: Continente Inválido (Error Handling)

### Pasos:
1. Iniciar sesión normalmente
2. ✅ Intentar acceder a: `http://localhost:3000/continente/invalido`
3. ✅ Verificar que redirige al selector de continentes
4. ✅ Verificar que no se muestra error al usuario

## Flujo 5: Nombre Vacío (Validación)

### Pasos:
1. En la pantalla de bienvenida
2. ✅ Dejar el campo de nombre vacío
3. ✅ Intentar hacer clic en "¡ENTRAR!"
4. ✅ Verificar que el navegador muestra validación HTML5 (campo requerido)
5. ✅ Ingresar solo espacios en blanco
6. ✅ Hacer clic en "¡ENTRAR!"
7. ✅ Verificar que redirige de vuelta a la pantalla de bienvenida

## Flujo 6: Navegación por Todos los Continentes

### Pasos:
1. Desde el selector de continentes
2. ✅ Visitar cada continente uno por uno:
   - América (rosa) - Debe mostrar 6 países
   - Europa (azul) - Debe mostrar 6 países
   - Asia (amarillo) - Debe mostrar 6 países
   - África (verde) - Debe mostrar 6 países
   - Oceanía (morado) - Debe mostrar 14 países
   - Antártida (gris) - Debe mostrar mensaje de "no tiene países"
3. ✅ Verificar que cada continente tiene:
   - Emoji único
   - Color distintivo
   - Descripción educativa
   - Dato curioso con fondo amarillo
   - Lista de países (excepto Antártida)

## Flujo 7: Interactividad del Mapa

### Pasos:
1. En el selector de continentes
2. ✅ Hacer hover sobre cada continente en el mapa
3. ✅ Verificar que el continente se resalta (opacidad aumenta)
4. ✅ Verificar que aparece tooltip con el nombre
5. ✅ Hacer clic en diferentes continentes desde el mapa
6. ✅ Verificar que navega correctamente a cada vista

## Flujo 8: Responsive Design

### Pasos:
1. ✅ Abrir DevTools (F12)
2. ✅ Cambiar a vista móvil (375x667 - iPhone SE)
3. ✅ Navegar por todas las pantallas
4. ✅ Verificar que el diseño se adapta correctamente
5. ✅ Cambiar a vista tablet (768x1024 - iPad)
6. ✅ Verificar que el diseño se adapta correctamente
7. ✅ Cambiar a vista desktop (1920x1080)
8. ✅ Verificar que el diseño se ve bien

## Flujo 9: Funcionalidad Offline

### Pasos:
1. ✅ Abrir DevTools → Network
2. ✅ Activar "Offline" mode
3. ✅ Recargar la página
4. ✅ Verificar que la aplicación sigue funcionando
5. ✅ Navegar por todas las pantallas
6. ✅ Verificar que los datos mock se cargan correctamente

**Nota:** Los CDN de Tailwind y Leaflet requieren conexión. Para funcionalidad 100% offline, se deben descargar localmente.

## Checklist de Verificación Visual

### Colores
- ✅ Fondo: Degradado azul oscuro
- ✅ Botón primario: Naranja (#ff9f43)
- ✅ Botón secundario: Turquesa (#4ecdc4)
- ✅ Botón salir: Coral/Rojo (#ff6b6b)
- ✅ Continentes con colores correctos

### Tipografía
- ✅ Fuente: Comic Sans MS o similar
- ✅ Tamaños grandes y legibles
- ✅ Emojis visibles y bien posicionados

### Interactividad
- ✅ Todos los botones tienen efecto hover
- ✅ Todos los botones tienen sombras
- ✅ Todos los botones son redondeados
- ✅ Transiciones suaves

### Accesibilidad
- ✅ Contraste de colores adecuado
- ✅ Textos legibles
- ✅ Botones con tamaño mínimo de 44x44px
- ✅ Focus visible en elementos interactivos

## Resultados Esperados

Todos los flujos deben completarse sin errores. Si encuentras algún problema:

1. Verificar la consola del navegador (F12 → Console)
2. Verificar la consola del servidor (terminal donde corre `npm start`)
3. Revisar los logs de errores
4. Reportar el problema con pasos para reproducirlo

## Notas Adicionales

- La aplicación está optimizada para navegadores modernos (Chrome, Firefox, Edge)
- Compatible con equipos Canaima (Firefox, Chromium)
- Diseñada para niños de primaria (interfaz simple e intuitiva)
