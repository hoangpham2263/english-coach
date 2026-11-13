# 07 - Định dạng dữ liệu (bắt buộc)

Tất cả trong `workspace/` (đường dẫn tương đối từ thư mục gốc dự án). JSON hợp lệ, UTF-8, thụt 2 khoảng trắng. Ngày: `YYYY-MM-DD`. Không thêm trường lạ làm đổi nghĩa trường có sẵn. Trường `sample: true` chỉ dùng cho dữ liệu mẫu, **không tự thêm**.

## `profile.json`

```json
{
  "name": "Học viên",
  "level": "A1",
  "stage": "A1.1",
  "step": 3,
  "cando": { "A1.1-1": true, "A1.1-2": true },
  "level_note": "Mới bắt đầu, biết chào hỏi cơ bản.",
  "goal": "Giao tiếp hằng ngày",
  "daily_new_words": 6,
  "accent": "en-US",
  "placement": { "date": "2026-11-01", "score_percent": 30, "strengths": [], "weaknesses": [] },
  "updated": "2026-11-12"
}
```

`level`: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" (= CEFR của `stage`). `stage`: id trong `curriculum.json` (A1.1 ... C2). `step`: 1-8. `cando`: `{ "<id can-do>": true }`, chỉ id có trong curriculum. `daily_new_words`: 5-8. `accent`: "en-US" | "en-GB". `placement` có thể vắng.

## `vocab.json`

```json
{
  "words": [
    {
      "id": "w-wake-up",
      "word": "wake up",
      "ipa": "/weɪk ʌp/",
      "pos": "phrasal verb",
      "vi": "thức dậy",
      "def": "to stop sleeping",
      "examples": [
        { "en": "I wake up at six.", "vi": "Tôi thức dậy lúc sáu giờ." },
        { "en": "She wakes up early.", "vi": "Cô ấy dậy sớm." }
      ],
      "topic": "daily routine",
      "box": 1,
      "due": "2026-11-14",
      "status": "new",
      "added": "2026-11-13",
      "last_reviewed": null
    }
  ]
}
```

`source` (tùy chọn): `{ "repo", "file", "lid" }` khi từ lấy từ thư viện. `status`: "new" | "learning" | "mastered" | "archived". `box`: 1-5. `id` duy nhất, không đổi sau khi tạo. Luật cập nhật box/due: `05-spaced-repetition.md`.

## `daily/YYYY-MM-DD.json`

```json
{
  "date": "2026-11-14",
  "topic": "daily routine",
  "stage": "A1.1",
  "step": 7,
  "topic_vi": "Thói quen hằng ngày",
  "goal": "Cuối buổi bạn kể được 3 việc bạn làm buổi sáng.",
  "pattern": { "formula": "I + verb + at + time", "example": "I wake up at six." },
  "word_ids": ["w-wake-up", "w-brush-teeth"],
  "plan": [
    { "step": "Warm-up", "minutes": 3, "activity": "Chào hỏi, hỏi về buổi sáng." }
  ],
  "tips": ["Nghe từng từ bằng nút loa, đọc to 3 lần."],
  "created": "2026-11-13"
}
```

## `lessons/YYYY-MM-DD-NN.json`  (NN = 01, 02...)

```json
{
  "id": "2026-11-12-01",
  "date": "2026-11-12",
  "type": "lesson",
  "stage": "A1.1",
  "step": 2,
  "topic": "greetings",
  "level": "A1",
  "duration_min": 30,
  "summary": "Học chào hỏi và giới thiệu bản thân.",
  "transcript_summary": "Tóm tắt 5-10 dòng diễn biến buổi học.",
  "scores": {
    "pronunciation": { "score": 5.5, "reason": "...", "fix": "...", "estimated": true },
    "vocabulary":    { "score": 6,   "reason": "...", "fix": "..." },
    "grammar":       { "score": 5,   "reason": "...", "fix": "..." },
    "fluency":       { "score": 5,   "reason": "...", "fix": "..." },
    "comprehension": { "score": 7,   "reason": "...", "fix": "..." }
  },
  "overall": 5.7,
  "level_estimate": "A1",
  "errors": [
    { "wrong": "I am agree", "right": "I agree", "category": "grammar", "explanation_vi": "Không dùng am với agree." }
  ],
  "new_words": ["w-hello"],
  "reviewed_words": [],
  "homework": ["Viết 3 câu giới thiệu bản thân."],
  "praise": "Bạn nói rất rõ khi chào hỏi.",
  "teacher_notes": "Ghi chú cho buổi sau."
}
```

`type`: "lesson" | "review" | "placement" | "weekly". `stage`/`step`: bắt buộc cho `lesson` (vị trí trong lộ trình); `stage_exam: true` khi là bài kiểm tra cuối stage. Bắt buộc có đủ 5 tiêu chí trong `scores` (pronunciation có thể `score: null`). `overall` theo trọng số của `04-scoring-rubric.md`. `new_words`/`reviewed_words` là `id` trong `vocab.json`.

## `errors.json`

```json
{
  "errors": [
    {
      "id": "e-am-agree",
      "pattern": "am/is/are + động từ thường",
      "category": "grammar",
      "example_wrong": "I am agree",
      "example_right": "I agree",
      "rule_vi": "Với động từ thường không dùng am/is/are.",
      "count": 2,
      "first_seen": "2026-11-10",
      "last_seen": "2026-11-12",
      "status": "open"
    }
  ]
}
```

`category`: "grammar" | "vocabulary" | "pronunciation" | "spelling" | "word-order". `status`: "open" | "improving" | "fixed". Luật: `08-error-log.md`.

## Quy trình ghi an toàn

1. Đọc file hiện tại (nếu có). 2. Chỉnh sửa trong bộ nhớ. 3. Ghi lại toàn bộ file. 4. Đọc lại để chắc JSON hợp lệ. Không để file nửa chừng. Không xóa file của học viên.
