# 04 - Thang chấm điểm

Chấm **cuối mỗi buổi học** (và bài kiểm tra trình độ). Mỗi tiêu chí **0-10**, số nguyên hoặc .5.
**Mỗi điểm phải có: `reason` (vì sao, dẫn ví dụ thật trong buổi) và `fix` (một cách sửa cụ thể).** Không ghi điểm trống lý do.

## 5 tiêu chí và trọng số

| Tiêu chí (`key`) | Trọng số | Đánh giá cái gì |
|---|---|---|
| `pronunciation` (Phát âm) * | 15% | Rõ ràng, dễ hiểu; lỗi âm hay gặp (âm cuối, th, r/l, nguyên âm). |
| `vocabulary` (Từ vựng) | 25% | Dùng đúng từ đã học, đúng nghĩa, đúng ngữ cảnh; vốn từ chủ động. |
| `grammar` (Ngữ pháp) | 25% | Đúng cấu trúc câu, thì, mạo từ, số ít/nhiều, trật tự từ. |
| `fluency` (Trôi chảy) | 15% | Tốc độ trả lời, ngập ngừng, câu hoàn chỉnh, tự tin. |
| `comprehension` (Hiểu) | 20% | Hiểu câu hỏi/hướng dẫn tiếng Anh mà không cần dịch. |

**Điểm tổng** (`overall`) = tổng (điểm x trọng số), làm tròn 0.1.

\* **Phát âm từ chữ hoặc giọng nói chỉ là ước lượng.** Chat chữ không nghe được âm: chấm dựa trên cách học viên mô tả/đọc IPA và lỗi chính tả gợi ý nhầm âm. Với giọng nói (chép giọng), chấm dựa trên chỗ phần chép sai (có thể do phần mềm nhận dạng). Luôn ghi `"estimated": true` và nói trong `reason`: "Ước lượng, chưa nghe trực tiếp". Nếu không có dữ liệu gì, đặt `score: null`, `reason: "Chưa đủ dữ liệu"` và tính overall từ 4 tiêu chí còn lại (chia lại trọng số).

## Mức điểm (anchor)

| Điểm | Ý nghĩa ở trình độ người mới |
|---|---|
| 0-2 | Gần như chưa làm được, cần người dẫn từng từ. |
| 3-4 | Làm được với gợi ý nhiều, sai thường xuyên. |
| 5-6 | Làm được việc cơ bản, còn lỗi nhưng người nghe hiểu. |
| 7-8 | Làm tốt ở mức đang học, lỗi ít, tự sửa được. |
| 9-10 | Gần như không lỗi ở mức này (hiếm; cần đúng cả buổi). |

Chấm theo **mức A1/A2** của học viên, không so với người bản xứ. Không chấm hào phóng quá: điểm phải giúp học viên biết cần làm gì.

## Ngưỡng level (dựa trên `overall`)

| Overall | Ý nghĩa |
|---|---|
| < 3.5 | Dưới A1: quay lại chào hỏi, 100 từ đầu, phát âm. |
| 3.5 - 5.4 | **A1** đang học. |
| 5.5 - 6.9 | **A1 vững**: gần sẵn sàng lên A2. |
| >= 7.0 | **Đạt** mức hiện tại. |

**Lên stage**: theo `curriculum.md` (can-do + kiểm tra cuối stage + sổ lỗi). `overall >= 7.0` trong 2 buổi liên tiếp, không tiêu chí nào dưới 5, là điều kiện **cần** để mở bài kiểm tra cuối stage; ngưỡng đạt của từng stage nằm trong `exit_assessment.pass_vi`. Khi lên stage cập nhật `profile.stage`, `profile.step = 1`, `profile.level`, ghi lý do.
**Hạ level**: chỉ đề xuất, không tự hạ; nếu `overall < 3.5` hai buổi liên tiếp, đề xuất học lại bước nền.

## Cách ghi trong buổi học

Mỗi tiêu chí: `{ "score": 6.5, "reason": "...", "fix": "...", "estimated": false }` (pronunciation: `estimated: true`).
Cuối buổi nói với học viên: điểm tổng, **một** điểm mạnh, **một** điều cần sửa nhất (đừng đọc hết 5 phần dài dòng; chi tiết có trong app).
