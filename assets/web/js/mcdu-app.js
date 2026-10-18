/* A320 Lernapp: MCDU-Seite, hochkant und quer. Eigenständig, ohne Bezug zu anderer Software. Alle Daten sind Beispiele. */
(function () {
  var N = window.VpANav, PL = window.VpAPlan;
  function same(a, b) { return a.length === b.length && a.every(function (x, i) { return x === b[i]; }); }
  function chain(from, route, to) { var t = N.routeDist(from, route, to); return t == null ? null : Math.round(t); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var EX = null;
  function examples() { if (!EX) EX = [PL.example('EDDH', 'EDDM', 'EDDN', 'DLH123', 140), PL.example('EDDF', 'EDDM', 'EDDN', 'DLH456', 150), PL.example('EDDM', 'LSZH', 'EDDS', 'DLH789', 130), PL.example('EDDK', 'EDDB', 'EDDL', 'DLH321', 120)]; return EX; }
  function allPlans() { return PL.load().concat(examples()); }

  function mount(root) {
    root.innerHTML = '' +
      '<div class="mcl"><div class="mcl-dev" id="dev"><div id="mcw"><div id="mcdu"></div></div></div>' +
      '<div class="mcl-info" id="info">' +
      '<div class="seg2" id="modes"><button class="on" data-m="guide" type="button">Geführt lernen</button><button data-m="free" type="button">Frei üben</button></div>' +
      '<div class="tabs3" id="itabs"><button class="on" data-t="task" type="button">Aufgabe</button><button data-t="expl" type="button">Erklärung</button><button data-t="nd" type="button">ND</button><button data-t="plan" type="button">Flugplan</button></div>' +
      '<section data-p="task"><div id="guide"><div class="tasklist" id="tasks"></div><div class="card"><div class="eyebrow">AUFGABE</div><h3 id="tt" class="h3d"></h3><p class="small" id="tw"></p><div class="mtask" id="steps"></div><div class="btnrow"><button class="btn" id="hint" type="button">Hinweis</button><button class="btn" id="solve" type="button">Lösung</button><button class="btn" id="reset" type="button">Neu starten</button></div><p class="small" id="hintbox" hidden></p></div></div>' +
      '<div id="free" hidden><div class="card"><div class="eyebrow">FREI ÜBEN</div><h3 class="h3d">Ohne Aufgabe, ohne Wertung</h3><p class="small">Tippe, was du willst: INIT, F-PLN, PERF und alle anderen Seiten. Fehlermeldungen und Erklärungen gibt es weiter. Alles bleibt in der App. Du kannst einen Plan im Reiter „Flugplan“ laden und ihn mit INIT REQUEST holen, oder alles von Hand eintippen, zum Beispiel EDDF/EDDM auf INIT.</p><div class="btnrow"><button class="btn" id="fclear" type="button">MCDU leeren</button></div></div></div></section>' +
      '<section data-p="expl" hidden><div class="card" id="expl"></div><div class="card"><div class="eyebrow">MERKHILFE · DIFSRIP</div><p class="small" style="line-height:1.9;margin:6px 0 0"><b>D</b> Data · <b>I</b> Init A · <b>F</b> F-PLN · <b>S</b> SEC F-PLN · <b>R</b> Rad Nav · <b>I</b> Init B · <b>P</b> Perf</p></div></section>' +
      '<section data-p="nd" hidden><div class="card"><div class="eyebrow">NAVIGATION DISPLAY</div><div id="nd" style="margin-top:8px;max-width:460px"></div><p class="small">Das ND zeigt, was die MCDU gespeichert hat. Weicht die grüne Linie von der grauen ab, stimmt etwas nicht.</p></div></section>' +
      '<section data-p="plan" hidden><div class="card"><div class="eyebrow">FLUGPLAN BEREITSTELLEN</div><p class="small" style="margin-top:6px">Wähle einen Plan aus dem Planer (oder ein Beispiel) und lade ihn. Danach holt die MCDU ihn mit INIT REQUEST. Eigene Pläne erstellst du im Reiter „Planer“.</p><select class="sel" id="plsel" aria-label="Plan wählen"></select><div id="plsum"></div><div class="btnrow"><button class="btn pri" id="plload" type="button">Flugplan laden</button><span id="plstat" class="chip">nicht geladen</span><a class="btn" href="plan.html">Neuen Plan erstellen</a></div></div><div class="card"><div class="eyebrow">NAVLOG</div><div id="nlog"></div></div></section>' +
      '</div></div>';
    var $ = function (id) { return root.querySelector('#' + id); };
    var plans = allPlans(), plan = PL.activePlan() || plans[0], loaded = false, cur = 0, m, ndv;
    function fillSel() { plans = allPlans(); $('plsel').innerHTML = plans.map(function (p) { return '<option value="' + p.id + '"' + (p.id === plan.id ? ' selected' : '') + '>' + esc(p.name) + (p.saved ? ' · gespeichert' : ' · Beispiel') + '</option>'; }).join(''); }
    fillSel();

    function drawPlan() {
      $('plsum').innerHTML = '<div class="grid g2" style="gap:8px;margin:10px 0"><div class="mi"><span>Strecke</span><b>' + plan.from + ' → ' + plan.to + '</b></div><div class="mi"><span>Alternate</span><b>' + (plan.altn || '—') + '</b></div><div class="mi"><span>Flugnummer · CI</span><b>' + plan.flt + ' · ' + plan.ci + '</b></div><div class="mi"><span>Reiseflughöhe</span><b>' + plan.crz + '</b></div><div class="mi"><span>Zeit · Trip</span><b>' + plan.ete + ' h · ' + plan.fuel + '</b></div><div class="mi"><span>ZFW · Block</span><b>' + plan.zfw + ' · ' + plan.blockT + ' t</b></div></div>';
      var ids = [plan.from].concat(plan.route, [plan.to]), tot = 0;
      $('nlog').innerHTML = '<table class="compare"><tr><th>Wegpunkt</th><th class="rt">Strecke</th><th class="rt">Summe</th></tr>' + ids.map(function (id, i) { var d = i ? Math.round(N.dist(ids[i - 1], id)) : 0; tot += d; return '<tr><td>' + id + '</td><td class="rt">' + (i ? d + ' NM' : '–') + '</td><td class="rt">' + tot + ' NM</td></tr>'; }).join('') + '</table>';
      $('plstat').className = 'chip ' + (loaded ? 'gemeistert' : '');
      $('plstat').textContent = loaded ? 'geladen' : 'nicht geladen';
      $('plload').textContent = loaded ? 'Plan entladen' : 'Flugplan laden';
    }
    function decoyFor(p) { var r = p.route, k = Math.floor(r.length / 2), base = N.WPS.indexOf(r[k]), d = N.WPS[(base + 11) % N.WPS.length]; return { k: k, bad: d }; }
    var T = [
      { n: 'Plan per INIT REQUEST laden', w: 'So arbeitest du im Flugzeug mit einem Flugplan aus dem Planer: Der Plan liegt bereit, die MCDU holt ihn.', hint: 'Lade den Plan im Reiter „Flugplan“. Dann auf der INIT-Seite die rechte Taste neben INIT REQUEST, danach F-PLN und INSERT.', sol: 'Reiter „Flugplan“, Flugplan laden. Auf INIT die rechte Taste 2 (INIT REQUEST), dann F-PLN und unten rechts INSERT*.', page: 'init', setup: function () { loaded = false; m.setPlan(null); },
        steps: [['Flugplan laden', function () { return loaded; }], ['INIT REQUEST drücken (INIT-Seite füllt sich)', function (S) { return S.v.from === plan.from && S.v.to === plan.to && !!S.v.flt && !!S.v.ci && !!S.v.crz; }], ['Auf F-PLN den vorläufigen Plan mit INSERT übernehmen', function (S) { return !S.tmp && same(S.route, plan.route); }], ['ND: grüne Linie liegt auf dem Plan', function (S) { return !S.tmp && same(S.route, plan.route) && !!S.v.to; }]] },
      { n: 'Von Hand eingeben', w: 'Ohne Uplink: Du tippst INIT-Daten und alle Wegpunkte selbst und hältst sie gegen das Navlog (Reiter „Flugplan“).', hint: 'INIT: FROM/TO als EDDH/EDDM, Flugnummer, Cost Index, Höhe. Dann F-PLN: Wegpunkte aus dem Navlog der Reihe nach in die freie Zeile tippen und die linke Taste daneben drücken. Zum Schluss INSERT.', sol: 'Tippe FROM/TO und drücke rechts 1. Dann Flugnummer (links 3), Cost Index (links 4), Höhe (links 5). Auf F-PLN jeden Wegpunkt tippen und die Taste der freien Zeile (-----) drücken. Zum Schluss INSERT*.', page: 'init', setup: function () { loaded = true; m.setPlan(plan); },
        steps: [['INIT A passt zum Plan (FROM/TO, Flugnummer, Cost Index, Höhe)', function (S) { return S.v.from === plan.from && S.v.to === plan.to && S.v.flt === plan.flt && S.v.ci === plan.ci && S.v.crz === plan.crz; }], ['Alle Wegpunkte in der richtigen Reihenfolge eingetragen', function (S) { return same(S.tmp || S.route, plan.route) && plan.route.length > 0; }], ['INSERT gedrückt, Plan ist gültig', function (S) { return !S.tmp && same(S.route, plan.route); }], ['Gesamtstrecke stimmt mit dem Navlog überein', function (S) { return !S.tmp && !!S.v.from && !!S.v.to && chain(S.v.from, S.route, S.v.to) === chain(plan.from, plan.route, plan.to); }]] },
      { n: 'Fehler finden und beheben', w: 'In der MCDU steckt ein falscher Wegpunkt. Finde ihn mit dem Navlog und dem ND und korrigiere ihn.', hint: 'Vergleiche die grüne mit der grauen Linie. CLR drücken, dann die Taste neben dem falschen Wegpunkt löscht ihn. Den richtigen Namen tippst du und drückst die Taste vor dem Eintrag, vor dem er stehen soll.', sol: 'Den falschen Wegpunkt löschen (CLR, dann Taste daneben). Den richtigen Namen aus dem Navlog tippen, die Taste neben dem Nachfolger drücken. INSERT* drücken.', page: 'fpln',
        setup: function () { loaded = true; m.setPlan(plan); var d = decoyFor(plan); m.state.v = { from: plan.from, to: plan.to, flt: plan.flt, ci: plan.ci, crz: plan.crz, altn: plan.altn }; m.state.route = plan.route.map(function (i, k) { return k === d.k ? d.bad : i; }); m.state.tmp = null; m.go('fpln'); },
        steps: [['Falschen Wegpunkt gelöscht', function (S) { var d = decoyFor(plan); return (S.tmp || S.route).indexOf(d.bad) < 0; }], ['Richtigen Wegpunkt eingefügt', function (S) { return same(S.tmp || S.route, plan.route); }], ['INSERT gedrückt', function (S) { return !S.tmp && same(S.route, plan.route); }], ['ND: grüne und graue Linie liegen übereinander', function (S) { return !S.tmp && same(S.route, plan.route); }]] },
      { n: 'INIT B: Gewicht und Kraftstoff', w: 'Hole oder tippe ZFW und Block. Die Werte stehen im Plan (Reiter „Flugplan“, Navlog und Kraftstoff im Planer).', hint: 'Mit FUEL / W&B REQUEST auf INIT B holst du beides. Oder tippe ZFW als 28.0/ZFW in Tonnen und BLOCK als Tonnen mit einer Nachkommastelle.', sol: 'Auf INIT B (Pfeil rechts auf INIT) die Taste rechts 5 (FUEL / W&B REQUEST) drücken. Oder von Hand: 28.0/' + '… in rechts 1, Block in rechts 2.', page: 'initb', setup: function () { loaded = true; m.setPlan(plan); m.state.v = { from: plan.from, to: plan.to, flt: plan.flt, ci: plan.ci, crz: plan.crz }; m.state.route = plan.route.slice(); m.go('initb'); },
        steps: [['ZFW eingetragen', function (S) { return !!S.v.zfw && Math.abs(parseFloat(S.v.zfw.split('/')[1]) - parseFloat(plan.zfwT)) < 0.15; }], ['BLOCK eingetragen', function (S) { return !!S.v.block && Math.abs(parseFloat(S.v.block) - parseFloat(plan.blockT)) < 0.15; }], ['EXTRA ist nicht negativ', function (S) { var x = S.v.block && S.v.zfw; return !!x && parseFloat(S.v.block) >= 0; }]] },
      { n: 'PERF: Take-off', w: 'Trage die Startgeschwindigkeiten, die Übergangshöhe und die Flex-Temperatur ein.', hint: 'Taste PERF drücken. V1 ist nie größer als VR, VR nie größer als V2.', sol: 'Tippe 138, linke Taste 1. Tippe 140, linke Taste 2. Tippe 143, linke Taste 3. Tippe 5000, linke Taste 4. Tippe 55, rechte Taste 4.', page: 'perf', setup: function () { },
        steps: [['V1, VR und V2 eingeben', function (S) { return !!(S.v.v1 && S.v.vr && S.v.v2); }], ['V1 ≤ VR ≤ V2 (Reihenfolge stimmt)', function (S) { return !!(S.v.v1 && S.v.vr && S.v.v2) && +S.v.v1 <= +S.v.vr && +S.v.vr <= +S.v.v2; }], ['TRANS ALT 5000 (Deutschland)', function (S) { return S.v.trans === '5000'; }], ['FLEX TO TEMP eingeben (zwei Ziffern)', function (S) { return !!S.v.flex; }]] },
      { n: 'PERF: Anflug', w: 'Vor dem Sinkflug trägst du die Anflugdaten ein: Luftdruck, Temperatur, Wind und die Landeklappenstellung.', hint: 'PERF drücken und mit dem Pfeil rechts bis APPR blättern (dreimal NEXT PHASE). QNH vierstellig, Wind als 270/12.', sol: 'PERF, dann rechts unten bis APPR. QNH 1013 links 1, Temperatur 15 links 2, Wind 270/12 links 3, rechts 4 CONF3 oder FULL.', page: 'perf-appr', setup: function () { },
        steps: [['QNH eingegeben', function (S) { return !!S.v.qnh; }], ['Temperatur eingegeben', function (S) { return !!S.v.atemp; }], ['Wind eingegeben', function (S) { return !!S.v.awind; }], ['Landeklappen gewählt (CONF3 oder FULL)', function (S) { return S.v.ldgconf === 'CONF3' || S.v.ldgconf === 'FULL'; }]] }
    ];
    function done(t) { return t.steps.filter(function (s) { return s[1](m.state); }).length; }
    function drawTasks() {
      $('tasks').innerHTML = T.map(function (t, i) { return '<button data-i="' + i + '" class="' + (i === cur ? 'on' : '') + '" type="button"><b>' + (i + 1) + ' · ' + t.n + '</b><span>' + done(t) + ' von ' + t.steps.length + ' Schritten</span></button>'; }).join('');
      var t = T[cur]; $('tt').textContent = t.n; $('tw').textContent = t.w;
      $('steps').innerHTML = t.steps.map(function (s) { var ok = s[1](m.state); return '<div class="step ' + (ok ? 'ok' : '') + '"><span class="b">' + (ok ? '✓' : '') + '</span><span>' + s[0] + '</span></div>'; }).join('');
    }
    function sync() { if (!m) return; if (ndv) ndv.update(m.state); drawTasks(); }
    m = VpAMcdu.mount($('mcdu'), { page: 'init', explainEl: $('expl'), onChange: sync });
    ndv = VpAMcdu.nd($('nd'), { getPlan: function () { return loaded ? plan : null; } });
    drawPlan(); T[0].setup(); sync();

    $('plsel').onchange = function () { var id = this.value; plan = plans.filter(function (p) { return p.id === id; })[0]; loaded = false; m.setPlan(null); m.reset(); drawPlan(); sync(); };
    $('plload').onclick = function () { loaded = !loaded; m.setPlan(loaded ? plan : null); drawPlan(); sync(); };
    $('tasks').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; m.reset(); T[cur].setup(); if (!m.state.route.length || T[cur].page !== 'fpln') m.go(T[cur].page); $('hintbox').hidden = true; drawPlan(); sync(); };
    var hb = $('hintbox');
    $('hint').onclick = function () { hb.textContent = T[cur].hint; hb.hidden = false; };
    $('solve').onclick = function () { hb.textContent = 'Lösung: ' + T[cur].sol; hb.hidden = false; };
    $('reset').onclick = function () { m.reset(); T[cur].setup(); m.go(T[cur].page); hb.hidden = true; drawPlan(); sync(); };
    $('modes').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; var f = b.dataset.m === 'free'; [].forEach.call($('modes').children, function (x) { x.className = x === b ? 'on' : ''; }); $('guide').hidden = f; $('free').hidden = !f; show('task'); m.reset(); if (f) { m.go('init'); } else { T[cur].setup(); m.go(T[cur].page); } hb.hidden = true; drawPlan(); sync(); };
    $('fclear').onclick = function () { m.reset(); m.go('init'); sync(); };

    function show(t) { [].forEach.call($('itabs').children, function (x) { x.classList.toggle('on', x.dataset.t === t); }); [].forEach.call(root.querySelectorAll('[data-p]'), function (s) { s.hidden = s.dataset.p !== t; }); }
    $('itabs').onclick = function (e) { var b = e.target.closest('button'); if (b) show(b.dataset.t); };
    window.vpaBack = function () { var on = $('itabs').querySelector('.on'); if (on && on.dataset.t !== 'task') { show('task'); return true; } if (m.state.page !== 'init') { m.go('init'); return true; } return false; };

    /* Sprung aus der Anleitung: Seite öffnen, frei üben */
    try { var go = sessionStorage.getItem('vpa.go'); if (go) { sessionStorage.removeItem('vpa.go'); $('modes').querySelector('[data-m="free"]').click(); m.go(go); } } catch (e) { }

    function fit() {
      var w = $('mcw'), dev = $('dev'); w.style.zoom = 1;
      var nh = w.offsetHeight || 860, nw = 540, vw = window.innerWidth, vh = window.innerHeight;
      var bars = (document.querySelector('.tabbar') || { offsetHeight: 64 }).offsetHeight + (document.querySelector('.apptop') || { offsetHeight: 56 }).offsetHeight + 16;
      var land = vw > vh * 1.15, s;
      if (land) s = Math.min((vh - bars) / nh, (vw * 0.5) / nw);
      else s = Math.min((vw - 20) / nw, (vh - bars) / nh);
      s = Math.max(0.45, Math.min(s, 1.7));
      w.style.zoom = s; dev.style.width = Math.round(nw * s) + 'px';
      root.querySelector('.mcl').classList.toggle('land', land);
    }
    window.addEventListener('resize', fit); window.addEventListener('orientationchange', function () { setTimeout(fit, 250); });
    fit(); setTimeout(fit, 300);
    return { mcdu: m };
  }
  window.VpAMcduApp = { mount: mount };
})();
