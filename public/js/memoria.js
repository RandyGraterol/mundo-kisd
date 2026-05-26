// Juego de Memoria - Lógica del lado cliente
// Maneja el volteo de cartas, verificación de pares, contrarreloj y comunicación con el servidor

document.addEventListener('DOMContentLoaded', function() {
  let cartaSeleccionada = null;
  let bloqueado = false;
  let paresEncontrados = 0;
  let intentos = 0;

  // ── Temporizador ──
  let tiempoRestante = 0;
  let temporizadorInterval = null;
  let tiempoAgotado = false;
  let juegoTerminado = false;

  const panelTemporizador = document.getElementById('temporizador-panel');
  const displayTiempo = document.getElementById('display-tiempo');
  const barraTiempo = document.getElementById('barra-tiempo');
  const mensajeTiempoAgotado = document.getElementById('mensaje-tiempo-agotado');
  const displayIntFinales = document.getElementById('intentos-finales');
  const displayParesEncontrados = document.getElementById('pares-encontrados');

  // Iniciar temporizador si hay panel (modo contrarreloj)
  if (panelTemporizador && displayTiempo && barraTiempo) {
    const textoInicial = displayTiempo.textContent.trim();
    const partes = textoInicial.split(':');
    const mins = parseInt(partes[0], 10);
    const segs = parseInt(partes[1], 10);
    tiempoRestante = mins * 60 + segs;

    if (tiempoRestante > 0) {
      iniciarTemporizador();
    }
  }

  /**
   * Inicia la cuenta regresiva
   */
  function iniciarTemporizador() {
    if (temporizadorInterval) clearInterval(temporizadorInterval);
    const totalInicial = tiempoRestante;

    temporizadorInterval = setInterval(() => {
      if (juegoTerminado) {
        clearInterval(temporizadorInterval);
        temporizadorInterval = null;
        return;
      }

      tiempoRestante--;
      actualizarDisplayTiempo(totalInicial);

      if (tiempoRestante <= 0) {
        clearInterval(temporizadorInterval);
        temporizadorInterval = null;
        tiempoRestante = 0;
        tiempoAgotado = true;
        manejarTiempoAgotado();
      }
    }, 1000);
  }

  /**
   * Actualiza el display del cronómetro y la barra de progreso
   */
  function actualizarDisplayTiempo(totalInicial) {
    const mins = Math.floor(tiempoRestante / 60);
    const segs = tiempoRestante % 60;
    displayTiempo.textContent = `${mins}:${segs < 10 ? '0' : ''}${segs}`;

    // Barra de progreso
    const porcentaje = totalInicial > 0 ? (tiempoRestante / totalInicial) * 100 : 0;
    barraTiempo.style.width = `${porcentaje}%`;

    // Cambiar color según urgencia
    if (tiempoRestante <= 10) {
      displayTiempo.style.color = '#e11d48'; // rojo intenso
      displayTiempo.style.animation = 'pulse 0.5s ease-in-out infinite';
      barraTiempo.style.background = 'linear-gradient(90deg, #e11d48, #f43f5e)';
    } else if (tiempoRestante <= 30) {
      displayTiempo.style.color = '#ea580c'; // naranja
      displayTiempo.style.animation = 'none';
      barraTiempo.style.background = 'linear-gradient(90deg, #f97316, #fbbf24)';
    } else {
      displayTiempo.style.color = '#0f172a'; // normal
      displayTiempo.style.animation = 'none';
      barraTiempo.style.background = 'linear-gradient(90deg, #f43f5e, #f97316)';
    }
  }

  /**
   * Maneja cuando el tiempo se agota
   */
  function manejarTiempoAgotado() {
    bloqueado = true;
    juegoTerminado = true;

    // Actualizar pares encontrados (total ya viene del servidor en la vista)
    const paresEl = document.getElementById('pares-tiempo-agotado');
    const encontrados = document.getElementById('pares-encontrados');
    if (paresEl && encontrados) {
      paresEl.textContent = encontrados.textContent;
    }

    // Mostrar mensaje de tiempo agotado
    if (mensajeTiempoAgotado) {
      mensajeTiempoAgotado.classList.remove('hidden');
      // Forzar reflow para reiniciar animación
      mensajeTiempoAgotado.style.animation = 'none';
      mensajeTiempoAgotado.offsetHeight;
      mensajeTiempoAgotado.style.animation = 'fadeIn 0.5s ease';
    }
  }

  /**
   * Detiene el temporizador (al completar el juego)
   */
  function detenerTemporizador() {
    juegoTerminado = true;
    if (temporizadorInterval) {
      clearInterval(temporizadorInterval);
      temporizadorInterval = null;
    }
  }

  /**
   * Voltea una carta
   */
  window.voltearCarta = function(carta) {
    if (bloqueado) return;
    if (juegoTerminado || tiempoAgotado) return;
    if (!carta) return;

    const interior = carta.querySelector('.carta-interior');

    // Si ya está volteada o encontrada, ignorar
    if (carta.classList.contains('volteada') || carta.classList.contains('encontrada')) {
      return;
    }

    // Voltear la carta
    interior.style.transform = 'rotateY(180deg)';
    carta.classList.add('volteada');

    if (!cartaSeleccionada) {
      // Primera carta del par
      cartaSeleccionada = carta;
    } else {
      // Segunda carta - verificar par
      bloqueado = true;
      const primeraCarta = cartaSeleccionada;
      const segundaCarta = carta;

      verificarPar(primeraCarta, segundaCarta);
    }
  };

  /**
   * Actualiza la barra de progreso
   */
  function actualizarBarraProgreso(paresEncontrados, totalPares) {
    const barra = document.getElementById('barra-progreso-memoria');
    if (barra) {
      const porcentaje = totalPares > 0 ? Math.round((paresEncontrados / totalPares) * 100) : 0;
      barra.style.width = `${porcentaje}%`;
    }
  }

  /**
   * Verifica si dos cartas forman un par (comunicación con servidor)
   */
  function verificarPar(carta1, carta2) {
    const cartaId1 = carta1.dataset.id;
    const cartaId2 = carta2.dataset.id;

    fetch('/memoria/verificar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartaId1, cartaId2 })
    })
    .then(res => res.json())
    .then(data => {
      intentos = data.intentos;
      document.getElementById('intentos').textContent = intentos;
      document.getElementById('pares-encontrados').textContent = data.paresEncontrados;

      actualizarBarraProgreso(data.paresEncontrados, data.totalPares);

      if (data.esPar) {
        // Par encontrado
        paresEncontrados = data.paresEncontrados;

        // Marcar cartas como encontradas
        carta1.classList.add('encontrada');
        carta2.classList.add('encontrada');

        // Efecto visual de par encontrado — anillo verde
        setTimeout(() => {
          carta1.querySelector('.carta-interior').classList.add('ring-4', 'ring-green-400', 'rounded-2xl');
          carta2.querySelector('.carta-interior').classList.add('ring-4', 'ring-green-400', 'rounded-2xl');
        }, 300);

        // Confetti sutil
        if (typeof lanzarConfetti === 'function') {
          lanzarConfetti(20, false);
        }

        // Verificar si completó el juego
        if (data.juegoCompletado) {
          // Detener temporizador si está activo
          detenerTemporizador();

          setTimeout(() => {
            // Mostrar intentos finales
            const intentosFinales = document.getElementById('intentos-finales');
            if (intentosFinales) intentosFinales.textContent = data.intentos;

            document.getElementById('mensaje-victoria').classList.remove('hidden');
            if (typeof lanzarFuegosArtificiales === 'function') {
              lanzarFuegosArtificiales(3);
            }
          }, 800);
        }

        cartaSeleccionada = null;
        bloqueado = false;
      } else {
        // No es par - voltear de nuevo
        setTimeout(() => {
          // Si el tiempo se agotó mientras esperábamos, no animar las cartas
          if (tiempoAgotado) {
            cartaSeleccionada = null;
            bloqueado = false;
            return;
          }

          carta1.querySelector('.carta-interior').style.transform = 'rotateY(0deg)';
          carta2.querySelector('.carta-interior').style.transform = 'rotateY(0deg)';
          carta1.classList.remove('volteada');
          carta2.classList.remove('volteada');

          cartaSeleccionada = null;
          bloqueado = false;
        }, 1000);
      }
    })
    .catch(err => {
      console.error('Error:', err);
      bloqueado = false;
      cartaSeleccionada = null;
    });
  }
});

/**
 * Selecciona el modo de juego en la pantalla de selección
 */
let nivelSeleccionado = null;
let modoSeleccionado = 'normal';

function seleccionarNivel(nivelId) {
  nivelSeleccionado = nivelId;
  document.querySelectorAll('.nivel-link').forEach(el => {
    if (el.dataset.nivel === nivelId) {
      el.classList.add('ring-2', 'ring-purple-500', 'shadow-lg', 'scale-[1.02]');
      el.style.borderWidth = '3px';
    } else {
      el.classList.remove('ring-2', 'ring-purple-500', 'shadow-lg', 'scale-[1.02]');
      el.style.borderWidth = '2px';
    }
  });
  actualizarEnlaces();
}

function actualizarEnlaces() {
  var modo = modoSeleccionado || 'normal';
  var nivel = nivelSeleccionado || 'medio';
  document.querySelectorAll('.tema-link, .continente-link').forEach(function(el) {
    var href = el.getAttribute('href');
    if (href) {
      href = href.replace(/modo=[a-z]+/, 'modo=' + modo).replace(/nivel=[a-z]+/, 'nivel=' + nivel);
      el.setAttribute('href', href);
    }
  });
}

function seleccionarModo(modo) {
  modoSeleccionado = modo;
  const cardNormal = document.getElementById('modo-normal-card');
  const cardContra = document.getElementById('modo-contrarreloj-card');
  const ayudaTiempos = document.getElementById('tiempos-ayuda');

  // Actualizar estilos de las tarjetas
  if (cardNormal && cardContra) {
    if (modo === 'normal') {
      cardNormal.className = 'cursor-pointer flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border-2 border-purple-400 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg';
      cardContra.className = 'cursor-pointer flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border-2 border-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg';
    } else {
      cardContra.className = 'cursor-pointer flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border-2 border-rose-400 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg';
      cardNormal.className = 'cursor-pointer flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border-2 border-slate-200 transition-all hover:-translate-y-1 hover:shadow-lg';
    }
  }

  // Mostrar/ocultar ayuda de tiempos
  if (ayudaTiempos) {
    ayudaTiempos.classList.toggle('hidden', modo !== 'contrarreloj');
  }

  // Mostrar/ocultar badge de tiempo en cada tarjeta de nivel
  document.querySelectorAll('.tiempito').forEach(el => {
    el.style.display = modo === 'contrarreloj' ? 'inline-flex' : 'none';
  });

  actualizarEnlaces();
}
