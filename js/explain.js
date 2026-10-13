/*
 * "Thầy giải thích": mô tả bằng tiếng Việt ý nghĩa của từng nước đi.
 * Nhận diện: ăn quân, chiếu, chiếu đôi, tấn công phát hiện, chĩa đôi, ghim, xiên, hy sinh,
 * dọa chiếu hết, phong cấp; và giải thích vì sao một nước sai (để mất quân, bị chiếu hết…).
 * Dùng cho lời giải bài tập, phần xem lại ván và bộ khai cuộc.
 */
(function () {
  const FILES = 'abcdefgh';
  const NAME = { p: 'tốt', n: 'mã', b: 'tượng', r: 'xe', q: 'hậu', k: 'vua' };
  const VALUE = { p: 100, n: 300, b: 320, r: 500, q: 900, k: 10000 };
  const POINTS = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const LINES = {
    r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    b: [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  };
  LINES.q = LINES.r.concat(LINES.b);

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const other = c => (c === 'w' ? 'b' : 'w');
  const toMove = uci => ({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });

  function pieceAt(game, sq) {
    const p = game.get(sq);
    return p ? { ...p, square: sq } : null;
  }

  function kingSquare(game, color) {
    for (const row of game.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
    return null;
  }

  function material(game, color) {
    let s = 0;
    for (const row of game.board()) for (const p of row) if (p && p.color === color) s += POINTS[p.type];
    return s;
  }

  const label = p => `${NAME[p.type]} ở ${p.square}`;

  function listNames(pieces) {
    const names = pieces.map(label);
    return names.length <= 1 ? names.join('') : names.slice(0, -1).join(', ') + ' và ' + names[names.length - 1];
  }

  /** Câu mô tả cơ bản: "Mã ăn xe ở f7", "Nhập thành cánh vua", "Tốt phong hậu ở e8". */
  function baseText(m) {
    if (m.flags.includes('k')) return 'Nhập thành cánh vua';
    if (m.flags.includes('q')) return 'Nhập thành cánh hậu';
    // Bắt tốt qua đường: tốt bị ăn không đứng ở ô đích mà ở ngay cạnh tốt vừa ăn.
    if (m.flags.includes('e')) return `Bắt tốt qua đường: tốt đi chéo từ ${m.from} đến ${m.to} và ăn tốt ở ${m.to[0]}${m.from[1]}`;
    let s = m.captured
      ? `${cap(NAME[m.piece])} ăn ${NAME[m.captured]} ở ${m.to}`
      : `${cap(NAME[m.piece])} đi đến ${m.to}`;
    if (m.promotion) s += `, phong cấp thành ${NAME[m.promotion]}`;
    return s;
  }

  /** Tìm ghim/xiên do quân vừa đi (xe, tượng, hậu) tạo ra. */
  function linesFrom(game, m, mover) {
    const out = [];
    const dirs = LINES[m.promotion || m.piece];
    if (!dirs) return out;
    const f0 = FILES.indexOf(m.to[0]);
    const r0 = Number(m.to[1]);
    for (const [df, dr] of dirs) {
      let f = f0 + df;
      let r = r0 + dr;
      let first = null;
      while (f >= 0 && f < 8 && r >= 1 && r <= 8) {
        const p = pieceAt(game, FILES[f] + r);
        if (p) {
          if (p.color === mover) break;
          if (!first) first = p;
          else {
            const second = p;
            // Chỉ nói về ghim khi phía sau là vua hoặc quân lớn (xe, hậu): ghim tốt vào mã không có ý nghĩa với bé.
            if (first.type !== 'k' && (second.type === 'k' || (VALUE[second.type] >= 500 && VALUE[second.type] > VALUE[first.type]))) {
              out.push(`Ghim ${label(first)} vào ${label(second)}: ${NAME[first.type]} không dám chạy`);
            } else if ((first.type === 'k' || VALUE[first.type] > VALUE[second.type]) && VALUE[second.type] >= 300) {
              out.push(first.type === 'k'
                ? `Xiên: vua phải chạy, rồi ăn ${label(second)} ở phía sau`
                : `Xiên: tấn công ${label(first)}, phía sau là ${label(second)}`);
            }
            break;
          }
        }
        f += df;
        r += dr;
      }
    }
    return out;
  }

  function threatensMate(game, mover) {
    const parts = game.fen().split(' ');
    parts[1] = mover;
    parts[3] = '-';
    let g;
    try {
      g = new Chess(parts.join(' '));
    } catch (e) {
      return false;
    }
    for (const m of g.moves({ verbose: true })) {
      g.move(m);
      const mate = g.isCheckmate();
      g.undo();
      if (mate) return true;
    }
    return false;
  }

  /**
   * Giải thích một nước đi từ thế cờ `fen`. Trả về { text, san, from, to, fenAfter, tags }.
   */
  function describeMove(fen, uci) {
    const g = new Chess(fen);
    const mover = g.turn();
    const opp = other(mover);
    const wasInCheck = g.inCheck();
    // Quân sắp đi có đang gặp nguy không (bị tấn công mà không được bảo vệ, hoặc bị quân nhỏ hơn tấn công)?
    const fromPiece = g.get(uci.slice(0, 2));
    const fromAttackers = g.attackers(uci.slice(0, 2), opp);
    const wasThreatened = fromPiece && fromPiece.type !== 'k' && fromAttackers.length > 0 &&
      (g.attackers(uci.slice(0, 2), mover).length === 0 ||
        Math.min(...fromAttackers.map(sq => VALUE[g.get(sq).type])) < VALUE[fromPiece.type]);
    const m = g.move(toMove(uci));
    const tags = [];
    const parts = [baseText(m) + (wasInCheck ? (m.piece === 'k' ? ' để thoát chiếu' : ' để chặn hoặc thoát chiếu') : '')];

    if (g.isCheckmate()) {
      parts.push('CHIẾU HẾT!');
      tags.push('mate');
      return { text: parts.join('. ') + '', san: m.san, from: m.from, to: m.to, fenAfter: g.fen(), tags };
    }

    const ksq = kingSquare(g, opp);
    const checkers = ksq ? g.attackers(ksq, mover) : [];
    if (checkers.length >= 2) {
      parts.push('CHIẾU ĐÔI! Hai quân cùng chiếu nên vua bắt buộc phải chạy');
      tags.push('double');
    } else if (checkers.length === 1) {
      if (checkers[0] !== m.to) {
        parts.push(`Tấn công phát hiện: ${label(pieceAt(g, checkers[0]))} lộ ra chiếu vua`);
        tags.push('discovered');
      } else {
        parts.push('Chiếu vua');
        tags.push('check');
      }
    }

    // Chĩa đôi: quân vừa đi tấn công từ 2 quân giá trị trở lên.
    const targets = [];
    for (const row of g.board()) {
      for (const p of row) {
        if (!p || p.color !== opp || p.type === 'p') continue;
        if (!g.attackers(p.square, mover).includes(m.to)) continue;
        const undefended = g.attackers(p.square, opp).length === 0;
        if (p.type === 'k' || VALUE[p.type] > VALUE[m.piece] || undefended) targets.push(p);
      }
    }
    if (targets.length >= 2) {
      parts.push(`Chĩa đôi: tấn công cùng lúc ${listNames(targets)}`);
      tags.push('fork');
    }

    for (const t of linesFrom(g, m, mover)) {
      parts.push(t);
      tags.push(t.startsWith('Ghim') ? 'pin' : 'skewer');
    }

    // Hy sinh: đối thủ ăn được quân vừa đi và mình thiệt ít nhất ~2 điểm (đã tính việc ăn lại).
    // Không tính khi đang bị chiếu: chặn chiếu là bắt buộc, không phải hy sinh.
    if (m.piece !== 'k' && !wasInCheck) {
      const attackers = g.attackers(m.to, opp);
      const lost = VALUE[m.promotion || m.piece];
      const gained = m.captured ? VALUE[m.captured] : 0;
      if (attackers.length) {
        const defended = g.attackers(m.to, mover).length > 0;
        const cheapest = Math.min(...attackers.map(sq => VALUE[g.get(sq).type]));
        const net = defended ? lost - cheapest - gained : lost - gained;
        if (net >= 200) {
          parts.push(`Hy sinh ${NAME[m.promotion || m.piece]}! Cho đối thủ ăn để đổi lấy đòn mạnh hơn`);
          tags.push('sacrifice');
        }
      }
    }

    if (!checkers.length && threatensMate(g, mover)) {
      parts.push('Dọa chiếu hết ở nước sau!');
      tags.push('threat');
    }

    // Chưa có chĩa đôi: nói rõ nếu quân vừa đi đang đe dọa xe/hậu (kể cả sau khi vừa ăn quân).
    if (!tags.includes('fork') && !tags.includes('mate')) {
      const big = [];
      for (const row of g.board()) {
        for (const p of row) {
          if (!p || p.color !== opp || (p.type !== 'q' && p.type !== 'r')) continue;
          if (g.attackers(p.square, mover).includes(m.to)) big.push(p);
        }
      }
      if (big.length) parts.push(`Tấn công ${listNames(big)}`);
      else if (parts.length === 1 && !m.captured && !wasInCheck && !m.flags.includes('k') && !m.flags.includes('q')) {
        parts.push(wasThreatened
          ? `Đưa ${NAME[m.piece]} chạy khỏi chỗ đang bị tấn công`
          : 'Một nước yên lặng, chuẩn bị cho đòn tiếp theo');
      }
    }

    return { text: parts.join('. '), san: m.san, from: m.from, to: m.to, fenAfter: g.fen(), tags };
  }

  /** Câu ngắn cho nước của đối thủ: "Đối thủ: vua chạy sang g8 để thoát chiếu". */
  function describeReply(fen, uci) {
    const g = new Chess(fen);
    const inCheck = g.inCheck();
    const m = g.move(toMove(uci));
    let text = baseText(m);
    if (inCheck) text += ' để thoát chiếu';
    if (g.isCheckmate()) text += '. Chiếu hết!';
    else if (g.inCheck()) text += ', chiếu vua';
    return { text, san: m.san, from: m.from, to: m.to, fenAfter: g.fen(), tags: [] };
  }

  /**
   * Giải thích cả một chuỗi nước. `startFen` là thế cờ trước nước đầu tiên của `moves`;
   * `player` là màu của bé; `baselineIndex` là số nước bỏ qua khi tính quân được/mất (vd. nước mồi của đối thủ).
   */
  function explainLine(startFen, moves, player, baselineIndex = 0) {
    const steps = [];
    let fen = startFen;
    let baseFen = startFen;
    moves.forEach((uci, i) => {
      const g = new Chess(fen);
      // Nước của đối thủ cũng được phân tích đầy đủ (chiếu, chĩa đôi, tấn công…) để bé thấy được đòn của đối phương.
      const step = describeMove(fen, uci);
      step.who = g.turn() === player ? 'player' : 'opponent';
      step.fenBefore = fen;
      steps.push(step);
      fen = step.fenAfter;
      if (i + 1 === baselineIndex) baseFen = fen;
    });
    const start = new Chess(baseFen);
    const end = new Chess(fen);
    const before = material(start, player) - material(start, other(player));
    const after = material(end, player) - material(end, other(player));
    let summary;
    if (end.isCheckmate()) summary = end.turn() === player ? 'Kết quả: con bị chiếu hết.' : 'Kết quả: con chiếu hết! 🏁';
    else if (after - before >= 1) summary = `Kết quả: con được lợi ${after - before} điểm quân (tốt = 1, mã/tượng = 3, xe = 5, hậu = 9).`;
    else if (end.isStalemate()) summary = 'Kết quả: hòa pat.';
    else if (after - before <= -1) summary = `Kết quả: con bị thiệt ${before - after} điểm quân.`;
    else summary = 'Kết quả: số quân hai bên không đổi, nhưng thế cờ của con tốt hơn.';
    return { steps, summary };
  }

  /** Vì sao nước `uci` chưa tốt: đối thủ chiếu hết được, hoặc ăn được quân của mình. */
  function whyWrong(fen, uci) {
    const g = new Chess(fen);
    const mover = g.turn();
    const m = g.move(toMove(uci));
    if (g.isStalemate()) return 'Nước này làm hòa pat mất rồi!';
    for (const r of g.moves({ verbose: true })) {
      g.move(r);
      const mate = g.isCheckmate();
      g.undo();
      if (mate) return `Cẩn thận! Sau ${m.san}, đối thủ chiếu hết được bằng ${r.san}.`;
    }
    let worst = null;
    for (const row of g.board()) {
      for (const p of row) {
        if (!p || p.color !== mover || p.type === 'k') continue;
        const attackers = g.attackers(p.square, other(mover));
        if (!attackers.length) continue;
        const defended = g.attackers(p.square, mover).length > 0;
        const cheapest = Math.min(...attackers.map(sq => VALUE[g.get(sq).type]));
        if ((!defended || cheapest < VALUE[p.type]) && (!worst || VALUE[p.type] > VALUE[worst.type])) worst = p;
      }
    }
    if (worst && VALUE[worst.type] >= 300) return `Sau ${m.san}, ${label(worst)} của con có thể bị ăn.`;
    return `${m.san} không sai luật, nhưng chưa tạo được đe dọa đủ mạnh. Hãy tìm nước chiếu, ăn quân hoặc tấn công.`;
  }

  /* ---------------- Đánh giá thế cờ bằng lời ---------------- */

  /** Tỷ lệ thắng (0–100%) ước tính từ điểm (công thức Lichess). */
  function winPct(cp) {
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  }

  /** Mô tả điểm `score` (theo góc nhìn bên `side`) bằng lời. */
  function evalText(score, side) {
    const me = side === 'w' ? 'Trắng' : 'Đen';
    const them = side === 'w' ? 'Đen' : 'Trắng';
    if (score >= 9000) return `${me} sắp chiếu hết`;
    if (score <= -9000) return `${them} sắp chiếu hết`;
    const a = Math.abs(score);
    if (a < 50) return 'hai bên cân bằng';
    const lead = score > 0 ? me : them;
    if (a < 150) return `${lead} nhỉnh hơn một chút`;
    if (a < 350) return `${lead} hơn rõ`;
    return `${lead} thắng thế`;
  }

  /* ---------------- Gợi ý chiến lược ---------------- */

  function pawnFiles(game, color) {
    const files = new Array(8).fill(0);
    for (const row of game.board()) for (const p of row) if (p && p.type === 'p' && p.color === color) files[FILES.indexOf(p.square[0])]++;
    return files;
  }

  const doubled = files => files.map((n, i) => (n > 1 ? i : -1)).filter(i => i >= 0);
  const isolated = files => files.map((n, i) => (n > 0 && !files[i - 1] && !files[i + 1] ? i : -1)).filter(i => i >= 0);

  function mobility(game, color) {
    const parts = game.fen().split(' ');
    parts[1] = color;
    parts[3] = '-';
    try {
      return new Chess(parts.join(' ')).moves().length;
    } catch (e) {
      return 0;
    }
  }

  function canCastle(fen, color) {
    const rights = fen.split(' ')[2];
    return color === 'w' ? /[KQ]/.test(rights) : /[kq]/.test(rights);
  }

  /**
   * So sánh nước của bé (kidUci) với nước tốt nhất (bestUci) về mặt chiến lược.
   * Trả về tối đa 3 câu gợi ý, ví dụ "Nước của con tạo ra tốt chồng ở cột c".
   */
  function positionalHints(fen, kidUci, bestUci) {
    const before = new Chess(fen);
    const me = before.turn();
    const moveNo = Number(fen.split(' ')[5]) || 1;
    const gK = new Chess(fen);
    const kid = gK.move(toMove(kidUci));
    const gB = new Chess(fen);
    const best = gB.move(toMove(bestUci));
    const hints = [];

    const pawnsBefore = pawnFiles(before, me);
    const pawnsKid = pawnFiles(gK, me);
    const pawnsBest = pawnFiles(gB, me);
    for (const f of doubled(pawnsKid)) {
      if (!doubled(pawnsBefore).includes(f) && !doubled(pawnsBest).includes(f)) hints.push(`Nước của con tạo ra tốt chồng ở cột ${FILES[f]}: hai tốt chồng không bảo vệ được nhau`);
    }
    for (const f of isolated(pawnsKid)) {
      if (!isolated(pawnsBefore).includes(f) && !isolated(pawnsBest).includes(f)) hints.push(`Nước của con tạo ra tốt cô lập ở cột ${FILES[f]}`);
    }

    if (best.flags.includes('k') || best.flags.includes('q')) hints.push('Nước tốt hơn là nhập thành để vua được an toàn');
    else if (canCastle(fen, me) && !canCastle(gK.fen(), me) && canCastle(gB.fen(), me)) hints.push('Nước của con làm mất quyền nhập thành, vua sẽ kém an toàn');

    if (kid.piece === 'n' && /[ah]/.test(kid.to[0]) && !kid.captured) hints.push('Mã ra mép bàn cờ: "mã ở biên là mã buồn", kiểm soát được ít ô');

    if (moveNo <= 12) {
      const homeRank = me === 'w' ? '1' : '8';
      const bestDevelops = (best.piece === 'n' || best.piece === 'b') && best.from[1] === homeRank;
      if (kid.piece === 'q' && bestDevelops) hints.push('Ở khai cuộc, nên ra mã và tượng trước khi đưa hậu ra');
      else if (bestDevelops && kid.from[1] !== homeRank && kid.piece !== 'p' && kid.piece !== 'k') hints.push(`Ở khai cuộc, nên ra quân mới (như ${NAME[best.piece]} ở ${best.from}) thay vì đi lại quân đã ra`);
    }

    if (best.piece === 'r' && !pawnsBest[FILES.indexOf(best.to[0])] && !pawnFiles(gB, other(me))[FILES.indexOf(best.to[0])]) {
      hints.push(`Nước tốt hơn đưa xe vào cột mở ${best.to[0]}`);
    }

    const kingSq = kingSquare(before, me);
    if (kid.piece === 'p' && kingSq && /[fgh]/.test(kid.from[0]) && /[gh]/.test(kingSq[0]) && !canCastle(fen, me)) {
      hints.push('Đẩy tốt trước vua đã nhập thành làm vua bị hở');
    }

    const mobKid = mobility(gK, me);
    const mobBest = mobility(gB, me);
    if (mobBest - mobKid >= 6) hints.push(`Sau nước tốt hơn, quân của con hoạt động hơn (có ${mobBest} nước đi so với ${mobKid})`);

    return hints.slice(0, 3);
  }

  window.Explain = { describeMove, describeReply, explainLine, whyWrong, winPct, evalText, positionalHints, NAME };
})();
