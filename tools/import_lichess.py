"""Lọc kho bài tập Lichess (CC0) thành js/puzzles.js cho Cờ Vua Nhí.

Tải file:  https://database.lichess.org/lichess_db_puzzle.csv.zst  (~300 MB)
Chạy:      python tools/import_lichess.py <đường dẫn tới lichess_db_puzzle.csv.zst>
Cần:       pip install chess zstandard

Mỗi dòng CSV: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
FEN là thế cờ TRƯỚC nước đi của đối thủ; Moves[0] là nước của đối thủ, sau đó là lời giải xen kẽ.
"""
import csv
import io
import json
import math
import pathlib
import sys

import chess
import zstandard

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "puzzles.js"

MIN_POPULARITY = 85
MIN_PLAYS = 500
MAX_DEVIATION = 90
MAX_PLIES = 6          # nước đối thủ + tối đa 3 nước của bé
BAND = 100             # chia độ khó theo khoảng 100 điểm để bài trải đều từ dễ đến khó

# (mã gói, chủ đề cần có (một trong số), điểm thấp nhất, điểm cao nhất, số bài)
PACKS = [
    ("mate2", {"mateIn2"}, 600, 1500, 100),
    ("matepatterns", {"backRankMate", "smotheredMate", "anastasiaMate", "arabianMate", "hookMate",
                      "bodenMate", "doubleBishopMate", "dovetailMate"}, 500, 1500, 80),
    ("mate3", {"mateIn3"}, 800, 1700, 60),
    ("attack", {"kingsideAttack", "exposedKing"}, 700, 1500, 80),
    ("fork", {"fork"}, 400, 1500, 150),
    ("pinskewer", {"pin", "skewer"}, 400, 1500, 150),
    ("discovered", {"discoveredAttack", "doubleCheck"}, 500, 1500, 100),
    ("deflection", {"deflection", "attraction"}, 600, 1600, 90),
    ("defender", {"capturingDefender", "trappedPiece"}, 500, 1500, 90),
    ("quiet", {"intermezzo", "quietMove", "clearance"}, 900, 1700, 50),
    ("opening", {"opening"}, 500, 1300, 50),
    ("pawnend", {"pawnEndgame"}, 500, 1500, 40),
    ("promotion", {"promotion", "advancedPawn"}, 500, 1400, 50),
    ("rookend", {"rookEndgame"}, 600, 1500, 40),
    ("defense", {"defensiveMove"}, 700, 1500, 50),
    ("hanging", {"hangingPiece"}, 400, 1200, 100),
    ("sacrifice", {"sacrifice"}, 700, 1600, 60),
    ("xray", {"xRayAttack", "interference"}, 800, 1700, 40),
    ("mate1", {"mateIn1"}, 400, 1100, 80),
]
POOL_RANGE = (400, 1800)
POOL_PER_BAND = 140    # kho luyện tập thích ứng theo điểm của bé

# Chỉ giữ các chủ đề app dùng để hiển thị đề bài.
KEEP_THEMES = {"mateIn1", "mateIn2", "mateIn3", "mate", "endgame", "opening", "middlegame"}


def bands(lo, hi):
    return list(range(lo, hi, BAND))


def band_of(rating):
    return rating // BAND * BAND


def verify(fen, moves, themes):
    """Kiểm tra lời giải hợp lệ; với bài chiếu hết thì nước cuối phải chiếu hết."""
    try:
        board = chess.Board(fen)
        for uci in moves:
            move = chess.Move.from_uci(uci)
            if move not in board.legal_moves:
                return False
            board.push(move)
    except ValueError:
        return False
    if themes & {"mateIn1", "mateIn2", "mateIn3", "mate"} and not board.is_checkmate():
        return False
    return True


def main(path):
    packs = {}
    for pack_id, need, lo, hi, count in PACKS:
        per_band = math.ceil(count / len(bands(lo, hi)))
        packs[pack_id] = {"need": need, "lo": lo, "hi": hi, "per_band": per_band,
                          "bands": {b: [] for b in bands(lo, hi)}}
    pool = {b: [] for b in bands(*POOL_RANGE)}
    used = set()
    seen = 0

    # Giữ nguyên các bài đã có (tiến độ của bé lưu theo mã bài), chỉ bổ sung bài mới cho đủ số lượng.
    if OUT.exists():
        old = json.loads(OUT.read_text(encoding="utf-8").split("window.PUZZLES =", 1)[1].strip().rstrip(";"))
        for pack_id, items in old["packs"].items():
            for item in items:
                used.add(item[0])
                if pack_id in packs:
                    packs[pack_id]["bands"].setdefault(band_of(item[3]), []).append(item)
        for item in old["pool"]:
            used.add(item[0])
            pool.setdefault(band_of(item[3]), []).append(item)

    with open(path, "rb") as fh:
        reader = zstandard.ZstdDecompressor().stream_reader(fh)
        text = io.TextIOWrapper(reader, encoding="utf-8", newline="")
        rows = csv.reader(text)
        header = next(rows)
        col = {name: i for i, name in enumerate(header)}
        for row in rows:
            seen += 1
            if seen % 500000 == 0:
                print(f"  đã đọc {seen:,} bài…", flush=True)
            try:
                rating = int(row[col["Rating"]])
                if (int(row[col["Popularity"]]) < MIN_POPULARITY or int(row[col["NbPlays"]]) < MIN_PLAYS
                        or int(row[col["RatingDeviation"]]) > MAX_DEVIATION):
                    continue
            except ValueError:
                continue
            moves = row[col["Moves"]].split()
            if len(moves) < 2 or len(moves) > MAX_PLIES:
                continue
            themes = set(row[col["Themes"]].split())
            pid = row[col["PuzzleId"]]
            if pid in used:
                continue
            item = None

            for pack_id, p in packs.items():
                if not (p["lo"] <= rating < p["hi"]) or not (themes & p["need"]):
                    continue
                bucket = p["bands"].setdefault(band_of(rating), [])
                if len(bucket) >= p["per_band"]:
                    continue
                item = item or make_item(pid, row[col["FEN"]], moves, rating, themes)
                if item is None:
                    break
                bucket.append(item)
                used.add(pid)
                break

            if pid not in used and POOL_RANGE[0] <= rating < POOL_RANGE[1]:
                bucket = pool.setdefault(band_of(rating), [])
                if len(bucket) < POOL_PER_BAND:
                    item = item or make_item(pid, row[col["FEN"]], moves, rating, themes)
                    if item is not None:
                        bucket.append(item)

            if seen % 20000 == 0 and all(len(p["bands"].get(b, [])) >= p["per_band"]
                                         for p in packs.values() for b in bands(p["lo"], p["hi"])) \
                    and all(len(b) >= POOL_PER_BAND for b in pool.values()):
                break

    out_packs = {}
    for pack_id, p in packs.items():
        items = [x for b in p["bands"].values() for x in b]
        items.sort(key=lambda x: x[3])
        out_packs[pack_id] = items
        print(f"{pack_id:14s} {len(items):4d} bài  ({items[0][3] if items else '-'}–{items[-1][3] if items else '-'})")
    out_pool = sorted((x for b in pool.values() for x in b), key=lambda x: x[3])
    print(f"{'pool':14s} {len(out_pool):4d} bài")

    payload = {"source": "Lichess puzzle database (CC0) – database.lichess.org",
               "format": ["id", "fen", "moves", "rating", "themes"],
               "packs": out_packs, "pool": out_pool}
    OUT.write_text(
        "/* Bài tập lọc từ kho Lichess (CC0) bằng tools/import_lichess.py. Không sửa tay. */\n"
        "window.PUZZLES = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")
    print(f"Đã ghi {OUT} ({OUT.stat().st_size / 1024:.0f} KB), đọc {seen:,} dòng.")


def make_item(pid, fen, moves, rating, themes):
    if not verify(fen, moves, themes):
        return None
    return [pid, fen, " ".join(moves), rating, " ".join(sorted(themes & KEEP_THEMES))]


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # cửa sổ lệnh Windows mặc định không in được tiếng Việt
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1])
