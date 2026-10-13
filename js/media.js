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
    const recorded = window.AUDIO_CLIPS && Object.keys(window.AUDIO_CLIPS.clips || {}).length > 0;
    return recorded || !!vietVoice();
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

  /* ---------------- Giọng AI thu sẵn ---------------- */

  // audio/<mã>.mp3: mỗi câu cố định (lời giảng, đề bài, giải thích soạn sẵn) được thu sẵn bằng giọng AI.
  // Mã = FNV-1a 32 bit của câu (UTF-8), tools/build_audio.py tính giống hệt.
  const CLIPS = (window.AUDIO_CLIPS && window.AUDIO_CLIPS.clips) || {};

  function clipKey(sentence) {
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(sentence)) {
      h ^= b;
      h = Math.imul(h, 0x01000193) >>>0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function useRecorded() {
    return Progress.data.settings.voiceMode !== 'device' && Object.keys(CLIPS).length > 0;
  }

  // Một thẻ <audio> dùng chung: iPhone/iPad chỉ cho phát âm thanh sau khi người dùng chạm,
  // và một thẻ đã được "mở khóa" thì phát tiếp được các câu sau.
  const player = typeof Audio !== 'undefined' ? new Audio() : null;
  let queue = [];
  let speaking = false;
  let session = 0;

  let idleWaiters = [];
  function notifyIdle() {
    const waiters = idleWaiters;
    idleWaiters = [];
    waiters.forEach(fn => fn());
  }

  /** Chờ đến khi đọc xong (tối đa maxMs), để bàn cờ "đợi thầy giảng xong" rồi mới đi tiếp. */
  function whenIdle(maxMs = 15000) {
    const busy = speaking || ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending));
    if (!busy) return Promise.resolve();
    return new Promise(resolve => {
      const timer = setTimeout(resolve, maxMs);
      idleWaiters.push(() => { clearTimeout(timer); resolve(); });
      // Giọng của máy (không qua hàng đợi): kiểm tra định kỳ.
      const poll = setInterval(() => {
        if (!speaking && !(speechSynthesis.speaking || speechSynthesis.pending)) { clearInterval(poll); clearTimeout(timer); resolve(); }
      }, 250);
    });
  }

  function playNext(id) {
    if (id !== session) return;
    const item = queue.shift();
    if (!item) { speaking = false; notifyIdle(); return; }
    const done = () => playNext(id);
    if (item.clip && player) {
      player.onended = done;
      player.onerror = () => speakDevice(item.text, done); // thiếu file: đọc bằng giọng máy
      player.src = `audio/${item.clip}.mp3`;
      player.playbackRate = Progress.data.settings.voiceRate ? Math.min(1.15, Progress.data.settings.voiceRate / 0.9) : 1;
      const p = player.play();
      if (p && p.catch) p.catch(() => speakDevice(item.text, done));
    } else {
      speakDevice(item.text, done);
    }
  }

  function speakDevice(text, done) {
    const voice = vietVoice();
    if (!voice) { done(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = Progress.data.settings.voiceRate || 0.9;
    u.pitch = 1.05;
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
  }

  function stopAll() {
    session++;
    queue = [];
    speaking = false;
    notifyIdle();
    if (player) { player.onended = null; player.onerror = null; player.pause(); }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
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

  /** Đọc to: câu nào có bản thu sẵn thì phát bản thu, còn lại dùng giọng của máy. */
  // Mỗi câu: phát bản thu sẵn nếu có (và đang chọn giọng AI), không thì đọc bằng giọng của máy.
  function toItems(text) {
    const rec = useRecorded();
    return sentences(prepareSpeech(text)).map(t => ({ text: t, clip: rec && CLIPS[clipKey(t)] ? clipKey(t) : null }));
  }

  function speak(text, force) {
    if (!Progress.data.settings.voice && !force) return;
    stopAll();
    queue = toItems(text);
    if (!queue.length) return;
    speaking = true;
    playNext(session);
  }

  /** Đọc nối tiếp sau câu đang đọc (không ngắt), vd. thầy giảng từng nước khai cuộc. */
  function speakAfter(text) {
    if (!Progress.data.settings.voice) return;
    queue.push(...toItems(text));
    if (!speaking && queue.length) { speaking = true; playNext(session); }
  }

  /** Nghe thử một giọng (dùng ở trang Phụ huynh), kể cả khi đang tắt tự đọc. */
  function preview(name, rate) {
    if (useRecorded()) {
      // Câu mẫu lấy từ bài học đầu tiên nên đã có bản thu sẵn.
      speak('Chào con! Trước khi học bài mới, mình cùng ôn lại vài luật đặc biệt của cờ vua nhé.', true);
      return;
    }
    const voice = vietVoices().find(v => v.name === name) || vietVoice();
    if (voice) speakWith('Chào con! Mã đi đến ép ba, tấn công tốt e năm. Nước đi Nxf7+ là mã ăn f7 và chiếu vua.', voice, rate);
  }

  function stopSpeaking() {
    stopAll();
  }

  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', () => document.dispatchEvent(new Event('voices-ready')));
  }

  window.Media = {
    play, speak, speakAfter, whenIdle, stopSpeaking, canSpeak, vietVoices, vietVoice, preview,
    prepareSpeech, sentences, clipKey,
    get hasRecorded() { return Object.keys(CLIPS).length > 0; },
    get recordedVoice() { return (window.AUDIO_CLIPS && window.AUDIO_CLIPS.voice) || ''; }
  };
})();
