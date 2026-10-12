/*
 * Máy chơi cờ đơn giản dành cho trẻ em.
 * Không cần mạnh: cần chơi "giống người" ở trình độ thấp, biết ăn quân treo và chạy trốn khi chỉ còn vua.
 *
 * Để đủ nhanh, phần tìm kiếm dùng các hàm nội bộ của chess.js (_moves, _makeMove, _undoMove, _board):
 * hàm công khai game.moves({verbose}) tính ký hiệu SAN cho mọi nước nên chậm hơn hàng trăm lần.
 * Nếu nâng cấp chess.js, hãy kiểm tra lại các hàm nội bộ này.
 */
(function () {
  const VALUE = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 0 };
  const MATE = 100000;
  const FILES = 'abcdefgh';
  const QUIESCENCE_DEPTH = 4;

  const LEVELS = {
    1: { name: 'Gà con', icon: '🐣', depth: 0, noise: 0, randomRate: 0.6 },
    2: { name: 'Thỏ', icon: '🐰', depth: 0, noise: 150, randomRate: 0.15 },
    3: { name: 'Cáo', icon: '🦊', depth: 1, noise: 40, randomRate: 0 },
    4: { name: 'Sói', icon: '🐺', depth: 2, noise: 6, randomRate: 0 },
    // Hai cấp dưới đây dùng Stockfish (engine.js) với "Skill Level" thấp; không có Stockfish thì chơi như Sói.
    5: { name: 'Đại bàng', icon: '🦅', depth: 2, noise: 6, randomRate: 0, engineSkill: 2, movetime: 300 },
    6: { name: 'Rồng', icon: '🐉', depth: 2, noise: 6, randomRate: 0, engineSkill: 6, movetime: 500 }
  };

  const squareName = i => FILES[i & 15] + (8 - (i >> 4));

  // Điểm cộng nhỏ cho quân đứng gần trung tâm (0 ở góc … 3 ở trung tâm).
  function centerBonus(file, row) {
    return 3.5 - Math.max(Math.abs(3.5 - file), Math.abs(3.5 - row));
  }

  // Điểm theo góc nhìn của Trắng.
  function evaluate(game) {
    const board = game._board;
    let score = 0;
    const count = { w: 0, b: 0 };
    const kings = {};
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) { i += 7; continue; }
      const p = board[i];
      if (!p) continue;
      const row = i >> 4;
      const file = i & 15;
      if (p.type === 'k') { kings[p.color] = { file, row }; continue; }
      count[p.color]++;
      let v = VALUE[p.type];
      if (p.type === 'n' || p.type === 'b') v += centerBonus(file, row) * 6;
      else if (p.type === 'p') {
        const advance = p.color === 'w' ? 6 - row : row - 1;
        v += advance * advance * 3 + centerBonus(file, row) * 2;
      }
      score += p.color === 'w' ? v : -v;
    }
    // Khi một bên chỉ còn vua: bên mạnh muốn ép vua yếu ra mép và đưa vua mình lại gần.
    for (const lone of ['w', 'b']) {
      const strong = lone === 'w' ? 'b' : 'w';
      if (count[lone] === 0 && count[strong] > 0 && kings.w && kings.b) {
        const k = kings[lone];
        const edge = 3.5 - centerBonus(k.file, k.row);
        const dist = Math.max(Math.abs(kings.w.file - kings.b.file), Math.abs(kings.w.row - kings.b.row));
        const sign = strong === 'w' ? 1 : -1;
        score += sign * (edge * 40 + (7 - dist) * 12);
      }
    }
    return score;
  }

  function relative(game) {
    const s = evaluate(game);
    return game._turn === 'w' ? s : -s;
  }

  function moveOrder(m) {
    let s = 0;
    if (m.captured) s += 10 * VALUE[m.captured] - VALUE[m.piece] + 1000;
    if (m.promotion) s += VALUE[m.promotion];
    return s;
  }

  function sorted(moves) {
    return moves.sort((a, b) => moveOrder(b) - moveOrder(a));
  }

  // Sinh nước "giả hợp lệ" rồi tự loại nước để vua bị chiếu: nhanh hơn nhiều so với _moves() hợp lệ đầy đủ.
  function pseudo(game) {
    return game._moves({ legal: false });
  }

  // Chỉ xét các nước ăn quân để tránh "đánh giá giữa chừng" (vd: ăn hậu nhưng bị ăn lại ngay).
  function quiesce(game, alpha, beta, qdepth) {
    const stand = relative(game);
    if (qdepth === 0 || stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    const us = game._turn;
    for (const m of sorted(pseudo(game).filter(x => x.captured || x.promotion))) {
      game._makeMove(m);
      if (game._isKingAttacked(us)) { game._undoMove(); continue; }
      const v = -quiesce(game, -beta, -alpha, qdepth - 1);
      game._undoMove();
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }

  function negamax(game, depth, alpha, beta, ply) {
    const us = game._turn;
    let best = -Infinity;
    let legal = 0;
    for (const m of sorted(pseudo(game))) {
      game._makeMove(m);
      if (game._isKingAttacked(us)) { game._undoMove(); continue; }
      legal++;
      let v;
      if (game._isKingAttacked(game._turn) && game._moves().length === 0) v = MATE - ply - 1; // nước này chiếu hết
      else if (depth <= 1) v = -quiesce(game, -beta, -alpha, QUIESCENCE_DEPTH);
      else v = -negamax(game, depth - 1, -beta, -alpha, ply + 1);
      game._undoMove();
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    if (legal === 0) return game._isKingAttacked(us) ? -MATE + ply : 0;
    return best;
  }

  /**
   * Chấm điểm mọi nước ở gốc, trả về [{move, score}] với move là nước nội bộ.
   * Nước kém hơn nước tốt nhất quá 2×noise chỉ cần biết là "kém", nên được cắt tỉa (alpha-beta).
   */
  function scoreRoot(game, depth, noise) {
    const out = [];
    let best = -Infinity;
    for (const m of sorted(game._moves())) {
      game._makeMove(m);
      let v;
      if (game._moves().length === 0) v = game._isKingAttacked(game._turn) ? MATE : 0;
      else if (depth === 0) v = -quiesce(game, -Infinity, Infinity, QUIESCENCE_DEPTH);
      else v = -negamax(game, depth, -Infinity, -(best - 2 * noise - 1), 1);
      game._undoMove();
      if (v > best) best = v;
      out.push({ move: m, score: v + (Math.random() * 2 - 1) * noise });
    }
    return out;
  }

  // Đổi nước nội bộ sang dạng verbose công khai (có san, from, to…).
  function toVerbose(game, m) {
    const from = squareName(m.from);
    const to = squareName(m.to);
    return game.moves({ square: from, verbose: true })
      .find(v => v.to === to && (v.promotion || undefined) === (m.promotion || undefined));
  }

  const pickRandom = list => list[Math.floor(Math.random() * list.length)];

  /** Trả về nước đi dạng verbose của chess.js, hoặc null nếu hết nước. */
  function chooseMove(fen, level) {
    const cfg = LEVELS[level] || LEVELS[2];
    const game = new Chess(fen);
    const moves = game._moves();
    if (moves.length === 0) return null;

    if (Math.random() < cfg.randomRate) {
      // Gà con: thỉnh thoảng thấy quân để ăn, còn lại đi ngẫu nhiên.
      const captures = moves.filter(m => m.captured);
      const m = captures.length && Math.random() < 0.5 ? pickRandom(captures) : pickRandom(moves);
      return toVerbose(game, m);
    }

    // Chỉ còn vua (bài thử thách chiếu hết): phòng thủ nghiêm túc để bé phải dùng đúng kỹ thuật.
    const noise = onlyKing(game, game._turn) ? 0 : cfg.noise;
    const scored = scoreRoot(game, cfg.depth, noise);
    scored.sort((a, b) => b.score - a.score);
    return toVerbose(game, scored[0].move);
  }

  function onlyKing(game, color) {
    for (let i = 0; i < 128; i++) {
      if (i & 0x88) { i += 7; continue; }
      const p = game._board[i];
      if (p && p.color === color && p.type !== 'k') return false;
    }
    return true;
  }

  /** Gợi ý nước tốt nhất (tìm sâu, không có nhiễu). */
  function bestMove(fen) {
    const game = new Chess(fen);
    if (game._moves().length === 0) return null;
    const scored = scoreRoot(game, 2, 0);
    scored.sort((a, b) => b.score - a.score);
    return toVerbose(game, scored[0].move);
  }

  /**
   * Phân tích một thế cờ để xem lại ván: điểm của nước tốt nhất và của nước `playedUci`,
   * cùng theo góc nhìn bên đến lượt đi (đơn vị: 100 = một tốt).
   */
  function analyzePosition(fen, playedUci, depth = 2) {
    const game = new Chess(fen);
    const scored = scoreRoot(game, depth, 0).sort((a, b) => b.score - a.score);
    const best = scored[0];
    const key = m => squareName(m.from) + squareName(m.to) + (m.promotion || '');
    // Nước phong cấp ghi thiếu quân phong (vd "e7e8") được hiểu là phong hậu.
    const played = game._moves().find(m => key(m) === playedUci || key(m) === playedUci + 'q');
    let playedScore = best.score;
    if (played && key(played) !== key(best.move)) {
      game._makeMove(played);
      if (game._moves().length === 0) playedScore = game._isKingAttacked(game._turn) ? MATE : 0;
      else playedScore = -negamax(game, depth, -Infinity, Infinity, 1);
      game._undoMove();
    }
    return { best: toVerbose(game, best.move), bestScore: best.score, playedScore };
  }

  window.Bot = { LEVELS, chooseMove, bestMove, analyzePosition, VALUE, MATE };
})();
