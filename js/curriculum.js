/*
 * Giáo trình "Cờ Vua Nhí" – Giai đoạn 1 (tháng 1–3, cơ bản) và Giai đoạn 2 (tháng 4–6, nâng cao).
 * Phần sau dấu "=" phải là JSON hợp lệ: tools/validate.py đọc file này để kiểm tra mọi thế cờ.
 *
 * Các loại bài tập:
 *   quiz  – câu hỏi trắc nghiệm (có thể kèm thế cờ). verify: "checkmate" | "stalemate" để máy kiểm tra.
 *   mate1 – chiếu hết trong 1 nước. Mọi nước chiếu hết đều được chấp nhận.
 *   move  – tìm nước đúng. answers: danh sách nước dạng UCI (vd "e2e4", "b7b8q").
 *   find  – chạm vào các ô. mode "hanging": quân Đen không được bảo vệ; mode "square": ô theo tên.
 *   drill – chơi với máy từ thế cờ cho đến khi đạt mục tiêu (goal: mate | promote | win).
 *   gen   – máy tự tạo bài chiếu hết 1 nước với các quân Trắng cho trước (pieces: "Q", "R", "RR").
 *   pack  – lấy `count` bài từ một gói trong js/puzzles.js (kho Lichess), dễ trước khó sau,
 *           ưu tiên bài bé chưa giải. Bài có thể dài nhiều nước; máy tự đi nước của đối thủ.
 */
window.CURRICULUM = {
  "units": [
    {
      "id": "luat",
      "icon": "📜",
      "title": "Ôn luật đặc biệt",
      "month": 0,
      "week": "Tuần 0",
      "goal": "Nắm chắc nhập thành, bắt tốt qua đường, phong cấp, chiếu hết và hòa pat.",
      "intro": [
        "Chào con! Trước khi học bài mới, mình cùng ôn lại vài luật đặc biệt của cờ vua nhé.",
        "Nhập thành: vua đi 2 ô sang một bên, xe nhảy qua đứng cạnh vua. Chỉ được nhập thành khi vua và xe chưa đi lần nào, vua không bị chiếu, và giữa vua với xe không có quân nào.",
        "Bắt tốt qua đường: khi tốt đối phương đi 2 ô và đứng ngay cạnh tốt của mình, mình được ăn nó như thể nó chỉ đi 1 ô. Phải ăn ngay nước tiếp theo!",
        "Phong cấp: tốt đi đến hàng cuối cùng sẽ biến thành hậu (hoặc xe, tượng, mã).",
        "Chiếu hết là vua bị chiếu và không thoát được: thắng! Hòa pat là vua KHÔNG bị chiếu nhưng không còn nước nào đi được: hòa."
      ],
      "exercises": [
        { "type": "move", "fen": "r3k2r/pppq1ppp/2npbn2/2b1p3/2B1P3/2NPBN2/PPPQ1PPP/R3K2R w KQkq - 0 1", "prompt": "Hãy nhập thành cánh vua (về phía bên phải). Chạm vào vua rồi chạm vào ô g1.", "answers": ["e1g1"], "hint": "e1" },
        { "type": "move", "fen": "r3k2r/pppq1ppp/2npbn2/2b1p3/2B1P3/2NPBN2/PPPQ1PPP/R3K2R w KQkq - 0 1", "prompt": "Bây giờ hãy nhập thành cánh hậu (về phía bên trái).", "answers": ["e1c1"], "hint": "e1" },
        { "type": "quiz", "question": "Vua đang bị chiếu thì có được nhập thành không?", "choices": ["Được", "Không được"], "answer": 1, "explain": "Đúng rồi! Khi bị chiếu phải thoát chiếu trước, không được nhập thành." },
        { "type": "move", "fen": "4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2", "prompt": "Tốt Đen vừa đi 2 ô từ d7 xuống d5. Hãy bắt tốt qua đường!", "answers": ["e5d6"], "hint": "e5", "wrongHint": "Chưa đúng rồi! Tốt e5 được ăn tốt d5 như thể tốt đen chỉ đi 1 ô đến d6. Chạm vào tốt e5 rồi chạm vào ô trống d6 nhé.", "explain": "Tốt trắng đi chéo lên ô d6, và tốt đen ở d5 bị ăn mất. Nhớ nhé: chỉ được bắt qua đường ngay nước tiếp theo, chậm một nước là mất quyền!" },
        { "type": "move", "fen": "4k3/1P6/8/8/8/8/8/4K3 w - - 0 1", "prompt": "Đưa tốt lên hàng cuối để phong hậu!", "answers": ["b7b8q"], "hint": "b7" },
        { "type": "quiz", "fen": "k7/8/1Q6/8/8/8/8/K7 b - - 0 1", "verify": "stalemate", "question": "Đến lượt Đen đi. Đây là gì?", "choices": ["Chiếu hết – Trắng thắng", "Hòa pat – hai bên hòa", "Đen vẫn còn nước đi"], "answer": 1, "explain": "Vua Đen không bị chiếu nhưng không còn ô nào để đi, nên là hòa pat." },
        { "type": "quiz", "fen": "R5k1/5ppp/8/8/8/8/8/6K1 b - - 0 1", "verify": "checkmate", "question": "Đến lượt Đen đi. Đây là gì?", "choices": ["Chiếu hết – Trắng thắng", "Hòa pat – hai bên hòa", "Đen vẫn còn nước đi"], "answer": 0, "explain": "Vua bị xe chiếu và các tốt Đen chặn đường thoát: chiếu hết!" }
      ]
    },
    {
      "id": "haixe",
      "icon": "🏰",
      "title": "Chiếu hết bằng 2 xe",
      "month": 1,
      "week": "Tuần 1",
      "goal": "Chiếu hết vua đơn bằng 2 xe theo kiểu 'leo thang'.",
      "intro": [
        "Hai xe có thể chiếu hết vua mà không cần vua mình giúp.",
        "Cách làm giống như leo thang: một xe chặn một hàng, xe kia chiếu ở hàng bên cạnh. Cứ thay phiên nhau, vua Đen bị đẩy dần ra mép bàn cờ.",
        "Khi vua Đen ở mép bàn cờ, một xe chặn hàng thứ hai, xe kia chiếu ở hàng cuối: chiếu hết!",
        "Cẩn thận: nếu vua Đen đứng sát xe, hãy đưa xe đi thật xa ở đầu bên kia."
      ],
      "exercises": [
        { "type": "quiz", "fen": "R5k1/1R6/8/8/8/8/8/6K1 b - - 0 1", "verify": "checkmate", "question": "Vua Đen đã bị chiếu hết chưa?", "choices": ["Chiếu hết rồi!", "Chưa, vua còn chạy được"], "answer": 0, "explain": "Xe b7 chặn hàng 7, xe a8 chiếu ở hàng 8. Vua hết đường chạy!" },
        { "type": "mate1", "fen": "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1", "prompt": "Xe a7 đã chặn hàng 7. Chiếu hết bằng xe còn lại!" },
        { "type": "mate1", "fen": "k7/7R/8/8/8/8/8/K5R1 w - - 0 1", "prompt": "Chiếu hết trong 1 nước!" },
        { "type": "mate1", "fen": "4K2R/8/8/8/8/8/R7/4k3 w - - 0 1", "prompt": "Vua Đen ở hàng 1. Chiếu hết nhé!" },
        { "type": "mate1", "fen": "R7/8/8/8/7k/8/8/K5R1 w - - 0 1", "prompt": "Vua Đen ở mép phải. Chiếu hết!" },
        { "type": "gen", "pieces": "RR", "count": 4, "prompt": "Bài tự động: chiếu hết trong 1 nước bằng 2 xe!" },
        { "type": "drill", "fen": "8/8/8/4k3/8/8/8/R3K2R w - - 0 1", "goal": "mate", "maxMoves": 25, "botLevel": 3, "prompt": "Thử thách: chiếu hết vua Đen bằng 2 xe trong 25 nước. Máy sẽ cố chạy trốn!" }
      ]
    },
    {
      "id": "hau",
      "icon": "👑",
      "title": "Chiếu hết bằng hậu",
      "month": 1,
      "week": "Tuần 1–2",
      "goal": "Chiếu hết bằng hậu và vua, không để hòa pat.",
      "intro": [
        "Hậu đi được như xe và tượng cộng lại, nên rất mạnh.",
        "Bước 1: dùng hậu thu hẹp chỗ đứng của vua Đen, đẩy nó ra mép bàn cờ. Mẹo hay: đặt hậu cách vua Đen một nước mã.",
        "Bước 2: khi vua Đen đã ở mép, đưa vua Trắng lại gần để bảo vệ hậu.",
        "Bước 3: hậu chiếu hết ở mép bàn cờ.",
        "Cẩn thận hòa pat! Nếu vua Đen không bị chiếu mà không còn ô để đi thì ván cờ hòa."
      ],
      "exercises": [
        { "type": "mate1", "fen": "7k/8/6K1/8/8/8/Q7/8 w - - 0 1", "prompt": "Vua Trắng đã đứng gần. Hậu chiếu hết đi!" },
        { "type": "mate1", "fen": "k7/8/1K6/8/8/8/7Q/8 w - - 0 1", "prompt": "Chiếu hết trong 1 nước!" },
        { "type": "mate1", "fen": "8/8/8/8/8/1K6/7Q/k7 w - - 0 1", "prompt": "Vua Đen ở góc bàn cờ. Chiếu hết!" },
        { "type": "quiz", "fen": "k7/2Q5/1K6/8/8/8/8/8 b - - 0 1", "verify": "stalemate", "question": "Trắng vừa đi hậu đến c7. Đến lượt Đen. Kết quả là gì?", "choices": ["Trắng thắng vì chiếu hết", "Hòa pat – thật tiếc!"], "answer": 1, "explain": "Vua Đen không bị chiếu nhưng không đi được đâu cả: hòa pat. Luôn chừa cho vua Đen một ô cho đến khi chiếu hết!" },
        { "type": "gen", "pieces": "Q", "count": 4, "prompt": "Bài tự động: chiếu hết trong 1 nước bằng hậu!" },
        { "type": "drill", "fen": "8/8/8/4k3/8/8/8/3QK3 w - - 0 1", "goal": "mate", "maxMoves": 30, "botLevel": 3, "prompt": "Thử thách: chiếu hết bằng hậu và vua trong 30 nước. Đừng để hòa pat nhé!" }
      ]
    },
    {
      "id": "xe",
      "icon": "♜",
      "title": "Chiếu hết bằng 1 xe",
      "month": 1,
      "week": "Tuần 2",
      "goal": "Chiếu hết bằng xe và vua.",
      "intro": [
        "Một xe không thể tự chiếu hết, nên vua Trắng phải giúp.",
        "Dùng xe chặn một hàng để nhốt vua Đen lại, rồi đưa vua Trắng tiến lên.",
        "Khi hai vua đứng đối mặt nhau (cùng cột hoặc cùng hàng, cách 1 ô), xe chiếu ở mép bàn cờ là chiếu hết!"
      ],
      "exercises": [
        { "type": "mate1", "fen": "4k3/8/4K3/8/8/8/8/R7 w - - 0 1", "prompt": "Hai vua đang đối mặt. Xe chiếu hết!" },
        { "type": "mate1", "fen": "7k/8/7K/8/8/8/8/1R6 w - - 0 1", "prompt": "Chiếu hết trong 1 nước!" },
        { "type": "mate1", "fen": "8/8/8/k1K5/8/8/8/7R w - - 0 1", "prompt": "Vua Đen ở mép trái. Chiếu hết!" },
        { "type": "gen", "pieces": "R", "count": 4, "prompt": "Bài tự động: chiếu hết trong 1 nước bằng xe!" },
        { "type": "drill", "fen": "8/8/8/4k3/8/8/8/4K2R w - - 0 1", "goal": "mate", "maxMoves": 40, "botLevel": 3, "prompt": "Thử thách khó: chiếu hết bằng xe và vua trong 40 nước!" }
      ]
    },
    {
      "id": "treo",
      "icon": "👀",
      "title": "Quân bị treo",
      "month": 1,
      "week": "Tuần 3",
      "goal": "Nhìn ra quân không được bảo vệ, của mình và của đối phương.",
      "intro": [
        "Quân 'treo' là quân không có ai bảo vệ. Đối phương có thể ăn nó miễn phí!",
        "Trước MỖI nước đi, con hãy tự hỏi 2 câu:",
        "Một: Đối thủ vừa đi nước đó để làm gì? Nó đang tấn công quân nào của mình?",
        "Hai: Nước mình định đi có để mất quân không?",
        "Và nếu quân đối phương bị treo, hãy ăn nó!"
      ],
      "exercises": [
        { "type": "move", "fen": "4k3/8/8/3n4/8/8/8/3RK3 w - - 0 1", "prompt": "Mã Đen không có ai bảo vệ. Ăn nó!", "answers": ["d1d5"] },
        { "type": "move", "fen": "4k3/8/2b5/8/8/8/6Q1/4K3 w - - 0 1", "prompt": "Tìm quân Đen bị treo và ăn nó!", "answers": ["g2c6"] },
        { "type": "move", "fen": "4k3/8/2p5/3n4/r7/8/8/3QK3 w - - 0 1", "prompt": "Hậu Trắng ăn được 2 quân. Quân nào ăn được an toàn?", "answers": ["d1a4"], "wrongHint": "Mã d5 được tốt c6 bảo vệ. Ăn mã thì sẽ mất hậu!" },
        { "type": "find", "mode": "hanging", "fen": "4k3/1p3p2/2n5/6b1/3r4/8/8/4K3 w - - 0 1", "prompt": "Chạm vào TẤT CẢ quân Đen không được bảo vệ, rồi bấm Xong.", "answers": ["b7", "g5"] },
        { "type": "find", "mode": "hanging", "fen": "r3k3/8/3p4/4n3/8/1b6/8/4K3 w - - 0 1", "prompt": "Chạm vào TẤT CẢ quân Đen bị treo, rồi bấm Xong.", "answers": ["a8", "d6", "b3"] },
        { "type": "quiz", "fen": "r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3", "question": "Hậu Trắng có nên ăn tốt e5 không?", "choices": ["Nên, được thêm tốt", "Không nên, mã c6 sẽ ăn lại hậu"], "answer": 1, "explain": "Tốt e5 được mã c6 bảo vệ. Đổi hậu lấy tốt là thiệt rất nặng!" },
        { "type": "pack", "pack": "hanging", "count": 5 }
      ]
    },
    {
      "id": "mau",
      "icon": "⚡",
      "title": "Mẫu chiếu hết 1 nước",
      "month": 1,
      "week": "Tuần 4",
      "goal": "Thuộc các mẫu chiếu hết hay gặp.",
      "intro": [
        "Nhiều ván cờ kết thúc bằng những 'mẫu' chiếu hết giống nhau. Thuộc mẫu thì nhìn ra rất nhanh!",
        "Chiếu hết hàng cuối: vua bị chính tốt của mình nhốt lại, xe hoặc hậu chiếu ở hàng cuối.",
        "Hậu kề vua: hậu đứng sát vua đối phương và được một quân khác bảo vệ.",
        "Mã ngộp thở: vua bị chính quân mình vây kín, mã nhảy vào chiếu.",
        "Ô f7 (và f2): ở đầu ván, ô này chỉ có vua bảo vệ nên rất yếu."
      ],
      "exercises": [
        { "type": "mate1", "fen": "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1", "prompt": "Chiếu hết hàng cuối!" },
        { "type": "mate1", "fen": "1k6/ppp5/8/8/8/8/8/K2R4 w - - 0 1", "prompt": "Vua Đen bị tốt nhốt lại. Chiếu hết!" },
        { "type": "mate1", "fen": "7k/5Q2/6K1/8/8/8/8/8 w - - 0 1", "prompt": "Hậu kề vua, có vua Trắng bảo vệ. Chiếu hết!" },
        { "type": "mate1", "fen": "5rk1/5pp1/8/7Q/8/3B4/8/6K1 w - - 0 1", "prompt": "Hậu và tượng phối hợp. Chiếu hết!" },
        { "type": "mate1", "fen": "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1", "prompt": "Mã ngộp thở: vua bị chính quân mình vây kín!" },
        { "type": "mate1", "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4", "prompt": "Ô f7 rất yếu! Chiếu hết trong 1 nước." },
        { "type": "mate1", "fen": "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2", "prompt": "Lượt của Đen! Trắng đi tốt quá ẩu. Hãy chiếu hết." },
        { "type": "pack", "pack": "mate1", "count": 5 }
      ]
    },
    {
      "id": "chiadoi",
      "icon": "🍴",
      "title": "Đòn chĩa đôi",
      "month": 2,
      "week": "Tuần 5",
      "goal": "Tấn công 2 quân cùng lúc.",
      "intro": [
        "Chĩa đôi là khi một quân tấn công HAI quân đối phương cùng lúc.",
        "Đối phương chỉ cứu được một quân, mình ăn quân còn lại!",
        "Mã là chuyên gia chĩa đôi vì nó nhảy theo hình chữ L. Hậu và tốt cũng chĩa đôi rất giỏi.",
        "Đòn chĩa đôi mạnh nhất là vừa chiếu vua vừa tấn công quân khác."
      ],
      "exercises": [
        { "type": "move", "fen": "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1", "prompt": "Mã chĩa đôi: chiếu vua và tấn công xe!", "answers": ["b5c7"] },
        { "type": "move", "fen": "6k1/3q4/8/3N4/8/8/8/6K1 w - - 0 1", "prompt": "Mã chĩa đôi vua và hậu!", "answers": ["d5f6"] },
        { "type": "move", "fen": "4k3/8/1q3r2/8/8/4N3/8/4K3 w - - 0 1", "prompt": "Tìm ô để mã tấn công cả hậu và xe!", "answers": ["e3d5"] },
        { "type": "move", "fen": "4k3/8/8/2n1b3/8/2PP4/8/4K3 w - - 0 1", "prompt": "Tốt cũng chĩa đôi được! Tốt nào tấn công cả mã và tượng?", "answers": ["d3d4"] },
        { "type": "move", "fen": "4k3/8/8/8/7r/8/8/3QK3 w - - 0 1", "prompt": "Hậu chĩa đôi: vừa chiếu vua, vừa tấn công xe!", "answers": ["d1a4"] },
        { "type": "move", "fen": "2r3k1/8/8/3N4/8/8/8/6K1 w - - 0 1", "prompt": "Mã chiếu vua và tấn công xe cùng lúc!", "answers": ["d5e7"] },
        { "type": "pack", "pack": "fork", "count": 6 }
      ]
    },
    {
      "id": "ghim",
      "icon": "📌",
      "title": "Đòn ghim",
      "month": 2,
      "week": "Tuần 6",
      "goal": "Ghim quân đối phương và tận dụng quân bị ghim.",
      "intro": [
        "Đòn ghim: mình tấn công một quân, phía sau nó là quân quan trọng hơn (thường là vua).",
        "Quân bị ghim không dám chạy, vì chạy thì quân phía sau bị ăn.",
        "Nếu phía sau là vua thì quân bị ghim KHÔNG ĐƯỢC PHÉP chạy.",
        "Mẹo: khi một quân bị ghim, hãy tấn công nó thêm, ví dụ bằng tốt!"
      ],
      "exercises": [
        { "type": "move", "fen": "4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1", "prompt": "Dùng tượng ghim mã Đen vào vua!", "answers": ["f1b5"] },
        { "type": "quiz", "fen": "4k3/8/2n5/1B6/8/8/8/4K3 b - - 0 1", "question": "Đến lượt Đen. Mã c6 có được đi không?", "choices": ["Được", "Không, vì mã đang bị ghim vào vua"], "answer": 1, "explain": "Nếu mã đi, tượng sẽ chiếu vua. Luật không cho phép tự để vua bị chiếu." },
        { "type": "move", "fen": "4k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1", "prompt": "Mã bị ghim không chạy được. Tấn công nó bằng tốt!", "answers": ["d4d5"] },
        { "type": "move", "fen": "4k3/3q4/8/8/P7/8/8/4KB2 w - - 0 1", "prompt": "Ghim hậu Đen vào vua! (Tốt a4 sẽ bảo vệ tượng.)", "answers": ["f1b5"] },
        { "type": "move", "fen": "4k3/8/8/4b3/8/8/8/1K5R w - - 0 1", "prompt": "Dùng xe ghim tượng Đen vào vua!", "answers": ["h1e1"] },
        { "type": "pack", "pack": "pinskewer", "count": 6 }
      ]
    },
    {
      "id": "xien",
      "icon": "🎯",
      "title": "Đòn xiên và tấn công phát hiện",
      "month": 2,
      "week": "Tuần 7",
      "goal": "Dùng đòn xiên và tấn công phát hiện.",
      "intro": [
        "Đòn xiên giống đòn ghim nhưng ngược lại: quân to đứng trước, quân nhỏ đứng sau.",
        "Mình chiếu vua, vua phải chạy đi, rồi mình ăn quân phía sau!",
        "Tấn công phát hiện: một quân đi ra chỗ khác, để lộ đường tấn công của quân đứng sau nó.",
        "Nếu quân đi ra cũng tấn công được thì đối phương bị đánh 2 chỗ cùng lúc!"
      ],
      "exercises": [
        { "type": "move", "fen": "r7/8/8/3k4/8/8/8/3BK3 w - - 0 1", "prompt": "Xiên: tượng chiếu vua, vua chạy, rồi tượng ăn xe phía sau!", "answers": ["d1f3"] },
        { "type": "move", "fen": "3q4/8/8/8/3k4/8/8/R5K1 w - - 0 1", "prompt": "Xiên bằng xe: chiếu vua để ăn hậu phía sau!", "answers": ["a1d1"] },
        { "type": "move", "fen": "4k3/8/8/8/4N3/8/3q4/4R1K1 w - - 0 1", "prompt": "Tấn công phát hiện: mã ăn hậu, đồng thời xe lộ ra chiếu vua!", "answers": ["e4d2"] },
        { "type": "move", "fen": "r3k3/8/8/8/4B3/8/8/4R1K1 w - - 0 1", "prompt": "Tượng đi ăn quân và xe lộ ra chiếu vua cùng lúc!", "answers": ["e4a8"] },
        { "type": "pack", "pack": "discovered", "count": 5 }
      ]
    },
    {
      "id": "khaicuoc",
      "icon": "🚀",
      "title": "Nguyên tắc khai cuộc",
      "month": 2,
      "week": "Tuần 8",
      "goal": "Khai cuộc đúng nguyên tắc, không cần học thuộc.",
      "intro": [
        "Ba nguyên tắc vàng khi bắt đầu ván cờ:",
        "Một: đưa tốt vào trung tâm, ví dụ tốt e4 hoặc d4.",
        "Hai: ra mã và tượng thật sớm.",
        "Ba: nhập thành để vua được an toàn.",
        "Và nhớ: đừng đưa hậu ra quá sớm, đừng đi một quân nhiều lần khi các quân khác còn ngủ."
      ],
      "exercises": [
        { "type": "quiz", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "question": "Nước đầu tiên nào tốt nhất?", "choices": ["Tốt e4", "Tốt a4", "Tốt h4"], "answer": 0, "explain": "Tốt e4 chiếm trung tâm và mở đường cho hậu, tượng." },
        { "type": "quiz", "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "question": "Nước nào tốt hơn?", "choices": ["Mã f3: ra quân và tấn công tốt e5", "Hậu h5: đưa hậu ra thật sớm", "Vua e2: cho vua đi dạo"], "answer": 0, "explain": "Mã f3 vừa ra quân vừa tấn công. Hậu ra sớm dễ bị đuổi, còn vua cần được an toàn." },
        { "type": "move", "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "prompt": "Hãy đi một nước đúng nguyên tắc: ra quân hoặc chiếm trung tâm.", "answers": ["f1c4", "f1b5", "b1c3", "d2d4"] },
        { "type": "move", "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "prompt": "Mã và tượng đã ra. Hãy cho vua vào nơi an toàn!", "answers": ["e1g1"], "hint": "e1" },
        { "type": "move", "fen": "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3", "prompt": "Lượt Đen! Trắng dọa hậu ăn f7 chiếu hết. Hãy chặn lại!", "answers": ["g7g6", "d8e7", "d8f6"] },
        { "type": "quiz", "question": "Ở đầu ván, có nên đi một quân nhiều lần không?", "choices": ["Nên", "Không nên, hãy ra các quân khác"], "answer": 1, "explain": "Đúng! Hãy cho tất cả các quân cùng tham gia trận đấu." }
      ]
    },
    {
      "id": "tancuoc",
      "icon": "♟",
      "title": "Tàn cuộc tốt",
      "month": 3,
      "week": "Tuần 9",
      "goal": "Quy tắc hình vuông và đưa tốt lên phong hậu.",
      "intro": [
        "Ở cuối ván, tốt có thể trở thành hậu. Đó là lý do mỗi con tốt đều quý!",
        "Quy tắc hình vuông: vẽ một hình vuông từ con tốt lên đến hàng cuối. Nếu vua đối phương bước vào được hình vuông đó thì nó đuổi kịp tốt. Nếu không thì tốt sẽ phong hậu.",
        "Khi đưa tốt lên, hãy cho vua đi trước để dọn đường cho tốt."
      ],
      "exercises": [
        { "type": "quiz", "fen": "8/8/8/k7/7P/8/8/7K w - - 0 1", "question": "Trắng đi trước. Vua Đen có đuổi kịp tốt h không?", "choices": ["Đuổi kịp", "Không đuổi kịp, tốt sẽ phong hậu"], "answer": 1, "explain": "Hình vuông của tốt h4 là từ cột d đến h, hàng 4 đến 8. Vua a5 ở ngoài nên không đuổi kịp." },
        { "type": "quiz", "fen": "8/8/8/3k4/7P/8/8/7K w - - 0 1", "question": "Trắng đi trước. Lần này vua Đen có đuổi kịp không?", "choices": ["Đuổi kịp", "Không đuổi kịp"], "answer": 0, "explain": "Vua d5 đã ở trong hình vuông nên sẽ đuổi kịp tốt." },
        { "type": "drill", "fen": "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1", "goal": "promote", "maxMoves": 12, "botLevel": 3, "prompt": "Đưa tốt lên phong hậu! Dùng vua để giúp tốt. Cẩn thận hòa pat." },
        { "type": "drill", "fen": "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1", "goal": "promote", "maxMoves": 40, "botLevel": 2, "prompt": "Chiến tranh tốt! Ai phong hậu trước thì thắng." }
      ]
    },
    {
      "id": "tonghop",
      "icon": "🧩",
      "title": "Bài tập tổng hợp",
      "month": 3,
      "week": "Tuần 10",
      "goal": "Tự nhận ra đòn đánh mà không được báo trước.",
      "intro": [
        "Bây giờ con không được báo trước là đòn gì nữa!",
        "Hãy nhìn thật kỹ: có chiếu hết không? Có quân nào bị treo không? Có chĩa đôi được không?",
        "Đầu tiên luôn tìm các nước chiếu, ăn quân và tấn công."
      ],
      "exercises": [
        { "type": "mate1", "fen": "6k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1", "prompt": "Tìm nước tốt nhất cho Trắng!" },
        { "type": "move", "fen": "4k3/8/8/8/2q5/8/1N6/4K3 w - - 0 1", "prompt": "Tìm nước tốt nhất cho Trắng!", "answers": ["b2c4"] },
        { "type": "move", "fen": "2r3k1/8/8/3N4/8/8/8/6K1 w - - 0 1", "prompt": "Tìm nước tốt nhất cho Trắng!", "answers": ["d5e7"] },
        { "type": "mate1", "fen": "1k6/ppp5/8/8/8/8/8/K2R4 w - - 0 1", "prompt": "Tìm nước tốt nhất cho Trắng!" },
        { "type": "move", "fen": "3q4/8/8/8/3k4/8/8/R5K1 w - - 0 1", "prompt": "Tìm nước tốt nhất cho Trắng!", "answers": ["a1d1"] },
        { "type": "gen", "pieces": "Q", "count": 2, "prompt": "Chiếu hết trong 1 nước!" }
      ]
    },
    {
      "id": "bienban",
      "icon": "✍️",
      "title": "Ghi biên bản",
      "month": 3,
      "week": "Tuần 11",
      "goal": "Đọc và ghi được nước đi để chuẩn bị đi thi đấu.",
      "intro": [
        "Mỗi ô trên bàn cờ có một cái tên: chữ cái là cột (từ a đến h), con số là hàng (từ 1 đến 8). Ví dụ: e4.",
        "Mỗi quân có một chữ cái: K là vua, Q là hậu, R là xe, B là tượng, N là mã. Tốt thì không có chữ.",
        "Nf3 nghĩa là mã đi đến ô f3. e4 nghĩa là tốt đi đến ô e4.",
        "Chữ x là ăn quân, dấu cộng là chiếu, dấu thăng là chiếu hết. O-O là nhập thành cánh vua.",
        "Ở các giải đấu, con sẽ phải tự ghi lại mọi nước đi của ván cờ."
      ],
      "exercises": [
        { "type": "find", "mode": "square", "fen": "4k3/8/8/8/8/8/8/4K3 w - - 0 1", "prompt": "Chạm vào ô e4, rồi bấm Xong.", "answers": ["e4"] },
        { "type": "find", "mode": "square", "fen": "4k3/8/8/8/8/8/8/4K3 w - - 0 1", "prompt": "Chạm vào ô b6 và ô g2, rồi bấm Xong.", "answers": ["b6", "g2"] },
        { "type": "move", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "prompt": "Hãy đi nước: d4", "answers": ["d2d4"] },
        { "type": "move", "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "prompt": "Hãy đi nước: Nf3", "answers": ["g1f3"] },
        { "type": "move", "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "prompt": "Hãy đi nước: Bc4", "answers": ["f1c4"] },
        { "type": "quiz", "question": "Chữ N là quân nào?", "choices": ["Vua", "Mã", "Tốt"], "answer": 1, "explain": "N là mã (Knight). Vì K đã dùng cho vua (King) nên mã dùng chữ N." },
        { "type": "quiz", "question": "'Qxf7#' nghĩa là gì?", "choices": ["Hậu ăn quân ở f7 và chiếu hết", "Mã đi đến f7", "Hậu đi đến f7 nhưng không ăn quân"], "answer": 0, "explain": "Q là hậu, x là ăn quân, f7 là ô, # là chiếu hết." }
      ]
    },
    {
      "id": "thidau",
      "icon": "🏆",
      "title": "Thi đấu thử",
      "month": 3,
      "week": "Tuần 12",
      "goal": "Chơi trọn vẹn ván cờ và áp dụng mọi điều đã học.",
      "intro": [
        "Bây giờ hãy chơi những ván cờ thật với máy!",
        "Nhớ nhé: chiếm trung tâm, ra quân, nhập thành.",
        "Trước mỗi nước, kiểm tra quân treo và tìm nước chiếu, ăn quân, tấn công.",
        "Thắng thì giỏi, thua thì xem lại ván để học. Cả hai đều tốt!"
      ],
      "exercises": [
        { "type": "drill", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "goal": "win", "maxMoves": 0, "botLevel": 1, "prompt": "Ván 1: thắng máy cấp Gà con 🐣" },
        { "type": "drill", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "goal": "win", "maxMoves": 0, "botLevel": 2, "prompt": "Ván 2: thắng máy cấp Thỏ 🐰" }
      ]
    },
    {
      "id": "chieuhet2",
      "icon": "🎯",
      "title": "Chiếu hết trong 2 nước",
      "month": 4,
      "week": "Tuần 13",
      "goal": "Tính trước 2 nước: nước của mình, nước đáp của đối thủ, rồi chiếu hết.",
      "intro": [
        "Chào mừng con đến Giai đoạn 2! Từ bây giờ các bài tập là thế cờ lấy từ những ván cờ thật.",
        "Máy sẽ đi nước của đối thủ trước. Con hãy nhìn kỹ nước đó, rồi tìm lời giải.",
        "Chiếu hết trong 2 nước: nước thứ nhất thường là CHIẾU, ĂN QUÂN hoặc một nước HY SINH để mở đường.",
        "Mẹo: hãy thử từng nước chiếu trước. Với mỗi nước, tự hỏi: đối thủ đáp lại thế nào? Mình có chiếu hết được không?"
      ],
      "exercises": [
        { "type": "pack", "pack": "mate2", "count": 10 }
      ]
    },
    {
      "id": "mauchieuhet",
      "icon": "🧠",
      "title": "Các mẫu chiếu hết nổi tiếng",
      "month": 4,
      "week": "Tuần 14",
      "goal": "Nhận ra các mẫu chiếu hết kinh điển trong ván cờ thật.",
      "intro": [
        "Các kỳ thủ giỏi nhớ rất nhiều 'hình' chiếu hết. Con đã biết chiếu hết hàng cuối và mã ngộp thở.",
        "Chiếu hết Ả Rập: xe và mã phối hợp dồn vua vào góc bàn cờ.",
        "Chiếu hết Anastasia: mã chặn đường, xe hoặc hậu chiếu dọc mép bàn cờ.",
        "Chiếu hết móc câu: xe chiếu, được mã bảo vệ, mã lại được tốt bảo vệ.",
        "Chiếu hết Boden: hai tượng chéo nhau như cái kéo, chiếu vua đã nhập thành cánh hậu."
      ],
      "exercises": [
        { "type": "pack", "pack": "matepatterns", "count": 10 }
      ]
    },
    {
      "id": "chieuhet3",
      "icon": "🏹",
      "title": "Chiếu hết trong 3 nước",
      "month": 4,
      "week": "Tuần 15",
      "goal": "Tính toán sâu hơn: một chuỗi 3 nước ép buộc.",
      "intro": [
        "Bài này khó hơn: con cần 3 nước để chiếu hết.",
        "Bí quyết là các nước ÉP BUỘC: chiếu liên tục khiến đối thủ không có thời gian phòng thủ.",
        "Đừng vội đi! Hãy tính hết cả chuỗi nước trong đầu rồi mới chạm vào quân."
      ],
      "exercises": [
        { "type": "pack", "pack": "mate3", "count": 8 }
      ]
    },
    {
      "id": "tancongvua",
      "icon": "⚔️",
      "title": "Tấn công vua",
      "month": 4,
      "week": "Tuần 16",
      "goal": "Tấn công vua đối phương khi vua thiếu quân bảo vệ.",
      "intro": [
        "Khi vua đối phương không có đủ quân bảo vệ, hãy đưa thật nhiều quân đến tấn công.",
        "Dấu hiệu tốt để tấn công: vua chưa nhập thành, các tốt trước vua đã tiến lên, hoặc quân phòng thủ đã đi xa.",
        "Đôi khi phải hy sinh một quân để phá lớp tốt che chắn vua."
      ],
      "exercises": [
        { "type": "pack", "pack": "attack", "count": 10 }
      ]
    },
    {
      "id": "chiadoi2",
      "icon": "🍴",
      "title": "Chĩa đôi nâng cao",
      "month": 5,
      "week": "Tuần 17",
      "goal": "Tạo ra cơ hội chĩa đôi, kể cả khi cần chuẩn bị trước một nước.",
      "intro": [
        "Ở Giai đoạn 1, đòn chĩa đôi đã có sẵn. Bây giờ đôi khi con phải chuẩn bị trước.",
        "Ví dụ: chiếu một nước để vua đối phương phải đi vào ô bị chĩa đôi.",
        "Hãy tìm những quân đối phương đứng ở các ô mà mã hoặc hậu có thể tấn công cùng lúc."
      ],
      "exercises": [
        { "type": "pack", "pack": "fork", "count": 10 }
      ]
    },
    {
      "id": "ghimxien2",
      "icon": "📌",
      "title": "Ghim và xiên nâng cao",
      "month": 5,
      "week": "Tuần 18",
      "goal": "Khai thác quân bị ghim và các quân đứng thẳng hàng.",
      "intro": [
        "Khi thấy hai quân đối phương đứng trên cùng một hàng, cột hay đường chéo, hãy nghĩ ngay đến đòn ghim hoặc xiên!",
        "Quân bị ghim không bảo vệ được quân khác. Hãy tấn công những quân mà nó đang 'bảo vệ'.",
        "Xiên: chiếu hoặc tấn công quân to phía trước, ăn quân phía sau."
      ],
      "exercises": [
        { "type": "pack", "pack": "pinskewer", "count": 10 }
      ]
    },
    {
      "id": "phathien2",
      "icon": "💥",
      "title": "Tấn công phát hiện và chiếu đôi",
      "month": 5,
      "week": "Tuần 19",
      "goal": "Dùng tấn công phát hiện và chiếu đôi để thắng quân.",
      "intro": [
        "Tấn công phát hiện: quân phía trước đi ra, quân phía sau lộ ra tấn công.",
        "Chiếu đôi: cả hai quân cùng chiếu vua một lúc. Không thể chặn hay ăn cả hai, vua BẮT BUỘC phải chạy!",
        "Chiếu đôi là một trong những đòn mạnh nhất của cờ vua."
      ],
      "exercises": [
        { "type": "pack", "pack": "discovered", "count": 10 }
      ]
    },
    {
      "id": "loikeo",
      "icon": "🧲",
      "title": "Lôi kéo và đánh lạc hướng",
      "month": 5,
      "week": "Tuần 20",
      "goal": "Kéo quân đối phương vào ô xấu hoặc kéo quân phòng thủ đi chỗ khác.",
      "intro": [
        "Lôi kéo: hy sinh quân để kéo vua hoặc quân đối phương vào một ô xấu, ví dụ ô bị chĩa đôi.",
        "Đánh lạc hướng: một quân đối phương đang làm nhiệm vụ bảo vệ. Hãy ép nó rời khỏi vị trí đó!",
        "Tự hỏi: quân nào của đối thủ đang phải làm việc quá sức?"
      ],
      "exercises": [
        { "type": "pack", "pack": "deflection", "count": 10 }
      ]
    },
    {
      "id": "diet",
      "icon": "🛡️",
      "title": "Diệt quân phòng thủ và bẫy quân",
      "month": 5,
      "week": "Tuần 21",
      "goal": "Ăn quân bảo vệ để thắng quân khác, và bắt những quân không có đường chạy.",
      "intro": [
        "Diệt quân phòng thủ: nếu quân A đang bảo vệ quân B, hãy ăn quân A trước, sau đó quân B không còn ai bảo vệ!",
        "Bẫy quân: đôi khi một quân đối phương bị kẹt, không còn ô nào an toàn để chạy. Hãy tấn công nó!",
        "Quân hay bị bẫy nhất là tượng và mã đi quá sâu vào trận địa đối phương."
      ],
      "exercises": [
        { "type": "pack", "pack": "defender", "count": 10 }
      ]
    },
    {
      "id": "baykhaicuoc",
      "icon": "🪤",
      "title": "Bẫy khai cuộc",
      "month": 5,
      "week": "Tuần 22",
      "goal": "Trừng phạt đối thủ khi họ khai cuộc sai nguyên tắc.",
      "intro": [
        "Ở đầu ván, nhiều người đi vội vàng và mắc lỗi.",
        "Khi đối thủ đưa hậu ra sớm, để vua ở trung tâm, hoặc bỏ quân không bảo vệ, thường sẽ có đòn đánh!",
        "Các bài này đều là những cái bẫy có thật trong các ván đấu."
      ],
      "exercises": [
        { "type": "pack", "pack": "opening", "count": 10 }
      ]
    },
    {
      "id": "tinhlang",
      "icon": "🤫",
      "title": "Nước trung gian và nước yên lặng",
      "month": 5,
      "week": "Tuần 23",
      "goal": "Tìm ra những nước bất ngờ, không phải chiếu và không phải ăn quân.",
      "intro": [
        "Nước trung gian: thay vì ăn lại quân ngay, hãy chèn vào một nước mạnh hơn trước, ví dụ một nước chiếu.",
        "Nước yên lặng: không chiếu, không ăn quân, nhưng tạo ra một đe dọa mà đối thủ không chống đỡ nổi.",
        "Đây là bài khó nhất của tháng. Con cứ bình tĩnh suy nghĩ nhé!"
      ],
      "exercises": [
        { "type": "pack", "pack": "quiet", "count": 8 }
      ]
    },
    {
      "id": "thiquan",
      "icon": "🎁",
      "title": "Thí quân để thắng",
      "month": 5,
      "week": "Tuần 23",
      "goal": "Dám cho đi một quân để đổi lấy chiếu hết hoặc lời nhiều quân hơn.",
      "intro": [
        "Thí quân là cố ý cho đối thủ ăn một quân của mình.",
        "Nghe thì lạ, nhưng nếu sau đó mình chiếu hết được, hoặc ăn lại được quân to hơn, thì thí quân là nước tuyệt hay!",
        "Trước khi thí, con hãy đếm thật kỹ: đối thủ ăn xong thì mình đi tiếp nước gì?"
      ],
      "exercises": [
        { "type": "pack", "pack": "sacrifice", "count": 10 }
      ]
    },
    {
      "id": "xuyenquan",
      "icon": "🔦",
      "title": "Tấn công xuyên quân và chặn đường",
      "month": 5,
      "week": "Tuần 23",
      "goal": "Nhìn xuyên qua quân cờ và cắt đường liên lạc của quân đối thủ.",
      "intro": [
        "Tấn công xuyên quân: xe, tượng, hậu nhìn xuyên qua một quân để tấn công hoặc bảo vệ ô phía sau.",
        "Chặn đường: đặt một quân vào giữa, cắt đứt đường bảo vệ giữa hai quân của đối thủ.",
        "Đây là các đòn khó. Con hãy nhìn theo từng đường thẳng và đường chéo nhé!"
      ],
      "exercises": [
        { "type": "pack", "pack": "xray", "count": 8 }
      ]
    },
    {
      "id": "doivua",
      "icon": "👑",
      "title": "Đối vua và tàn cuộc tốt",
      "month": 6,
      "week": "Tuần 24",
      "goal": "Hiểu thế đối vua và thắng các tàn cuộc tốt.",
      "intro": [
        "Ở tàn cuộc, vua là một quân chiến đấu rất mạnh. Hãy đưa vua lên giúp tốt!",
        "Đối vua: hai vua đứng đối mặt nhau, cách nhau đúng 1 ô. Bên đến lượt đi phải nhường đường cho vua kia.",
        "Bên nào giành được thế đối vua thường sẽ thắng tàn cuộc tốt.",
        "Nhớ cả quy tắc hình vuông và cách tạo ra một con tốt thông."
      ],
      "exercises": [
        { "type": "quiz", "fen": "8/8/8/4k3/8/4K3/8/8 w - - 0 1", "question": "Hai vua đứng đối mặt, cách nhau 1 ô như thế này gọi là gì?", "choices": ["Đối vua", "Chiếu vua", "Hòa pat"], "answer": 0, "explain": "Đúng rồi! Hai vua không được đứng sát nhau, nên bên đến lượt đi phải lùi hoặc đi sang bên." },
        { "type": "quiz", "question": "Khi hai vua đối mặt, bên nào thường gặp bất lợi?", "choices": ["Bên đến lượt đi, vì phải nhường đường", "Bên vừa đi xong"], "answer": 0, "explain": "Chính xác! Vì vậy ta muốn đi nước tạo thế đối vua, để đối thủ phải nhường đường." },
        { "type": "pack", "pack": "pawnend", "count": 8 }
      ]
    },
    {
      "id": "phongcap",
      "icon": "⬆️",
      "title": "Phong cấp",
      "month": 6,
      "week": "Tuần 25",
      "goal": "Đưa tốt lên phong cấp và ngăn tốt đối phương.",
      "intro": [
        "Tốt càng tiến gần hàng cuối càng nguy hiểm.",
        "Hãy tìm cách dọn đường cho tốt: đổi quân, hy sinh quân, hoặc đánh lạc hướng quân đang chặn tốt.",
        "Đôi khi phong thành mã còn tốt hơn phong hậu, nếu mã chiếu được vua!"
      ],
      "exercises": [
        { "type": "pack", "pack": "promotion", "count": 10 }
      ]
    },
    {
      "id": "tancuocxe",
      "icon": "🏰",
      "title": "Tàn cuộc xe",
      "month": 6,
      "week": "Tuần 26",
      "goal": "Chơi tốt tàn cuộc xe, loại tàn cuộc hay gặp nhất.",
      "intro": [
        "Tàn cuộc xe là loại tàn cuộc xuất hiện nhiều nhất trong các ván cờ.",
        "Xe nên đứng ở vị trí hoạt động: phía sau tốt thông, hoặc trên hàng thứ 7 của đối phương.",
        "Hãy để ý các đòn chiếu hết ở hàng cuối và các đòn xiên bằng xe."
      ],
      "exercises": [
        { "type": "pack", "pack": "rookend", "count": 10 }
      ]
    },
    {
      "id": "phongthu",
      "icon": "🧱",
      "title": "Phòng thủ",
      "month": 6,
      "week": "Tuần 27",
      "goal": "Tìm nước cứu nguy khi đang bị tấn công.",
      "intro": [
        "Không phải lúc nào cũng tấn công được. Cờ thủ giỏi cũng phải biết phòng thủ!",
        "Khi bị đe dọa, hãy tìm các cách: chạy quân đi, bảo vệ quân, chặn đường tấn công, hoặc phản công mạnh hơn.",
        "Trong các bài này, đối thủ đang dọa một đòn nguy hiểm. Con hãy tìm nước duy nhất để cứu thế cờ."
      ],
      "exercises": [
        { "type": "pack", "pack": "defense", "count": 10 }
      ]
    },
    {
      "id": "thidau2",
      "icon": "🏆",
      "title": "Thi đấu nâng cao",
      "month": 6,
      "week": "Tuần 28",
      "goal": "Thắng các đối thủ mạnh hơn bằng mọi kỹ năng đã học.",
      "intro": [
        "Kết thúc Giai đoạn 2 là hai ván đấu với các đối thủ mạnh hơn.",
        "Nhớ: ra quân, nhập thành, kiểm tra quân treo, tìm đòn chiến thuật, và đừng vội vàng!",
        "Ván cờ dài, con có thể chơi trong nhiều buổi."
      ],
      "exercises": [
        { "type": "drill", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "goal": "win", "maxMoves": 0, "botLevel": 3, "prompt": "Ván 1: thắng máy cấp Cáo 🦊" },
        { "type": "drill", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "goal": "win", "maxMoves": 0, "botLevel": 4, "prompt": "Ván 2: thắng máy cấp Sói 🐺" }
      ]
    },
    {
      "id": "hoatdong",
      "icon": "🐴",
      "title": "Quân hoạt động",
      "month": 7,
      "week": "Tuần 29",
      "goal": "Đặt quân ở ô tốt, nơi nó kiểm soát được nhiều ô.",
      "intro": [
        "Chào mừng con đến Giai đoạn 3! Bây giờ ta học cách suy nghĩ khi KHÔNG có đòn đánh nào.",
        "Quân 'hoạt động' là quân kiểm soát được nhiều ô và có việc để làm. Quân 'thụ động' bị kẹt và không làm được gì.",
        "Mã ở biên là mã buồn: ở góc, mã chỉ kiểm soát 2 ô, nhưng ở trung tâm thì kiểm soát tới 8 ô!",
        "Tượng cần đường chéo thông thoáng. Tượng bị chính tốt của mình chặn đường gọi là 'tượng xấu'.",
        "Câu hỏi vàng khi không biết đi gì: Quân nào của mình đang đứng kém nhất? Hãy đưa nó đến ô tốt hơn!"
      ],
      "exercises": [
        { "type": "quiz", "question": "Mã đứng ở đâu thì kiểm soát được nhiều ô nhất?", "choices": ["Ở góc bàn cờ, như ô a1", "Ở mép bàn cờ, như ô a4", "Ở trung tâm, như ô e4"], "answer": 2, "explain": "Ở góc mã chỉ đi được 2 ô, ở mép 4 ô, còn ở trung tâm tới 8 ô!" },
        { "type": "find", "mode": "square", "fen": "k7/8/8/8/4N3/8/8/7K w - - 0 1", "prompt": "Chạm vào TẤT CẢ các ô mà mã e4 có thể đi tới, rồi bấm Xong.", "answers": ["d6", "f6", "c5", "g5", "c3", "g3", "d2", "f2"] },
        { "type": "move", "fen": "4k3/pppp1ppp/8/4p3/4P3/N7/PPPP1PPP/4K3 w - - 0 1", "prompt": "Mã a3 đang 'buồn' ở mép bàn cờ. Hãy đưa nó về ô tốt hơn, gần trung tâm!", "answers": ["a3c4"], "wrongHint": "Ô c4 gần trung tâm, mã ở đó kiểm soát nhiều ô và còn tấn công tốt e5.", "explain": "Mã c4 kiểm soát nhiều ô hơn hẳn, tấn công tốt e5 và có thể nhảy tiếp tới d6, e5." },
        { "type": "quiz", "fen": "4k3/8/8/2p1p3/2P1P3/3B4/8/4K3 w - - 0 1", "question": "Tượng d3 của Trắng là tượng tốt hay tượng xấu?", "choices": ["Tượng tốt", "Tượng xấu, vì bị chính tốt c4 và e4 chặn đường"], "answer": 1, "explain": "Tượng d3 đi trên ô trắng, mà các tốt c4, e4 của Trắng cũng đứng ở ô trắng nên chặn đường tượng. Muốn tượng tốt, hãy đặt tốt ở ô khác màu với tượng." },
        { "type": "quiz", "question": "Khi không có đòn đánh nào, con nên tự hỏi câu gì?", "choices": ["Quân nào của mình đang đứng kém nhất?", "Mình đi tốt a được không?", "Đi bừa cho nhanh"], "answer": 0, "explain": "Đúng! Tìm quân kém nhất và đưa nó đến ô tốt hơn là cách lập kế hoạch đơn giản và hiệu quả." },
        { "type": "move", "fen": "2r3k1/pp3ppp/2n5/8/8/2N5/PP3PPP/2R3K1 w - - 0 1", "prompt": "Mã c3 có thể nhảy vào một ô 'tiền đồn' ở trung tâm, nơi không tốt Đen nào đuổi được. Ô nào?", "answers": ["c3d5"], "wrongHint": "Tìm ô ở trung tâm mà không có tốt Đen nào tấn công được.", "explain": "Ô d5 là tiền đồn: không còn tốt c hay e của Đen để đuổi mã đi. Mã ở d5 kiểm soát rất nhiều ô quan trọng." }
      ]
    },
    {
      "id": "cotmo",
      "icon": "🛣️",
      "title": "Cột mở và hàng 7",
      "month": 7,
      "week": "Tuần 30",
      "goal": "Đưa xe vào cột mở và lên hàng 7 của đối phương.",
      "intro": [
        "Xe cần đường thông thoáng để hoạt động. Cột mở là cột không còn con tốt nào.",
        "Hãy đưa xe vào cột mở trước đối thủ, từ đó xe có thể tiến sâu vào trận địa đối phương.",
        "Hàng 7 của đối phương là nơi tuyệt vời cho xe: xe ở đó ăn được các tốt chưa đi và nhốt vua đối phương.",
        "Hai xe chồng lên nhau trên cùng một cột còn mạnh gấp bội!"
      ],
      "exercises": [
        { "type": "quiz", "question": "Cột mở là gì?", "choices": ["Cột không còn con tốt nào", "Cột có nhiều quân nhất", "Cột a và cột h"], "answer": 0, "explain": "Đúng! Trên cột mở, xe có thể đi suốt từ đầu này tới đầu kia." },
        { "type": "move", "fen": "r4rk1/pp3ppp/2p5/8/8/2P5/PP3PPP/R4RK1 w - - 0 1", "prompt": "Cột d và cột e đều mở. Hãy đưa một xe vào cột mở!", "answers": ["a1d1", "a1e1", "f1d1", "f1e1"], "explain": "Xe trên cột mở có thể tiến vào hàng 7 hoặc hàng 8 của Đen. Đưa xe vào cột mở trước đối thủ là rất quan trọng." },
        { "type": "move", "fen": "6k1/pp3pp1/7p/8/8/8/5PPP/3R2K1 w - - 0 1", "prompt": "Hãy đưa xe lên hàng 7 của Đen!", "answers": ["d1d7"], "explain": "Xe ở d7 tấn công tốt b7 và f7. Tốt a7, b7 không được bảo vệ, Trắng sẽ ăn được tốt!" },
        { "type": "quiz", "question": "Hai xe đứng chồng nhau trên cùng một cột mở thì sao?", "choices": ["Mạnh hơn, vì hai xe bảo vệ nhau và cùng tấn công", "Yếu hơn, vì xe vướng nhau"], "answer": 0, "explain": "Hai xe chồng nhau giống như một khẩu pháo đôi, đối phương rất khó chống đỡ." },
        { "type": "move", "fen": "3r2k1/5ppp/8/8/8/8/4RPPP/R5K1 w - - 0 1", "prompt": "Xe e2 đang ở cột e mở. Hãy đưa xe a1 đến chồng lên cột e!", "answers": ["a1e1"], "wrongHint": "Xe a1 còn đang đứng không. Đưa nó đến ô e1, ngay sau xe e2 nhé!", "explain": "Hai xe chồng nhau trên cột e sẵn sàng tiến vào hàng 7 hoặc hàng 8 của Đen." }
      ]
    },
    {
      "id": "cautructot",
      "icon": "🧱",
      "title": "Cấu trúc tốt",
      "month": 7,
      "week": "Tuần 31",
      "goal": "Nhận ra tốt yếu (tốt chồng, tốt cô lập) và tốt mạnh (tốt thông).",
      "intro": [
        "Tốt là linh hồn của ván cờ: tốt không thể đi lùi, nên mỗi nước đi tốt cần suy nghĩ kỹ.",
        "Tốt chồng: hai tốt cùng màu đứng trên cùng một cột. Chúng không bảo vệ được nhau nên yếu.",
        "Tốt cô lập: tốt không có tốt bạn ở hai cột bên cạnh. Nó phải nhờ quân khác bảo vệ.",
        "Tốt thông: không có tốt đối phương nào chặn đường hay canh đường đi lên. Tốt thông rất mạnh vì có thể phong cấp!"
      ],
      "exercises": [
        { "type": "find", "mode": "square", "fen": "4k3/pppp1ppp/8/8/8/2P5/P1P2PPP/4K3 w - - 0 1", "prompt": "Chạm vào các tốt CHỒNG của Trắng, rồi bấm Xong.", "answers": ["c2", "c3"] },
        { "type": "find", "mode": "square", "fen": "4k3/pppppppp/8/8/3P4/8/PP3PPP/4K3 w - - 0 1", "prompt": "Chạm vào tốt CÔ LẬP của Trắng (không có tốt bạn ở hai cột bên cạnh), rồi bấm Xong.", "answers": ["d4"] },
        { "type": "find", "mode": "square", "fen": "4k3/pp3ppp/8/3P4/8/8/PP3PPP/4K3 w - - 0 1", "prompt": "Chạm vào tốt THÔNG của Trắng (không tốt Đen nào chặn đường hay canh đường), rồi bấm Xong.", "answers": ["d5"] },
        { "type": "quiz", "question": "Có tốt thông thì nên làm gì?", "choices": ["Đẩy tốt lên, có vua hoặc xe hỗ trợ", "Để yên một chỗ cho an toàn"], "answer": 0, "explain": "Tốt thông càng tiến lên càng nguy hiểm. Hãy hỗ trợ nó bằng vua hoặc xe đứng phía sau." },
        { "type": "quiz", "question": "Tốt có đi lùi được không?", "choices": ["Được", "Không, nên mỗi nước đi tốt cần suy nghĩ thật kỹ"], "answer": 1, "explain": "Tốt chỉ đi tới. Đẩy tốt rồi thì không sửa lại được, các ô phía sau nó có thể trở thành ô yếu." }
      ]
    },
    {
      "id": "doiquan",
      "icon": "🔁",
      "title": "Khi nào nên đổi quân",
      "month": 8,
      "week": "Tuần 32",
      "goal": "Biết lúc nào nên đổi quân và lúc nào nên giữ quân.",
      "intro": [
        "Đổi quân là khi hai bên ăn quân của nhau, giá trị ngang nhau.",
        "Khi con đang HƠN quân: hãy đổi quân! Càng ít quân trên bàn cờ, lợi thế càng rõ và càng dễ thắng.",
        "Khi con đang KÉM quân: tránh đổi quân, giữ quân lại để tìm cơ hội phản công.",
        "Khi bị tấn công mạnh: đổi đi quân tấn công nguy hiểm nhất của đối phương.",
        "Đừng đổi quân hoạt động của mình lấy quân thụ động của đối phương."
      ],
      "exercises": [
        { "type": "quiz", "fen": "4rk2/5ppp/8/8/8/8/5PPP/R3R1K1 w - - 0 1", "question": "Trắng hơn một xe. Trắng có nên đổi xe ở cột e không?", "choices": ["Nên đổi, vì càng ít quân lợi thế càng rõ", "Không nên đổi"], "answer": 0, "explain": "Đúng! Sau khi đổi, Trắng còn một xe chống lại không có gì, thắng rất dễ." },
        { "type": "move", "fen": "3r4/4kppp/8/8/8/8/5PPP/R2R2K1 w - - 0 1", "prompt": "Trắng hơn một xe. Hãy đổi xe!", "answers": ["d1d8"], "explain": "Sau khi vua Đen ăn lại, Trắng còn xe a1, Đen không còn xe nào. Tàn cuộc này Trắng thắng dễ dàng." },
        { "type": "quiz", "question": "Con đang kém đối thủ một mã. Con có nên đổi quân không?", "choices": ["Nên đổi càng nhiều càng tốt", "Không nên, hãy giữ quân để tìm cơ hội phản công"], "answer": 1, "explain": "Khi kém quân, mỗi lần đổi làm lợi thế của đối thủ rõ hơn. Hãy giữ quân và tìm đòn phản công." },
        { "type": "quiz", "question": "Hậu đối phương đang tấn công vua con rất mạnh. Một cách phòng thủ tốt là gì?", "choices": ["Đổi hậu đi", "Đi tốt a cho có", "Đưa vua ra giữa bàn cờ"], "answer": 0, "explain": "Đổi đi quân tấn công nguy hiểm nhất là cách phòng thủ rất hiệu quả." },
        { "type": "quiz", "question": "Mã của con đang ở ô tiền đồn rất mạnh, mã đối phương đang ở góc. Có nên đổi hai mã này không?", "choices": ["Nên đổi", "Không nên, vì mã của con mạnh hơn nhiều"], "answer": 1, "explain": "Đừng đổi quân hoạt động lấy quân thụ động. Mã mạnh của con có giá trị hơn mã buồn ở góc." }
      ]
    },
    {
      "id": "kehoach",
      "icon": "🗺️",
      "title": "Lập kế hoạch",
      "month": 8,
      "week": "Tuần 33",
      "goal": "Có kế hoạch đơn giản cho mỗi thế cờ, thay vì đi từng nước rời rạc.",
      "intro": [
        "Kỳ thủ giỏi luôn có kế hoạch. Đây là 4 bước đơn giản:",
        "Bước 1: Đếm quân. Ai đang hơn?",
        "Bước 2: Tìm điểm yếu của đối thủ: quân treo, vua hở, tốt yếu, ô yếu.",
        "Bước 3: Tìm quân kém nhất của mình và đưa nó đến ô tốt hơn.",
        "Bước 4: Tấn công ở nơi mình mạnh hơn. Ví dụ: nhiều quân ở cánh vua thì tấn công cánh vua."
      ],
      "exercises": [
        { "type": "quiz", "question": "Bước đầu tiên khi suy nghĩ về một thế cờ là gì?", "choices": ["Đếm quân xem ai đang hơn", "Đi ngay cho nhanh"], "answer": 0, "explain": "Biết ai hơn quân giúp con chọn kế hoạch: hơn thì đổi quân, kém thì tìm phản công." },
        { "type": "quiz", "question": "Vua đối phương vẫn ở giữa bàn cờ, chưa nhập thành, và cột e đã mở. Kế hoạch tốt là gì?", "choices": ["Đưa xe vào cột e và tấn công vua ở trung tâm", "Đẩy tốt cánh xa"], "answer": 0, "explain": "Vua ở trung tâm khi các cột đã mở rất nguy hiểm. Hãy đưa xe và các quân khác vào tấn công!" },
        { "type": "move", "fen": "2r3k1/pp3ppp/8/8/8/8/PP3PPP/R5K1 w - - 0 1", "prompt": "Xe a1 là quân kém nhất của Trắng. Hãy đưa nó tới nơi hoạt động hơn!", "answers": ["a1c1", "a1d1", "a1e1"], "explain": "Xe ra cột mở (c, d hoặc e) có thể tiến vào trận địa Đen. Ở a1 nó không làm được gì." },
        { "type": "quiz", "question": "Con có 3 quân ở cánh vua, đối thủ chỉ có 1 quân phòng thủ ở đó. Con nên tấn công ở đâu?", "choices": ["Cánh vua, nơi mình mạnh hơn", "Cánh hậu"], "answer": 0, "explain": "Tấn công ở nơi mình có nhiều quân hơn đối thủ." },
        { "type": "quiz", "question": "Kế hoạch tốt là gì?", "choices": ["Một mục tiêu đơn giản, ví dụ: đưa xe vào cột mở rồi lên hàng 7", "Đi mỗi nước một ý, không cần mục tiêu"], "answer": 0, "explain": "Kế hoạch đơn giản mà làm đến nơi đến chốn tốt hơn nhiều so với không có kế hoạch." }
      ]
    },
    {
      "id": "vuatancuoc",
      "icon": "🤴",
      "title": "Vua hoạt động ở tàn cuộc",
      "month": 8,
      "week": "Tuần 34",
      "goal": "Đưa vua lên chiến đấu khi đã đổi gần hết quân.",
      "intro": [
        "Ở đầu ván, vua phải trốn kỹ sau nhập thành. Nhưng ở tàn cuộc, khi hậu đã đổi, vua không còn sợ bị chiếu hết.",
        "Lúc đó vua trở thành một quân chiến đấu rất mạnh: hãy đưa vua lên trung tâm!",
        "Vua có thể bảo vệ tốt của mình, ăn tốt của đối phương và dẫn đường cho tốt thông."
      ],
      "exercises": [
        { "type": "quiz", "fen": "8/pp3ppk/8/8/8/8/PP3PPP/6K1 w - - 0 1", "question": "Chỉ còn lại tốt. Vua Trắng nên làm gì?", "choices": ["Tiến lên trung tâm", "Ở yên trong góc"], "answer": 0, "explain": "Ở tàn cuộc không còn hậu, vua cần lên trung tâm để chiến đấu." },
        { "type": "move", "fen": "8/pp3ppk/8/8/8/8/PP3PPP/6K1 w - - 0 1", "prompt": "Hãy đưa vua Trắng đi về phía trung tâm!", "answers": ["g1f1"], "explain": "Vua đi f1, rồi e2, d3… tiến về trung tâm nhanh hơn vua Đen." },
        { "type": "drill", "fen": "3k4/8/3K4/8/3P4/8/8/8 w - - 0 1", "goal": "promote", "maxMoves": 15, "botLevel": 3, "prompt": "Vua đã đứng trước tốt. Hãy đưa tốt lên phong hậu trong 15 nước!" },
        { "type": "drill", "fen": "8/8/4k3/8/8/8/3PP3/4K3 w - - 0 1", "goal": "promote", "maxMoves": 35, "botLevel": 3, "prompt": "Hai tốt và vua chống lại vua đơn độc. Dùng vua dẫn đường và phong hậu trong 35 nước!" }
      ]
    }
  ]
};
