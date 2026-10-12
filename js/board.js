/*
 * Bàn cờ tương tác: chạm-chạm hoặc kéo-thả, hiện ô đi được, nước vừa đi, vua bị chiếu.
 * Không tự giữ luật cờ – luật nằm trong đối tượng Chess được truyền vào.
 */
(function () {
  const FILES = 'abcdefgh';
  // Lớp CSS của hình quân cờ (assets/pieces/wK.svg …). Không dùng ký tự ♟ vì nhiều máy tính bảng hiện nó thành emoji màu đen.
  const pieceClass = p => p.color + p.type.toUpperCase();

  class Board {
    /**
     * @param {HTMLElement} el
     * @param {object} opts
     *   game: Chess, orientation: 'w'|'b',
     *   canMove(color) -> bool        – người chơi được đi quân màu này không
     *   onMove({from,to,promotion})   – gọi khi người chơi đi một nước hợp lệ
     *   onSquare(square)              – chế độ chạm ô (bài "find"); khi có thì tắt đi quân
     */
    constructor(el, opts) {
      this.el = el;
      this.opts = opts;
      this.game = opts.game;
      this.orientation = opts.orientation || 'w';
      this.selected = null;
      this.lastMove = null;
      this.marks = new Set();
      this.hintSquare = null;
      this.locked = false;
      this.drag = null;
      this.build();
      this.render();
    }

    build() {
      this.el.innerHTML = '';
      this.el.classList.add('board');
      this.squares = {};
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const sq = document.createElement('div');
          sq.className = 'sq';
          this.el.appendChild(sq);
          this.squares[`${row},${col}`] = sq;
        }
      }
      this.el.addEventListener('pointerdown', e => this.pointerDown(e));
      this.el.addEventListener('pointermove', e => this.pointerMove(e));
      this.el.addEventListener('pointerup', e => this.pointerUp(e));
      this.el.addEventListener('pointercancel', () => this.cancelDrag());
      this.el.addEventListener('contextmenu', e => e.preventDefault());
    }

    nameAt(row, col) {
      const file = this.orientation === 'w' ? col : 7 - col;
      const rank = this.orientation === 'w' ? 8 - row : row + 1;
      return FILES[file] + rank;
    }

    squareFromEvent(e) {
      const rect = this.el.getBoundingClientRect();
      const col = Math.floor(((e.clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((e.clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      return this.nameAt(row, col);
    }

    setOrientation(color) {
      this.orientation = color;
      this.render();
    }

    setLastMove(from, to) {
      this.lastMove = from ? { from, to } : null;
    }

    setHint(square) {
      this.hintSquare = square;
      this.render();
    }

    toggleMark(square) {
      if (this.marks.has(square)) this.marks.delete(square);
      else this.marks.add(square);
      this.render();
    }

    clearMarks() {
      this.marks.clear();
      this.render();
    }

    legalTargets(from) {
      return this.game.moves({ square: from, verbose: true }).map(m => m.to);
    }

    render() {
      const checkSquare = this.game.inCheck() ? this.findKing(this.game.turn()) : null;
      const targets = this.selected ? new Set(this.legalTargets(this.selected)) : new Set();
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const name = this.nameAt(row, col);
          const el = this.squares[`${row},${col}`];
          const fileIdx = FILES.indexOf(name[0]);
          const rankIdx = Number(name[1]);
          const light = (fileIdx + rankIdx) % 2 === 1;
          const classes = ['sq', light ? 'light' : 'dark'];
          if (this.lastMove && (name === this.lastMove.from || name === this.lastMove.to)) classes.push('last');
          if (name === this.selected) classes.push('selected');
          if (name === checkSquare) classes.push('check');
          if (name === this.hintSquare) classes.push('hint');
          if (this.marks.has(name)) classes.push('marked');
          const piece = this.game.get(name);
          if (targets.has(name)) classes.push(piece ? 'target-capture' : 'target');
          el.className = classes.join(' ');

          let html = '';
          if (piece) {
            const dragging = this.drag && this.drag.moved && this.drag.from === name;
            html += `<span class="piece ${pieceClass(piece)}${dragging ? ' ghost' : ''}"></span>`;
          }
          if (col === 0) html += `<span class="coord rank">${name[1]}</span>`;
          if (row === 7) html += `<span class="coord file">${name[0]}</span>`;
          el.innerHTML = html;
        }
      }
    }

    findKing(color) {
      const b = this.game.board();
      for (const row of b) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square;
      return null;
    }

    canPick(square) {
      const piece = this.game.get(square);
      return piece && piece.color === this.game.turn() && this.opts.canMove(piece.color);
    }

    pointerDown(e) {
      if (this.locked) return;
      const square = this.squareFromEvent(e);
      if (!square) return;
      if (this.opts.onSquare) {
        this.opts.onSquare(square);
        return;
      }
      if (this.selected && this.selected !== square && this.legalTargets(this.selected).includes(square)) {
        this.tryMove(this.selected, square);
        return;
      }
      if (this.canPick(square)) {
        this.selected = square;
        this.drag = { from: square, moved: false, ghost: null, x: e.clientX, y: e.clientY };
        try { this.el.setPointerCapture(e.pointerId); } catch (err) { /* con trỏ giả lập: bỏ qua */ }
        this.render();
      } else {
        this.selected = null;
        this.render();
      }
    }

    pointerMove(e) {
      if (!this.drag) return;
      if (!this.drag.moved) {
        if (Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y) < 6) return;
        this.drag.moved = true;
        const piece = this.game.get(this.drag.from);
        const ghost = document.createElement('div');
        ghost.className = `drag-ghost piece ${pieceClass(piece)}`;
        const size = this.el.getBoundingClientRect().width / 8;
        ghost.style.width = ghost.style.height = size + 'px';
        document.body.appendChild(ghost);
        this.drag.ghost = ghost;
        this.render();
      }
      this.drag.ghost.style.left = e.clientX + 'px';
      this.drag.ghost.style.top = e.clientY + 'px';
    }

    pointerUp(e) {
      if (!this.drag) return;
      const { from, moved } = this.drag;
      this.cancelDrag();
      if (!moved) return; // chạm thường: giữ lựa chọn, chờ chạm ô đích
      const to = this.squareFromEvent(e);
      if (to && to !== from && this.legalTargets(from).includes(to)) this.tryMove(from, to);
      else this.render();
    }

    cancelDrag() {
      if (this.drag && this.drag.ghost) this.drag.ghost.remove();
      this.drag = null;
    }

    tryMove(from, to) {
      const piece = this.game.get(from);
      let promotion;
      if (piece.type === 'p' && (to[1] === '8' || to[1] === '1')) promotion = 'q';
      this.selected = null;
      this.hintSquare = null;
      this.opts.onMove({ from, to, promotion });
    }

    flash(kind) {
      this.el.classList.remove('flash-good', 'flash-bad');
      void this.el.offsetWidth; // khởi động lại animation
      this.el.classList.add(kind === 'good' ? 'flash-good' : 'flash-bad');
    }
  }

  window.Board = Board;
})();
