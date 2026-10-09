const SUPABASE_URL = "https://mmcyyxuzzdyuxwbfokzc.supabase.co";
const SUPABASE_KEY = "sb_publishable_iLYupu-8JboV9Cl0PXhplQ_jk_2csWW";
const CHANNEL_URL = "https://www.youtube.com/@saravanandecodes";

const STATS = [
  { label: "Subscribers", value: "2.68M+" },
  { label: "Language", value: "Tamil" },
  { label: "Genre", value: "Mystery · Crime · Thriller" }
];

const TIMELINE = [
  { step: "01", title: "The Case Opens", text: "A mystery, a crime, or a chilling story is picked: solved, unsolved, or somewhere in between." },
  { step: "02", title: "The Research", text: "The details are pulled together so the full story is explained clearly, not rushed." },
  { step: "03", title: "The Narration", text: "The story is told in Tamil with a voice built to keep you hooked." },
  { step: "04", title: "The Atmosphere", text: "Sound effects and pacing turn the video into something that feels like a thriller movie." },
  { step: "05", title: "The Twist", text: "The turning points land, and the pieces start to connect." },
  { step: "06", title: "The Discussion", text: "The case ends, and the fans take over in the comments. That's where this site comes in." }
];

// Fan-made lines, NOT quotes from the creator
const CATCHPHRASES = [
  "Case opened.", "Every mystery has an answer.", "Headphones on. Lights off.",
  "Some stories don't end when the video does.", "Who really did it?", "Case decoded."
];

const QUIZ = [
  { q: "What language is the channel's storytelling in?", options: ["Tamil","Hindi","Telugu","English"], answer: 0 },
  { q: "What kind of stories does the channel mainly cover?", options: ["Mysteries and crime cases","Cooking","Gaming","Travel vlogs"], answer: 0 },
  { q: "What are the cases described as on the channel?", options: ["Solved and unsolved","Only fictional","Only historical","Only sports"], answer: 0 },
  { q: "The channel promises sound effects that make you feel like you're watching a...", options: ["Thriller movie","Comedy show","Cooking show","Cartoon"], answer: 0 },
  { q: "Which of these best describes the channel's genres?", options: ["Horror, mystery, and crime","Fashion and beauty","Finance","Fitness"], answer: 0 }
];
// Option order is shuffled at runtime below.

const FAQS = [
  ["Is this the official site?", "No. It is an unofficial fan-made tribute, not affiliated with or endorsed by Saravanan Decodes."],
  ["Where do the videos come from?", "They play from YouTube through the privacy-friendly youtube-nocookie player."],
  ["Why does my wall post not show up?", "Posts are reviewed first and appear once approved."],
  ["Can I vote more than once?", "One vote per browser. Your vote is remembered on this device."],
  ["How do I join the fan club?", "Use the Join form on the home page with your name and email."]
];

const SEED = ["VgSAjBZzSHU","iTD6C4aUUlA","kDBP3DX0V0c","nk4UhoXnvGU","Ycz5Xe-6iak","aPkfZZ7wA-c"]
  .map((id, i) => ({ id, title: "Case File 0" + (i + 1), publishedAt: null }));

const $ = s => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const api = (p, o = {}) => fetch(SUPABASE_URL + "/rest/v1/" + p, {
  method: o.method || "GET", body: o.body,
  headers: Object.assign({ apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, "Content-Type": "application/json" }, o.prefer ? { Prefer: o.prefer } : {})
});
const nz = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
const fmtDate = d => d ? new Date(d).toLocaleDateString() : "";

let VIDS = null;
async function loadVideos() {
  if (VIDS) return VIDS;
  const r = await fetch("videos.json");
  if (!r.ok) throw new Error("load");
  VIDS = await r.json();
  return VIDS;
}

/* ---------- global UI ---------- */
$("#theme").onclick = () => {
  const t = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = t; store.set("theme", t);
};
$("#burger").onclick = e => {
  const o = $("#menu").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", o);
};
addEventListener("scroll", () => $(".nav").classList.toggle("small", scrollY > 40), { passive: true });

const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); e.target.dispatchEvent(new Event("reveal")); } }), { threshold: .15 });
const reveal = n => io.observe(n);

function share(statusEl, text) {
  const data = { title: "Decoded Files", text: text || "A fan hub for Saravanan Decodes", url: location.origin + location.pathname };
  if (navigator.share) return navigator.share(data).catch(() => {});
  return navigator.clipboard.writeText(data.text + " " + data.url)
    .then(() => { statusEl.textContent = "Link copied!"; })
    .catch(() => { statusEl.textContent = "Copy this link: " + data.url; });
}

/* ---------- video modal ---------- */
function openModal(v, trigger) {
  const m = el("div", "modal"), box = el("div"), x = el("button", "btn", "✕ Close"), f = document.createElement("iframe");
  m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", v.title);
  x.setAttribute("aria-label", "Close video");
  f.src = "https://www.youtube-nocookie.com/embed/" + v.id + "?autoplay=1&rel=0"; f.title = v.title;
  f.allow = "autoplay; encrypted-media; picture-in-picture"; f.allowFullscreen = true;
  box.append(x, f); m.append(box); document.body.append(m); x.focus();
  const close = () => { f.remove(); m.remove(); document.removeEventListener("keydown", key); trigger && trigger.focus(); };
  const key = e => { if (e.key === "Escape") close(); if (e.key === "Tab") { e.preventDefault(); x.focus(); } };
  document.addEventListener("keydown", key); x.onclick = close;
  m.onclick = e => { if (e.target === m) close(); };
}

/* ---------- video cards ---------- */
function card(v, words) {
  const b = el("button", "card"), img = new Image(320, 180), h = el("h3");
  img.src = "https://img.youtube.com/vi/" + v.id + "/mqdefault.jpg"; img.alt = v.title; img.loading = "lazy";
  words ? highlight(h, v.title, words) : (h.textContent = v.title);
  b.append(img, h);
  if (v.publishedAt) b.append(el("small", 0, fmtDate(v.publishedAt)));
  b.onclick = () => openModal(v, b);
  return b;
}
function highlight(node, title, words) {
  const chars = [...title], map = []; let n = "";
  chars.forEach((c, i) => { const x = nz(c); for (let k = 0; k < x.length; k++) map.push(i); n += x; });
  const hit = new Set();
  words.forEach(w => { let p = n.indexOf(w); while (p > -1) { for (let k = p; k < p + w.length; k++) hit.add(map[k]); p = n.indexOf(w, p + 1); } });
  const runs = [];
  chars.forEach((c, i) => { const h = hit.has(i); if (runs.length && runs[runs.length - 1][0] === h) runs[runs.length - 1][1] += c; else runs.push([h, c]); });
  runs.forEach(([h, t]) => node.append(h ? el("mark", 0, t) : t));
}
const skeletons = (box, n) => box.replaceChildren(...Array.from({ length: n }, () => el("div", "skel")));

/* ---------- index page ---------- */
if ($("#case-files")) {
  const stats = $("#stats");
  STATS.forEach(s => { const d = el("div", "stat"), b = el("b", 0, s.value); d.append(b, s.label); stats.append(d); });
  const num = STATS[0].value.match(/[\d.]+/)[0];
  stats.firstChild.firstChild.addEventListener("reveal", e => {
    const t = parseFloat(num), suf = STATS[0].value.replace(num, ""), t0 = performance.now();
    (function tick(now) { const p = Math.min((now - t0) / 1200, 1); e.target.textContent = (t * p).toFixed(2) + suf; if (p < 1) requestAnimationFrame(tick); })(t0);
  });
  reveal(stats.firstChild.firstChild);

  TIMELINE.forEach(t => { const li = el("li"); li.append(el("b", 0, "CASE " + t.step + " · " + t.title), el("p", "muted", t.text)); $("#timeline").append(li); reveal(li); });

  const feat = $("#featured"), fv = $("#fv"); skeletons(feat, 6);
  let all = null;
  const q = $("#q"), sort = $("#sort"), grid = $("#all"), more = $("#more"), count = $("#count");
  let shown = 24, timer;
  q.value = new URLSearchParams(location.search).get("q") || "";

  function render() {
    const words = nz(q.value.trim()).split(/\s+/).filter(Boolean);
    let r = all.filter(v => { const t = nz(v.title); return words.every(w => t.includes(w)); });
    if (sort.value === "old") r = r.slice().reverse();
    if (sort.value === "az") r = r.slice().sort((a, b) => a.title.localeCompare(b.title, "ta"));
    grid.replaceChildren(...r.slice(0, shown).map(v => card(v, words)));
    count.textContent = "Showing " + Math.min(shown, r.length) + " of " + r.length + " case files";
    more.hidden = shown >= r.length;
    $("#clear").hidden = !q.value;
    const empty = $("#empty"); empty.hidden = r.length > 0;
    empty.firstElementChild.textContent = "No case files match '" + q.value.trim() + "'. Try a different word.";
    history.replaceState(null, "", q.value.trim() ? "?q=" + encodeURIComponent(q.value.trim()) : location.pathname);
  }
  const resetSearch = () => { q.value = ""; shown = 24; render(); };
  q.oninput = () => { clearTimeout(timer); timer = setTimeout(() => { shown = 24; render(); }, 150); };
  sort.onchange = () => { shown = 24; render(); };
  $("#clear").onclick = () => { resetSearch(); q.focus(); };
  $("#reset").onclick = resetSearch;
  more.onclick = () => { shown += 24; render(); };
  addEventListener("keydown", e => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    if (e.key === "Escape" && document.activeElement === q) resetSearch();
  });

  async function init() {
    $("#err").hidden = true; skeletons(grid, 8);
    try { all = await loadVideos(); } catch (e) { all = null; }
    const list = all || SEED;
    feat.replaceChildren(...list.slice(0, 6).map(v => card(v)));
    fv.replaceChildren(...list.slice(0, 6).map(v => { const o = el("option", 0, v.title); o.value = v.title; return o; }));
    if (!all) { grid.replaceChildren(); count.textContent = ""; $("#err").hidden = false; return; }
    if (all.length > 6 && !stats.querySelector("[data-vc]")) {
      const d = el("div", "stat"); d.dataset.vc = "1"; d.append(el("b", 0, String(all.length)), "Case files"); stats.append(d);
    }
    render();
  }
  $("#retry").onclick = () => { VIDS = null; init(); };
  init();

  /* quiz */
  let qi = 0, score = 0;
  const qb = $("#quizbox");
  function quiz() {
    qb.replaceChildren();
    if (qi >= QUIZ.length) {
      const rank = score <= 2 ? "Rookie Detective" : score <= 4 ? "Field Investigator" : "Chief Inspector";
      const sh = el("button", "btn", "Share result"), st = el("p", "muted"), rt = el("button", "btn ghost", "Retry");
      sh.onclick = () => share(st, "I scored " + score + "/" + QUIZ.length + " (" + rank + ") on the Decoded Files quiz!");
      rt.onclick = () => { qi = 0; score = 0; quiz(); };
      qb.append(el("h3", 0, "Score: " + score + "/" + QUIZ.length + " · " + rank), sh, " ", rt, st); return;
    }
    const it = QUIZ[qi], bar = el("div", "bar"), i = el("i"); i.style.width = (qi / QUIZ.length * 100) + "%"; bar.append(i);
    qb.append(bar, el("p", "muted", "Question " + (qi + 1) + " of " + QUIZ.length), el("h3", 0, it.q));
    const opts = it.options.map((t, k) => ({ t, ok: k === it.answer })).sort(() => Math.random() - .5);
    opts.forEach(o => {
      const b = el("button", "opt", o.t);
      b.onclick = () => {
        qb.querySelectorAll(".opt").forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add("ok"); });
        if (o.ok) score++; else b.classList.add("bad");
        const nx = el("button", "btn", qi + 1 < QUIZ.length ? "Next" : "See score");
        nx.onclick = () => { qi++; quiz(); }; qb.append(nx); nx.focus();
      };
      qb.append(b);
    });
  }
  quiz();

  /* fan lines */
  let muted = false; const pop = $("#popup");
  CATCHPHRASES.forEach(l => {
    const b = el("button", "btn ghost", l);
    b.onclick = () => {
      pop.textContent = l;
      if (!muted && "speechSynthesis" in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(l)); }
    };
    $("#lines").append(b);
  });
  $("#mute").onclick = e => { muted = !muted; e.target.setAttribute("aria-pressed", muted); e.target.textContent = "Mute: " + (muted ? "on" : "off"); if (muted && window.speechSynthesis) speechSynthesis.cancel(); };

  /* signup */
  $("#signup-form").onsubmit = async e => {
    e.preventDefault();
    const st = $("#form-status"), btn = e.target.querySelector("button");
    const name = $("#n").value.trim(), email = $("#e").value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) { st.textContent = "Please enter your name and a valid email."; return; }
    btn.disabled = true; st.textContent = "Sending...";
    try {
      const r = await api("fan_signups", { method: "POST", prefer: "return=minimal", body: JSON.stringify({ name, email, favorite_video: fv.value, message: $("#m").value.trim() }) });
      if (r.status === 409) st.textContent = "You're already in the fan club with that email!";
      else if (!r.ok) throw new Error("x");
      else { st.textContent = "Welcome to the fan club, " + name + "!"; e.target.reset(); }
    } catch (err) { st.textContent = "Something went wrong. Please try again."; }
    btn.disabled = false;
  };
}

/* ---------- community page ---------- */
if ($("#wall")) {
  const wm = $("#wm"), posts = $("#posts");
  wm.oninput = () => { $("#wc").textContent = wm.value.length + "/280"; };
  async function loadPosts() {
    skeletons(posts, 3);
    try {
      const r = await api("fan_wall?select=name,message,created_at&approved=eq.true&order=created_at.desc&limit=30");
      if (!r.ok) throw new Error("x");
      const d = await r.json();
      if (!d.length) { posts.replaceChildren(el("p", "muted", "No posts yet. Be the first!")); return; }
      posts.replaceChildren(...d.map(p => { const c = el("div", "card"); c.append(el("b", 0, p.name), el("p", 0, p.message), el("small", "muted", fmtDate(p.created_at))); return c; }));
    } catch (e) { posts.replaceChildren(el("p", "muted", "Couldn't load the fan wall right now.")); }
  }
  loadPosts();
  $("#wall-form").onsubmit = async e => {
    e.preventDefault();
    const st = $("#wall-status"), btn = e.target.querySelector("button"), name = $("#wn").value.trim(), message = wm.value.trim();
    if (!name || !message) { st.textContent = "Please fill in your name and message."; return; }
    btn.disabled = true; st.textContent = "Posting...";
    try {
      const r = await api("fan_wall", { method: "POST", prefer: "return=minimal", body: JSON.stringify({ name, message, approved: false }) });
      if (!r.ok) throw new Error("x");
      st.textContent = "Your post will appear after review"; e.target.reset(); $("#wc").textContent = "0/280";
    } catch (err) { st.textContent = "Couldn't post right now. Please try again."; }
    btn.disabled = false;
  };

  /* voting */
  const vb = $("#votes"), vs = $("#vote-status"); let list = SEED;
  async function results() {
    try {
      const r = await api("rpc/get_vote_counts", { method: "POST", body: "{}" });
      if (!r.ok) throw new Error("x");
      const d = await r.json(), cnt = {}; let tot = 0;
      d.forEach(x => { const n = +(x.count ?? x.votes ?? x.vote_count ?? 0); cnt[x.video_id] = n; tot += n; });
      vb.replaceChildren(...list.map(v => {
        const pct = tot ? Math.round((cnt[v.id] || 0) / tot * 100) : 0, row = el("div", "vrow"), bar = el("div", "bar"), i = el("i");
        row.append(el("span", 0, v.title + " · " + pct + "%")); bar.append(i); row.append(bar); row.lastChild.style.gridColumn = "1/-1";
        setTimeout(() => { i.style.width = pct + "%"; }, 50); return row;
      }));
    } catch (e) { vs.textContent = "Couldn't load results right now."; }
  }
  (async () => {
    try { list = (await loadVideos()).slice(0, 6); } catch (e) {}
    const voted = store.get("votedFor"), t = list.find(v => v.id === voted);
    if (t) { vs.textContent = "You voted for " + t.title; results(); return; }
    vs.textContent = "Pick your favorite. One vote per browser.";
    vb.replaceChildren(...list.map(v => {
      const row = el("div", "vrow"), b = el("button", "btn", "Vote");
      b.setAttribute("aria-label", "Vote for " + v.title);
      b.onclick = async () => {
        b.disabled = true;
        try {
          const r = await api("video_votes", { method: "POST", prefer: "return=minimal", body: JSON.stringify({ video_id: v.id }) });
          if (!r.ok) throw new Error("x");
          store.set("votedFor", v.id); vs.textContent = "You voted for " + v.title; results();
        } catch (e) { vs.textContent = "Couldn't record your vote. Please try again."; b.disabled = false; }
      };
      row.append(el("span", 0, v.title), b); return row;
    }));
  })();

  /* faq + share */
  FAQS.forEach(([q, a], i) => {
    const w = el("div", "faq"), b = el("button", 0, q), p = el("p", 0, a);
    b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-controls", "fa" + i); p.id = "fa" + i; p.hidden = true;
    b.onclick = () => { p.hidden = !p.hidden; b.setAttribute("aria-expanded", !p.hidden); };
    w.append(b, p); $("#faqs").append(w);
  });
  $("#share").onclick = () => share($("#share-status"));
}
document.querySelectorAll("section h2").forEach(h => { h.classList.add("rv"); reveal(h); });

/* ---------- auth (Supabase Auth REST, no libraries) ---------- */
function getSession() {
  try { const s = JSON.parse(store.get("session")); return s && s.exp > Date.now() ? s : null; } catch (e) { return null; }
}
const setSession = s => store.set("session", JSON.stringify(s));
const clearSession = () => { try { localStorage.removeItem("session"); } catch (e) {} };
const authCall = (path, body, token) => fetch(SUPABASE_URL + "/auth/v1/" + path, {
  method: "POST",
  headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Authorization: "Bearer " + (token || SUPABASE_KEY) },
  body: JSON.stringify(body || {})
});
const toSession = d => ({
  token: d.access_token,
  email: d.user && d.user.email,
  name: (d.user && d.user.user_metadata && d.user.user_metadata.name) || "",
  exp: Date.now() + (d.expires_in || 3600) * 1000
});
async function logout() {
  const s = getSession();
  try { if (s) await authCall("logout", {}, s.token); } catch (e) {}
  clearSession();
}

(function authInit() {
  const link = $("#auth-link"), sess = getSession();
  if (link && sess) {
    link.textContent = "Logout"; link.href = "#";
    link.onclick = async e => { e.preventDefault(); await logout(); location.href = "index.html"; };
  }
  // Prefill forms for logged-in fans
  if (sess) {
    if ($("#e") && !$("#e").value) $("#e").value = sess.email || "";
    if ($("#n") && !$("#n").value) $("#n").value = sess.name || "";
    if ($("#wn") && !$("#wn").value) $("#wn").value = sess.name || "";
  }
  if (!$("#auth-page")) return;

  const st = $("#auth-status"), lf = $("#login-form"), sf = $("#signup-auth-form"), done = $("#auth-done"), tabs = $("#auth-tabs");
  const show = which => {
    lf.hidden = which !== "login"; sf.hidden = which !== "signup";
    $("#tab-login").setAttribute("aria-pressed", which === "login");
    $("#tab-signup").setAttribute("aria-pressed", which === "signup");
    st.textContent = "";
  };
  function refresh() {
    const s = getSession();
    done.hidden = !s; tabs.hidden = !!s;
    if (s) { lf.hidden = true; sf.hidden = true; $("#who").textContent = "You're signed in as " + s.email + "."; }
    else show("login");
  }
  $("#tab-login").onclick = () => show("login");
  $("#tab-signup").onclick = () => show("signup");
  $("#logout").onclick = async () => { await logout(); refresh(); st.textContent = "You've been logged out."; };

  lf.onsubmit = async e => {
    e.preventDefault();
    const email = $("#le").value.trim(), password = $("#lp").value, b = lf.querySelector("button[type=submit]");
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) { st.textContent = "Please enter your email and password."; return; }
    b.disabled = true; st.textContent = "Logging in...";
    try {
      const r = await authCall("token?grant_type=password", { email, password });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.access_token) { setSession(toSession(d)); location.href = "index.html"; return; }
      st.textContent = (r.status === 400 || r.status === 401)
        ? "Incorrect email or password, or your email isn't confirmed yet."
        : "Couldn't log in right now. Please try again.";
    } catch (err) { st.textContent = "Couldn't log in right now. Please try again."; }
    b.disabled = false;
  };

  sf.onsubmit = async e => {
    e.preventDefault();
    const name = $("#sn").value.trim(), email = $("#se").value.trim(), password = $("#sp").value, b = sf.querySelector("button[type=submit]");
    if (!name) { st.textContent = "Please enter your name."; return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { st.textContent = "Please enter a valid email."; return; }
    if (password.length < 6) { st.textContent = "Password must be at least 6 characters."; return; }
    b.disabled = true; st.textContent = "Creating your account...";
    try {
      const r = await authCall("signup", { email, password, data: { name } });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        if (d.access_token) { setSession(toSession(d)); location.href = "index.html"; return; }
        st.textContent = "Account created! Check your email to confirm it, then log in.";
        sf.reset();
      } else if (r.status === 422 || /registered|exists/i.test(JSON.stringify(d))) {
        st.textContent = "An account with that email already exists. Try logging in.";
      } else st.textContent = "Couldn't create the account right now. Please try again.";
    } catch (err) { st.textContent = "Couldn't create the account right now. Please try again."; }
    b.disabled = false;
  };

  $("#forgot").onclick = async () => {
    const email = $("#le").value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { st.textContent = "Type your email above first, then click Forgot password."; return; }
    try { await authCall("recover", { email }); st.textContent = "If that email has an account, a reset link is on its way."; }
    catch (err) { st.textContent = "Couldn't send the reset link right now."; }
  };
  refresh();
})();
