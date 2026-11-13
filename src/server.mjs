// English Coach: a thin local window (ui/) over the JSON files in workspace/. The agent (Claude Code or Codex) teaches
// and writes the files; this server only shows and manages them. skill/ and prompts/ are read-only here.
// Port: EC_PORT, else 47000 + hash of this folder (like social-autopilot). --no-open skips the browser.
import { createServer, request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync, rmSync, statSync } from "node:fs";
import { join, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { seedFiles, ymd, addDays } from "./seed.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const ws = join(root, "workspace");
const uiDir = join(root, "ui");
const skillDir = join(root, "skill");
const promptsDir = join(root, "prompts");
const NO_OPEN = process.argv.includes("--no-open");
const FIXED = !!process.env.EC_PORT;
const BASE_PORT = Number(process.env.EC_PORT || 47000 + (parseInt(createHash("sha1").update(root).digest("hex").slice(0, 6), 16) % 1000));
let PORT = BASE_PORT;

const BOX_DAYS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };
const CRITERIA = ["pronunciation", "vocabulary", "grammar", "fluency", "comprehension"];
const MODES = { "prepare-vocab": "Chuẩn bị từ vựng ngày mai", lesson: "Buổi học", review: "Ôn tập", placement: "Kiểm tra trình độ", weekly: "Tổng kết tuần" };
const AGENTS = {
  claude: "Bạn chạy trong Claude Code: dùng công cụ đọc/ghi file để đọc skill và ghi workspace.",
  codex: "Bạn chạy trong Codex: đọc AGENTS.md ở thư mục gốc trước, rồi dùng công cụ file để đọc skill và ghi workspace.",
};
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const LESSON_RE = /^\d{4}-\d{2}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

// ----- files (atomic writes, paths built only from validated names) -----
const isObject = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const arr = (v) => (Array.isArray(v) ? v : []);
const inside = (base, p) => { const r = resolve(p); return r === base || r.startsWith(base + sep); };
const wsPath = (rel) => { const p = resolve(ws, rel); if (!inside(ws, p)) throw httpErr(400, "Đường dẫn không hợp lệ."); return p; };
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
function readJson(rel, fallback) {
  try { return JSON.parse(readFileSync(wsPath(rel), "utf8").replace(/^﻿/, "")); } catch { return fallback; }
}
function writeJson(rel, data) {
  const file = wsPath(rel);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  renameSync(tmp, file);
}
const listDir = (rel, re) => { try { return readdirSync(wsPath(rel)).filter((f) => re.test(f)).sort(); } catch { return []; } };
const today = () => ymd(new Date());

// ----- first start: sample data (once; deleting it never brings it back) -----
function seedIfNeeded() {
  mkdirSync(ws, { recursive: true });
  const marker = join(ws, ".seeded");
  if (existsSync(marker)) return;
  if (!existsSync(join(ws, "vocab.json")) && !existsSync(join(ws, "profile.json"))) {
    for (const [rel, data] of Object.entries(seedFiles(today()))) writeJson(rel, data);
  }
  writeFileSync(marker, new Date().toISOString() + "\n");
}
function deleteSample() {
  let removed = 0;
  for (const dir of ["daily", "lessons"]) for (const f of listDir(dir, /\.json$/)) {
    if (readJson(`${dir}/${f}`, {}).sample) { rmSync(wsPath(`${dir}/${f}`)); removed++; }
  }
  const vocab = readJson("vocab.json", { words: [] });
  const before = arr(vocab.words).length;
  vocab.words = arr(vocab.words).filter((w) => !w.sample);
  removed += before - vocab.words.length;
  writeJson("vocab.json", vocab);
  const errors = readJson("errors.json", { errors: [] });
  const eb = arr(errors.errors).length;
  errors.errors = arr(errors.errors).filter((e) => !e.sample);
  removed += eb - errors.errors.length;
  writeJson("errors.json", errors);
  const profile = readJson("profile.json", null);
  if (profile?.sample) { delete profile.sample; profile.name = "Học viên"; profile.level_note = ""; profile.stage = "A1.1"; profile.step = 1; profile.cando = {}; writeJson("profile.json", profile); }
  const activity = readJson("activity.json", { days: {} });
  if (activity.sample_days) { delete activity.sample_days; writeJson("activity.json", activity); }
  return removed;
}
const hasSample = () => {
  if (readJson("profile.json", {}).sample) return true;
  if (arr(readJson("vocab.json", { words: [] }).words).some((w) => w.sample)) return true;
  return ["daily", "lessons"].some((d) => listDir(d, /\.json$/).some((f) => readJson(`${d}/${f}`, {}).sample));
};

// ----- data -----
const profile = () => ({ name: "Học viên", level: "A1", goal: "Giao tiếp hằng ngày", daily_new_words: 6, accent: "en-US", ...readJson("profile.json", {}) });
const curriculum = () => { try { return JSON.parse(readFileSync(join(skillDir, "curriculum.json"), "utf8")); } catch { return { stages: [] }; } };
const stageIds = () => curriculum().stages.map((s) => s.id);
const candoIds = () => new Set(curriculum().stages.flatMap((s) => arr(s.cando).map((c) => c.id)));
const libraryMeta = () => readJson("library/meta.json", null);
const vocab = () => arr(readJson("vocab.json", { words: [] }).words);
function saveVocab(words) { writeJson("vocab.json", { words }); }
const lessonIds = () => listDir("lessons", /^\d{4}-\d{2}-\d{2}-\d{2}\.json$/).map((f) => f.slice(0, -5));
const dailyDates = () => listDir("daily", /^\d{4}-\d{2}-\d{2}\.json$/).map((f) => f.slice(0, -5));
const lessonsAll = () => lessonIds().map((id) => readJson(`lessons/${id}.json`, null)).filter((l) => isObject(l));
const dailyView = (date) => {
  const d = readJson(`daily/${date}.json`, null);
  if (!isObject(d)) return null;
  const all = vocab(), byId = new Map(all.map((w) => [w.id, w]));
  return { ...d, date, words: arr(d.word_ids).map((id) => byId.get(id)).filter(Boolean), missing_word_ids: arr(d.word_ids).filter((id) => !byId.has(id)) };
};
const avg = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

function review(id, result) {
  const words = vocab();
  const w = words.find((x) => x.id === id);
  if (!w) throw httpErr(404, "Không tìm thấy từ này.");
  const t = today();
  if (w.last_reviewed === t && w.last_result === result) return w; // same answer twice in a day counts once
  if (result === "known") {
    w.status = w.box >= 5 ? "mastered" : "learning";
    w.box = Math.min(5, (Number(w.box) || 1) + 1);
  } else { w.box = 1; w.status = "learning"; }
  w.due = addDays(t, BOX_DAYS[w.box]);
  w.last_reviewed = t;
  w.last_result = result;
  saveVocab(words);
  const act = readJson("activity.json", { days: {} });
  act.days = isObject(act.days) ? act.days : {};
  act.days[t] = { reviews: (act.days[t]?.reviews || 0) + 1 };
  writeJson("activity.json", act);
  return w;
}

function progress() {
  const lessons = lessonsAll().filter((l) => isObject(l.scores));
  const points = lessons.sort((a, b) => String(a.id).localeCompare(String(b.id))).map((l) => ({
    id: l.id, date: l.date, type: l.type || "lesson", overall: typeof l.overall === "number" ? l.overall : null,
    scores: Object.fromEntries(CRITERIA.map((c) => [c, typeof l.scores[c]?.score === "number" ? l.scores[c].score : null])),
  }));
  const averages = Object.fromEntries(CRITERIA.map((c) => [c, avg(points.map((p) => p.scores[c]).filter((x) => x !== null))]));
  const act = readJson("activity.json", { days: {} });
  const days = new Set([...points.map((p) => p.date), ...Object.keys(act.days || {}), ...Object.keys(act.sample_days || {})]);
  let streak = 0, d = today();
  if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d)) { streak++; d = addDays(d, -1); }
  const words = vocab().filter((w) => w.status !== "archived");
  const counts = { total: words.length, new: 0, learning: 0, mastered: 0 };
  for (const w of words) counts[w.status in counts ? w.status : "new"]++;
  const errors = arr(readJson("errors.json", { errors: [] }).errors).slice().sort((a, b) => (b.count || 0) - (a.count || 0));
  return { points, averages, overall_avg: avg(points.map((p) => p.overall).filter((x) => x !== null)), streak, lessons: points.length, words: counts, top_errors: errors.slice(0, 8), profile: profile() };
}

function validate() {
  const out = [];
  const bad = (file, msg) => out.push({ file, message: msg });
  const must = (rel) => { try { return JSON.parse(readFileSync(wsPath(rel), "utf8").replace(/^﻿/, "")); } catch (e) { bad(rel, existsSync(wsPath(rel)) ? "JSON không hợp lệ." : "Chưa có file."); return null; } };
  const p = must("profile.json");
  if (p && !LEVELS.includes(p.level)) bad("profile.json", "level phải là A1...C2.");
  if (p?.stage && !stageIds().includes(p.stage)) bad("profile.json", `stage không có trong curriculum: ${p.stage}`);
  for (const id of Object.keys(p?.cando || {})) if (!candoIds().has(id)) bad("profile.json", `cando không có trong curriculum: ${id}`);
  const v = must("vocab.json");
  const ids = new Set();
  for (const w of arr(v?.words)) {
    if (!w.id || ids.has(w.id)) bad("vocab.json", `id thiếu hoặc trùng: ${w.id}`); ids.add(w.id);
    if (!w.word || !w.vi || !w.ipa) bad("vocab.json", `${w.id}: thiếu word/ipa/vi.`);
    if (arr(w.examples).length < 1 || arr(w.examples).length > 2) bad("vocab.json", `${w.id}: cần 1-2 câu ví dụ (nên đủ 2).`);
    if (!(w.box >= 1 && w.box <= 5)) bad("vocab.json", `${w.id}: box phải từ 1 đến 5.`);
    if (!DATE_RE.test(String(w.due || ""))) bad("vocab.json", `${w.id}: due không hợp lệ.`);
  }
  for (const date of dailyDates()) {
    const d = must(`daily/${date}.json`);
    for (const id of arr(d?.word_ids)) if (!ids.has(id)) bad(`daily/${date}.json`, `word_ids có id không tồn tại: ${id}`);
    if (d?.stage && !stageIds().includes(d.stage)) bad(`daily/${date}.json`, `stage không có trong curriculum: ${d.stage}`);
    const n = arr(d?.word_ids).length;
    if (d && (n < 5 || n > 8)) bad(`daily/${date}.json`, `nên có 5-8 từ (hiện ${n}).`);
  }
  for (const id of lessonIds()) {
    const l = must(`lessons/${id}.json`);
    for (const c of CRITERIA) {
      const s = l?.scores?.[c];
      if (l && (!s || (s.score !== null && typeof s.score !== "number") || !s.reason || !s.fix)) bad(`lessons/${id}.json`, `tiêu chí ${c} thiếu score/reason/fix.`);
    }
  }
  must("errors.json");
  return out;
}

// ----- rules + prompts (read-only) -----
function rulesList() {
  const files = ["SKILL.md", "curriculum.md", ...(() => { try { return readdirSync(join(skillDir, "rules")).filter((f) => f.endsWith(".md")).sort().map((f) => `rules/${f}`); } catch { return []; } })()];
  return files.map((f) => {
    const text = readFileSync(join(skillDir, f), "utf8");
    return { file: f, title: (text.match(/^#\s+(.+)$/m) || [, f])[1], content: text };
  });
}
function buildPrompt(mode, agent, date) {
  if (!MODES[mode]) throw httpErr(400, "Chế độ không hợp lệ.");
  if (!AGENTS[agent]) throw httpErr(400, "Agent không hợp lệ.");
  if (!DATE_RE.test(date)) throw httpErr(400, "Ngày không hợp lệ (YYYY-MM-DD).");
  const tpl = readFileSync(join(promptsDir, `${mode}.md`), "utf8");
  const lib = libraryMeta();
  const LIBRARY_LINE = lib
    ? `Thư viện từ vựng cá nhân có sẵn ở workspace/library/ (words.json: ${lib.words} từ, sentences.json, days.json: lộ trình 30 ngày; giấy phép/credit trong meta.json): chọn từ ở đó theo mục "Nguồn từ" của rules 06 và ghi trường source cho từng từ.`
    : "Chưa có thư viện từ vựng (workspace/library/): tự chọn từ theo rules 06.";
  const map = { LIBRARY_LINE, ROOT: root, AGENT_LINE: AGENTS[agent], TODAY: today(), DATE: date, TOMORROW: addDays(date, 1) };
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => map[k] ?? "");
}

// ----- HTTP -----
const send = (res, status, data) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }); res.end(JSON.stringify(data)); };
async function body(req, limit = 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw httpErr(413, "Yêu cầu quá lớn."); chunks.push(c); }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  let data; try { data = JSON.parse(text); } catch { throw httpErr(400, "Nội dung không phải JSON hợp lệ."); }
  if (!isObject(data)) throw httpErr(400, "Nội dung phải là một đối tượng JSON.");
  return data;
}

// Localhost only: the Host must be this server's own address (DNS rebinding); non-GET needs JSON content type,
// a same-origin or absent Origin and this run's token (meta ec-token in the page).
const TOKEN = randomBytes(24).toString("hex");
const hosts = () => [`127.0.0.1:${PORT}`, `localhost:${PORT}`];
const sameToken = (v) => { const a = Buffer.from(String(v || "")), b = Buffer.from(TOKEN); return a.length === b.length && timingSafeEqual(a, b); };
function refuse(req) {
  if (!hosts().includes(String(req.headers.host || "").toLowerCase())) return "Máy chủ chỉ nhận yêu cầu tới 127.0.0.1 hoặc localhost.";
  if (req.method === "GET" || req.method === "HEAD") return "";
  const origin = req.headers.origin;
  if (origin !== undefined && !hosts().map((h) => `http://${h}`).includes(origin)) return "Yêu cầu từ trang khác bị chặn.";
  if (!/^application\/json\b/i.test(String(req.headers["content-type"] || ""))) return "Cần Content-Type: application/json.";
  if (!sameToken(req.headers["x-ec-token"])) return "Thiếu hoặc sai mã phiên (X-EC-Token). Khởi động lại app.";
  return "";
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json" };
function serveStatic(req, res, path) {
  const rel = path === "/" ? "index.html" : decodeURIComponent(path).replace(/^\/+/, "");
  const file = resolve(uiDir, rel);
  if (!inside(uiDir, file) || !existsSync(file) || !statSync(file).isFile() || !TYPES[extname(file)]) { res.writeHead(404); return res.end("Not found"); }
  let data = readFileSync(file);
  if (extname(file) === ".html") data = Buffer.from(String(data).replace(/<head[^>]*>/i, (m) => `${m}<meta name="ec-token" content="${TOKEN}">`));
  res.writeHead(200, { "content-type": TYPES[extname(file)], "cache-control": "no-store" });
  res.end(data);
}

async function api(req, res, url) {
  const m = req.method, p = url.pathname, q = url.searchParams;
  let g;
  if (m === "GET" && p === "/api/root") return send(res, 200, { app: "english-coach", root });
  if (m === "GET" && p === "/api/state") return send(res, 200, { today: today(), sample: hasSample(), problems: validate().length, profile: profile() });
  if (m === "GET" && p === "/api/validate") return send(res, 200, { problems: validate() });
  if (m === "GET" && p === "/api/profile") return send(res, 200, profile());
  if (m === "PUT" && p === "/api/profile") {
    const b = await body(req), cur = readJson("profile.json", {}), next = { ...cur };
    if ("name" in b) { if (typeof b.name !== "string" || b.name.length > 60) throw httpErr(400, "Tên tối đa 60 ký tự."); next.name = b.name.trim(); }
    if ("level" in b) { if (!LEVELS.includes(b.level)) throw httpErr(400, "Level phải là A1, A2, B1, B2, C1 hoặc C2."); next.level = b.level; }
    if ("stage" in b) {
      const st = curriculum().stages.find((s) => s.id === b.stage);
      if (!st) throw httpErr(400, "Giai đoạn không có trong lộ trình.");
      if (next.stage !== st.id) { next.stage = st.id; next.step = 1; }
      next.level = st.cefr;
    }
    if ("step" in b) { const n = Number(b.step); if (!Number.isInteger(n) || n < 1 || n > 8) throw httpErr(400, "Bước phải từ 1 đến 8."); next.step = n; }
    if ("goal" in b) { if (typeof b.goal !== "string" || b.goal.length > 200) throw httpErr(400, "Mục tiêu tối đa 200 ký tự."); next.goal = b.goal.trim(); }
    if ("daily_new_words" in b) { const n = Number(b.daily_new_words); if (!Number.isInteger(n) || n < 5 || n > 8) throw httpErr(400, "Số từ mới mỗi ngày phải từ 5 đến 8."); next.daily_new_words = n; }
    if ("accent" in b) { if (!["en-US", "en-GB"].includes(b.accent)) throw httpErr(400, "Giọng phải là en-US hoặc en-GB."); next.accent = b.accent; }
    next.updated = today();
    writeJson("profile.json", next);
    return send(res, 200, profile());
  }
  if (m === "GET" && p === "/api/curriculum") { const pr = profile(); return send(res, 200, { curriculum: curriculum(), progress: { stage: pr.stage || "", step: pr.step || 1, cando: isObject(pr.cando) ? pr.cando : {} } }); }
  if (m === "PUT" && p === "/api/cando") {
    const b = await body(req);
    if (typeof b.id !== "string" || !candoIds().has(b.id)) throw httpErr(400, "Can-do không có trong lộ trình.");
    if (typeof b.done !== "boolean") throw httpErr(400, "done phải là true hoặc false.");
    const cur = readJson("profile.json", {});
    cur.cando = isObject(cur.cando) ? cur.cando : {};
    if (b.done) cur.cando[b.id] = true; else delete cur.cando[b.id];
    cur.updated = today();
    writeJson("profile.json", cur);
    return send(res, 200, { cando: cur.cando });
  }
  if (m === "GET" && p === "/api/library") return send(res, 200, { library: libraryMeta() });
  if (m === "GET" && p === "/api/vocab") return send(res, 200, { today: today(), words: vocab() });
  if (m === "POST" && (g = p.match(/^\/api\/vocab\/([^/]+)\/review$/))) {
    if (!ID_RE.test(g[1])) throw httpErr(400, "id không hợp lệ.");
    const b = await body(req);
    if (!["known", "unknown"].includes(b.result)) throw httpErr(400, 'result phải là "known" hoặc "unknown".');
    return send(res, 200, review(g[1], b.result));
  }
  if (m === "GET" && p === "/api/daily") return send(res, 200, { today: today(), dates: dailyDates().map((d) => { const x = readJson(`daily/${d}.json`, {}); return { date: d, topic: x.topic || "", topic_vi: x.topic_vi || "", words: arr(x.word_ids).length, sample: !!x.sample }; }) });
  if (m === "GET" && (g = p.match(/^\/api\/daily\/([^/]+)$/))) {
    if (!DATE_RE.test(g[1])) throw httpErr(400, "Ngày không hợp lệ.");
    const d = dailyView(g[1]);
    return d ? send(res, 200, d) : send(res, 404, { error: "Chưa có danh sách từ cho ngày này. Dùng tab Prompt > Chuẩn bị từ vựng ngày mai." });
  }
  if (m === "GET" && p === "/api/lessons") return send(res, 200, { lessons: lessonsAll().sort((a, b) => String(b.id).localeCompare(String(a.id))).map((l) => ({ id: l.id, date: l.date, type: l.type || "lesson", topic: l.topic || "", level: l.level || "", overall: l.overall ?? null, summary: l.summary || "", sample: !!l.sample })) });
  if (m === "GET" && (g = p.match(/^\/api\/lessons\/([^/]+)$/))) {
    if (!LESSON_RE.test(g[1])) throw httpErr(400, "id buổi học không hợp lệ.");
    const l = readJson(`lessons/${g[1]}.json`, null);
    if (!l) return send(res, 404, { error: "Không tìm thấy buổi học." });
    const byId = new Map(vocab().map((w) => [w.id, w]));
    const pick = (ids) => arr(ids).map((id) => byId.get(id)).filter(Boolean);
    return send(res, 200, { ...l, new_words_full: pick(l.new_words), reviewed_words_full: pick(l.reviewed_words) });
  }
  if (m === "GET" && p === "/api/errors") return send(res, 200, readJson("errors.json", { errors: [] }));
  if (m === "GET" && p === "/api/progress") return send(res, 200, progress());
  if (m === "GET" && p === "/api/rules") return send(res, 200, { files: rulesList() });
  if (m === "GET" && p === "/api/prompt") return send(res, 200, { prompt: buildPrompt(q.get("mode") || "", q.get("agent") || "", q.get("date") || today()), modes: MODES });
  if (m === "POST" && p === "/api/sample/delete") return send(res, 200, { removed: deleteSample() });
  return send(res, 404, { error: "Không có API này." });
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
    const why = refuse(req);
    if (why) return send(res, 403, { error: why });
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method not allowed." });
    serveStatic(req, res, url.pathname);
  } catch (e) {
    send(res, e.status || 500, { error: e.status ? e.message : "Lỗi máy chủ." });
    if (!e.status) console.error(e);
  }
});

function openBrowser(url) {
  if (NO_OPEN) return;
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try { spawn(cmd, args, { stdio: "ignore", detached: true, windowsHide: true }).unref(); } catch {}
}
// A second launch just opens the window of the copy that is already running.
const alreadyRunning = (port) => new Promise((done) => {
  const r = httpRequest({ host: "127.0.0.1", port, path: "/api/root", timeout: 800 }, (res) => {
    let t = ""; res.on("data", (c) => (t += c)); res.on("end", () => { try { done(JSON.parse(t).root === root); } catch { done(false); } });
  });
  r.on("error", () => done(false)); r.on("timeout", () => { r.destroy(); done(false); }); r.end();
});

seedIfNeeded();
if (!FIXED && (await alreadyRunning(BASE_PORT))) {
  console.log(`English Coach đang chạy: http://127.0.0.1:${BASE_PORT}/`);
  openBrowser(`http://127.0.0.1:${BASE_PORT}/`);
  process.exit(0);
}
const listen = (port) => {
  PORT = port;
  server.once("error", (e) => { if (e.code === "EADDRINUSE" && !FIXED && port < BASE_PORT + 10) listen(port + 1); else { console.error(e.message); process.exit(1); } });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${PORT}/`;
    console.log(`English Coach: ${url}  (đóng cửa sổ này để tắt app)`);
    openBrowser(url);
  });
};
listen(BASE_PORT);
