# 06 - Từ vựng của ngày (viết trước cho ngày mai)

Mục tiêu: học viên **chuẩn bị từ vựng trước buổi học** (tab "Hôm nay" trong app). Vì vậy danh sách ngày mai phải sẵn sàng **trước khi** buổi học diễn ra, tốt nhất ngay sau buổi học hôm nay.

## Khi nào viết

- Cuối mỗi buổi học (bước "sau buổi học"), hoặc khi chạy chế độ "Chuẩn bị từ vựng ngày mai".
- Nếu `daily/<ngày>.json` đã tồn tại và học viên đã bắt đầu đánh dấu: **không ghi đè**; chỉ thêm khi người dùng yêu cầu rõ ràng.

## Nguồn từ: thư viện cá nhân (ưu tiên)

Nếu có `workspace/library/words.json` (nhập từ repo `hoangpham2263/english-vocabulary-sources` bằng `scripts/import-library.mjs`): **chọn từ từ đó**, không tự bịa danh sách.

1. Quyển phù hợp stage: `library_books` trong `curriculum.json` (A1/A2 -> quyển 1-2, B1 -> 3, B2 -> 4, C1 -> 5, C2 -> 6).
2. Loại các từ đã có trong `vocab.json` (so theo `word`). Ưu tiên từ khớp **chủ đề** của step hiện tại; nếu không có thì đi theo thứ tự `unit` tăng dần trong quyển.
3. Mỗi từ thư viện có `lid`, `word`, `ipa`, `vi`, `example`, `example_vi`, `source`. Khi thêm vào `vocab.json`: giữ `ipa`, `vi`; viết `def` tiếng Anh đơn giản; dùng `example` của thư viện làm ví dụ 1 và **tự viết thêm ví dụ 2** (đúng 2 câu); thêm `pos`, `topic`; thêm `source`: `{ "repo": "hoangpham2263/english-vocabulary-sources", "file": "4000-words/book1.json", "lid": "b1-afraid" }`.
4. Lộ trình 30 ngày (`workspace/library/days.json`) dùng được cho A1.1-A2.1: lấy `chunks` làm cụm câu của ngày, `pattern` làm mẫu câu; ghi `source.repo = "hoangpham2263/english-communication"`, `source.file = "assets/days.js"`.
5. Câu ví dụ thay thế lấy từ `workspace/library/sentences.json` (Tatoeba, CC BY 2.0 FR): ghi credit trong `source`.
6. Giữ ghi chú giấy phép trong `workspace/library/meta.json`; không phát hành lại nội dung thư viện, không đẩy nó lên GitHub.

Không có thư viện thì tự chọn từ như dưới.

## Chọn từ

1. Số từ mới = `profile.daily_new_words` (mặc định 6, giới hạn **5-8**).
2. **Một chủ đề** cho cả ngày (vd: "daily routine"). Các từ liên quan với nhau để nhớ cùng nhau.
3. Phù hợp level: A1 = từ đời sống rất cơ bản, ngắn (1-3 âm tiết hoặc cụm cố định); A2 = từ cụ thể hơn, cụm động từ đơn giản.
4. Tránh trùng từ đã có trong `vocab.json` (kể cả archived). Muốn ôn lại từ cũ thì dùng cơ chế lặp lại (05), không đưa lại vào danh sách mới.
5. Ưu tiên từ giúp **làm được việc thật** trong chủ đề mục tiêu (`profile.goal`), và từ cần cho mẫu câu của buổi mai.
6. Nếu số từ đến hạn ôn > 20: giảm từ mới xuống 5 và ghi chú lý do trong `tips`.

## Nội dung mỗi từ (bắt buộc đủ các trường)

- `word`: từ hoặc cụm (chữ thường, trừ tên riêng).
- `ipa`: phiên âm IPA theo giọng trong `profile.accent` (en-US mặc định).
- `pos`: loại từ (noun, verb, adjective, phrase...).
- `vi`: nghĩa tiếng Việt ngắn gọn.
- `def`: định nghĩa tiếng Anh **đơn giản** (dùng từ A1).
- `examples`: **đúng 2 câu** ví dụ, mỗi câu `{ "en": "...", "vi": "..." }`, ngắn (<= 8 từ ở A1), tự nhiên, cho cuộc sống hằng ngày.
- `topic`, `box: 1`, `due: <ngày của danh sách>`, `status: "new"`, `source` (nếu lấy từ thư viện).

## Kế hoạch buổi học trong file daily

Mỗi file daily có:

- `stage` và `step` (từ `curriculum.json`), `topic` (tiếng Anh) và `topic_vi`.
- `goal`: 1 câu "Cuối buổi bạn có thể...".
- `pattern`: mẫu câu mới của buổi (công thức + 1 ví dụ).
- `plan`: các bước theo `02-lesson-structure.md` (tên bước, phút, hoạt động).
- `tips`: 1-2 lời khuyên để chuẩn bị trước (vd: "Nghe từng từ bằng nút loa, đọc to 3 lần").
- `word_ids`: danh sách `id` từ trong `vocab.json`.

## Ghi file

1. Thêm các từ mới vào `workspace/vocab.json` (id duy nhất dạng `w-<slug>`, ví dụ `w-wake-up`).
2. Ghi `workspace/daily/<YYYY-MM-DD>.json` với `word_ids` trỏ tới các từ trên.
3. Kiểm tra: mọi `word_ids` đều tồn tại trong `vocab.json`; đủ 5-8 từ; JSON hợp lệ.
4. Báo lại cho người dùng: ngày, chủ đề, danh sách từ (một dòng mỗi từ).
