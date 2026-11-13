# 09 - Lộ trình giao tiếp (curriculum): từ người mới bắt đầu đến thành thạo

Toàn bộ dữ liệu lộ trình nằm ở `skill/curriculum.json` (agent và app đọc). File này là **luật dùng lộ trình** và danh sách nguồn. A1-A2 trước đây chỉ là đoạn đầu của lộ trình này.

## 10 giai đoạn (stage), mỗi giai đoạn có 8 bước (step)

| Stage | CEFR | Tên | Giờ học tích lũy (gần đúng) | Số từ tích lũy (ước lượng) | Quyển từ thư viện |
|---|---|---|---|---|---|
| A1.1 | A1 | Survival - Sống sót | 45 | 300 | 1 |
| A1.2 | A1 | Everyday basics - Đời thường cơ bản | 95 | 600 | 1 |
| A2.1 | A2 | Routine exchanges - Trao đổi thường ngày | 140 | 1000 | 2 |
| A2.2 | A2 | Plans and stories - Kế hoạch và câu chuyện | 190 | 1500 | 2 |
| B1.1 | B1 | Threshold: getting by - Xoay xở | 270 | 2000 | 3 |
| B1.2 | B1 | Threshold: connected speech - Nói liền mạch | 355 | 2500 | 3 |
| B2.1 | B2 | Vantage: discussion - Thảo luận và lập luận | 450 | 3200 | 4 |
| B2.2 | B2 | Vantage: professional - Giao tiếp công việc | 560 | 4000 | 4 |
| C1 | C1 | Effective operational proficiency - Trôi chảy và chính xác | 780 | 6000 | 5 |
| C2 | C2 | Mastery - Thành thạo | 1100 | 8000 | 6 |

Mỗi stage trong `curriculum.json` có: mục tiêu, chức năng giao tiếp (functions), chủ đề, mẫu ngữ pháp, số từ mục tiêu, bài nói (speaking tasks), danh sách **can-do** (6 mục, có `id`), **bài kiểm tra cuối stage** (exit assessment) và 8 bước.

## Mỗi buổi học thuộc một stage và một step

1. Đọc `profile.json`: `stage` (vd "A1.1"), `step` (1-8), `cando` (các id đã tick).
2. Nếu thiếu `stage`: đặt theo `level` hiện có (A1 -> "A1.1", A2 -> "A2.1", B1 -> "B1.1"...), rồi ghi vào profile.
3. Chủ đề, mẫu câu, bài nói của buổi lấy từ **step hiện tại** của stage. Một step thường 1-3 buổi; chuyển sang step kế khi học viên làm được mẫu câu ở bước 4 của buổi (rules 02) với điểm `overall >= 6`.
4. Ghi `stage` và `step` vào `daily/<ngày>.json` và `lessons/<ngày>-NN.json` (rules 07).
5. Từ mới ưu tiên từ thư viện (quyển ghi trong `library_books` của stage), xem rules 06.

## Can-do

- Cuối mỗi buổi, nếu học viên **tự làm được** một việc trong danh sách can-do của stage (không cần gợi ý), hãy đề nghị học viên tick trong app (tab "Lộ trình") hoặc ghi `cando[<id>] = true` vào `profile.json`. Chỉ tick khi có bằng chứng trong buổi (ghi lý do vào `teacher_notes`).
- Không tự tick giúp học viên các can-do chưa kiểm chứng. Học viên có thể tự tick; khi kiểm tra cuối stage, kiểm lại.

## Lên stage

Lên stage kế tiếp khi **đồng thời**:

1. Đủ số can-do tối thiểu (xem `pass_vi` của stage, thường 5/6).
2. Đạt điều kiện điểm trong `exit_assessment.pass_vi` ở bài kiểm tra cuối stage (chạy bằng chế độ "Kiểm tra trình độ" hoặc "Buổi học" có `type: "placement"`, ghi `stage_exam: true`).
3. Không có pattern lỗi `open` nào có `count >= 4` thuộc kỹ năng cốt lõi của stage (rules 08).

Khi lên stage: cập nhật `profile.stage`, `profile.step = 1`, `profile.level = <CEFR của stage>`, `level_note` ghi lý do; giữ nguyên can-do đã tick của stage cũ. Hạ stage chỉ đề xuất, không tự làm.

## Cách xếp stage khi kiểm tra trình độ

Rules `01-placement-test.md` có phần mở rộng: nếu học viên đạt >= 65% bài A1-A2, tiếp tục bằng 3-4 nhiệm vụ từ `exit_assessment` của B1.1 để xem có bắt đầu cao hơn không. Luôn chọn stage thấp hơn khi hai kết quả sát nhau.

## Nội dung có sẵn trong thư viện cá nhân (xem rules 06)

- `workspace/library/words.json`: 3592 từ chia 6 quyển, quyển 1-6 tương ứng khoảng A1-A2, A2, B1, B2, C1, C1-C2.
- `workspace/library/days.json`: lộ trình 30 ngày nói cho người mới (ngày 1-12 thuộc A1.1, ngày 13-24 thuộc A1.2, ngày 25-30 thuộc A2.1). Dùng làm nguồn cụm câu, mẫu câu, câu hỏi luyện nói của giai đoạn đầu.

## Nguồn tham khảo (đã dùng khi soạn lộ trình)

- Council of Europe, CEFR Common reference levels / bảng can-do (nghe, đọc, nói tương tác, nói liên tục, viết) cho A1-C2: https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale ; bản bảng can-do dùng để đối chiếu: https://www.kcl.ac.uk/language-centre/assets/can-do-statements-cefr.pdf (trích từ bảng của Council of Europe).
- Cambridge English, giờ học có hướng dẫn (Guided Learning Hours) gần đúng: A1 90-100, A2 180-200, B1 350-400, B2 500-600, C1 700-800, C2 1000-1200 (tích lũy), qua tổng hợp tại https://www.languagecert.org/Guided-Learning-Hours và https://cefr.schools.ac.cy/downloads/GuideToCEFR.pdf . Số giờ theo stage trong bảng trên là phần chia nhỏ của các mốc này.
- Số từ theo cấp độ chỉ là **ước lượng tham khảo**; CEFR không quy định số từ. Nguồn tham khảo: Milton (2009) trích trong https://wgtn.ac.nz/lals/resources/paul-nations-resources/vocabulary-lists/vocabulary-cefr-and-word-family-size/vocabulary-and-the-cefr-docx (đơn vị word family, khác headword); các bảng headword tổng hợp: https://explore.memrise.com/cefr-levels-explained .
- British Council LearnEnglish, mô tả các cấp độ và tài liệu nói theo level: https://learnenglish.britishcouncil.org/level/understand-your-level/a1-elementary ; https://learnenglish.britishcouncil.org/level/understand-your-level/b1-intermediate .
- Paul Nation, The Four Strands (cân bằng nghe, nói, học ngôn ngữ, luyện trôi chảy), dùng để cân bằng các hoạt động trong buổi học: https://roycross.blog/wp-content/uploads/2024/08/2007-four-strands-paul-nation.pdf (nguồn do repo english-communication của người dùng dẫn).
- Repo của người dùng: `hoangpham2263/english-communication` (lộ trình 30 ngày; repo đã xóa, chỉ còn bản đã nhập trong workspace/library/days.json), `hoangpham2263/english-coach-sources` (4000 từ, câu Tatoeba CC BY 2.0 FR). Ghi nguồn từng từ trong `vocab.json` (`source`).

Các mô tả chức năng, chủ đề, ngữ pháp, nhiệm vụ nói và tiêu chí đạt trong `curriculum.json` là **thiết kế của dự án này dựa trên** các nguồn trên, không phải sao chép nguyên văn từ một giáo trình nào. Người dùng có thể chỉnh `curriculum.json` bằng tay.
