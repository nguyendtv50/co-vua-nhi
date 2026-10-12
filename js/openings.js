/*
 * Bộ khai cuộc thi đấu cho trẻ – theo kiểu "hệ thống": cùng một cách dàn quân, ít phải học thuộc.
 * Mỗi thế khai cuộc: moves là chuỗi nước (SAN) từ đầu ván; notes[i] giải thích nước thứ i.
 * Phần sau dấu "=" phải là JSON hợp lệ: tools/validate.py kiểm tra mọi nước đi.
 */
window.OPENINGS = {
  "repertoires": [
    {
      "id": "trang",
      "color": "w",
      "icon": "⚪",
      "title": "Cầm Trắng: Khai cuộc Ý",
      "intro": [
        "Khi cầm Trắng, con luôn dàn quân theo một hình quen thuộc: tốt e4, mã f3, tượng c4, tốt c3 và d3, rồi nhập thành.",
        "Tượng c4 nhắm vào ô f7, điểm yếu nhất của Đen ở đầu ván.",
        "Dù đối thủ đi thế nào, con vẫn có thể dựng lại hình này. Nhớ hình, không cần nhớ hết các nước!"
      ],
      "lines": [
        {
          "id": "y-chinh",
          "title": "Khai cuộc Ý – phương án chính",
          "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1",
          "notes": [
            "Chiếm trung tâm và mở đường cho hậu, tượng.",
            "Đen cũng chiếm trung tâm.",
            "Ra mã và tấn công tốt e5.",
            "Đen ra mã để bảo vệ tốt e5.",
            "Tượng nhắm vào ô f7, điểm yếu của Đen.",
            "Đen đưa tượng ra, nhắm vào ô f2 của mình.",
            "Chuẩn bị đẩy d4 và mở đường lui cho tượng.",
            "Đen ra mã, tấn công tốt e4.",
            "Bảo vệ tốt e4 thật chắc chắn.",
            "Đen bảo vệ tốt e5, mở đường cho tượng c8.",
            "Nhập thành: vua an toàn, xe sẵn sàng ra trận.",
            "Đen cũng nhập thành.",
            "Xe vào cột e để bảo vệ tốt e4. Tiếp theo có thể đi mã d2, tượng b3."
          ]
        },
        {
          "id": "y-haima",
          "title": "Khi Đen ra mã f6 (Hai mã)",
          "moves": "e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O c3 d6 Re1",
          "notes": [
            "Chiếm trung tâm.",
            "Đen chiếm trung tâm.",
            "Ra mã, tấn công tốt e5.",
            "Đen bảo vệ tốt e5.",
            "Tượng nhắm f7.",
            "Đen ra mã sớm, tấn công tốt e4.",
            "Bảo vệ tốt e4. Cách chơi chắc chắn, không cần nhớ biến phức tạp.",
            "Đen ra tượng để chuẩn bị nhập thành.",
            "Nhập thành cho vua an toàn.",
            "Đen nhập thành.",
            "Dựng lại hình quen thuộc: tốt c3, chuẩn bị d4.",
            "Đen bảo vệ tốt e5.",
            "Xe vào cột e. Thế cờ giống hệt phương án chính!"
          ]
        },
        {
          "id": "y-philidor",
          "title": "Khi Đen đi d6 sớm (Philidor)",
          "moves": "e4 e5 Nf3 d6 Bc4 Nf6 d3 Be7 O-O O-O c3",
          "notes": [
            "Chiếm trung tâm.",
            "Đen chiếm trung tâm.",
            "Ra mã, tấn công tốt e5.",
            "Đen bảo vệ tốt e5 bằng tốt d6 thay vì ra mã.",
            "Vẫn đưa tượng lên c4 như thường lệ.",
            "Đen ra mã, tấn công tốt e4.",
            "Bảo vệ tốt e4.",
            "Đen ra tượng.",
            "Nhập thành.",
            "Đen nhập thành.",
            "Đủ hình: e4, mã f3, tượng c4, d3, c3, vua an toàn."
          ]
        },
        {
          "id": "trang-sicilian",
          "title": "Khi Đen đi c5 (Phòng thủ Sicilia)",
          "moves": "e4 c5 Nf3 d6 Bc4 Nf6 d3 Nc6 O-O e6 c3",
          "notes": [
            "Chiếm trung tâm.",
            "Đen đi c5, kiểm soát ô d4 từ bên cạnh.",
            "Ra mã về phía trung tâm.",
            "Đen mở đường cho tượng c8.",
            "Vẫn đưa tượng lên c4, nhắm f7.",
            "Đen ra mã, tấn công tốt e4.",
            "Bảo vệ tốt e4.",
            "Đen ra mã còn lại.",
            "Nhập thành sớm cho an toàn.",
            "Đen chặn đường chéo của tượng c4.",
            "Chuẩn bị đẩy d4 để giành trung tâm."
          ]
        },
        {
          "id": "trang-phap",
          "title": "Khi Đen đi e6 (Phòng thủ Pháp)",
          "moves": "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3",
          "notes": [
            "Chiếm trung tâm.",
            "Đen chuẩn bị đẩy d5.",
            "Thêm một tốt vào trung tâm khi đối thủ cho phép.",
            "Đen tấn công tốt e4.",
            "Đẩy tốt lên e5 để giành không gian, tượng c8 của Đen bị nhốt sau tốt e6.",
            "Đen tấn công chuỗi tốt của Trắng từ phía dưới.",
            "Bảo vệ tốt d4 bằng tốt c3.",
            "Đen tăng sức ép lên d4.",
            "Ra mã, bảo vệ thêm d4 và e5."
          ]
        },
        {
          "id": "trang-caro",
          "title": "Khi Đen đi c6 (Phòng thủ Caro-Kann)",
          "moves": "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 Nd7 O-O",
          "notes": [
            "Chiếm trung tâm.",
            "Đen chuẩn bị đẩy d5.",
            "Thêm một tốt vào trung tâm.",
            "Đen tấn công tốt e4.",
            "Đẩy lên e5 để giành không gian.",
            "Đen ra tượng ra ngoài trước khi đi e6.",
            "Ra mã.",
            "Đen mở đường cho tượng f8.",
            "Ra tượng, chuẩn bị nhập thành. Ở đây tượng đứng e2 vì tượng Đen kiểm soát đường chéo d3.",
            "Đen ra mã.",
            "Nhập thành: vua an toàn."
          ]
        }
      ]
    },
    {
      "id": "den-e4",
      "color": "b",
      "icon": "⚫",
      "title": "Cầm Đen khi Trắng đi e4",
      "intro": [
        "Khi Trắng đi e4, con đáp lại bằng e5: cũng chiếm trung tâm như Trắng.",
        "Sau đó ra mã c6 để bảo vệ e5, đưa tượng ra và nhập thành thật nhanh.",
        "Cẩn thận với hậu của Trắng ra sớm để dọa ô f7, bài 'Chống chiếu hết 4 nước' sẽ dạy con cách chặn."
      ],
      "lines": [
        {
          "id": "den-y",
          "title": "Gặp Khai cuộc Ý",
          "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Đáp lại bằng e5: chiếm trung tâm như Trắng.",
            "Trắng tấn công tốt e5.",
            "Ra mã bảo vệ tốt e5.",
            "Trắng nhắm vào ô f7.",
            "Đưa tượng ra, nhắm vào ô f2 của Trắng.",
            "Trắng chuẩn bị đẩy d4.",
            "Ra mã, tấn công tốt e4.",
            "Trắng bảo vệ e4.",
            "Bảo vệ tốt e5, mở đường cho tượng c8.",
            "Trắng nhập thành.",
            "Nhập thành: vua an toàn."
          ]
        },
        {
          "id": "den-4nuoc",
          "title": "Chống 'chiếu hết 4 nước'",
          "moves": "e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Chiếm trung tâm.",
            "Trắng đưa hậu ra rất sớm, dọa ăn tốt e5 và nhắm ô f7!",
            "Bảo vệ tốt e5 bằng mã.",
            "Trắng dọa hậu ăn f7 chiếu hết!",
            "Đuổi hậu đi và chặn đường đến f7.",
            "Hậu lại dọa ăn f7 chiếu hết!",
            "Mã chặn đường của hậu, đồng thời ra quân. Đen đã ra 2 quân, chơi tốt hơn Trắng!"
          ]
        },
        {
          "id": "den-tayban",
          "title": "Gặp Khai cuộc Tây Ban Nha",
          "moves": "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Chiếm trung tâm.",
            "Trắng tấn công tốt e5.",
            "Bảo vệ tốt e5.",
            "Trắng tấn công mã, quân đang bảo vệ e5.",
            "Hỏi tượng: lui hay đổi lấy mã?",
            "Trắng lui tượng.",
            "Ra mã, tấn công tốt e4.",
            "Trắng nhập thành.",
            "Ra tượng, chuẩn bị nhập thành."
          ]
        },
        {
          "id": "den-scotch",
          "title": "Khi Trắng đẩy d4 sớm (Scotch)",
          "moves": "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3 Bb4",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Chiếm trung tâm.",
            "Trắng tấn công tốt e5.",
            "Bảo vệ tốt e5.",
            "Trắng mở trung tâm.",
            "Ăn tốt d4.",
            "Trắng ăn lại.",
            "Ra mã, tấn công tốt e4.",
            "Trắng bảo vệ tốt e4.",
            "Ghim mã c3, tăng sức ép lên tốt e4. Tiếp theo nhập thành."
          ]
        }
      ]
    },
    {
      "id": "den-d4",
      "color": "b",
      "icon": "⚫",
      "title": "Cầm Đen khi Trắng đi d4",
      "intro": [
        "Khi Trắng đi d4, con đáp lại bằng d5.",
        "Sau đó dựng một hình vững chắc: tốt e6, mã f6, tượng e7 (hoặc d6), rồi nhập thành.",
        "Hình này rất chắc chắn, giống một tòa lâu đài, khó bị tấn công."
      ],
      "lines": [
        {
          "id": "den-qgd",
          "title": "Gặp Gambit Hậu",
          "moves": "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Đáp lại bằng d5: giữ trung tâm.",
            "Trắng tấn công tốt d5 từ bên cạnh.",
            "Bảo vệ tốt d5 thật chắc bằng tốt e6.",
            "Trắng ra mã, tăng sức ép lên d5.",
            "Ra mã, bảo vệ thêm d5.",
            "Trắng ghim mã f6.",
            "Gỡ ghim và chuẩn bị nhập thành.",
            "Trắng mở đường cho tượng f1.",
            "Nhập thành: vua an toàn.",
            "Trắng ra mã.",
            "Hỏi tượng g5: lui hay đổi?"
          ]
        },
        {
          "id": "den-london",
          "title": "Gặp Hệ thống London",
          "moves": "d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Giữ trung tâm.",
            "Trắng ra tượng ra f4.",
            "Ra mã.",
            "Trắng mở đường cho tượng f1.",
            "Mở đường cho tượng f8.",
            "Trắng ra mã.",
            "Đặt tượng đối diện tượng f4 để đổi tượng mạnh nhất của Trắng."
          ]
        },
        {
          "id": "den-colle",
          "title": "Khi Trắng đi mã f3 và e3",
          "moves": "d4 d5 Nf3 Nf6 e3 e6 Bd3 Be7 O-O O-O",
          "notes": [
            "Trắng chiếm trung tâm.",
            "Giữ trung tâm.",
            "Trắng ra mã.",
            "Ra mã.",
            "Trắng mở đường cho tượng.",
            "Mở đường cho tượng f8.",
            "Trắng ra tượng.",
            "Ra tượng, chuẩn bị nhập thành.",
            "Trắng nhập thành.",
            "Nhập thành. Hình lâu đài đã xong!"
          ]
        }
      ]
    }
  ]
};
