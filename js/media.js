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

  /* ---------------- Giọng đọc tiếng Việt ---------------- */

  // Chấm điểm giọng: giọng "tự nhiên" (neural) của Edge, giọng Google, giọng nâng cao của iOS được ưu tiên;
  // giọng "Microsoft An" kiểu cũ của Windows rất máy móc nên xếp cuối.
  function voiceScore(v) {
    const n = v.name.toLowerCase();
    let s = 0;
    if (/natural|neural|online/.test(n)) s += 100;
    if (/premium/.test(n)) s += 90;
    if (/enhanced|nâng cao/.test(n)) s += 80;
    if (/google/.test(n)) s += 60;
    if (/hoaimy|linh/.test(n)) s += 5; // giọng nữ, nhẹ nhàng hợp với trẻ
    if (/microsoft an\b/.test(n)) s -= 20;
    return s;
  }

  function vietVoices() {
    if (!('speechSynthesis' in window)) return [];
    return speechSynthesis.getVoices()
      .filter(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('vi'))
      .sort((a, b) => voiceScore(b) - voiceScore(a));
  }

  function vietVoice() {
    const voices = vietVoices();
    const chosen = Progress.data.settings.voiceName;
    return voices.find(v => v.name === chosen) || voices[0] || null;
  }

  function canSpeak() {
    return !!vietVoice();
  }

  /* ---------------- Chuẩn bị câu đọc ---------------- */

  const PIECE = { K: 'Vua', Q: 'Hậu', R: 'Xe', B: 'Tượng', N: 'Mã' };
  // Đọc tên ô theo cách gọi quen thuộc của người Việt: "e4" → "e bốn".
  const DIGIT = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám'];
  const FILE = { a: 'a', b: 'bê', c: 'xê', d: 'đê', e: 'e', f: 'ép', g: 'gờ', h: 'hát' };
  const square = sq => `${FILE[sq[0]]} ${DIGIT[Number(sq[1])]}`;

  /** Đổi ký hiệu nước đi (SAN) thành lời: "Nxf7+" → "Mã ăn ép bảy, chiếu". */
  function sanToWords(_, piece, from, capture, to, promo, check) {
    let s;
    if (piece) s = `${PIECE[piece]} ${capture ? 'ăn' : 'đến'} ${square(to)}`;
    else if (capture) s = `Tốt ${FILE[from[0]] || ''} ăn ${square(to)}`;
    else s = square(to); // nước tốt thường (vd "e4") hoặc tên ô: chỉ cần đọc tên ô
    if (promo) s += `, phong ${PIECE[promo[1]].toLowerCase()}`;
    if (check === '+') s += ', chiếu';
    if (check === '#') s += ', chiếu hết';
    return s;
  }

  function prepareSpeech(text) {
    return String(text)
      .replace(/<[^>]+>/g, ' ')
      .replace(/O-O-O/g, 'nhập thành cánh hậu')
      .replace(/O-O/g, 'nhập thành cánh vua')
      .replace(/\b([KQRBN])?([a-h]?[1-8]?)(x)?([a-h][1-8])(=[QRBN])?([+#])?(?![\p{L}\d])/gu, (m, p, f, x, to, promo, chk) =>
        // Chỉ đổi khi chắc chắn là ký hiệu cờ: có chữ quân, có "x", hoặc là tên một ô đơn lẻ.
        (p || x || promo || chk || m === to) ? sanToWords(m, p, f, x, to, promo, chk) : m)
      .replace(/\p{Extended_Pictographic}|️/gu, ' ')
      .replace(/[→·]/g, ', ')
      .replace(/(\d)\s*[–-]\s*(\d)/g, '$1 đến $2')
      .replace(/×/g, ' nhân ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Tách thành từng câu để giọng đọc ngắt nghỉ tự nhiên (và tránh lỗi Chrome cắt câu dài). */
  function sentences(text) {
    return text.split(/(?<=[.!?…:;])\s+/).map(s => s.trim()).filter(s => /[\p{L}\d]/u.test(s));
  }

  function speakWith(text, voice, rate) {
    speechSynthesis.cancel();
    for (const part of sentences(prepareSpeech(text))) {
      const u = new SpeechSynthesisUtterance(part);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = rate;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    }
  }

  function speak(text) {
    const voice = vietVoice();
    if (!voice || !Progress.data.settings.voice) return;
    speakWith(text, voice, Progress.data.settings.voiceRate || 0.9);
  }

  /** Nghe thử một giọng (dùng ở trang Phụ huynh), kể cả khi đang tắt tự đọc. */
  function preview(name, rate) {
    const voice = vietVoices().find(v => v.name === name) || vietVoice();
    if (voice) speakWith('Chào con! Mã đi đến ép ba, tấn công tốt e năm. Nước đi Nxf7+ là mã ăn f7 và chiếu vua.', voice, rate);
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => document.dispatchEvent(new Event('voices-ready')));
  }

  window.Media = { play, speak, stopSpeaking, canSpeak, vietVoices, vietVoice, preview, prepareSpeech };
})();
