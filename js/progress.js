/*
 * Lưu tiến độ học trong localStorage của trình duyệt (chỉ trên máy này).
 * Phụ huynh có thể xuất/nhập file sao lưu ở trang Phụ huynh.
 */
(function () {
  const KEY = 'covuanhi.progress.v1';

  const INTERVALS = [1, 3, 7, 14, 30]; // số ngày chờ trước lần ôn tiếp theo, theo từng "hộp"

  function addDays(dateKey, n) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const x = new Date(y, m - 1, d + n);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  }

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fresh() {
    return {
      name: '',
      lessons: {},   // id -> { stars, bestMistakes, attempts, lastDone }
      days: {},      // 'YYYY-MM-DD' -> { minutes, solved }
      games: [],     // { date, level, color, result }
      puzzleRating: 800,   // điểm giải đố kiểu Elo, cập nhật sau mỗi bài từ kho Lichess
      puzzleSeen: {},      // id bài -> 1 (đúng ngay lần đầu) | 0 (sai/xem đáp án)
      ratingByDay: {},     // 'YYYY-MM-DD' -> điểm cuối ngày
      reviews: {},         // sổ ôn tập: khóa -> { ex, box, due, added, title }
      mastered: 0,         // số bài đã ôn thuộc và rời sổ
      openings: {},        // id thế khai cuộc -> { runs, clean, lastDone }
      reviewedGames: 0,    // số ván đã xem lại cùng máy
      settings: { unlockAll: false, sound: true, voice: true, hangingWarning: true }
    };
  }

  let data = fresh();

  // Bé đã học xong Giai đoạn 1 thì bắt đầu từ điểm cao hơn một chút.
  function startingRating(d) {
    const done = Object.values(d.lessons || {}).filter(l => l.stars > 0).length;
    return 700 + Math.min(done, 14) * 15;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        data = Object.assign(fresh(), saved);
        if (!saved.puzzleRating) data.puzzleRating = startingRating(data); // nâng cấp từ bản cũ
        data.settings = Object.assign(fresh().settings, saved.settings);
      }
    } catch (e) {
      console.warn('Không đọc được tiến độ đã lưu', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Không lưu được tiến độ', e);
    }
  }

  function day(dateKey = today()) {
    if (!data.days[dateKey]) data.days[dateKey] = { minutes: 0, solved: 0 };
    return data.days[dateKey];
  }

  const Progress = {
    get data() { return data; },
    today,

    setName(name) { data.name = name.trim(); save(); },

    lesson(id) { return data.lessons[id] || null; },

    isUnlocked(units, index) {
      if (data.settings.unlockAll || index === 0) return true;
      const prev = data.lessons[units[index - 1].id];
      return !!(prev && prev.stars > 0);
    },

    finishLesson(id, stars, mistakes) {
      const rec = data.lessons[id] || { stars: 0, bestMistakes: null, attempts: 0, lastDone: null };
      rec.stars = Math.max(rec.stars, stars);
      rec.bestMistakes = rec.bestMistakes === null ? mistakes : Math.min(rec.bestMistakes, mistakes);
      rec.attempts += 1;
      rec.lastDone = today();
      data.lessons[id] = rec;
      save();
    },

    addSolved(n = 1) { day().solved += n; save(); },

    /** Cập nhật điểm giải đố sau một bài có độ khó `rating`; success = giải đúng ngay, không gợi ý. */
    recordPuzzle(id, rating, success) {
      const expected = 1 / (1 + Math.pow(10, (rating - data.puzzleRating) / 400));
      const k = Object.keys(data.puzzleSeen).length < 30 ? 40 : 24; // lúc đầu điều chỉnh nhanh hơn
      data.puzzleRating = Math.max(100, Math.round(data.puzzleRating + k * ((success ? 1 : 0) - expected)));
      data.puzzleSeen[id] = success ? 1 : 0;
      data.ratingByDay[today()] = data.puzzleRating;
      save();
    },

    addMinute() { day().minutes += 1; save(); },

    addGame(level, color, result) {
      data.games.push({ date: today(), level, color, result });
      save();
    },

    totalStars() {
      return Object.values(data.lessons).reduce((s, l) => s + l.stars, 0);
    },

    /** Số ngày học liên tiếp tính đến hôm nay (hoặc hôm qua nếu hôm nay chưa học). */
    streak() {
      let count = 0;
      const d = new Date();
      const active = key => data.days[key] && (data.days[key].solved > 0 || data.days[key].minutes >= 5);
      const keyOf = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
      if (!active(keyOf(d))) d.setDate(d.getDate() - 1);
      while (active(keyOf(d))) {
        count++;
        d.setDate(d.getDate() - 1);
      }
      return count;
    },

    lastDays(n) {
      const out = [];
      const d = new Date();
      d.setDate(d.getDate() - (n - 1));
      for (let i = 0; i < n; i++) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        out.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, ...(data.days[key] || { minutes: 0, solved: 0 }) });
        d.setDate(d.getDate() + 1);
      }
      return out;
    },

    /* ---------- Sổ ôn tập (lặp lại ngắt quãng kiểu hộp Leitner) ---------- */

    reviewKey(ex) {
      if (ex.id) return 'p:' + ex.id;
      if (ex.type === 'line') return 'o:' + ex.line;
      return `${ex.type}:${ex.fen}:${(ex.answers || []).join(',')}`;
    },

    /** Ghi kết quả một bài. Sai: vào sổ, ôn lại ngày mai. Đúng khi đến hạn: giãn khoảng cách, đủ 5 lần thì thuộc. */
    reviewRecord(ex, success, title) {
      const key = this.reviewKey(ex);
      const rec = data.reviews[key];
      const t = today();
      if (!success) {
        const { fromReview, ...plain } = ex;
        data.reviews[key] = { ex: plain, box: 0, due: addDays(t, 1), added: rec ? rec.added : t, title: title || (rec && rec.title) || '' };
      } else if (rec && rec.due <= t) {
        rec.box += 1;
        if (rec.box >= INTERVALS.length) {
          delete data.reviews[key];
          data.mastered += 1;
        } else {
          rec.due = addDays(t, INTERVALS[rec.box]);
        }
      } else if (!rec && ex.type === 'line') {
        // Thế khai cuộc vừa học: đưa vào sổ để ôn lại cho thuộc.
        data.reviews[key] = { ex, box: 0, due: addDays(t, 1), added: t, title: title || '' };
      } else {
        return;
      }
      save();
    },

    /** Thêm thẳng một bài vào sổ (vd. sai lầm tìm được khi xem lại ván). */
    reviewAdd(ex, title) {
      const key = this.reviewKey(ex);
      if (data.reviews[key]) return;
      data.reviews[key] = { ex, box: 0, due: addDays(today(), 1), added: today(), title: title || '' };
      save();
    },

    dueReviews() {
      const t = today();
      return Object.values(data.reviews).filter(r => r.due <= t).sort((a, b) => (a.due < b.due ? -1 : 1));
    },

    recordOpening(lineId, clean) {
      const rec = data.openings[lineId] || { runs: 0, clean: 0, lastDone: null };
      rec.runs += 1;
      if (clean) rec.clean += 1;
      rec.lastDone = today();
      data.openings[lineId] = rec;
      save();
    },

    addReviewedGame() { data.reviewedGames += 1; save(); },

    setSetting(name, value) { data.settings[name] = value; save(); },

    exportJson() { return JSON.stringify(data, null, 2); },

    importJson(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.lessons) throw new Error('File không đúng định dạng');
      data = Object.assign(fresh(), parsed);
      data.settings = Object.assign(fresh().settings, parsed.settings);
      save();
    },

    reset() { data = fresh(); save(); }
  };

  load();
  window.Progress = Progress;
})();
