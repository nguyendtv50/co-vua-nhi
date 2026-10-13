"""Kiểm tra mọi bài tập trong js/curriculum.js bằng python-chess.

Chạy:  python tools/validate.py
Cần:   pip install chess
"""
import json
import pathlib
import sys

import chess

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "js" / "curriculum.js"
PUZZLES = ROOT / "js" / "puzzles.js"


def load_js_json(path, name):
    text = path.read_text(encoding="utf-8")
    body = text.split(f"window.{name} =", 1)[1].strip().rstrip(";")
    return json.loads(body)


def load_curriculum():
    return load_js_json(SOURCE, "CURRICULUM")


def check_puzzle(item, where, errors):
    pid, fen, moves, rating, themes = item
    board = board_from(fen, f"{where} {pid}", errors)
    if board is None:
        return
    for uci in moves.split():
        move = chess.Move.from_uci(uci)
        if move not in board.legal_moves:
            errors.append(f"{where} {pid}: nước {uci} không hợp lệ")
            return
        board.push(move)
    if "mate" in themes.split() and not board.is_checkmate():
        errors.append(f"{where} {pid}: lời giải không kết thúc bằng chiếu hết")


def board_from(fen, where, errors):
    try:
        board = chess.Board(fen)
    except ValueError as exc:
        errors.append(f"{where}: FEN lỗi ({exc})")
        return None
    status = board.status()
    if status != chess.STATUS_VALID:
        errors.append(f"{where}: thế cờ không hợp lệ ({status!r})")
        return None
    return board


def hanging_black(board):
    found = set()
    for square, piece in board.piece_map().items():
        if piece.color == chess.BLACK and piece.piece_type != chess.KING:
            if not board.attackers(chess.BLACK, square):
                found.add(chess.square_name(square))
    return found


def check_exercise(ex, where, errors):
    kind = ex["type"]
    board = None
    if "fen" in ex:
        board = board_from(ex["fen"], where, errors)
        if board is None:
            return

    if kind == "quiz":
        if not 0 <= ex["answer"] < len(ex["choices"]):
            errors.append(f"{where}: đáp án quiz nằm ngoài danh sách lựa chọn")
        verify = ex.get("verify")
        if verify == "checkmate" and not board.is_checkmate():
            errors.append(f"{where}: quiz nói chiếu hết nhưng thế cờ không phải chiếu hết")
        if verify == "stalemate" and not board.is_stalemate():
            errors.append(f"{where}: quiz nói hòa pat nhưng thế cờ không phải hòa pat")

    elif kind == "mate1":
        if board.is_game_over():
            errors.append(f"{where}: ván cờ đã kết thúc")
            return
        mates = []
        for move in board.legal_moves:
            board.push(move)
            if board.is_checkmate():
                mates.append(move.uci())
            board.pop()
        if not mates:
            errors.append(f"{where}: không có nước chiếu hết trong 1 nước")

    elif kind == "move":
        legal = {m.uci() for m in board.legal_moves}
        for uci in ex["answers"]:
            if uci not in legal:
                errors.append(f"{where}: đáp án {uci} không phải nước hợp lệ")
        # Nếu có nước chiếu hết ngay mà không nằm trong đáp án, bé đi nước hay nhất lại bị chấm sai.
        for move in board.legal_moves:
            board.push(move)
            mate = board.is_checkmate()
            board.pop()
            if mate and move.uci() not in ex["answers"]:
                errors.append(f"{where}: {move.uci()} chiếu hết ngay nhưng không có trong đáp án")

    elif kind == "find":
        answers = set(ex["answers"])
        if ex["mode"] == "hanging":
            actual = hanging_black(board)
            if answers != actual:
                errors.append(f"{where}: quân treo đúng là {sorted(actual)}, dữ liệu ghi {sorted(answers)}")
        else:
            for name in answers:
                if name not in chess.SQUARE_NAMES:
                    errors.append(f"{where}: ô {name} không tồn tại")

    elif kind == "drill":
        if ex["goal"] not in ("mate", "promote", "win"):
            errors.append(f"{where}: goal không hợp lệ")
        if board.is_game_over():
            errors.append(f"{where}: ván cờ đã kết thúc")

    elif kind == "gen":
        if ex["pieces"] not in ("Q", "R", "RR"):
            errors.append(f"{where}: pieces không hỗ trợ")

    elif kind == "pack":
        size = len(PACKS.get(ex["pack"], []))
        if size < ex["count"]:
            errors.append(f"{where}: gói '{ex['pack']}' chỉ có {size} bài, cần ít nhất {ex['count']}")

    else:
        errors.append(f"{where}: loại bài tập lạ '{kind}'")


PACKS = {}
OPENINGS = ROOT / "js" / "openings.js"


def check_openings(errors):
    data = load_js_json(OPENINGS, "OPENINGS")
    ids = set()
    count = 0
    for rep in data["repertoires"]:
        for line in rep["lines"]:
            count += 1
            where = f"[khai cuộc {line['id']}]"
            if line["id"] in ids:
                errors.append(f"{where}: trùng id")
            ids.add(line["id"])
            moves = line["moves"].split()
            if len(moves) != len(line["notes"]):
                errors.append(f"{where}: {len(moves)} nước nhưng có {len(line['notes'])} lời giải thích")
            if not line.get("idea") or not line.get("tips"):
                errors.append(f"{where}: thiếu ý tưởng chính (idea) hoặc mẹo nhớ (tips)")
            board = chess.Board()
            for san in moves:
                try:
                    board.push_san(san)
                except ValueError:
                    errors.append(f"{where}: nước {san} không hợp lệ")
                    break
            # Bé phải là người đi nước cuối cùng để kết thúc bằng nước của mình.
            if len(moves) % 2 == (0 if rep["color"] == "w" else 1):
                errors.append(f"{where}: nên kết thúc bằng nước của bên {rep['color']}")
    return count


def main():
    data = load_curriculum()
    errors = []
    puzzle_total = 0
    if PUZZLES.exists():
        puzzles = load_js_json(PUZZLES, "PUZZLES")
        PACKS.update(puzzles["packs"])
        ids = set()
        for name, items in list(puzzles["packs"].items()) + [("pool", puzzles["pool"])]:
            for item in items:
                puzzle_total += 1
                if item[0] in ids:
                    errors.append(f"[puzzles {name}] trùng bài {item[0]}")
                ids.add(item[0])
                check_puzzle(item, f"[puzzles {name}]", errors)
    ids = set()
    total = 0
    for unit in data["units"]:
        if unit["id"] in ids:
            errors.append(f"trùng id bài học {unit['id']}")
        ids.add(unit["id"])
        for i, ex in enumerate(unit["exercises"], 1):
            total += 1
            check_exercise(ex, f"[{unit['id']} #{i}]", errors)

    opening_total = check_openings(errors) if OPENINGS.exists() else 0

    if errors:
        print("\n".join(errors))
        print(f"\n{len(errors)} lỗi / {total} bài tập")
        sys.exit(1)
    print(f"OK: {len(data['units'])} bài học, {total} bài tập, {puzzle_total} bài từ kho Lichess "
          f"và {opening_total} thế khai cuộc đều hợp lệ.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # cửa sổ lệnh Windows mặc định không in được tiếng Việt
    main()
