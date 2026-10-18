/* Cockpit als Zeichnung: Glareshield, Hauptpanel, Pedestal und oberes Overhead.
   Anordnung nach Fotos und Ansichten des echten A320, alles selbst gezeichnet. Werte sind Übungswerte, kein Sim. */
window.VpACockpit = (function () {
  var A, S, N, CL = 0;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function pad(n, w) { n = String(Math.abs(Math.round(n))); while (n.length < w) n = '0' + n; return n; }
  function on() { return A.power(); }
  /* ---------- Grundformen ---------- */
  function T(x, y, s, size, anchor, cls, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 9) + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + (extra || '') + '>' + esc(s) + '</text>'; }
  function R(x, y, w, h, cls, rx, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + ' class="' + cls + '"' + (extra || '') + '/>'; }
  function C(x, y, r, cls, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" class="' + cls + '"' + (extra || '') + '/>'; }
  function L(d, cls) { return '<path d="' + d + '" class="' + cls + '"/>'; }
  function panel(x, y, w, h, title, ts) { return R(x, y, w, h, 'ovpnl', 4) + A.svg.screw(x + 11, y + 11) + A.svg.screw(x + w - 11, y + 11) + A.svg.screw(x + 11, y + h - 11) + A.svg.screw(x + w - 11, y + h - 11) + (title ? T(x + w / 2, y + 20, title, ts || 12, 'middle', 'ovtitle') : ''); }
  function lab(x, y, s, size) { return T(x, y, s, size || 9, 'middle', 'ovlab'); }
  /* Bedienelemente aus dem Overhead (gleiches Aussehen, gleiche Logik) */
  function ctl(c, x, y, label) { A.reg(c); return (label === false ? '' : lab(x, y - (c.k === 'kn' ? 46 : c.k === 'tg' ? 30 : 30), label || c.lab)) + (c.k === 'kn' ? A.svg.kn(c, x, y) : c.k === 'tg' ? A.svg.tg(c, x, y) : A.svg.pb(c, x, y)); }
  function V(id, d) { return S[id] !== undefined ? S[id] : d; }
  /* Leuchttaste mit frei wählbaren Feldern */
  function lpb(x, y, top, lo, litTop, litLo, act, w) {
    w = w || 46; var h = 46, s = '<g ' + act + '>' + R(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 'ovbez', 3) + R(x - w / 2, y - h / 2, w, h, 'ovcap', 2);
    if (top) s += R(x - w / 2 + 5, y - 19, w - 10, 15, 'ovleg k' + top[1] + (litTop ? ' lit' : ''), 1) + T(x, y - 8, top[0], 8, 'middle', 'ovlt k' + top[1] + (litTop ? ' lit' : ''));
    if (lo) s += R(x - w / 2 + 5, y + 3, w - 10, 15, 'ovleg k' + lo[1] + (litLo ? ' lit' : '') + (lo[1] === 'b' ? ' ovfr' : ''), 1) + T(x, y + 14, lo[0], 8, 'middle', 'ovlt k' + lo[1] + (litLo ? ' lit' : ''));
    return s + '</g>';
  }
  /* Kleine Taste mit grünem Leuchtbalken (EFIS, FCU, RMP, ECAM) */
  function gkey(x, y, w, h, txt, lit, act, size) {
    return '<g ' + act + '>' + R(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 'ovbez', 3) + R(x - w / 2, y - h / 2, w, h, 'ckkey', 2) + R(x - w / 2 + 6, y - h / 2 + 4, w - 12, 3, 'ckbar' + (lit ? ' lit' : ''), 1) + T(x, y + h / 2 - 6, txt, size || 8, 'middle', 'cktx') + '</g>';
  }
  function act(a, k, v, extra) { return 'data-a="' + a + '"' + (k !== undefined ? ' data-k="' + k + '"' : '') + (v !== undefined ? ' data-v="' + v + '"' : '') + (extra || ''); }
  /* Drehknopf zum Verstellen von Werten: linke Hälfte kleiner, rechte größer, Mitte drücken/ziehen */
  function vknob(x, y, r, k, step, center) {
    var s = C(x, y, r + 5, 'ckkring') + C(x, y, r, 'ckknob');
    for (var i = 0; i < 24; i++) { var a = i * 15 * Math.PI / 180; s += '<line x1="' + (x + (r - 4) * Math.cos(a)).toFixed(1) + '" y1="' + (y + (r - 4) * Math.sin(a)).toFixed(1) + '" x2="' + (x + r * Math.cos(a)).toFixed(1) + '" y2="' + (y + r * Math.sin(a)).toFixed(1) + '" class="ckridge"/>'; }
    s += C(x, y, r * 0.45, 'ckknob2');
    s += '<rect x="' + (x - r - 5) + '" y="' + (y - r - 5) + '" width="' + (r + 5) + '" height="' + (2 * r + 10) + '" class="ckhit" ' + act('xcnum', k, -step) + '/>' + '<rect x="' + x + '" y="' + (y - r - 5) + '" width="' + (r + 5) + '" height="' + (2 * r + 10) + '" class="ckhit" ' + act('xcnum', k, step) + '/>';
    if (center) s += '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.45) + '" class="ckhit" ' + act('xcman', k) + '/>';
    s += T(x - r - 9, y + 4, '−', 12, 'middle', 'ckpm') + T(x + r + 9, y + 4, '+', 12, 'middle', 'ckpm');
    return s;
  }
  function lcd(x, y, w, h, txt, size, off) { return R(x, y, w, h, 'cklcd', 3) + (off ? '' : T(x + w / 2, y + h / 2 + size * 0.36, txt, size, 'middle', 'cklcdt')); }
  function lamp(id, x, y, w, h, l1, l2, col) {
    var lit = !!S[id] && on();
    return '<g ' + act('xtog', undefined, undefined, ' data-id="' + id + '"') + '>' + R(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 'ovbez', 4) + R(x - w / 2, y - h / 2, w, h, 'cklamp k' + col + (lit ? ' lit' : ''), 3) + T(x, y + (l2 ? -3 : 4), l1, 11, 'middle', 'ckl k' + col + (lit ? ' lit' : '')) + (l2 ? T(x, y + 11, l2, 11, 'middle', 'ckl k' + col + (lit ? ' lit' : '')) : '') + '</g>';
  }
  function screen(x, y, w, h, inner) { return R(x - 8, y - 8, w + 16, h + 16, 'ckbezel', 6) + '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" overflow="hidden">' + R(0, 0, w, h, 'ckscreen') + (inner || '') + '</svg>'; }
  function sT(x, y, s, size, col, anchor) { return T(x, y, s, size || 12, anchor || 'middle', 'sc s' + ({ c: 'cy' }[col] || col || 'w')); }

  /* ---------- Bildschirme ---------- */
  var HDG0 = 90; /* Kurs des stehenden Flugzeugs (Übung) */
  function ir(side) { return side === 1 ? V('IR1', 0) > 0 : V('IR2', 0) > 0; }
  function adr(side) { var c = A.find(side === 1 ? 'ADR1' : 'ADR2'); return c ? A.val(c) === 1 : true; }
  function pfd(side) {
    var w = 280, h = 280, s = '', id = 'clp' + side + (CL++);
    var fd = side === 1 ? S.FD : S.FFD;
    /* FMA */
    s += '<line x1="0" y1="34" x2="280" y2="34" class="sl"/>';
    [56, 112, 168, 224].forEach(function (x) { s += '<line x1="' + x + '" y1="2" x2="' + x + '" y2="32" class="sl"/>'; });
    var ap = (S.AP1 ? 'AP1' : '') + (S.AP1 && S.AP2 ? '+2' : S.AP2 ? 'AP2' : '');
    if (ap) s += sT(252, 12, ap, 10, 'w');
    if (fd || S.FD || S.FFD) s += sT(252, 22, (S.FD ? '1' : '-') + ' FD ' + (S.FFD ? '2' : '-'), 10, 'w');
    if (S.ATHR) s += sT(252, 32, 'A/THR', 10, N.TLD >= 3 ? 'w' : 'c');
    if (N.TLD === 4) s += sT(28, 14, 'MAN', 10, 'w') + sT(28, 26, 'TOGA', 10, 'w');
    else if (N.TLD === 3) s += sT(28, 14, 'MAN', 10, 'w') + sT(28, 26, 'FLX', 10, 'w');
    if (N.TLD >= 3) s += sT(84, 14, 'SRS', 10, 'g') + sT(84, 26, 'CLB', 10, 'c') + sT(140, 14, 'RWY', 10, 'g') + sT(140, 26, 'NAV', 10, 'c');
    /* Lage */
    if (!ir(side)) { s += R(110, 110, 60, 24, 'sflag') + sT(140, 128, 'ATT', 16, 'r'); }
    else {
      s += '<clipPath id="' + id + '"><rect x="62" y="44" width="156" height="180" rx="14"/></clipPath><g clip-path="url(#' + id + ')"><rect x="40" y="20" width="200" height="114" class="ssky"/><rect x="40" y="134" width="200" height="120" class="sgnd"/><line x1="40" y1="134" x2="240" y2="134" class="shz"/>';
      [-20, -10, 10, 20].forEach(function (p) { var yy = 134 - p * 2.6; s += '<line x1="' + (140 - (Math.abs(p) === 10 ? 22 : 30)) + '" y1="' + yy + '" x2="' + (140 + (Math.abs(p) === 10 ? 22 : 30)) + '" y2="' + yy + '" class="spl"/>' + sT(140 - 42, yy + 4, Math.abs(p), 9, 'w') + sT(140 + 42, yy + 4, Math.abs(p), 9, 'w'); });
      [-5, 5, -15, 15].forEach(function (p) { var yy = 134 - p * 2.6; s += '<line x1="130" y1="' + yy + '" x2="150" y2="' + yy + '" class="spl"/>'; });
      s += '</g>';
      s += '<path d="M90 60 A80 80 0 0 1 190 60" class="sroll"/><path d="M140 48 l-5 -8 h10 z" class="syel"/>';
      s += '<path d="M92 134 h28 v7 h-6 v-3 h-22 z" class="sac"/><path d="M188 134 h-28 v7 h6 v-3 h22 z" class="sac"/><rect x="136" y="130" width="8" height="8" class="sac"/>';
      if (fd) s += '<line x1="140" y1="80" x2="140" y2="190" class="sfd"/><line x1="90" y1="134" x2="190" y2="134" class="sfd"/>';
    }
    /* Geschwindigkeit */
    s += R(6, 44, 46, 180, 'stape');
    if (!adr(side)) s += R(10, 124, 38, 20, 'sflag') + sT(29, 139, 'SPD', 13, 'r');
    else {
      var ias = N.IAS || 0, v0 = Math.max(ias, 30);
      for (var v = Math.floor((v0 - 70) / 10) * 10; v <= v0 + 70; v += 10) { if (v < 30) continue; var yy = 134 - (v - v0) * 1.3; s += '<line x1="40" y1="' + yy + '" x2="52" y2="' + yy + '" class="sl"/>'; if (v % 20 === 0) s += sT(24, yy + 4, pad(v, 3), 10, 'w'); }
      s += '<path d="M44 134 h14" class="syl"/>';
      var sp = N.SPD, sy = 134 - (sp - v0) * 1.3; if (sy > 44 && sy < 224) s += '<path d="M52 ' + sy + ' l7 -6 v12 z" class="' + (N.SPDM ? 'smag' : 'scy') + '"/>'; else s += sT(29, sy < 44 ? 40 : 236, String(sp), 10, N.SPDM ? 'm' : 'c');
    }
    /* Höhe */
    s += R(222, 44, 40, 180, 'stape');
    if (!adr(side)) s += R(224, 124, 36, 20, 'sflag') + sT(242, 139, 'ALT', 13, 'r');
    else {
      var alt = N.ALTI || 0;
      for (var a = Math.floor((alt - 600) / 100) * 100; a <= alt + 600; a += 100) { var ya = 134 - (a - alt) * 0.14; s += '<line x1="222" y1="' + ya + '" x2="230" y2="' + ya + '" class="sl"/>'; if (a % 500 === 0) s += sT(246, ya + 4, pad(a / 100, 3), 10, 'w'); }
      s += R(224, 124, 40, 20, 'sbox') + sT(244, 139, pad(alt, 5), 11, 'g');
      s += sT(242, 40, N.ALT >= 10000 && 0 ? 'FL' + N.ALT / 100 : String(N.ALT), 10, 'c');
      s += R(222, 230, 52, 24, 'sbox2') + (N.STD ? sT(248, 246, 'STD', 11, 'c') : sT(248, 241, 'QNH', 8, 'c') + sT(248, 252, String(N.QNH), 10, 'c'));
    }
    s += '<path d="M268 60 v148" class="sl"/>';
    /* Kurs */
    s += R(62, 236, 156, 26, 'stape');
    if (!ir(side)) s += R(118, 238, 44, 20, 'sflag') + sT(140, 253, 'HDG', 13, 'r');
    else {
      for (var d = HDG0 - 30; d <= HDG0 + 30; d += 5) { var xx = 140 + (d - HDG0) * 2.4, dd = (d + 360) % 360; s += '<line x1="' + xx + '" y1="236" x2="' + xx + '" y2="' + (d % 10 ? 241 : 245) + '" class="sl"/>'; if (d % 10 === 0) s += sT(xx, 256, String(dd / 10), 10, 'w'); }
      s += '<path d="M140 232 v10" class="syl"/>';
      var hx = 140 + (((N.HDG - HDG0 + 540) % 360) - 180) * 2.4; if (!N.HDGM && hx > 62 && hx < 218) s += '<path d="M' + hx + ' 236 l-5 -7 h10 z" class="scy"/>';
    }
    return s;
  }
  function nd(side) {
    var s = '', mode = ['LS', 'VOR', 'NAV', 'ARC', 'PLAN'][V(side === 1 ? 'NDMODE' : 'FNDMODE', 3)], rng = ['10', '20', '40', '80', '160', '320'][V(side === 1 ? 'NDRANGE' : 'FNDRANGE', 3)];
    s += sT(8, 16, 'GS', 10, 'w', 'start') + sT(32, 16, '0', 12, 'g', 'start') + sT(56, 16, 'TAS', 10, 'w', 'start') + sT(88, 16, ir(side) ? '0' : '---', 12, 'g', 'start');
    if (!ir(side)) { s += R(110, 40, 60, 22, 'sflag') + sT(140, 57, 'HDG', 15, 'r') + sT(140, 150, 'MAP NOT AVAIL', 14, 'r'); return s; }
    var cx = 140, cy = mode === 'ARC' ? 238 : 150, r = mode === 'ARC' ? 190 : 104;
    if (mode === 'PLAN') {
      s += C(cx, cy, r, 'sring') + C(cx, cy, r / 2, 'sring2') + sT(cx, cy - r - 6, 'N', 12, 'w') + sT(cx, cy + 4, '+', 14, 'g') + sT(250, 270, rng, 10, 'c');
      return s;
    }
    s += '<g>';
    for (var d = 0; d < 360; d += 5) {
      var a = (d - HDG0 - 90) * Math.PI / 180, x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a), l = d % 10 ? 6 : 11;
      if (y1 < 22 || y1 > 280) continue;
      s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + (cx + (r - l) * Math.cos(a)).toFixed(1) + '" y2="' + (cy + (r - l) * Math.sin(a)).toFixed(1) + '" class="sl"/>';
      if (d % 30 === 0) s += sT((cx + (r - 22) * Math.cos(a)).toFixed(1), (cy + (r - 22) * Math.sin(a) + 4).toFixed(1), String(d / 10), 11, 'w');
    }
    s += '</g>';
    s += mode === 'ARC' ? '<path d="M' + (cx - r / 2 * 0.95) + ' ' + (cy - r / 2 * 0.31) + ' A' + r / 2 + ' ' + r / 2 + ' 0 0 1 ' + (cx + r / 2 * 0.95) + ' ' + (cy - r / 2 * 0.31) + '" class="sring2"/>' + sT(cx - r / 2 + 14, cy - r / 2 * 0.5, String(+rng / 2), 9, 'c') : C(cx, cy, r / 2, 'sring2') + sT(cx - r / 2 - 8, cy + 14, String(+rng / 2), 9, 'c');
    s += '<path d="M' + cx + ' ' + (cy - r - 4) + ' v14" class="syl"/>';
    var ha = (N.HDG - HDG0 - 90) * Math.PI / 180; if (!N.HDGM) s += '<path d="M' + (cx + (r + 2) * Math.cos(ha)).toFixed(1) + ' ' + (cy + (r + 2) * Math.sin(ha)).toFixed(1) + ' l-5 -8 h10 z" class="scy" transform="rotate(' + (N.HDG - HDG0) + ' ' + (cx + (r + 2) * Math.cos(ha)).toFixed(1) + ' ' + (cy + (r + 2) * Math.sin(ha)).toFixed(1) + ')"/>';
    s += '<path d="M' + cx + ' ' + (cy - 12) + ' v26 M' + (cx - 14) + ' ' + (cy - 3) + ' h28 M' + (cx - 6) + ' ' + (cy + 12) + ' h12" class="sacl"/>';
    s += sT(8, 274, side === 1 && V('ADF1', 1) !== 1 ? (V('ADF1', 1) === 0 ? 'ADF1' : 'VOR1') : '', 10, 'w', 'start') + sT(272, 274, side === 1 && V('ADF2', 1) !== 1 ? (V('ADF2', 1) === 0 ? 'ADF2' : 'VOR2') : '', 10, 'w', 'end');
    if (mode !== 'ARC') s += sT(272, 16, mode === 'LS' ? 'ILS' : mode, 10, 'g', 'end');
    return s;
  }
  function gauge(x, y, r, val, max, txt, unit) {
    var a0 = 200, a1 = 340 + 60, f = Math.max(0, Math.min(1, val / max)), ang = function (t) { return (a0 + (a1 - a0) * t) * Math.PI / 180; };
    var p = function (t, rr) { return (x + rr * Math.cos(ang(t))).toFixed(1) + ' ' + (y + rr * Math.sin(ang(t))).toFixed(1); };
    var s = '<path d="M' + p(0, r) + ' A' + r + ' ' + r + ' 0 1 1 ' + p(1, r) + '" class="sgauge"/>';
    s += '<path d="M' + x + ' ' + y + ' L' + p(f, r - 2) + '" class="sneedle"/>';
    s += R(x - 4, y + 4, r + 8, 18, 'sbox') + sT(x + r / 2, y + 18, txt, 12, 'g');
    return s;
  }
  function ewd() {
    var s = '', fuel = N.FUEL || 6500;
    var run = function (i) { return !!S['ENGRUN' + i]; };
    [1, 2].forEach(function (i) { var x = i === 1 ? 62 : 178; s += gauge(x, 44, 30, run(i) ? 19 : 0, 100, run(i) ? '19.5' : '0.0'); s += gauge(x, 112, 24, run(i) ? 420 : 15, 1000, run(i) ? '420' : '15'); s += sT(x + 6, 158, run(i) ? '58.4' : '0.0', 12, 'g') + sT(x + 6, 174, run(i) ? '280' : '0', 12, 'g'); });
    s += sT(126, 46, 'N1', 10, 'w') + sT(126, 58, '%', 10, 'c') + sT(126, 114, 'EGT', 10, 'w') + sT(126, 126, '°C', 10, 'c') + sT(126, 160, 'N2 %', 10, 'w') + sT(126, 176, 'FF', 10, 'w');
    s += sT(212, 14, 'FOB :', 11, 'w', 'end') + sT(262, 14, String(fuel), 12, 'g', 'end') + sT(276, 14, 'KG', 9, 'c', 'end');
    var fl = N.FLAPS || 0; s += sT(236, 72, 'S', 10, 'w') + sT(268, 72, 'F', 10, 'w') + '<path d="M230 80 l40 0" class="sl"/>' + (fl ? sT(252, 96, ['', '1', '2', '3', 'FULL'][fl], 11, 'g') + sT(252, 60, 'FLAP', 9, 'c') : '');
    s += '<line x1="0" y1="190" x2="280" y2="190" class="sl"/><line x1="160" y1="196" x2="160" y2="276" class="sl"/>';
    var memo = [];
    if (V('PARK', 0) === 0) memo.push('PARK BRK');
    if (V('SEATBELT', 1) === 0) memo.push('SEAT BELTS');
    if (V('NOSMOKE', 1) !== 2) memo.push('NO SMOKING');
    if (S.APUM && S.APUS) memo.push('APU AVAIL');
    if (S.APUBLEED) memo.push('APU BLEED');
    if (V('ENGMODE', 1) === 2) memo.push('IGNITION');
    if (S.ATHR === undefined ? 0 : 0) memo.push('');
    memo.slice(0, 6).forEach(function (m, i) { s += sT(166, 208 + i * 13, m, 10, 'g', 'start'); });
    if (N.TOCFG) { var lines = [['AUTO BRK', N.AB === 3 ? 'MAX' : '', 'AUTO BRK MAX'], ['SIGNS', V('SEATBELT', 1) === 0 ? 'ON' : '', 'SIGNS ON'], ['CABIN', '', 'CHECK'], ['SPLRS', N.SB < 0 ? 'ARM' : '', 'ARM'], ['FLAPS', fl ? 'T.O' : '', 'T.O'], ['T.O CONFIG', 'NORMAL', 'TEST']];
      s += sT(6, 204, 'T.O', 10, 'w', 'start'); lines.forEach(function (l, i) { s += sT(36, 204 + i * 13, l[0] + (l[1] ? ' ' + l[1] : ' ....' + l[2]), 9, l[1] ? 'g' : 'c', 'start'); }); }
    return s;
  }
  function sdPage() {
    var p = A.ECAM, s = sT(8, 18, p, 13, 'w', 'start') + '<line x1="8" y1="22" x2="' + (8 + p.length * 9) + '" y2="22" class="sl"/>';
    var box = function (x, y, w, t, v1, v2, col) { return R(x, y, w, 40, 'ssd') + sT(x + w / 2, y + 13, t, 10, 'w') + (v1 ? sT(x + w / 2, y + 26, v1, 10, col || 'g') : '') + (v2 ? sT(x + w / 2, y + 38, v2, 10, col || 'g') : ''); };
    if (p === 'ELEC') {
      s += box(30, 34, 70, 'BAT 1', S.BAT1 ? '27 V' : 'OFF', S.BAT1 ? '0 A' : '', S.BAT1 ? 'g' : 'w') + box(180, 34, 70, 'BAT 2', S.BAT2 ? '28 V' : 'OFF', S.BAT2 ? '0 A' : '', S.BAT2 ? 'g' : 'w');
      s += sT(140, 60, 'DC BAT', 10, 'g') + '<path d="M100 56 H118 M162 56 H180" class="sgl"/>';
      s += sT(60, 110, 'DC 1', 11, 'g') + sT(140, 110, 'DC ESS', 11, 'g') + sT(220, 110, 'DC 2', 11, 'g') + sT(60, 140, 'AC 1', 11, S.EXT || (S.APUM && S.APUS) ? 'g' : 'a') + sT(140, 140, 'AC ESS', 11, 'g') + sT(220, 140, 'AC 2', 11, S.EXT || (S.APUM && S.APUS) ? 'g' : 'a');
      s += box(14, 176, 56, 'GEN 1', S.ENGRUN1 ? '28 %' : '', '', 'g') + box(78, 176, 56, 'APU GEN', S.APUM && S.APUS ? '0 %' : '', S.APUM && S.APUS ? '115 V' : '', 'g') + box(146, 176, 56, 'EXT PWR', S.GPU || S.EXT ? '115 V' : '', S.GPU || S.EXT ? '400 HZ' : '', 'g') + box(210, 176, 56, 'GEN 2', S.ENGRUN2 ? '28 %' : '', '', 'g');
      if (!S.ENGRUN1) s += sT(42, 206, 'XX', 10, 'a'); if (!S.ENGRUN2) s += sT(238, 206, 'XX', 10, 'a');
    } else if (p === 'HYD') {
      var pr = function (c) { return S.ENGRUN1 && c !== 'B' || S.ENGRUN2 && c === 'Y' || (c === 'B' && (S.ENGRUN1 || S.ENGRUN2)) ? 3000 : 0; };
      ['GREEN', 'BLUE', 'YELLOW'].forEach(function (c, i) { var x = 50 + i * 90, v = pr(c[0]); s += sT(x, 44, c, 11, 'w') + sT(x, 62, String(v), 13, v ? 'g' : 'a') + '<path d="M' + x + ' 70 v120" class="' + (v ? 'sgl' : 'sal') + '"/>' + C(x, 200, 12, 'sring2') + sT(x, 226, c === 'BLUE' ? 'ELEC' : 'ENG ' + (c === 'GREEN' ? 1 : 2), 10, 'w'); });
      s += sT(140, 110, 'PTU', 10, 'w') + '<path d="M60 104 H120 M160 104 H220" class="sgl"/>';
    } else if (p === 'FUEL') {
      var f = N.FUEL || 6500, w = Math.round(f * 0.4), c = f - 2 * w;
      s += sT(140, 40, 'F.USED', 10, 'w') + sT(140, 54, '0', 11, 'g') + '<path d="M20 170 L60 120 H220 L260 170 Z" class="ssd"/>';
      s += sT(60, 160, String(w), 13, 'g') + sT(140, 160, String(c < 0 ? 0 : c), 13, 'g') + sT(220, 160, String(w), 13, 'g');
      s += sT(60, 112, S.LTK1 ? 'ON' : 'OFF', 9, S.LTK1 ? 'g' : 'a') + sT(140, 112, S.CTK1 ? 'ON' : 'OFF', 9, S.CTK1 ? 'g' : 'a') + sT(220, 112, S.RTK1 ? 'ON' : 'OFF', 9, S.RTK1 ? 'g' : 'a');
      s += sT(140, 210, 'FOB', 11, 'w') + sT(140, 228, f + ' KG', 13, 'g');
    } else if (p === 'APU') {
      var av = S.APUM && S.APUS;
      s += (av ? sT(140, 40, 'AVAIL', 13, 'g') : '') + gauge(80, 110, 34, av ? 100 : 0, 110, av ? '100' : '0') + sT(80, 160, 'N %', 10, 'w') + gauge(200, 110, 34, av ? 420 : 15, 1000, av ? '420' : '15') + sT(200, 160, 'EGT °C', 10, 'w');
      s += box(30, 186, 80, 'APU GEN', av ? '115 V' : '', av ? '400 HZ' : '', 'g') + sT(200, 200, 'BLEED', 10, 'w') + sT(200, 218, S.APUBLEED ? '35 PSI' : 'XX', 11, S.APUBLEED ? 'g' : 'a');
    } else if (p === 'DOOR') {
      s += '<path d="M140 30 C110 40 106 70 106 100 V220 C106 250 130 262 140 262 C150 262 174 250 174 220 V100 C174 70 170 40 140 30 Z" class="ssd"/>';
      var dr = [['DL1', 100, 80, 'CABIN'], ['DR1', 180, 80, 'CABIN'], ['DCF', 180, 120, 'CARGO'], ['DCA', 180, 200, 'CARGO'], ['DAVI', 140, 60, 'AVIONIC']];
      dr.forEach(function (d) { var o = !!S[d[0]]; s += R(d[1] - 7, d[2] - 9, 14, 18, o ? 'sdopen' : 'sdclosed') + (o ? sT(d[1] < 140 ? d[1] - 14 : d[1] + 14, d[2] + 4, d[3], 9, 'a', d[1] < 140 ? 'end' : 'start') : ''); });
    } else if (p === 'WHEEL') {
      var dn = V('GEAR', 1) === 1;
      [[70, 'L'], [140, 'N'], [210, 'R']].forEach(function (g) { s += dn ? '<path d="M' + (g[0] - 14) + ' 70 h28 l-14 22 z" class="sgreen"/>' : ''; });
      s += sT(140, 130, 'PARK BRK', 10, V('PARK', 0) === 0 ? 'g' : 'w') + sT(140, 150, V('PARK', 0) === 0 ? 'ON' : 'OFF', 10, 'g');
      s += sT(70, 200, 'BRK', 10, 'w') + sT(70, 216, '15 °C', 11, 'g') + sT(210, 200, 'BRK', 10, 'w') + sT(210, 216, '15 °C', 11, 'g');
      s += sT(140, 240, 'AUTO BRK ' + (['', 'LO', 'MED', 'MAX'][N.AB || 0]), 10, N.AB ? 'g' : 'w');
    } else {
      var L2 = { ENG: ['F.USED 0 KG', 'OIL 13 QT', 'VIB N1 0.0  N2 0.0'], BLEED: ['PACK 1 ' + (S.PACK1 === 0 ? 'OFF' : 'ON'), 'PACK 2 ' + (S.PACK2 === 0 ? 'OFF' : 'ON'), 'APU BLEED ' + (S.APUBLEED ? 'OPEN' : 'SHUT')], PRESS: ['ΔP 0.0 PSI', 'CAB V/S 0 FT/MIN', 'CAB ALT 0 FT'], COND: ['CKPT 22 °C', 'FWD 22 °C', 'AFT 22 °C'], 'F/CTL': ['ELAC 1 2', 'SEC 1 2 3', 'SPLRS RET'], STS: ['NORMAL'], ALL: ['ALLE SEITEN NACHEINANDER'] }[p] || [p];
      L2.forEach(function (l, i) { s += sT(20, 60 + i * 22, l, 12, 'g', 'start'); });
    }
    var d = new Date();
    s += '<line x1="0" y1="224" x2="280" y2="224" class="sl"/>' + sT(8, 239, 'TAT +15 °C', 10, 'w', 'start') + sT(8, 253, 'SAT +15 °C', 10, 'w', 'start') + sT(140, 247, pad(d.getUTCHours(), 2) + ' H ' + pad(d.getUTCMinutes(), 2), 12, 'g') + sT(272, 247, 'GW ---- KG', 10, 'c', 'end');
    return s;
  }
  function isis() {
    var s = '<clipPath id="isc' + CL + '"><rect x="0" y="0" width="110" height="110"/></clipPath>';
    s += '<rect x="0" y="0" width="110" height="56" class="ssky"/><rect x="0" y="56" width="110" height="54" class="sgnd"/><line x1="0" y1="56" x2="110" y2="56" class="shz"/>';
    s += R(0, 14, 24, 82, 'stape') + R(86, 14, 24, 82, 'stape') + sT(12, 60, adr(1) ? '0' : 'SPD', 10, adr(1) ? 'w' : 'r') + sT(98, 60, adr(1) ? String(N.ALTI || 0) : 'ALT', 9, adr(1) ? 'w' : 'r');
    s += '<path d="M36 56 h12 v5 M74 56 h-12 v5" class="sacl"/>' + sT(55, 108, N.STD ? 'STD' : N.QNH + ' HPA', 9, 'c') + sT(55, 11, String(HDG0), 9, 'w');
    return s;
  }

  /* ---------- Glareshield ---------- */
  function efis(x0, y0, side) {
    var p = side === 1 ? '' : 'F', s = panel(x0, y0, 380, 220), std = N.STD;
    s += lcd(x0 + 20, y0 + 32, 110, 30, std ? 'Std' : (N.INHG ? (N.QNH * 0.02953).toFixed(2) : String(N.QNH)), 18, !on());
    s += T(x0 + 75, y0 + 76, 'inHg       hPa', 8, 'middle', 'ovsmall') + vknob(x0 + 75, y0 + 118, 26, 'QNH', 1) + '<g ' + act('xcstd') + '>' + R(x0 + 52, y0 + 160, 46, 18, 'ckkey', 3) + T(x0 + 75, y0 + 173, 'PULL STD', 8, 'middle', 'cktx') + '</g>';
    s += lab(x0 + 75, y0 + 24, 'BARO') + lab(x0 + 160, y0 + 34, 'FD') + gkey(x0 + 160, y0 + 54, 36, 28, 'FD', !!S[p + 'FD'] && on(), act('xtog', undefined, undefined, ' data-id="' + p + 'FD"')) + lab(x0 + 160, y0 + 96, 'LS') + gkey(x0 + 160, y0 + 116, 36, 28, 'LS', !!S[p + 'LS'] && on(), act('xtog', undefined, undefined, ' data-id="' + p + 'LS"'));
    ['CSTR', 'WPT', 'VOR.D', 'NDB', 'ARPT'].forEach(function (k, i) { var id = p + ['CSTR', 'WPT', 'VORD', 'NDB', 'ARPT'][i]; s += gkey(x0 + 214 + i * 36, y0 + 44, 32, 26, k, !!S[id] && on(), act('xtog', undefined, undefined, ' data-id="' + id + '"'), 7); });
    s += ctl(A.kn(p + 'NDMODE', 'ND MODE', ['LS', 'VOR', 'NAV', 'ARC', 'PLAN'], 3), x0 + 240, y0 + 130, false) + lab(x0 + 240, y0 + 194, 'MODE');
    s += ctl(A.kn(p + 'NDRANGE', 'ND RANGE', ['10', '20', '40', '80', '160', '320'], 3), x0 + 330, y0 + 130, false) + lab(x0 + 330, y0 + 194, 'RANGE NM');
    s += ctl(A.tg(p + 'ADF1', 'ADF/VOR 1', ['ADF', 'OFF', 'VOR'], 1), x0 + 160, y0 + 182, false) + T(x0 + 150, y0 + 212, '1', 9, 'middle', 'ovlab');
    s += ctl(A.tg(p + 'ADF2', 'ADF/VOR 2', ['ADF', 'OFF', 'VOR'], 1), x0 + 286, y0 + 196, false) + T(x0 + 276, y0 + 214, '2', 9, 'middle', 'ovlab');
    return s;
  }
  function fcuSvg(x0, y0) {
    var s = panel(x0, y0, 760, 220), off = !on();
    var sd = N.SPDM ? '---' : pad(N.SPD, 3), hd = N.HDGM ? '---' : pad(N.HDG, 3), vs = N.VSM ? '-----' : (N.VS < 0 ? '-' : '+') + pad(Math.abs(N.VS) / 100, 2) + 'oo';
    s += lab(x0 + 70, y0 + 30, 'SPD   MACH') + lcd(x0 + 20, y0 + 36, 100, 40, sd + (N.SPDM ? ' •' : ''), 22, off);
    s += lab(x0 + 260, y0 + 30, 'HDG     LAT') + lcd(x0 + 200, y0 + 36, 120, 40, hd + (N.HDGM ? ' •' : ''), 22, off);
    s += lab(x0 + 400, y0 + 30, 'HDG  V/S') + lab(x0 + 400, y0 + 46, 'TRK  FPA');
    s += lab(x0 + 520, y0 + 30, 'ALT      LVL/CH') + lcd(x0 + 450, y0 + 36, 140, 40, pad(N.ALT, 5) + (N.ALTM ? ' •' : ''), 22, off);
    s += lab(x0 + 680, y0 + 30, 'V/S  FPA') + lcd(x0 + 615, y0 + 36, 130, 40, vs, 22, off);
    s += vknob(x0 + 70, y0 + 135, 26, 'SPD', 1, 1) + vknob(x0 + 260, y0 + 135, 26, 'HDG', 1, 1) + vknob(x0 + 520, y0 + 135, 26, 'ALT', N.ALTSTEP || 100, 1) + vknob(x0 + 680, y0 + 135, 26, 'VS', 100, 1);
    s += gkey(x0 + 150, y0 + 105, 40, 24, 'SPD MACH', 0, act('xtog', undefined, undefined, ' data-id="SPDMACH"'), 7) + gkey(x0 + 400, y0 + 75, 46, 24, 'HDG V/S', 0, act('xtog', undefined, undefined, ' data-id="HDGTRK"'), 7) + gkey(x0 + 600, y0 + 105, 40, 24, 'METRIC', 0, act('xtog', undefined, undefined, ' data-id="METRIC"'), 7);
    s += '<g ' + act('xcstep') + '>' + C(x0 + 590, y0 + 165, 10, 'ovkbase') + '<line x1="' + (x0 + 590) + '" y1="' + (y0 + 165) + '" x2="' + (x0 + 590 + ((N.ALTSTEP || 100) === 100 ? -8 : 8)) + '" y2="' + (y0 + 158) + '" class="ovkmark"/>' + T(x0 + 574, y0 + 152, '100', 8, 'middle', 'ovsmall') + T(x0 + 606, y0 + 152, '1000', 8, 'middle', 'ovsmall') + '</g>';
    var k = function (id, t, x, y, w) { return gkey(x0 + x, y0 + y, w || 46, 28, t, !!S[id] && on(), act('xtog', undefined, undefined, ' data-id="' + id + '"')); };
    s += k('LOC', 'LOC', 260, 196) + k('AP1', 'AP1', 370, 120) + k('AP2', 'AP2', 430, 120) + k('ATHR', 'A/THR', 400, 172) + k('EXPED', 'EXPED', 500, 196) + k('APPR', 'APPR', 600, 196);
    s += T(x0 + 70, y0 + 186, 'PUSH = verwaltet (•)', 8, 'middle', 'ovsmall');
    return s;
  }
  function glareSvg() {
    var W = 1900, H = 280, s = R(0, 0, W, H, 'ovbg') + '<path d="M0 26 Q950 -10 1900 26 V280 H0 Z" class="ckglare"/>';
    var side = function (x0, n) {
      var q = panel(x0, 30, 160, 220);
      q += lamp(n === 1 ? 'MWARN' : 'MWARN', x0 + 50, 80, 70, 44, 'MASTER', 'WARN', 'r') + lamp('MCAUT', x0 + 50, 145, 70, 44, 'MASTER', 'CAUT', 'a');
      q += lab(x0 + 125, 64, 'CHRONO') + '<g ' + act('xtog', undefined, undefined, ' data-id="CHRONO' + n + '"') + '>' + C(x0 + 125, 84, 14, 'ovround') + C(x0 + 125, 84, 9, 'ovround2') + '</g>';
      q += lab(x0 + 80, 200, 'SIDE STICK PRIORITY') + R(x0 + 40, 208, 80, 30, 'cklamp', 3) + T(x0 + 62, 228, n === 1 ? '◀' : '▶', 13, 'middle', 'ckl kr') + T(x0 + 98, 228, n === 1 ? 'CAPT' : 'F/O', 10, 'middle', 'ckl kg');
      return q;
    };
    s += side(10, 1) + efis(180, 30, 1) + fcuSvg(570, 30) + efis(1340, 30, 2) + side(1730, 2);
    return s;
  }

  /* ---------- Hauptpanel ---------- */
  function sidePanel(x0, n) {
    var p = n === 1 ? '1' : '2', s = panel(x0, 10, 170, 640);
    s += ctl(A.kn('LSPKR' + p, 'LOUD SPEAKER', ['OFF', '', '', 'MAX'], 2), x0 + 85, 70);
    s += lab(x0 + 85, 130, 'PFD/ND XFR') + gkey(x0 + 85, 150, 46, 30, 'XFR', !!S['PFDNDXFR' + p] && on(), act('xtog', undefined, undefined, ' data-id="PFDNDXFR' + p + '"'));
    s += ctl(A.tg('CONSFLOOR' + p, 'CONSOLE/FLOOR', ['BRT', 'DIM', 'OFF'], 2), x0 + 70, 220);
    s += ctl(A.kn('PFDBRT' + p, 'PFD BRT', ['OFF', '', '', 'BRT'], 3), x0 + 85, 310);
    s += ctl(A.kn('NDBRT' + p, 'ND BRT', ['OFF', '', '', 'BRT'], 3), x0 + 85, 410);
    s += lamp('ALAND', x0 + 85, 480, 76, 30, 'AUTO LAND', '', 'r');
    s += lamp('GPWSGS' + p, x0 + 85, 530, 76, 30, 'GPWS  G/S', '', 'a');
    s += lab(x0 + 85, 568, 'TERR ON ND') + gkey(x0 + 85, 592, 46, 30, 'ON', !!S['TERRND' + p] && on(), act('xtog', undefined, undefined, ' data-id="TERRND' + p + '"'));
    return s;
  }
  function brt(id) { return on() && V(id, 3) > 0; }
  function mainSvg() {
    var W = 2230, H = 660, s = R(0, 0, W, H, 'ovbg') + R(180, 10, 1860, 640, 'ckmain', 6);
    s += sidePanel(0, 1) + sidePanel(2050, 2);
    var x1 = !!S.PFDNDXFR1, x2 = !!S.PFDNDXFR2;
    s += screen(200, 40, 280, 280, brt('PFDBRT1') ? (x1 ? nd(1) : pfd(1)) : '') + screen(500, 40, 280, 280, brt('NDBRT1') ? (x1 ? pfd(1) : nd(1)) : '');
    s += screen(1440, 40, 280, 280, brt('NDBRT2') ? (x2 ? pfd(2) : nd(2)) : '') + screen(1740, 40, 280, 280, brt('PFDBRT2') ? (x2 ? nd(2) : pfd(2)) : '');
    s += screen(940, 40, 280, 280, on() && V('EWDBRT', 3) ? ewd() : '') + screen(940, 360, 280, 260, on() && V('SDBRT', 3) ? sdPage() : '');
    s += T(1080, 24, 'ENGINE / WARNING DISPLAY', 9, 'middle', 'ovsmall') + T(1080, 344, 'SYSTEM DISPLAY', 9, 'middle', 'ovsmall');
    /* ISIS und Uhr */
    s += screen(810, 40, 110, 110, on() ? isis() : '') + T(865, 172, 'ISIS', 9, 'middle', 'ovsmall');
    var d = new Date(); s += C(865, 240, 46, 'ckclock') + T(865, 228, 'UTC', 8, 'middle', 'ovsmall') + R(825, 234, 80, 22, 'cklcd', 2) + T(865, 251, pad(d.getUTCHours(), 2) + ':' + pad(d.getUTCMinutes(), 2), 16, 'middle', 'cklcdt') + T(865, 274, 'CLOCK', 8, 'middle', 'ovsmall');
    /* Fahrwerk */
    var dn = V('GEAR', 1) === 1;
    s += R(800, 330, 130, 60, 'ckpnl2', 4) + T(865, 344, 'LDG GEAR', 9, 'middle', 'ovsmall');
    [830, 865, 900].forEach(function (x) { s += '<path d="M' + (x - 13) + ' 352 h26 l-13 20 z" class="' + (dn && on() ? 'ckgreen lit' : 'ckgreen') + '"/>' + T(x, 384, 'UNLK', 7, 'middle', 'ckunlk'); });
    s += lab(865, 410, 'LDG GEAR') + R(855, 420, 20, 190, 'ckslot', 8) + T(838, 432, 'UP', 10, 'middle', 'ovlab') + T(838, 600, 'DN', 10, 'middle', 'ovlab');
    A.reg(A.tg('GEAR', 'LDG GEAR', ['UP', 'DN'], 1));
    s += '<g data-a="tg" data-id="GEAR">' + R(840, 412, 50, 206, 'ckhit') + R(858, dn ? 520 : 420, 14, 80, 'cklever', 4) + '<ellipse cx="865" cy="' + (dn ? 594 : 430) + '" rx="22" ry="16" class="ckwheel"/></g>';
    /* Bremsen, Autobremse */
    var pk = V('PARK', 0) === 0;
    s += R(1240, 40, 160, 150, 'ckpnl2', 4) + T(1320, 56, 'ACCU PRESS', 8, 'middle', 'ovsmall');
    var needle = function (cx, cy, f) { var a = (200 + 140 * f) * Math.PI / 180; return '<path d="M' + cx + ' ' + cy + ' L' + (cx + 26 * Math.cos(a)).toFixed(1) + ' ' + (cy + 26 * Math.sin(a)).toFixed(1) + '" class="ckneedle"/>'; };
    s += '<path d="M1294 84 A28 28 0 0 1 1346 84" class="ckscale"/>' + needle(1320, 96, 0.9);
    s += T(1320, 128, 'BRAKES', 8, 'middle', 'ovsmall') + '<path d="M1260 170 A30 30 0 0 1 1316 170 M1324 170 A30 30 0 0 1 1380 170" class="ckscale"/>' + needle(1288, 180, pk ? 0.66 : 0.02) + needle(1352, 180, pk ? 0.66 : 0.02) + T(1288, 186, 'L', 8, 'middle', 'ovsmall') + T(1352, 186, 'R', 8, 'middle', 'ovsmall');
    s += ctl(A.tg('ASKID', 'A/SKID & N/W STRG', ['ON', 'OFF'], 0), 1300, 260);
    s += lab(1320, 330, 'AUTO BRK');
    ['LO', 'MED', 'MAX'].forEach(function (t, i) { s += lab(1320, 352 + i * 70, t) + lpb(1320, 380 + i * 70, ['DECEL', 'g'], ['ON', 'b'], 0, N.AB === i + 1 && on(), act('xcset', 'AB', N.AB === i + 1 ? 0 : i + 1)); });
    s += lab(1320, 568, 'BRK FAN') + lpb(1320, 598, ['HOT', 'a'], ['ON', 'b'], 0, !!S.BRKFAN && on(), act('xtog', undefined, undefined, ' data-id="BRKFAN"'));
    /* unter den Bildschirmen */
    s += R(200, 350, 580, 270, 'ckpnl2', 6) + R(1440, 350, 580, 270, 'ckpnl2', 6);
    s += T(490, 400, 'KNIEBEREICH CAPT', 10, 'middle', 'ovsmall') + T(1730, 400, 'KNIEBEREICH F/O', 10, 'middle', 'ovsmall');
    s += ctl(A.kn('EWDBRT', 'UPPER DISPLAY', ['OFF', '', '', 'BRT'], 3), 380, 520) + ctl(A.kn('SDBRT', 'LOWER DISPLAY', ['OFF', '', '', 'BRT'], 3), 600, 520);
    s += T(490, 600, 'Helligkeit E/WD und SD (wie am ECAM-Bedienteil)', 9, 'middle', 'ovsmall');
    s += lab(1730, 470, 'NAV / ILS') + lcd(1640, 480, 180, 34, 'ILS ' + (N.ILS || '109.50'), 16, !on()) + T(1730, 560, 'Ablesen der Frequenzen für die Übung', 9, 'middle', 'ovsmall');
    return s;
  }

  /* ---------- Pedestal ---------- */
  function mcduMini(x0, y0, n) {
    var s = '<g ' + act('xcgo', 'mcdu') + '>' + panel(x0, y0, 330, 330, '');
    s += R(x0 + 40, y0 + 22, 250, 150, 'ckscreen', 4) + T(x0 + 165, y0 + 40, 'MCDU ' + n + ' MENU', 11, 'middle', 'sc sw');
    ['<FMGC', '<ACARS', '<AIDS', '<CFDS'].forEach(function (t, i) { s += T(x0 + 50, y0 + 66 + i * 24, t, 10, 'start', 'sc sg'); });
    s += T(x0 + 165, y0 + 160, 'Antippen → MCDU üben', 10, 'middle', 'sc scy');
    for (var i = 0; i < 6; i++) { s += R(x0 + 14, y0 + 40 + i * 22, 20, 12, 'ckkey', 2) + R(x0 + 296, y0 + 40 + i * 22, 20, 12, 'ckkey', 2); }
    var keys = ['DIR', 'PROG', 'PERF', 'INIT', 'DATA', '', 'F-PLN', 'RAD NAV', 'FUEL PRED', 'SEC F-PLN', 'ATC COMM', 'MCDU MENU'];
    keys.forEach(function (k, i) { if (!k) return; var xx = x0 + 40 + (i % 6) * 42, yy = y0 + 190 + Math.floor(i / 6) * 26; s += R(xx, yy, 38, 20, 'ckkey', 2) + T(xx + 19, yy + 13, k, 6, 'middle', 'cktx'); });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 7; c++) { s += R(x0 + 40 + c * 36, y0 + 248 + r * 18, 30, 14, 'ckkey', 2); }
    return s + '</g>';
  }
  function rmp(x0, y0, n) {
    var s = panel(x0, y0, 260, 190, 'RMP ' + n, 10), a = N['RMPA' + n], b = N['RMPS' + n], f = function (v) { return (v / 1000).toFixed(3); };
    s += lab(x0 + 60, y0 + 34, 'ACTIVE') + lcd(x0 + 14, y0 + 40, 92, 30, f(a), 16, !on()) + lab(x0 + 200, y0 + 34, 'STBY/CRS') + lcd(x0 + 154, y0 + 40, 92, 30, f(b), 16, !on());
    s += '<g ' + act('xcrmp', n, 'swap') + '>' + R(x0 + 112, y0 + 44, 36, 22, 'ckkey', 3) + T(x0 + 130, y0 + 59, '⇆', 13, 'middle', 'cktx') + '</g>';
    var cx = x0 + 200, cy = y0 + 112;
    s += C(cx, cy, 30, 'ckknob') + C(cx, cy, 15, 'ckknob2') + '<rect x="' + (cx - 30) + '" y="' + (cy - 30) + '" width="30" height="60" class="ckhit" ' + act('xcrmp', n, '-1000') + '/><rect x="' + cx + '" y="' + (cy - 30) + '" width="30" height="60" class="ckhit" ' + act('xcrmp', n, '1000') + '/><rect x="' + (cx - 15) + '" y="' + (cy - 15) + '" width="15" height="30" class="ckhit" ' + act('xcrmp', n, '-25') + '/><rect x="' + cx + '" y="' + (cy - 15) + '" width="15" height="30" class="ckhit" ' + act('xcrmp', n, '25') + '/>';
    s += T(cx, cy + 46, 'außen MHz · innen kHz', 7, 'middle', 'ovsmall');
    ['VHF1', 'VHF2', 'VHF3', 'HF1', 'HF2', 'AM'].forEach(function (t, i) { s += gkey(x0 + 30 + (i % 3) * 44, y0 + 98 + Math.floor(i / 3) * 36, 38, 26, t, (N['RMPSEL' + n] || 0) === i && on(), act('xcset', 'RMPSEL' + n, i), 7); });
    s += gkey(x0 + 30, y0 + 170, 38, 22, 'NAV', 0, act('xtog', undefined, undefined, ' data-id="RMPNAV' + n + '"'), 7);
    return s;
  }
  function acp(x0, y0, n) {
    var s = panel(x0, y0, 260, 170, 'AUDIO CONTROL PANEL ' + n, 9);
    ['VHF1', 'VHF2', 'VHF3', 'HF1', 'HF2', 'INT', 'CAB', 'PA'].forEach(function (t, i) {
      var x = x0 + 26 + i * 30, sel = (N['ACP' + n] || 0) === i && on();
      s += '<g ' + act('xcset', 'ACP' + n, i) + '>' + R(x - 13, y0 + 34, 26, 30, 'ckkey', 2) + R(x - 9, y0 + 37, 18, 6, 'ckcall', 1) + R(x - 9, y0 + 56, 18, 4, 'ckbar' + (sel ? ' lit' : ''), 1) + T(x, y0 + 52, t, 6, 'middle', 'cktx') + '</g>';
      var rid = 'ACPR' + n + i, ro = !!S[rid] && on();
      s += '<g ' + act('xtog', undefined, undefined, ' data-id="' + rid + '"') + '>' + C(x, y0 + 92, 11, 'ckknob') + C(x, y0 + 92, 5, ro ? 'ckrecv lit' : 'ckrecv') + '</g>';
    });
    s += T(x0 + 130, y0 + 122, 'Sendetaste oben · Hörknopf unten', 8, 'middle', 'ovsmall') + gkey(x0 + 60, y0 + 146, 50, 22, 'INT/RAD', 0, act('xtog', undefined, undefined, ' data-id="INTRAD' + n + '"'), 7) + gkey(x0 + 200, y0 + 146, 50, 22, 'RESET', 0, '', 7);
    return s;
  }
  function track(x, y0, y1, labs, cur, k, title, knob) {
    var s = lab(x, y0 - 14, title) + R(x - 7, y0, 14, y1 - y0, 'ckslot', 6), n = labs.length;
    labs.forEach(function (t, i) { var yy = y0 + 10 + (y1 - y0 - 20) * i / (n - 1); s += '<line x1="' + (x + 12) + '" y1="' + yy + '" x2="' + (x + 26) + '" y2="' + yy + '" class="ckdet"/>' + '<g ' + act('xcset', k, i) + '>' + R(x + 10, yy - 11, 70, 22, 'ckhit') + T(x + 30, yy + 4, t, 10, 'start', i === cur ? 'ovsel' : 'ovlab') + '</g>'; });
    var yc = y0 + 10 + (y1 - y0 - 20) * cur / (n - 1);
    s += knob === 'flap' ? R(x - 26, yc - 10, 52, 20, 'ckflap', 4) : knob === 'sb' ? R(x - 22, yc - 8, 44, 16, 'cksb', 3) : '';
    return s;
  }
  function pedSvg() {
    var W = 900, H = 1520, s = R(0, 0, W, H, 'ovbg');
    s += mcduMini(10, 10, 1) + mcduMini(560, 10, 2);
    s += panel(350, 10, 200, 330, 'SWITCHING', 11);
    s += ctl(A.kn('SWATT', 'ATT HDG', ['CAPT 3', 'NORM', 'F/O 3'], 1), 400, 100) + ctl(A.kn('SWAIR', 'AIR DATA', ['CAPT 3', 'NORM', 'F/O 3'], 1), 500, 100) + ctl(A.kn('SWEIS', 'EIS DMC', ['CAPT 3', 'NORM', 'F/O 3'], 1), 400, 240) + ctl(A.kn('SWXFR', 'ECAM/ND XFR', ['CAPT', 'NORM', 'F/O'], 1), 500, 240);
    /* ECAM-Bedienteil */
    s += panel(150, 350, 600, 170, 'ECAM CONTROL PANEL', 11);
    s += ctl(A.kn('EWDBRT', 'UPPER DISPLAY', ['OFF', '', '', 'BRT'], 3), 210, 430, 'UPPER DISP') + ctl(A.kn('SDBRT', 'LOWER DISPLAY', ['OFF', '', '', 'BRT'], 3), 690, 430, 'LOWER DISP');
    ['ENG', 'BLEED', 'PRESS', 'ELEC', 'HYD', 'FUEL', 'APU', 'COND', 'DOOR', 'WHEEL', 'F/CTL', 'ALL'].forEach(function (p, i) { var x = 290 + (i % 6) * 64, y = 410 + Math.floor(i / 6) * 34; s += gkey(x, y, 54, 26, p, A.ECAM === p && on(), 'data-a="xecam" data-p="' + p + '"', 8); });
    s += gkey(320, 488, 54, 24, 'T.O CONFIG', !!N.TOCFG && on(), act('xctocfg'), 7) + gkey(400, 488, 46, 24, 'CLR', 0, act('xcset', 'TOCFG', 0), 8) + gkey(470, 488, 46, 24, 'STS', A.ECAM === 'STS' && on(), 'data-a="xecam" data-p="STS"', 8) + gkey(540, 488, 46, 24, 'RCL', 0, '', 8) + gkey(610, 488, 54, 24, 'EMER CANC', 0, '', 7);
    /* Funk links/rechts */
    s += rmp(10, 530, 1) + acp(10, 730, 1) + rmp(630, 530, 2) + acp(630, 730, 2);
    /* Schub, Klappen, Spoiler */
    s += panel(280, 530, 340, 380, '', 0) + T(450, 552, 'THRUST LEVERS', 11, 'middle', 'ovtitle');
    var tl = N.TLD === undefined ? 1 : N.TLD, labsT = ['TOGA', 'FLX/MCT', 'CL', 'IDLE', 'REV'];
    var ty = function (i) { return 600 + i * 64; };
    labsT.forEach(function (t, i) { s += '<line x1="390" y1="' + ty(i) + '" x2="520" y2="' + ty(i) + '" class="ckdet"/><g ' + act('xcset', 'TLD', 4 - i) + '>' + R(380, ty(i) - 16, 200, 30, 'ckhit') + T(530, ty(i) + 4, t, 10, 'start', 4 - i === tl ? 'ovsel' : 'ovlab') + '</g>'; });
    [420, 480].forEach(function (x) { var yy = ty(4 - tl); s += R(x - 6, 590, 12, 270, 'ckslot', 6) + R(x - 20, yy - 16, 40, 32, 'cklev', 6) + '<line x1="' + (x - 14) + '" y1="' + yy + '" x2="' + (x + 14) + '" y2="' + yy + '" class="ckdet"/>'; });
    s += R(326, 600, 18, 250, 'ckwheelt', 4) + R(588, 600, 18, 250, 'ckwheelt', 4);
    for (var i = 0; i < 25; i++) s += '<line x1="326" y1="' + (604 + i * 10) + '" x2="344" y2="' + (604 + i * 10) + '" class="ckridge"/><line x1="588" y1="' + (604 + i * 10) + '" x2="606" y2="' + (604 + i * 10) + '" class="ckridge"/>';
    s += T(335, 870, 'PITCH TRIM', 8, 'middle', 'ovsmall') + T(597, 870, 'PITCH TRIM', 8, 'middle', 'ovsmall');
    s += panel(10, 910, 260, 300, '', 0) + track(60, 950, 1180, ['RET', '1/2', 'FULL'], N.SB || 0, 'SB', 'SPEED BRAKE', 'sb') + T(180, 1060, 'Spoiler', 9, 'middle', 'ovsmall');
    s += panel(630, 910, 260, 300, '', 0) + track(680, 950, 1180, ['0', '1', '2', '3', 'FULL'], N.FLAPS || 0, 'FLAPS', 'FLAPS', 'flap');
    /* Triebwerke */
    s += panel(280, 920, 340, 160, 'ENG', 11);
    s += ctl(A.tg('ENGMASTER1', 'MASTER 1', ['ON', 'OFF'], 1), 330, 1000) + ctl(A.tg('ENGMASTER2', 'MASTER 2', ['ON', 'OFF'], 1), 560, 1000);
    s += ctl(A.kn('ENGMODE', 'MODE', ['CRANK', 'NORM', 'IGN/START'], 1), 445, 1020);
    [[330, 'ENG 1'], [560, 'ENG 2']].forEach(function (e) { s += R(e[0] - 30, 1040, 60, 26, 'cklamp', 3) + T(e[0], 1051, 'FIRE', 8, 'middle', 'ckl kr') + T(e[0], 1062, 'FAULT', 8, 'middle', 'ckl ka'); });
    /* Ruder-Trimmung, Parkbremse */
    s += panel(280, 1090, 340, 120, 'RUDDER TRIM', 10);
    var rt = N.RT || 0; s += lcd(300, 1130, 90, 30, (rt < 0 ? 'L ' : rt > 0 ? 'R ' : '') + (Math.abs(rt) / 10).toFixed(1), 16, !on()) + vknob(450, 1150, 22, 'RT', 1) + '<g ' + act('xcset', 'RT', 0) + '>' + R(530, 1136, 70, 28, 'ckkey', 3) + T(565, 1154, 'RESET', 9, 'middle', 'cktx') + '</g>';
    s += panel(10, 1220, 260, 140, 'PARK BRK', 11);
    A.reg(A.tg('PARK', 'PARKING BRK', ['ON', 'OFF'], 0));
    var pk = V('PARK', 0) === 0;
    s += '<g data-a="tg" data-id="PARK">' + R(40, 1240, 200, 110, 'ckhit') + C(140, 1300, 34, 'ckkring') + '<g transform="rotate(' + (pk ? 90 : 0) + ' 140 1300)">' + R(100, 1290, 80, 20, 'ckpark', 8) + '</g>' + T(80, 1270, 'OFF', 10, 'middle', pk ? 'ovlab' : 'ovsel') + T(200, 1270, 'ON', 10, 'middle', pk ? 'ovsel' : 'ovlab') + '</g>';
    /* ATC / TCAS */
    s += panel(280, 1220, 340, 290, 'ATC / TCAS', 11);
    var e = N.SQKE || ''; s += lcd(370, 1240, 160, 34, e ? (e + '----').slice(0, 4) : pad(N.SQK || 2000, 4), 20, !on());
    for (var d = 0; d < 8; d++) s += '<g ' + act('xcsq', d) + '>' + R(316 + (d % 4) * 52, 1290 + Math.floor(d / 4) * 40, 44, 32, 'ckkey', 3) + T(338 + (d % 4) * 52, 1311 + Math.floor(d / 4) * 40, String(d), 13, 'middle', 'cktx') + '</g>';
    s += '<g ' + act('xcsq', 'C') + '>' + R(524, 1290, 70, 32, 'ckkey', 3) + T(559, 1311, 'CLR', 11, 'middle', 'cktx') + '</g>' + gkey(559, 1346, 66, 30, 'IDENT', !!S.IDENT && on(), act('xtog', undefined, undefined, ' data-id="IDENT"'), 9);
    s += ctl(A.kn('XPDRMODE', 'XPDR', ['STBY', 'AUTO', 'ON'], 1), 340, 1440) + ctl(A.tg('XPDRALT', 'ALT RPTG', ['ON', 'OFF'], 0), 420, 1440) + ctl(A.kn('TCAS', 'TCAS', ['STBY', 'TA', 'TA/RA'], 0), 540, 1440);
    /* Wetterradar, Tür */
    s += panel(630, 1220, 260, 160, 'WX RADAR', 11);
    s += ctl(A.tg('WXSYS', 'SYS', ['1', 'OFF', '2'], 1), 670, 1300) + ctl(A.tg('PWS', 'PWS', ['AUTO', 'OFF'], 1), 740, 1300) + ctl(A.kn('WXMODE', 'MODE', ['WX', 'WX+T', 'TURB', 'MAP'], 0), 830, 1320);
    s += panel(630, 1390, 260, 120, 'COCKPIT DOOR', 11) + ctl(A.tg('DOOR', 'DOOR', ['UNLOCK', 'NORM', 'LOCK'], 1), 690, 1460, false) + R(780, 1430, 70, 26, 'cklamp', 3) + T(815, 1441, 'OPEN', 8, 'middle', 'ckl ka') + T(815, 1452, 'FAULT', 8, 'middle', 'ckl ka');
    s += panel(10, 1370, 260, 140, 'GRAVITY GEAR EXTN', 10) + C(140, 1450, 34, 'ckkring') + R(130, 1414, 20, 60, 'cklever', 6) + T(140, 1500, 'nur Notfall: Fahrwerk per Kurbel', 8, 'middle', 'ovsmall');
    return s;
  }

  /* ---------- Oberes Overhead (Sicherungen, Wartung) ---------- */
  var CBG = ['AUTO FLT', 'ELEC', 'FUEL', 'HYD', 'NAV', 'FLT CTL', 'ENG', 'AIR COND', 'COM', 'ICE & RAIN', 'LIGHTS', 'IND / REC'];
  function upperSvg() {
    var W = 1569, H = 760, s = R(0, 0, W, H, 'ovbg');
    s += panel(6, 10, 334, 740, 'MAINTENANCE', 12);
    var mp = [['FADEC1', 'FADEC GND PWR ENG 1', 70, 90], ['FADEC2', 'ENG 2', 170, 90], ['BLUEOVRD', 'BLUE PUMP OVRD', 270, 90], ['LEAKB', 'HYD LEAK B', 70, 200], ['LEAKG', 'G', 170, 200], ['LEAKY', 'Y', 270, 200], ['OXYRST', 'OXYGEN TMR RESET', 70, 310], ['SVCINT', 'SVCE INT OVRD', 170, 310], ['AVCOMPT', 'AVIONICS COMPT LT', 270, 310], ['APUEXT', 'APU AUTO EXTING', 120, 420], ['DFDR', 'DFDR EVENT', 230, 420]];
    mp.forEach(function (m) { var lit = !!S[m[0]] && on(); s += lab(m[2], m[3] - 32, m[1]) + lpb(m[2], m[3], m[0].indexOf('LEAK') === 0 ? null : m[0] === 'APUEXT' ? ['TEST', 'w'] : null, [m[0].indexOf('LEAK') === 0 ? 'OFF' : 'ON', m[0].indexOf('LEAK') === 0 ? 'w' : 'b'], 0, m[0].indexOf('LEAK') === 0 ? !S[m[0]] && on() ? 0 : lit : lit, act('xtog', undefined, undefined, ' data-id="' + m[0] + '"')); });
    s += ctl(A.kn('AUDSW', 'AUDIO SWITCHING', ['CAPT 3', 'NORM', 'F/O 3'], 1), 170, 560);
    s += T(170, 680, 'Wartungs-Tasten, im Flug nicht benutzen', 9, 'middle', 'ovsmall');
    s += panel(346, 10, 816, 740, 'CIRCUIT BREAKERS', 12) + panel(1168, 10, 368, 740, 'CIRCUIT BREAKERS', 12);
    var idx = 0;
    var field = function (x0, y0, cols, rows, gi) {
      var q = T(x0 + cols * 20, y0 - 8, CBG[gi % CBG.length], 9, 'middle', 'ovsmall') + '<path d="M' + (x0 - 6) + ' ' + (y0 - 4) + ' h' + (cols * 40 + 2) + '" class="ckcbl"/>';
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var id = 'CB' + (idx++), x = x0 + 14 + c * 40, y = y0 + 16 + r * 40, pulled = !!S[id], mon = (c + r) % 5 === 0;
        q += T(x, y - 12, String.fromCharCode(65 + r) + (c + 1), 6, 'middle', 'ovsmall') + '<g ' + act('xtog', undefined, undefined, ' data-id="' + id + '"') + '>' + R(x - 14, y - 10, 28, 30, 'ckhit') + (pulled ? C(x, y + 4, 10, 'ckcbw') : '') + C(x, y + 4, pulled ? 7 : 9, mon ? 'ckcbg' : 'ckcb') + '</g>';
      }
      return q;
    };
    var gi = 0;
    for (var by = 0; by < 4; by++) { s += field(366, 60 + by * 170, 9, 3, gi++) + field(760, 60 + by * 170, 9, 3, gi++); }
    for (var by2 = 0; by2 < 4; by2++) s += field(1186, 60 + by2 * 170, 8, 3, gi++);
    s += T(754, 742, 'Antippen zieht die Sicherung (weißer Ring sichtbar), nochmal drücken setzt sie zurück. Grüne Kappe = überwachte Sicherung.', 9, 'middle', 'ovsmall');
    return s;
  }

  var SIZE = { glare: [1900, 280], main: [2230, 660], ped: [900, 1520], upper: [1569, 760] };
  var COLS = { glare: [[0, 560], [560, 1340], [1330, 1900]], main: [[0, 790], [790, 1430], [1430, 2230]], ped: [[0, 300], [270, 630], [600, 900]], upper: [[0, 346], [340, 1166], [1164, 1569]] };
  function svg(tab, api) {
    A = api; S = A.S; N = A.N; CL = 0;
    [1, 2].forEach(function (i) { S['ENGRUN' + i] = on() && V('ENGMASTER' + i, 1) === 0 && (S.APUBLEED || S.ENGRUN1 || S.ENGRUN2 || S['ENGRUN' + i]) ? 1 : 0; });
    if (N.RMPA1 === undefined) { N.RMPA1 = 121800; N.RMPS1 = 118700; N.RMPA2 = 121500; N.RMPS2 = 122800; }
    var body = tab === 'glare' ? glareSvg() : tab === 'main' ? mainSvg() : tab === 'ped' ? pedSvg() : upperSvg(), z = SIZE[tab];
    var il = on() ? A.val(A.find('OVHDLT')) : 0;
    return '<svg class="ovsvg ck' + (il ? ' integ i' + il : '') + ' dome d2" viewBox="0 0 ' + z[0] + ' ' + z[1] + '" width="' + z[0] + '" height="' + z[1] + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }
  function click(x, api) {
    A = api; S = A.S; N = A.N;
    var t = x.dataset.a, k = x.dataset.k, v = x.dataset.v;
    if (t === 'xcnum') {
      var d = +v;
      if (k === 'SPD') { N.SPD = Math.max(100, Math.min(399, N.SPD + d)); N.SPDM = 0; }
      else if (k === 'HDG') { N.HDG = (N.HDG + d + 360) % 360; N.HDGM = 0; }
      else if (k === 'ALT') { N.ALT = Math.max(100, Math.min(49000, Math.round((N.ALT + d) / 100) * 100)); }
      else if (k === 'VS') { N.VS = Math.max(-6000, Math.min(6000, N.VS + d)); N.VSM = 0; }
      else if (k === 'QNH') { N.QNH = Math.max(900, Math.min(1100, N.QNH + d)); N.STD = 0; }
      else if (k === 'RT') N.RT = Math.max(-200, Math.min(200, (N.RT || 0) + d));
    } else if (t === 'xcman') { var m = k + 'M'; N[m] = N[m] ? 0 : 1; }
    else if (t === 'xcstd') N.STD = N.STD ? 0 : 1;
    else if (t === 'xcstep') N.ALTSTEP = (N.ALTSTEP || 100) === 100 ? 1000 : 100;
    else if (t === 'xcset') { N[k] = +v; if (k === 'TLD') N.TL = [0, 0, 60, 85, 100][+v]; }
    else if (t === 'xctocfg') { N.TOCFG = 1; A.setEcam('WHEEL'); }
    else if (t === 'xcrmp') { if (v === 'swap') { var a = N['RMPA' + k]; N['RMPA' + k] = N['RMPS' + k]; N['RMPS' + k] = a; } else { var f = N['RMPS' + k] + (+v); if (f < 118000) f += 19000; if (f > 136975) f -= 19000; N['RMPS' + k] = f; } }
    else if (t === 'xcsq') { if (k === 'C') N.SQKE = ''; else { N.SQKE = (N.SQKE || '') + k; if (N.SQKE.length === 4) { N.SQK = +N.SQKE; N.SQKE = ''; } } }
    else if (t === 'xcgo') { var b = document.querySelector('#tabs [data-t="' + k + '"]'); if (b) { b.click(); return; } }
    A.redraw();
  }
  return { svg: svg, click: click, size: SIZE, cols: COLS };
})();
