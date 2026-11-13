// English Coach UI (Vietnamese). No libraries. Everything shown comes from /api/* (JSON files in workspace/).
const TOKEN = document.querySelector('meta[name="ec-token"]')?.content || "";
const CRIT = [["pronunciation", "Phát âm *"], ["vocabulary", "Từ vựng"], ["grammar", "Ngữ pháp"], ["fluency", "Trôi chảy"], ["comprehension", "Hiểu"]];
const COLORS = { overall: "#1c1917", pronunciation: "#7c3aed", vocabulary: "#1f6f50", grammar: "#b45309", fluency: "#0369a1", comprehension: "#be185d" };
const MODES = [["prepare-vocab", "Chuẩn bị từ vựng ngày mai"], ["lesson", "Buổi học"], ["review", "Ôn tập"], ["placement", "Kiểm tra trình độ"], ["weekly", "Tổng kết tuần"]];
const STATUS_VI = { new: "mới", learning: "đang học", mastered: "đã thuộc", archived: "lưu trữ" };
const TYPE_VI = { lesson: "Buổi học", review: "Ôn tập", placement: "Kiểm tra", weekly: "Tổng kết tuần" };
const CAT_VI = { grammar: "ngữ pháp", vocabulary: "từ vựng", pronunciation: "phát âm", spelling: "chính tả", "word-order": "trật tự từ" };

const page = document.getElementById("page");
const app = { tab: "today", state: null, profile: null, vocab: [], date: null, flashStage: null };
let epoch = 0; // a newer render makes older async renders stop

// ----- helpers -----
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
async function api(path, opts = {}) {
  const init = { method: opts.method || "GET", headers: {} };
  if (init.method !== "GET") { init.headers = { "content-type": "application/json", "x-ec-token": TOKEN }; init.body = JSON.stringify(opts.body || {}); }
  const r = await fetch(path, init);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.error || `Lỗi ${r.status}`); e.status = r.status; throw e; }
  return data;
}
function toast(msg, bad) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
}
const fmtDate = (d) => { const [y, m, day] = d.split("-"); return `${day}/${m}/${y}`; };
const addDays = (d, n) => { const [y, m, day] = d.split("-").map(Number); const x = new Date(y, m - 1, day + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`; };
const today = () => app.state?.today;
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ----- speech (browser speechSynthesis) -----
const SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
function speak(text) {
  if (!("speechSynthesis" in window)) return toast("Trình duyệt này không hỗ trợ đọc giọng nói.", true);
  const lang = app.profile?.accent || "en-US";
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 0.85;
  const v = speechSynthesis.getVoices().find((x) => x.lang === lang) || speechSynthesis.getVoices().find((x) => x.lang.startsWith("en"));
  if (v) u.voice = v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const speakBtn = (text, label = "Nghe") => h("button", { class: "btn icon", type: "button", title: label, "aria-label": `${label}: ${text}`, html: SPEAKER, onclick: (e) => { e.stopPropagation(); speak(text); } });

// ----- vocab pieces -----
const isoToday = () => today();
function boxDots(box) { return h("span", { class: "boxdots", title: `Hộp ${box}/5` }, [1, 2, 3, 4, 5].map((i) => h("i", { class: i <= box ? "on" : "" }))); }
function markState(w) { return w.last_reviewed === isoToday() ? w.last_result || (w.box > 1 ? "known" : "unknown") : ""; }
async function mark(w, result) {
  try {
    const nw = await api(`/api/vocab/${encodeURIComponent(w.id)}/review`, { method: "POST", body: { result } });
    Object.assign(w, nw);
    const i = app.vocab.findIndex((x) => x.id === w.id); if (i >= 0) Object.assign(app.vocab[i], nw);
    return nw;
  } catch (e) { toast(e.message, true); }
}
function markButtons(w, onDone) {
  const wrap = h("div", { class: "card-actions" });
  const draw = () => {
    wrap.replaceChildren(
      h("button", { class: "btn sm known" + (markState(w) === "known" ? " on" : ""), type: "button", onclick: async () => { if (await mark(w, "known")) { draw(); onDone?.("known"); } } }, "Đã thuộc"),
      h("button", { class: "btn sm unknown" + (markState(w) === "unknown" ? " on" : ""), type: "button", onclick: async () => { if (await mark(w, "unknown")) { draw(); onDone?.("unknown"); } } }, "Chưa thuộc"),
    );
  };
  draw();
  return wrap;
}
function examples(w) {
  return arr(w.examples).map((e) => h("div", { class: "ex" }, h("div", { class: "en" }, h("span", {}, e.en), speakBtn(e.en, "Nghe câu")), h("div", { class: "exvi" }, e.vi)));
}
const arr = (v) => (Array.isArray(v) ? v : []);
function wordCard(w, opts = {}) {
  const st = markState(w);
  const card = h("div", { class: "card" + (st ? " " + st : "") });
  const detail = h("div", { hidden: !!opts.compact }, h("p", { class: "muted small" }, w.def || ""), ...examples(w));
  const head = h("div", { class: "word-head" },
    h("span", { class: "word" }, w.word), speakBtn(w.word, "Nghe từ"), h("span", { class: "ipa" }, w.ipa || ""),
    w.pos ? h("span", { class: "badge" }, w.pos) : null);
  card.append(head, h("div", { class: "vi" }, w.vi || ""));
  if (opts.meta !== false) card.append(h("div", { class: "row small muted", style: "margin-top:4px" }, boxDots(w.box || 1), h("span", { class: "badge" }, STATUS_VI[w.status] || w.status), h("span", {}, w.topic || ""), w.due ? h("span", {}, "ôn: " + fmtDate(w.due)) : null));
  if (opts.compact) card.append(h("button", { class: "btn sm", type: "button", style: "margin-top:8px", onclick: (e) => { detail.hidden = !detail.hidden; e.currentTarget.textContent = detail.hidden ? "Chi tiết" : "Thu gọn"; } }, "Chi tiết"));
  card.append(detail);
  if (opts.marks !== false) card.append(markButtons(w, () => { card.className = "card " + markState(w); }));
  return card;
}

// ----- flashcards -----
function flashcards(words, { onFinish, label } = {}) {
  const box = h("div", { class: "flash" });
  let i = 0, shown = false, done = 0;
  const draw = () => {
    if (!words.length) return box.replaceChildren(h("div", { class: "empty" }, "Không có từ nào."));
    if (i >= words.length) {
      return box.replaceChildren(h("div", { class: "card", style: "text-align:center" }, h("h2", {}, "Xong rồi!"), h("p", { class: "muted" }, `Bạn đã xem ${words.length} thẻ.`), h("button", { class: "btn", type: "button", onclick: () => { i = 0; shown = false; draw(); } }, "Học lại"), onFinish ? h("span", {}, " ", h("button", { class: "btn primary", type: "button", onclick: onFinish }, "Đóng")) : null));
    }
    const w = words[i];
    const face = h("div", { class: "card face", role: "button", tabindex: "0", onclick: () => { shown = true; draw(); }, onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shown = true; draw(); } } },
      h("div", { class: "big" }, w.word), h("div", { class: "ipa" }, w.ipa), speakBtn(w.word, "Nghe từ"),
      shown ? h("div", { class: "answer" }, h("div", { class: "vi", style: "text-align:center;font-size:18px" }, w.vi), h("p", { class: "muted small", style: "text-align:center" }, w.def || ""), ...examples(w)) : h("div", { class: "hint" }, "Chạm để xem nghĩa"));
    const nav = h("div", { class: "row between" },
      h("button", { class: "btn sm", type: "button", disabled: i === 0, onclick: () => { i--; shown = false; draw(); } }, "Trước"),
      shown ? h("div", { class: "row" },
        h("button", { class: "btn known", type: "button", onclick: async () => { if (await mark(w, "known")) { done++; i++; shown = false; draw(); } } }, "Đã thuộc"),
        h("button", { class: "btn unknown", type: "button", onclick: async () => { if (await mark(w, "unknown")) { done++; i++; shown = false; draw(); } } }, "Chưa thuộc"))
        : h("button", { class: "btn primary", type: "button", onclick: () => { shown = true; draw(); } }, "Hiện đáp án"),
      h("button", { class: "btn sm", type: "button", onclick: () => { i++; shown = false; draw(); } }, "Bỏ qua"));
    box.replaceChildren(
      h("div", { class: "row between small muted" }, h("span", {}, `${label || "Thẻ"} ${i + 1}/${words.length}`), h("span", {}, `đã đánh dấu ${done}`)),
      h("div", { class: "progressbar" }, h("div", { style: `width:${(i / words.length) * 100}%` })), face, nav);
  };
  draw();
  return box;
}

// ----- self quiz: multiple choice, then type the word -----
function quiz(words) {
  const box = h("div", { class: "quiz" });
  const pool = app.vocab.filter((w) => w.status !== "archived");
  const qs = shuffle(words).map((w, n) => ({ w, dir: n % 2 ? "vi2en" : "en2vi" }));
  const typed = shuffle(words);
  let stage = "mc", i = 0, score = { mc: 0, type: 0 }; const wrong = [];
  const draw = () => {
    if (!words.length) return box.replaceChildren(h("div", { class: "empty" }, "Không có từ nào để kiểm tra."));
    if (stage === "mc") {
      if (i >= qs.length) { stage = "type"; i = 0; return draw(); }
      const { w, dir } = qs[i];
      const others = shuffle(pool.filter((x) => x.id !== w.id)).slice(0, 3);
      const options = shuffle([w, ...others]);
      const prompt = dir === "en2vi" ? h("div", { class: "card" }, h("div", { class: "muted small" }, "Chọn nghĩa tiếng Việt"), h("div", { class: "word-head" }, h("span", { class: "word" }, w.word), speakBtn(w.word), h("span", { class: "ipa" }, w.ipa)))
        : h("div", { class: "card" }, h("div", { class: "muted small" }, "Chọn từ tiếng Anh"), h("div", { class: "vi", style: "font-size:18px" }, w.vi), h("div", { class: "muted small" }, w.def));
      const opts = h("div", { class: "opts" });
      let locked = false;
      for (const o of options) {
        const btn = h("button", { class: "btn opt", type: "button", onclick: () => {
          if (locked) return; locked = true;
          const ok = o.id === w.id;
          btn.classList.add(ok ? "right" : "wrong");
          if (!ok) { [...opts.children].find((b) => b.dataset.id === w.id)?.classList.add("right"); wrong.push(w); } else score.mc++;
          setTimeout(() => { i++; draw(); }, ok ? 500 : 1200);
        } }, dir === "en2vi" ? o.vi : o.word);
        btn.dataset.id = o.id; opts.append(btn);
      }
      return box.replaceChildren(h("div", { class: "row between small muted" }, h("span", {}, `Trắc nghiệm ${i + 1}/${qs.length}`)), prompt, opts);
    }
    if (stage === "type") {
      if (i >= typed.length) { stage = "done"; return draw(); }
      const w = typed[i];
      const input = h("input", { type: "text", autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: "Gõ từ tiếng Anh...", style: "width:100%" });
      const fb = h("div", { class: "small" });
      let locked = false;
      const check = () => {
        if (locked) return; locked = true;
        const ok = norm(input.value) === norm(w.word);
        if (ok) { score.type++; fb.className = "small right-t"; fb.textContent = "Đúng!"; } else { wrong.push(w); fb.className = "small wrong-t"; fb.textContent = ""; fb.append(h("span", { class: "right-t" }, `Đáp án: ${w.word}`)); }
        setTimeout(() => { i++; draw(); }, ok ? 600 : 1600);
      };
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
      box.replaceChildren(h("div", { class: "small muted" }, `Gõ từ ${i + 1}/${typed.length}`),
        h("div", { class: "card" }, h("div", { class: "muted small" }, "Nghĩa tiếng Việt"), h("div", { class: "vi", style: "font-size:18px" }, w.vi), h("div", { class: "muted small" }, w.def)),
        input, h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: check }, "Kiểm tra"), h("button", { class: "btn", type: "button", onclick: () => { input.value = ""; check(); } }, "Không biết")), fb);
      return input.focus();
    }
    const total = words.length * 2, got = score.mc + score.type;
    const uniq = [...new Map(wrong.map((x) => [x.id, x])).values()];
    box.replaceChildren(h("div", { class: "card" }, h("h2", {}, `Kết quả: ${got}/${total}`),
      h("p", { class: "muted" }, `Trắc nghiệm ${score.mc}/${words.length} · Gõ từ ${score.type}/${words.length}`),
      uniq.length ? h("div", {}, h("p", {}, "Cần ôn lại:"), h("div", { class: "chips" }, uniq.map((x) => h("span", { class: "badge warn" }, `${x.word} = ${x.vi}`)))) : h("p", { class: "ok-text" }, "Bạn nhớ hết các từ!"),
      h("div", { class: "row", style: "margin-top:10px" }, h("button", { class: "btn primary", type: "button", onclick: () => { app.flashStage = null; renderToday(); } }, "Làm lại"))));
  };
  draw();
  return box;
}

// ----- Tab: Hôm nay -----
async function renderToday() {
  const my = ++epoch;
  app.date ||= today();
  const date = app.date;
  const [daily, list] = await Promise.all([api(`/api/daily/${date}`).catch((e) => (e.status === 404 ? null : Promise.reject(e))), api("/api/daily")]);
  if (my !== epoch) return;
  const words = daily ? (await api("/api/vocab")).words.filter((w) => daily.word_ids.includes(w.id)) : [];
  if (my !== epoch) return;
  const ordered = daily ? daily.word_ids.map((id) => words.find((w) => w.id === id)).filter(Boolean) : [];
  const dateInput = h("input", { type: "date", value: date, "aria-label": "Chọn ngày", onchange: (e) => { if (e.target.value) { app.date = e.target.value; app.flashStage = null; renderToday(); } } });
  const go = (d) => () => { app.date = d; app.flashStage = null; renderToday(); };
  const bar = h("div", { class: "row" },
    h("div", { class: "seg" }, h("button", { class: "btn", type: "button", "aria-pressed": String(date === today()), onclick: go(today()) }, "Hôm nay"), h("button", { class: "btn", type: "button", "aria-pressed": String(date === addDays(today(), 1)), onclick: go(addDays(today(), 1)) }, "Ngày mai")),
    dateInput, h("span", { class: "muted small" }, `Có danh sách: ${list.dates.map((d) => fmtDate(d.date).slice(0, 5)).join(", ") || "chưa có"}`));
  const out = [bar];
  if (!daily) {
    out.push(h("div", { class: "empty" }, h("p", {}, `Chưa có danh sách từ cho ${fmtDate(date)}.`), h("p", { class: "small" }, "Nhờ agent chuẩn bị bằng tab Prompt, chế độ \"Chuẩn bị từ vựng ngày mai\"."), h("button", { class: "btn primary", type: "button", onclick: () => { app.promptMode = "prepare-vocab"; app.promptDate = date; setTab("prompt"); } }, "Mở tab Prompt")));
    return page.replaceChildren(...out);
  }
  out.push(h("div", { class: "card" },
    h("div", { class: "row between" }, h("h2", { style: "margin:0" }, `${daily.topic_vi || daily.topic}`), h("span", { class: "badge" }, `${ordered.length} từ mới`)),
    h("p", { class: "muted" }, daily.topic || ""),
    daily.goal ? h("p", {}, h("span", { class: "label" }, "Mục tiêu: "), daily.goal) : null,
    daily.pattern ? h("p", {}, h("span", { class: "label" }, "Mẫu câu: "), h("code", {}, daily.pattern.formula || ""), " ", daily.pattern.example ? h("span", {}, "· ", daily.pattern.example, " ", speakBtn(daily.pattern.example, "Nghe câu")) : null) : null,
    arr(daily.tips).length ? h("div", {}, h("span", { class: "label" }, "Chuẩn bị: "), h("ul", { class: "plain small" }, daily.tips.map((t) => h("li", {}, t)))) : null,
    arr(daily.plan).length ? h("details", { style: "margin-top:8px" }, h("summary", { class: "small muted", style: "cursor:pointer" }, "Kế hoạch buổi học"), h("ol", { class: "small" }, daily.plan.map((s) => h("li", {}, h("span", {}, `${s.step} (${s.minutes} phút): `), h("span", { class: "muted" }, s.activity))))) : null,
    daily.missing_word_ids?.length ? h("p", { class: "bad-text small" }, `Thiếu từ trong vocab.json: ${daily.missing_word_ids.join(", ")}`) : null));
  const mode = app.flashStage || "list";
  const seg = h("div", { class: "seg" }, [["list", "Danh sách"], ["flash", "Thẻ lật"], ["quiz", "Tự kiểm tra"]].map(([k, v]) => h("button", { class: "btn", type: "button", "aria-pressed": String(mode === k), onclick: () => { app.flashStage = k; renderToday(); } }, v)));
  const known = ordered.filter((w) => markState(w) === "known").length;
  out.push(h("div", { class: "row between" }, seg, h("span", { class: "muted small" }, `Hôm nay đã đánh dấu thuộc: ${known}/${ordered.length}`)));
  if (mode === "flash") out.push(flashcards(ordered, { label: "Thẻ", onFinish: () => { app.flashStage = "list"; renderToday(); } }));
  else if (mode === "quiz") out.push(quiz(ordered));
  else out.push(h("div", { class: "grid" }, ordered.map((w) => wordCard(w, { meta: true }))));
  page.replaceChildren(...out);
}

// ----- Tab: Từ vựng -----
async function renderVocab() {
  const my = ++epoch;
  app.vocab = (await api("/api/vocab")).words;
  if (my !== epoch) return;
  const t = today();
  const live = app.vocab.filter((w) => w.status !== "archived");
  const dueList = live.filter((w) => (w.status === "learning" || w.status === "mastered") && w.due && w.due <= t).sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box);
  const view = app.vocabView || "book";
  const seg = h("div", { class: "seg" },
    h("button", { class: "btn", type: "button", "aria-pressed": String(view === "book"), onclick: () => { app.vocabView = "book"; renderVocab(); } }, `Sổ từ (${live.length})`),
    h("button", { class: "btn", type: "button", "aria-pressed": String(view === "due"), onclick: () => { app.vocabView = "due"; renderVocab(); } }, `Ôn hôm nay (${dueList.length})`));
  if (view === "due") {
    const body = dueList.length ? flashcards(dueList, { label: "Ôn", onFinish: () => { app.vocabView = "book"; renderVocab(); } }) : h("div", { class: "empty" }, "Hôm nay không có từ nào đến hạn ôn. Tuyệt vời!");
    return page.replaceChildren(seg, h("p", { class: "muted small" }, "Ôn tập ngắt quãng: nhớ đúng thì từ lên hộp cao hơn và lâu hơn mới gặp lại (hộp 1-5: 1, 2, 4, 8, 16 ngày); nhớ sai thì về hộp 1."), body);
  }
  const f = app.vocabFilter ||= { q: "", topic: "", box: "", status: "" };
  const topics = [...new Set(live.map((w) => w.topic).filter(Boolean))].sort();
  const sel = (key, label, opts) => h("select", { "aria-label": label, onchange: (e) => { f[key] = e.target.value; draw(); } }, h("option", { value: "" }, label), opts.map(([v, l]) => h("option", { value: v, selected: f[key] === v }, l)));
  const results = h("div", {});
  const count = h("span", { class: "muted small" });
  const draw = () => {
    const q = f.q.trim().toLowerCase();
    const list = live.filter((w) => (!q || w.word.toLowerCase().includes(q) || (w.vi || "").toLowerCase().includes(q)) && (!f.topic || w.topic === f.topic) && (!f.box || String(w.box) === f.box)
      && (!f.status || (f.status === "due" ? (w.status !== "new" && w.due <= t) : w.status === f.status)));
    count.textContent = `${list.length} từ`;
    results.replaceChildren(list.length ? h("div", { class: "grid" }, list.map((w) => wordCard(w, { compact: true }))) : h("div", { class: "empty" }, "Không có từ nào khớp bộ lọc."));
  };
  const search = h("input", { type: "text", placeholder: "Tìm từ hoặc nghĩa...", value: f.q, "aria-label": "Tìm kiếm", oninput: (e) => { f.q = e.target.value; draw(); } });
  page.replaceChildren(seg, h("div", { class: "row" }, search,
    sel("topic", "Mọi chủ đề", topics.map((x) => [x, x])), sel("box", "Mọi hộp", [1, 2, 3, 4, 5].map((n) => [String(n), `Hộp ${n}`])),
    sel("status", "Mọi trạng thái", [["due", "Đến hạn ôn"], ["new", "Mới"], ["learning", "Đang học"], ["mastered", "Đã thuộc"]]), count), results);
  draw();
}

// ----- Tab: Buổi học -----
async function renderLessons() {
  const my = ++epoch;
  const { lessons } = await api("/api/lessons");
  if (my !== epoch) return;
  if (!lessons.length) return page.replaceChildren(h("div", { class: "empty" }, "Chưa có buổi học nào. Sau mỗi buổi học, agent sẽ ghi kết quả vào đây."));
  const sel = app.lessonId && lessons.some((l) => l.id === app.lessonId) ? app.lessonId : lessons[0].id;
  const detail = h("div", {});
  const list = h("div", { class: "list" }, lessons.map((l) => h("button", { type: "button", "aria-current": String(l.id === sel), onclick: () => { app.lessonId = l.id; renderLessons(); } },
    h("div", { class: "t" }, h("span", {}, fmtDate(l.date)), h("span", { class: "badge" }, l.overall != null ? `${l.overall}/10` : "-")),
    h("div", { class: "small muted" }, `${TYPE_VI[l.type] || l.type} · ${l.topic}`))));
  page.replaceChildren(h("div", { class: "split" }, list, detail));
  const l = await api(`/api/lessons/${sel}`);
  if (my !== epoch) return;
  const scores = h("div", {}, CRIT.map(([k, label]) => {
    const s = l.scores?.[k] || {};
    return h("div", { class: "scorerow" },
      h("div", { class: "row between" }, h("span", {}, label, s.estimated ? h("span", { class: "badge warn", style: "margin-left:6px" }, "ước lượng") : null), h("span", {}, s.score == null ? "-" : `${s.score}/10`)),
      h("div", { class: "bar" }, h("div", { style: `width:${(s.score || 0) * 10}%` })),
      s.reason ? h("div", { class: "small" }, h("span", { class: "muted" }, "Lý do: "), s.reason) : null,
      s.fix ? h("div", { class: "small fix" }, "Cách sửa: " + s.fix) : null);
  }));
  detail.append(
    h("div", { class: "card" }, h("div", { class: "row between" }, h("h2", { style: "margin:0" }, l.topic || "Buổi học"), h("span", { class: "row" }, h("span", { class: "badge" }, TYPE_VI[l.type] || l.type), h("span", { class: "badge ok" }, `Tổng ${l.overall ?? "-"}/10`), l.level_estimate ? h("span", { class: "badge" }, l.level_estimate) : null)),
      h("p", { class: "muted small" }, `${fmtDate(l.date)} · ${l.duration_min || "?"} phút`), l.summary ? h("p", {}, l.summary) : null, l.praise ? h("p", { class: "ok-text" }, "Điểm tốt: " + l.praise) : null,
      l.transcript_summary ? h("details", {}, h("summary", { class: "small muted", style: "cursor:pointer" }, "Tóm tắt diễn biến"), h("p", { class: "small" }, l.transcript_summary)) : null),
    h("div", { class: "card" }, h("h3", {}, "Điểm số"), scores, h("p", { class: "small muted", style: "margin-top:8px" }, "* Phát âm chấm từ chữ/giọng nói chỉ là ước lượng.")),
    h("div", { class: "card" }, h("h3", {}, "Lỗi đã gặp"), arr(l.errors).length ? arr(l.errors).map((e) => h("div", { class: "err" }, h("div", {}, h("span", { class: "wrong-t" }, e.wrong), " → ", h("span", { class: "right-t" }, e.right), " ", h("span", { class: "badge" }, CAT_VI[e.category] || e.category || "")), e.explanation_vi ? h("div", { class: "small muted" }, e.explanation_vi) : null)) : h("p", { class: "muted small" }, "Không ghi nhận lỗi.")),
    h("div", { class: "card" }, h("h3", {}, "Bài tập về nhà"), arr(l.homework).length ? h("ul", { class: "plain" }, l.homework.map((x) => h("li", {}, x))) : h("p", { class: "muted small" }, "Không có.")),
    arr(l.new_words_full).length ? h("div", {}, h("h3", {}, "Từ mới trong buổi"), h("div", { class: "grid" }, l.new_words_full.map((w) => wordCard(w, { compact: true, marks: false })))) : null,
    l.teacher_notes ? h("div", { class: "card" }, h("h3", {}, "Ghi chú của giáo viên"), h("p", {}, l.teacher_notes)) : null);
}

// ----- Tab: Lộ trình -----
const LIST = (title, items) => h("div", { class: "card" }, h("h3", {}, title), h("ul", { class: "plain small" }, arr(items).map((x) => h("li", {}, x))));
async function renderPath() {
  const my = ++epoch;
  const [{ curriculum, progress }, lib] = await Promise.all([api("/api/curriculum"), api("/api/library")]);
  if (my !== epoch) return;
  const stages = curriculum.stages;
  const cur = stages.find((s) => s.id === progress.stage) || stages[0];
  const doneCount = (s) => s.cando.filter((c) => progress.cando[c.id]).length;
  const idx = (s) => stages.indexOf(s);
  const sel = stages.find((s) => s.id === app.pathStage) || cur;
  const strip = h("div", { class: "stages", role: "tablist", "aria-label": "Các giai đoạn" }, stages.map((s) => {
    const d = doneCount(s), isCur = s.id === cur.id, passed = idx(s) < idx(cur);
    return h("button", { type: "button", class: "stage" + (isCur ? " current" : "") + (passed ? " passed" : ""), "aria-pressed": String(s.id === sel.id), onclick: () => { app.pathStage = s.id; renderPath(); } },
      h("span", { class: "sid" }, s.id), h("span", { class: "small muted" }, s.name_vi), h("span", { class: "small " + (d === s.cando.length ? "ok-text" : "muted") }, `${d}/${s.cando.length} can-do`));
  }));
  const isCur = sel.id === cur.id;
  const head = h("div", { class: "card" },
    h("div", { class: "row between" }, h("h2", { style: "margin:0" }, `${sel.id} · ${sel.name_vi}`), h("span", { class: "row" }, h("span", { class: "badge" }, `CEFR ${sel.cefr}`), isCur ? h("span", { class: "badge ok" }, "Giai đoạn hiện tại") : null)),
    h("p", { class: "muted small" }, `${sel.name} · ${sel.band} · ~${sel.hours_end} giờ học tích lũy · ~${sel.vocab_target} từ tích lũy${sel.library_books?.length ? " · thư viện từ: quyển " + sel.library_books.join(", ") : ""}`),
    h("p", {}, sel.goal_vi),
    isCur ? null : h("button", { class: "btn sm", type: "button", onclick: async () => { try { app.profile = await api("/api/profile", { method: "PUT", body: { stage: sel.id } }); app.state.profile = app.profile; setHeader(); toast(`Đã đặt giai đoạn hiện tại: ${sel.id}`); renderPath(); } catch (e) { toast(e.message, true); } } }, "Đặt làm giai đoạn hiện tại"));
  const steps = h("div", { class: "card" }, h("h3", {}, "8 bước của giai đoạn"), h("ol", { class: "steps" }, sel.steps.map((s) => {
    const state = isCur ? (s.n < progress.step ? "done" : s.n === progress.step ? "now" : "") : "";
    return h("li", { class: state, ...(state === "now" ? { "aria-current": "step" } : {}) }, h("span", {}, `${s.n}. ${s.title}`), h("span", { class: "small muted" }, s.focus), state === "now" ? h("span", { class: "badge ok" }, "đang học") : null);
  })));
  const cando = h("div", { class: "card" }, h("div", { class: "row between" }, h("h3", { style: "margin:0" }, "Can-do (tự đánh giá)"), h("span", { class: "badge" }, `${doneCount(sel)}/${sel.cando.length}`)),
    h("p", { class: "muted small" }, "Tick khi bạn tự làm được việc đó mà không cần gợi ý. Được lưu vào workspace/profile.json."),
    sel.cando.map((c) => h("label", { class: "check" }, h("input", { type: "checkbox", checked: !!progress.cando[c.id], onchange: async (e) => {
      try { const r = await api("/api/cando", { method: "PUT", body: { id: c.id, done: e.target.checked } }); progress.cando = r.cando; renderPath(); } catch (err) { e.target.checked = !e.target.checked; toast(err.message, true); }
    } }), h("span", {}, c.text))));
  const exam = h("div", { class: "card" }, h("h3", {}, "Kiểm tra cuối giai đoạn"), h("ul", { class: "plain small" }, sel.exit_assessment.tasks.map((x) => h("li", {}, x))), h("p", { class: "small", style: "margin-top:8px" }, h("span", { class: "label" }, "Đạt khi: "), sel.exit_assessment.pass_vi));
  const lm = lib.library;
  page.replaceChildren(
    h("p", { class: "muted small" }, "Lộ trình giao tiếp từ người mới bắt đầu (A1) đến thành thạo (C2) theo khung CEFR. Mỗi buổi học thuộc một giai đoạn và một bước. Chi tiết và nguồn: tab Quy tắc, file curriculum.md."),
    strip, head, steps, cando,
    h("div", { class: "grid" }, LIST("Kỹ năng giao tiếp", sel.functions), LIST("Chủ đề", sel.topics), LIST("Mẫu ngữ pháp", sel.grammar), LIST("Bài nói", sel.speaking_tasks)), exam,
    lm ? h("p", { class: "muted small" }, `Thư viện từ vựng: ${lm.words} từ, ${lm.sentences} câu, lộ trình 30 ngày (nhập ${lm.imported}).`) : null);
}

// ----- Tab: Tiến bộ (inline SVG, no libs) -----
function lineChart(points) {
  const W = 640, H = 260, L = 34, R = 26, T = 12, B = 34;
  const svg = (inner) => `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ điểm theo buổi học">${inner}</svg>`;
  const n = points.length;
  const x = (i) => L + (n === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1));
  const y = (v) => T + (1 - v / 10) * (H - T - B);
  let g = "";
  for (let v = 0; v <= 10; v += 2) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e5e2dc"/><text x="${L - 6}" y="${y(v) + 4}" font-size="11" text-anchor="end" fill="#6b665f">${v}</text>`;
  points.forEach((p, i) => { g += `<text x="${x(i)}" y="${H - 12}" font-size="11" text-anchor="middle" fill="#6b665f">${esc(p.date.slice(5).replace("-", "/"))}</text>`; });
  for (const k of ["comprehension", "fluency", "grammar", "vocabulary", "pronunciation", "overall"]) {
    const vals = points.map((p, i) => [i, k === "overall" ? p.overall : p.scores[k]]).filter(([, v]) => v != null);
    if (!vals.length) continue;
    const c = COLORS[k], wdt = k === "overall" ? 2.5 : 1.5, dash = k === "pronunciation" ? ' stroke-dasharray="4 3"' : "";
    if (vals.length > 1) g += `<polyline fill="none" stroke="${c}" stroke-width="${wdt}"${dash} points="${vals.map(([i, v]) => `${x(i)},${y(v)}`).join(" ")}"/>`;
    g += vals.map(([i, v]) => `<circle cx="${x(i)}" cy="${y(v)}" r="${k === "overall" ? 4 : 3}" fill="${c}"><title>${esc(k)} ${v}</title></circle>`).join("");
  }
  return svg(g);
}
async function renderProgress() {
  const my = ++epoch;
  const p = await api("/api/progress");
  if (my !== epoch) return;
  const tile = (num, lab) => h("div", { class: "tile" }, h("div", { class: "num" }, String(num)), h("div", { class: "lab" }, lab));
  const out = [h("div", { class: "grid tiles" }, tile(`${p.streak} ngày`, "Chuỗi ngày học liên tiếp"), tile(p.lessons, "Số buổi học"), tile(p.overall_avg ?? "-", "Điểm tổng trung bình /10"), tile(p.words.mastered, "Từ đã thuộc"), tile(p.words.learning, "Từ đang học"), tile(p.words.new, "Từ mới chưa học"))];
  if (!p.points.length) { out.push(h("div", { class: "empty" }, "Chưa có điểm nào. Sau buổi học đầu tiên, biểu đồ sẽ xuất hiện.")); }
  else {
    const legend = h("div", { class: "legend" }, [["overall", "Tổng"], ...CRIT].map(([k, l]) => h("span", {}, h("i", { style: `background:${COLORS[k]}` }), l)));
    out.push(h("div", { class: "card" }, h("h3", {}, "Điểm theo buổi học"), h("div", { html: lineChart(p.points) }), legend));
    out.push(h("div", { class: "card" }, h("h3", {}, "Điểm trung bình theo tiêu chí"), CRIT.map(([k, l]) => h("div", { class: "scorerow" }, h("div", { class: "row between" }, h("span", {}, l), h("span", {}, p.averages[k] == null ? "-" : `${p.averages[k]}/10`)), h("div", { class: "bar" }, h("div", { style: `width:${(p.averages[k] || 0) * 10}%` })))), h("p", { class: "small muted" }, "* Phát âm là ước lượng.")));
  }
  const maxC = Math.max(1, ...p.top_errors.map((e) => e.count || 0));
  out.push(h("div", { class: "card" }, h("h3", {}, "Lỗi hay lặp lại"), p.top_errors.length ? p.top_errors.map((e) => h("div", { class: "err" },
    h("div", { class: "row between" }, h("span", {}, e.pattern), h("span", { class: "row" }, h("span", { class: "badge" }, CAT_VI[e.category] || e.category), h("span", { class: "badge " + (e.status === "open" ? "warn" : "ok") }, e.status), h("span", {}, `${e.count} lần`))),
    h("div", { class: "bar" }, h("div", { style: `width:${((e.count || 0) / maxC) * 100}%;background:var(--warn)` })),
    h("div", { class: "small" }, h("span", { class: "wrong-t" }, e.example_wrong), " → ", h("span", { class: "right-t" }, e.example_right)),
    e.rule_vi ? h("div", { class: "small muted" }, e.rule_vi) : null)) : h("p", { class: "muted small" }, "Chưa có lỗi nào được ghi.")));
  page.replaceChildren(...out);
}

// ----- Tab: Quy tắc (rules read-only + profile) -----
function md(src) {
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");
  const lines = src.replace(/\r/g, "").split("\n"); let out = "", i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (ln.startsWith("```")) { let code = ""; i++; while (i < lines.length && !lines[i].startsWith("```")) code += lines[i++] + "\n"; i++; out += `<pre><code>${esc(code)}</code></pre>`; continue; }
    let m;
    if ((m = ln.match(/^(#{1,3})\s+(.*)/))) { out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; i++; continue; }
    if (ln.trim().startsWith("|")) {
      const rows = []; while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const body = rows.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r)); const head = cells(body[0] || "");
      out += `<div class="tw"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.slice(1).map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(ln)) {
      const ord = /^\s*\d+\./.test(ln); out += ord ? "<ol>" : "<ul>";
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) out += `<li>${inline(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ""))}</li>`;
      out += ord ? "</ol>" : "</ul>"; continue;
    }
    if (!ln.trim()) { i++; continue; }
    let para = ln; i++; while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|```|\||\s*([-*]|\d+\.)\s)/.test(lines[i])) para += " " + lines[i++];
    out += `<p>${inline(para)}</p>`;
  }
  return out;
}
async function renderRules() {
  const my = ++epoch;
  const [{ files }, prof] = await Promise.all([api("/api/rules"), api("/api/profile")]);
  if (my !== epoch) return;
  const cur = files.find((f) => f.file === app.ruleFile) || files[0];
  const f = { name: h("input", { type: "text", value: prof.name || "", maxlength: "60" }), level: h("select", {}, ["A1", "A2", "B1", "B2", "C1", "C2"].map((v) => h("option", { value: v, selected: prof.level === v }, v))),
    goal: h("input", { type: "text", value: prof.goal || "", maxlength: "200" }), n: h("input", { type: "number", min: "5", max: "8", value: prof.daily_new_words }),
    accent: h("select", {}, [["en-US", "Mỹ (en-US)"], ["en-GB", "Anh (en-GB)"]].map(([v, l]) => h("option", { value: v, selected: prof.accent === v }, l))) };
  const field = (label, el) => h("div", { class: "field" }, h("label", {}, label), el);
  const save = async () => {
    try { app.profile = await api("/api/profile", { method: "PUT", body: { name: f.name.value, level: f.level.value, goal: f.goal.value, daily_new_words: Number(f.n.value), accent: f.accent.value } }); toast("Đã lưu hồ sơ."); setHeader(); }
    catch (e) { toast(e.message, true); }
  };
  const profileCard = h("div", { class: "card" }, h("h2", {}, "Hồ sơ học viên"), h("div", { class: "form" }, field("Tên", f.name), field("Trình độ (CEFR; chọn giai đoạn ở tab Lộ trình)", f.level), field("Mục tiêu", f.goal), field("Số từ mới mỗi ngày (5-8)", f.n), field("Giọng đọc", f.accent)),
    h("div", { class: "row", style: "margin-top:12px" }, h("button", { class: "btn primary", type: "button", onclick: save }, "Lưu hồ sơ"), h("span", { class: "muted small" }, prof.level_note || "")));
  const view = h("div", { class: "card md", html: md(cur.content) });
  page.replaceChildren(profileCard, h("div", {}, h("h2", {}, "Quy tắc của giáo viên (chỉ đọc)"), h("p", { class: "muted small" }, "Các file này nằm trong thư mục skill/ và do bạn chỉnh bằng tay; app không ghi vào đó.")),
    h("div", { class: "split" }, h("div", { class: "list" }, files.map((x) => h("button", { type: "button", "aria-current": String(x.file === cur.file), onclick: () => { app.ruleFile = x.file; renderRules(); } }, h("span", {}, x.title), h("span", { class: "small muted" }, x.file)))), view));
}

// ----- Tab: Prompt -----
async function renderPrompt() {
  const my = ++epoch;
  app.promptMode ||= "prepare-vocab";
  const libInfo = (await api("/api/library").catch(() => ({}))).library;
  if (my !== epoch) return; app.promptAgent ||= "claude";
  app.promptDate ||= app.promptMode === "prepare-vocab" ? addDays(today(), 1) : today();
  const box = h("textarea", { class: "prompt-box", readonly: true, "aria-label": "Prompt" });
  const load = async () => { try { const r = await api(`/api/prompt?mode=${app.promptMode}&agent=${app.promptAgent}&date=${app.promptDate}`); if (my === epoch) box.value = r.prompt; } catch (e) { box.value = e.message; } };
  const mode = h("select", { onchange: (e) => { app.promptMode = e.target.value; app.promptDate = app.promptMode === "prepare-vocab" ? addDays(today(), 1) : today(); renderPrompt(); } }, MODES.map(([v, l]) => h("option", { value: v, selected: v === app.promptMode }, l)));
  const agent = h("select", { onchange: (e) => { app.promptAgent = e.target.value; load(); } }, [["claude", "Claude Code"], ["codex", "Codex"]].map(([v, l]) => h("option", { value: v, selected: v === app.promptAgent }, l)));
  const date = h("input", { type: "date", value: app.promptDate, onchange: (e) => { if (e.target.value) { app.promptDate = e.target.value; load(); } } });
  const copy = async () => {
    try { await navigator.clipboard.writeText(box.value); } catch { box.select(); document.execCommand("copy"); }
    toast("Đã sao chép prompt. Dán vào Claude Code hoặc Codex.");
  };
  page.replaceChildren(h("div", { class: "card" }, h("div", { class: "form" }, h("div", { class: "field" }, h("label", {}, "Chế độ"), mode), h("div", { class: "field" }, h("label", {}, "Agent"), agent), h("div", { class: "field" }, h("label", {}, "Ngày"), date)),
    h("p", { class: "muted small", style: "margin-top:10px" }, libInfo ? `Chế độ chuẩn bị từ vựng sẽ chọn từ thư viện của bạn (${libInfo.words} từ).` : "Chưa có thư viện từ vựng (xem README, mục nhập thư viện)."),
      h("p", { class: "muted small" }, "Mở Claude Code hoặc Codex trong thư mục dự án, dán prompt. Agent đọc skill/ và workspace/, làm việc, rồi ghi kết quả; quay lại app để xem.")),
    h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: copy }, "Copy prompt")), box);
  load();
}

// ----- shell -----
const TABS = { today: renderToday, vocab: renderVocab, lessons: renderLessons, path: renderPath, progress: renderProgress, rules: renderRules, prompt: renderPrompt };
async function render() {
  try { await TABS[app.tab](); } catch (e) { page.replaceChildren(h("div", { class: "empty bad-text" }, e.message)); }
}
function setTab(t) { app.tab = t; if (location.hash !== "#" + t) history.replaceState(null, "", "#" + t); for (const b of document.querySelectorAll("#tabs button")) b.setAttribute("aria-selected", String(b.dataset.tab === t)); render(); }
function setHeader() {
  const s = app.state, p = app.profile;
  const lb = document.getElementById("levelBadge"); lb.textContent = `${p.name} · ${p.stage || p.level}`; lb.className = "badge ok";
  document.getElementById("sampleBanner").hidden = !s.sample;
  const pb = document.getElementById("problemsBadge"); pb.hidden = !s.problems; pb.textContent = `${s.problems} vấn đề dữ liệu`; pb.title = "Xem /api/validate để biết chi tiết";
}
async function init() {
  app.state = await api("/api/state"); app.profile = app.state.profile; setHeader();
  document.getElementById("tabs").addEventListener("click", (e) => { const b = e.target.closest("button[data-tab]"); if (b) setTab(b.dataset.tab); });
  document.getElementById("sampleDelete").addEventListener("click", async () => {
    if (!confirm("Xóa toàn bộ dữ liệu mẫu (từ vựng, bài mẫu, buổi học mẫu, lỗi mẫu)? Dữ liệu thật của bạn không bị xóa.")) return;
    try { const r = await api("/api/sample/delete", { method: "POST" }); toast(`Đã xóa ${r.removed} mục mẫu.`); app.state = await api("/api/state"); app.profile = app.state.profile; setHeader(); render(); } catch (e) { toast(e.message, true); }
  });
  window.addEventListener("hashchange", () => { const t = location.hash.slice(1); if (TABS[t] && t !== app.tab) setTab(t); });
  if ("speechSynthesis" in window) speechSynthesis.getVoices();
  const start = location.hash.slice(1);
  setTab(TABS[start] ? start : "today");
}
init().catch((e) => { page.textContent = "Không kết nối được máy chủ: " + e.message; });
