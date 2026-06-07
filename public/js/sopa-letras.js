// Sopa de Letras - Lógica del lado cliente
// Maneja la selección de letras, temporizador y comunicación con el servidor

// ── Selección de modo, nivel y tema ──
var modoSeleccionadoSL = 'libre';
var nivelSeleccionadoSL = 'facil';
var temaSeleccionadoSL = 'global';
var modoElegidoSL = false;
var nivelElegidoSL = false;
var temaElegidoSL = false;

window.seleccionarModoSL = function(modo) {
  modoSeleccionadoSL = modo;
  modoElegidoSL = true;
  var base = 'sl-mode-card cursor-pointer flex flex-col items-center gap-1.5 p-4 bg-white rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md';
  var cardLibre = document.getElementById('sl-modo-libre');
  var cardContra = document.getElementById('sl-modo-contrarreloj');
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
  actualizarBotonComenzarSL();
};

window.seleccionarTemaSL = function(temaId) {
  temaSeleccionadoSL = temaId;
  temaElegidoSL = true;
  var base = 'sl-theme-card cursor-pointer flex flex-col items-center gap-2 p-4 bg-white rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md';
  document.querySelectorAll('.sl-theme-card').forEach(function(el) {
    var isSelected = el.getAttribute('data-tema') === temaId;
    if (isSelected) {
      el.className = base + ' border-emerald-500 ring-2 ring-emerald-300 shadow-md';
      el.style.setProperty('border-color', '#10b981', 'important');
    } else {
      el.className = base + ' border-slate-200 hover:border-teal-300';
      el.style.borderColor = '';
    }
  });
  actualizarBotonComenzarSL();
};

window.seleccionarNivelSL = function(nivelId) {
  nivelSeleccionadoSL = nivelId;
  nivelElegidoSL = true;
  document.querySelectorAll('.sl-nivel-card').forEach(function(el) {
    var isSelected = el.getAttribute('data-nivel') === nivelId;
    if (isSelected) {
      el.classList.add('ring-2', 'ring-emerald-500', 'shadow-md', 'scale-[1.02]');
      el.style.setProperty('border-color', '#10b981', 'important');
    } else {
      el.classList.remove('ring-2', 'ring-emerald-500', 'shadow-md', 'scale-[1.02]');
      el.style.borderColor = '';
    }
  });
  actualizarBotonComenzarSL();
};

function actualizarBotonComenzarSL() {
  var btn = document.getElementById('sl-btn-comenzar');
  if (btn) {
    btn.href = '/sopa-letras/jugar?tema=' + temaSeleccionadoSL + '&nivel=' + nivelSeleccionadoSL + '&modo=' + modoSeleccionadoSL;
  }
}

function validarSeleccionSL() {
  var faltan = [];
  if (!modoElegidoSL) faltan.push('Modo');
  if (!temaElegidoSL) faltan.push('Tema');
  if (!nivelElegidoSL) faltan.push('Nivel');
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
var temporizadorSL = null;
var tiempoRestanteSL = 0;

function iniciarTemporizadorSL(segundos) {
  var panel = document.getElementById('sl-temporizador');
  if (!panel || panel.classList.contains('hidden')) return;

  tiempoRestanteSL = segundos;
  var display = document.getElementById('sl-display-tiempo');
  var barra = document.getElementById('sl-barra-tiempo');
  var totalInicial = segundos;

  if (temporizadorSL) clearInterval(temporizadorSL);

  temporizadorSL = setInterval(function() {
    tiempoRestanteSL--;

    if (tiempoRestanteSL <= 0) {
      clearInterval(temporizadorSL);
      temporizadorSL = null;
      tiempoRestanteSL = 0;
      tiempoAgotadoSL();
    }

    if (display) {
      var m = Math.floor(tiempoRestanteSL / 60);
      var s = tiempoRestanteSL % 60;
      display.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }
    if (barra) {
      barra.style.width = (tiempoRestanteSL / totalInicial) * 100 + '%';
    }

    if (tiempoRestanteSL <= 10) {
      if (display) display.style.color = '#e11d48';
    } else if (tiempoRestanteSL <= 30) {
      if (display) display.style.color = '#f97316';
    }
  }, 1000);
}

function tiempoAgotadoSL() {
  var contador = document.getElementById('contador-encontradas');
  var palabrasTexto = contador ? contador.textContent : '0';

  var overlay = document.createElement('div');
  overlay.id = 'sl-modal-timeout';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);padding:1rem;';

  var modal = document.createElement('div');
  modal.style.cssText = 'background:#1e293b;border-radius:2rem;padding:2rem;max-width:400px;width:100%;text-align:center;border:1px solid #334155;box-shadow:0 25px 50px rgba(0,0,0,0.4);animation:modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;';

  modal.innerHTML =
    '<div style="width:64px;height:64px;background:#0f172a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>' +
    '</div>' +
    '<h2 style="color:#f1f5f9;font-size:1.25rem;font-weight:800;margin-bottom:0.5rem">⏰ ¡Tiempo agotado!</h2>' +
    '<p style="color:#94a3b8;font-size:0.875rem;margin-bottom:0.25rem">El tiempo se acabó antes de encontrar todas las palabras.</p>' +
    '<p style="color:#94a3b8;font-size:0.75rem;margin-bottom:1.5rem">Palabras encontradas: <strong style="color:#e2e8f0">' + palabrasTexto + '</strong></p>' +
    '<button onclick="location.reload()" style="width:100%;padding:0.75rem 1rem;background:#334155;color:#f1f5f9;font-weight:700;font-size:0.875rem;border:none;border-radius:0.75rem;cursor:pointer;transition:background 0.2s" onmouseover="this.style.background=\'#475569\'" onmouseout="this.style.background=\'#334155\'">Reintentar</button>';

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function detenerTemporizadorSL() {
  if (temporizadorSL) {
    clearInterval(temporizadorSL);
    temporizadorSL = null;
  }
}

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

  // Iniciar temporizador si existe el panel
  var timerPanel = document.getElementById('sl-temporizador');
  if (timerPanel && !timerPanel.classList.contains('hidden')) {
    var displayEl = document.getElementById('sl-display-tiempo');
    if (displayEl) {
      var partes = displayEl.textContent.split(':');
      var mins = parseInt(partes[0]) || 0;
      var segs = parseInt(partes[1]) || 0;
      iniciarTemporizadorSL(mins * 60 + segs);
    }
  }

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
          detenerTemporizadorSL();
          setTimeout(() => {
            mostrarMensaje('🎉 ¡Completaste todas las palabras!', 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none');
            if (typeof lanzarFuegosArtificiales === 'function') {
              lanzarFuegosArtificiales(3);
            }
            if (data.siguienteNivel) {
              var params = new URLSearchParams(window.location.search);
              var tema = params.get('tema') || 'global';
              var modo = params.get('modo') || 'libre';
              setTimeout(function() {
                window.location.href = '/sopa-letras/jugar?tema=' + tema + '&nivel=' + data.siguienteNivel + '&modo=' + modo;
              }, 2500);
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
    const items = document.querySelectorAll('.sl-word-item');
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
