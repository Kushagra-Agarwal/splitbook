/* Splitbook PDF: a tiny dependency-free PDF writer (Helvetica, WinAnsi) and the account report layout.
   Exposes window.SplitbookPDF.accountReport(report) -> Uint8Array. */
(function () {
  "use strict";

  // Helvetica / Helvetica-Bold advance widths (1/1000 em) for codes 32–126 and 160–255.
  const W = {
    r: [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584],
    rHi: [278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500],
    b: [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584],
    bHi: [278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556]
  };
  // WinAnsi extras outside Latin-1, with their byte and width.
  const EXTRA = { "€": [0x80, 556], "‚": [0x82, 222], "„": [0x84, 333], "…": [0x85, 1000], "•": [0x95, 350], "–": [0x96, 556], "—": [0x97, 1000], "‘": [0x91, 222], "’": [0x92, 222], "“": [0x93, 333], "”": [0x94, 333], "™": [0x99, 1000] };
  const REPLACE = { "−": "-", "₹": "Rs.", " ": " ", " ": " ", "→": "->" };

  /** Converts any string to WinAnsi bytes (as a binary string). Unsupported characters become "?". */
  function encode(str) {
    let out = "";
    for (const ch of String(str)) {
      if (REPLACE[ch] !== undefined) { out += encode(REPLACE[ch]); continue; }
      const c = ch.codePointAt(0);
      if ((c >= 32 && c <= 126) || (c >= 160 && c <= 255)) out += ch;
      else if (EXTRA[ch]) out += String.fromCharCode(EXTRA[ch][0]);
      else out += "?";
    }
    return out;
  }

  function widthOf(bytes, size, bold) {
    let w = 0;
    for (let i = 0; i < bytes.length; i++) {
      const c = bytes.charCodeAt(i);
      if (c >= 32 && c <= 126) w += (bold ? W.b : W.r)[c - 32];
      else if (c >= 160) w += (bold ? W.bHi : W.rHi)[c - 160];
      else {
        const extra = Object.values(EXTRA).find(e => e[0] === c);
        w += extra ? extra[1] : 556;
      }
    }
    return w * size / 1000;
  }

  function fit(bytes, size, bold, maxWidth) {
    if (!maxWidth || widthOf(bytes, size, bold) <= maxWidth) return bytes;
    const ell = "\x85"; // …
    let s = bytes;
    while (s.length > 0 && widthOf(s + ell, size, bold) > maxWidth) s = s.slice(0, -1);
    return s.replace(/\s+$/, "") + ell;
  }

  function hex(color) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color || "#000000");
    return [1, 2, 3].map(i => (parseInt(m[i], 16) / 255).toFixed(3)).join(" ");
  }

  function esc(bytes) { return bytes.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

  /** Minimal page-based PDF document. Coordinates are in points from the top-left corner. */
  class Doc {
    constructor(width, height, info) {
      this.w = width; this.h = height; this.info = info || {};
      this.pages = []; this.ops = null;
    }
    addPage() { this.ops = []; this.pages.push(this.ops); }
    rect(x, y, w, h, color) {
      this.ops.push(`${hex(color)} rg ${x.toFixed(2)} ${(this.h - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    }
    line(x1, y1, x2, y2, color, width) {
      this.ops.push(`${hex(color)} RG ${(width || 0.75).toFixed(2)} w ${x1.toFixed(2)} ${(this.h - y1).toFixed(2)} m ${x2.toFixed(2)} ${(this.h - y2).toFixed(2)} l S`);
    }
    /** Draws text with its baseline at y. opts: size, bold, color, align ("left"|"right"|"center"), maxWidth. */
    text(str, x, y, opts) {
      const o = Object.assign({ size: 9, bold: false, color: "#000000", align: "left" }, opts);
      const bytes = fit(encode(str), o.size, o.bold, o.maxWidth);
      const tw = widthOf(bytes, o.size, o.bold);
      let tx = x;
      if (o.align === "right") tx = x + (o.maxWidth || 0) - tw;
      if (o.align === "center") tx = x + ((o.maxWidth || 0) - tw) / 2;
      this.ops.push(`BT /${o.bold ? "F2" : "F1"} ${o.size} Tf ${hex(o.color)} rg ${tx.toFixed(2)} ${(this.h - y).toFixed(2)} Td (${esc(bytes)}) Tj ET`);
      return tw;
    }
    width(str, size, bold) { return widthOf(encode(str), size, bold); }
    output() {
      const objs = [];
      const add = s => { objs.push(s); return objs.length; };
      const catalog = add(null), pagesObj = add(null);
      const f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
      const f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
      const d = new Date();
      const pad = n => String(n).padStart(2, "0");
      const stamp = `D:${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
      const info = add(`<< /Title (${esc(encode(this.info.title || "Splitbook"))}) /Creator (Splitbook) /Producer (Splitbook) /CreationDate (${stamp}) >>`);
      const kids = [];
      for (const ops of this.pages) {
        const content = ops.join("\n");
        const c = add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
        kids.push(add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${this.w} ${this.h}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`));
      }
      objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
      objs[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
      let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
      const offsets = [];
      objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
      const xref = out.length;
      out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
      offsets.forEach(off => { out += String(off).padStart(10, "0") + " 00000 n \n"; });
      out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
      const bytes = new Uint8Array(out.length);
      for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
      return bytes;
    }
  }

  const INK = { text: "#14262B", muted: "#5D7178", accent: "#0E7C86", head: "#E3EDEF", zebra: "#F5F9FA", total: "#D6EDED", line: "#D3DCDF", credit: "#1E8456", debit: "#C2414B", faint: "#B8C4C8" };

  /**
   * report = { name, kindLabel, people[], rows[{date,title,category,kind,party,amount,shares{person:signed}}],
   *            netPaid{}, balances{}, transfers[{from,to,amount}], money(n), signed(n), dateLabel(d), generated }
   */
  function accountReport(r) {
    const doc = new Doc(842, 595, { title: `${r.name} - Splitbook` }); // A4 landscape
    const M = 36, CW = 842 - M * 2, BOTTOM = 595 - 40;

    // Columns: fixed details, flexible description, one per person.
    const cols = [
      { t: "Date", w: 58, a: "left" }, { t: "Description", w: 150, a: "left" }, { t: "Category", w: 78, a: "left" },
      { t: "Paid / recd by", w: 72, a: "left" }, { t: "Amount", w: 72, a: "right" }
    ];
    const fixed = cols.reduce((s, c) => s + c.w, 0) - cols[1].w;
    const n = Math.max(r.people.length, 1);
    const pw = Math.max(52, Math.min(84, (CW - fixed - 120) / n));
    cols[1].w = Math.max(110, CW - fixed - pw * r.people.length);
    r.people.forEach(p => cols.push({ t: p, w: pw, a: "right" }));
    const natural = cols.reduce((s, c) => s + c.w, 0);
    const scale = Math.min(1, CW / natural);
    cols.forEach(c => { c.w *= scale; });
    const fs = Math.max(6.5, 8.5 * scale), rh = fs + 9;

    let page = 0, y = 0;
    const footer = () => {
      doc.text(`${r.name} · Splitbook`, M, 595 - 20, { size: 7.5, color: INK.muted, maxWidth: 400 });
      doc.text(`Page ${page}`, 842 - M - 100, 595 - 20, { size: 7.5, color: INK.muted, maxWidth: 100, align: "right" });
    };
    const newPage = () => { if (page) footer(); doc.addPage(); page++; y = M; };
    const header = () => {
      doc.rect(M, y, CW, rh + 2, INK.head);
      let x = M;
      cols.forEach(c => { doc.text(c.t.toUpperCase(), x + 4, y + rh - 4, { size: fs - 0.5, bold: true, color: INK.muted, align: c.a, maxWidth: c.w - 8 }); x += c.w; });
      y += rh + 2;
    };
    const row = (cells, opts) => {
      if (y + rh > BOTTOM) { newPage(); header(); }
      if (opts.fill) doc.rect(M, y, CW, rh, opts.fill);
      let x = M;
      cols.forEach((c, i) => {
        const cell = cells[i] || ["", INK.text];
        doc.text(cell[0], x + 4, y + rh - 5, { size: fs, bold: !!opts.bold, color: cell[1], align: c.a, maxWidth: c.w - 8 });
        x += c.w;
      });
      y += rh;
    };

    newPage();
    doc.text(r.name, M, y + 18, { size: 20, bold: true, color: INK.text, maxWidth: CW });
    y += 32;
    const spending = r.rows.filter(x => x.category !== "Settlement");
    const paid = spending.filter(x => x.kind === "debit").reduce((s, x) => s + x.amount, 0);
    const received = spending.filter(x => x.kind === "credit").reduce((s, x) => s + x.amount, 0);
    doc.text(`${r.kindLabel} account · ${spending.length} transaction${spending.length === 1 ? "" : "s"} · ${r.people.length} ${r.people.length === 1 ? "person" : "people"} · Generated ${r.generated}`,
      M, y, { size: 9, color: INK.muted, maxWidth: CW });
    y += 18;
    doc.text(`Total paid ${r.money(paid)}     Total received ${r.money(received)}     Net spend ${r.money(paid - received)}`,
      M, y, { size: 10, bold: true, color: INK.accent, maxWidth: CW });
    y += 16;

    header();
    if (!r.rows.length) row([["", INK.text], ["No transactions yet.", INK.muted]], {});
    r.rows.forEach((t, i) => {
      const cells = [
        [r.dateLabel(t.date), INK.text], [t.title, INK.text], [t.category, INK.muted], [t.party, INK.text],
        [(t.kind === "credit" ? "+" : "") + r.money(t.amount), t.kind === "credit" ? INK.credit : INK.text]
      ];
      r.people.forEach(p => {
        const s = t.shares[p];
        if (s === undefined) cells.push(["–", INK.faint]);
        else cells.push([s < 0 ? "-" + r.money(-s) : r.money(s), s < 0 ? INK.credit : INK.text]);
      });
      row(cells, { fill: i % 2 ? INK.zebra : null });
    });

    doc.line(M, y, M + CW, y, INK.line);
    const net = r.rows.reduce((s, t) => s + (t.kind === "credit" ? -t.amount : t.amount), 0);
    const shareCells = [["", INK.text], ["Each person's share", INK.text], ["", INK.text], ["", INK.text], [r.money(net), INK.text]];
    const paidCells = [["", INK.text], ["Paid (minus received)", INK.text], ["", INK.text], ["", INK.text], ["", INK.text]];
    const balCells = [["", INK.text], ["Balance (+ gets back, - owes)", INK.text], ["", INK.text], ["", INK.text], ["", INK.text]];
    r.people.forEach(p => {
      const share = r.rows.reduce((s, t) => s + (t.shares[p] || 0), 0);
      shareCells.push([r.money(share), INK.text]);
      paidCells.push([r.money(r.netPaid[p] || 0), INK.text]);
      const b = r.balances[p] || 0;
      balCells.push([r.signed(b), b > 0.009 ? INK.credit : b < -0.009 ? INK.debit : INK.muted]);
    });
    row(shareCells, { fill: INK.total, bold: true });
    row(paidCells, {});
    row(balCells, { fill: INK.total, bold: true });

    y += 26;
    if (y + 40 > BOTTOM) newPage();
    doc.text("Settle up", M, y, { size: 12, bold: true, color: INK.text });
    y += 18;
    if (!r.transfers.length) { doc.text("Everyone is square. Nothing to settle.", M, y, { size: 10, color: INK.muted }); y += 16; }
    r.transfers.forEach(t => {
      if (y + 16 > BOTTOM) newPage();
      doc.text(`${t.from} pays ${t.to}`, M, y, { size: 10, color: INK.text, maxWidth: 260 });
      doc.text(r.money(t.amount), M + 260, y, { size: 10, bold: true, color: INK.text, maxWidth: 110, align: "right" });
      y += 16;
    });
    footer();
    return doc.output();
  }

  window.SplitbookPDF = { accountReport, Doc };
})();
