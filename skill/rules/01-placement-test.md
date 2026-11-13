# 01 - Kiểm tra trình độ (A1 / A2)

Mục đích: xác định học viên đang ở **stage** nào của lộ trình (`curriculum.md`). Bài test A1-A2 dưới đây xếp vào A1.1, A1.2 hoặc A2.1; học viên giỏi hơn thì làm phần mở rộng ở cuối. Ngắn: **10-15 phút, 20 câu**. Làm bằng chat, từng câu một.

## Cách làm

- Nói trước: "Đây không phải thi đậu/rớt, chỉ để chọn bài vừa sức. Không biết thì cứ gõ 'không biết'."
- Cho phép tiếng Việt ở phần hướng dẫn. Câu hỏi bằng tiếng Anh rất đơn giản.
- Mỗi lượt 1 câu. Không sửa lỗi trong lúc test (chỉ ghi chú); sửa ở cuối.
- Có thể dừng sớm: sai liên tiếp 4 câu ở một phần thì bỏ qua phần khó hơn.

## Phần 1 - Từ vựng (6 câu)

Hỏi nghĩa/chọn từ cho: hello, water, mother, big, Monday, buy, tomorrow, cheap, always, uncomfortable.
(Lấy 6 từ tăng dần độ khó.)

## Phần 2 - Ngữ pháp cơ bản (6 câu)

Điền từ: `I ___ a student.` (am) / `She ___ coffee.` (likes) / `There ___ two books.` (are) / `He ___ to school yesterday.` (went) / `I ___ eating now.` (am) / `This is ___ than that.` (bigger).

## Phần 3 - Đọc hiểu (3 câu)

Đoạn 3 câu: "Tom gets up at six. He eats rice and eggs. Then he goes to work by bus." Hỏi: What time does Tom get up? What does he eat? How does he go to work?

## Phần 4 - Nói/viết (5 câu)

- What is your name? Where are you from?
- Tell me about your day (2-3 câu).
- What did you do yesterday? (quá khứ)
- What do you want to eat? Why?

## Chấm và xếp trình độ

Tính theo phần trăm đúng (câu mở: chấm đạt/chưa đạt theo rubric 04):

| Kết quả | Level |
|---|---|
| Dưới 35% hoặc không tạo được câu hoàn chỉnh | **A1 (đầu)**: bắt đầu từ chào hỏi, bảng chữ cái/phát âm, 100 từ đầu |
| 35% - 64% | **A1 (vững)**: câu hiện tại đơn, từ vựng đời sống |
| 65% trở lên, và đúng ít nhất 1 câu quá khứ | **A2** |

Khi hai kết quả sát nhau, **chọn level thấp hơn** (học vững hơn, dễ thành công hơn).

## Phần mở rộng (chỉ khi >= 65%)

Làm thêm 3-4 nhiệm vụ lấy từ `exit_assessment` của A2.2 rồi B1.1 trong `curriculum.json`. Đạt điều kiện điểm của A2.2 thì đặt `stage: "B1.1"`. Hai kết quả sát nhau thì chọn stage thấp hơn.

## Ghi kết quả

1. Cập nhật `workspace/profile.json`: `stage` (A1.1 nếu dưới 35% hoặc không tạo được câu hoàn chỉnh; A1.2 nếu 35-64%; A2.1 nếu >= 65%), `step: 1`, `level` (CEFR của stage), `level_note` (1 câu lý do), `placement: { date, score_percent, strengths[], weaknesses[] }`.
2. Ghi một file `workspace/lessons/<ngày>-NN.json` với `type: "placement"` (điểm 5 tiêu chí theo rubric 04, lỗi, ghi chú).
3. Đưa lỗi lặp lại vào `errors.json` (xem 08).
4. Viết `workspace/daily/<ngày mai>.json` (xem 06) phù hợp level vừa xác định.
5. Nói với học viên: level, 2 điểm mạnh, 2 điểm cần luyện, và kế hoạch 1 tuần đầu.
