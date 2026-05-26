/**
 * 🧩 Rompecabezas (Puzzle) - Lógica del lado cliente
 * 
 * Soporta dos modos de juego:
 * 1. Arrastrar y soltar (por defecto) - arrastra piezas visualmente
 * 2. Intercambiar por clics - selecciona dos piezas para intercambiarlas
 * 
 * Cada pieza muestra el fragmento de imagen correspondiente a su
 * posición correcta, independientemente de dónde esté en el grid.
 * 
 * Sistema de eventos táctiles y ratón unificado con ghost visual.
 */

document.addEventListener('DOMContentLoaded', function() {
  let piezaSeleccionada = null;
  let movimientos = 0;
  let imagenPuzzle = null;
  let totalPiezas = 0;
  let filas = 0;
  let columnas = 0;
  let victoriaActiva = false;

  const grid = document.getElementById('puzzle-grid');
  if (!grid || grid.dataset.isEmpty === 'true') return;

  filas = parseInt(grid.dataset.filas || 3);
  columnas = parseInt(grid.dataset.columnas || 3);
  totalPiezas = filas * columnas;

  // ── Modo de interacción ──
  let modoArrastre = true; // true = arrastrar y soltar, false = intercambiar por clics

  // ── Estado del arrastre activo ──
  let arrastre = null;
  // { index, piezaDOM, ghost, offsetX, offsetY, startX, startY, esArrastre }
  let objetivoArrastre = null; // elemento destino resaltado


  // ==================================================================
  //  CAMBIAR MODO DE JUEGO
  // ==================================================================

  /**
   * Cambia entre modo arrastrar ↔ modo intercambiar
   */
  window.cambiarModoPuzzle = function(nuevoModo) {
    modoArrastre = nuevoModo === 'arrastre';
    limpiarStateInteraccion();

    document.querySelectorAll('.modo-puzzle-btn').forEach(btn => {
      const activo = btn.dataset.modo === nuevoModo;
      btn.classList.toggle('bg-amber-500', activo);
      btn.classList.toggle('text-white', activo);
      btn.classList.toggle('shadow-md', activo);
      btn.classList.toggle('ring-2', activo);
      btn.classList.toggle('ring-amber-300', activo);
      btn.classList.toggle('bg-white', !activo);
      btn.classList.toggle('text-slate-600', !activo);
      btn.classList.toggle('border', !activo);
      btn.classList.toggle('border-slate-200', !activo);
    });

    // Feedback visual en el grid
    grid.classList.toggle('drag-mode', modoArrastre);
    grid.classList.toggle('swap-mode', !modoArrastre);

    // Actualizar cursor en piezas
    grid.querySelectorAll('.puzzle-pieza').forEach(p => {
      p.style.cursor = modoArrastre ? 'grab' : 'pointer';
    });
  };

  /** Limpia todo estado de interacción pendiente */
  function limpiarStateInteraccion() {
    if (arrastre) {
      if (arrastre.ghost && arrastre.ghost.parentNode) {
        arrastre.ghost.parentNode.removeChild(arrastre.ghost);
      }
      if (arrastre.piezaDOM) {
        arrastre.piezaDOM.style.opacity = '1';
        arrastre.piezaDOM.style.transform = '';
        arrastre.piezaDOM.style.zIndex = '';
      }
    }
    if (objetivoArrastre) {
      objetivoArrastre.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
      objetivoArrastre.style.boxShadow = '';
      objetivoArrastre = null;
    }
    if (piezaSeleccionada) {
      deseleccionarPieza(piezaSeleccionada);
      piezaSeleccionada = null;
    }
    arrastre = null;
  }


  // ==================================================================
  //  SISTEMA DE ARRASTRE Y SOLTAR (event delegation)
  // ==================================================================

  /** Inicia la interacción (mousedown / touchstart) */
  function onInteraccionStart(e) {
    if (victoriaActiva) return;

    // Limpiar cualquier arrastre previo para evitar ghost huérfanos
    if (arrastre) limpiarStateInteraccion();

    const pieza = e.target.closest('.puzzle-pieza');
    if (!pieza) return;

    const index = parseInt(pieza.dataset.index);
    if (isNaN(index)) return;

    const pos = obtenerPosEvento(e);
    if (!pos) return;

    // Guardar estado inicial para distinguir click vs arrastre
    const rect = pieza.getBoundingClientRect();
    arrastre = {
      index,
      piezaDOM: pieza,
      ghost: null,
      offsetX: pos.x - rect.left,
      offsetY: pos.y - rect.top,
      startX: pos.x,
      startY: pos.y,
      esArrastre: false
    };

    // Pequeña animación de "agarre" en la pieza
    pieza.style.transition = 'transform 0.1s ease, opacity 0.15s ease';
    pieza.style.transform = 'scale(0.95)';

    e.preventDefault();
  }

  /** Movimiento durante interacción (mousemove / touchmove) */
  function onInteraccionMove(e) {
    if (!arrastre) return;
    if (victoriaActiva) return;

    const pos = obtenerPosEvento(e);
    if (!pos) return;

    const distX = pos.x - arrastre.startX;
    const distY = pos.y - arrastre.startY;
    const distancia = Math.sqrt(distX * distX + distY * distY);

    // ── Solo en modo arrastre: activar ghost tras 8px ──
    if (modoArrastre && !arrastre.esArrastre && distancia >= 8) {
      arrastre.esArrastre = true;

      const rect = arrastre.piezaDOM.getBoundingClientRect();
      const ghost = arrastre.piezaDOM.cloneNode(true);
      ghost.style.cssText = `
        position: fixed;
        width: ${rect.width}px;
        height: ${rect.height}px;
        left: ${rect.left}px;
        top: ${rect.top}px;
        z-index: 9999;
        pointer-events: none;
        border-radius: 0.75rem;
        transform: scale(1.08) rotate(1.5deg);
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 2px rgba(251,191,36,0.3);
        transition: none;
        will-change: transform, left, top;
      `;
      // Resolver background-image si está en inline style
      const bg = arrastre.piezaDOM.style.backgroundImage;
      if (bg) ghost.style.backgroundImage = bg;
      ghost.style.backgroundSize = arrastre.piezaDOM.style.backgroundSize;
      ghost.style.backgroundPosition = arrastre.piezaDOM.style.backgroundPosition;
      document.body.appendChild(ghost);
      arrastre.ghost = ghost;

      // Opacar pieza original con efecto
      arrastre.piezaDOM.style.opacity = '0.3';
      arrastre.piezaDOM.style.transform = 'scale(1)';
      arrastre.piezaDOM.style.cursor = 'grabbing';

      // Marcar en drag mode
      grid.classList.add('dragging-active');
    }

    // ── Mover ghost ──
    if (arrastre.esArrastre && arrastre.ghost) {
      arrastre.ghost.style.left = (pos.x - arrastre.offsetX) + 'px';
      arrastre.ghost.style.top = (pos.y - arrastre.offsetY) + 'px';

      // Detectar pieza bajo el cursor
      arrastre.ghost.style.display = 'none';
      const elemUnder = document.elementFromPoint(pos.x, pos.y);
      arrastre.ghost.style.display = '';

      const targetPieza = elemUnder?.closest('.puzzle-pieza');

      // Limpiar highlight anterior
      if (objetivoArrastre && objetivoArrastre !== arrastre.piezaDOM) {
        objetivoArrastre.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
        objetivoArrastre.style.boxShadow = '';
        objetivoArrastre.style.transform = '';
      }

      // Aplicar highlight al nuevo objetivo
      if (targetPieza && targetPieza !== arrastre.piezaDOM) {
        objetivoArrastre = targetPieza;
        targetPieza.classList.add('ring-4', 'ring-amber-400', 'scale-105');
        targetPieza.style.boxShadow = '0 0 0 4px rgba(251,191,36,0.4), 0 10px 15px -3px rgba(0,0,0,0.1)';
        targetPieza.style.transform = 'scale(1.05)';
        targetPieza.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      } else if (targetPieza === arrastre.piezaDOM) {
        objetivoArrastre = null;
      } else {
        objetivoArrastre = null;
      }
    }

    e.preventDefault();
  }

  /** Finaliza la interacción (mouseup / touchend) */
  function onInteraccionEnd(e) {
    if (!arrastre) return;

    const pos = obtenerPosEventoFin(e);

    // Restaurar estado visual de la pieza original
    arrastre.piezaDOM.style.opacity = '1';
    arrastre.piezaDOM.style.transform = '';
    arrastre.piezaDOM.style.cursor = modoArrastre ? 'grab' : 'pointer';
    grid.classList.remove('dragging-active');

    // Remover ghost si existe
    if (arrastre.ghost && arrastre.ghost.parentNode) {
      arrastre.ghost.parentNode.removeChild(arrastre.ghost);
    }

    // Limpiar highlight del objetivo
    if (objetivoArrastre) {
      objetivoArrastre.classList.remove('ring-4', 'ring-amber-400', 'scale-105');
      objetivoArrastre.style.boxShadow = '';
      objetivoArrastre.style.transform = '';
      const idx = parseInt(objetivoArrastre.dataset.index);
      const posCorr = parseInt(objetivoArrastre.dataset.posicionCorrecta);
      if (posCorr === idx) {
        objetivoArrastre.classList.add('ring-2', 'ring-green-300');
      }
      objetivoArrastre = null;
    }

    // ── Ejecutar acción según el tipo de interacción ──
    if (arrastre.esArrastre && pos) {
      // FUE UN ARRASTRE → intercambiar con la pieza destino
      arrastre.ghost = null; // ya se eliminó arriba

      // Encontrar pieza objetivo con elementFromPoint
      const elemUnder = document.elementFromPoint(pos.x, pos.y);
      const targetPieza = elemUnder?.closest('.puzzle-pieza');

      if (targetPieza) {
        const targetIndex = parseInt(targetPieza.dataset.index);
        if (!isNaN(targetIndex) && targetIndex !== arrastre.index) {
          moverPieza(arrastre.index, targetIndex, true);
        }
      }
    } else if (!arrastre.esArrastre) {
      // FUE UN CLIC (sin arrastre) → seleccionar en modo intercambio,
      // o también permitir selección en modo arrastre (tocar sin mover)
      seleccionarPieza(arrastre.piezaDOM);
    }

    arrastre = null;
    e.preventDefault();
  }

  /** Obtiene coordenadas del evento (mouse o touch) */
  function obtenerPosEvento(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.changedTouches && e.changedTouches.length > 0 && e.type === 'touchmove') {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function obtenerPosEventoFin(e) {
    // touchend solo tiene changedTouches
    if (e.changedTouches && e.changedTouches.length > 0) {
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  // ── Registrar eventos sobre el grid ──
  grid.addEventListener('mousedown', onInteraccionStart);
  window.addEventListener('mousemove', onInteraccionMove);
  window.addEventListener('mouseup', onInteraccionEnd);

  // Touch (pasivo = false para permitir preventDefault)
  grid.addEventListener('touchstart', onInteraccionStart, { passive: false });
  window.addEventListener('touchmove', onInteraccionMove, { passive: false });
  window.addEventListener('touchend', onInteraccionEnd, { passive: false });

  // Si el mouse sale de la ventana durante arrastre, cancelar ghost
  document.addEventListener('mouseleave', function(e) {
    if (arrastre && arrastre.esArrastre) {
      // Ocultar ghost temporalmente
      if (arrastre.ghost) arrastre.ghost.style.display = 'none';
    }
  });

  document.addEventListener('mouseenter', function(e) {
    if (arrastre && arrastre.esArrastre && arrastre.ghost) {
      arrastre.ghost.style.display = '';
    }
  });


  // ==================================================================
  //  INICIALIZAR PUZZLE
  // ==================================================================

  /**
   * Inicializa el puzzle: genera la imagen y aplica fragmentos
   */
  async function inicializarPuzzle() {
    const temaId = grid.dataset.tema || 'mapa';

    try {
      const imagenUrl = await generarImagenPuzzle(temaId, 600, 600);
      imagenPuzzle = imagenUrl;

      const preview = document.getElementById('preview-imagen');
      if (preview) {
        preview.src = imagenUrl;
      }

      aplicarFragmentos();
      actualizarContadorOrdenadas();

      // Inicializar modo por defecto (arrastrar)
      window.cambiarModoPuzzle('arrastre');

    } catch (err) {
      console.error('Error al generar imagen del puzzle:', err);
      aplicarFallbackColores();
      window.cambiarModoPuzzle('arrastre');
    }
  }

  /**
   * Aplica fragmentos de imagen a cada pieza
   */
  function aplicarFragmentos() {
    if (!imagenPuzzle) return;

    const piezas = grid.querySelectorAll('.puzzle-pieza');
    const anchoFragmento = 100 / columnas;
    const altoFragmento = 100 / filas;

    piezas.forEach((pieza, index) => {
      const posCorrecta = parseInt(pieza.dataset.posicionCorrecta);
      const col = posCorrecta % columnas;
      const row = Math.floor(posCorrecta / columnas);

      const bgPosX = columnas > 1 ? (col / (columnas - 1)) * 100 : 0;
      const bgPosY = filas > 1 ? (row / (filas - 1)) * 100 : 0;

      pieza.style.backgroundImage = `url('${imagenPuzzle}')`;
      pieza.style.backgroundSize = `${columnas * 100}% ${filas * 100}%`;
      pieza.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
      pieza.style.backgroundRepeat = 'no-repeat';
      pieza.style.backgroundColor = 'transparent';
      pieza.style.opacity = '1';

      // Quitar contenido de texto/número
      pieza.innerHTML = '';

      // Efectos hover
      pieza.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease';

      // Indicador visual si está en posición correcta
      if (posCorrecta === index) {
        pieza.classList.add('ring-2', 'ring-green-300');
      } else {
        pieza.classList.remove('ring-2', 'ring-green-300');
      }
    });
  }

  /**
   * Fallback visual con colores
   */
  function aplicarFallbackColores() {
    const piezas = grid.querySelectorAll('.puzzle-pieza');
    const coloresTema = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    piezas.forEach((pieza, index) => {
      const posCorrecta = parseInt(pieza.dataset.posicionCorrecta);
      const color = coloresTema[(posCorrecta + Math.floor(posCorrecta / columnas)) % coloresTema.length];
      const opacidad = 0.6 + ((posCorrecta + Math.floor(posCorrecta / columnas)) % 5) * 0.08;

      pieza.style.backgroundColor = color;
      pieza.style.opacity = Math.min(opacidad, 1);
      pieza.style.backgroundImage = 'none';
      pieza.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
      pieza.innerHTML = `
        <div class="flex flex-col items-center justify-center p-1">
          <span class="text-2xl font-black drop-shadow-lg text-white">${posCorrecta + 1}</span>
        </div>
      `;
    });
  }


  // ==================================================================
  //  SELECCIÓN / INTERCAMBIO (modo clics)
  // ==================================================================

  /**
   * Selecciona/deselecciona una pieza para intercambiar
   */
  window.seleccionarPieza = function(pieza) {
    if (victoriaActiva) return;

    if (arrastre) return; // No interferir con arrastre activo

    if (!piezaSeleccionada) {
      // Seleccionar primera pieza
      piezaSeleccionada = pieza;
      pieza.classList.remove('ring-2', 'ring-green-300');
      pieza.classList.add('ring-4', 'ring-amber-400', 'z-10');
      pieza.style.boxShadow = '0 0 0 4px rgba(251, 191, 36, 0.4), 0 20px 25px -5px rgba(0,0,0,0.2)';
      pieza.style.transform = 'scale(1.05) translateY(-2px)';
      pieza.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';

    } else if (piezaSeleccionada === pieza) {
      // Deseleccionar
      deseleccionarPieza(pieza);
      piezaSeleccionada = null;

    } else {
      // Intercambiar
      const primera = piezaSeleccionada;
      const index1 = parseInt(primera.dataset.index);
      const index2 = parseInt(pieza.dataset.index);

      deseleccionarPieza(primera);
      moverPieza(index1, index2, false);
      piezaSeleccionada = null;
    }
  };

  function deseleccionarPieza(pieza) {
    pieza.classList.remove('ring-4', 'ring-amber-400', 'z-10');
    pieza.style.boxShadow = '';
    pieza.style.transform = '';
    const index = parseInt(pieza.dataset.index);
    const posCorrecta = parseInt(pieza.dataset.posicionCorrecta);
    if (posCorrecta === index) {
      pieza.classList.add('ring-2', 'ring-green-300');
    }
  }


  // ==================================================================
  //  MOVIMIENTO (API y actualización visual)
  // ==================================================================

  /**
   * Envía el movimiento al servidor y actualiza el grid
   */
  function moverPieza(deIndex, aIndex, fueArrastre = false) {
    fetch('/puzzle/mover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deIndex, aIndex })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      movimientos = data.movimientos;
      const movimientosEl = document.getElementById('movimientos');
      if (movimientosEl) movimientosEl.textContent = movimientos;

      // Animar las piezas durante el re-render
      animarTransicionPiezas(data.piezas, deIndex, aIndex);

      // Actualizar grid con los datos del servidor
      actualizarGrid(data.piezas);

      if (data.completado) {
        victoriaActiva = true;
        const puntosEl = document.getElementById('puntos-victoria');
        if (puntosEl) {
          puntosEl.textContent = `🎉 +${data.puntosGanados} puntos en ${movimientos} movimientos`;
        }
        document.getElementById('mensaje-victoria').classList.remove('hidden');

        if (typeof lanzarFuegosArtificiales === 'function') {
          setTimeout(() => lanzarFuegosArtificiales(3), 300);
        }
        if (typeof lanzarConfetti === 'function') {
          lanzarConfetti(150, true);
        }
      }
    })
    .catch(err => console.error('Error:', err));
  }

  /**
   * Animación sutil durante transición de piezas
   */
  function animarTransicionPiezas(piezas, deIndex, aIndex) {
    const piezasDOM = grid.querySelectorAll('.puzzle-pieza');
    [deIndex, aIndex].forEach(idx => {
      if (piezasDOM[idx]) {
        piezasDOM[idx].style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        piezasDOM[idx].style.transform = 'scale(0.9)';
        piezasDOM[idx].style.opacity = '0.7';
        setTimeout(() => {
          if (piezasDOM[idx]) {
            piezasDOM[idx].style.transform = '';
            piezasDOM[idx].style.opacity = '';
          }
        }, 200);
      }
    });
  }

  /**
   * Actualiza el grid visual con las piezas del servidor
   */
  function actualizarGrid(piezas) {
    const piezasDOM = grid.querySelectorAll('.puzzle-pieza');

    piezas.forEach((pieza, index) => {
      const piezaDOM = piezasDOM[index];
      piezaDOM.dataset.index = index;
      piezaDOM.dataset.posicionCorrecta = pieza.posicionCorrecta;

      // Re-aplicar fragmento de imagen
      if (imagenPuzzle) {
        const col = pieza.posicionCorrecta % columnas;
        const row = Math.floor(pieza.posicionCorrecta / columnas);
        const bgPosX = columnas > 1 ? (col / (columnas - 1)) * 100 : 0;
        const bgPosY = filas > 1 ? (row / (filas - 1)) * 100 : 0;

        piezaDOM.style.backgroundImage = `url('${imagenPuzzle}')`;
        piezaDOM.style.backgroundSize = `${columnas * 100}% ${filas * 100}%`;
        piezaDOM.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        piezaDOM.style.backgroundRepeat = 'no-repeat';
        piezaDOM.style.backgroundColor = 'transparent';
        piezaDOM.style.opacity = '1';
        piezaDOM.innerHTML = '';
      }

      // Ring verde si está en posición correcta
      if (pieza.posicionCorrecta === index) {
        piezaDOM.classList.add('ring-2', 'ring-green-300');
      } else {
        piezaDOM.classList.remove('ring-2', 'ring-green-300');
      }

      // Cursor según modo actual
      piezaDOM.style.cursor = modoArrastre ? 'grab' : 'pointer';
    });

    actualizarContadorOrdenadas();
  }

  function actualizarContadorOrdenadas() {
    const piezas = grid.querySelectorAll('.puzzle-pieza');
    let ordenadas = 0;
    piezas.forEach((pieza, index) => {
      const posCorrecta = parseInt(pieza.dataset.posicionCorrecta);
      if (posCorrecta === index) ordenadas++;
      if (posCorrecta === index) {
        pieza.classList.add('ring-2', 'ring-green-300');
      } else {
        pieza.classList.remove('ring-2', 'ring-green-300');
      }
    });

    const contador = document.getElementById('piezas-ordenadas');
    if (contador) contador.textContent = `${ordenadas} / ${piezas.length}`;
  }


  // ==================================================================
  //  ACCIONES
  // ==================================================================

  window.reiniciarPuzzle = function() {
    limpiarStateInteraccion();
    victoriaActiva = false;
    window.location.href = window.location.pathname + window.location.search;
  };


  // ==================================================================
  //  INICIALIZAR
  // ==================================================================

  inicializarPuzzle();
});
