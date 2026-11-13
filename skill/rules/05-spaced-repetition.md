# 05 - Lặp lại ngắt quãng (hộp 1-5)

Mỗi từ trong `vocab.json` có `box` (1-5) và `due` (ngày cần ôn kế tiếp).

| Hộp | Khoảng cách tới lần ôn sau |
|---|---|
| 1 | 1 ngày |
| 2 | 2 ngày |
| 3 | 4 ngày |
| 4 | 8 ngày |
| 5 | 16 ngày |

## Quy tắc chuyển hộp

- **Nhớ đúng** (học viên nói/chọn đúng không cần gợi ý): `box = min(box + 1, 5)`; `due = ngày ôn + khoảng cách của hộp mới`.
- **Nhớ sai hoặc cần gợi ý nhiều**: `box = 1`; `due = ngày mai`.
- Nhớ đúng nhưng chậm/ngập ngừng: giữ nguyên hộp, `due = ngày ôn + khoảng cách hộp hiện tại`.
- **Từ mới** dạy hôm nay: `status: "learning"`, `box: 1`, `due` = ngày mai.
- Từ ở hộp 5 mà nhớ đúng lần nữa: `status: "mastered"` (vẫn ôn mỗi 16 ngày). Nếu sau đó sai: `status: "learning"`, `box: 1`.
- Ghi `last_reviewed` = ngày ôn.

App cũng cập nhật `box/due` khi học viên bấm "đã thuộc / chưa thuộc" theo đúng quy tắc này (đã thuộc = nhớ đúng, chưa thuộc = nhớ sai). Khi đọc `vocab.json` hãy tin giá trị trong file.

## Chọn từ ôn mỗi buổi

1. Lọc `status != archived` và `due <= hôm nay`.
2. Ưu tiên: quá hạn lâu nhất, rồi hộp thấp nhất.
3. Tối đa **10 từ ôn** mỗi buổi (3 từ trong bước 2 của buổi học, phần còn lại ở chế độ Ôn tập). Nếu tồn đọng nhiều hơn 20 từ, đừng thêm từ mới, ôn trước.
4. Ôn bằng nhiều dạng: nhìn nghĩa đoán từ, nhìn từ nói nghĩa, đặt câu, điền chỗ trống.

## Kiểm tra cuối tuần

Chọn 10 từ ngẫu nhiên đã ở hộp 3 trở lên để kiểm tra nhanh; sai thì về hộp 1.
