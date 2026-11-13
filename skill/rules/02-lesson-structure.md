# 02 - Cấu trúc một buổi học

Mỗi buổi **thuộc một stage và một step** của lộ trình (`curriculum.json`): chủ đề, mẫu câu, bài nói lấy từ step hiện tại (`profile.stage`, `profile.step`). Một buổi: **25-40 phút**, 7 bước, theo đúng thứ tự. Mỗi bước ghi thời lượng gợi ý. Nếu học viên mệt, rút ngắn bước 3-4, **không bỏ** bước 2 và 6.

| # | Bước | Phút | Nội dung |
|---|---|---|---|
| 1 | **Warm-up** | 3 | Chào, hỏi 2 câu quen thuộc (How are you? What did you do today?). Mục đích: làm quen mở miệng, không sửa lỗi. |
| 2 | **Ôn từ vựng của ngày** | 5-8 | Lấy danh sách trong `daily/<ngày>.json`. Hỏi từng từ: nghĩa, đọc, đặt câu ngắn. Từ nào học viên đã đánh dấu "chưa thuộc" thì dành thêm thời gian. Cộng thêm tối đa 3 từ đến hạn ôn (rules 05). |
| 3 | **Mẫu câu mới** | 5-8 | Dạy **1 mẫu câu** (vd: `I want + noun`). Công thức, 3 ví dụ, giải thích tiếng Việt 1-2 câu. Không dạy 2 mẫu cùng lúc. |
| 4 | **Luyện nói/viết** | 8-12 | Hội thoại ngắn, đóng vai (role-play) theo chủ đề ngày. Học viên dùng mẫu câu + từ mới. Làm từ dễ đến khó: lặp lại câu -> thay từ -> tự nghĩ câu. |
| 5 | **Sửa lỗi** | 3-5 | Trong lúc luyện, ghi nhanh lỗi (không ngắt mạch). Cuối bước chọn **tối đa 3 lỗi quan trọng nhất** để sửa rõ: sai - đúng - lý do ngắn bằng tiếng Việt. |
| 6 | **Recap** | 2-3 | Hỏi học viên: "Hôm nay bạn học được gì?" Bổ sung nếu thiếu. Nhắc 5-8 từ và 1 mẫu câu. |
| 7 | **Bài tập về nhà** | 2 | 2-3 việc ngắn, làm được trong 10-15 phút (vd: viết 3 câu, nghe lại từ trong danh sách ngày mai, nói to 5 câu). |

## Sau buổi học (agent làm, học viên không cần chờ)

1. Chấm điểm 5 tiêu chí (rules 04), nói điểm tổng + mỗi tiêu chí **kèm lý do và cách sửa**.
2. Ghi `workspace/lessons/<ngày>-NN.json` (NN = 01, 02, ... trong ngày).
3. Cập nhật `vocab.json`: từ mới đã dạy (`status: learning`, `box: 1`, `due` = ngày mai); từ ôn tập cập nhật `box/due` theo 05.
4. Cập nhật `errors.json` (08).
5. Chuẩn bị `daily/<ngày mai>.json` (06) nếu chưa có.
6. Cập nhật `profile.json`: `step` (sang step kế khi `overall >= 6` và làm được mẫu câu ở bước 4), `cando` (chỉ tick khi có bằng chứng trong buổi), xét lên stage theo curriculum.md.

## Chủ đề gợi ý (chi tiết từng stage: curriculum.json)

chào hỏi và giới thiệu -> số đếm và thời gian -> gia đình -> thói quen hằng ngày -> đồ ăn và gọi món -> mua sắm -> nhà cửa -> đường đi -> công việc -> sở thích. A2: kể chuyện quá khứ, kế hoạch tương lai, mô tả người/nơi, nhờ giúp đỡ, đi lại và du lịch.
