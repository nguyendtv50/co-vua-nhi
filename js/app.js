/* Cờ Vua Nhí – điều hướng màn hình và logic bài học. */
(function () {
  const UNITS = window.CURRICULUM.units;
  const app = document.getElementById('app');
  const FILES = 'abcdefgh';
  const PIECE_NAME = { p: 'tốt', n: 'mã', b: 'tượng', r: 'xe', q: 'hậu', k: 'vua' };
  const PRAISE = ['Giỏi quá! 🎉', 'Tuyệt vời! ⭐', 'Chính xác! 👏', 'Con làm tốt lắm! 💪', 'Xuất sắc! 🌟'];
  const ENCOURAGE = ['Chưa đúng rồi, thử lại nhé! 💪', 'Gần đúng rồi, nhìn kỹ lại nào! 👀', 'Không sao, thử nước khác nhé! 🙂'];
  const MONTHS = [
    'Khởi động', 'Tháng 1 – Chiếu hết và giữ quân', 'Tháng 2 – Đòn chiến thuật', 'Tháng 3 – Tổng hợp và thi đấu',
    'Tháng 4 – Chiếu hết nâng cao', 'Tháng 5 – Phối hợp chiến thuật', 'Tháng 6 – Tàn cuộc và phòng thủ',
    'Tháng 7 – Đặt quân và cấu trúc tốt', 'Tháng 8 – Đổi quân, kế hoạch và tàn cuộc'
  ];
  const PHASES = { 0: 'Giai đoạn 1 – Cơ bản', 4: 'Giai đoạn 2 – Nâng cao', 7: 'Giai đoạn 3 – Tư duy chiến lược' };
  const OPENINGS = (window.OPENINGS || { repertoires: [] }).repertoires;
  const REVIEWABLE = new Set(['mate1', 'move', 'puzzle', 'find', 'line']);
  const PUZZLES = window.PUZZLES || { packs: {}, pool: [] };
  const PHASE1 = UNITS.filter(u => u.month <= 3);

  let cleanup = null; // hàm dọn dẹp của màn hình hiện tại (hủy hẹn giờ của máy…)

  const pick = list => list[Math.floor(Math.random() * list.length)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = list => {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function show(html) {
    if (cleanup) cleanup();
    cleanup = null;
    Media.stopSpeaking();
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function speakButton(text) {
    if (!Media.canSpeak()) return '';
    return `<button class="speak" title="Đọc to" data-say="${esc(text)}">🔊</button>`;
  }

  // Nút 🔊 ở bất kỳ đâu trên trang.
  app.addEventListener('click', e => {
    const btn = e.target.closest('[data-say]');
    if (btn) Media.speak(btn.dataset.say, true); // bấm 🔊 thì luôn đọc, kể cả khi tắt tự động đọc
  });

  function starsHtml(n, max = 3) {
    let s = '';
    for (let i = 0; i < max; i++) s += i < n ? '⭐' : '<span class="star-off">☆</span>';
    return s;
  }

  function celebrate() {
    const box = document.createElement('div');
    box.className = 'confetti';
    const colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#c77dff'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = pick(colors);
      c.style.animationDelay = Math.random() * 0.6 + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(c);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3200);
  }

  /* ------------------------------------------------------------------ */
  /* Công cụ cờ                                                          */
  /* ------------------------------------------------------------------ */

  /** Từ ô bắt qua đường trong FEN (vd "d6") suy ra nước tốt vừa đi 2 ô (d7→d5); không có thì [null, null]. */
  function epLastMove(fen) {
    const ep = fen.split(' ')[3];
    if (!ep || ep === '-') return [null, null];
    const up = ep[1] === '6' ? 1 : -1;
    return [ep[0] + (Number(ep[1]) + up), ep[0] + (Number(ep[1]) - up)];
  }

  function matchesAnswer(uci, mv) {
    if (uci.slice(0, 2) !== mv.from || uci.slice(2, 4) !== mv.to) return false;
    return uci.length < 5 || uci[4] === (mv.promotion || '');
  }

  function firstMate(fen) {
    const g = new Chess(fen);
    for (const m of g.moves({ verbose: true })) {
      g.move(m);
      const mate = g.isCheckmate();
      g.undo();
      if (mate) return m;
    }
    return null;
  }

  /** Các quân (trừ vua) của `color` đang gặp nguy: bị tấn công mà không được bảo vệ, hoặc bị quân nhỏ hơn tấn công. */
  function piecesInDanger(game, color) {
    const opp = color === 'w' ? 'b' : 'w';
    const out = [];
    for (const row of game.board()) {
      for (const p of row) {
        if (!p || p.color !== color || p.type === 'k') continue;
        const attackers = game.attackers(p.square, opp);
        if (!attackers.length) continue;
        const defended = game.attackers(p.square, color).length > 0;
        const cheapest = Math.min(...attackers.map(sq => Bot.VALUE[game.get(sq).type] || 0));
        if (!defended || cheapest < Bot.VALUE[p.type]) out.push(p);
      }
    }
    return out;
  }

  const EDGE = [];
  for (let i = 0; i < 8; i++) EDGE.push('a' + (i + 1), 'h' + (i + 1), FILES[i] + '1', FILES[i] + '8');

  /** Tạo bài chiếu hết 1 nước ngẫu nhiên: vua + các quân Trắng chống lại vua Đen đơn độc. */
  function generateMate(pieces) {
    const rand = n => Math.floor(Math.random() * n);
    for (let attempt = 0; attempt < 8000; attempt++) {
      const used = new Set();
      const take = sq => { used.add(sq); return sq; };
      const randomSquare = () => {
        let s;
        do s = FILES[rand(8)] + (1 + rand(8)); while (used.has(s));
        return take(s);
      };
      const g = new Chess();
      g.clear();
      const bk = take(pick(EDGE));
      const wk = randomSquare();
      if (Math.abs(bk.charCodeAt(0) - wk.charCodeAt(0)) <= 1 && Math.abs(bk[1] - wk[1]) <= 1) continue;
      g.put({ type: 'k', color: 'b' }, bk);
      g.put({ type: 'k', color: 'w' }, wk);
      for (const ch of pieces) g.put({ type: ch.toLowerCase(), color: 'w' }, randomSquare());
      if (g.isAttacked(bk, 'w')) continue;
      let mates = 0;
      for (const m of g.moves({ verbose: true })) {
        g.move(m);
        if (g.isCheckmate()) mates++;
        g.undo();
      }
      if (mates >= 1 && mates <= 2) return g.fen();
    }
    return null;
  }

  const toPuzzle = ([id, fen, moves, rating, themes]) => ({ type: 'puzzle', id, fen, moves, rating, themes });

  /** Lấy `count` bài trong gói: bài chưa làm trước, rồi bài từng sai, cuối cùng mới đến bài đã giải; dễ trước khó sau. */
  function pickFromPack(packId, count) {
    const seen = Progress.data.puzzleSeen;
    const rank = p => (!(p[0] in seen) ? 0 : seen[p[0]] === 0 ? 1 : 2);
    const list = (PUZZLES.packs[packId] || []).slice();
    list.sort((a, b) => rank(a) - rank(b) || a[3] - b[3]);
    return list.slice(0, count).sort((a, b) => a[3] - b[3]).map(toPuzzle);
  }

  /** Bài luyện tập thích ứng: độ khó gần với điểm giải đố hiện tại của bé, ưu tiên bài chưa gặp. */
  function adaptivePuzzles(count) {
    const seen = Progress.data.puzzleSeen;
    const rating = Progress.data.puzzleRating;
    const learnedPacks = UNITS.filter(u => Progress.lesson(u.id))
      .flatMap(u => u.exercises.filter(e => e.type === 'pack').map(e => e.pack));
    const source = PUZZLES.pool.concat(...learnedPacks.map(p => PUZZLES.packs[p] || []));
    for (const width of [100, 200, 350, 10000]) {
      const near = source.filter(p => !(p[0] in seen) && Math.abs(p[3] - rating) <= width);
      if (near.length >= count) return shuffle(near).slice(0, count).map(toPuzzle);
    }
    return shuffle(source).slice(0, count).map(toPuzzle);
  }

  function expandExercises(list) {
    const out = [];
    for (const ex of list) {
      if (ex.type === 'pack') {
        out.push(...pickFromPack(ex.pack, ex.count));
      } else if (ex.type === 'gen') {
        for (let i = 0; i < ex.count; i++) {
          const fen = generateMate(ex.pieces);
          if (fen) out.push({ type: 'mate1', fen, prompt: ex.prompt, generated: true });
        }
      } else {
        out.push(ex);
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Màn hình chính: bản đồ lộ trình                                      */
  /* ------------------------------------------------------------------ */

  function header(active) {
    const d = Progress.data;
    const tab = (id, label) => `<button class="tab ${active === id ? 'active' : ''}" data-go="${id}">${label}</button>`;
    return `
      <header class="top">
        <div class="brand">♞ Cờ Vua Nhí</div>
        <div class="stats">
          <span title="Điểm giải đố">🧠 ${d.puzzleRating}</span>
          <span title="Tổng số sao">⭐ ${Progress.totalStars()}</span>
          <span title="Số ngày học liên tiếp">🔥 ${Progress.streak()}</span>
          ${d.name ? `<span class="kid">👦 ${esc(d.name)}</span>` : ''}
        </div>
      </header>
      <nav class="tabs">
        ${tab('home', '🗺️ Lộ trình')}
        ${tab('train', '🎯 Luyện tập')}
        ${tab('openings', '📚 Khai cuộc')}
        ${tab('play', '♟️ Chơi với máy')}
        ${tab('parent', '👨‍👩‍👧 Phụ huynh')}
      </nav>`;
  }

  function bindNav() {
    app.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  }

  function go(where) {
    if (where === 'home') renderHome();
    else if (where === 'practice') startPractice();
    else if (where === 'train') renderTraining();
    else if (where === 'openings') renderOpenings();
    else if (where === 'play') renderPlaySetup();
    else if (where === 'parent') renderParentGate();
  }

  function renderWelcome() {
    show(`
      <div class="welcome card">
        <div class="big-icon">♞</div>
        <h1>Chào mừng đến với Cờ Vua Nhí!</h1>
        <p>Con tên là gì?</p>
        <input id="kidName" maxlength="20" placeholder="Tên của con" autofocus>
        <button class="btn primary" id="startBtn">Bắt đầu học ▶</button>
      </div>`);
    const input = document.getElementById('kidName');
    const start = () => {
      if (!input.value.trim()) { input.focus(); return; }
      Progress.setName(input.value);
      renderHome();
    };
    document.getElementById('startBtn').addEventListener('click', start);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
  }

  function renderHome() {
    if (!Progress.data.name) { renderWelcome(); return; }
    let nextIndex = UNITS.findIndex(u => !Progress.lesson(u.id));
    const groups = MONTHS.map((title, m) => {
      const cards = UNITS.map((u, i) => ({ u, i })).filter(x => x.u.month === m).map(({ u, i }) => {
        const unlocked = Progress.isUnlocked(UNITS, i);
        const rec = Progress.lesson(u.id);
        const cls = ['unit', unlocked ? '' : 'locked', i === nextIndex && unlocked ? 'next' : '', rec ? 'done' : ''].join(' ');
        return `
          <button class="${cls}" data-unit="${i}" ${unlocked ? '' : 'disabled'}>
            <span class="unit-icon">${unlocked ? u.icon : '🔒'}</span>
            <span class="unit-week">${u.week}</span>
            <span class="unit-title">${u.title}</span>
            <span class="unit-stars">${starsHtml(rec ? rec.stars : 0)}</span>
            ${i === nextIndex && unlocked ? '<span class="badge">Học tiếp!</span>' : ''}
          </button>`;
      }).join('');
      const phase = PHASES[m] ? `<h1 class="phase">${PHASES[m]}</h1>` : '';
      return `${phase}<section class="month"><h2>${title}</h2><div class="units">${cards}</div></section>`;
    }).join('');

    const today = Progress.lastDays(1)[0];
    show(`
      ${header('home')}
      <main class="home">
        <div class="hello card">
          <div>
            <h1>Chào ${esc(Progress.data.name)}! 👋</h1>
            <p>Hôm nay con đã giải <b>${today.solved}</b> bài và học <b>${today.minutes}</b> phút.
               ${today.solved >= 10 ? 'Hoàn thành mục tiêu hôm nay! 🎉' : 'Mục tiêu: 10 bài mỗi ngày.'}</p>
          </div>
          <div class="goal-bar"><i style="width:${Math.min(100, today.solved * 10)}%"></i></div>
        </div>
        ${installCard()}
        ${notebookCard()}
        ${groups}
      </main>`);
    bindNav();
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.addEventListener('click', async () => {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      renderHome();
    });
    const hideInstall = document.getElementById('hideInstall');
    if (hideInstall) hideInstall.addEventListener('click', () => {
      try { localStorage.setItem('covuanhi.hideInstall', '1'); } catch (e) { /* bỏ qua */ }
      renderHome();
    });
    app.querySelectorAll('[data-unit]').forEach(b => b.addEventListener('click', () => renderIntro(Number(b.dataset.unit))));
  }

  function notebookCard() {
    const total = Object.keys(Progress.data.reviews).length;
    if (!total) return '';
    const due = Progress.dueReviews().length;
    return `
      <div class="card notebook">
        <span class="big">📒</span>
        <div>
          <b>Sổ ôn tập</b>
          <p>${due ? `Hôm nay có <b>${due}</b> bài cần ôn lại.` : 'Hôm nay chưa có bài nào đến hạn ôn.'}
             Trong sổ có ${total} bài con từng làm sai. Ôn đúng 5 lần cách quãng là thuộc!</p>
        </div>
        ${due ? '<button class="btn primary" data-go="practice">Ôn ngay ▶</button>' : ''}
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Bài học                                                              */
  /* ------------------------------------------------------------------ */

  function renderIntro(index) {
    const u = UNITS[index];
    const all = u.intro.join(' ');
    show(`
      <div class="intro">
        <button class="close" data-go="home">✖</button>
        <div class="card">
          <div class="big-icon">${u.icon}</div>
          <p class="unit-week">${u.week}</p>
          <h1>${u.title} ${speakButton(all)}</h1>
          <p class="goal">🎯 Mục tiêu: ${u.goal}</p>
          ${u.intro.map(p => `<p class="intro-p">${p}</p>`).join('')}
          <button class="btn primary" id="go">Bắt đầu làm bài ▶</button>
        </div>
      </div>`);
    bindNav();
    if (Progress.data.settings.voice) Media.speak(all);
    document.getElementById('go').addEventListener('click', () => {
      const exercises = expandExercises(u.exercises);
      if (!exercises.length) {
        alert('Chưa có bài tập cho bài này. Phụ huynh hãy kiểm tra file js/puzzles.js (xem README).');
        return;
      }
      const ratingBefore = Progress.data.puzzleRating;
      runSession({
        title: u.title,
        icon: u.icon,
        exercises,
        onDone: (stars, mistakes) => {
          Progress.finishLesson(u.id, stars, mistakes);
          renderLessonResult(index, stars, mistakes, ratingBefore);
        }
      });
    });
  }

  function ratingLine(before) {
    const now = Progress.data.puzzleRating;
    if (now === before) return '';
    return `<p>🧠 Điểm giải đố: ${before} → <b>${now}</b> ${now > before ? '📈' : ''}</p>`;
  }

  function renderLessonResult(index, stars, mistakes, ratingBefore) {
    const u = UNITS[index];
    const nextUnlocked = index + 1 < UNITS.length && Progress.isUnlocked(UNITS, index + 1);
    show(`
      <div class="intro">
        <div class="card result">
          <div class="big-icon">${u.icon}</div>
          <h1>Hoàn thành bài "${u.title}"!</h1>
          <div class="result-stars">${starsHtml(stars)}</div>
          <p>${mistakes === 0 ? 'Không sai lần nào. Quá đỉnh! 🏆' : `Con sai ${mistakes} lần. ${stars < 3 ? 'Làm lại để được 3 sao nhé!' : 'Rất tốt!'}`}</p>
          ${ratingLine(ratingBefore)}
          ${u.exercises.some(e => e.type === 'pack') ? '<p class="note">Mỗi lần làm lại sẽ là những bài mới mà con chưa giải.</p>' : ''}
          <div class="row">
            <button class="btn" id="again">🔁 Làm lại</button>
            ${nextUnlocked ? '<button class="btn primary" id="next">Bài tiếp theo ▶</button>' : ''}
            <button class="btn" data-go="home">🗺️ Về lộ trình</button>
          </div>
        </div>
      </div>`);
    bindNav();
    celebrate();
    Media.play('win');
    document.getElementById('again').addEventListener('click', () => renderIntro(index));
    const next = document.getElementById('next');
    if (next) next.addEventListener('click', () => renderIntro(index + 1));
  }

  function starsFor(mistakes, count) {
    if (mistakes <= Math.max(1, Math.floor(count / 6))) return 3;
    if (mistakes <= Math.max(4, Math.floor(count / 2))) return 2;
    return 1;
  }

  /**
   * Chạy một chuỗi bài tập. Dùng cho cả bài học và luyện tập hằng ngày.
   */
  function runSession({ title, icon, exercises, onDone }) {
    let index = 0;
    let mistakes = 0;

    function next() {
      if (index >= exercises.length) {
        onDone(starsFor(mistakes, exercises.length), mistakes);
        return;
      }
      const ex = exercises[index];
      const dots = exercises.map((_, i) => `<i class="${i < index ? 'done' : i === index ? 'now' : ''}"></i>`).join('');
      show(`
        <div class="lesson">
          <div class="lesson-top">
            <button class="close" id="quit" title="Thoát">✖</button>
            <span class="lesson-title">${icon} ${title}${ex.fromReview ? ' <span class="tag">📒 Ôn tập</span>' : ''}</span>
            <span class="dots">${dots}</span>
          </div>
          <div class="lesson-body">
            <div class="board-wrap"><div id="board"></div></div>
            <div class="panel card">
              <div class="prompt" id="prompt"></div>
              <div class="feedback" id="feedback"></div>
              <div class="choices" id="choices"></div>
              <div class="row" id="actions"></div>
              <div class="explain" id="explain"></div>
            </div>
          </div>
        </div>`);
      document.getElementById('quit').addEventListener('click', () => {
        if (confirm('Con muốn dừng bài học à? Tiến độ của bài này sẽ không được lưu.')) renderHome();
      });
      const ui = {
        prompt: document.getElementById('prompt'),
        feedback: document.getElementById('feedback'),
        choices: document.getElementById('choices'),
        actions: document.getElementById('actions'),
        explain: document.getElementById('explain'),
        boardEl: document.getElementById('board')
      };
      // Bài làm sai vào Sổ ôn tập; bài trong sổ làm đúng thì được giãn lịch ôn.
      const record = success => {
        if (REVIEWABLE.has(ex.type) && ex.mode !== 'square' && ex.mode !== 'learn') Progress.reviewRecord(ex, success, title);
      };
      const nextButton = () => {
        ui.actions.innerHTML = '<button class="btn primary" id="nextBtn">Tiếp tục ▶</button>';
        const btn = document.getElementById('nextBtn');
        btn.addEventListener('click', () => { index++; next(); });
        btn.focus();
      };
      const ctx = {
        ui,
        mistake() { mistakes++; },
        solved(firstTry) {
          Progress.addSolved();
          record(firstTry);
          nextButton();
        },
        skipped() {
          record(false);
          nextButton();
        }
      };
      const runner = RUNNERS[ex.type];
      runner(ex, ctx);
    }

    next();
  }

  /** Hiện đề bài; `say` là câu đọc to nếu khác chữ hiển thị (vd. bỏ bớt số độ khó cho dễ nghe). */
  function setPrompt(ui, text, say) {
    const plain = (say || text).replace(/<[^>]+>/g, '');
    ui.prompt.innerHTML = `<span>${text}</span> ${speakButton(plain)}`;
    if (Progress.data.settings.voice) Media.speak(plain);
  }

  // Lời khen/động viên được đọc to (có bản thu sẵn giọng AI).
  function sayPraise(text, extra) {
    if (Progress.data.settings.voice) Media.speak(extra ? `${text} ${extra}` : text);
  }

  function feedback(ui, kind, text) {
    ui.feedback.dataset.stamp = ''; // hủy phần bổ sung của Stockfish cho lời nhắc trước
    ui.feedback.className = 'feedback ' + kind;
    ui.feedback.innerHTML = text;
  }

  /**
   * Hiện lời giải thích của một chuỗi nước (từ Explain.explainLine) trong khung ui.explain,
   * kèm nút xem lại từng bước trên bàn cờ.
   */
  // Thêm dấu chấm cuối câu nếu câu chưa kết thúc bằng dấu câu hay biểu tượng.
  const sentence = t => (/[.!?…]$|\p{Extended_Pictographic}$/u.test(t.trim()) ? t : t + '.');

  function showExplanation(ui, line, orientation, heading = '📖 Vì sao lời giải này đúng?') {
    const mine = line.steps.filter(s => s.who === 'player');
    ui.explain.innerHTML = `
      <h3>${heading}</h3>
      <ol>${mine.map(s => `<li><b>${s.san}</b>: ${sentence(s.text)}</li>`).join('')}</ol>
      <p class="summary">${line.summary}</p>
      ${line.steps.length > 1 ? '<button class="btn" id="stepBtn">▶ Xem lại từng bước</button>' : ''}`;
    const btn = document.getElementById('stepBtn');
    if (btn) btn.addEventListener('click', () => stepViewer(ui, line, orientation));
  }

  function stepViewer(ui, line, orientation, onBack) {
    const game = new Chess(line.steps[0].fenBefore);
    const board = new Board(ui.boardEl, { game, orientation, canMove: () => false, onMove() {} });
    board.locked = true;
    let i = -1;
    ui.explain.innerHTML = `
      <div class="stepper">
        <div class="step-text" id="stepText"></div>
        <div class="row">
          <button class="btn" id="stepPrev">◀ Lùi</button>
          <button class="btn primary" id="stepNext">Tiếp ▶</button>
          ${onBack ? '<button class="btn" id="stepBack">↩ Quay lại giải thích</button>' : ''}
        </div>
      </div>`;
    if (onBack) document.getElementById('stepBack').addEventListener('click', onBack);
    const text = document.getElementById('stepText');
    function render() {
      if (i < 0) {
        game.load(line.steps[0].fenBefore);
        board.setLastMove(null);
        text.innerHTML = 'Thế cờ ban đầu. Bấm <b>Tiếp</b> để xem từng nước.';
      } else {
        const s = line.steps[i];
        game.load(s.fenAfter);
        board.setLastMove(s.from, s.to);
        const who = s.who === 'player' ? '👦 Con' : '🤖 Đối thủ';
        text.innerHTML = `<b>${i + 1}/${line.steps.length} · ${who}: ${s.san}</b><br>${sentence(s.text)}` +
          (i === line.steps.length - 1 ? `<br><br>${line.summary}` : '');
        if (s.who === 'player') Media.play('move');
      }
      board.render();
      document.getElementById('stepPrev').disabled = i < 0;
      document.getElementById('stepNext').disabled = i >= line.steps.length - 1;
    }
    document.getElementById('stepPrev').addEventListener('click', () => { i--; render(); });
    document.getElementById('stepNext').addEventListener('click', () => { i++; render(); });
    render();
  }

  function moveUci(mv) {
    return mv.from + mv.to + (mv.promotion || '');
  }

  function sideText(game) {
    return game.turn() === 'w' ? 'Trắng đi trước' : 'Đen đi trước';
  }

  const RUNNERS = {
    quiz(ex, ctx) {
      const { ui } = ctx;
      if (ex.fen) {
        const game = new Chess(ex.fen);
        new Board(ui.boardEl, { game, orientation: 'w', canMove: () => false, onMove() {} });
      } else {
        ui.boardEl.parentElement.classList.add('no-board');
      }
      setPrompt(ui, ex.question);
      let wrong = 0;
      ui.choices.innerHTML = ex.choices.map((c, i) => `<button class="choice" data-i="${i}">${c}</button>`).join('');
      ui.choices.querySelectorAll('.choice').forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (i === ex.answer) {
          btn.classList.add('right');
          ui.choices.querySelectorAll('.choice').forEach(b => (b.disabled = true));
          Media.play('good');
          const praise = pick(PRAISE);
          feedback(ui, 'good', `${praise}<br>${ex.explain || ''}`);
          sayPraise(praise, ex.explain);
          ctx.solved(wrong === 0);
        } else {
          wrong++;
          ctx.mistake();
          btn.classList.add('wrong');
          btn.disabled = true;
          Media.play('bad');
          const enc = pick(ENCOURAGE);
          feedback(ui, 'bad', enc);
          sayPraise(enc);
        }
      }));
    },

    mate1(ex, ctx) { moveExercise(ex, ctx); },
    move(ex, ctx) { moveExercise(ex, ctx); },

    find(ex, ctx) {
      const { ui } = ctx;
      const game = new Chess(ex.fen);
      const board = new Board(ui.boardEl, {
        game, orientation: 'w', canMove: () => false, onMove() {},
        onSquare: sq => { board.toggleMark(sq); Media.play('move'); }
      });
      setPrompt(ui, ex.prompt);
      let wrong = 0;
      ui.actions.innerHTML = '<button class="btn primary" id="doneBtn">Xong ✔</button><button class="btn" id="clearBtn">Xóa chọn</button>';
      document.getElementById('clearBtn').addEventListener('click', () => board.clearMarks());
      document.getElementById('doneBtn').addEventListener('click', () => {
        const chosen = [...board.marks].sort().join(',');
        const answer = ex.answers.slice().sort().join(',');
        if (chosen === answer) {
          board.locked = true;
          board.flash('good');
          Media.play('good');
          feedback(ui, 'good', pick(PRAISE));
          ctx.solved(wrong === 0);
          return;
        }
        wrong++;
        ctx.mistake();
        board.flash('bad');
        Media.play('bad');
        const missing = ex.answers.filter(s => !board.marks.has(s));
        const extra = [...board.marks].filter(s => !ex.answers.includes(s));
        let msg = pick(ENCOURAGE);
        if (extra.length) msg += `<br>Có ô con chọn chưa đúng.`;
        if (missing.length) msg += `<br>Con còn thiếu ${missing.length} ô.`;
        feedback(ui, 'bad', msg);
        if (wrong >= 2 && missing.length) board.setHint(missing[0]);
      });
    },

    drill(ex, ctx) { drillExercise(ex, ctx); },

    puzzle(ex, ctx) { puzzleExercise(ex, ctx); },

    line(ex, ctx) { lineExercise(ex, ctx); }
  };

  // Câu đọc to khi học khai cuộc (tools/collect_speech.html tạo đúng các câu này để thu sẵn).
  function openingSpeech(who, san, note) {
    return who === 'player' ? `Hãy đi ${san}. ${note}` : `Đối thủ đi ${san}. ${note}`;
  }
  window.CoVuaNhiSpeech = { openingSpeech, puzzleSpeech: (themes, player) => puzzleSpeech({ themes }, player), PRAISE, ENCOURAGE };

  function findLine(lineId) {
    for (const rep of OPENINGS) {
      const line = rep.lines.find(l => l.id === lineId);
      if (line) return { rep, line };
    }
    return null;
  }

  /**
   * Luyện một thế khai cuộc. mode "learn": máy chỉ trước từng nước; mặc định là kiểm tra: bé tự nhớ.
   */
  function lineExercise(ex, ctx) {
    const { ui } = ctx;
    const found = findLine(ex.line);
    const { rep, line } = found;
    const sans = line.moves.split(' ');
    const learn = ex.mode === 'learn';
    const player = rep.color;
    const game = new Chess();
    let step = 0;
    let wrong = 0;
    let timer = null;
    let alive = true;
    cleanup = () => { alive = false; clearTimeout(timer); };
    const say = text => Media.speakAfter(text); // đọc nối tiếp, như thầy giảng từng ý

    const board = new Board(ui.boardEl, {
      game, orientation: player,
      canMove: c => step < sans.length && c === player && game.turn() === player,
      onMove
    });

    // Khung giải thích: ý tưởng chính + mẹo (cố định) và các nước đã đi (cập nhật dần).
    ui.explain.innerHTML = `
      <div class="line-idea">
        <p>💡 <b>Ý tưởng chính:</b> ${line.idea} ${speakButton(`Ý tưởng chính: ${line.idea}`)}</p>
        <p><b>Mẹo nhớ:</b></p><ul>${line.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <p class="moves-line" id="lineMoves">…</p>`;

    function moveList() {
      const h = game.history();
      let s = '';
      for (let i = 0; i < h.length; i += 2) s += `${i / 2 + 1}. ${h[i]} ${h[i + 1] || ''} `;
      document.getElementById('lineMoves').textContent = s || '…';
    }

    function expected() {
      const g = new Chess(game.fen());
      return g.move(sans[step]);
    }

    function finish() {
      board.locked = true;
      const clean = wrong === 0;
      if (!learn) Progress.recordOpening(line.id, clean);
      Media.play('good');
      const msg = learn
        ? 'Con đã đi hết thế khai cuộc! Lần sau hãy thử chế độ Kiểm tra, tự nhớ các nước nhé.'
        : clean ? 'Thuộc lắm! Không sai nước nào.' : `Xong rồi! Con sai ${wrong} lần, hãy ôn lại thêm nhé.`;
      feedback(ui, 'good', msg + (learn ? ' 🎉' : clean ? ' 🏆' : ''));
      say(msg);
      if (learn) say(`Mẹo nhớ. ${line.tips.join(' ')}`);
      ctx.solved(clean);
    }

    // Lượt đối thủ: đợi thầy giảng xong rồi mới đi, sau đó giảng nước của đối thủ.
    async function opponentTurn() {
      board.locked = true;
      await Media.whenIdle();
      await new Promise(r => { timer = setTimeout(r, 600); });
      if (!alive) return;
      const m = game.move(sans[step]);
      board.setLastMove(m.from, m.to);
      board.render();
      Media.play('move');
      const oppSpeech = openingSpeech('opponent', m.san, line.notes[step]);
      feedback(ui, 'info', `🤖 Đối thủ đi <b>${m.san}</b>: ${line.notes[step]} ${speakButton(oppSpeech)}`);
      say(oppSpeech);
      step++;
      board.locked = false;
      advance();
    }

    function advance() {
      moveList();
      if (step >= sans.length) { finish(); return; }
      if (game.turn() !== player) { opponentTurn(); return; }
      if (learn) {
        // Chế độ Học: thầy chỉ nước cần đi, đánh dấu ô xuất phát (khung vàng) và ô đích (vòng xanh).
        const e = expected();
        board.marks = new Set([e.to]);
        board.setHint(e.from);
        const mySpeech = openingSpeech('player', e.san, line.notes[step]);
        ui.prompt.innerHTML = `Hãy đi <b>${e.san}</b> (từ ${e.from} đến ${e.to}): ${line.notes[step]} ${speakButton(mySpeech)}`;
        say(mySpeech);
      }
    }

    function onMove(mv) {
      const e = expected();
      if (mv.from === e.from && mv.to === e.to) {
        const m = game.move(mv);
        board.marks = new Set();
        board.setLastMove(m.from, m.to);
        board.setHint(null);
        Media.play('move');
        feedback(ui, 'good', `✅ <b>${m.san}</b>: ${line.notes[step]} ${speakButton(line.notes[step])}`);
        // Chế độ Học: bé vừa nghe giải thích rồi, chỉ cần khen. Chế độ Kiểm tra: khen và giảng lại lý do.
        Media.stopSpeaking();
        say(learn ? 'Đúng rồi!' : `Đúng rồi! ${line.notes[step]}`);
        step++;
        advance();
        return;
      }
      wrong++;
      ctx.mistake();
      board.flash('bad');
      Media.play('bad');
      feedback(ui, 'bad', `Trong bộ khai cuộc của mình, ở đây ta đi nước khác. Thử lại nhé!${wrong >= 2 ? `<br>Gợi ý: quân ở ô <b>${e.from}</b>.` : ''}`);
      Media.stopSpeaking();
      say('Trong bộ khai cuộc của mình, ở đây ta đi nước khác. Thử lại nhé!');
      if (wrong >= 2) { say(`Gợi ý: hãy để ý quân ở ô ${e.from}.`); board.setHint(e.from); }
      else board.render();
    }

    setPrompt(ui, learn
      ? `👀 Học thế khai cuộc: <b>${line.title}</b>. Con cầm ${player === 'w' ? 'Trắng' : 'Đen'}, làm theo hướng dẫn.`
      : `🧪 Kiểm tra: <b>${line.title}</b>. Con cầm ${player === 'w' ? 'Trắng' : 'Đen'}. Hãy tự đi đúng các nước đã học!`);
    if (learn) say(`Ý tưởng chính: ${line.idea}`);
    advance();
  }

  // Câu đọc to của bài Lichess: bỏ số độ khó để chỉ có vài mẫu câu, tất cả đều có bản thu sẵn.
  function puzzleSpeech(ex, player) {
    const n = (ex.themes.match(/mateIn(\d)/) || [])[1];
    return `${n ? `Chiếu hết trong ${n} nước!` : 'Tìm nước tốt nhất!'} Con cầm quân ${player === 'w' ? 'Trắng' : 'Đen'}.`;
  }

  function puzzlePrompt(ex, player) {
    const side = player === 'w' ? 'Trắng' : 'Đen';
    const n = (ex.themes.match(/mateIn(\d)/) || [])[1];
    const task = n ? `Chiếu hết trong ${n} nước!` : 'Tìm nước tốt nhất!';
    return `${task} <small>(Con cầm quân ${side} · độ khó ${ex.rating})</small>`;
  }

  /**
   * Bài tập từ kho Lichess: máy đi nước đầu của đối thủ, sau đó bé và máy đi xen kẽ theo lời giải.
   * Nước cuối cùng: mọi nước chiếu hết đều được chấp nhận.
   */
  function puzzleExercise(ex, ctx) {
    const { ui } = ctx;
    const game = new Chess(ex.fen);
    const line = ex.moves.split(' ');
    const player = game.turn() === 'w' ? 'b' : 'w';
    const toMove = uci => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    let step = 0;
    let wrong = 0;
    let usedHint = false;
    let done = false;
    let timer = null;
    cleanup = () => clearTimeout(timer);

    const board = new Board(ui.boardEl, {
      game,
      orientation: player,
      canMove: c => !done && c === player && game.turn() === player,
      onMove
    });
    board.locked = true;

    function autoPlay() {
      const m = game.move(toMove(line[step]));
      step++;
      board.setLastMove(m.from, m.to);
      board.render();
      Media.play(m.captured ? 'capture' : 'move');
    }

    function finish(success) {
      done = true;
      board.locked = true;
      const before = Progress.data.puzzleRating;
      Progress.recordPuzzle(ex.id, ex.rating, success && wrong === 0 && !usedHint);
      const diff = Progress.data.puzzleRating - before;
      const change = `🧠 Điểm giải đố: ${Progress.data.puzzleRating} (${diff >= 0 ? '+' : ''}${diff})`;
      if (success) {
        board.flash('good');
        setTimeout(() => Media.play('good'), 120);
        const praise = pick(PRAISE);
        feedback(ui, 'good', `${praise} ${game.isCheckmate() ? 'Chiếu hết!' : ''}<br>${change}`);
        sayPraise(praise);
        ctx.solved(wrong === 0 && !usedHint);
      } else {
        feedback(ui, 'info', `Đây là lời giải. Lần sau con sẽ tìm ra! 💪<br>${change}`);
        ctx.skipped();
      }
      showExplanation(ui, Explain.explainLine(ex.fen, line, player, 1), player);
    }

    function onMove(mv) {
      const expected = line[step];
      const fenBefore = game.fen();
      const result = game.move(mv);
      board.setLastMove(mv.from, mv.to);
      board.render();
      Media.play(result.captured ? 'capture' : 'move');
      const last = step === line.length - 1;
      if (matchesAnswer(expected, mv) || (last && game.isCheckmate())) {
        step++;
        board.setHint(null);
        if (step >= line.length) { finish(true); return; }
        board.locked = true;
        feedback(ui, 'good', 'Đúng rồi! 👍 Xem đối thủ đáp lại…');
        timer = setTimeout(() => {
          autoPlay();
          board.locked = false;
          feedback(ui, 'info', 'Tìm nước tiếp theo nào!');
        }, 700);
        return;
      }
      wrong++;
      ctx.mistake();
      board.flash('bad');
      Media.play('bad');
      let msg = `${pick(ENCOURAGE)}<br><small>${Explain.whyWrong(fenBefore, moveUci(mv))}</small>`;
      if (game.isCheckmate()) msg = 'Chiếu hết rồi! Nhưng hãy thử theo lời giải khác nhé.';
      feedback(ui, 'bad', msg);
      if (!game.isGameOver()) addRefutation(ui, game.fen());
      board.locked = true;
      timer = setTimeout(() => {
        game.undo();
        board.locked = false;
        const prev = game.history({ verbose: true }).slice(-1)[0];
        board.setLastMove(prev ? prev.from : null, prev ? prev.to : null);
        if (wrong >= 2) board.setHint(expectedFrom());
        else board.render();
        if (wrong >= 3) showSolveButton();
      }, 1100);
    }

    function expectedFrom() {
      return line[step].slice(0, 2);
    }

    function showSolveButton() {
      if (document.getElementById('solveBtn')) return;
      ui.actions.insertAdjacentHTML('beforeend', '<button class="btn" id="solveBtn">👀 Xem đáp án</button>');
      document.getElementById('solveBtn').addEventListener('click', () => {
        done = true;
        board.locked = true;
        board.setHint(null);
        ui.actions.innerHTML = '';
        const playRest = () => {
          if (step >= line.length) { finish(false); return; }
          autoPlay();
          timer = setTimeout(playRest, 800);
        };
        playRest();
      });
    }

    setPrompt(ui, puzzlePrompt(ex, player), puzzleSpeech(ex, player));
    ui.actions.innerHTML = '<button class="btn" id="hintBtn">💡 Gợi ý</button>';
    document.getElementById('hintBtn').addEventListener('click', () => {
      if (done || game.turn() !== player) return;
      if (!usedHint) { usedHint = true; ctx.mistake(); }
      board.setHint(expectedFrom());
      feedback(ui, 'info', `Gợi ý: hãy để ý quân ở ô <b>${expectedFrom()}</b>.`);
    });
    feedback(ui, 'info', 'Xem nước đi của đối thủ…');
    timer = setTimeout(() => {
      autoPlay();
      board.locked = false;
      feedback(ui, '', '');
    }, 900);
  }

  function moveExercise(ex, ctx) {
    const { ui } = ctx;
    const game = new Chess(ex.fen);
    const player = game.turn();
    let wrong = 0;
    let usedHint = false;
    let done = false;

    const solution = ex.type === 'mate1'
      ? firstMate(ex.fen)
      : { from: ex.answers[0].slice(0, 2), to: ex.answers[0].slice(2, 4), promotion: ex.answers[0][4] };

    const board = new Board(ui.boardEl, {
      game,
      orientation: player,
      canMove: c => !done && c === player,
      onMove(mv) {
        const result = game.move(mv);
        board.setLastMove(mv.from, mv.to);
        board.render();
        Media.play(result.captured ? 'capture' : 'move');
        const direct = ex.type === 'mate1' ? game.isCheckmate() : ex.answers.some(a => matchesAnswer(a, mv));
        if (direct || !ex.evalCheck) { outcome(mv, direct); return; }
        // Bài lấy từ ván của bé: nước khác cũng tốt gần bằng nước của máy thì vẫn tính là đúng.
        board.locked = true;
        feedback(ui, 'info', 'Máy đang kiểm tra nước của con… 🤔');
        isGoodAlternative(moveUci(mv)).then(ok => outcome(mv, ok));
      }
    });

    async function isGoodAlternative(uci) {
      if (Engine.available) {
        const c = await Engine.compare(ex.fen, uci, { depth: 11, movetime: 700 });
        if (c) return Explain.winPct(c.playedScore) >= Explain.winPct(c.bestScore) - 6;
      }
      const a = Bot.analyzePosition(ex.fen, uci);
      return a.playedScore >= a.bestScore - 60;
    }

    function outcome(mv, ok) {
        const uci = moveUci(mv);
        if (ok) {
          done = true;
          board.locked = true;
          board.flash('good');
          setTimeout(() => Media.play('good'), 120);
          const praise = pick(PRAISE);
          feedback(ui, 'good', `${praise} ${ex.type === 'mate1' ? 'Chiếu hết!' : ''}`);
          sayPraise(praise, ex.explain);
          explainSingle(uci);
          ctx.solved(wrong === 0 && !usedHint);
          return;
        }
        wrong++;
        ctx.mistake();
        board.flash('bad');
        Media.play('bad');
        let msg = `${pick(ENCOURAGE)}<br><small>${Explain.whyWrong(ex.fen, uci)}</small>`;
        if (ex.type === 'mate1' && game.isStalemate()) msg = 'Ối, đó là hòa pat! Vua Đen phải bị chiếu cơ. 😅';
        else if (ex.type === 'mate1' && game.inCheck()) msg = 'Có chiếu rồi, nhưng vua vẫn chạy được. Tìm nước khác nhé!';
        else if (ex.wrongHint) msg = ex.wrongHint;
        feedback(ui, 'bad', msg);
        if (ex.type !== 'mate1') addRefutation(ui, game.fen());
        board.locked = true;
        setTimeout(() => {
          game.undo();
          board.locked = false;
          board.setLastMove(...startLast);
          if (wrong >= 2) board.setHint(ex.hint || solution.from);
          else board.render();
          if (wrong >= 3) showSolveButton();
        }, 1100);
    }

    // Thế cờ có ô bắt tốt qua đường: tô nước tốt vừa đi 2 ô để bé thấy rõ.
    const startLast = epLastMove(ex.fen);
    board.setLastMove(...startLast);
    board.render();
    setPrompt(ui, `${ex.prompt} <small>(${sideText(game)})</small>`);
    ui.actions.innerHTML = '<button class="btn" id="hintBtn">💡 Gợi ý</button>';
    document.getElementById('hintBtn').addEventListener('click', () => {
      if (!usedHint) { usedHint = true; ctx.mistake(); }
      board.setHint(ex.hint || solution.from);
      feedback(ui, 'info', `Gợi ý: hãy để ý quân ở ô <b>${ex.hint || solution.from}</b>.`);
    });

    function showSolveButton() {
      if (document.getElementById('solveBtn')) return;
      ui.actions.insertAdjacentHTML('beforeend', '<button class="btn" id="solveBtn">👀 Xem đáp án</button>');
      document.getElementById('solveBtn').addEventListener('click', () => {
        done = true;
        const m = game.move(solution);
        board.setLastMove(m.from, m.to);
        board.setHint(null);
        board.locked = true;
        feedback(ui, 'info', `Đáp án là <b>${m.san}</b>. Lần sau con sẽ tìm ra! 💪`);
        explainSingle(moveUci(m));
        ctx.skipped();
      });
    }

    // Giải thích nước đúng: câu giảng soạn sẵn nếu có, nếu không thì để "thầy giải thích" tự phân tích.
    function explainSingle(uci) {
      if (ex.deep) { showDeepExplanation(ui, ex, player, uci); return; }
      const auto = Explain.describeMove(ex.fen, uci);
      ui.explain.innerHTML = `<h3>📖 Vì sao?</h3><p><b>${auto.san}</b>: ${ex.explain || sentence(auto.text)}</p>`;
    }
  }

  /**
   * Giải thích sâu cho một sai lầm trong ván của bé (dữ liệu Stockfish lưu trong ex.deep):
   * máy đánh giá thế cờ thế nào, đối thủ trừng phạt nước của bé ra sao, ý tưởng của nước tốt nhất,
   * và các gợi ý chiến lược.
   */
  function showDeepExplanation(ui, ex, player, foundUci) {
    const d = ex.deep;
    const bad = Explain.explainLine(ex.fen, d.playedPv, player);
    const good = Explain.explainLine(ex.fen, d.bestPv, player);
    const lineHtml = line => line.steps.slice(0, 4).map(s =>
      `<li>${s.who === 'player' ? '👦' : '🤖'} <b>${s.san}</b>: ${sentence(s.text)}</li>`).join('');
    const foundOther = foundUci && foundUci.slice(0, 4) !== d.bestPv[0].slice(0, 4);
    ui.explain.innerHTML = `
      <h3>📖 Vì sao?</h3>
      ${foundOther ? '<p>Nước con vừa tìm cũng tốt! Máy còn gợi ý thêm một cách khác:</p>' : ''}
      <p>Máy đánh giá: nếu đi <b>${d.bestSan}</b> thì <b>${Explain.evalText(d.bestScore, player)}</b>.
         Sau nước <b>${d.kidSan}</b> của con thì <b>${Explain.evalText(d.playedScore, player)}</b>.</p>
      ${d.playedPv.length > 1 ? `<h4>❌ Nếu đi ${d.kidSan}, máy dự đoán:</h4><ol>${lineHtml(bad)}</ol>` : ''}
      <h4>✅ Ý tưởng của ${d.bestSan}:</h4><ol>${lineHtml(good)}</ol>
      ${d.hints.length ? `<h4>💡 Bài học về thế cờ:</h4><ul>${d.hints.map(h => `<li>${sentence(h)}</li>`).join('')}</ul>` : ''}
      <div class="row">
        <button class="btn" id="seeGood">▶ Xem nước tốt từng bước</button>
        ${d.playedPv.length > 1 ? '<button class="btn" id="seeBad">▶ Xem vì sao nước của con chưa tốt</button>' : ''}
      </div>`;
    const back = () => showDeepExplanation(ui, ex, player, foundUci);
    document.getElementById('seeGood').addEventListener('click', () => stepViewer(ui, good, player, back));
    const seeBad = document.getElementById('seeBad');
    if (seeBad) seeBad.addEventListener('click', () => stepViewer(ui, bad, player, back));
  }

  /** Khi bé đi sai: hỏi Stockfish đối thủ sẽ đáp lại thế nào, rồi bổ sung vào lời nhắc. */
  function addRefutation(ui, fenAfter) {
    if (!Engine.available) return;
    const box = ui.feedback;
    const stamp = String(Math.random());
    box.dataset.stamp = stamp;
    Engine.analyze(fenAfter, { depth: 10, movetime: 400 }).then(r => {
      if (!r || !r.best || !box.isConnected || box.dataset.stamp !== stamp) return;
      const reply = Explain.describeMove(fenAfter, r.best);
      box.insertAdjacentHTML('beforeend', `<br><small>🤖 Máy thấy đối thủ sẽ đáp <b>${reply.san}</b>: ${sentence(reply.text)}</small>`);
    });
  }

  function drillExercise(ex, ctx) {
    const { ui } = ctx;
    let fails = 0;
    let timer = null;
    cleanup = () => clearTimeout(timer);

    function start() {
      const game = new Chess(ex.fen);
      const player = game.turn();
      const bot = player === 'w' ? 'b' : 'w';
      let playerMoves = 0;
      let over = false;

      const board = new Board(ui.boardEl, {
        game, orientation: player,
        canMove: c => !over && c === player && game.turn() === player,
        onMove(mv) {
          const m = game.move(mv);
          playerMoves++;
          board.setLastMove(m.from, m.to);
          board.render();
          Media.play(m.captured ? 'capture' : 'move');
          if (check(m, true)) return;
          status(`Máy đang nghĩ... 🤔`);
          timer = setTimeout(botTurn, 450);
        }
      });

      function botTurn() {
        const m = Bot.chooseMove(game.fen(), ex.botLevel || 2);
        if (!m) return;
        game.move(m);
        board.setLastMove(m.from, m.to);
        board.render();
        Media.play(m.captured ? 'capture' : 'move');
        if (check(m, false)) return;
        const left = ex.maxMoves ? ` Còn ${ex.maxMoves - playerMoves} nước.` : '';
        status(`Đến lượt con!${left}`);
        if (ex.goal === 'win' && Progress.data.settings.hangingWarning) {
          const danger = piecesInDanger(game, player);
          if (danger.length) {
            board.setHint(danger[0].square);
            status(`⚠️ Cẩn thận: ${PIECE_NAME[danger[0].type]} ở ${danger[0].square} đang bị tấn công!${left}`);
          }
        }
      }

      // Trả về true nếu bài tập đã kết thúc.
      function check(m, byPlayer) {
        const g = ex.goal;
        if (game.isCheckmate()) {
          if (byPlayer && (g === 'mate' || g === 'win')) return win('Chiếu hết! 🎉');
          return lose(byPlayer ? 'Ván cờ kết thúc.' : 'Máy chiếu hết mất rồi!');
        }
        if (g === 'promote' && m.promotion) {
          return byPlayer ? win('Phong hậu thành công! 👑') : lose('Máy phong hậu trước mất rồi!');
        }
        if (game.isStalemate()) return lose('Hòa pat mất rồi! Nhớ chừa ô cho vua đối phương nhé.');
        if (game.isDraw()) return lose('Ván cờ hòa.');
        if (g === 'promote' && !game.board().flat().some(p => p && p.type === 'p' && p.color === player)) {
          return lose('Con hết tốt rồi!');
        }
        if (byPlayer && ex.maxMoves && playerMoves >= ex.maxMoves) return lose(`Hết ${ex.maxMoves} nước rồi!`);
        return false;
      }

      function win(text) {
        over = true;
        board.locked = true;
        board.flash('good');
        Media.play('win');
        celebrate();
        status('');
        feedback(ui, 'good', `${text} ${pick(PRAISE)}`);
        ui.actions.innerHTML = '';
        ctx.solved(fails === 0);
        return true;
      }

      function lose(text) {
        over = true;
        board.locked = true;
        fails++;
        ctx.mistake();
        Media.play('bad');
        feedback(ui, 'bad', `${text} Thử lại nhé! 💪`);
        ui.actions.innerHTML = '<button class="btn primary" id="retryBtn">🔁 Chơi lại</button>' +
          (fails >= 2 ? '<button class="btn" id="skipBtn">Bỏ qua ⏭</button>' : '');
        document.getElementById('retryBtn').addEventListener('click', start);
        const skip = document.getElementById('skipBtn');
        if (skip) skip.addEventListener('click', () => ctx.skipped());
        return true;
      }

      function status(text) {
        document.getElementById('drillStatus').textContent = text;
      }

      feedback(ui, '', '<span id="drillStatus"></span>');
      ui.actions.innerHTML = '<button class="btn" id="restartBtn">🔁 Chơi lại từ đầu</button>';
      document.getElementById('restartBtn').addEventListener('click', () => { clearTimeout(timer); start(); });
      status(ex.maxMoves ? `Đến lượt con! Còn ${ex.maxMoves} nước.` : 'Đến lượt con!');
      if (game.turn() !== player) timer = setTimeout(botTurn, 450);
    }

    setPrompt(ui, ex.prompt);
    start();
  }

  /* ------------------------------------------------------------------ */
  /* Luyện tập hằng ngày                                                  */
  /* ------------------------------------------------------------------ */

  function startPractice() {
    if (!Progress.data.name) { renderWelcome(); return; }
    // Chưa xong Giai đoạn 1: ôn bài cũ + vài bài theo điểm. Xong rồi: toàn bộ là bài theo điểm giải đố.
    const learned = PHASE1.filter(u => Progress.lesson(u.id));
    const phase1Done = learned.length === PHASE1.length;
    const source = learned.length ? learned : PHASE1.slice(0, 2);
    const pool = [];
    for (const u of source) {
      for (const ex of u.exercises) {
        if (ex.type === 'mate1' || ex.type === 'move' || (ex.type === 'find' && ex.mode === 'hanging') || (ex.type === 'quiz' && ex.fen)) pool.push(ex);
        if (ex.type === 'gen') pool.push({ ...ex, count: 2 });
      }
    }
    // Bài đến hạn trong Sổ ôn tập luôn được ôn trước (tối đa 6 bài mỗi lần).
    const due = Progress.dueReviews().slice(0, 6).map(r => ({ ...r.ex, fromReview: true }));
    const room = 10 - due.length;
    const reviewCount = Math.min(room, phase1Done ? 0 : learned.length >= 6 ? 6 : 10);
    const review = expandExercises(shuffle(pool).slice(0, reviewCount)).slice(0, reviewCount);
    const rest = room - review.length;
    const chosen = due.concat(review, PUZZLES.pool.length && rest > 0 ? adaptivePuzzles(rest) : []);
    const ratingBefore = Progress.data.puzzleRating;
    runSession({
      title: 'Luyện tập hôm nay',
      icon: '🎯',
      exercises: chosen,
      onDone: (stars, mistakes) => {
        show(`
          <div class="intro">
            <div class="card result">
              <div class="big-icon">🎯</div>
              <h1>Xong bài luyện tập hôm nay!</h1>
              <div class="result-stars">${starsHtml(stars)}</div>
              <p>Con giải ${chosen.length} bài, sai ${mistakes} lần.</p>
              ${ratingLine(ratingBefore)}
              <div class="row">
                <button class="btn primary" data-go="practice">🔁 Luyện thêm</button>
                <button class="btn" data-go="train">⚔️ Luyện theo đòn</button>
              </div>
            </div>
          </div>`);
        bindNav();
        celebrate();
        Media.play('win');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Luyện theo từng đòn chiến thuật                                      */
  /* ------------------------------------------------------------------ */

  // Mỗi đòn là một gói bài Lichess; bé chọn đòn muốn luyện, máy chọn bài vừa sức.
  const TACTICS = [
    { pack: 'hanging', icon: '🍒', title: 'Ăn quân bị treo', tip: 'Quân nào không được bảo vệ? Ăn nó!' },
    { pack: 'mate1', icon: '⚡', title: 'Chiếu hết 1 nước', tip: 'Tìm nước chiếu mà vua không chạy được.' },
    { pack: 'fork', icon: '🍴', title: 'Chĩa đôi', tip: 'Một quân tấn công hai quân cùng lúc.' },
    { pack: 'pinskewer', icon: '📌', title: 'Ghim và xiên', tip: 'Quân phía trước không dám chạy vì quân to phía sau.' },
    { pack: 'discovered', icon: '💥', title: 'Tấn công phát hiện', tip: 'Dời một quân đi để quân phía sau tấn công.' },
    { pack: 'deflection', icon: '🧲', title: 'Lôi kéo, đánh lạc hướng', tip: 'Kéo quân phòng thủ ra khỏi chỗ của nó.' },
    { pack: 'defender', icon: '🛡️', title: 'Diệt quân phòng thủ, bẫy quân', tip: 'Ăn quân đang bảo vệ, hoặc nhốt quân không cho chạy.' },
    { pack: 'sacrifice', icon: '🎁', title: 'Thí quân', tip: 'Cho đi một quân để chiếu hết hoặc lời to hơn.' },
    { pack: 'xray', icon: '🔦', title: 'Xuyên quân, chặn đường', tip: 'Nhìn xuyên qua quân cờ theo đường thẳng, đường chéo.' },
    { pack: 'quiet', icon: '🤫', title: 'Nước trung gian, nước yên lặng', tip: 'Nước bất ngờ: không chiếu, không ăn quân.' },
    { pack: 'matepatterns', icon: '👑', title: 'Mẫu chiếu hết', tip: 'Chiếu hàng cuối, chiếu ngạt, và các mẫu nổi tiếng.' },
    { pack: 'mate2', icon: '♛', title: 'Chiếu hết 2 nước', tip: 'Nước đầu thường là chiếu hoặc thí quân.' },
    { pack: 'mate3', icon: '🏆', title: 'Chiếu hết 3 nước', tip: 'Tính trước 3 nước, ép vua từng bước.' },
    { pack: 'attack', icon: '⚔️', title: 'Tấn công vua', tip: 'Dồn quân về phía vua đối thủ.' }
  ].filter(t => (PUZZLES.packs[t.pack] || []).length);

  /** Bài trong gói gần với điểm giải đố của bé: bài chưa làm trước, rồi bài từng sai; xếp dễ trước khó sau. */
  function pickNearRating(packId, count) {
    const seen = Progress.data.puzzleSeen;
    const rating = Progress.data.puzzleRating;
    const rank = p => (!(p[0] in seen) ? 0 : seen[p[0]] === 0 ? 1 : 2);
    const list = (PUZZLES.packs[packId] || []).slice();
    list.sort((a, b) => rank(a) - rank(b) || Math.abs(a[3] - rating) - Math.abs(b[3] - rating));
    return list.slice(0, count).sort((a, b) => a[3] - b[3]).map(toPuzzle);
  }

  function renderTraining() {
    if (!Progress.data.name) { renderWelcome(); return; }
    const seen = Progress.data.puzzleSeen;
    const due = Progress.dueReviews().length;
    const cards = TACTICS.map((t, i) => {
      const items = PUZZLES.packs[t.pack];
      const solved = items.filter(p => seen[p[0]] > 0).length;
      const pct = Math.round((solved / items.length) * 100);
      return `
        <button class="tactic" data-tactic="${i}">
          <span class="tactic-icon">${t.icon}</span>
          <b>${t.title}</b>
          <small>${t.tip}</small>
          <span class="tactic-bar"><i style="width:${pct}%"></i></span>
          <small>Đã giải ${solved}/${items.length} bài</small>
        </button>`;
    }).join('');
    show(`
      ${header('train')}
      <main class="training">
        <div class="card hello">
          <h1>🎯 Luyện tập</h1>
          <p>Mỗi ngày làm một lượt <b>Luyện tập hôm nay</b> (ôn bài cũ và bài vừa sức${due ? `, hôm nay có <b>${due}</b> bài cần ôn` : ''}).
             Muốn giỏi đòn nào thì luyện thêm đòn đó ở bên dưới.</p>
          <button class="btn primary" data-go="practice">▶ Luyện tập hôm nay</button>
        </div>
        <div class="card">
          <h2>⚔️ Luyện theo đòn chiến thuật</h2>
          <p class="note">Mỗi lượt 10 bài vừa sức con. Giải càng nhiều, bài càng khó dần.</p>
          <div class="tactics">${cards}</div>
        </div>
      </main>`);
    bindNav();
    app.querySelectorAll('[data-tactic]').forEach(b => b.addEventListener('click', () => startTactic(TACTICS[Number(b.dataset.tactic)])));
  }

  function startTactic(t) {
    const chosen = pickNearRating(t.pack, 10);
    const ratingBefore = Progress.data.puzzleRating;
    runSession({
      title: t.title,
      icon: t.icon,
      exercises: chosen,
      onDone: (stars, mistakes) => {
        show(`
          <div class="intro">
            <div class="card result">
              <div class="big-icon">${t.icon}</div>
              <h1>Xong lượt luyện ${t.title}!</h1>
              <div class="result-stars">${starsHtml(stars)}</div>
              <p>Con giải ${chosen.length} bài, sai ${mistakes} lần.</p>
              ${ratingLine(ratingBefore)}
              <div class="row">
                <button class="btn primary" id="again">🔁 Luyện tiếp đòn này</button>
                <button class="btn" data-go="train">⚔️ Chọn đòn khác</button>
              </div>
            </div>
          </div>`);
        bindNav();
        document.getElementById('again').addEventListener('click', () => startTactic(t));
        celebrate();
        Media.play('win');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Bộ khai cuộc                                                         */
  /* ------------------------------------------------------------------ */

  function lineStatus(lineId) {
    const rec = Progress.data.openings[lineId];
    if (!rec) return { label: 'Chưa học', cls: '' };
    if (rec.clean >= 2) return { label: '✅ Đã thuộc', cls: 'ok' };
    return { label: `Đã kiểm tra ${rec.runs} lần, đúng hết ${rec.clean} lần`, cls: 'mid' };
  }

  function renderOpenings() {
    if (!Progress.data.name) { renderWelcome(); return; }
    const reps = OPENINGS.map(rep => `
      <section class="card repertoire">
        <h2>${rep.icon} ${rep.title} ${speakButton(rep.intro.join(' '))}</h2>
        ${rep.intro.map(p => `<p>${p}</p>`).join('')}
        <div class="lines">
          ${rep.lines.map(l => {
            const st = lineStatus(l.id);
            const plies = l.moves.split(' ').length;
            return `
              <div class="line-card ${st.cls}">
                <b>${l.title}</b>
                <span class="line-idea-short">💡 ${l.idea}</span>
                <small>${Math.ceil(plies / 2)} nước · ${st.label}</small>
                <div class="row">
                  <button class="btn" data-learn="${l.id}">👀 Học</button>
                  <button class="btn primary" data-test="${l.id}">🧪 Kiểm tra</button>
                </div>
              </div>`;
          }).join('')}
        </div>
        <button class="btn" data-testall="${rep.id}">🔁 Kiểm tra cả bộ</button>
      </section>`).join('');
    show(`
      ${header('openings')}
      <main class="openings">
        <div class="card hello">
          <h1>📚 Bộ khai cuộc thi đấu</h1>
          <p>Mỗi thế khai cuộc: bấm <b>👀 Học</b> để máy chỉ từng nước kèm lý do, rồi <b>🧪 Kiểm tra</b> để tự nhớ.
             Kiểm tra đúng hết 2 lần là thuộc. Các thế đã học sẽ tự quay lại trong Sổ ôn tập để con không quên.</p>
        </div>
        ${reps}
      </main>`);
    bindNav();
    const run = (exercises, title) => runSession({
      title, icon: '📚', exercises,
      onDone: () => renderOpenings()
    });
    app.querySelectorAll('[data-learn]').forEach(b => b.addEventListener('click', () =>
      run([{ type: 'line', line: b.dataset.learn, mode: 'learn' }], findLine(b.dataset.learn).line.title)));
    app.querySelectorAll('[data-test]').forEach(b => b.addEventListener('click', () =>
      run([{ type: 'line', line: b.dataset.test }], findLine(b.dataset.test).line.title)));
    app.querySelectorAll('[data-testall]').forEach(b => b.addEventListener('click', () => {
      const rep = OPENINGS.find(r => r.id === b.dataset.testall);
      run(rep.lines.map(l => ({ type: 'line', line: l.id })), rep.title);
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Chơi với máy                                                         */
  /* ------------------------------------------------------------------ */

  let playPrefs = { level: 1, color: 'w' };

  function renderPlaySetup() {
    if (!Progress.data.name) { renderWelcome(); return; }
    const games = Progress.data.games;
    // Cấp Đại bàng, Rồng chỉ hiện khi Stockfish chạy được.
    const levels = Object.entries(Bot.LEVELS).filter(([, cfg]) => !cfg.engineSkill || Engine.available).map(([lv, cfg]) => {
      const mine = games.filter(g => g.level === Number(lv));
      const wins = mine.filter(g => g.result === 'win').length;
      return `
        <button class="level ${playPrefs.level === Number(lv) ? 'active' : ''}" data-level="${lv}">
          <span class="big">${cfg.icon}</span><b>${cfg.name}</b>
          <small>${mine.length ? `Thắng ${wins}/${mine.length} ván` : 'Chưa chơi'}</small>
        </button>`;
    }).join('');
    show(`
      ${header('play')}
      <main class="play-setup">
        <div class="card">
          <h2>Chọn đối thủ</h2>
          <div class="levels">${levels}</div>
          <h2>Con cầm quân</h2>
          <div class="row">
            <button class="btn ${playPrefs.color === 'w' ? 'primary' : ''}" data-color="w">♔ Trắng</button>
            <button class="btn ${playPrefs.color === 'b' ? 'primary' : ''}" data-color="b">♚ Đen</button>
            <button class="btn ${playPrefs.color === 'r' ? 'primary' : ''}" data-color="r">🎲 Ngẫu nhiên</button>
          </div>
          <label class="check"><input type="checkbox" id="warn" ${Progress.data.settings.hangingWarning ? 'checked' : ''}>
            👀 Nhắc khi con sắp để mất quân</label>
          <button class="btn primary big-btn" id="startGame">Bắt đầu ván cờ ▶</button>
        </div>
        <div class="card import-card">
          <h2>📝 Xem lại ván cờ thật</h2>
          <p>Con vừa đánh một ván ở câu lạc bộ hay giải đấu? Nhập biên bản để máy tìm những nước chưa tốt và cùng con sửa lại.</p>
          <button class="btn" id="importGame">Nhập biên bản ván cờ ▶</button>
        </div>
      </main>`);
    document.getElementById('importGame').addEventListener('click', renderImportGame);
    bindNav();
    app.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { playPrefs.level = Number(b.dataset.level); renderPlaySetup(); }));
    app.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => { playPrefs.color = b.dataset.color; renderPlaySetup(); }));
    document.getElementById('warn').addEventListener('change', e => Progress.setSetting('hangingWarning', e.target.checked));
    document.getElementById('startGame').addEventListener('click', () => {
      const color = playPrefs.color === 'r' ? (Math.random() < 0.5 ? 'w' : 'b') : playPrefs.color;
      renderGame(playPrefs.level, color);
    });
  }

  function renderGame(level, player) {
    const cfg = Bot.LEVELS[level];
    const game = new Chess();
    const bot = player === 'w' ? 'b' : 'w';
    let timer = null;
    let over = false;
    let pendingBot = false;

    show(`
      <div class="lesson">
        <div class="lesson-top">
          <button class="close" id="quit" title="Thoát">✖</button>
          <span class="lesson-title">${cfg.icon} Đấu với ${cfg.name}</span>
        </div>
        <div class="lesson-body">
          <div class="board-wrap"><div id="board"></div></div>
          <div class="panel card">
            <div class="prompt" id="status"></div>
            <div class="feedback" id="feedback"></div>
            <div class="row" id="actions">
              <button class="btn" id="hintBtn">💡 Gợi ý</button>
              <button class="btn" id="undoBtn">↩️ Đi lại</button>
              <button class="btn" id="newBtn">🔁 Ván mới</button>
              <button class="btn" id="reviewBtn">🔍 Xem lại ván</button>
            </div>
            <ol class="moves" id="moves"></ol>
          </div>
        </div>
      </div>`);
    cleanup = () => clearTimeout(timer);
    const ui = { status: document.getElementById('status'), feedback: document.getElementById('feedback'), moves: document.getElementById('moves') };

    const board = new Board(document.getElementById('board'), {
      game, orientation: player,
      canMove: c => !over && !pendingBot && c === player && game.turn() === player,
      onMove(mv) {
        const m = game.move(mv);
        afterMove(m);
        if (over) return;
        if (Progress.data.settings.hangingWarning) {
          const danger = piecesInDanger(game, player);
          if (danger.length) {
            const p = danger[0];
            pendingBot = true;
            board.setHint(p.square);
            setFeedback('warn', `🤔 Ồ! ${PIECE_NAME[p.type][0].toUpperCase() + PIECE_NAME[p.type].slice(1)} của con ở <b>${p.square}</b> có thể bị ăn. Con có muốn đi lại không?
              <div class="row"><button class="btn" id="takeBack">↩️ Đi lại</button><button class="btn" id="goOn">Cứ đi tiếp ▶</button></div>`);
            document.getElementById('takeBack').addEventListener('click', () => {
              game.undo();
              pendingBot = false;
              board.setHint(null);
              const h = game.history({ verbose: true }).slice(-1)[0];
              board.setLastMove(h ? h.from : null, h ? h.to : null);
              board.render();
              renderMoves();
              setFeedback('', '');
              setStatus();
            });
            document.getElementById('goOn').addEventListener('click', () => {
              pendingBot = false;
              board.setHint(null);
              setFeedback('', '');
              queueBot();
            });
            return;
          }
        }
        queueBot();
      }
    });

    function setFeedback(kind, html) {
      ui.feedback.className = 'feedback ' + kind;
      ui.feedback.innerHTML = html;
    }

    function setStatus(text) {
      if (text) { ui.status.textContent = text; return; }
      ui.status.textContent = game.turn() === player
        ? (game.inCheck() ? 'Con đang bị chiếu! Hãy cứu vua.' : 'Đến lượt con!')
        : 'Máy đang nghĩ... 🤔';
    }

    function renderMoves() {
      const h = game.history();
      let html = '';
      for (let i = 0; i < h.length; i += 2) html += `<li>${h[i]} ${h[i + 1] || ''}</li>`;
      ui.moves.innerHTML = html;
      ui.moves.scrollTop = ui.moves.scrollHeight;
    }

    function afterMove(m) {
      board.setLastMove(m.from, m.to);
      board.setHint(null);
      Media.play(m.captured ? 'capture' : 'move');
      renderMoves();
      if (game.isGameOver()) finish();
      else setStatus();
    }

    function queueBot() {
      setStatus();
      const fen = game.fen();
      if (cfg.engineSkill !== undefined && Engine.available) {
        Engine.play(fen, cfg.engineSkill, cfg.movetime).then(uci => {
          if (!uci || over || game.fen() !== fen) return; // bé đã đi lại hoặc thoát trong lúc máy nghĩ
          afterMove(game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }));
        });
        return;
      }
      timer = setTimeout(() => {
        const m = Bot.chooseMove(fen, level);
        if (!m || game.fen() !== fen) return;
        afterMove(game.move(m));
      }, 500);
    }

    function finish() {
      over = true;
      let result, text;
      if (game.isCheckmate()) {
        result = game.turn() === player ? 'loss' : 'win';
        text = result === 'win' ? `Chiếu hết! Con thắng ${cfg.name} rồi! 🏆` : `${cfg.name} chiếu hết mất rồi. Xem lại ván để học nhé!`;
      } else {
        result = 'draw';
        text = game.isStalemate() ? 'Hòa pat!' : 'Ván cờ hòa.';
      }
      Progress.addGame(level, player, result);
      setStatus(text);
      setFeedback('info', 'Hãy bấm <b>🔍 Xem lại ván</b> để cùng máy tìm những nước có thể đi tốt hơn. Đây là cách học giỏi nhất!');
      if (result === 'win') { celebrate(); Media.play('win'); } else Media.play('bad');
    }

    document.getElementById('reviewBtn').addEventListener('click', () => {
      const moves = game.history();
      if (moves.length < 4) { setFeedback('info', 'Ván cờ còn ngắn quá, hãy chơi thêm vài nước nhé.'); return; }
      if (!over && !confirm('Dừng ván cờ này để xem lại cùng máy?')) return;
      clearTimeout(timer);
      reviewGame(moves, player, `Ván đấu với ${cfg.name}`);
    });
    document.getElementById('quit').addEventListener('click', () => renderPlaySetup());
    document.getElementById('newBtn').addEventListener('click', () => renderGame(level, player));
    document.getElementById('undoBtn').addEventListener('click', () => {
      if (over || pendingBot) return;
      clearTimeout(timer);
      // Lùi về lượt của con (bỏ nước của máy và nước của con).
      if (game.turn() !== player) game.undo();
      else { game.undo(); game.undo(); }
      while (game.history().length && game.turn() !== player) game.undo();
      const h = game.history({ verbose: true }).slice(-1)[0];
      board.setLastMove(h ? h.from : null, h ? h.to : null);
      board.render();
      renderMoves();
      setStatus();
      if (game.turn() !== player) queueBot();
    });
    document.getElementById('hintBtn').addEventListener('click', () => {
      if (over || game.turn() !== player) return;
      setFeedback('info', 'Đang tìm gợi ý... 🤔');
      const fen = game.fen();
      const showHint = from => {
        if (!from || game.fen() !== fen) return;
        board.setHint(from);
        setFeedback('info', `💡 Thử đi quân ${PIECE_NAME[game.get(from).type]} ở <b>${from}</b> xem.`);
      };
      if (Engine.available) {
        Engine.analyze(fen, { depth: 12, movetime: 800 }).then(r => showHint(r && r.best && r.best.slice(0, 2)));
      } else {
        setTimeout(() => { const m = Bot.bestMove(fen); showHint(m && m.from); }, 30);
      }
    });

    setStatus();
    if (game.turn() === bot) queueBot();
  }

  /* ------------------------------------------------------------------ */
  /* Xem lại ván cùng máy                                                 */
  /* ------------------------------------------------------------------ */

  // Biên bản tiếng Việt: V vua, H hậu, X xe, T tượng, M mã  →  K Q R B N.
  function normalizeMoves(text) {
    const vi = { V: 'K', H: 'Q', X: 'R', T: 'B', M: 'N' };
    return text
      .replace(/\{[^}]*\}/g, ' ')
      .replace(/\b0-0-0\b/g, 'O-O-O').replace(/\b0-0\b/g, 'O-O')
      .replace(/\b(1-0|0-1|1\/2-1\/2|\*)\s*$/, ' ')
      .replace(/\d+\.(\.\.)?/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map(t => t.replace(/^[VHXTM](?=[a-h1-8x])/, c => vi[c]).replace(/=([HXTM])/, (_, c) => '=' + vi[c]));
  }

  function renderImportGame() {
    show(`
      ${header('play')}
      <main class="intro">
        <div class="card">
          <h2>📝 Nhập biên bản ván cờ thật</h2>
          <p>Gõ các nước đi theo thứ tự, ví dụ:<br><code>1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5</code><br>
             Có thể dùng ký hiệu tiếng Việt: <code>1. e4 e5 2. Mf3 Mc6 3. Tc4</code> (V vua, H hậu, X xe, T tượng, M mã).</p>
          <textarea id="pgn" rows="7" placeholder="1. e4 e5 2. Nf3 ..."></textarea>
          <p>Con cầm quân:</p>
          <div class="row">
            <label class="check"><input type="radio" name="side" value="w" checked> Trắng</label>
            <label class="check"><input type="radio" name="side" value="b"> Đen</label>
          </div>
          <p class="feedback" id="importMsg"></p>
          <div class="row">
            <button class="btn primary" id="analyze">🔍 Xem lại ván</button>
            <button class="btn" data-go="play">Quay lại</button>
          </div>
        </div>
      </main>`);
    bindNav();
    document.getElementById('analyze').addEventListener('click', () => {
      const tokens = normalizeMoves(document.getElementById('pgn').value);
      const side = app.querySelector('input[name="side"]:checked').value;
      const msg = document.getElementById('importMsg');
      const g = new Chess();
      for (let i = 0; i < tokens.length; i++) {
        try {
          g.move(tokens[i]);
        } catch (e) {
          msg.className = 'feedback bad';
          msg.textContent = `Nước thứ ${i + 1} ("${tokens[i]}", nước ${Math.floor(i / 2) + 1} của ${i % 2 ? 'Đen' : 'Trắng'}) không hợp lệ. Hãy kiểm tra lại biên bản.`;
          return;
        }
      }
      if (g.history().length < 4) {
        msg.className = 'feedback bad';
        msg.textContent = 'Biên bản cần ít nhất 2 nước mỗi bên.';
        return;
      }
      reviewGame(g.history(), side, 'Ván cờ thật');
    });
  }

  /**
   * Máy xem lại các nước của bé, tìm những chỗ sai nhiều nhất, rồi cho bé tự sửa từng chỗ.
   * Những chỗ sai được đưa vào Sổ ôn tập.
   */
  function reviewGame(sanMoves, player, source) {
    const g = new Chess();
    const positions = [];
    sanMoves.forEach((san, i) => {
      const fen = g.fen();
      const mover = g.turn();
      const m = g.move(san);
      if (mover === player) positions.push({ fen, uci: m.from + m.to + (m.promotion || ''), san: m.san, moveNo: Math.floor(i / 2) + 1 });
    });

    show(`
      <div class="intro">
        <div class="card result">
          <div class="big-icon">🔍</div>
          <h1>Máy đang xem lại ván cờ…</h1>
          <div class="goal-bar"><i id="anaBar" style="width:0%"></i></div>
          <p id="anaText">0/${positions.length} nước</p>
        </div>
      </div>`);

    const results = [];
    let cancelled = false;
    cleanup = () => { cancelled = true; };
    const useEngine = Engine.available;
    document.getElementById('anaText').insertAdjacentHTML('afterend',
      `<p class="note">${useEngine ? 'Stockfish đang phân tích kỹ từng nước, mất khoảng 1–2 giây mỗi nước.' : 'Đang dùng máy phân tích đơn giản (Stockfish chưa khởi động được).'}</p>`);

    // Phân tích một nước: điểm của nước tốt nhất, của nước bé đi, và các đường đi dự kiến (pv).
    async function analyzeOne(p) {
      if (useEngine) {
        const c = await Engine.compare(p.fen, p.uci, { depth: 12, movetime: 900 });
        if (c) return c;
      }
      const a = Bot.analyzePosition(p.fen, p.uci, 3);
      const best = a.best.from + a.best.to + (a.best.promotion || '');
      return { best, bestScore: a.bestScore, playedScore: a.playedScore, bestPv: [best], playedPv: [p.uci] };
    }

    (async () => {
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const a = await analyzeOne(p);
        if (cancelled) return;
        // Mức sai = tỷ lệ thắng bị mất (%), giống Lichess: không báo nhầm khi đang thắng áp đảo.
        let drop = Explain.winPct(a.bestScore) - Explain.winPct(a.playedScore);
        // Với trẻ em, vẫn nên xem lại các nước để bị chiếu hết hoặc mất nhiều quân dù ván đã thua sẵn.
        if (a.playedScore <= -9000 && a.bestScore > -9000) drop = Math.max(drop, 35);
        else if (a.bestScore - a.playedScore >= 400) drop = Math.max(drop, 14);
        results.push({ ...p, ...a, drop });
        document.getElementById('anaBar').style.width = `${((i + 1) / positions.length) * 100}%`;
        document.getElementById('anaText').textContent = `${i + 1}/${positions.length} nước`;
        await new Promise(r => setTimeout(r, 0));
      }
      done();
    })();

    function done() {
      Progress.addReviewedGame();
      const bad = results.filter(r => r.drop >= 12 && r.best && r.best.slice(0, 4) !== r.uci.slice(0, 4));
      const blunders = bad.filter(r => r.drop >= 30).length;
      const moments = bad.sort((a, b) => b.drop - a.drop).slice(0, 5).sort((a, b) => a.moveNo - b.moveNo);
      const exercises = moments.map(r => {
        const bestSan = new Chess(r.fen).move({ from: r.best.slice(0, 2), to: r.best.slice(2, 4), promotion: r.best[4] }).san;
        r.bestSan = bestSan;
        // Sai lầm chiến thuật: đường đi của máy cho thấy mất/được quân hoặc chiếu hết. Ngược lại là sai lầm về thế cờ.
        const badLine = Explain.explainLine(r.fen, r.playedPv.slice(0, 6), player);
        const goodLine = Explain.explainLine(r.fen, r.bestPv.slice(0, 6), player);
        r.tactical = /chiếu hết|lợi \d+ điểm/.test(goodLine.summary) || /chiếu hết/.test(badLine.summary) ||
          Math.abs(r.bestScore - r.playedScore) >= 250;
        let why = Explain.whyWrong(r.fen, r.uci);
        if (why.includes('không sai luật')) why = r.tactical ? 'Ở đây có một nước tốt hơn nhiều, con đã bỏ lỡ!' : 'Nước này làm thế cờ của con kém đi.';
        const ex = {
          type: 'move',
          fen: r.fen,
          answers: [r.best],
          evalCheck: true,
          prompt: `Nước ${r.moveNo}: con đã đi <b>${r.san}</b>. ${why} Hãy tìm nước tốt hơn!`,
          deep: {
            kidUci: r.uci,
            kidSan: r.san,
            bestSan,
            bestScore: r.bestScore,
            playedScore: r.playedScore,
            bestPv: r.bestPv.slice(0, 6),
            playedPv: r.playedPv.slice(0, 6),
            hints: Explain.positionalHints(r.fen, r.uci, r.best)
          }
        };
        Progress.reviewAdd(ex, source);
        return ex;
      });
      const list = moments.map(r => `<li>Nước ${r.moveNo}: con đi <b>${r.san}</b>, tốt hơn là <b>${r.bestSan}</b>
        ${r.drop >= 30 ? '❗ sai lầm lớn' : '· chưa tốt'} <small>(${r.tactical ? 'chiến thuật' : 'thế cờ'})</small></li>`).join('');
      show(`
        <div class="intro">
          <div class="card result">
            <div class="big-icon">🔍</div>
            <h1>${source}: con đi ${positions.length} nước</h1>
            ${moments.length
              ? `<p>Máy tìm thấy <b>${bad.length}</b> nước có thể đi tốt hơn${blunders ? `, trong đó <b>${blunders}</b> sai lầm lớn` : ''}.
                 Mình cùng sửa ${moments.length} chỗ quan trọng nhất nhé!</p>
                 <ol class="moments">${list}</ol>
                 <p class="note">Những chỗ này đã được ghi vào 📒 Sổ ôn tập để con ôn lại sau.</p>`
              : '<p>Máy không thấy sai lầm lớn nào. Con chơi rất chắc chắn! 🏆</p>'}
            <div class="row">
              ${moments.length ? '<button class="btn primary" id="fixBtn">Bắt đầu sửa sai ▶</button>' : ''}
              <button class="btn" data-go="play">♟️ Về chơi cờ</button>
            </div>
          </div>
        </div>`);
      bindNav();
      const fix = document.getElementById('fixBtn');
      if (fix) fix.addEventListener('click', () => runSession({
        title: 'Sửa sai ván cờ',
        icon: '🔍',
        exercises,
        onDone: () => {
          show(`
            <div class="intro"><div class="card result">
              <div class="big-icon">🌟</div>
              <h1>Con đã xem lại xong ván cờ!</h1>
              <p>Xem lại ván sau mỗi trận là thói quen của các kiện tướng. Rất giỏi!</p>
              <div class="row"><button class="btn primary" data-go="play">♟️ Chơi ván mới</button><button class="btn" data-go="home">🗺️ Về lộ trình</button></div>
            </div></div>`);
          bindNav();
          celebrate();
        }
      }));
    }
  }

  /* ------------------------------------------------------------------ */
  /* Phụ huynh                                                            */
  /* ------------------------------------------------------------------ */

  /* ---------------- Cài đặt giọng đọc ---------------- */

  function voiceTip() {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) return 'iPad/iPhone: vào <b>Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt</b>, tải giọng <b>Linh (Nâng cao)</b>, rồi mở lại app và chọn giọng đó ở trên.';
    if (/Android/.test(ua)) return 'Android: vào <b>Cài đặt → Hệ thống → Ngôn ngữ → Chuyển văn bản thành giọng nói</b>, chọn <b>Google</b>, tải dữ liệu giọng <b>Tiếng Việt</b> chất lượng cao.';
    if (/Edg\//.test(ua)) return 'Trên Edge, chọn giọng có chữ <b>"Natural"</b> (HoaiMy hoặc NamMinh) cho tự nhiên nhất. Giọng Natural cần có mạng; khi mất mạng phần mềm tự dùng giọng khác.';
    return 'Trên máy tính, mở phần mềm bằng <b>Microsoft Edge</b> để có giọng đọc tự nhiên HoaiMy/NamMinh (Natural).';
  }

  function voiceSettingsHtml() {
    const voices = Media.vietVoices();
    const current = Media.vietVoice();
    const rate = Progress.data.settings.voiceRate || 0.9;
    const options = voices.map(v => `<option value="${esc(v.name)}" ${current && v.name === current.name ? 'selected' : ''}>${esc(v.name)}${/natural|neural|online|premium|enhanced|google/i.test(v.name) ? ' ⭐' : ''}</option>`).join('');
    const mode = Progress.data.settings.voiceMode === 'device' ? 'device' : 'recorded';
    const aiName = /NamMinh/.test(Media.recordedVoice) ? 'NamMinh, giọng nam' : 'HoaiMy, giọng nữ';
    return `
      <div class="voice-box">
        ${Media.hasRecorded ? `
          <label class="check">Kiểu giọng: <select id="voiceMode">
            <option value="recorded" ${mode === 'recorded' ? 'selected' : ''}>🎙️ Giọng AI thu sẵn (${aiName}) – tự nhiên nhất</option>
            <option value="device" ${mode === 'device' ? 'selected' : ''}>📱 Giọng của máy</option>
          </select></label>
          <p class="note">Lời giảng, đề bài, lời khen và khai cuộc dùng giọng AI thu sẵn, nghe được cả khi mất mạng.
             Lời giải thích tự động (thay đổi theo từng ván) dùng giọng của máy chọn bên dưới.</p>` : ''}
        ${voices.length ? `
          <label class="check">Giọng của máy: <select id="voiceSelect">${options}</select></label>
          <label class="check">Tốc độ: <input type="range" id="voiceRate" min="0.7" max="1.2" step="0.05" value="${rate}"> <span id="rateText">${rate.toFixed(2)}×</span></label>` : ''}
        ${voices.length || Media.hasRecorded ? '<button class="btn" id="voiceTest">🔊 Nghe thử</button>' : ''}
        <p class="note">💡 Giọng của máy: ${voiceTip()} Giọng có dấu ⭐ thường tự nhiên hơn.</p>
      </div>`;
  }

  function bindVoiceSettings() {
    const modeSel = document.getElementById('voiceMode');
    if (modeSel) modeSel.addEventListener('change', () => {
      Progress.setSetting('voiceMode', modeSel.value);
      Media.preview(document.getElementById('voiceSelect')?.value, Progress.data.settings.voiceRate || 0.9);
    });
    const select = document.getElementById('voiceSelect');
    if (!select) {
      const test = document.getElementById('voiceTest');
      if (test) test.addEventListener('click', () => Media.preview(null, 0.9));
      return;
    }
    const rate = document.getElementById('voiceRate');
    select.addEventListener('change', () => { Progress.setSetting('voiceName', select.value); Media.preview(select.value, Number(rate.value)); });
    rate.addEventListener('input', () => { document.getElementById('rateText').textContent = Number(rate.value).toFixed(2) + '×'; });
    rate.addEventListener('change', () => Progress.setSetting('voiceRate', Number(rate.value)));
    document.getElementById('voiceTest').addEventListener('click', () => Media.preview(select.value, Number(rate.value)));
  }

  function renderParentGate() {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    show(`
      ${header('parent')}
      <main class="intro">
        <div class="card">
          <h2>👨‍👩‍👧 Dành cho phụ huynh</h2>
          <p>Để vào trang này, vui lòng trả lời: <b>${a} × ${b} = ?</b></p>
          <input id="gate" inputmode="numeric" autofocus>
          <button class="btn primary" id="gateBtn">Vào</button>
          <p class="feedback" id="gateMsg"></p>
        </div>
      </main>`);
    bindNav();
    const input = document.getElementById('gate');
    const tryGate = () => {
      if (Number(input.value) === a * b) renderParent();
      else document.getElementById('gateMsg').textContent = 'Chưa đúng.';
    };
    document.getElementById('gateBtn').addEventListener('click', tryGate);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') tryGate(); });
  }

  function renderParent() {
    const d = Progress.data;
    const days = Progress.lastDays(14);
    const maxMin = Math.max(10, ...days.map(x => x.minutes));
    const bars = days.map(x => `
      <div class="bar" title="${x.label}: ${x.minutes} phút, ${x.solved} bài">
        <i style="height:${(x.minutes / maxMin) * 100}%"></i><span>${x.label}</span>
      </div>`).join('');
    const rows = UNITS.map(u => {
      const r = Progress.lesson(u.id);
      return `<tr><td>${u.icon} ${u.title}</td><td>${u.week}</td>
        <td>${r ? starsHtml(r.stars) : '—'}</td><td>${r ? r.attempts : 0}</td>
        <td>${r ? r.bestMistakes : '—'}</td><td>${r ? r.lastDone : '—'}</td></tr>`;
    }).join('');
    const gameRows = Object.entries(Bot.LEVELS).map(([lv, cfg]) => {
      const g = d.games.filter(x => x.level === Number(lv));
      const c = k => g.filter(x => x.result === k).length;
      return `<tr><td>${cfg.icon} ${cfg.name}</td><td>${g.length}</td><td>${c('win')}</td><td>${c('draw')}</td><td>${c('loss')}</td></tr>`;
    }).join('');
    // Điểm giải đố 30 ngày: ngày không làm bài thì giữ điểm của ngày trước đó.
    const ratingDays = Progress.lastDays(30);
    const known = Object.keys(d.ratingByDay).sort();
    let carry = known.length ? d.ratingByDay[known[0]] : d.puzzleRating;
    const ratingSeries = ratingDays.map(x => {
      const earlier = known.filter(k => k <= x.key);
      if (earlier.length) carry = d.ratingByDay[earlier[earlier.length - 1]];
      return { label: x.label, value: carry };
    });
    const rMin = Math.min(...ratingSeries.map(x => x.value)) - 50;
    const rMax = Math.max(...ratingSeries.map(x => x.value)) + 50;
    const ratingBars = ratingSeries.map((x, i) => `
      <div class="bar" title="${x.label}: ${x.value}">
        <i class="rating" style="height:${((x.value - rMin) / (rMax - rMin)) * 100}%"></i><span>${i % 5 === 4 ? x.label : ''}</span>
      </div>`).join('');
    const openingsTotal = OPENINGS.reduce((s, r) => s + r.lines.length, 0);
    const openingsMastered = Object.values(d.openings).filter(o => o.clean >= 2).length;
    const puzzleCount = Object.keys(d.puzzleSeen).length;
    const puzzleFirstTry = Object.values(d.puzzleSeen).filter(v => v === 1).length;
    const totalMin = Object.values(d.days).reduce((s, x) => s + x.minutes, 0);
    const totalSolved = Object.values(d.days).reduce((s, x) => s + x.solved, 0);
    const doneCount = UNITS.filter(u => Progress.lesson(u.id)).length;

    show(`
      ${header('parent')}
      <main class="parent">
        <div class="kpis">
          <div class="card kpi"><b>${doneCount}/${UNITS.length}</b><span>bài học đã xong</span></div>
          <div class="card kpi"><b>${totalSolved}</b><span>bài tập đã giải</span></div>
          <div class="card kpi"><b>${totalMin}</b><span>phút học</span></div>
          <div class="card kpi"><b>${Progress.streak()}</b><span>ngày liên tiếp</span></div>
          <div class="card kpi"><b>🧠 ${d.puzzleRating}</b><span>điểm giải đố</span></div>
          <div class="card kpi"><b>📒 ${Object.keys(d.reviews).length}</b><span>bài trong Sổ ôn tập (${d.mastered} bài đã ôn thuộc)</span></div>
          <div class="card kpi"><b>🔍 ${d.reviewedGames}</b><span>ván đã xem lại cùng máy</span></div>
          <div class="card kpi"><b>📚 ${openingsMastered}/${openingsTotal}</b><span>thế khai cuộc đã thuộc</span></div>
        </div>
        <div class="card">
          <h2>Điểm giải đố 30 ngày qua</h2>
          <div class="bars">${ratingBars}</div>
          <p class="note">Bé đã làm ${puzzleCount} bài từ kho Lichess, đúng ngay lần đầu ${puzzleFirstTry} bài
            ${puzzleCount ? `(${Math.round((puzzleFirstTry / puzzleCount) * 100)}%)` : ''}.
            Điểm tăng khi giải đúng ngay, giảm khi sai hoặc dùng gợi ý, giống hệ Elo.
            Mốc tham khảo: khoảng 1000 là đã nắm chắc chiến thuật cơ bản, khoảng 1400 là trình độ khá ở câu lạc bộ thiếu nhi.</p>
        </div>
        <div class="card">
          <h2>Thời gian học 14 ngày qua (phút)</h2>
          <div class="bars">${bars}</div>
          <p class="note">Khuyến nghị cho trẻ 7 tuổi: 20–30 phút mỗi ngày, 5 ngày mỗi tuần.</p>
        </div>
        <div class="card">
          <h2>Tiến độ từng bài</h2>
          <div class="table-wrap"><table>
            <thead><tr><th>Bài</th><th>Tuần</th><th>Sao</th><th>Số lần làm</th><th>Ít lỗi nhất</th><th>Lần cuối</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
        <div class="card">
          <h2>Ván đấu với máy</h2>
          <div class="table-wrap"><table>
            <thead><tr><th>Đối thủ</th><th>Số ván</th><th>Thắng</th><th>Hòa</th><th>Thua</th></tr></thead>
            <tbody>${gameRows}</tbody>
          </table></div>
          <p class="note">Khi con thắng đều khoảng 70% ván ở một cấp, hãy chuyển lên cấp tiếp theo.</p>
        </div>
        <div class="card settings">
          <h2>Cài đặt</h2>
          <label class="check">Tên của bé: <input id="nameInput" value="${esc(d.name)}" maxlength="20"></label>
          <label class="check"><input type="checkbox" data-setting="unlockAll" ${d.settings.unlockAll ? 'checked' : ''}> Mở khóa tất cả bài học</label>
          <p class="note">${Engine.available
            ? '♟️ Stockfish đang hoạt động: dùng để xem lại ván, kiểm tra nước đi và cho 2 đối thủ mạnh (🦅 Đại bàng, 🐉 Rồng).'
            : '⚠️ Stockfish chưa khởi động được trên máy này. Phần mềm vẫn chạy bằng máy phân tích đơn giản.'}</p>
          <label class="check"><input type="checkbox" data-setting="sound" ${d.settings.sound ? 'checked' : ''}> Âm thanh</label>
          <label class="check"><input type="checkbox" data-setting="voice" ${d.settings.voice ? 'checked' : ''}> Tự động đọc to đề bài
            ${Media.canSpeak() ? '' : '<small>(máy này chưa có giọng đọc tiếng Việt, xem hướng dẫn bên dưới)</small>'}</label>
          ${voiceSettingsHtml()}
          <label class="check"><input type="checkbox" data-setting="hangingWarning" ${d.settings.hangingWarning ? 'checked' : ''}> Nhắc khi bé sắp để mất quân (lúc chơi với máy)</label>
          <div class="row">
            <button class="btn" id="exportBtn">💾 Sao lưu tiến độ</button>
            <label class="btn">📂 Khôi phục từ file<input type="file" id="importFile" accept=".json" hidden></label>
            <button class="btn danger" id="resetBtn">🗑️ Xóa toàn bộ tiến độ</button>
          </div>
        </div>
      </main>`);
    bindNav();
    document.getElementById('nameInput').addEventListener('change', e => { if (e.target.value.trim()) Progress.setName(e.target.value); });
    app.querySelectorAll('[data-setting]').forEach(cb => cb.addEventListener('change', () => Progress.setSetting(cb.dataset.setting, cb.checked)));
    bindVoiceSettings();
    document.getElementById('exportBtn').addEventListener('click', () => {
      const blob = new Blob([Progress.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `co-vua-nhi-${Progress.today()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById('importFile').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        Progress.importJson(await file.text());
        alert('Đã khôi phục tiến độ.');
        renderParent();
      } catch (err) {
        alert('Không đọc được file: ' + err.message);
      }
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (confirm('Xóa toàn bộ tiến độ của bé? Việc này không thể hoàn tác.')) {
        Progress.reset();
        renderWelcome();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Đếm thời gian học: chỉ tính khi trang đang mở và bé có thao tác      */
  /* ------------------------------------------------------------------ */

  let lastActivity = Date.now();
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => (lastActivity = Date.now())));
  setInterval(() => {
    if (document.visibilityState === 'visible' && Date.now() - lastActivity < 2 * 60 * 1000 && Progress.data.name) {
      Progress.addMinute();
    }
  }, 60 * 1000);

  // Giọng đọc có thể tải chậm: vẽ lại để hiện nút 🔊.
  document.addEventListener('voices-ready', () => {
    if (app.querySelector('.home')) renderHome();
  }, { once: true });

  /* ------------------------------------------------------------------ */
  /* Ứng dụng web cài được (PWA): chạy offline trên iPad/iPhone/Android   */
  /* ------------------------------------------------------------------ */

  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let installPrompt = null; // Android/Chrome: sự kiện cài đặt để gọi khi bé/phụ huynh bấm nút

  // iPhone/iPad bỏ qua "user-scalable=no": chặn thêm cử chỉ chụm hai ngón để màn hình không bị phóng to khi bé chơi.
  ['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('Không đăng ký được bộ nhớ offline', e));
    // Tải ngầm các bản thu giọng AI để nghe được cả khi mất mạng.
    navigator.serviceWorker.ready.then(reg => { if (reg.active) reg.active.postMessage('cache-audio'); });
    // Có bản mới (không phải lần cài đầu tiên): tải lại để dùng ngay.
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) location.reload(); });
  }
  // Xin trình duyệt giữ dữ liệu lâu dài, tránh iOS tự xóa tiến độ khi máy thiếu bộ nhớ.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    if (app.querySelector('.home')) renderHome();
  });

  function installCard() {
    if (isStandalone() || !location.protocol.startsWith('http')) return '';
    try { if (localStorage.getItem('covuanhi.hideInstall')) return ''; } catch (e) { /* bỏ qua */ }
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let how;
    if (installPrompt) how = '<button class="btn primary" id="installBtn">📲 Cài đặt ứng dụng</button>';
    else if (ios) how = 'Trên iPad/iPhone: mở trang này bằng <b>Safari</b>, bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên), rồi chọn <b>"Thêm vào MH chính"</b>.';
    else if (/Android/.test(ua)) how = 'Trên Android: bấm nút <b>⋮</b> của Chrome, rồi chọn <b>"Cài đặt ứng dụng"</b> hoặc <b>"Thêm vào màn hình chính"</b>.';
    else return '';
    return `
      <div class="card notebook install">
        <span class="big">📲</span>
        <div><b>Cài Cờ Vua Nhí lên máy</b><p>Có biểu tượng riêng, mở toàn màn hình và chơi được cả khi không có mạng. ${how}</p></div>
        <button class="close" id="hideInstall" title="Ẩn">✖</button>
      </div>`;
  }

  // Khởi động Stockfish ngay khi mở phần mềm; nếu đang ở màn hình chọn đối thủ thì vẽ lại để hiện cấp mới.
  Engine.start().then(ok => {
    if (ok && app.querySelector('.play-setup')) renderPlaySetup();
  });

  renderHome();
})();
