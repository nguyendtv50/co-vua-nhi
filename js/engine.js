/*
 * Điều khiển Stockfish (vendor/stockfish.src.js) chạy trong Web Worker tạo từ Blob,
 * nhờ vậy dùng được cả khi mở index.html bằng nhấp đúp (file://).
 * Nếu Stockfish không khởi động được, Engine.available = false và phần mềm dùng máy đơn giản (bot.js).
 *
 * Điểm số luôn theo góc nhìn bên đến lượt đi, đơn vị 100 = một tốt; chiếu hết quy về ±10000.
 */
(function () {
  const MATE_SCORE = 10000;
  let worker = null;
  let ready = false;
  let startPromise = null;
  let current = null;
  const queue = [];

  function start() {
    if (startPromise) return startPromise;
    startPromise = new Promise(resolve => {
      if (!window.STOCKFISH_SOURCE || !window.Worker || !window.Blob) { resolve(false); return; }
      try {
        const url = URL.createObjectURL(new Blob([window.STOCKFISH_SOURCE], { type: 'application/javascript' }));
        worker = new Worker(url);
      } catch (e) {
        console.warn('Không khởi động được Stockfish', e);
        resolve(false);
        return;
      }
      const fail = () => { ready = false; resolve(false); };
      const timer = setTimeout(fail, 10000);
      worker.onerror = e => { console.warn('Stockfish lỗi', e.message); clearTimeout(timer); fail(); };
      worker.onmessage = e => {
        const line = String(e.data);
        if (!ready) {
          if (line === 'readyok') { ready = true; clearTimeout(timer); resolve(true); }
          return;
        }
        handle(line);
      };
      worker.postMessage('uci');
      worker.postMessage('setoption name Hash value 32');
      worker.postMessage('isready');
    });
    return startPromise;
  }

  function parseInfo(line, job) {
    if (!line.includes(' pv ') || line.includes('bound')) return;
    const num = key => {
      const m = line.match(new RegExp(` ${key} (-?\\d+)`));
      return m ? Number(m[1]) : null;
    };
    const multipv = num('multipv') || 1;
    const cp = num('cp');
    const mate = num('mate');
    let score = cp;
    if (mate !== null) score = mate > 0 ? MATE_SCORE - mate * 10 : -MATE_SCORE - mate * 10;
    const pv = line.split(' pv ')[1].trim().split(' ');
    job.lines[multipv] = { depth: num('depth'), score, mate, pv, move: pv[0] };
  }

  function handle(line) {
    if (!current) return;
    if (line.startsWith('info')) parseInfo(line, current);
    else if (line.startsWith('bestmove')) {
      const job = current;
      current = null;
      const best = line.split(' ')[1];
      const lines = Object.keys(job.lines).sort((a, b) => a - b).map(k => job.lines[k]);
      job.resolve({ best: best && best !== '(none)' ? best : null, lines });
      next();
    }
  }

  function next() {
    if (current || !queue.length) return;
    current = queue.shift();
    current.lines = {};
    for (const cmd of current.cmds) worker.postMessage(cmd);
  }

  function run(cmds) {
    return new Promise(resolve => {
      queue.push({ cmds, resolve });
      next();
    });
  }

  /**
   * Phân tích một thế cờ. opts: depth, movetime (ms), multipv, searchmoves (chỉ xét các nước này), skill (0–20).
   * Trả về { best, lines: [{ move, score, mate, pv, depth }] }.
   */
  async function analyze(fen, opts = {}) {
    if (!(await start())) return null;
    const { depth = 12, movetime = 900, multipv = 1, searchmoves = null, skill = 20 } = opts;
    return run([
      `setoption name MultiPV value ${multipv}`,
      `setoption name Skill Level value ${skill}`,
      `position fen ${fen}`,
      `go depth ${depth} movetime ${movetime}${searchmoves ? ' searchmoves ' + searchmoves : ''}`
    ]);
  }

  /**
   * So sánh nước `uci` với nước tốt nhất ở thế cờ `fen`.
   * Trả về { best, bestScore, playedScore, bestPv, playedPv } (playedPv bắt đầu bằng chính nước `uci`).
   */
  async function compare(fen, uci, opts = {}) {
    const top = await analyze(fen, opts);
    if (!top || !top.lines.length) return null;
    const bestLine = top.lines[0];
    if (bestLine.move === uci || bestLine.move === uci + 'q') {
      return { best: bestLine.move, bestScore: bestLine.score, playedScore: bestLine.score, bestPv: bestLine.pv, playedPv: bestLine.pv };
    }
    const played = await analyze(fen, { ...opts, searchmoves: uci });
    const p = played && played.lines[0];
    return {
      best: bestLine.move,
      bestScore: bestLine.score,
      playedScore: p ? p.score : bestLine.score,
      bestPv: bestLine.pv,
      playedPv: p ? p.pv : [uci]
    };
  }

  /** Chọn nước để chơi với bé, độ mạnh theo Skill Level của Stockfish. */
  async function play(fen, skill, movetime) {
    const r = await analyze(fen, { depth: 12, movetime, skill, multipv: 1 });
    return r && r.best;
  }

  window.Engine = {
    start,
    analyze,
    compare,
    play,
    MATE_SCORE,
    get available() { return ready; }
  };
})();
