/* Entwurf: Airbus-Tablet, Reiter Mittelkonsole · FCU, MCDU und Boden (Ergänzung zu tablet-airbus.js). */
window.VpAAirbus2 = (function () {
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function pad(n, w) { n = String(Math.abs(n)); while (n.length < w) n = '0' + n; return n; }
  function seg(t, off) { return '<div class="abds big' + (off ? ' off' : '') + '">' + (off ? '' : esc(t)) + '</div>'; }
  function lamp(A, id, lab, o) { var on = !!A.S[id] && A.power(); return '<button class="abef' + (on ? ' on' : '') + (o && o.amb ? ' amb' : '') + '" data-a="xtog" data-id="' + id + '" aria-pressed="' + on + '">' + esc(lab) + '</button>'; }
  function stepper(A, k, lab, step, disp, o) {
    o = o || {};
    return '<div class="abfcu"><div class="abl">' + esc(lab) + '</div>' + seg(disp, !A.power()) + '<div class="abstep"><button data-a="xnum" data-k="' + k + '" data-d="' + (-step) + '" aria-label="' + esc(lab) + ' kleiner">−</button><button data-a="xnum" data-k="' + k + '" data-d="' + step + '" aria-label="' + esc(lab) + ' größer">+</button></div></div>';
  }
  function item(A, c) { return A.item(A.reg(c)); }

  function glare(A) {
    var N = A.N, S = A.S, off = !A.power();
    var efis = function (side) {
      var p = side === 'L' ? '' : 'F';
      return '<div class="abp"><h4>EFIS ' + (side === 'L' ? 'CAPT' : 'F/O') + '</h4><div class="abrow">' +
        '<div class="abfcu"><div class="abl">BARO</div>' + seg(side === 'L' ? 'QNH ' + N.QNH : 'QNH ' + N.QNH, off) + '<div class="abstep"><button data-a="xnum" data-k="QNH" data-d="-1" aria-label="Luftdruck kleiner">−</button><button data-a="xnum" data-k="QNH" data-d="1" aria-label="Luftdruck größer">+</button><button data-a="xnum" data-k="QNHSTD" data-d="0">STD</button></div></div>' +
        lamp(A, p + 'FD', 'FD') + lamp(A, p + 'LS', 'LS') + '</div><div class="abrow">' +
        lamp(A, p + 'CSTR', 'CSTR') + lamp(A, p + 'WPT', 'WPT') + lamp(A, p + 'VORD', 'VOR.D') + lamp(A, p + 'NDB', 'NDB') + lamp(A, p + 'ARPT', 'ARPT') + '</div><div class="abrow">' +
        item(A, A.kn(p + 'NDMODE', 'ND MODE', ['LS', 'VOR', 'NAV', 'ARC', 'PLAN'], 3)) + item(A, A.kn(p + 'NDRANGE', 'ND RANGE', ['10', '20', '40', '80', '160', '320'], 3)) +
        item(A, A.tg(p + 'ADF1', 'ADF/VOR 1', ['ADF', 'OFF', 'VOR'], 1)) + item(A, A.tg(p + 'ADF2', 'ADF/VOR 2', ['ADF', 'OFF', 'VOR'], 1)) + '</div></div>';
    };
    var ap = function (id, lab) { return '<button class="abef big' + (S[id] && A.power() ? ' on' : '') + '" data-a="xtog" data-id="' + id + '">' + esc(lab) + '</button>'; };
    var fcu = '<div class="abp wide"><h4>FCU</h4><div class="abrow">' +
      stepper(A, 'SPD', 'SPD', 1, pad(N.SPD, 3)) + stepper(A, 'HDG', 'HDG', 1, pad(N.HDG, 3)) + stepper(A, 'ALT', 'ALT', 100, pad(N.ALT, 5)) + stepper(A, 'VS', 'V/S', 100, (N.VS < 0 ? '−' : '+') + pad(N.VS, 4)) +
      '</div><div class="abrow">' + ap('LOC', 'LOC') + ap('AP1', 'AP1') + ap('AP2', 'AP2') + ap('ATHR', 'A/THR') + ap('EXPED', 'EXPED') + ap('APPR', 'APPR') + ap('SPDMACH', 'SPD MACH') + ap('HDGTRK', 'HDG TRK') + ap('METRIC', 'METRIC ALT') + '</div></div>';
    var warn = '<div class="abp"><h4>WARNUNG</h4><div class="abrow"><button class="abmw red' + (S.MWARN && A.power() ? ' on' : '') + '" data-a="xtog" data-id="MWARN">MASTER<br>WARN</button><button class="abmw amb' + (S.MCAUT && A.power() ? ' on' : '') + '" data-a="xtog" data-id="MCAUT">MASTER<br>CAUT</button><button class="abmw red sm' + (S.ALAND && A.power() ? ' on' : '') + '" data-a="xtog" data-id="ALAND">AUTO<br>LAND</button></div><div class="abrow"><span class="small">SIDE STICK PRIORITY</span></div></div>';
    return '<h3 class="abh">Blendschutz (Glareshield)</h3><div class="abovh g3"><div class="abcol">' + efis('L') + '</div><div class="abcol">' + fcu + '</div><div class="abcol">' + efis('R') + warn + '</div></div>';
  }

  function levers(N) {
    var y = function (v) { return 14 + (100 - v) * 1.3; };
    var h = '<svg class="abtl" viewBox="0 0 180 170" role="img" aria-label="Schubhebel, Anzeige">';
    ['REV', 'IDLE', 'CL', 'FLX/MCT', 'TOGA'].forEach(function (t, i) { var yy = [150, 128, 76, 44, 18][i]; h += '<line x1="55" y1="' + yy + '" x2="125" y2="' + yy + '" stroke="#8a9098" stroke-width="1"/><text x="130" y="' + (yy + 3) + '" class="lbl">' + t + '</text>'; });
    [0, 1].forEach(function (i) { var x = 72 + i * 36; h += '<rect x="' + (x - 3) + '" y="18" width="6" height="132" rx="3" fill="#1b1d20"/><rect x="' + (x - 11) + '" y="' + (y(N.TL) - 10) + '" width="22" height="22" rx="4" fill="#4b4f55" stroke="#aeb3ba"/>'; });
    return h + '</svg>';
  }
  function flapsSvg(N) {
    var labs = ['0', '1', '2', '3', 'FULL'], h = '<svg class="abtl" viewBox="0 0 150 170" role="img" aria-label="Klappenhebel, Anzeige">';
    labs.forEach(function (t, i) { var yy = 20 + i * 30; h += '<line x1="40" y1="' + yy + '" x2="70" y2="' + yy + '" stroke="#8a9098"/><text x="76" y="' + (yy + 3) + '" class="lbl' + (i === N.FLAPS ? ' sel' : '') + '">' + t + '</text>'; });
    return h + '<rect x="52" y="' + (20 + N.FLAPS * 30 - 9) + '" width="22" height="18" rx="4" fill="#4b4f55" stroke="#aeb3ba"/></svg>';
  }
  function sbSvg(N) {
    var labs = ['FULL', '1/2', 'RET'], h = '<svg class="abtl" viewBox="0 0 150 170" role="img" aria-label="Spoilerhebel, Anzeige">';
    labs.forEach(function (t, i) { var yy = 30 + i * 50; h += '<line x1="40" y1="' + yy + '" x2="70" y2="' + yy + '" stroke="#8a9098"/><text x="76" y="' + (yy + 3) + '" class="lbl' + (i === 2 - N.SB ? ' sel' : '') + '">' + t + '</text>'; });
    return h + '<rect x="52" y="' + (30 + (2 - N.SB) * 50 - 9) + '" width="22" height="18" rx="4" fill="#4b4f55" stroke="#aeb3ba"/></svg>';
  }
  var ECAMPAGES = ['ENG', 'BLEED', 'PRESS', 'ELEC', 'HYD', 'FUEL', 'APU', 'COND', 'DOOR', 'WHEEL', 'F/CTL', 'STS'];
  function ecamBody(A) {
    var S = A.S, p = A.ECAM, on = A.power(), L = [];
    if (!on) return '<span class="dim">ECAM ohne Strom</span>';
    if (p === 'ELEC') L = ['BAT 1 ' + (S.BAT1 ? '27.6 V' : 'OFF'), 'BAT 2 ' + (S.BAT2 ? '28.5 V' : 'OFF'), 'EXT PWR ' + (S.EXT ? 'ON' : S.GPU ? 'AVAIL' : '—'), 'GEN 1 ' + (S.GEN1 ? 'OFF-LINE' : 'OFF'), 'GEN 2 ' + (S.GEN2 ? 'OFF-LINE' : 'OFF'), 'APU GEN ' + (S.APUM ? 'AVAIL' : '—')];
    else if (p === 'FUEL') L = ['L TK  ' + (S.LTK1 ? 'ON' : 'OFF'), 'CTR TK ' + (S.CTK1 ? 'ON' : 'OFF'), 'R TK ' + (S.RTK1 ? 'ON' : 'OFF'), 'FOB: ' + (A.N.FUEL || 6500) + ' KG'];
    else if (p === 'APU') L = ['MASTER ' + (S.APUM ? 'ON' : 'OFF'), 'START ' + (S.APUS ? 'ON' : 'OFF'), 'N 0 %', 'EGT 0 °C'];
    else if (p === 'WHEEL') L = ['PARK BRK ' + (S.PARK === 1 || S.PARK === undefined ? 'ON' : 'OFF'), 'A/SKID & N/W STRG ' + (S.ASKID === 1 ? 'OFF' : 'ON')];
    else L = ['Seite ' + p, 'Anzeige im Entwurf schematisch'];
    return L.map(esc).join('<br>');
  }
  function pedestal(A) {
    var N = A.N, S = A.S, h = '<h3 class="abh">Mittelkonsole (Pedestal)</h3><div class="abovh g3"><div class="abcol">';
    h += '<div class="abp"><h4>HEBEL <small>Hebel</small></h4><div class="abrow"><div class="abi"><div class="abl">THRUST</div>' + levers(N) + '</div><div class="abi"><div class="abl">FLAPS</div>' + flapsSvg(N) + '</div><div class="abi"><div class="abl">SPEED BRAKE</div>' + sbSvg(N) + '</div></div>' +
      '<div class="abrow"><span class="small">Schub ' + N.TL + ' % · Klappen ' + ['0', '1', '2', '3', 'FULL'][N.FLAPS] + ' · Spoiler ' + ['RET', '1/2', 'FULL'][N.SB] + '</span></div>' +
      '<div class="abrow"><button class="btn" data-a="xnum" data-k="TL" data-d="25">Schub +</button><button class="btn" data-a="xnum" data-k="TL" data-d="-25">Schub −</button><button class="btn" data-a="xnum" data-k="FLAPS" data-d="1">Klappen +</button><button class="btn" data-a="xnum" data-k="FLAPS" data-d="-1">Klappen −</button><button class="btn" data-a="xnum" data-k="SB" data-d="1">Spoiler +</button><button class="btn" data-a="xnum" data-k="SB" data-d="-1">Spoiler −</button></div><p class="small">Zum Üben stellst du Schub, Klappen und Spoiler mit diesen Knöpfen ein. Im echten Flugzeug bedienst du die Hebel von Hand.</p></div></div>';
    h += '<div class="abcol"><div class="abp"><h4>TRIEBWERKE · BREMSE</h4><div class="abrow">' + item(A, A.tg('ENGMASTER1', 'ENG MASTER 1', ['ON', 'OFF'], 1)) + item(A, A.tg('ENGMASTER2', 'ENG MASTER 2', ['ON', 'OFF'], 1)) + item(A, A.kn('ENGMODE', 'ENG MODE', ['CRANK', 'NORM', 'IGN/START'], 1)) + item(A, A.tg('PARK', 'PARKING BRK', ['ON', 'OFF'], 0)) + '</div></div>' +
      '<div class="abp"><h4>ECAM</h4><div class="abrow">' + ECAMPAGES.map(function (t) { return '<button class="abef' + (A.ECAM === t ? ' on' : '') + '" data-a="xecam" data-p="' + t + '">' + t + '</button>'; }).join('') + '</div><div class="abecam">' + ecamBody(A) + '</div></div></div>';
    h += '<div class="abcol"><div class="abp"><h4>ATC · TRANSPONDER</h4><div class="abrow"><div class="abfcu"><div class="abl">CODE</div>' + seg(pad(N.SQK || 2000, 4), !A.power()) + '<div class="abstep"><button data-a="xnum" data-k="SQK" data-d="-1">−</button><button data-a="xnum" data-k="SQK" data-d="1">+</button></div></div>' + item(A, A.kn('XPDRMODE', 'MODE', ['STBY', 'AUTO', 'ON'], 0)) + item(A, A.tg('XPDRALT', 'ALT RPTG', ['ON', 'OFF'], 1)) + '</div></div>' +
      '<div class="abp"><h4>HAUPTPANEL (AUSWAHL)</h4><div class="abrow">' + item(A, A.tg('GEAR', 'LDG GEAR', ['UP', 'DN'], 1)) + item(A, A.pb('ABLO', 'AUTO BRK LO', { m: 'on', top: 'DECEL', lo: 'ON' })) + item(A, A.pb('ABMED', 'AUTO BRK MED', { m: 'on', top: 'DECEL', lo: 'ON' })) + item(A, A.pb('ABMAX', 'AUTO BRK MAX', { m: 'on', top: 'DECEL', lo: 'ON' })) + item(A, A.tg('ASKID', 'A/SKID & NW STRG', ['ON', 'OFF'], 0)) + item(A, A.pb('BRKFAN', 'BRK FAN', { m: 'on', lo: 'ON', top: 'HOT' })) + '</div></div></div></div>';
    return h;
  }

  function mcdu() {
    return '<div class="abmc"><div class="abmcol"><div class="abbar"><span class="chip" id="abml"><span class="dot"></span>Übungsmodus: alles bleibt in der App, kein Sim</span></div><div id="abmcdu"></div></div><div class="abmcol"><div class="card"><div class="eyebrow">NAVIGATION DISPLAY</div><div id="abnd" style="margin-top:8px"></div></div><div class="card" id="abex" style="margin-top:12px"></div></div></div>';
  }

  var SVC = [
    ['STROM · LUFT', [['GPU', 'Außenstrom (GPU) angeschlossen', 'EXT PWR im Overhead zeigt dann AVAIL'], ['GNDAIR', 'Bodenluft (Klima) angeschlossen', 'Kühlt oder heizt die Kabine'], ['CHOCKS', 'Bremsklötze vorgelegt', 'Das Flugzeug kann nicht wegrollen'], ['CONES', 'Sicherheitskegel gestellt', 'Rund um Triebwerke und Flügel']]],
    ['TÜREN', [['DL1', 'Tür 1 links (Passagiere)', 'Vorn links, zur Fluggastbrücke'], ['DR1', 'Tür 1 rechts (Service)', 'Catering und Service'], ['DCF', 'Frachtraum vorn', 'Gepäck, Fracht'], ['DCA', 'Frachtraum hinten', 'Gepäck, Fracht'], ['DAVI', 'Avionik-Raum', 'Wartungszugang']]],
    ['DIENSTE', [['JET', 'Fluggastbrücke / Treppe', 'Zugang für die Passagiere'], ['FUELT', 'Tankwagen', 'Betanken mit dem Wert unten'], ['CATER', 'Catering', 'Bordverpflegung'], ['BAGG', 'Gepäckwagen', 'Be- und Entladen'], ['PUSH', 'Pushback bereit', 'Schlepper am Bugrad'], ['DEICE', 'Enteisung', 'Nur bei Frost nötig']]]
  ];
  function ground(A) {
    var S = A.S, h = '<div class="abovh g3">';
    SVC.forEach(function (g) {
      h += '<div class="abcol"><div class="abp wide"><h4>' + g[0] + '</h4>' + g[1].map(function (r) { var on = !!S[r[0]]; return '<button class="absv' + (on ? ' on' : '') + '" data-a="xtog" data-id="' + r[0] + '" aria-pressed="' + on + '"><b>' + esc(r[1]) + '</b><span>' + esc(r[2]) + '</span><i>' + (on ? 'ja' : 'nein') + '</i></button>'; }).join('') + '</div></div>';
    });
    h += '</div><div class="abovh g3"><div class="abcol"><div class="abp wide"><h4>KRAFTSTOFF</h4><div class="abrow"><div class="abfcu"><div class="abl">AN BORD (KG)</div>' + seg(String(A.N.FUEL || 6500), false) + '<div class="abstep"><button data-a="xnum" data-k="FUEL" data-d="-500">−</button><button data-a="xnum" data-k="FUEL" data-d="500">+</button></div></div></div><p class="small">Tankwagen anfordern, dann wird bis zum eingestellten Wert betankt. Wert kommt später aus dem Flugplan (Block).</p></div></div></div>';
    return '<p class="small" style="margin:0 0 10px">Bodendienste wie am echten Flugzeug. Beispiel: Mit angeschlossenem Außenstrom zeigt EXT PWR im Overhead AVAIL.</p>' + h;
  }

  function render(tab, A) {
    if (tab === 'fcu') return glare(A) + pedestal(A);
    if (tab === 'mcdu') return mcdu();
    return ground(A);
  }
  function after(tab, root, A) {
    if (tab !== 'mcdu' || typeof VpAMcdu === 'undefined') return;
    var ndc = null, m = VpAMcdu.mount(root.querySelector('#abmcdu'), { page: 'init', explainEl: root.querySelector('#abex'), onChange: function (S) { if (ndc) ndc.update(S); } });
    ndc = VpAMcdu.nd(root.querySelector('#abnd'), { getPlan: function () { return null; } }); ndc.update(m.state);
  }
  function click(x, A) {
    var t = x.dataset.a, id = x.dataset.id;
    if (t.indexOf('xc') === 0) return VpACockpit.click(x, A);
    if (t === 'xtog') { A.S[id] = A.S[id] ? 0 : 1; if (id === 'AP1' && A.S.AP1) A.S.ATHR = A.S.ATHR === undefined ? 1 : A.S.ATHR; A.redraw(); return; }
    if (t === 'xecam') { A.setEcam(x.dataset.p); A.redraw(); return; }
    if (t === 'xnum') {
      var k = x.dataset.k, d = +x.dataset.d, N = A.N;
      if (k === 'QNHSTD') N.QNH = 1013;
      else if (k === 'SPD') N.SPD = Math.max(100, Math.min(350, N.SPD + d));
      else if (k === 'HDG') N.HDG = (N.HDG + d + 360) % 360;
      else if (k === 'ALT') N.ALT = Math.max(0, Math.min(41000, N.ALT + d));
      else if (k === 'VS') N.VS = Math.max(-6000, Math.min(6000, N.VS + d));
      else if (k === 'QNH') N.QNH = Math.max(900, Math.min(1100, N.QNH + d));
      else if (k === 'TL') N.TL = Math.max(0, Math.min(100, (N.TL || 0) + d));
      else if (k === 'FLAPS') N.FLAPS = Math.max(0, Math.min(4, (N.FLAPS || 0) + d));
      else if (k === 'SB') N.SB = Math.max(0, Math.min(2, (N.SB || 0) + d));
      else if (k === 'FUEL') N.FUEL = Math.max(0, Math.min(19000, (N.FUEL || 6500) + d));
      else if (k === 'SQK') N.SQK = Math.max(0, Math.min(7777, (N.SQK || 2000) + d));
      A.redraw();
    }
  }
  return { render: render, after: after, click: click };
})();
