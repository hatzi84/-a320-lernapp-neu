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

  function ovhd() {
    return '<div class="abbar"><button class="btn" data-a="preset" data-p="cold">Kalt und dunkel</button><button class="btn" data-a="preset" data-p="ready">Vor dem Anlassen</button>' +
      '<span class="ovz"><button class="btn" data-v="out" aria-label="Verkleinern">−</button><button class="btn" data-v="in" aria-label="Vergrößern">+</button><button class="btn" data-v="fit">Ganz</button><button class="btn" data-v="l">Links</button><button class="btn" data-v="c">Mitte</button><button class="btn" data-v="r">Rechts</button></span></div>' +
      '<div class="ovview" id="ovview"><div class="ovstage" id="ovstage"><div class="abovh fix">' + col(OVERHEAD.left) + '<div class="abcol">' + OVERHEAD.center.filter(function (p) { return !/half/.test(p.cls || ''); }).map(panelH).join('') + '<div class="ovhalf">' + OVERHEAD.center.filter(function (p) { return /half/.test(p.cls || ''); }).map(panelH).join('') + '</div></div>' + col(OVERHEAD.right) + '</div></div></div>' +
      '<p class="abnote">Mit einem Finger verschieben, mit zwei Fingern zoomen (am PC: Mausrad). Anordnung nach dem echten A320-Overhead, Zustände sind Beispiele.</p>';
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
  function goCol(i) { var st = stage(), c = st.querySelectorAll('.abovh.fix > .abcol')[i], vw = view(); V.s = Math.min(1, vw.clientWidth / (c.offsetWidth + 40)); V.x = -(c.offsetLeft - 20) * V.s; V.y = 0; applyV(); }
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
  window.addEventListener('resize', function () { if (tab === 'ovhd' && view()) { sizeView(); applyV(); } });

  /* ---------- Eingaben ---------- */
  var REG = {};
  function find(id) {
    if (REG[id]) return REG[id];
    var res = null;
    ['left', 'center', 'right'].forEach(function (k) { OVERHEAD[k].forEach(function (p) { p.rows.forEach(function (r) { r.forEach(function (c) { if (c.id === id) res = c; }); }); }); });
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

  function api() { return { S: S, N: N, ECAM: ECAM, item: itemH, reg: function (c) { REG[c.id] = c; return c; }, pb: pb, kn: kn, tg: tg, val: val, power: power, redraw: draw, setEcam: function (v) { ECAM = v; } }; }
  function draw() { var y = root.scrollTop, parts = VpAAirbus2; root.innerHTML = tab === 'ovhd' ? ovhd() : parts.render(tab, api()); root.scrollTop = y; if (parts.after) parts.after(tab, root, api()); if (tab === 'ovhd') setupView(); }

  /* ---------- Schnittstelle ---------- */
  function mount(r, which) {
    root = r; tab = which || 'ovhd'; if (!Object.keys(S).length) apply('ready');
    if (!root._ab) { root._ab = 1; root.addEventListener('click', function (e) { var x = e.target.closest('[data-a^="x"]'); if (x) VpAAirbus2.click(x, api()); else onClick(e); }); }
    draw();
  }
  return { mount: mount, state: function () { return S; } };
})();
