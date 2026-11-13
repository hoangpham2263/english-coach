// One-time (or repeatable) import of the learner's own vocabulary repos into workspace/library/ (gitignored, read-only use):
//   node scripts/import-library.mjs --sources <clone of hoangpham2263/english-coach-sources> [--communication <folder with assets/days.js>]
//   node scripts/import-library.mjs --clone      (uses the gh CLI to clone english-coach-sources into a NEW temp folder, then deletes it)
// The 30-day plan (days.json) came from hoangpham2263/english-communication, which was deleted; an existing
// workspace/library/days.json is kept as is unless --communication is given.
// Nothing is pushed anywhere and nothing is written back to those repos. The library is a word pool the agent picks from
// when it prepares a day's list (skill/rules/06); the app never changes it.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "workspace", "library");
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : ""; };
const REPO_SOURCES = "hoangpham2263/english-coach-sources", REPO_COMM = "hoangpham2263/english-communication";

let tmp = "", src = opt("--sources"), comm = opt("--communication");
if (args.includes("--clone")) {
  tmp = mkdtempSync(join(tmpdir(), "ec-library-"));
  for (const r of [REPO_SOURCES]) execFileSync("gh", ["repo", "clone", r, join(tmp, r.split("/")[1]), "--", "-q", "--depth", "1"], { stdio: "inherit" });
  src = join(tmp, "english-coach-sources");
}
if (!src || !existsSync(join(src, "4000-words"))) { console.error("Cần --sources <thư mục english-coach-sources> hoặc --clone."); process.exit(1); }

const readJson = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^﻿/, ""));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// 4000 Essential English Words books 1-6 are ordered from beginner to advanced: book 1 ~ A1/A2 ... book 6 ~ C1/C2.
const BOOK_LEVEL = { 1: "A1-A2", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C1-C2" };
const words = [];
const seen = new Set();
for (let b = 1; b <= 6; b++) {
  for (const w of readJson(join(src, "4000-words", `book${b}.json`))) {
    const key = w.en.toLowerCase();
    if (seen.has(key)) continue; // a word is listed once, in the earliest (easiest) book
    seen.add(key);
    words.push({ lid: `b${b}-${slug(w.en)}`, word: w.en, ipa: `/${w.ipa}/`, ipa_uk: w.ipaUk ? `/${w.ipaUk}/` : "", vi: w.vi, example: w.example, example_vi: w.exampleVi, book: b, unit: w.unit, level: BOOK_LEVEL[b], source: { repo: REPO_SOURCES, file: `4000-words/book${b}.json` } });
  }
}
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "words.json"), JSON.stringify({ words }, null, 1) + "\n");

const sent = readJson(join(src, "sentences", "sentences.json"));
writeFileSync(join(out, "sentences.json"), JSON.stringify({ source: sent.source, license: sent.license, topics: sent.topics, sentences: sent.sentences.map((s) => ({ unit: s.unit, en: s.en, vi: s.vi })) }, null, 1) + "\n");

let days = 0;
if (comm && existsSync(join(comm, "assets", "days.js"))) {
  const ctx = vm.runInNewContext(readFileSync(join(comm, "assets", "days.js"), "utf8") + "\n;({ WEEKS: typeof WEEKS === 'undefined' ? [] : WEEKS, DAYS: typeof DAYS === 'undefined' ? [] : DAYS })");
  const plan = ctx.DAYS.map((d) => ({ day: d.d, title: d.t, goal: d.goal, pattern: d.pattern, sound: d.sound, chunks: (d.chunks || []).map(([en, vi]) => ({ en, vi })), speaking_questions: d.qs, self_check: d.self }));
  writeFileSync(join(out, "days.json"), JSON.stringify({ source: { repo: REPO_COMM, file: "assets/days.js" }, weeks: ctx.WEEKS, days: plan }, null, 1) + "\n");
  days = plan.length;
} else if (existsSync(join(out, "days.json"))) days = readJson(join(out, "days.json")).days.length;
const meta = {
  imported: new Date().toISOString().slice(0, 10), words: words.length, sentences: sent.sentences.length, days,
  note: "Nội dung của chính bạn (repo riêng tư/công khai của hoangpham2263). Chỉ dùng cục bộ, không đẩy lại lên GitHub, không phát hành lại.",
  credits: [
    { what: "words.json: 4000 từ chia 6 quyển (book 1 dễ -> book 6 khó), mỗi từ có IPA, nghĩa Việt, 1 câu ví dụ", repo: REPO_SOURCES, file: "4000-words/book1..6.json", license: "Repo không ghi giấy phép: nội dung của chủ repo; giữ cục bộ, không phát hành lại." },
    { what: "sentences.json: câu và bản dịch", repo: REPO_SOURCES, file: "sentences/sentences.json", license: `${sent.source}; ${sent.license}` },
    { what: "days.json: lộ trình 30 ngày nói cho người mới (cụm câu, mẫu câu, câu hỏi luyện nói)", repo: REPO_COMM, file: "assets/days.js", license: "Repo đã xóa; chỉ còn bản cục bộ này. Nội dung của chủ repo." },
  ],
};
writeFileSync(join(out, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
if (tmp) rmSync(tmp, { recursive: true, force: true });
console.log(`Đã nhập ${words.length} từ, ${sent.sentences.length} câu, ${days} ngày vào ${out}`);
