# English Coach: quy ước cho agent

Dự án: bộ luật giáo viên (`skill/`) + app cục bộ nhỏ (`src/server.mjs`, `ui/`) cho một người Việt học tiếng Anh giao tiếp từ A1 đến C2.

- **Dạy học**: đọc `skill/SKILL.md` trước, rồi `skill/curriculum.md` và các file `skill/rules/` mà SKILL.md chỉ định. Prompt mẫu ở `prompts/`.
- **`skill/` là chỉ đọc đối với app.** Chỉ người dùng chỉnh tay; agent khi dạy không sửa nó (trừ khi được yêu cầu rõ ràng chỉnh luật).
- **Dữ liệu** ở `workspace/` (gitignored): `profile.json`, `vocab.json`, `errors.json`, `activity.json`, `daily/YYYY-MM-DD.json`, `lessons/YYYY-MM-DD-NN.json`, `library/` (thư viện từ nhập từ repo của người dùng). Định dạng chính xác: `skill/rules/07-data-formats.md`. Ghi nguyên file JSON UTF-8 hợp lệ.
- **App chỉ hiển thị/quản lý**: nó đọc/ghi `workspace/` qua REST (ghi nguyên tử, kiểm tra đầu vào, đường dẫn an toàn, chỉ localhost) và ghi duy nhất: `vocab.json` (đánh dấu thuộc/chưa), `profile.json` (hồ sơ, stage, can-do), `activity.json`. Không logic dạy học trong app.
- **Quy tắc đặt trong skill, không đặt trong code**: trọng số điểm, ngưỡng level, khoảng cách ôn (hộp 1-5) nằm ở `skill/`. (App chỉ cần bảng khoảng cách hộp để tính `due` khi bấm thuộc/chưa: giữ khớp `skill/rules/05`.)
- Không phụ thuộc npm. Giao diện tiếng Việt, nội dung bài học tiếng Anh kèm giải thích tiếng Việt; font weight 400, viền thay bóng, không shadow.
- Không bí mật (token, mật khẩu) trong file nào. Không đẩy `workspace/` hay `library/` lên GitHub. Không chạy `npm test`/bộ test trừ khi người dùng yêu cầu.
- Git: chỉ commit khi người dùng yêu cầu; không push; không thêm dòng đồng tác giả hay ghi nhận Claude vào commit/PR.
- Cổng: `EC_PORT` hoặc 47000 + băm thư mục; `--no-open` để không mở trình duyệt.
