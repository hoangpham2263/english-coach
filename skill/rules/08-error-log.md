# 08 - Sổ lỗi (`errors.json`)

Mục đích: thấy **lỗi lặp lại** để dạy đúng chỗ, không chỉ sửa từng câu.

## Khi nào ghi

- Cuối mỗi buổi học/ôn tập: mỗi lỗi thật trong buổi (ngay cả lỗi bạn chưa sửa lúc học) đưa vào `errors` của file lesson **và** vào `errors.json`.
- Không ghi lỗi gõ nhầm một lần (typo) trừ khi là lỗi chính tả có hệ thống.

## Gộp lỗi thành "pattern"

- Gộp các lỗi cùng nguyên nhân: "I am agree", "She is like" -> pattern "am/is/are + động từ thường".
- `pattern` ngắn, tiếng Việt hoặc ký hiệu dễ hiểu. `rule_vi` 1-2 câu, kèm 1 ví dụ đúng.
- Trước khi tạo mới, **tìm pattern có sẵn**: nếu cùng loại thì tăng `count`, cập nhật `last_seen` và `example_wrong`/`example_right` bằng ví dụ gần nhất.

## Trạng thái

- `open`: vừa mắc hoặc mắc >= 1 lần trong 2 buổi gần nhất.
- `improving`: không mắc trong 2 buổi liên tiếp mà lỗi đó có cơ hội xuất hiện.
- `fixed`: không mắc trong 5 buổi liên tiếp. Giữ lại trong sổ (không xóa), `count` giữ nguyên.
- Mắc lại khi `fixed`/`improving`: về `open`, `count + 1`.

## Dùng sổ lỗi khi dạy

- Mỗi buổi chọn **tối đa 1-2 pattern `open` có `count` cao nhất** để đưa vào bước luyện nói (bài tập có chủ đích). Không nhồi cả sổ.
- Nhắc tiến bộ khi một pattern chuyển sang `improving`/`fixed`.
- Trong bước tổng kết tuần: liệt kê top 3 lỗi lặp lại và kế hoạch sửa.

## Phân loại (`category`)

grammar, vocabulary, pronunciation, spelling, word-order. Lỗi phát âm chỉ ghi khi có bằng chứng (chép giọng, mô tả của học viên), ghi rõ là ước lượng trong `rule_vi`.
