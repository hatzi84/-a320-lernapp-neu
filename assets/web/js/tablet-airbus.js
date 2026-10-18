/* Entwurf: Airbus-A320-Tablet. Reiter Overhead, Mittelkonsole · FCU, MCDU, Boden.
   Anordnung und Beschriftung nach Referenzbildern (referenz/a320/QUELLEN.md). Zustände sind Beispielwerte, im Betrieb kommen sie vom Sim. */
window.VpAAirbus = (function () {
  var S = {}, G = {}, F = {}, N = { SPD: 250, HDG: 90, ALT: 4000, VS: 0, QNH: 1013, TL: 0, FLAPS: 0, SB: 0, FUEL: 6500, SQK: 2000 }, ECAM = 'ENG', root, tab = 'ovhd';

  /* ---------- Bausteine der Panel-Beschreibung ---------- */
  function pb(id, lab, o) { o = o || {}; o.k = o.k || 'pb'; o.id = id; o.lab = lab; return o; }
  function kn(id, lab, pos, d, o) { o = o || {}; o.k = 'kn'; o.id = id; o.lab = lab; o.pos = pos; o.d = d || 0; return o; }
  function tg(id, lab, pos, d, o) { o = o || {}; o.k = 'tg'; o.id = id; o.lab = lab; o.pos = pos; o.d = d || 0; return o; }
  function ds(t, lab) { return { k: 'ds', t: t, lab: lab }; }
  function tx(t) { return { k: 'tx', t: t }; }
  var P = function (t, rows, o) { o = o || {}; o.t = t; o.rows = rows; return o; };

  var OVERHEAD = {
    left: [
      P('ADIRS', [[kn('IR1', 'IR 1', ['OFF', 'NAV', 'ATT'], 0), kn('IR3', 'IR 3', ['OFF', 'NAV', 'ATT'], 0), kn('IR2', 'IR 2', ['OFF', 'NAV', 'ATT'], 0)], [pb('ADR1', 'ADR 1', { f: 1 }), pb('ADR3', 'ADR 3', { f: 1 }), pb('ADR2', 'ADR 2', { f: 1 })], [tx('ON BAT')]]),
      P('FLT CTL', [[pb('ELAC1', 'ELAC 1', { f: 1 }), pb('SEC1', 'SEC 1', { f: 1 }), pb('FAC1', 'FAC 1', { f: 1 })]]),
      P('EVAC', [[pb('EVACCMD', 'COMMAND', { m: 'on', lo: 'ON' }), pb('HORN', 'HORN SHUT OFF', { r: 1, m: 'on' }), tg('CAPT', 'CAPT & PURS', ['CAPT & PURS', 'CAPT', 'PURS'], 1)]]),
      P('EMER ELEC PWR', [[pb('EGENTEST', 'EMER GEN TEST', { g: 'black', m: 'on', lo: 'TEST' }), pb('GEN1LINE', 'GEN 1 LINE', { f: 'SMOKE', m: 'off', lo: 'OFF', def: 1 }), pb('RATMAN', 'RAT & EMER GEN', { g: 'red', m: 'on', lo: 'MAN ON' })]]),
      P('GPWS', [[pb('TERR', 'TERR', { m: 'off', f: 1 }), pb('GPWSSYS', 'SYS', { m: 'off', f: 1 }), pb('GSMODE', 'G/S MODE', { m: 'off', f: 1 }), pb('FLAPMODE', 'FLAP MODE', { m: 'off', f: 1 }), pb('LDGFLAP3', 'LDG FLAP 3', { m: 'on', lo: 'ON' })]]),
      P('RCDR', [[pb('GNDCTL', 'GND CTL', { m: 'on', lo: 'ON' }), pb('CVRERASE', 'CVR ERASE', { r: 1 }), pb('CVRTEST', 'CVR TEST', { r: 1 })]]),
      P('OXYGEN', [[pb('MASKMAN', 'MASK MAN ON', { g: 'red', m: 'on', lo: 'ON' }), pb('PAXOXY', 'PASSENGER', { m: 'on', lo: 'ON', top: 'SYS ON' }), pb('CREWOXY', 'CREW SUPPLY', { m: 'off', def: 1 })]]),
      P('CALLS', [[pb('CALLMECH', 'MECH', { r: 1 }), pb('CALLALL', 'ALL', { r: 1 }), pb('CALLFWD', 'FWD', { r: 1 }), pb('CALLAFT', 'AFT', { r: 1 }), pb('CALLEMER', 'EMER', { m: 'on', lo: 'EMER' })]]),
      P('', [[pb('PA', 'PA', { m: 'on', lo: 'ON', dead: 1 }), pb('DOORVID', 'COCKPIT DOOR VIDEO', { m: 'on', dead: 1 })]]),
      P('RAIN RPLNT · WIPER', [[pb('RPLNTL', 'RAIN RPLNT', { r: 1 }), kn('WIPERL', 'WIPER', ['OFF', 'SLOW', 'FAST'], 0)]])
    ],
    center: [
      P('FIRE', [[pb('ENG1AG1', 'AGENT 1', { m: 'on', top: 'SQUIB', lo: 'DISCH', def: 0, dead: 1 }), pb('ENG1AG2', 'AGENT 2', { m: 'on', top: 'SQUIB', lo: 'DISCH', dead: 1 }), pb('ENG1FIRE', 'ENG 1 FIRE', { g: 'redbig', m: 'on', lo: 'FIRE', dead: 1 }), pb('APUAG', 'APU AGENT', { m: 'on', top: 'SQUIB', lo: 'DISCH', dead: 1 }), pb('APUFIRE', 'APU FIRE', { g: 'redbig', m: 'on', lo: 'FIRE', dead: 1 }), pb('ENG2FIRE', 'ENG 2 FIRE', { g: 'redbig', m: 'on', lo: 'FIRE', dead: 1 }), pb('ENG2AG1', 'AGENT 1', { m: 'on', top: 'SQUIB', lo: 'DISCH', dead: 1 }), pb('ENG2AG2', 'AGENT 2', { m: 'on', top: 'SQUIB', lo: 'DISCH', dead: 1 })], [pb('FIRETEST1', 'TEST ENG 1', { r: 1 }), pb('FIRETESTA', 'TEST APU', { r: 1 }), pb('FIRETEST2', 'TEST ENG 2', { r: 1 })]], { cls: 'wide' }),
      P('HYD', [[pb('HYDG', 'ENG 1 PUMP', { f: 1 }), pb('HYDRAT', 'RAT MAN ON', { g: 'red', m: 'on', lo: 'ON' }), pb('HYDBE', 'BLUE ELEC PUMP', { f: 1, a: 'OVRD' }), pb('PTU', 'PTU', { f: 1, a: 'AUTO' }), pb('HYDY2', 'ENG 2 PUMP', { f: 1 }), pb('HYDYE', 'YELLOW ELEC PUMP', { m: 'on', f: 1, lo: 'ON' })]], { cls: 'wide' }),
      P('FUEL', [[pb('LTK1', 'L TK PUMP 1', { f: 1 }), pb('LTK2', 'L TK PUMP 2', { f: 1 }), pb('CTK1', 'CTR TK PUMP 1', { f: 1 }), pb('XFEED', 'X FEED', { m: 'on', lo: 'ON' }), pb('FUELMODE', 'MODE SEL', { f: 'MAN', def: 1 }), pb('CTK2', 'CTR TK PUMP 2', { f: 1 }), pb('RTK1', 'R TK PUMP 1', { f: 1 }), pb('RTK2', 'R TK PUMP 2', { f: 1 })]], { cls: 'wide' }),
      P('ELEC', [[ds('27.6 V', 'BAT 1'), pb('BAT1', 'BAT 1', { f: 1 }), pb('BAT2', 'BAT 2', { f: 1 }), ds('28.5 V', 'BAT 2'), pb('ACESS', 'AC ESS FEED', { m: 'off', f: 1, lo: 'ALTN', inv: 1 }), pb('GALLEY', 'GALLEY & CAB', { a: 'AUTO', m: 'off' }), pb('IDG1', 'IDG 1', { g: 'redgrid', m: 'on', f: 1, lo: 'DISC' })], [pb('GEN1', 'GEN 1', { f: 1 }), pb('APUGEN', 'APU GEN', { f: 1 }), pb('BUSTIE', 'BUS TIE', { a: 'AUTO', m: 'off' }), pb('EXT', 'EXT PWR', { k: 'ext', m: 'on' }), pb('GEN2', 'GEN 2', { f: 1 }), pb('IDG2', 'IDG 2', { g: 'redgrid', m: 'on', f: 1, lo: 'DISC' })]], { cls: 'wide' }),
      P('AIR COND', [[kn('PACKFLOW', 'PACK FLOW', ['LO', 'NORM', 'HI'], 1), kn('TCOCK', 'COCKPIT', ['COLD', '', '', 'HOT'], 2), kn('TFWD', 'FWD CABIN', ['COLD', '', '', 'HOT'], 2), kn('TAFT', 'AFT CABIN', ['COLD', '', '', 'HOT'], 2), pb('HOTAIR', 'HOT AIR', { f: 1 })], [pb('PACK1', 'PACK 1', { f: 1 }), pb('BLEED1', 'ENG 1 BLEED', { f: 1 }), pb('RAMAIR', 'RAM AIR', { m: 'on', lo: 'ON' }), pb('APUBLEED', 'APU BLEED', { m: 'on', lo: 'ON', f: 1 }), kn('XBLEED', 'X BLEED', ['SHUT', 'AUTO', 'OPEN'], 1), pb('BLEED2', 'ENG 2 BLEED', { f: 1 }), pb('PACK2', 'PACK 2', { f: 1 })]], { cls: 'wide' }),
      P('ANTI ICE · PROBE/WINDOW HEAT · CABIN PRESS', [[pb('AIWING', 'WING', { m: 'on', f: 1, lo: 'ON' }), pb('AIENG1', 'ENG 1', { m: 'on', f: 1, lo: 'ON' }), pb('AIENG2', 'ENG 2', { m: 'on', f: 1, lo: 'ON' }), pb('PROBE', 'PROBE/WINDOW HEAT', { a: 'AUTO', m: 'on', lo: 'ON' }), tg('VSCTL', 'MAN V/S CTL', ['UP', '', 'DN'], 1), pb('CPMODE', 'MODE SEL', { f: 'MAN', def: 1 }), kn('LDGELEV', 'LDG ELEV', ['-2', '0', '2', '4', '6', '8', 'AUTO'], 6), pb('DITCH', 'DITCHING', { g: 'black', m: 'on', lo: 'ON' })]], { cls: 'wide' }),
      P('EXT LT', [[tg('STROBE', 'STROBE', ['ON', 'AUTO', 'OFF'], 2), tg('BEACON', 'BEACON', ['ON', 'OFF'], 1), tg('WINGLT', 'WING', ['ON', 'OFF'], 1), tg('NAVLOGO', 'NAV & LOGO', ['1', '2', 'OFF'], 2), tg('RWYTO', 'RWY TURN OFF', ['ON', 'OFF'], 1), tg('LANDL', 'LAND L', ['ON', 'OFF', 'RETRACT'], 2), tg('LANDR', 'LAND R', ['ON', 'OFF', 'RETRACT'], 2), tg('NOSE', 'NOSE', ['T.O', 'TAXI', 'OFF'], 2)]], { cls: 'wide' }),
      P('APU', [[pb('APUM', 'MASTER SW', { m: 'on', f: 1, lo: 'ON' }), pb('APUS', 'START', { m: 'on', k: 'apustart' })]], { cls: 'half' }),
      P('INT LT · SIGNS', [[kn('OVHDLT', 'OVHD INTEG LT', ['OFF', '', '', 'BRT'], 0), tg('ICEIND', 'ICE IND & STBY COMPASS', ['BRT', 'DIM', 'OFF'], 2), tg('DOME', 'DOME', ['BRT', 'DIM', 'OFF'], 2), tg('ANNLT', 'ANN LT', ['TEST', 'BRT', 'DIM'], 1), tg('SEATBELT', 'SEAT BELTS', ['ON', 'OFF'], 1), tg('NOSMOKE', 'NO SMOKING', ['ON', 'AUTO', 'OFF'], 1), tg('EXITLT', 'EMER EXIT LT', ['ON', 'ARM', 'OFF'], 1)]], { cls: 'wide half2' })
    ],
    right: [
      P('FLT CTL', [[pb('ELAC2', 'ELAC 2', { f: 1 }), pb('SEC2', 'SEC 2', { f: 1 }), pb('SEC3', 'SEC 3', { f: 1 }), pb('FAC2', 'FAC 2', { f: 1 })]]),
      P('CARGO VENT', [[pb('AFTISOL', 'AFT ISOL VALVE', { f: 1 })]]),
      P('CARGO SMOKE', [[pb('DISCHF', 'DISCH', { g: 'red', m: 'on', lo: 'DISCH' }), pb('SMOKEFWD', 'FWD', { m: 'on', top: 'SMOKE', lo: 'DISCH' }), pb('SMOKETEST', 'TEST', { r: 1 }), pb('SMOKEAFT', 'AFT', { m: 'on', top: 'SMOKE', lo: 'DISCH' }), pb('DISCHA', 'DISCH', { g: 'red', m: 'on', lo: 'DISCH' })]]),
      P('VENTILATION', [[pb('BLOWER', 'BLOWER', { f: 1, a: 'OVRD' }), pb('EXTRACT', 'EXTRACT', { f: 1, a: 'OVRD' }), pb('CABFANS', 'CAB FANS', { m: 'off', def: 1 })]]),
      P('ENG', [[pb('MANSTART1', 'MAN START 1', { m: 'on', top: 'ON', lo: 'ON' }), pb('MANSTART2', 'MAN START 2', { m: 'on', top: 'ON', lo: 'ON' }), pb('N1MODE1', 'N1 MODE 1', { m: 'on', f: 1, lo: 'ON' }), pb('N1MODE2', 'N1 MODE 2', { m: 'on', f: 1, lo: 'ON' })]]),
      P('WIPER · RAIN RPLNT', [[kn('WIPERR', 'WIPER', ['OFF', 'SLOW', 'FAST'], 0), pb('RPLNTR', 'RAIN RPLNT', { r: 1 })]])
    ]
  };

  OVERHEAD.extra = [P('', [[pb('IRPB1', 'IR 1', { f: 1, f2: 'ALIGN' }), pb('IRPB3', 'IR 3', { f: 1 }), pb('IRPB2', 'IR 2', { f: 1 }), pb('COMM', 'COMMERCIAL', { m: 'off', def: 1 })]])];

  /* ---------- Vorgabewerte (Beispiele für Voreinstellungen) ---------- */
  var PRESET = {
    cold: { S: { BAT1: 0, BAT2: 0, EXT: 0, GEN1: 1, GEN2: 1, APUGEN: 1, IR1: 0, IR2: 0, IR3: 0, LTK1: 0, LTK2: 0, CTK1: 0, CTK2: 0, RTK1: 0, RTK2: 0, APUM: 0, APUS: 0, STROBE: 2, BEACON: 1, SEATBELT: 1 }, F: {} },
    ready: { S: { BAT1: 1, BAT2: 1, EXT: 1, GEN1: 1, GEN2: 1, APUGEN: 1, IR1: 1, IR2: 1, IR3: 1, LTK1: 1, LTK2: 1, CTK1: 1, CTK2: 1, RTK1: 1, RTK2: 1, APUM: 1, APUS: 1, STROBE: 1, BEACON: 0, SEATBELT: 0, NAVLOGO: 0 }, F: { GEN1: 1, GEN2: 1, HYDG: 1, HYDY2: 1, ELAC1: 0 } }
  };
  function apply(name) { var p = PRESET[name]; S = JSON.parse(JSON.stringify(p.S)); F = JSON.parse(JSON.stringify(p.F)); G = {}; }

  /* ---------- Zustand ---------- */
  function def(c) {
    if (c.k === 'kn' || c.k === 'tg') return c.d;
    return c.m === 'on' ? (c.def || 0) : (c.def === 0 ? 0 : 1);
  }
  function val(c) { return S[c.id] !== undefined ? S[c.id] : def(c); }
  function power() { return !!(S.BAT1 || S.BAT2 || S.EXT); }
  function lit(c) {
    var v = val(c);
    if (!power() && !c.dead) return { f: 0, lo: 0 };
    if (c.dead && !power()) return { f: 0, lo: 0 };
    var l = { f: 0, lo: 0 };
    if (c.k === 'ext') { l.top = S.GPU && !v; l.lo = v; l.loText = 'ON'; return l; }
    if (c.k === 'apustart') { l.lo = v; l.top = S.APUM && S.APUS; l.topText = 'AVAIL'; l.loText = 'ON'; return l; }
    if (c.f) l.f = (typeof c.f === 'string' ? F[c.id] : F[c.id]) ? 1 : 0;
    if (c.m === 'on') l.lo = v === 1; else l.lo = v === 0;
    if (c.inv) l.lo = v === 0;
    return l;
  }

  /* ---------- Darstellung ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function cls(t) { return t === 'ON' || t === 'MAN ON' ? 'bl' : t === 'AVAIL' ? 'gr' : t === 'DISCH' || t === 'FAULT' || t === 'SMOKE' || t === 'FIRE' || t === 'SQUIB' || t === 'DISC' ? 'am' : 'wh'; }
  function pbH(c) {
    var v = val(c), l = lit(c), h = '', topT = c.k === 'ext' ? 'AVAIL' : c.k === 'apustart' ? 'AVAIL' : (typeof c.f === 'string' ? c.f : 'FAULT'), top = c.k === 'ext' || c.k === 'apustart' ? l.top : l.f;
    var loT = c.k === 'ext' ? 'ON' : c.k === 'apustart' ? 'ON' : (c.lo || (c.m === 'on' ? 'ON' : 'OFF'));
    if (c.top && !c.f && c.k !== 'ext' && c.k !== 'apustart') { topT = c.top; top = c.m === 'on' ? v === 1 && power() : 0; }
    var showTop = c.f || c.k === 'ext' || c.k === 'apustart' || c.top;
    var face;
    if (c.r) face = '<span class="abr"></span>';
    else face = '<span class="abw ' + (showTop ? cls(topT) : '') + (top ? ' lit' : '') + (showTop ? '' : ' none') + '">' + (showTop ? esc(topT) : '') + '</span><span class="abw ' + cls(loT) + (l.lo ? ' lit' : '') + '">' + esc(loT) + '</span>';
    var guard = c.g && (c.g === 'red' || c.g === 'redbig' || c.g === 'redgrid' || c.g === 'black') ? '<span class="abg ' + c.g + (G[c.id] ? ' open' : '') + '"></span>' : '';
    var amb = c.a ? '<span class="abs">' + esc(c.a) + '</span>' : '';
    return '<div class="abi" data-id="' + c.id + '"><div class="abl">' + esc(c.lab) + '</div><div class="abpbw' + (c.g === 'redbig' ? ' big' : '') + '"><button class="abpb' + (c.r ? ' rd' : '') + (v ? ' on' : '') + '" data-a="pb" data-id="' + c.id + '" aria-label="' + esc(c.lab) + '">' + face + '</button>' + guard + '</div>' + amb + '</div>';
  }
  function angles(n) { var span = n <= 2 ? 70 : n === 3 ? 100 : n <= 5 ? 130 : 160, a = []; for (var i = 0; i < n; i++) a.push(n === 1 ? 0 : -span / 2 + span * i / (n - 1)); return a; }
  function knH(c) {
    var v = val(c), n = c.pos.length, A = angles(n), a = A[v], lab = '';
    for (var i = 0; i < n; i++) { if (!c.pos[i]) continue; var r = (A[i] - 90) * Math.PI / 180; lab += '<text x="' + (50 + 41 * Math.cos(r)).toFixed(1) + '" y="' + (52 + 41 * Math.sin(r)).toFixed(1) + '" text-anchor="middle" class="' + (i === v ? 'sel' : '') + '">' + esc(c.pos[i]) + '</text>'; }
    return '<div class="abi"><div class="abl">' + esc(c.lab) + '</div><svg class="abkn" viewBox="0 0 100 100" data-a="kn" data-id="' + c.id + '" role="slider" aria-label="' + esc(c.lab) + '" aria-valuetext="' + esc(c.pos[v] || '') + '">' + lab + '<circle cx="50" cy="52" r="24" fill="#d8dbdf" stroke="#6b7078" stroke-width="2"/><g transform="rotate(' + a + ' 50 52)"><rect x="46" y="28" width="8" height="26" rx="2" fill="#3a3d42"/><rect x="48.2" y="30" width="3.6" height="22" fill="#fff"/></g></svg></div>';
  }
  function tgH(c) {
    var v = val(c), n = c.pos.length, y = n === 1 ? 30 : 14 + 32 * v / (n - 1), lab = '';
    for (var i = 0; i < n; i++) { if (!c.pos[i]) continue; lab += '<text x="46" y="' + (18 + 32 * i / (n - 1) + 3) + '" class="' + (i === v ? 'sel' : '') + '">' + esc(c.pos[i]) + '</text>'; }
    return '<div class="abi"><div class="abl">' + esc(c.lab) + '</div><svg class="abtg" viewBox="0 0 110 60" data-a="tg" data-id="' + c.id + '" role="switch" aria-label="' + esc(c.lab) + '" aria-valuetext="' + esc(c.pos[v] || '') + '"><circle cx="22" cy="30" r="13" fill="#2a2d31" stroke="#8a9098" stroke-width="2"/><line x1="22" y1="30" x2="22" y2="' + y + '" stroke="#c9ccd1" stroke-width="7" stroke-linecap="round"/><circle cx="22" cy="' + y + '" r="6" fill="#e6e8ea"/>' + lab + '</svg></div>';
  }
  function itemH(c) {
    if (c.k === 'pb' || c.k === 'ext' || c.k === 'apustart') return pbH(c);
    if (c.k === 'kn') return knH(c);
    if (c.k === 'tg') return tgH(c);
    if (c.k === 'ds') return '<div class="abi"><div class="abl">' + esc(c.lab) + '</div><div class="abds' + (power() ? '' : ' off') + '">' + (power() ? esc(c.t) : '') + '</div></div>';
    return '<div class="abi"><div class="abl">' + esc(c.t) + '</div></div>';
  }
  function panelH(p) { return '<section class="abp ' + (p.cls || '') + '">' + (p.t ? '<h4>' + esc(p.t) + '</h4>' : '') + p.rows.map(function (r) { return '<div class="abrow">' + r.map(itemH).join('') + '</div>'; }).join('') + '</section>'; }
  function col(a) { return '<div class="abcol">' + a.map(panelH).join('') + '</div>'; }

  /* ---------- Overhead als maßstabsgetreue Zeichnung (Koordinaten nach Vorlage 1569 × 1212 px) ---------- */
  var OW = 1569, OH = 1212;
  /* Panels: [x, y, Breite, Höhe] */
  var PNL = [[6, 58, 334, 84], [6, 146, 334, 236], [6, 386, 334, 60], [6, 450, 334, 86], [6, 540, 334, 82], [6, 626, 334, 88], [6, 718, 334, 78], [6, 800, 334, 64], [6, 868, 334, 78], [6, 950, 334, 78], [6, 1032, 334, 168],
    [346, 30, 816, 122], [346, 156, 816, 134], [346, 294, 816, 102], [346, 400, 816, 124], [346, 528, 816, 190], [346, 722, 816, 206], [350, 932, 812, 92], [350, 1028, 378, 172], [732, 1028, 72, 172], [808, 1028, 354, 172],
    [1168, 12, 368, 148], [1168, 164, 368, 152], [1168, 320, 368, 196], [1180, 520, 356, 86], [1184, 610, 352, 122], [1184, 736, 352, 96], [1184, 836, 352, 80], [1184, 920, 352, 96], [1184, 1020, 352, 150]];
  /* Platz je Bedienelement: id -> [x, y] Mitte */
  var POS = { PA: [140, 112], DOORVID: [272, 112], IRPB1: [74, 226], IRPB3: [172, 226], IRPB2: [272, 226], IR1: [74, 298], IR3: [172, 298], IR2: [272, 298], ADR1: [74, 354], ADR3: [172, 354], ADR2: [272, 354],
    ELAC1: [146, 512], SEC1: [210, 512], FAC1: [274, 512], EVACCMD: [133, 596], HORN: [211, 596], CAPT: [256, 594], EGENTEST: [58, 682], GEN1LINE: [134, 682], RATMAN: [232, 680],
    TERR: [50, 774], GPWSSYS: [114, 773], GSMODE: [180, 772], FLAPMODE: [236, 771], LDGFLAP3: [292, 770], GNDCTL: [130, 838], CVRERASE: [208, 834], CVRTEST: [284, 830],
    MASKMAN: [127, 916], PAXOXY: [208, 918], CREWOXY: [289, 914], CALLMECH: [50, 1000], CALLALL: [112, 998], CALLFWD: [172, 996], CALLAFT: [234, 994], CALLEMER: [290, 990], RPLNTL: [124, 1074], WIPERL: [258, 1088],
    ENG1AG1: [406, 204], ENG1FIRE: [518, 224], ENG1AG2: [630, 198], FIRETEST1: [406, 266], APUFIRE: [752, 198], APUAG: [697, 266], FIRETESTA: [813, 258], ENG2AG1: [877, 192], ENG2FIRE: [992, 218], ENG2AG2: [1104, 186], FIRETEST2: [1104, 266],
    HYDG: [517, 380], HYDRAT: [634, 374], HYDBE: [758, 374], PTU: [880, 338], HYDY2: [1000, 368], HYDYE: [1086, 360],
    LTK1: [486, 492], LTK2: [550, 490], CTK1: [690, 488], XFEED: [760, 430], FUELMODE: [762, 494], CTK2: [833, 486], RTK1: [968, 482], RTK2: [1038, 480],
    COMM: [441, 560], GALLEY: [441, 621], BAT1: [721, 566], BAT2: [762, 566], ACESS: [930, 578], IDG1: [442, 684], GEN1: [527, 684], APUGEN: [662, 682], BUSTIE: [765, 660], EXT: [866, 670], GEN2: [1007, 672], IDG2: [1090, 670],
    PACKFLOW: [455, 786], TCOCK: [640, 780], TFWD: [767, 778], TAFT: [893, 774], HOTAIR: [1075, 766], PACK1: [430, 856], PACK2: [1108, 828], BLEED1: [530, 892], RAMAIR: [656, 888], APUBLEED: [770, 888], XBLEED: [895, 888], BLEED2: [1013, 882],
    AIWING: [419, 990], AIENG1: [585, 988], AIENG2: [662, 986], PROBE: [772, 982], VSCTL: [876, 994], CPMODE: [948, 988], LDGELEV: [1040, 984], DITCH: [1127, 974],
    STROBE: [415, 1086], BEACON: [492, 1088], WINGLT: [576, 1088], NAVLOGO: [671, 1084], RWYTO: [423, 1160], LANDL: [499, 1162], LANDR: [588, 1162], NOSE: [671, 1164],
    APUM: [774, 1092], APUS: [777, 1152], OVHDLT: [870, 1084], ICEIND: [950, 1082], DOME: [1025, 1082], ANNLT: [1108, 1080], SEATBELT: [870, 1140], NOSMOKE: [940, 1140], EXITLT: [1108, 1136],
    ELAC2: [1259, 578], SEC2: [1326, 577], SEC3: [1391, 576], FAC2: [1458, 574], AFTISOL: [1478, 652], DISCHF: [1252, 796], SMOKEFWD: [1297, 800], SMOKETEST: [1363, 798], SMOKEAFT: [1438, 800], DISCHA: [1493, 794],
    BLOWER: [1253, 886], EXTRACT: [1325, 886], CABFANS: [1491, 886], MANSTART1: [1258, 978], MANSTART2: [1335, 974], N1MODE1: [1425, 972], N1MODE2: [1499, 972], WIPERR: [1305, 1080], RPLNTR: [1418, 1052] };
  /* Feste Beschriftungen: [x, y, Text, Größe, Ausrichtung] */
  var TXT = [[172, 160, 'ADIRS', 15], [180, 470, 'FLT CTL', 14], [180, 556, 'EVAC', 14], [175, 640, 'EMER ELEC PWR', 13], [82, 729, 'GPWS', 10], [52, 816, 'RCDR', 13], [52, 912, 'OXYGEN', 12], [172, 962, 'CALLS', 14], [140, 1044, 'RAIN RPLNT', 13], [272, 1044, 'WIPER', 11],
    [517, 182, 'ENG 1', 18], [752, 168, 'APU', 18], [992, 172, 'ENG 2', 18], [772, 946, 'PROBE / WINDOW HEAT', 11], [535, 950, 'ANTI ICE', 13], [955, 944, 'CABIN PRESS', 12], [540, 1044, 'EXT LT', 12], [768, 1040, 'APU', 13], [990, 1040, 'INT LT', 12],
    [1358, 532, 'FLT CTL', 13], [1290, 622, 'CARGO VENT', 10], [1345, 752, 'CARGO  SMOKE', 10], [1366, 842, 'VENTILATION', 10], [1296, 930, 'ENG MAN START', 9], [1462, 930, 'ENG N1 MODE', 9], [1305, 1032, 'WIPER', 10], [1418, 1028, 'RAIN RPLNT', 10],
    [441, 593, 'GALY & CAB', 9], [634, 546, 'BAT 1', 9], [742, 540, 'BAT', 9], [846, 546, 'BAT 2', 9], [930, 552, 'AC ESS FEED', 9], [662, 650, 'APU GEN', 9], [866, 638, 'EXT PWR', 9], [442, 652, 'IDG 1', 9], [1090, 634, 'IDG 2', 9], [527, 652, 'GEN 1', 9], [1007, 642, 'GEN 2', 9], [765, 630, 'BUS TIE', 9],
    [455, 736, 'PACK FLOW', 9], [1075, 734, 'HOT AIR', 9], [430, 826, 'PACK 1', 9], [1108, 796, 'PACK 2', 9], [530, 860, 'ENG 1 BLEED', 9], [656, 856, 'RAM AIR', 9], [770, 856, 'APU BLEED', 9], [895, 818, 'X BLEED', 9], [1013, 850, 'ENG 2 BLEED', 9]];
  /* Systembild-Linien (Synoptik) und Kästen */
  var SYN = [
    /* HYD */ 'M517 362 V318', 'M517 318 L517 312', 'M758 356 V306', 'M996 350 V300', 'M560 318 H710', 'M880 318 H960', 'M640 330 H700',
    /* FUEL */ 'M486 472 V448 H550 V472', 'M518 448 V436', 'M690 470 V444 H833 V468', 'M681 444 V430', 'M968 462 V440 H1038 V462', 'M998 440 V424', 'M518 436 V430', 'M550 448 H690', 'M833 444 H968',
    /* ELEC */ 'M518 562 V594', 'M518 616 V666', 'M560 606 H720', 'M812 606 H970', 'M1008 550 V582', 'M1010 604 V654', 'M470 690 H500', 'M1035 676 H1062', 'M560 640 H1000', 'M765 640 V632',
    /* AIR COND */ 'M560 812 H1020', 'M560 812 V870', 'M770 812 V870', 'M1013 812 V860', 'M656 812 V860', 'M520 830 H560', 'M1020 830 H1060', 'M640 812 V804', 'M767 812 V804', 'M893 812 V804' ];
  var BOX = [[517, 300, 'GREEN'], [758, 294, 'BLUE'], [996, 288, 'YELLOW'], [518, 424, 'ENG 1'], [681, 420, 'APU'], [998, 412, 'ENG 2'], [518, 550, 'DC BUS 1'], [518, 606, 'AC BUS 1'], [767, 600, 'AC ESS BUS'], [1008, 538, 'DC BUS 2'], [1010, 594, 'AC BUS 2'], [640, 734, 'COCKPIT'], [767, 732, 'FWD CABIN'], [893, 728, 'AFT CABIN'], [540, 828, 'PACK 1'], [1028, 818, 'PACK 2']];
  var SIDE = [[362, 222, 'FIRE'], [1146, 222, 'FIRE'], [362, 344, 'HYD'], [1146, 344, 'HYD'], [362, 462, 'FUEL'], [1146, 462, 'FUEL'], [362, 622, 'ELEC'], [1146, 622, 'ELEC'], [362, 824, 'AIR COND'], [1146, 824, 'AIR COND']];

  function t(x, y, s, size, anchor, cls) { return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 9) + '" text-anchor="' + (anchor || 'middle') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(s) + '</text>'; }
  function screw(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="5" class="ovscr"/><path d="M' + (x - 3) + ' ' + (y - 1) + 'L' + (x + 3) + ' ' + (y + 1) + '" class="ovslot"/>'; }
  function legend(c) { /* Texte und Farben der beiden Leuchtfelder */
    var top = c.k === 'ext' || c.k === 'apustart' ? 'AVAIL' : c.top || (c.f ? (typeof c.f === 'string' ? c.f : 'FAULT') : ''), lo = c.k === 'ext' || c.k === 'apustart' ? 'ON' : c.lo || (c.m === 'on' ? 'ON' : 'OFF');
    return { top: top, lo: lo };
  }
  var LC = { FAULT: 'a', SMOKE: 'a', DISCH: 'a', SQUIB: 'w', FIRE: 'r', DISC: 'a', MAN: 'w', AVAIL: 'g', ON: 'b', 'MAN ON': 'b', OFF: 'w', ALTN: 'w', TEST: 'w', EMER: 'a', 'SYS ON': 'w' };
  function pbSvg(c, x, y) {
    var v = val(c), l = lit(c), g = legend(c), w = 46, h = 46, big = c.g === 'redbig';
    var topLit = c.k === 'ext' || c.k === 'apustart' ? l.top : c.top && !c.f ? (c.m === 'on' ? v === 1 && power() : 0) : l.f;
    var s = '<g class="ovpb" data-a="pb" data-id="' + c.id + '">';
    if (big) { /* Feuergriff */
      s += '<rect x="' + (x - 64) + '" y="' + (y - 30) + '" width="128" height="60" rx="6" class="ovfire' + (v ? ' on' : '') + '"/><rect x="' + (x - 46) + '" y="' + (y - 14) + '" width="92" height="28" rx="3" class="ovfirew"/>' + t(x, y + 3, 'FIRE', 20, 'middle', 'ovfiret') + t(x, y + 20, 'PUSH', 10, 'middle', 'ovfiret2') + '<circle cx="' + x + '" cy="' + (y + 38) + '" r="6" class="ovfirering"/>';
      return s + '</g>';
    }
    if (c.r) { s += '<circle cx="' + x + '" cy="' + y + '" r="15" class="ovround"/><circle cx="' + x + '" cy="' + y + '" r="10" class="ovround2"/>'; return s + '</g>'; }
    s += '<rect x="' + (x - w / 2 - 3) + '" y="' + (y - h / 2 - 3) + '" width="' + (w + 6) + '" height="' + (h + 6) + '" rx="3" class="ovbez"/><rect x="' + (x - w / 2) + '" y="' + (y - h / 2) + '" width="' + w + '" height="' + h + '" rx="2" class="ovcap"/>';
    if (g.top) s += '<rect x="' + (x - 18) + '" y="' + (y - 19) + '" width="36" height="15" rx="1" class="ovleg k' + (LC[g.top] || 'w') + (topLit ? ' lit' : '') + '"/>' + t(x, y - 8, g.top, 8, 'middle', 'ovlt k' + (LC[g.top] || 'w') + (topLit ? ' lit' : ''));
    s += '<rect x="' + (x - 18) + '" y="' + (y + 3) + '" width="36" height="15" rx="1" class="ovleg k' + (LC[g.lo] || 'w') + (l.lo ? ' lit' : '') + (c.k === 'ext' || c.k === 'apustart' || g.lo === 'ON' ? ' ovfr' : '') + '"/>' + t(x, y + 14, g.lo, 8, 'middle', 'ovlt k' + (LC[g.lo] || 'w') + (l.lo ? ' lit' : ''));
    if (c.g && c.g !== 'redbig') { var open = !!G[c.id], col = c.g === 'black' ? 'ovgb' : c.g === 'redgrid' ? 'ovgr grid' : 'ovgr';
      s += open ? '<rect x="' + (x - 27) + '" y="' + (y - 52) + '" width="54" height="18" rx="3" class="' + col + '"/>' : '<rect x="' + (x - 27) + '" y="' + (y - 27) + '" width="54" height="56" rx="4" class="' + col + '"/>' + (c.g === 'redgrid' ? '<path d="M' + (x - 27) + ' ' + (y - 8) + 'H' + (x + 27) + 'M' + (x - 27) + ' ' + (y + 10) + 'H' + (x + 27) + 'M' + x + ' ' + (y - 27) + 'V' + (y + 29) + '" class="ovgline"/>' : ''); }
    if (c.a) s += '<text x="' + (x + 33) + '" y="' + y + '" font-size="8" text-anchor="middle" class="ovsmall" transform="rotate(90 ' + (x + 33) + ' ' + y + ')">' + esc(c.a) + '</text>';
    return s + '</g>';
  }
  function knSvg(c, x, y) {
    var v = val(c), n = c.pos.length, A = angles(n), s = '<g class="ovkn" data-a="kn" data-id="' + c.id + '">';
    for (var i = 0; i < n; i++) { if (!c.pos[i]) { var rr = (A[i] - 90) * Math.PI / 180; s += '<circle cx="' + (x + 30 * Math.cos(rr)).toFixed(1) + '" cy="' + (y + 30 * Math.sin(rr)).toFixed(1) + '" r="1.6" class="ovdot"/>'; continue; } var r = (A[i] - 90) * Math.PI / 180; s += t((x + 38 * Math.cos(r)).toFixed(1), (y + 38 * Math.sin(r) + 3).toFixed(1), c.pos[i], 9, 'middle', i === v ? 'ovsel' : ''); }
    var a = A[v];
    s += '<circle cx="' + x + '" cy="' + y + '" r="24" class="ovkbase"/><g transform="rotate(' + a + ' ' + x + ' ' + y + ')"><path d="M' + (x - 9) + ' ' + (y + 18) + ' L' + (x - 6) + ' ' + (y - 22) + ' Q' + x + ' ' + (y - 27) + ' ' + (x + 6) + ' ' + (y - 22) + ' L' + (x + 9) + ' ' + (y + 18) + ' Z" class="ovkhead"/><line x1="' + x + '" y1="' + (y - 20) + '" x2="' + x + '" y2="' + (y - 4) + '" class="ovkmark"/></g>';
    return s + '</g>';
  }
  function tgSvg(c, x, y) {
    var v = val(c), n = c.pos.length, s = '<g class="ovtg" data-a="tg" data-id="' + c.id + '">';
    for (var i = 0; i < n; i++) { if (!c.pos[i]) continue; var yy = y - 20 + (n === 1 ? 20 : 40 * i / (n - 1)); s += t(x + 18, yy + 3, c.pos[i], 9, 'start', i === v ? 'ovsel' : ''); }
    var ang = n === 1 ? 0 : -50 + 100 * v / (n - 1);
    s += '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" rx="14" class="ovtbase"/><circle cx="' + x + '" cy="' + y + '" r="9" class="ovtnut"/><g transform="rotate(' + (ang < 0 ? 180 + ang : ang) + ' ' + x + ' ' + y + ')"><rect x="' + (x - 3.5) + '" y="' + y + '" width="7" height="26" rx="3" class="ovtlever"/><circle cx="' + x + '" cy="' + (y + 27) + '" r="5" class="ovtlever"/></g>';
    return s + '</g>';
  }
  function ovhdSvg() {
    var il = power() ? val(find('OVHDLT')) : 0, dm = power() ? 2 - val(find('DOME')) : 0;
    var s = '<svg class="ovsvg' + (il ? ' integ i' + il : '') + (dm ? ' dome d' + dm : '') + '" viewBox="0 0 ' + OW + ' ' + OH + '" width="' + OW + '" height="' + OH + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<rect width="' + OW + '" height="' + OH + '" class="ovbg"/>';
    PNL.forEach(function (p) { s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + p[2] + '" height="' + p[3] + '" rx="4" class="ovpnl"/>' + screw(p[0] + 12, p[1] + 12) + screw(p[0] + p[2] - 12, p[1] + 12) + screw(p[0] + 12, p[1] + p[3] - 12) + screw(p[0] + p[2] - 12, p[1] + p[3] - 12); });
    SYN.forEach(function (d) { s += '<path d="' + d + '" class="ovsyn"/>'; });
    BOX.forEach(function (b) { var w = b[2].length * 6.2 + 14; s += '<rect x="' + (b[0] - w / 2) + '" y="' + (b[1] - 8) + '" width="' + w + '" height="16" class="ovbox"/>' + t(b[0], b[1] + 4, b[2], 9); });
    SIDE.forEach(function (d) { var ch = d[2].replace(' ', '').split(''); ch.forEach(function (k, i) { s += t(d[0], d[1] - ch.length * 7 + i * 14, k, 13, 'middle', 'ovside'); }); });
    TXT.forEach(function (d) { s += t(d[0], d[1], d[2], d[3] || 9, d[4] || 'middle', d[3] >= 11 ? 'ovtitle' : ''); });
    /* Batterie-Anzeigen */
    [[634, 567, '27.6 V'], [846, 562, '28.5 V']].forEach(function (d) { s += '<rect x="' + (d[0] - 40) + '" y="' + (d[1] - 14) + '" width="80" height="28" rx="2" class="ovds"/>' + (power() ? t(d[0], d[1] + 6, d[2], 16, 'middle', 'ovdst') : ''); });
    s += '<rect x="148" y="170" width="50" height="16" rx="2" class="ovds"/>' + t(172, 404, 'ON BAT', 9);
    /* Bedienelemente */
    Object.keys(POS).forEach(function (id) { var c = find(id), p = POS[id]; if (!c) return; REG[id] = c;
      var lab = LABS[id] || c.lab;
      if (!(id in NOLAB)) s += t(p[0], p[1] - (c.k === 'kn' ? 46 : c.k === 'tg' ? 30 : c.g === 'redbig' ? 40 : c.r ? 22 : 30), lab, 9, 'middle', 'ovlab');
      s += c.k === 'kn' ? knSvg(c, p[0], p[1]) : c.k === 'tg' ? tgSvg(c, p[0], p[1]) : pbSvg(c, p[0], p[1]); });
    /* drittes Audio-Bedienteil oben rechts (nur Zierde) */
    for (var i = 0; i < 7; i++) { var x = 1218 + i * 38.5; s += '<rect x="' + (x - 14) + '" y="28" width="28" height="18" rx="2" class="ovcap"/><rect x="' + (x - 10) + '" y="30" width="20" height="4" class="ovleg kg lit"/>' + t(x, 44, i === 5 ? 'MECH' : i === 6 ? 'ATT' : 'CALL', 7) + '<circle cx="' + x + '" cy="64" r="11" class="ovkbase"/><circle cx="' + x + '" cy="128" r="11" class="ovkbase"/>'; }
    s += t(1352, 150, '3rd AUDIO CONTROL PANEL', 9, 'middle', 'ovsmall');
    return s + '</svg>';
  }
  var LABS = { LTK1: 'L TK 1', LTK2: 'L TK 2', CTK1: 'CTR TK 1', CTK2: 'CTR TK 2', RTK1: 'R TK 1', RTK2: 'R TK 2', ICEIND: 'ICE IND & STBY', OVHDLT: 'OVHD INTEG LT' };
  var NOLAB = { ENG1FIRE: 1, APUFIRE: 1, ENG2FIRE: 1, TCOCK: 1, TFWD: 1, TAFT: 1, PROBE: 1, IR1: 1, IR2: 1, IR3: 1, RPLNTL: 1, RPLNTR: 1, WIPERL: 1, WIPERR: 1, BAT1: 1, BAT2: 1, ACESS: 1, GALLEY: 1, IDG1: 1, IDG2: 1, GEN1: 1, GEN2: 1, APUGEN: 1, EXT: 1, BUSTIE: 1, PACK1: 1, PACK2: 1, BLEED1: 1, BLEED2: 1, RAMAIR: 1, APUBLEED: 1, HOTAIR: 1, XBLEED: 1, PACKFLOW: 1 };

  var SVGTABS = { ovhd: 1, upper: 1, glare: 1, main: 1, ped: 1 };
  function ovhd() {
    var body = tab === 'ovhd' ? ovhdSvg() : VpACockpit.svg(tab, api());
    return '<div class="abbar"><button class="btn" data-a="preset" data-p="cold">Kalt und dunkel</button><button class="btn" data-a="preset" data-p="ready">Vor dem Anlassen</button>' +
      '<span class="ovz"><button class="btn" data-v="out" aria-label="Verkleinern">−</button><button class="btn" data-v="in" aria-label="Vergrößern">+</button><button class="btn" data-v="fit">Ganz</button><button class="btn" data-v="l">Links</button><button class="btn" data-v="c">Mitte</button><button class="btn" data-v="r">Rechts</button></span></div>' +
      '<div class="ovview" id="ovview"><div class="ovstage" id="ovstage">' + body + '</div></div>' +
      '<p class="abnote">Mit einem Finger verschieben, mit zwei Fingern zoomen (am PC: Mausrad). Anordnung nach dem echten A320, Zustände sind Übungswerte.</p>';
  }

  /* ---------- Verschieben und Zoomen des Overheads ---------- */
  var V = { x: 0, y: 0, s: 0, moved: false };
  function stage() { return root.querySelector('#ovstage'); }
  function view() { return root.querySelector('#ovview'); }
  function sizeView() { var vw = view(); if (!vw) return; var bar = document.querySelector('.tabbar'), top = vw.getBoundingClientRect().top; vw.style.height = Math.max(260, window.innerHeight - top - (bar ? bar.offsetHeight : 0) - 46) + 'px'; }
  function clampV() { var vw = view(), st = stage(); if (!vw || !st) return; var W = st.offsetWidth * V.s, H = st.offsetHeight * V.s, w = vw.clientWidth, h = vw.clientHeight;
    V.x = W < w ? (w - W) / 2 : Math.min(0, Math.max(w - W, V.x)); V.y = H < h ? (h - H) / 2 : Math.min(0, Math.max(h - H, V.y)); }
  function applyV() { var st = stage(); if (!st) return; clampV(); st.style.transform = 'translate(' + V.x + 'px,' + V.y + 'px) scale(' + V.s + ')'; }
  function fitS() { var vw = view(), st = stage(); return Math.min(vw.clientWidth / st.offsetWidth, vw.clientHeight / st.offsetHeight); }
  function zoomAt(f, cx, cy) { var s2 = Math.max(Math.min(fitS(), 0.3), Math.min(2.2, V.s * f)); V.x = cx - (cx - V.x) * s2 / V.s; V.y = cy - (cy - V.y) * s2 / V.s; V.s = s2; applyV(); }
  function goCol(i) { var X = (tab === 'ovhd' ? [[0, 346], [340, 1166], [1164, 1569]] : VpACockpit.cols[tab])[i], vw = view(); V.s = Math.min(1.2, vw.clientWidth / (X[1] - X[0] + 20)); V.x = -X[0] * V.s; V.y = 0; applyV(); }
  function setupView() {
    var vw = view(); if (!vw) return; sizeView();
    if (!V.s) { V.s = Math.max(fitS(), Math.min(0.6, vw.clientWidth / 600)); V.x = 0; V.y = 0; }
    applyV();
    var pts = {}, start = null;
    vw.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; V.moved = false; start = { x: V.x, y: V.y, s: V.s, pts: JSON.parse(JSON.stringify(pts)) }; });
    vw.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts), r = vw.getBoundingClientRect();
      if (ids.length === 1 && start.pts[ids[0]]) { var dx = e.clientX - start.pts[ids[0]].x, dy = e.clientY - start.pts[ids[0]].y; if (!V.moved && Math.abs(dx) + Math.abs(dy) < 8) return; if (!V.moved) { V.moved = true; try { vw.setPointerCapture(e.pointerId); } catch (er) { } } V.x = start.x + dx; V.y = start.y + dy; applyV(); }
      else if (ids.length >= 2) { var a = pts[ids[0]], b = pts[ids[1]], a0 = start.pts[ids[0]], b0 = start.pts[ids[1]]; if (!a0 || !b0) { start = { x: V.x, y: V.y, s: V.s, pts: JSON.parse(JSON.stringify(pts)) }; return; }
        V.moved = true; var d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top, m0x = (a0.x + b0.x) / 2 - r.left, m0y = (a0.y + b0.y) / 2 - r.top;
        var s2 = Math.max(Math.min(fitS(), 0.3), Math.min(2.2, start.s * d1 / d0)); V.x = mx - (m0x - start.x) * s2 / start.s; V.y = my - (m0y - start.y) * s2 / start.s; V.s = s2; applyV(); }
    });
    var up = function (e) { delete pts[e.pointerId]; start = { x: V.x, y: V.y, s: V.s, pts: JSON.parse(JSON.stringify(pts)) }; };
    vw.addEventListener('pointerup', up); vw.addEventListener('pointercancel', up);
    vw.addEventListener('click', function (e) { if (V.moved) { e.stopPropagation(); e.preventDefault(); V.moved = false; } }, true);
    vw.addEventListener('wheel', function (e) { e.preventDefault(); var r = vw.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  }
  function onView(t) { var vw = view(); if (!vw) return; var w = vw.clientWidth / 2, h = vw.clientHeight / 2;
    if (t === 'in') zoomAt(1.25, w, h); else if (t === 'out') zoomAt(0.8, w, h); else if (t === 'fit') { V.s = fitS(); V.x = 0; V.y = 0; applyV(); } else goCol(t === 'l' ? 0 : t === 'c' ? 1 : 2); }
  window.addEventListener('resize', function () { if (SVGTABS[tab] && view()) { sizeView(); applyV(); } });

  /* ---------- Eingaben ---------- */
  var REG = {};
  function find(id) {
    if (REG[id]) return REG[id];
    var res = null;
    ['left', 'center', 'right', 'extra'].forEach(function (k) { OVERHEAD[k].forEach(function (p) { p.rows.forEach(function (r) { r.forEach(function (c) { if (c.id === id) res = c; }); }); }); });
    return res;
  }
  function onClick(e) {
    var vb = e.target.closest('[data-v]'); if (vb) { onView(vb.dataset.v); return; }
    var a = e.target.closest('[data-a]'); if (!a) return;
    var t = a.dataset.a, id = a.dataset.id;
    if (t === 'preset') { apply(a.dataset.p); draw(); return; }
    var c = id && find(id);
    if (t === 'pb' && c) {
      if (c.g && !G[id]) { G[id] = 1; draw(); return; }
      S[id] = val(c) ? 0 : 1; if (c.g && S[id] === def(c)) G[id] = 0; draw(); return;
    }
    if (t === 'kn' && c) { var rect = a.getBoundingClientRect(), d = e.clientX < rect.left + rect.width / 2 ? -1 : 1; S[id] = Math.max(0, Math.min(c.pos.length - 1, val(c) + d)); draw(); return; }
    if (t === 'tg' && c) { S[id] = (val(c) + 1) % c.pos.length; draw(); }
  }

  function api() { return { S: S, N: N, ECAM: ECAM, item: itemH, reg: function (c) { REG[c.id] = c; return c; }, pb: pb, kn: kn, tg: tg, val: val, find: find, power: power, redraw: draw, setEcam: function (v) { ECAM = v; }, svg: { screw: screw, pb: pbSvg, kn: knSvg, tg: tgSvg } }; }
  function draw() { var y = root.scrollTop, parts = VpAAirbus2; root.innerHTML = SVGTABS[tab] ? ovhd() : parts.render(tab, api()); root.scrollTop = y; if (parts.after) parts.after(tab, root, api()); if (SVGTABS[tab]) setupView(); }

  /* ---------- Schnittstelle ---------- */
  function mount(r, which) {
    root = r; if ((which || 'ovhd') !== tab) V.s = 0; tab = which || 'ovhd'; if (!Object.keys(S).length) apply('ready');
    if (!root._ab) { root._ab = 1; root.addEventListener('click', function (e) { var x = e.target.closest('[data-a^="x"]'); if (x) VpAAirbus2.click(x, api()); else onClick(e); }); }
    draw();
  }
  return { mount: mount, state: function () { return S; } };
})();
