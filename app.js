/* Splitbook PWA — accounts, split entries, balances, dashboard, PDF/CSV export. Data lives in this browser only. */
(() => {
"use strict";

const KEY = "splitbook.data.v2";
const ME = "Me";
const VERSION = "1.0.1";
const NEW_CAT = "__new__";
const $ = s => document.querySelector(s);
const app = $("#app");

/* ---------------- icons ---------------- */
const P = {
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h11v4"/><path d="M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z"/><circle cx="16" cy="14" r="1.1"/>',
  trip: '<path d="M3 12.5 21 4l-5.5 17-3.5-7z"/><path d="M12 14 21 4"/>',
  flat: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  event: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5l-5.3 2.9 1.2-6-4.5-4.1 6-.7z"/>',
  custom: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  food: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3"/><path d="M17 21V3c-2.2 1.5-3 4-3 7s1 4 3 4"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11h11L21 7H6"/>',
  car: '<path d="M5 15v-4l2-5h10l2 5v4"/><rect x="3" y="15" width="18" height="4" rx="1"/><path d="M7 19v2M17 19v2"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="10.5" r="1.8"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 12h18"/>',
  health: '<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
  swap: '<path d="M4 8h15l-4-4M20 16H5l4 4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  addTab: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  pdf: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
};
const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.tag}</svg>`;

const KINDS = {
  trip:    { label: "Trip", icon: "trip", ph: "Goa trip" },
  flat:    { label: "Flat / Home", icon: "flat", ph: "Flat 302" },
  event:   { label: "Event", icon: "event", ph: "Riya's birthday" },
  general: { label: "General", icon: "wallet", ph: "Everyday expenses" },
  custom:  { label: "Other", icon: "custom", ph: "Account name" }
};
const DEFAULT_CATS = [
  ["Food & Dining", "food"], ["Groceries", "cart"], ["Travel", "car"], ["Stay", "bed"], ["Rent", "flat"],
  ["Utilities", "bolt"], ["Shopping", "bag"], ["Entertainment", "film"], ["Health", "health"]
];
const SETTLEMENT = "Settlement";
const catIcon = name => name === SETTLEMENT ? "swap" : (DEFAULT_CATS.find(c => c[0] === name) || [0, "tag"])[1];

/* ---------------- data ---------------- */
function guessCurrency() {
  const region = (navigator.language || "en-IN").split("-")[1] || "";
  const map = { IN: "INR", US: "USD", GB: "GBP", AE: "AED", SG: "SGD", AU: "AUD", CA: "CAD", JP: "JPY", NZ: "NZD", CH: "CHF", SA: "SAR" };
  const euro = ["DE","FR","IT","ES","NL","BE","IE","PT","AT","FI","GR","LU","SK","SI","EE","LV","LT","MT","CY","HR"];
  return map[region] || (euro.includes(region) ? "EUR" : "INR");
}
let db = { accounts: [], entries: [], categories: [], currency: guessCurrency() };
function load() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || "null");
    if (j && Array.isArray(j.accounts) && Array.isArray(j.entries)) db = Object.assign(db, j);
  } catch (e) { /* first run or storage blocked */ }
}
let persistAsked = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast("Couldn't save. Your browser's storage is full or blocked."); }
  if (!persistAsked && navigator.storage && navigator.storage.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const acct = id => db.accounts.find(a => a.id === id);
const entriesOf = id => db.entries.filter(e => e.accountId === id);
const spendingOf = id => entriesOf(id).filter(e => e.category !== SETTLEMENT);
const allCats = () => DEFAULT_CATS.map(c => c[0]).concat(db.categories);

/* ---------------- formatting ---------------- */
let fmtCache = {};
function money(n) {
  // Whole amounts show no decimals (₹1,200); anything with paise/cents shows two (₹1,250.50).
  const v = Math.round(n * 100) / 100, digits = Math.round(Math.abs(v) * 100) % 100 ? 2 : 0;
  const key = db.currency + digits;
  if (!fmtCache[key]) fmtCache[key] = new Intl.NumberFormat(db.currency === "INR" ? "en-IN" : undefined, { style: "currency", currency: db.currency, minimumFractionDigits: digits, maximumFractionDigits: digits });
  return fmtCache[key].format(v);
}
const signed = n => (n > 0.009 ? "+" : n < -0.009 ? "−" : "") + money(Math.abs(n));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
const monthKey = d => d.slice(0, 7);
const monthLabel = k => new Date(k + "-01T00:00:00").toLocaleDateString(undefined, { month: "short", year: "2-digit" });
const dayLabel = d => new Date(d + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const parseAmt = s => { const v = parseFloat(String(s || "").trim().replace(",", ".")); return isFinite(v) ? v : 0; };
const fileBase = name => "Splitbook - " + (String(name).replace(/[\/\\:?%*|"<>]/g, "-").trim() || "account");

/* ---------------- money logic ---------------- */
function sharesOf(e) {
  if (e.shares && Object.keys(e.shares).length) return e.shares;
  const n = (e.split || []).length || 1, out = {};
  const cents = Math.round(e.amount * 100), base = Math.floor(cents / n);
  let rem = cents - base * n;
  (e.split || []).forEach(p => { out[p] = (base + (rem-- > 0 ? 1 : 0)) / 100; });
  return out;
}
// Debit: payer covered everyone → payer is owed. Credit: receiver holds the group's money → receiver owes it out.
function balances(id) {
  const b = {};
  (acct(id)?.people || [ME]).forEach(p => b[p] = 0);
  entriesOf(id).forEach(e => {
    const sign = e.kind === "credit" ? -1 : 1;
    b[e.party] = (b[e.party] || 0) + sign * e.amount;
    for (const [p, a] of Object.entries(sharesOf(e))) b[p] = (b[p] || 0) - sign * a;
  });
  for (const k in b) b[k] = Math.round(b[k] * 100) / 100;
  return b;
}
function settleUp(id) {
  const b = balances(id);
  const by = (a, c) => c.v - a.v || a.p.localeCompare(c.p);
  const debt = Object.entries(b).filter(([, v]) => v < -0.009).map(([p, v]) => ({ p, v: -v })).sort(by);
  const cred = Object.entries(b).filter(([, v]) => v > 0.009).map(([p, v]) => ({ p, v })).sort(by);
  const out = []; let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].v, cred[j].v);
    out.push({ from: debt[i].p, to: cred[j].p, amount: Math.round(x * 100) / 100 });
    debt[i].v -= x; cred[j].v -= x;
    if (debt[i].v < 0.01) i++;
    if (cred[j].v < 0.01) j++;
  }
  return out;
}

/* ---------------- mutations ---------------- */
function createAccount(name, kind) {
  const a = { id: uid(), name: name.trim() || KINDS[kind].ph, kind, people: [ME], createdAt: new Date().toISOString() };
  db.accounts.push(a); save(); return a;
}
function upsertEntry(e) {
  const i = db.entries.findIndex(x => x.id === e.id);
  if (i >= 0) db.entries[i] = e; else db.entries.push(e);
  const a = acct(e.accountId);
  [e.party, ...e.split].forEach(p => { if (!a.people.includes(p)) a.people.push(p); });
  save();
}
function addPerson(id, raw) {
  const name = raw.trim().replace(/\s+/g, " "), a = acct(id);
  if (!name) return false;
  if (a.people.some(p => p.toLowerCase() === name.toLowerCase())) { toast(`${name} is already in this account`); return false; }
  a.people.push(name); save(); return name;
}
const personInUse = (id, p) => entriesOf(id).some(e => e.party === p || e.split.includes(p));
function addCategory(raw) {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return null;
  const existing = allCats().find(c => c.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  db.categories.push(name); save(); return name;
}
function loadSample() {
  const a = { id: uid(), name: "Goa trip (sample)", kind: "trip", people: [ME, "Aarav", "Priya", "Rohan"], createdAt: new Date().toISOString(), sample: true };
  db.accounts.push(a);
  const ago = n => { const d = new Date(); d.setDate(d.getDate() - n); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const all = a.people;
  const mk = (title, amount, days, category, kind, party, split, shares) =>
    ({ id: uid(), accountId: a.id, title, amount, date: ago(days), category, kind, party, split, shares: shares || null, createdAt: new Date().toISOString(), sample: true });
  db.entries.push(
    mk("Villa booking (3 nights)", 9600, 64, "Stay", "debit", ME, all),
    mk("Beach shack dinner", 3240, 63, "Food & Dining", "debit", "Aarav", all),
    mk("Scooter rentals", 1800, 63, "Travel", "debit", "Priya", [ME, "Priya", "Rohan"]),
    mk("Parasailing", 4500, 62, "Entertainment", "debit", "Rohan", [ME, "Aarav", "Rohan"], { [ME]: 1500, Aarav: 1500, Rohan: 1500 }),
    mk("Airport cab", 1380, 61, "Travel", "debit", ME, all),
    mk("Villa deposit refund", 2000, 60, "Stay", "credit", ME, all)
  );
  save(); return a;
}

/* ---------------- UI state & routing ---------------- */
const ui = {
  view: "home", id: null, tab: "add",
  editingId: null, sel: { party: ME, split: new Set([ME]) },
  sort: { key: "date", dir: "desc" }, f: { q: "", kind: "", cat: "", person: "", month: "" },
  confirmDelete: null, confirmSettle: null
};
function route() {
  const m = (location.hash || "").match(/^#\/a\/([\w-]+)(?:\/(add|balances|dashboard))?/);
  const prevId = ui.id;
  if (m && acct(m[1])) {
    ui.view = "account"; ui.id = m[1]; ui.tab = m[2] || "add";
    if (prevId !== ui.id) { ui.editingId = null; ui.f = { q: "", kind: "", cat: "", person: "", month: "" }; ui.confirmDelete = ui.confirmSettle = null; }
  } else { ui.view = "home"; ui.id = null; }
  closeSheet(true);
  render();
  window.scrollTo(0, 0);
}
const go = h => { if (location.hash === h) route(); else location.hash = h; };
const goTab = t => go(`#/a/${ui.id}/${t}`);

function render() {
  if (ui.view === "account") renderAccount(); else renderHome();
}

/* ---------------- home ---------------- */
let installPrompt = null;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function installBanner() {
  let dismissed = false;
  try { dismissed = localStorage.getItem("splitbook.installHint") === "off"; } catch (e) {}
  if (dismissed || isStandalone()) return "";
  if (installPrompt) return `<div class="install">${ic("phone")}<span><b>Install Splitbook</b> for one-tap access and offline use.</span><button class="btn primary sm" id="installBtn">Install</button><button class="x" id="hideInstall" aria-label="Hide">×</button></div>`;
  if (isIOS) return `<div class="install">${ic("phone")}<span><b>Install on your iPhone:</b> tap the Share button, then <b>Add to Home Screen</b>.</span><button class="x" id="hideInstall" aria-label="Hide">×</button></div>`;
  return "";
}
function summary(id) {
  const list = entriesOf(id);
  const paid = list.filter(e => e.kind === "debit" && e.category !== SETTLEMENT).reduce((s, e) => s + e.amount, 0);
  const last = list.reduce((m, e) => (e.createdAt > m ? e.createdAt : m), acct(id).createdAt);
  return { count: list.filter(e => e.category !== SETTLEMENT).length, paid, me: balances(id)[ME] || 0, last };
}
function renderHome() {
  $("#tabs").hidden = true;
  const list = db.accounts.map(a => ({ a, s: summary(a.id) })).sort((x, y) => y.s.last.localeCompare(x.s.last));
  app.innerHTML = `
    <header class="top">
      <h1 class="brand">Split<span>book</span></h1>
      <span class="spacer"></span>
      <button class="iconbtn" id="settingsBtn" aria-label="Settings">${ic("gear")}</button>
      <button class="iconbtn accent" id="newAcct" aria-label="New account">${ic("plus")}</button>
    </header>
    <section class="view">
      ${installBanner()}
      ${list.length ? `
        <div class="eyebrow">Your accounts</div>
        <div class="acct-list">${list.map(({ a, s }) => `
          <button class="acct-card" data-open="${a.id}">
            <span class="kicon">${ic(KINDS[a.kind]?.icon || "custom")}</span>
            <span style="min-width:0;display:grid;gap:2px">
              <span class="name">${esc(a.name)}</span>
              <span class="meta">${KINDS[a.kind]?.label || "Other"} · ${plural(a.people.length, "person", "people")} · ${plural(s.count, "transaction", "transactions")}</span>
            </span>
            <span class="right">
              <span class="num">${money(s.paid)}</span>
              <span class="small ${s.me > 0.009 ? "pos" : s.me < -0.009 ? "neg" : ""}" style="${Math.abs(s.me) < 0.01 ? "color:var(--muted)" : ""}">${s.me > 0.009 ? "You get " + money(s.me) : s.me < -0.009 ? "You owe " + money(-s.me) : "Settled"}</span>
            </span>
          </button>`).join("")}
        </div>
        <p class="hint">Each account keeps its own people, transactions and balances. Open one to add transactions, see who owes whom, or export the split as a PDF.</p>`
      : `
        <div class="panel hero-empty">
          <span class="kicon" style="width:64px;height:64px;border-radius:18px">${ic("people")}</span>
          <h2>Start your first split</h2>
          <p>Create an account for a trip, a flat, an event or everyday expenses. Each account keeps its own people, transactions and balances.</p>
          <div class="row">
            <button class="btn primary" id="newAcct2">New account</button>
            <button class="btn ghost" id="sampleBtn">Try a sample trip</button>
          </div>
        </div>`}
    </section>`;
  app.querySelectorAll("[data-open]").forEach(b => b.onclick = () => go(`#/a/${b.dataset.open}/add`));
  $("#newAcct").onclick = () => accountSheet(null);
  $("#settingsBtn").onclick = settingsSheet;
  const n2 = $("#newAcct2"); if (n2) n2.onclick = () => accountSheet(null);
  const sb = $("#sampleBtn"); if (sb) sb.onclick = () => { const a = loadSample(); go(`#/a/${a.id}/dashboard`); };
  const ib = $("#installBtn"); if (ib) ib.onclick = async () => { installPrompt.prompt(); try { await installPrompt.userChoice; } catch (e) {} installPrompt = null; render(); };
  const hi = $("#hideInstall"); if (hi) hi.onclick = () => { try { localStorage.setItem("splitbook.installHint", "off"); } catch (e) {} render(); };
}

/* ---------------- account shell ---------------- */
function renderAccount() {
  const a = acct(ui.id);
  const tabs = $("#tabs");
  tabs.hidden = false;
  tabs.innerHTML = [["add", "Add", "addTab"], ["balances", "Balances", "people"], ["dashboard", "Dashboard", "chart"]].map(([k, l, i]) =>
    `<button class="tab" role="tab" aria-selected="${ui.tab === k}" data-tab="${k}">${ic(i)}${l}</button>`).join("");
  tabs.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => goTab(b.dataset.tab));

  app.innerHTML = `
    <header class="top">
      <button class="back" id="backBtn">${ic("back").replace("<svg", '<svg width="22" height="22"')}Accounts</button>
      <h1 class="acct">${esc(a.name)}</h1>
      <button class="iconbtn" id="moreBtn" aria-label="Export and account settings">${ic("more")}</button>
    </header>
    <section class="view" id="tabView"></section>`;
  $("#backBtn").onclick = () => go("#/");
  $("#moreBtn").onclick = accountMenuSheet;
  if (ui.tab === "add") renderAddTab();
  else if (ui.tab === "balances") renderBalancesTab();
  else renderDashboardTab();
}

/* ---------------- add tab ---------------- */
function renderAddTab() {
  const a = acct(ui.id);
  $("#tabView").innerHTML = `
    <div class="grid cols">
      <div class="panel">
        <div id="editBanner" class="editing" hidden style="margin-bottom:12px"><span>Editing <b id="editName"></b></span><button type="button" class="link" id="cancelEdit">Cancel</button></div>
        <form id="form" novalidate autocomplete="off">
          <div class="seg" role="radiogroup" aria-label="Entry type">
            <input type="radio" name="kind" id="k-debit" value="debit" checked><label class="d" for="k-debit">Debit · paid</label>
            <input type="radio" name="kind" id="k-credit" value="credit"><label class="c" for="k-credit">Credit · received</label>
          </div>
          <div class="field"><label for="amount">Amount</label>
            <div class="amount"><span id="curSym"></span><input id="amount" inputmode="decimal" placeholder="0" enterkeyhint="next"></div></div>
          <div class="field"><label for="title">What was it for?</label><input id="title" placeholder="Dinner, cab, groceries…" maxlength="80" enterkeyhint="done"></div>
          <div class="row2">
            <div class="field"><label for="date">Date</label><input type="date" id="date"></div>
            <div class="field"><label for="category">Category</label><select id="category"></select></div>
          </div>
          <div class="field" id="newCatRow" hidden>
            <label for="newCat">New category</label>
            <div class="inline"><input class="inp" id="newCat" placeholder="e.g. Fuel, Gifts, Tickets" maxlength="32" enterkeyhint="done"><button type="button" class="btn ghost" id="addCat">Add</button></div>
          </div>
          <div class="field"><span class="lbl" id="partyLbl">Paid by</span><div class="chips" id="partyChips" role="radiogroup" aria-labelledby="partyLbl"></div></div>
          <div class="field"><span class="lbl" id="splitLbl">Split among</span><div class="chips" id="splitChips" aria-labelledby="splitLbl"></div></div>
          <div class="inline"><input class="inp" id="newPerson" placeholder="Add a person to this account" maxlength="24" aria-label="New person name" enterkeyhint="done"><button type="button" class="btn ghost" id="addPersonBtn">Add</button></div>
          <label class="toggle"><input type="checkbox" id="custom"> Split unequally (enter each share)</label>
          <div class="shares" id="shares" hidden></div>
          <div class="hint" id="splitHint"></div>
          <div class="actions"><button type="submit" class="btn primary" id="saveBtn">Save entry</button><button type="button" class="btn ghost" id="resetBtn">Clear</button></div>
        </form>
      </div>
      <div class="panel"><h2>Recent in ${esc(a.name)}</h2><div id="recent"></div></div>
    </div>`;
  $("#curSym").textContent = currencySymbol();
  fillCategorySelect();
  bindForm();
  if (ui.editingId && db.entries.find(e => e.id === ui.editingId)) loadIntoForm(db.entries.find(e => e.id === ui.editingId));
  else resetForm();
  renderRecent();
}
function currencySymbol() {
  try { return (new Intl.NumberFormat(undefined, { style: "currency", currency: db.currency }).formatToParts(0).find(p => p.type === "currency") || {}).value || db.currency; }
  catch (e) { return db.currency; }
}
function fillCategorySelect(selected) {
  const sel = $("#category"), cur = selected ?? sel.value;
  const cats = allCats();
  const extra = cur && cur !== NEW_CAT && !cats.includes(cur) ? [cur] : [];
  sel.innerHTML = cats.concat(extra).map(c => `<option>${esc(c)}</option>`).join("") + `<option value="${NEW_CAT}">＋ New category…</option>`;
  sel.value = cur && (cats.includes(cur) || extra.length || cur === NEW_CAT) ? cur : cats[0];
  $("#newCatRow").hidden = sel.value !== NEW_CAT;
}
const kindVal = () => document.querySelector('input[name="kind"]:checked').value;
function renderChips() {
  const people = acct(ui.id).people;
  $("#partyLbl").textContent = kindVal() === "credit" ? "Received by" : "Paid by";
  $("#partyChips").innerHTML = people.map(p => `<button type="button" class="chip" role="radio" aria-checked="${p === ui.sel.party}" data-p="${esc(p)}">${esc(p)}</button>`).join("");
  $("#splitChips").innerHTML = people.map(p => `<button type="button" class="chip" aria-pressed="${ui.sel.split.has(p)}" data-p="${esc(p)}">${esc(p)}</button>`).join("")
    + (people.length > 1 ? `<button type="button" class="chip ghost" id="allBtn">${ui.sel.split.size === people.length ? "Clear all" : "Everyone"}</button>` : "");
  renderShares();
}
function renderShares() {
  const box = $("#shares"), custom = $("#custom").checked;
  box.hidden = !custom;
  if (custom) {
    const prev = {}; box.querySelectorAll("input").forEach(i => prev[i.dataset.p] = i.value);
    const names = acct(ui.id).people.filter(p => ui.sel.split.has(p));
    box.innerHTML = names.map((p, i) => `<div class="share"><label for="sh-${i}">${esc(p)}</label><input class="inp" id="sh-${i}" data-p="${esc(p)}" inputmode="decimal" placeholder="0" value="${esc(prev[p] ?? "")}"></div>`).join("");
    box.querySelectorAll("input").forEach(i => i.addEventListener("input", updateHint));
  }
  updateHint();
}
const readShares = () => { const o = {}; $("#shares").querySelectorAll("input").forEach(i => o[i.dataset.p] = parseAmt(i.value)); return o; };
function updateHint() {
  const amt = parseAmt($("#amount").value), n = ui.sel.split.size, h = $("#splitHint"), people = acct(ui.id).people;
  h.classList.remove("bad");
  if (!n) { h.textContent = "Pick at least one person to split with."; h.classList.add("bad"); return; }
  if (people.length === 1) { h.textContent = "Only you are in this account so far. Add the people you're splitting with above."; return; }
  if ($("#custom").checked) {
    const left = Math.round((amt - Object.values(readShares()).reduce((a, b) => a + b, 0)) * 100) / 100;
    h.textContent = left === 0 ? "Shares add up to the full amount." : `${money(Math.abs(left))} ${left > 0 ? "still to assign" : "over the amount"}.`;
    if (left !== 0) h.classList.add("bad");
  } else {
    h.textContent = amt ? `${money(amt / n)} each across ${plural(n, "person", "people")}.` : `Split equally across ${plural(n, "person", "people")}.`;
  }
}
function bindForm() {
  const form = $("#form");
  form.addEventListener("change", ev => {
    if (ev.target.name === "kind") renderChips();
    if (ev.target.id === "custom") renderShares();
    if (ev.target.id === "category") { $("#newCatRow").hidden = ev.target.value !== NEW_CAT; if (ev.target.value === NEW_CAT) $("#newCat").focus(); }
  });
  $("#amount").addEventListener("input", updateHint);
  $("#partyChips").onclick = ev => { const b = ev.target.closest("[data-p]"); if (!b) return; ui.sel.party = b.dataset.p; renderChips(); };
  $("#splitChips").onclick = ev => {
    const people = acct(ui.id).people;
    if (ev.target.id === "allBtn") { ui.sel.split = ui.sel.split.size === people.length ? new Set() : new Set(people); renderChips(); return; }
    const b = ev.target.closest("[data-p]"); if (!b) return;
    const p = b.dataset.p; ui.sel.split.has(p) ? ui.sel.split.delete(p) : ui.sel.split.add(p); renderChips();
  };
  const addP = () => { const name = addPerson(ui.id, $("#newPerson").value); if (name) { ui.sel.split.add(name); $("#newPerson").value = ""; renderChips(); } };
  $("#addPersonBtn").onclick = addP;
  $("#newPerson").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addP(); } });
  const addC = () => { const name = addCategory($("#newCat").value); if (name) { $("#newCat").value = ""; fillCategorySelect(name); toast(`Category "${name}" added`); } };
  $("#addCat").onclick = addC;
  $("#newCat").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addC(); } });
  $("#resetBtn").onclick = resetForm;
  $("#cancelEdit").onclick = () => { resetForm(); goTab("dashboard"); };
  form.addEventListener("submit", ev => { ev.preventDefault(); saveForm(); });
}
function resetForm() {
  const a = acct(ui.id);
  ui.editingId = null;
  const cat = $("#category").value;
  $("#form").reset();
  $("#date").value = today();
  fillCategorySelect(cat && cat !== NEW_CAT ? cat : allCats()[0]);
  ui.sel = { party: a.people.includes(ME) ? ME : a.people[0], split: new Set(a.people) };
  $("#editBanner").hidden = true; $("#saveBtn").textContent = "Save entry";
  renderChips();
}
function loadIntoForm(e) {
  ui.editingId = e.id;
  document.getElementById(e.kind === "credit" ? "k-credit" : "k-debit").checked = true;
  $("#amount").value = e.amount; $("#title").value = e.title; $("#date").value = e.date;
  fillCategorySelect(e.category);
  ui.sel = { party: e.party, split: new Set(e.split) };
  $("#custom").checked = !!(e.shares && Object.keys(e.shares).length);
  renderChips();
  if ($("#custom").checked) { $("#shares").querySelectorAll("input").forEach(i => i.value = e.shares[i.dataset.p] ?? ""); updateHint(); }
  $("#editName").textContent = e.title; $("#editBanner").hidden = false; $("#saveBtn").textContent = "Update entry";
}
function saveForm() {
  let category = $("#category").value;
  if (category === NEW_CAT) {
    const name = addCategory($("#newCat").value);
    if (!name) { toast("Type a name for the new category"); $("#newCat").focus(); return; }
    category = name; fillCategorySelect(name);
  }
  const amount = Math.round(parseAmt($("#amount").value) * 100) / 100, title = $("#title").value.trim();
  if (amount <= 0) { toast("Enter an amount above zero"); $("#amount").focus(); return; }
  if (!title) { toast("Add a short description"); $("#title").focus(); return; }
  if (!ui.sel.split.size) { toast("Choose who to split with"); return; }
  const people = acct(ui.id).people, split = people.filter(p => ui.sel.split.has(p));
  let shares = null;
  if ($("#custom").checked) {
    shares = {}; const s = readShares(); split.forEach(p => shares[p] = s[p] || 0);
    if (Math.abs(Object.values(shares).reduce((x, y) => x + y, 0) - amount) > 0.009) { toast(`Shares must add up to ${money(amount)}`); return; }
  }
  const prev = db.entries.find(e => e.id === ui.editingId);
  const e = { id: prev ? prev.id : uid(), accountId: ui.id, title, amount, date: $("#date").value || today(), category,
    kind: kindVal(), party: ui.sel.party, split, shares, createdAt: prev ? prev.createdAt : new Date().toISOString(), sample: prev ? !!prev.sample : false };
  upsertEntry(e);
  toast(prev ? "Entry updated" : "Entry saved");
  if (prev) { ui.editingId = null; goTab("dashboard"); return; }
  resetForm(); renderRecent();
}
function renderRecent() {
  const list = entriesOf(ui.id).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  $("#recent").innerHTML = list.length ? `<div class="entries">${list.map(e => entryRow(e, false)).join("")}</div>` : `<div class="empty">Nothing yet. Transactions you save in this account show up here.</div>`;
}
function entryRow(e, withActions) {
  const sh = sharesOf(e);
  const confirm = ui.confirmDelete === e.id;
  return `<div class="entry" data-id="${e.id}">
    <span class="ci">${ic(catIcon(e.category))}</span>
    <div style="min-width:0"><div class="t">${esc(e.title)}${e.kind === "credit" ? '<span class="pill c">CREDIT</span>' : ""}${e.sample ? '<span class="pill s">SAMPLE</span>' : ""}</div>
      <div class="m">${dayLabel(e.date)} · ${esc(e.party)} ${e.kind === "credit" ? "received" : "paid"} · ${esc(e.category)}</div></div>
    <div class="amt num ${e.kind === "credit" ? "pos" : ""}">${e.kind === "credit" ? "+" : ""}${money(e.amount)}</div>
    <div class="sp">${Object.entries(sh).map(([p, v]) => `${esc(p)} ${money(v)}`).join(" · ")}</div>
    ${withActions ? `<div class="acts">${confirm
      ? `Delete this entry? <button class="link danger" data-act="yes">Delete</button><button class="link" data-act="no">Keep</button>`
      : `<button class="link" data-act="edit">Edit</button><button class="link danger" data-act="del">Delete</button>`}</div>` : ""}
  </div>`;
}

/* ---------------- balances tab ---------------- */
function renderBalancesTab() {
  const id = ui.id, list = entriesOf(id);
  if (!list.length) {
    $("#tabView").innerHTML = `<div class="panel"><h2>Who owes whom</h2><div class="empty">Add a transaction on the Add tab and balances will appear here.</div><button class="btn primary" id="toAdd" style="margin-top:8px">Add a transaction</button></div>`;
    $("#toAdd").onclick = () => goTab("add"); return;
  }
  const b = balances(id), names = Object.keys(b).sort((x, y) => b[y] - b[x] || x.localeCompare(y));
  const max = Math.max(1, ...names.map(p => Math.abs(b[p])));
  const tx = settleUp(id);
  $("#tabView").innerHTML = `
    <div class="grid cols">
      <div class="panel"><h2>Who owes whom</h2>
        ${names.map(p => { const v = b[p], w = Math.abs(v) / max * 50;
          return `<div class="bal-row"><div>${esc(p)} <span class="hint">${v > 0.009 ? "gets back" : v < -0.009 ? "owes" : "settled"}</span></div>
            <div class="num ${v > 0.009 ? "pos" : v < -0.009 ? "neg" : ""}">${signed(v)}</div>
            <div class="bal-bar" aria-hidden="true"><i style="left:${v >= 0 ? 50 : 50 - w}%;width:${w}%;background:var(${v >= 0 ? "--credit" : "--debit"})"></i><i style="left:50%;width:1px;background:var(--line)"></i></div></div>`; }).join("")}
      </div>
      <div class="panel"><h2>${tx.length ? `Settle up in ${plural(tx.length, "payment", "payments")}` : "Settle up"}</h2>
        <div class="settle">${tx.length ? tx.map((t, i) => `
          <div class="tx"><b>${esc(t.from)}</b><span class="arrow">pays →</span><b>${esc(t.to)}</b><span class="num">${money(t.amount)}</span>
            <span style="flex-basis:100%;display:flex;justify-content:flex-end;gap:6px;align-items:center;font-size:13px">${ui.confirmSettle === i
              ? `Record this payment? <button class="link" data-settle-yes="${i}">Yes, record</button><button class="link" data-settle-no>Cancel</button>`
              : `<button class="link" data-settle="${i}">Mark paid</button>`}</span></div>`).join("")
          : `<div class="tx">Everyone is square. Nothing to settle.</div>`}</div>
        ${tx.length ? `<p class="hint" style="margin:10px 0 0">After someone pays, tap Mark paid. It's saved as a settlement transaction and the balances update.</p>` : ""}
      </div>
    </div>`;
  $("#tabView").onclick = ev => {
    const s = ev.target.closest("[data-settle]"), y = ev.target.closest("[data-settle-yes]"), n = ev.target.closest("[data-settle-no]");
    if (s) { ui.confirmSettle = +s.dataset.settle; renderBalancesTab(); }
    if (n) { ui.confirmSettle = null; renderBalancesTab(); }
    if (y) {
      const t = tx[+y.dataset.settleYes];
      upsertEntry({ id: uid(), accountId: id, title: `${t.from} paid ${t.to}`, amount: t.amount, date: today(), category: SETTLEMENT,
        kind: "debit", party: t.from, split: [t.to], shares: null, createdAt: new Date().toISOString() });
      ui.confirmSettle = null; toast("Payment recorded"); renderBalancesTab();
    }
  };
}

/* ---------------- dashboard tab ---------------- */
function renderDashboardTab() {
  const id = ui.id, all = entriesOf(id);
  if (!all.length) {
    $("#tabView").innerHTML = `<div class="panel"><h2>Dashboard</h2><div class="empty">No transactions yet. Add the first one and totals, charts and the full list will appear here.</div><button class="btn primary" id="toAdd" style="margin-top:8px">Add a transaction</button></div>`;
    $("#toAdd").onclick = () => goTab("add"); return;
  }
  const spend = spendingOf(id), deb = spend.filter(e => e.kind === "debit"), cre = spend.filter(e => e.kind === "credit");
  const sum = a => a.reduce((s, e) => s + e.amount, 0);
  const myBal = balances(id)[ME] || 0;
  const myShare = spend.reduce((s, e) => { const v = sharesOf(e)[ME] || 0; return s + (e.kind === "debit" ? v : -v); }, 0);
  const mk = monthKey(today());
  const people = acct(id).people;
  $("#tabView").innerHTML = `
    <div class="kpis">
      ${kpi("Total paid", money(sum(deb)), plural(deb.length, "debit", "debits"))}
      ${kpi("Received", money(sum(cre)), plural(cre.length, "credit", "credits"))}
      ${kpi("Paid this month", money(sum(deb.filter(e => monthKey(e.date) === mk))), new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }))}
      ${kpi("Your balance", `<span class="${myBal > 0.009 ? "pos" : myBal < -0.009 ? "neg" : ""}">${signed(myBal)}</span>`, `Your own share: ${money(myShare)}`)}
    </div>
    <div class="grid cols">
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap"><h2>By month</h2>
          <div class="legend"><span><i style="background:var(--debit)"></i>Paid</span><span><i style="background:var(--credit)"></i>Received</span></div></div>
        <div id="monthly">${monthlyChart(spend)}</div>
      </div>
      <div class="panel"><h2>Spend by category</h2><div class="cats">${categoryBars(deb)}</div></div>
    </div>
    <div class="panel">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <h2 style="margin:0">Transactions</h2>
        <button class="btn ghost sm" id="pdfBtn">${ic("pdf").replace("<svg", '<svg width="16" height="16" style="vertical-align:-3px;margin-right:6px"')}Export PDF</button>
      </div>
      <div class="toolbar">
        <input id="q" type="search" placeholder="Search title, person or category" aria-label="Search transactions" value="${esc(ui.f.q)}">
        <select id="fKind" aria-label="Filter by type"><option value="">All types</option><option value="debit">Debits</option><option value="credit">Credits</option></select>
        <select id="fCat" aria-label="Filter by category"><option value="">All categories</option>${[...new Set(all.map(e => e.category))].sort().map(c => `<option>${esc(c)}</option>`).join("")}</select>
        <select id="fPerson" aria-label="Filter by person"><option value="">Everyone</option>${people.map(p => `<option>${esc(p)}</option>`).join("")}</select>
        <select id="fMonth" aria-label="Filter by month"><option value="">All months</option>${[...new Set(all.map(e => monthKey(e.date)))].sort().reverse().map(m => `<option value="${m}">${monthLabel(m)}</option>`).join("")}</select>
      </div>
      <div class="sortbar" id="sortbar"></div>
      <div class="entries" id="entries"></div>
      <div class="foot"><span id="countNote"></span><span>Tap Edit to change a transaction.</span></div>
    </div>`;
  ["fKind", "fCat", "fPerson", "fMonth"].forEach((k, i) => { const el = $("#" + k); el.value = ui.f[["kind", "cat", "person", "month"][i]]; });
  $("#q").addEventListener("input", e => { ui.f.q = e.target.value; renderEntries(); });
  [["fKind", "kind"], ["fCat", "cat"], ["fPerson", "person"], ["fMonth", "month"]].forEach(([el, k]) => $("#" + el).addEventListener("change", e => { ui.f[k] = e.target.value; renderEntries(); }));
  $("#pdfBtn").onclick = exportPDF;
  $("#sortbar").onclick = ev => {
    const b = ev.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k;
    ui.sort = ui.sort.key === k ? { key: k, dir: ui.sort.dir === "asc" ? "desc" : "asc" } : { key: k, dir: k === "date" || k === "amount" ? "desc" : "asc" };
    renderEntries();
  };
  $("#entries").onclick = ev => {
    const b = ev.target.closest("[data-act]"); if (!b) return;
    const eid = b.closest("[data-id]").dataset.id;
    if (b.dataset.act === "edit") { ui.editingId = eid; goTab("add"); }
    if (b.dataset.act === "del") { ui.confirmDelete = eid; renderEntries(); }
    if (b.dataset.act === "no") { ui.confirmDelete = null; renderEntries(); }
    if (b.dataset.act === "yes") { db.entries = db.entries.filter(e => e.id !== eid); save(); ui.confirmDelete = null; toast("Entry deleted"); renderDashboardTab(); }
  };
  renderEntries();
}
const kpi = (l, v, s) => `<div class="kpi"><div class="eyebrow">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
function renderEntries() {
  const SORTS = [["date", "Date"], ["amount", "Amount"], ["title", "Description"], ["category", "Category"], ["party", "Person"]];
  $("#sortbar").innerHTML = "Sort:" + SORTS.map(([k, l]) => `<button class="chip" aria-pressed="${ui.sort.key === k}" data-k="${k}">${l}${ui.sort.key === k ? (ui.sort.dir === "asc" ? " ↑" : " ↓") : ""}</button>`).join("");
  const { q, kind, cat, person, month } = ui.f, ql = q.trim().toLowerCase();
  const all = entriesOf(ui.id);
  const list = all.filter(e => (!kind || e.kind === kind) && (!cat || e.category === cat) && (!person || e.party === person || e.split.includes(person))
    && (!month || monthKey(e.date) === month)
    && (!ql || [e.title, e.party, e.category, ...e.split].some(s => s.toLowerCase().includes(ql))));
  const d = ui.sort.dir === "asc" ? 1 : -1, k = ui.sort.key;
  list.sort((a, b) => (k === "amount" ? a.amount - b.amount : String(a[k]).localeCompare(String(b[k]))) * d || b.createdAt.localeCompare(a.createdAt));
  $("#entries").innerHTML = list.length ? list.map(e => entryRow(e, true)).join("") : `<div class="empty">No transactions match these filters.</div>`;
  const net = list.reduce((s, e) => s + (e.kind === "credit" ? -e.amount : e.amount), 0);
  $("#countNote").innerHTML = `${list.length} of ${all.length} · net <span class="num">${money(net)}</span>`;
}
function monthlyChart(list) {
  const months = {};
  list.forEach(e => { const k = monthKey(e.date); months[k] = months[k] || { d: 0, c: 0 }; months[k][e.kind === "credit" ? "c" : "d"] += e.amount; });
  const keys = Object.keys(months).sort().slice(-6);
  if (!keys.length) return `<div class="empty">Monthly totals appear once you add transactions.</div>`;
  const W = 520, H = 220, L = 52, B = 26, T = 10, R = 8, max = Math.max(...keys.flatMap(k => [months[k].d, months[k].c]), 1);
  const nice = x => { const p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  const step = nice(max / 4), top = Math.ceil(max / step) * step, y = v => T + (H - T - B) * (1 - v / top);
  const short = v => v >= 1e5 ? (v / 1e5).toFixed(v % 1e5 ? 1 : 0) + "L" : v >= 1e3 ? (v / 1e3).toFixed(v % 1e3 ? 1 : 0) + "k" : String(Math.round(v));
  const bw = (W - L - R) / keys.length, b = Math.min(28, bw * 0.32);
  let g = "";
  for (let v = 0; v <= top + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${short(v)}</text>`;
  keys.forEach((k, i) => {
    const cx = L + bw * i + bw / 2, m = months[k];
    g += `<rect x="${cx - b - 2}" y="${y(m.d)}" width="${b}" height="${y(0) - y(m.d)}" rx="4" fill="var(--debit)"><title>${monthLabel(k)}: paid ${money(m.d)}</title></rect>`;
    g += `<rect x="${cx + 2}" y="${y(m.c)}" width="${b}" height="${y(0) - y(m.c)}" rx="4" fill="var(--credit)"><title>${monthLabel(k)}: received ${money(m.c)}</title></rect>`;
    g += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${monthLabel(k)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Paid and received per month">${g}</svg>`;
}
function categoryBars(debits) {
  const t = {}; debits.forEach(e => t[e.category] = (t[e.category] || 0) + e.amount);
  const rows = Object.entries(t).sort((a, b) => b[1] - a[1]), total = rows.reduce((s, r) => s + r[1], 0), max = rows[0]?.[1] || 1;
  return rows.length ? rows.map(([c, v]) => `<div class="cat"><span>${esc(c)}</span><div class="track"><div class="fill" style="width:${v / max * 100}%"></div></div><span class="num">${money(v)} <span class="hint">${Math.round(v / total * 100)}%</span></span></div>`).join("")
    : `<div class="empty">Category totals appear once you add debits.</div>`;
}

/* ---------------- exports ---------------- */
function shareOrDownload(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: name }).catch(err => { if (err && err.name !== "AbortError") download(blob, name); });
    return;
  }
  download(blob, name);
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast(`Saved ${name}`);
}
function buildReport(id) {
  const a = acct(id);
  const rows = entriesOf(id).sort((x, y) => x.date.localeCompare(y.date) || x.createdAt.localeCompare(y.createdAt)).map(e => {
    const sign = e.kind === "credit" ? -1 : 1, sh = {};
    for (const [p, v] of Object.entries(sharesOf(e))) sh[p] = v * sign;
    return { date: e.date, title: e.title, category: e.category, kind: e.kind, party: e.party, amount: e.amount, shares: sh };
  });
  const netPaid = {};
  entriesOf(id).forEach(e => netPaid[e.party] = (netPaid[e.party] || 0) + (e.kind === "credit" ? -e.amount : e.amount));
  return {
    name: a.name, kindLabel: KINDS[a.kind]?.label || "Other", people: a.people, rows, netPaid,
    balances: balances(id), transfers: settleUp(id), money: n => money(n), signed: n => signed(n).replace("−", "-"),
    dateLabel: d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
    generated: new Date().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
  };
}
function exportPDF() {
  try {
    const bytes = window.SplitbookPDF.accountReport(buildReport(ui.id));
    shareOrDownload(new Blob([bytes], { type: "application/pdf" }), fileBase(acct(ui.id).name) + ".pdf");
  } catch (e) { console.error(e); toast("Couldn't create the PDF. Please try again."); }
}
function exportCSV() {
  const a = acct(ui.id), q = s => `"${String(s).replace(/"/g, '""')}"`;
  const head = ["Date", "Description", "Category", "Type", "Paid or received by", `Amount (${db.currency})`, ...a.people.map(p => `${p} share`)];
  const lines = [head.map(q).join(",")];
  entriesOf(a.id).sort((x, y) => x.date.localeCompare(y.date)).forEach(e => {
    const sh = sharesOf(e), sign = e.kind === "credit" ? -1 : 1;
    lines.push([e.date, q(e.title), q(e.category), e.kind === "credit" ? "Credit" : "Debit", q(e.party), e.amount.toFixed(2),
      ...a.people.map(p => sh[p] !== undefined ? (sh[p] * sign).toFixed(2) : "")].join(","));
  });
  shareOrDownload(new Blob(["﻿" + lines.join("\n")], { type: "text/csv" }), fileBase(a.name) + ".csv");
}

/* ---------------- sheets ---------------- */
let sheetReturnFocus = null;
function openSheet(html) {
  sheetReturnFocus = document.activeElement;
  const s = $("#sheet");
  s.innerHTML = `<div class="grab"></div>${html}`;
  s.hidden = false; $("#sheetBackdrop").hidden = false;
  document.body.style.overflow = "hidden";
  const f = s.querySelector("input,select,button:not(.x)"); if (f && !matchMedia("(pointer: coarse)").matches) f.focus();
  return s;
}
function closeSheet(silent) {
  const s = $("#sheet");
  if (s.hidden) return;
  s.hidden = true; $("#sheetBackdrop").hidden = true; s.innerHTML = "";
  document.body.style.overflow = "";
  if (!silent && sheetReturnFocus && sheetReturnFocus.focus) sheetReturnFocus.focus();
}
$("#sheetBackdrop").onclick = () => closeSheet();
document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
const sheetHead = title => `<div class="sh"><h2 id="sheetTitle">${title}</h2><button class="link" data-close>Done</button></div>`;

function kindPicker(selected) {
  return `<div class="kinds" role="radiogroup" aria-label="Account type">${Object.entries(KINDS).map(([k, v]) =>
    `<button type="button" class="kind" role="radio" aria-checked="${k === selected}" data-kind="${k}">${ic(v.icon)}${v.label}</button>`).join("")}</div>`;
}
function accountSheet(existing) {
  let kind = existing ? existing.kind : "trip";
  const s = openSheet(`${sheetHead(existing ? "Edit account" : "New account")}
    <section><div class="eyebrow">What is this split for?</div>${kindPicker(kind)}</section>
    <section><label class="eyebrow" for="acctName">Name</label><input class="inp" id="acctName" maxlength="40" placeholder="${esc(KINDS[kind].ph)}" value="${esc(existing ? existing.name : "")}" enterkeyhint="done">
      ${existing ? "" : `<p class="hint" style="margin:0">The account starts with just you. Add friends or flatmates when you add the first transaction.</p>`}
      <button class="btn primary" id="acctSave">${existing ? "Save" : "Create account"}</button></section>`);
  s.querySelector("[data-close]").onclick = () => closeSheet();
  s.querySelector(".kinds").onclick = ev => {
    const b = ev.target.closest("[data-kind]"); if (!b) return; kind = b.dataset.kind;
    s.querySelectorAll("[data-kind]").forEach(x => x.setAttribute("aria-checked", x.dataset.kind === kind));
    $("#acctName").placeholder = KINDS[kind].ph;
  };
  const submit = () => {
    const name = $("#acctName").value;
    if (existing) { existing.name = name.trim() || existing.name; existing.kind = kind; save(); closeSheet(); render(); toast("Account updated"); }
    else { const a = createAccount(name, kind); closeSheet(true); go(`#/a/${a.id}/add`); toast(`${a.name} created`); }
  };
  $("#acctSave").onclick = submit;
  $("#acctName").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
}
function accountMenuSheet() {
  const a = acct(ui.id);
  let confirmDel = false;
  const draw = () => {
    const s = openSheet(`${sheetHead(esc(a.name))}
      <section><div class="menu">
        <button id="mPdf">${ic("pdf")}Export split as PDF</button>
        <button id="mCsv">${ic("table")}Export transactions as CSV</button>
        <button id="mEdit">${ic(KINDS[a.kind]?.icon || "custom")}Rename or change type</button>
      </div></section>
      <section><div class="eyebrow">People in this account</div>
        <div class="plist">${a.people.map(p => `<div class="prow">${esc(p)}${p === ME ? '<span class="tag">You</span>' : personInUse(a.id, p) ? '<span class="tag">In transactions</span>' : `<button class="link danger" style="margin-left:auto" data-rm="${esc(p)}">Remove</button>`}</div>`).join("")}</div>
        <div class="inline"><input class="inp" id="mPerson" placeholder="Add a person" maxlength="24" enterkeyhint="done"><button class="btn ghost" id="mAddP">Add</button></div>
      </section>
      <section>${confirmDel
        ? `<p style="margin:0">Delete <b>${esc(a.name)}</b> and its ${plural(entriesOf(a.id).length, "transaction", "transactions")}? This can't be undone.</p><div class="actions"><button class="btn danger" id="mDelYes">Delete account</button><button class="btn ghost" id="mDelNo">Cancel</button></div>`
        : `<div class="menu"><button class="danger" id="mDel">${ic("trash")}Delete this account</button></div>`}</section>`);
    s.querySelector("[data-close]").onclick = () => closeSheet();
    $("#mPdf").onclick = () => { exportPDF(); };
    $("#mCsv").onclick = () => { exportCSV(); };
    $("#mEdit").onclick = () => { closeSheet(true); accountSheet(a); };
    s.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { a.people = a.people.filter(p => p !== b.dataset.rm); save(); draw(); render(); });
    const addP = () => { if (addPerson(a.id, $("#mPerson").value)) { draw(); render(); } };
    $("#mAddP").onclick = addP;
    $("#mPerson").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addP(); } });
    if (confirmDel) {
      $("#mDelYes").onclick = () => { db.accounts = db.accounts.filter(x => x.id !== a.id); db.entries = db.entries.filter(e => e.accountId !== a.id); save(); closeSheet(true); go("#/"); toast("Account deleted"); };
      $("#mDelNo").onclick = () => { confirmDel = false; draw(); };
    } else $("#mDel").onclick = () => { confirmDel = true; draw(); };
  };
  draw();
}
function settingsSheet() {
  let confirmWipe = false, pendingImport = null;
  const currencies = [...new Set(["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY", "CHF", "SAR", "NZD", db.currency])].sort();
  let names; try { names = new Intl.DisplayNames(undefined, { type: "currency" }); } catch (e) { names = null; }
  const draw = () => {
    const s = openSheet(`${sheetHead("Settings")}
      <section><label class="eyebrow" for="sCur">Currency</label>
        <select class="inp" id="sCur">${currencies.map(c => `<option value="${c}" ${c === db.currency ? "selected" : ""}>${c} · ${esc(names ? names.of(c) : c)}</option>`).join("")}</select></section>
      <section><div class="eyebrow">Your categories</div>
        ${db.categories.length ? `<div class="plist">${db.categories.map(c => `<div class="prow">${esc(c)}${db.entries.some(e => e.category === c) ? '<span class="tag">In use</span>' : `<button class="link danger" style="margin-left:auto" data-rmcat="${esc(c)}">Remove</button>`}</div>`).join("")}</div>`
          : `<p class="hint" style="margin:0">No custom categories yet. Add one here, or choose "New category…" while adding a transaction.</p>`}
        <div class="inline"><input class="inp" id="sCat" placeholder="New category" maxlength="32" enterkeyhint="done"><button class="btn ghost" id="sAddCat">Add</button></div></section>
      <section><div class="eyebrow">Backup</div>
        <p class="hint" style="margin:0">Your data is stored only in this browser. Save a backup file now and then, and use it to move to another phone or computer.</p>
        <div class="menu"><button id="sBackup">${ic("download")}Save a backup file</button><button id="sRestore">${ic("upload")}Restore from a backup file</button></div>
        <input type="file" id="sFile" accept="application/json,.json" hidden>
        ${pendingImport ? `<p style="margin:0">Replace everything on this device with the backup (${plural(pendingImport.accounts.length, "account", "accounts")}, ${plural(pendingImport.entries.length, "transaction", "transactions")})?</p>
          <div class="actions"><button class="btn primary" id="sImpYes">Replace my data</button><button class="btn ghost" id="sImpNo">Cancel</button></div>` : ""}
      </section>
      ${installPrompt ? `<section><div class="menu"><button id="sInstall">${ic("phone")}Install Splitbook as an app</button></div></section>` : ""}
      <section>${confirmWipe
        ? `<p style="margin:0">Delete every account and transaction on this device? This can't be undone.</p><div class="actions"><button class="btn danger" id="sWipeYes">Delete all data</button><button class="btn ghost" id="sWipeNo">Cancel</button></div>`
        : `<div class="menu"><button class="danger" id="sWipe">${ic("trash")}Delete all data</button></div>`}
        <p class="hint" style="margin:0">Splitbook ${VERSION}. No account, no ads, no tracking. Everything stays on this device.</p></section>`);
    s.querySelector("[data-close]").onclick = () => closeSheet();
    $("#sCur").onchange = e => { db.currency = e.target.value; fmtCache = {}; save(); render(); };
    s.querySelectorAll("[data-rmcat]").forEach(b => b.onclick = () => { db.categories = db.categories.filter(c => c !== b.dataset.rmcat); save(); draw(); });
    const addC = () => { if (addCategory($("#sCat").value)) draw(); };
    $("#sAddCat").onclick = addC;
    $("#sCat").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addC(); } });
    $("#sBackup").onclick = () => shareOrDownload(new Blob([JSON.stringify({ app: "splitbook", version: 2, savedAt: new Date().toISOString(), data: db }, null, 1)], { type: "application/json" }), `Splitbook backup ${today()}.json`);
    $("#sRestore").onclick = () => $("#sFile").click();
    $("#sFile").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text()), d = j.data || j;
        if (!Array.isArray(d.accounts) || !Array.isArray(d.entries)) throw new Error("bad");
        pendingImport = d; draw();
      } catch (err) { toast("That file isn't a Splitbook backup."); }
    };
    if (pendingImport) {
      $("#sImpYes").onclick = () => { db = Object.assign({ accounts: [], entries: [], categories: [], currency: db.currency }, pendingImport); fmtCache = {}; save(); pendingImport = null; closeSheet(true); go("#/"); toast("Backup restored"); };
      $("#sImpNo").onclick = () => { pendingImport = null; draw(); };
    }
    const si = $("#sInstall"); if (si) si.onclick = async () => { installPrompt.prompt(); try { await installPrompt.userChoice; } catch (e) {} installPrompt = null; draw(); };
    if (confirmWipe) {
      $("#sWipeYes").onclick = () => { db = { accounts: [], entries: [], categories: [], currency: db.currency }; save(); closeSheet(true); go("#/"); toast("All data deleted"); };
      $("#sWipeNo").onclick = () => { confirmWipe = false; draw(); };
    } else $("#sWipe").onclick = () => { confirmWipe = true; draw(); };
  };
  draw();
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(msg, action) {
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action.label)}</button>` : ""}`;
  if (action) el.querySelector("button").onclick = action.run;
  el.classList.add("on"); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), action ? 10000 : 2400);
}

/* ---------------- PWA plumbing ---------------- */
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; if (ui.view === "home") render(); });
window.addEventListener("appinstalled", () => { installPrompt = null; toast("Splitbook installed"); });
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      reg.addEventListener("updatefound", () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller)
            toast("A new version of Splitbook is ready", { label: "Update", run: () => w.postMessage("skipWaiting") });
        });
      });
    }).catch(() => {});
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
  });
}
window.addEventListener("storage", e => { if (e.key === KEY) { load(); render(); } });

load();
window.addEventListener("hashchange", route);
route();
})();
