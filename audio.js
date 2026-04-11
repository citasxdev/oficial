/**
 * CitasXdev — Módulo de Audio y Feedback Háptico
 * Gestiona efectos de sonido, vibración y feedback audiovisual.
 */

(function () {
  "use strict";

  const AUDIO_ENABLED_KEY = "citasxdev_audio_enabled";
  const HAPTIC_ENABLED_KEY = "citasxdev_haptic_enabled";

  /* ── Configuración de sonidos ── */
  const SOUNDS = {
    pop:    { file: "/oficial/assets/audio/pop.mp3",    duration: 80,  haptic: [10] },
    match:  { file: "/oficial/assets/audio/match.mp3",  duration: 200, haptic: [30, 50, 30] },
    error:  { file: "/oficial/assets/audio/error.mp3",  duration: 150, haptic: [50, 30] },
    notify: { file: "/oficial/assets/audio/notify.mp3", duration: 250, haptic: [20, 20, 20, 20] }
  };

  /* ── Estado ── */
  let audioContext = null;
  let audioEnabled = localStorage.getItem(AUDIO_ENABLED_KEY) !== "false";
  let hapticEnabled = localStorage.getItem(HAPTIC_ENABLED_KEY) !== "false";
  let audioElements = {};

  /* ── Inicializar contexto de audio ── */
  function initAudioContext() {
    if (audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContext = new AudioContext();
    }
  }

  /* ── Precargar elementos de audio ── */
  function preloadAudio() {
    Object.entries(SOUNDS).forEach(([key, config]) => {
      const audio = new Audio(config.file);
      audio.preload = "auto";
      audio.volume = 0.3;
      audioElements[key] = audio;
    });
  }

  /* ── Reproducir sonido ── */
  function playSound(soundKey) {
    if (!audioEnabled || !audioElements[soundKey]) return;
    try {
      const audio = audioElements[soundKey].cloneNode();
      audio.play().catch(() => {
        /* Silenciar errores de reproducción */
      });
    } catch (_) {}
  }

  /* ── Vibración háptica ── */
  function vibrate(pattern) {
    if (!hapticEnabled || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (_) {}
  }

  /* ── Feedback combinado (audio + haptic) ── */
  function feedback(soundKey) {
    const config = SOUNDS[soundKey];
    if (!config) return;
    playSound(soundKey);
    vibrate(config.haptic);
  }

  /* ── Generar tono con Web Audio API (fallback) ── */
  function generateTone(freq = 440, duration = 100) {
    if (!audioContext) initAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = freq;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    osc.start(now);
    osc.stop(now + duration / 1000);
  }

  /* ── API pública ── */
  window.CitasAudio = {
    init() {
      preloadAudio();
      initAudioContext();
    },

    play(soundKey) {
      playSound(soundKey);
    },

    feedback(soundKey) {
      feedback(soundKey);
    },

    vibrate(pattern) {
      vibrate(pattern);
    },

    tone(freq = 440, duration = 100) {
      generateTone(freq, duration);
    },

    toggleAudio(enabled) {
      audioEnabled = enabled;
      localStorage.setItem(AUDIO_ENABLED_KEY, enabled ? "true" : "false");
    },

    toggleHaptic(enabled) {
      hapticEnabled = enabled;
      localStorage.setItem(HAPTIC_ENABLED_KEY, enabled ? "true" : "false");
    },

    isAudioEnabled() {
      return audioEnabled;
    },

    isHapticEnabled() {
      return hapticEnabled;
    }
  };

  /* ── Inicializar en load ── */
  window.addEventListener("load", () => {
    CitasAudio.init();
  }, { once: true });

})();
