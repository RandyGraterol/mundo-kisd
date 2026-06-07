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

// ── Selección de modo, tema y dificultad ──
var modoSeleccionadoPZ = 'libre';
var temaSeleccionadoPZ = 'mapa';
var dificultadSeleccionadaPZ = 'facil';
var modoElegidoPZ = false;
var temaElegidoPZ = false;
var dificultadElegidaPZ = false;

window.seleccionarModoPZ = function(modo) {
  modoSeleccionadoPZ = modo;
  modoElegidoPZ = true;
  var base = 'cursor-pointer flex flex-col items-center gap-1.5 p-4 bg-white rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md';
  var cardLibre = document.getElementById('pz-modo-libre');
  var cardContra = document.getElementById('pz-modo-contrarreloj');
  if (cardLibre && cardContra) {
    if (modo === 'libre') {
      cardLibre.className = base + ' border-emerald-500 shadow-md';
      cardLibre.style.setProperty('border-color', '#10b981', 'important');
      cardContra.className = base + ' border-slate-200';
      cardContra.style.setProperty('border-color', '#cbd5e1', 'important');
    } else {
      cardContra.className = base + ' border-emerald-500 shadow-md';
      cardContra.style.setProperty('border-color', '#10b981', 'important');
      cardLibre.className = base + ' border-slate-200';
      cardLibre.style.setProperty('border-color', '#cbd5e1', 'important');
    }
  }
  actualizarBotonComenzarPZ();
};

window.seleccionarTemaPZ = function(temaId) {
  temaSeleccionadoPZ = temaId;
  temaElegidoPZ = true;
  var baseTheme = 'pz-theme-card cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md';
  document.querySelectorAll('.pz-theme-card').forEach(function(el) {
    var isSelected = el.getAttribute('data-tema') === temaId;
    if (isSelected) {
      el.className = baseTheme + ' border-emerald-500 ring-2 ring-emerald-300 shadow-md';
      el.style.setProperty('border-color', '#10b981', 'important');
    } else {
      el.className = baseTheme + ' border-slate-200 hover:border-teal-300';
      el.style.borderColor = '';
    }
  });
  var baseCont = 'pz-cont-card cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 hover:shadow-md transition-all hover:-translate-y-0.5';
  document.querySelectorAll('.pz-cont-card').forEach(function(el) {
    var isSelected = el.getAttribute('data-tema') === temaId;
    if (isSelected) {
      el.className = baseCont + ' border-emerald-500 ring-2 ring-emerald-300 shadow-md';
      el.style.setProperty('border-color', '#10b981', 'important');
    } else {
      el.className = baseCont + ' border-slate-200';
      el.style.borderColor = '';
    }
  });
  actualizarBotonComenzarPZ();
};

window.seleccionarDificultadPZ = function(dificultadId) {
  dificultadSeleccionadaPZ = dificultadId;
  dificultadElegidaPZ = true;
  var base = 'pz-diff-card cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md';
  var colores = { facil: '#22c55e', medio: '#eab308', dificil: '#ef4444', experto: '#8b5cf6', ultra: '#f97316', extremo: '#ec4899', legendario: '#14b8a6' };
  document.querySelectorAll('.pz-diff-card').forEach(function(el) {
    el.className = base + ' border-slate-200';
    el.style.borderColor = '';
  });
  document.querySelectorAll('[data-dificultad="' + dificultadId + '"]').forEach(function(el) {
    el.className = base + ' ring-2 ring-amber-300 scale-105 shadow-md';
    el.style.setProperty('border-color', colores[dificultadId] || '#22c55e', 'important');
  });
  actualizarBotonComenzarPZ();
};

function actualizarBotonComenzarPZ() {
  var btn = document.getElementById('pz-btn-comenzar');
  if (btn) {
    btn.href = '/puzzle/jugar?tema=' + temaSeleccionadoPZ + '&dificultad=' + dificultadSeleccionadaPZ + '&modo=' + modoSeleccionadoPZ;
  }
}

function validarSeleccionPZ() {
  var faltan = [];
  if (!modoElegidoPZ) faltan.push('Modo');
  if (!temaElegidoPZ) faltan.push('Tema');
  if (!dificultadElegidaPZ) faltan.push('Dificultad');
  if (faltan.length > 0) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);padding:1rem;';
    var modal = document.createElement('div');
    modal.style.cssText = 'background:#1e293b;border-radius:2rem;padding:2rem;max-width:380px;width:100%;text-align:center;border:1px solid #334155;box-shadow:0 25px 50px rgba(0,0,0,0.4);animation:modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;';
    modal.innerHTML =
      '<div style="width:56px;height:56px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      '</div>' +
      '<h2 style="color:#f1f5f9;font-size:1.1rem;font-weight:800;margin-bottom:0.75rem">⚠️ Selección incompleta</h2>' +
      '<p style="color:#94a3b8;font-size:0.875rem;margin-bottom:0.5rem">Debes seleccionar:</p>' +
      '<p style="color:#e2e8f0;font-size:0.9rem;font-weight:600;margin-bottom:1.25rem">' + faltan.join(', ') + '</p>' +
      '<button onclick="this.closest(\'div\').parentElement.remove()" style="width:100%;padding:0.7rem 1rem;background:#334155;color:#f1f5f9;font-weight:700;font-size:0.85rem;border:none;border-radius:0.75rem;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background=\'#475569\'" onmouseout="this.style.background=\'#334155\'">Entendido</button>';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return false;
  }
  return true;
}

// ── Temporizador ──
var temporizadorPZ = null;
var tiempoRestantePZ = 0;

function iniciarTemporizadorPZ(segundos) {
  var panel = document.getElementById('pz-temporizador');
  if (!panel || panel.classList.contains('hidden')) return;

  tiempoRestantePZ = segundos;
  var display = document.getElementById('pz-display-tiempo');
  var barra = document.getElementById('pz-barra-tiempo');
  var totalInicial = segundos;

  if (temporizadorPZ) clearInterval(temporizadorPZ);

  temporizadorPZ = setInterval(function() {
    tiempoRestantePZ--;

    if (tiempoRestantePZ <= 0) {
      clearInterval(temporizadorPZ);
      temporizadorPZ = null;
      tiempoRestantePZ = 0;
      tiempoAgotadoPZ();
    }

    if (display) {
      var m = Math.floor(tiempoRestantePZ / 60);
      var s = tiempoRestantePZ % 60;
      display.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }
    if (barra) {
      barra.style.width = (tiempoRestantePZ / totalInicial) * 100 + '%';
    }

    if (tiempoRestantePZ <= 10) {
      if (display) display.style.color = '#e11d48';
    } else if (tiempoRestantePZ <= 30) {
      if (display) display.style.color = '#f97316';
    }
  }, 1000);
}

function tiempoAgotadoPZ() {
  var contador = document.getElementById('piezas-ordenadas');
  var piezasTexto = contador ? contador.textContent : '0';

  // Crear modal full-screen
  var overlay = document.createElement('div');
  overlay.id = 'pz-modal-timeout';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);padding:1rem;';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#1e293b;border-radius:2rem;padding:2rem;max-width:400px;width:100%;text-align:center;border:1px solid #334155;box-shadow:0 25px 50px rgba(0,0,0,0.4);animation:modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;';

  modal.innerHTML =
    '<div style="width:64px;height:64px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>' +
    '</div>' +
    '<h2 style="color:#f1f5f9;font-size:1.25rem;font-weight:800;margin-bottom:0.5rem">⏰ ¡Tiempo agotado!</h2>' +
    '<p style="color:#94a3b8;font-size:0.875rem;margin-bottom:0.25rem">El tiempo se acabó antes de completar el puzzle.</p>' +
    '<p style="color:#94a3b8;font-size:0.75rem;margin-bottom:1.5rem">Piezas ordenadas: <strong style="color:#e2e8f0">' + piezasTexto + '</strong></p>' +
    '<button onclick="location.reload()" style="width:100%;padding:0.75rem 1rem;background:#334155;color:#f1f5f9;font-weight:700;font-size:0.875rem;border:none;border-radius:0.75rem;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background=\'#475569\'" onmouseout="this.style.background=\'#334155\'">Reintentar</button>';

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function detenerTemporizadorPZ() {
  if (temporizadorPZ) {
    clearInterval(temporizadorPZ);
    temporizadorPZ = null;
  }
}

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

  // Iniciar temporizador si existe el panel
  var timerPanel = document.getElementById('pz-temporizador');
  if (timerPanel && !timerPanel.classList.contains('hidden')) {
    var displayEl = document.getElementById('pz-display-tiempo');
    if (displayEl) {
      var partes = displayEl.textContent.split(':');
      var mins = parseInt(partes[0]) || 0;
      var segs = parseInt(partes[1]) || 0;
      iniciarTemporizadorPZ(mins * 60 + segs);
    }
  }

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
    limpiarStateInteraccion(true);

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
  function limpiarStateInteraccion(keepSelection) {
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
    if (!keepSelection && piezaSeleccionada) {
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
    if (arrastre) limpiarStateInteraccion(!modoArrastre);

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
    } else if (!arrastre.esArrastre && modoArrastre) {
      // FUE UN CLIC en modo arrastre → seleccionar
      seleccionarPieza(arrastre.piezaDOM);
    }

    arrastre = null;
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

  // ── Click directo para modo intercambio ──
  grid.addEventListener('click', function(e) {
    if (modoArrastre) return;
    if (victoriaActiva) return;
    var pieza = e.target.closest('.puzzle-pieza');
    if (!pieza) return;
    e.stopPropagation();
    seleccionarPieza(pieza);
  });
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

      pieza.innerHTML = '';

      // Efectos hover
      pieza.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease';

      // Indicador visual si está en posición correcta
      if (posCorrecta === index) {
        pieza.style.outline = '';
        pieza.style.outlineOffset = '';
      } else {
        pieza.style.outline = '2px solid #ef4444';
        pieza.style.outlineOffset = '-2px';
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
      pieza.style.outline = '';
      pieza.style.outlineOffset = '';
    } else {
      pieza.style.outline = '2px solid #ef4444';
      pieza.style.outlineOffset = '-2px';
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
        detenerTemporizadorPZ();
        victoriaActiva = true;
        const puntosEl = document.getElementById('puntos-victoria');
        if (puntosEl) {
          puntosEl.textContent = '🎉 +' + data.puntosGanados + ' puntos en ' + movimientos + ' movimientos';
        }
        document.getElementById('mensaje-victoria').classList.remove('hidden');

        if (typeof lanzarFuegosArtificiales === 'function') {
          setTimeout(() => lanzarFuegosArtificiales(3), 300);
        }
        if (typeof lanzarConfetti === 'function') {
          lanzarConfetti(150, true);
        }

        if (data.siguienteNivel) {
          var params = new URLSearchParams(window.location.search);
          var tema = params.get('tema') || 'mapa';
          var modo = params.get('modo') || 'libre';
          setTimeout(function() {
            window.location.href = '/puzzle/jugar?tema=' + tema + '&dificultad=' + data.siguienteNivel + '&modo=' + modo;
          }, 3000);
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

      // Borde rojo si la pieza no está en su posición correcta
      if (pieza.posicionCorrecta === index) {
        piezaDOM.style.outline = '';
        piezaDOM.style.outlineOffset = '';
      } else {
        piezaDOM.style.outline = '2px solid #ef4444';
        piezaDOM.style.outlineOffset = '-2px';
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
        pieza.style.outline = '';
        pieza.style.outlineOffset = '';
      } else {
        pieza.style.outline = '2px solid #ef4444';
        pieza.style.outlineOffset = '-2px';
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
