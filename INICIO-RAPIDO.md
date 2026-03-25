# 🚀 Inicio Rápido - Mundo Kids

## Pasos para Ejecutar la Aplicación

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor
```bash
npm start
```

### 3. Abrir en el Navegador
```
http://localhost:3000
```

## ¡Eso es Todo! 🎉

La aplicación estará corriendo y lista para usar.

## Flujo de Uso

1. **Ingresa tu nombre** en la pantalla de bienvenida
2. **Haz clic en "¡ENTRAR!"**
3. **Selecciona "Estudiar Continentes"**
4. **Explora el mapa interactivo** o usa los botones de selección rápida
5. **Haz clic en cualquier continente** para ver su información
6. **Aprende sobre geografía** de forma divertida

## Características Principales

- 🌍 Mapa mundial interactivo con Leaflet
- 📚 Información educativa de 6 continentes
- 🎨 Diseño colorido y amigable para niños
- 📱 Responsive (funciona en móvil, tablet y desktop)
- 💾 Funciona offline (sin necesidad de internet)

## Requisitos del Sistema

- Node.js 14.x o superior
- npm 6.x o superior
- Navegador moderno (Chrome, Firefox, Edge)

## Puertos

- **Servidor:** Puerto 3000 (configurable en `server.js`)

## Solución de Problemas

### El servidor no inicia
```bash
# Verificar que el puerto 3000 no esté en uso
# En Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Cambiar el puerto en server.js si es necesario
```

### Error al instalar dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar
npm install
```

### La página no carga
- Verificar que el servidor esté corriendo
- Verificar la URL: `http://localhost:3000`
- Revisar la consola del navegador (F12)

## Documentación Completa

Para más información, consulta:
- **README.md** - Documentación principal
- **TESTING.md** - Guía de pruebas
- **PROYECTO-COMPLETO.md** - Resumen ejecutivo

## Contacto y Soporte

Este proyecto fue desarrollado para la U.E.E. "Jacinto Silva" en Valle Morín, Venezuela.

---

**¡Disfruta explorando el mundo con Mundo Kids!** 🌍✨
