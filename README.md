# English Coach

Học tiếng Anh giao tiếp từ con số 0 (A1) đến thành thạo (C2) với giáo viên AI.
Agent (Claude Code hoặc Codex) dạy và ghi kết quả; app chỉ để xem, chuẩn bị từ vựng và quản lý.

## Cách hoạt động

```
skill/       Luật của giáo viên (agent đọc, app không ghi): SKILL.md, rules/, curriculum.md + curriculum.json
workspace/   Dữ liệu học viên (JSON, không đưa lên git): profile, vocab, daily/, lessons/, errors, library/
prompts/     Mẫu prompt cho 5 chế độ
src/ ui/     App cục bộ (Node, không cần npm install)
```

1. Tab **Prompt**: chọn chế độ, agent, ngày, bấm **Copy prompt**, dán vào Claude Code hoặc Codex mở ở thư mục này.
2. Agent đọc `skill/` và `workspace/`, dạy hoặc chuẩn bị bài, rồi ghi kết quả vào `workspace/`.
3. Quay lại app để xem: từ vựng của ngày, buổi học, điểm, lộ trình, tiến bộ.

## Cài đặt (một lần)

- Cài **Node.js 22+**. Không cần `npm install`.
- (Tuỳ chọn) Nhập thư viện từ vựng của bạn: `node scripts/import-library.mjs --clone` (cần `gh` đã đăng nhập; chỉ đọc, không đẩy gì lên GitHub). Hoặc `--sources <thư mục clone english-coach-sources>` (lộ trình 30 ngày cũ từ repo english-communication đã xóa; `days.json` có sẵn được giữ nguyên). Kết quả nằm ở `workspace/library/` (3592 từ, 1200 câu, lộ trình 30 ngày) và agent chọn từ ở đó khi chuẩn bị từ vựng.

## Dùng hằng ngày

1. Mở app: Windows `start-app.cmd`, macOS `start-app.command` (cổng cố định theo thư mục; đặt `EC_PORT=...` để đổi; thêm `--no-open` để không mở trình duyệt).
2. Tối hôm trước: Prompt > **Chuẩn bị từ vựng ngày mai** > Copy prompt > dán vào agent.
3. Sáng hôm sau: tab **Hôm nay** để chuẩn bị từ: nghe, thẻ lật, tự kiểm tra, đánh dấu đã thuộc / chưa thuộc.
4. Học: Prompt > **Buổi học** > dán vào agent, học bằng chat hoặc giọng nói. Cuối buổi agent chấm điểm và ghi file.
5. Xem tab **Buổi học**, **Tiến bộ**, **Lộ trình** (tick can-do). Từ đến hạn ôn nằm ở **Từ vựng > Ôn hôm nay**.

## Các tab

Hôm nay · Từ vựng · Buổi học · Lộ trình · Tiến bộ · Quy tắc (xem luật, sửa hồ sơ) · Prompt.

## Dữ liệu mẫu

Lần chạy đầu app tạo dữ liệu mẫu (đánh dấu `sample`) để mọi tab có nội dung. Khi bắt đầu thật, bấm **Xóa dữ liệu mẫu** ở thanh vàng đầu trang (hoặc `POST /api/sample/delete`). Dữ liệu mẫu không tự quay lại; muốn tạo lại, xóa `workspace/` (trừ `library/`) rồi chạy app.

## Bảo mật

App chỉ nghe `127.0.0.1`, kiểm tra Host/Origin và mã phiên khi ghi, ghi file nguyên tử, không có bí mật nào trong dự án.
