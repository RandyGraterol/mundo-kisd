// Sistema de Sonidos - Mundo Kids
// Usa Web Audio API para generar sonidos sintéticos sin archivos externos

const SonidosMundoKids = (() => {
  let audioContext = null;

  function obtenerContexto() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Auto-reanudar si está suspendido (permite sonidos en DOMContentLoaded)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(function() {});
    }
    return audioContext;
  }

  /**
   * Reproduce un tono simple
   */
  function reproducirTono(frecuencia, duracion, tipo = 'sine', volumen = 0.3) {
    try {
      const ctx = obtenerContexto();
      const oscilador = ctx.createOscillator();
      const ganancia = ctx.createGain();

      oscilador.type = tipo;
      oscilador.frequency.setValueAtTime(frecuencia, ctx.currentTime);

      ganancia.gain.setValueAtTime(volumen, ctx.currentTime);
      ganancia.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duracion);

      oscilador.connect(ganancia);
      ganancia.connect(ctx.destination);

      oscilador.start(ctx.currentTime);
      oscilador.stop(ctx.currentTime + duracion);
    } catch (e) {
      // Silenciar errores de audio (navegador puede bloquearlo)
    }
  }

  /**
   * Sonido: Respuesta correcta (ascendente alegre)
   */
  function sonidoCorrecto() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    // Acorde mayor ascendente
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  /**
   * Sonido: Respuesta incorrecta (descendente grave)
   */
  function sonidoIncorrecto() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    // Dos tonos descendentes
    [300, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0.15, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.3);
    });
  }

  /**
   * Sonido: Subida de nivel (fanfarria)
   */
  function sonidoNivel() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    // Arpegio ascendente
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.25, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  }

  /**
   * Sonido: Click / Interacción
   */
  function sonidoClick() {
    reproducirTono(800, 0.08, 'sine', 0.15);
  }

  /**
   * Sonido: Logro desbloqueado (fanfarria especial)
   */
  function sonidoLogro() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    // Fanfarria de tres notas con armónicos
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.6);
    });
  }

  /**
   * Sonido: Inicio de actividad / countdown
   */
  function sonidoInicio() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    [440, 554.37, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);
      gain.gain.setValueAtTime(0.2, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.3);
    });
  }

  /**
   * Sonido: Tiempo agotado (alarma)
   */
  function sonidoTiempoAgotado() {
    const ctx = obtenerContexto();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now + i * 0.25);
      gain.gain.setValueAtTime(0.12, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.2);
    }
  }

  /**
   * Inicializa el contexto de audio (requiere interacción del usuario)
   */
  function inicializar() {
    try {
      const ctx = obtenerContexto();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      // Ignorar errores
    }
  }

  return {
    correcto: sonidoCorrecto,
    incorrecto: sonidoIncorrecto,
    nivel: sonidoNivel,
    click: sonidoClick,
    logro: sonidoLogro,
    inicio: sonidoInicio,
    tiempoAgotado: sonidoTiempoAgotado,
    inicializar
  };
})();
