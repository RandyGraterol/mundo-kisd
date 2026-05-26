// Sopa de Letras - Lógica del lado cliente
// Maneja la selección de letras y comunicación con el servidor

document.addEventListener('DOMContentLoaded', function() {
  const celdas = document.querySelectorAll('.sopa-celda');
  let seleccionActual = [];
  let seleccionando = false;

  celdas.forEach(celda => {
    // Click para seleccionar/deseleccionar
    celda.addEventListener('click', function() {
      const estaSeleccionada = this.classList.contains('bg-teal-200');
      
      if (estaSeleccionada) {
        // Deseleccionar
        this.classList.remove('bg-teal-200', 'border-teal-400');
        this.classList.add('bg-white', 'border-slate-200');
        const index = seleccionActual.indexOf(this);
        if (index > -1) seleccionActual.splice(index, 1);
      } else {
        // Seleccionar
        this.classList.remove('bg-white', 'border-slate-200');
        this.classList.add('bg-teal-200', 'border-teal-400');
        seleccionActual.push(this);
      }
    });

    // Hover para previsualizar
    celda.addEventListener('mouseenter', function() {
      if (seleccionando && !this.classList.contains('bg-teal-200')) {
        this.classList.add('bg-teal-100');
        this.classList.add('border-teal-300');
      }
    });

    celda.addEventListener('mouseleave', function() {
      if (seleccionando && !this.classList.contains('bg-teal-200')) {
        this.classList.remove('bg-teal-100');
        this.classList.remove('border-teal-300');
      }
    });
  });

  // Evento de tecla Enter para verificar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && seleccionActual.length > 0) {
      verificarPalabraSeleccionada();
    }
  });

  // Exponer función globalmente
  window.verificarPalabraSeleccionada = function() {
    if (seleccionActual.length === 0) {
      mostrarMensaje('Selecciona letras primero', 'bg-yellow-50 text-yellow-700 border-yellow-200');
      return;
    }

    // Construir palabra a partir de letras seleccionadas
    let palabra = '';
    seleccionActual.forEach(celda => {
      palabra += celda.dataset.letra;
    });

    // Enviar al servidor
    fetch('/sopa-letras/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palabra: palabra })
    })
    .then(res => res.json())
    .then(data => {
      if (data.correcta) {
        // Marcar palabra como encontrada
        marcarPalabraEncontrada(palabra);
        // Marcar celdas como encontradas (verde)
        seleccionActual.forEach(celda => {
          celda.classList.remove('bg-teal-200', 'border-teal-400', 'bg-teal-100', 'border-teal-300');
          celda.classList.add('bg-green-200', 'border-green-400', 'text-green-800');
          celda.style.cursor = 'default';
        });
        mostrarMensaje('✅ ¡Palabra encontrada! +5 puntos', 'bg-green-50 text-green-700 border-green-200');
        // Confetti
        if (typeof lanzarConfetti === 'function') {
          lanzarConfetti(40, false);
        }
        // Actualizar contador
        document.getElementById('contador-encontradas').textContent = data.palabrasEncontradas;
        
        // Verificar si completó todas
        if (data.palabrasEncontradas >= data.totalPalabras) {
          setTimeout(() => {
            mostrarMensaje('🎉 ¡Completaste todas las palabras!', 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none');
            if (typeof lanzarFuegosArtificiales === 'function') {
              lanzarFuegosArtificiales(3);
            }
          }, 500);
        }
      } else {
        // Palabra incorrecta - animación de error
        mostrarMensaje('❌ Palabra incorrecta, intenta de nuevo', 'bg-red-50 text-red-700 border-red-200');
        seleccionActual.forEach(celda => {
          celda.classList.remove('bg-teal-200', 'border-teal-400', 'bg-teal-100', 'border-teal-300');
          celda.classList.add('bg-red-100', 'border-red-300');
          setTimeout(() => {
            celda.classList.remove('bg-red-100', 'border-red-300');
            celda.classList.add('bg-white', 'border-slate-200');
          }, 600);
        });
      }
      
      // Limpiar selección
      seleccionActual = [];
    })
    .catch(err => {
      console.error('Error:', err);
      mostrarMensaje('Error al verificar', 'bg-red-50 text-red-700 border-red-200');
    });
  };

  /**
   * Marca una palabra en la lista como encontrada
   */
  function marcarPalabraEncontrada(palabra) {
    const items = document.querySelectorAll('.palabra-item');
    items.forEach(item => {
      if (item.dataset.palabra === palabra.toUpperCase() || 
          item.dataset.palabra === palabra) {
        item.classList.remove('border-slate-200');
        item.classList.add('bg-green-50', 'border-green-300', 'line-through', 'text-green-600');
        const dot = item.querySelector('div');
        if (dot) {
          dot.classList.remove('bg-teal-400');
          dot.classList.add('bg-green-400');
        }
      }
    });
  }

  /**
   * Muestra un mensaje temporal
   */
  function mostrarMensaje(texto, clases) {
    const mensaje = document.getElementById('mensaje-resultado');
    mensaje.className = clases + ' text-center font-bold py-4 px-6 rounded-2xl transition-all';
    mensaje.textContent = texto;
    mensaje.classList.remove('hidden');
    
    setTimeout(() => {
      mensaje.classList.add('hidden');
    }, 2000);
  }
});
