/*
 * Bộ khai cuộc thi đấu cho trẻ – theo kiểu "hệ thống": cùng một cách dàn quân, ít phải học thuộc.
 * Mỗi thế khai cuộc:
 *   moves – chuỗi nước (SAN) từ đầu ván; notes[i] giải thích nước thứ i bằng lời dễ hiểu cho trẻ.
 *   idea  – ý tưởng chính của cả thế khai cuộc (một câu); tips – mẹo nhớ và bẫy cần tránh.
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
        "Khi cầm Trắng, con luôn xếp quân theo một hình quen thuộc: tốt e4, mã f3, tượng c4, tốt c3 và d3, rồi nhập thành.",
        "Tượng c4 nhắm vào ô f7. Ô f7 là chỗ yếu nhất của Đen ở đầu ván, vì chỉ có vua bảo vệ.",
        "Dù đối thủ đi thế nào, con vẫn dựng lại được hình này. Chỉ cần nhớ hình, không cần nhớ hết các nước!"
      ],
      "lines": [
        {
          "id": "y-chinh",
          "title": "Khai cuộc Ý – phương án chính",
          "idea": "Ra quân thật nhanh, nhắm vào ô f7 yếu của Đen, giữ trung tâm thật chắc rồi nhập thành.",
          "tips": [
            "Thứ tự dễ nhớ: tốt e4, mã f3, tượng c4, tốt c3, tốt d3, nhập thành.",
            "Mỗi nước nên ra một quân mới, đừng đi một quân hai lần.",
            "Đừng đưa hậu ra sớm: hậu sẽ bị các quân nhỏ đuổi chạy."
          ],
          "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O Re1",
          "notes": [
            "Tốt e tiến 2 ô vào giữa bàn cờ. Giữa bàn cờ giống như ngọn đồi, đứng ở đó nhìn được khắp nơi. Nước này còn mở đường cho hậu và tượng ra trận.",
            "Đen cũng đưa tốt vào giữa, đứng đối mặt chặn tốt e4 lại.",
            "Mã nhảy ra f3, hướng vào giữa bàn cờ và tấn công tốt e5. Mã đi chậm nên cần ra sớm.",
            "Đen đưa mã ra c6 để bảo vệ tốt e5. Nếu mã Trắng ăn e5 thì mã Đen ăn lại.",
            "Tượng ra c4, nhìn thẳng vào ô f7, chỗ yếu nhất của Đen. Tượng ra rồi thì vua cũng sắp nhập thành được.",
            "Đen bắt chước, đưa tượng ra c5 nhìn vào ô f2 của Trắng. Con cũng phải để ý ô f2 của mình nhé!",
            "Tốt c tiến 1 ô. Nước này chuẩn bị đẩy tốt d lên d4, và làm sẵn chỗ để tượng c4 lùi về khi bị đuổi.",
            "Đen ra mã f6, tấn công tốt e4. Đến lượt Trắng phải bảo vệ tốt này.",
            "Tốt d tiến 1 ô để bảo vệ tốt e4. Tốt e4 có tốt d3 đứng sau che chở nên rất chắc chắn, và tượng c1 cũng có đường ra.",
            "Đen làm giống vậy: tốt d6 bảo vệ tốt e5 và mở đường cho tượng c8.",
            "Nhập thành! Vua chạy vào góc an toàn sau hàng tốt, xe ra giữa sẵn sàng chiến đấu. Nhập thành sớm là thói quen của kỳ thủ giỏi.",
            "Đen cũng nhập thành, vua Đen cũng an toàn.",
            "Xe vào cột e để bảo vệ thêm tốt e4. Xong phần khai cuộc! Tiếp theo con có thể đưa mã b1 ra d2 rồi f1, hoặc lùi tượng về b3 cho an toàn."
          ]
        },
        {
          "id": "y-haima",
          "title": "Khi Đen ra mã f6 (Hai mã)",
          "idea": "Đen ra mã f6 sớm để tấn công tốt e4. Con chỉ cần bảo vệ bằng d3 rồi dựng lại hình quen thuộc.",
          "tips": [
            "Đi d3 là cách an toàn nhất, không cần nhớ biến phức tạp.",
            "Đừng vội đưa mã lên g5 tấn công f7: dễ bị Đen phản công.",
            "Vẫn là hình cũ: e4, mã f3, tượng c4, d3, c3, nhập thành."
          ],
          "moves": "e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O c3 d6 Re1",
          "notes": [
            "Tốt e vào giữa bàn cờ, mở đường cho hậu và tượng.",
            "Đen cũng chiếm giữa bàn cờ.",
            "Mã ra f3, tấn công tốt e5.",
            "Đen ra mã c6 bảo vệ tốt e5.",
            "Tượng ra c4, nhắm vào ô f7 yếu của Đen.",
            "Lần này Đen ra mã f6 trước, tấn công ngay tốt e4 của Trắng.",
            "Tốt d3 bảo vệ tốt e4. Cách chơi này an toàn và chắc chắn, không cần nhớ những biến phức tạp.",
            "Đen ra tượng e7 để chuẩn bị nhập thành.",
            "Nhập thành cho vua vào chỗ an toàn.",
            "Đen cũng nhập thành.",
            "Tốt c3 để sau này đẩy d4, và để tượng có chỗ lùi về. Con thấy không, thế cờ lại giống bài Khai cuộc Ý chính!",
            "Đen bảo vệ tốt e5.",
            "Xe vào cột e bảo vệ tốt e4. Mọi quân đã sẵn sàng!"
          ]
        },
        {
          "id": "y-philidor",
          "title": "Khi Đen đi d6 sớm (Philidor)",
          "idea": "Đen bảo vệ tốt e5 bằng tốt d6 thay vì ra mã, nên Đen ra quân chậm hơn. Con cứ ra quân theo hình quen thuộc.",
          "tips": [
            "Tốt d6 và e5 làm tượng f8 của Đen khó ra, đó là điểm yếu của cách chơi này.",
            "Hình của Trắng không đổi: tượng c4, d3, c3, nhập thành."
          ],
          "moves": "e4 e5 Nf3 d6 Bc4 Nf6 d3 Be7 O-O O-O c3",
          "notes": [
            "Tốt e vào giữa bàn cờ.",
            "Đen cũng chiếm giữa.",
            "Mã ra f3, tấn công tốt e5.",
            "Đen bảo vệ e5 bằng tốt d6 chứ không ra mã. Cách này chắc chắn nhưng làm tượng f8 của Đen khó ra hơn.",
            "Tượng vẫn ra c4, nhắm vào ô f7 như thường lệ.",
            "Đen ra mã, tấn công tốt e4.",
            "Tốt d3 bảo vệ tốt e4.",
            "Đen ra tượng e7. Đường hẹp quá nên tượng chỉ ra được đến đây.",
            "Nhập thành, vua an toàn.",
            "Đen nhập thành.",
            "Tốt c3: đủ hình rồi! Tốt e4, mã f3, tượng c4, tốt d3, tốt c3, vua an toàn."
          ]
        },
        {
          "id": "trang-sicilian",
          "title": "Khi Đen đi c5 (Phòng thủ Sicilia)",
          "idea": "Đen không đi e5 mà đi c5 ở bên cạnh. Con vẫn dựng hình quen thuộc của mình, không cần học biến khó.",
          "tips": [
            "Khi Đen đi e6, tượng c4 bị chặn đường. Có thể lùi tượng về b3.",
            "Sau c3, con chuẩn bị đẩy d4 để giành trung tâm."
          ],
          "moves": "e4 c5 Nf3 d6 Bc4 Nf6 d3 Nc6 O-O e6 c3",
          "notes": [
            "Tốt e vào giữa bàn cờ.",
            "Đen không đứng đối mặt mà đưa tốt c5 ở bên cạnh, nhìn vào ô d4. Đây gọi là Phòng thủ Sicilia.",
            "Mã ra f3, nhìn vào giữa bàn cờ.",
            "Đen mở đường cho tượng c8.",
            "Tượng ra c4 như thường lệ, nhắm vào ô f7.",
            "Đen ra mã, tấn công tốt e4.",
            "Tốt d3 bảo vệ tốt e4.",
            "Đen ra thêm mã nữa.",
            "Nhập thành sớm cho vua an toàn.",
            "Đen đưa tốt e6 chặn đường tượng c4. Tượng của con bị đóng cửa rồi, sau này có thể lùi về b3.",
            "Tốt c3 chuẩn bị đẩy d4 để giành trung tâm."
          ]
        },
        {
          "id": "trang-phap",
          "title": "Khi Đen đi e6 (Phòng thủ Pháp)",
          "idea": "Con đẩy tốt lên e5 để giành nhiều chỗ, làm tượng c8 của Đen bị nhốt, rồi giữ bức tường tốt thật vững.",
          "tips": [
            "Hai tốt d4 và e5 là bức tường của con, hãy giữ nó chắc chắn.",
            "Đen sẽ tấn công chân tường là tốt d4, nên con dùng tốt c3 và mã f3 để bảo vệ."
          ],
          "moves": "e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3",
          "notes": [
            "Tốt e vào giữa bàn cờ.",
            "Đen đi tốt e6, chuẩn bị đẩy d5 để đánh vào tốt e4. Đây gọi là Phòng thủ Pháp.",
            "Đen cho phép thì con đưa thêm tốt d vào giữa. Hai tốt đứng cạnh nhau ở giữa bàn cờ rất mạnh!",
            "Đen tấn công tốt e4.",
            "Tốt e tiến lên e5, đi qua chứ không ăn. Bây giờ con có nhiều chỗ hơn, còn tượng c8 của Đen bị nhốt sau tốt e6.",
            "Đen tấn công vào chân bức tường tốt, tức là tốt d4.",
            "Tốt c3 bảo vệ tốt d4. Nếu Đen ăn d4 thì tốt c3 ăn lại.",
            "Đen ra mã, tấn công d4 thêm lần nữa.",
            "Mã f3 bảo vệ d4 thêm một lần, lại che chở cả tốt e5. Bức tường vẫn vững!"
          ]
        },
        {
          "id": "trang-caro",
          "title": "Khi Đen đi c6 (Phòng thủ Caro-Kann)",
          "idea": "Gặp Caro-Kann, con cũng đẩy tốt lên e5 để giành chỗ, rồi ra quân bình tĩnh và nhập thành.",
          "tips": [
            "Tượng đứng e2 chứ không phải d3, vì tượng Đen ở f5 đang canh ô d3.",
            "Giữ tốt e5 thật chắc bằng tốt d4 và mã f3."
          ],
          "moves": "e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 Nd7 O-O",
          "notes": [
            "Tốt e vào giữa bàn cờ.",
            "Đen đi c6, chuẩn bị đẩy d5. Đây gọi là Phòng thủ Caro-Kann.",
            "Đưa thêm tốt d vào giữa bàn cờ.",
            "Đen tấn công tốt e4.",
            "Đẩy tốt lên e5 để giành chỗ, giống như khi gặp Phòng thủ Pháp.",
            "Lần này Đen kịp đưa tượng ra ngoài trước khi đi e6, nên tượng Đen không bị nhốt.",
            "Mã ra f3, bảo vệ tốt d4 và tốt e5.",
            "Đen mở đường cho tượng f8.",
            "Tượng ra e2 chứ không ra d3, vì tượng Đen ở f5 đang canh ô d3, ra đó sẽ bị đổi mất. Từ e2, con sẵn sàng nhập thành.",
            "Đen ra mã d7.",
            "Nhập thành: vua an toàn, xong phần khai cuộc!"
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
        "Khi Trắng đi e4, con đáp lại bằng e5: cũng chiếm giữa bàn cờ giống như Trắng.",
        "Sau đó ra mã c6 bảo vệ tốt e5, đưa tượng ra, rồi nhập thành thật nhanh.",
        "Cẩn thận khi hậu Trắng ra sớm để dọa ô f7. Bài Chống chiếu hết 4 nước sẽ dạy con cách chặn."
      ],
      "lines": [
        {
          "id": "den-y",
          "title": "Gặp Khai cuộc Ý",
          "idea": "Cầm Đen, con chơi giống hệt Trắng: tốt e5, mã c6, tượng c5, mã f6, tốt d6, rồi nhập thành.",
          "tips": [
            "Luôn để ý ô f7 của mình, vì tượng c4 của Trắng đang nhìn vào đó.",
            "Ra quân nhanh và nhập thành sớm."
          ],
          "moves": "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O",
          "notes": [
            "Trắng đưa tốt e vào giữa bàn cờ.",
            "Con cũng đưa tốt e vào giữa, chặn tốt e4 lại. Giữa bàn cờ là của cả hai bên!",
            "Mã Trắng tấn công tốt e5 của con.",
            "Mã ra c6 bảo vệ tốt e5. Vừa ra quân vừa bảo vệ, một nước làm được hai việc!",
            "Tượng Trắng nhìn vào ô f7 của con. Nhớ để ý ô này nhé!",
            "Tượng ra c5, nhìn lại vào ô f2 của Trắng. Ăn miếng trả miếng!",
            "Trắng chuẩn bị đẩy d4 để đuổi tượng của con.",
            "Mã ra f6, tấn công tốt e4. Sau khi nhập thành, mã f6 còn che chở cho vua.",
            "Trắng bảo vệ tốt e4.",
            "Tốt d6 bảo vệ tốt e5 và mở đường cho tượng c8.",
            "Trắng nhập thành.",
            "Con nhập thành: vua đã an toàn trong lâu đài!"
          ]
        },
        {
          "id": "den-4nuoc",
          "title": "Chống 'chiếu hết 4 nước'",
          "idea": "Nhiều bạn thích đưa hậu ra sớm để chiếu hết ở f7. Con chỉ cần bình tĩnh chặn lại, rồi ra quân. Hậu ra sớm sẽ bị đuổi chạy lung tung!",
          "tips": [
            "Khi hậu ở h5 và tượng ở c4, tuyệt đối không đi mã f6: hậu sẽ ăn f7 chiếu hết!",
            "Đuổi hậu bằng quân nhỏ, vừa đuổi vừa ra quân."
          ],
          "moves": "e4 e5 Qh5 Nc6 Bc4 g6 Qf3 Nf6",
          "notes": [
            "Trắng đưa tốt e vào giữa.",
            "Con cũng đưa tốt e vào giữa.",
            "Trắng đưa hậu ra rất sớm! Hậu tấn công tốt e5 và nhìn vào ô f7. Cẩn thận nhé!",
            "Mã c6 bảo vệ tốt e5. Bây giờ hậu không ăn được e5 nữa.",
            "Tượng Trắng cũng nhìn vào ô f7. Trắng đang dọa hậu ăn f7 chiếu hết! Con phải chặn ngay.",
            "Tốt g6 đuổi hậu đi và chặn đường hậu tới f7. Nhớ nhé: lúc này mà đi mã f6 là hậu ăn f7 chiếu hết!",
            "Hậu chạy sang f3, lại nhìn vào ô f7 lần nữa.",
            "Mã f6 chặn đường hậu đến f7, đồng thời ra thêm quân. Con đã ra 2 quân, còn Trắng chỉ lo chạy hậu. Đen đang chơi tốt hơn!"
          ]
        },
        {
          "id": "den-tayban",
          "title": "Gặp Khai cuộc Tây Ban Nha",
          "idea": "Tượng Trắng tấn công mã c6. Con đuổi tượng bằng tốt a6, rồi ra quân và nhập thành.",
          "tips": [
            "Đừng sợ khi tượng tấn công mã c6: mã vẫn có tốt b7 và d7 che chở.",
            "Ra tượng e7 rồi nhập thành."
          ],
          "moves": "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7",
          "notes": [
            "Trắng đưa tốt e vào giữa.",
            "Con cũng đưa tốt e vào giữa.",
            "Mã Trắng tấn công tốt e5.",
            "Mã c6 bảo vệ tốt e5.",
            "Tượng Trắng tấn công mã c6, chính là quân đang bảo vệ tốt e5. Nhưng đừng lo, mã c6 vẫn có tốt b7 và d7 che chở.",
            "Tốt a6 hỏi tượng: bạn muốn lùi lại, hay đổi lấy mã?",
            "Tượng lùi về a4.",
            "Mã ra f6, tấn công tốt e4.",
            "Trắng nhập thành.",
            "Tượng ra e7, chuẩn bị nhập thành ở nước sau."
          ]
        },
        {
          "id": "den-scotch",
          "title": "Khi Trắng đẩy d4 sớm (Scotch)",
          "idea": "Trắng mở trung tâm sớm bằng d4. Con ăn tốt, rồi ra quân thật nhanh để tấn công tốt e4.",
          "tips": [
            "Sau khi đổi tốt, nhớ kiểm tra xem quân nào của mình đang bị tấn công.",
            "Tượng b4 ghim mã c3, làm mã không bảo vệ tốt e4 được nữa."
          ],
          "moves": "e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nc3 Bb4",
          "notes": [
            "Trắng đưa tốt e vào giữa.",
            "Con cũng chiếm giữa.",
            "Mã Trắng tấn công e5.",
            "Mã c6 bảo vệ e5.",
            "Trắng đẩy d4, muốn mở giữa bàn cờ ngay.",
            "Con ăn tốt d4. Đổi tốt là bình thường, không sao cả.",
            "Mã Trắng ăn lại, đứng ở giữa bàn cờ.",
            "Mã ra f6, tấn công tốt e4.",
            "Trắng ra mã c3 để bảo vệ tốt e4.",
            "Tượng b4 ghim mã c3: mã không được chạy vì sau lưng là vua. Vậy là mã c3 không còn bảo vệ tốt e4 được nữa. Tiếp theo con nhập thành."
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
        "Sau đó con xây một tòa lâu đài vững chắc: tốt e6, mã f6, tượng e7 hoặc d6, rồi nhập thành.",
        "Lâu đài này rất chắc chắn, đối thủ rất khó tấn công."
      ],
      "lines": [
        {
          "id": "den-qgd",
          "title": "Gặp Gambit Hậu",
          "idea": "Con xây lâu đài: tốt d5, tốt e6, mã f6, tượng e7, rồi nhập thành. Rất chắc chắn!",
          "tips": [
            "Tốt e6 bảo vệ tốt d5 thật vững.",
            "Khi tượng Trắng ghim mã f6, đưa tượng e7 ra đứng chắn để gỡ ghim."
          ],
          "moves": "d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6",
          "notes": [
            "Trắng đưa tốt d vào giữa bàn cờ.",
            "Con cũng đưa tốt d vào giữa, đứng đối mặt chặn lại.",
            "Trắng tấn công tốt d5 từ bên cạnh. Đây gọi là Gambit Hậu.",
            "Tốt e6 bảo vệ tốt d5. Nếu Trắng ăn d5, con ăn lại bằng tốt e6.",
            "Trắng ra mã, tấn công d5 thêm lần nữa.",
            "Mã ra f6 bảo vệ thêm tốt d5. Bây giờ cả hai bên đều có 2 quân nhìn vào ô d5.",
            "Tượng Trắng ghim mã f6: nếu mã chạy đi, hậu d8 sẽ bị ăn.",
            "Tượng ra e7 đứng chắn trước hậu, gỡ đòn ghim. Con cũng sẵn sàng nhập thành.",
            "Trắng mở đường cho tượng f1.",
            "Nhập thành: lâu đài đã xây xong, vua an toàn!",
            "Trắng ra mã.",
            "Tốt h6 hỏi tượng g5: lùi lại hay đổi lấy mã? Vua của con còn có thêm ô thở ở h7."
          ]
        },
        {
          "id": "den-london",
          "title": "Gặp Hệ thống London",
          "idea": "Trắng đưa tượng ra f4 rất sớm. Con xây lâu đài như thường lệ, rồi đặt tượng d6 để đổi tượng mạnh của Trắng.",
          "tips": [
            "Tượng f4 là quân mạnh nhất của Trắng trong thế cờ này.",
            "Đổi được tượng f4 thì Trắng mất bớt sức mạnh."
          ],
          "moves": "d4 d5 Bf4 Nf6 e3 e6 Nf3 Bd6",
          "notes": [
            "Trắng đưa tốt d vào giữa.",
            "Con cũng đưa tốt d vào giữa.",
            "Trắng ra tượng f4 ngay. Đây gọi là Hệ thống London.",
            "Mã ra f6, nhìn vào giữa bàn cờ.",
            "Trắng mở đường cho tượng f1.",
            "Tốt e6 mở đường cho tượng f8 của con.",
            "Trắng ra mã.",
            "Tượng ra d6, đứng đối mặt tượng f4. Nếu tượng Trắng ăn thì con ăn lại, và tượng mạnh nhất của Trắng biến mất. Tiếp theo con nhập thành."
          ]
        },
        {
          "id": "den-colle",
          "title": "Khi Trắng đi mã f3 và e3",
          "idea": "Trắng chơi chậm rãi. Con cứ xây lâu đài: tốt d5, e6, mã f6, tượng e7, rồi nhập thành.",
          "tips": [
            "Không cần vội, hai bên đều đang xây nhà.",
            "Sau khi nhập thành, có thể đẩy tốt c5 để đánh vào trung tâm của Trắng."
          ],
          "moves": "d4 d5 Nf3 Nf6 e3 e6 Bd3 Be7 O-O O-O",
          "notes": [
            "Trắng đưa tốt d vào giữa.",
            "Con cũng đưa tốt d vào giữa.",
            "Trắng ra mã.",
            "Con ra mã f6, nhìn vào giữa bàn cờ.",
            "Trắng mở đường cho tượng.",
            "Tốt e6 bảo vệ d5 và mở đường cho tượng f8.",
            "Trắng ra tượng d3, nhìn về phía vua của con.",
            "Tượng ra e7, chuẩn bị nhập thành.",
            "Trắng nhập thành.",
            "Con nhập thành. Lâu đài đã xây xong! Sau này có thể đẩy tốt c5 để đánh vào trung tâm."
          ]
        }
      ]
    }
  ]
};
