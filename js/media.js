/* Âm thanh hiệu ứng (tạo bằng WebAudio, không cần file) và đọc to bằng giọng tiếng Việt. */
(function () {
  let ctx = null;

  function tone(freq, start, duration, type = 'sine', gain = 0.15) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  }

  const PATTERNS = {
    move: [[520, 0, 0.07, 'triangle', 0.12]],
    capture: [[300, 0, 0.1, 'square', 0.08]],
    good: [[660, 0, 0.12], [880, 0.1, 0.18]],
    bad: [[220, 0, 0.18, 'sawtooth', 0.06]],
    win: [[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.15], [1047, 0.36, 0.35]]
  };

  function play(name) {
    if (!Progress.data.settings.sound) return;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (const p of PATTERNS[name] || []) tone(...p);
    } catch (e) {
      /* trình duyệt không hỗ trợ âm thanh – bỏ qua */
    }
  }

  function vietVoice() {
    if (!('speechSynthesis' in window)) return null;
    return speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('vi')) || null;
  }

  function canSpeak() {
    return !!vietVoice();
  }

  function speak(text) {
    const voice = vietVoice();
    if (!voice || !Progress.data.settings.voice) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => document.dispatchEvent(new Event('voices-ready')));
  }

  window.Media = { play, speak, stopSpeaking, canSpeak };
})();
