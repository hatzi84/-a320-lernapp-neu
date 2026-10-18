/* Flugplaner-Seite: Eingabe wie bei SimBrief, OFP, Übungslektionen. */
(function () {
  var N = window.VpANav, P = window.VpAPlan;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var altAuto = '';
  var F = { user: '', from: '', to: '', altn: '', flt: '', std: '10:00', routeTxt: '', crz: 350, ci: 30, pax: 140, cargo: 500, taxi: 200, cont: 5, fin: 30, extra: 0 };
  var plan = null, tab = 'form', lesson = 0, practice = false, saved = false, answer = '';

  var LESSONS = [
    { t: 'Was ist SimBrief?', w: 'SimBrief ist ein Flugplaner im Internet. Du sagst, von wo nach wo du fliegst, und er rechnet einen kompletten Flugplan: Route, Kraftstoff, Gewichte und die Zeiten für jeden Punkt. Dieses Papier heißt OFP (Operational Flight Plan). In der echten Welt macht das der Dispatcher der Airline, im Sim übernimmst du die Rolle. Hier übst du, wie du ihn bedienst, mit denselben Begriffen.', ck: null },
    { t: 'Dein SimBrief-Name', w: 'SimBrief kennt dich über deinen Benutzernamen (oder die Pilot-ID). Den trägst du später im Flugzeug ein. Wenn du in der MCDU „INIT REQUEST“ drückst, fragt das Flugzeug bei SimBrief nach deinem letzten Plan. Ohne diesen Namen findet es nichts. Aufgabe: Trage oben bei „SimBrief-Name“ einen Namen ein, ohne Leerzeichen.', ck: function () { return /^\S{3,}$/.test(F.user) ? '' : 'Der Name braucht mindestens 3 Zeichen ohne Leerzeichen.'; } },
    { t: 'Strecke', w: 'Alles beginnt mit den Flughäfen, als vierstelliger ICAO-Code. Der Alternate ist der Ausweichflughafen: Du planst Kraftstoff ein, um dorthin zu kommen, falls das Ziel nicht geht. Aufgabe: Abflug EDDF, Ziel EDDM, Alternate EDDN.', ck: function () { return F.from === 'EDDF' && F.to === 'EDDM' && F.altn === 'EDDN' ? '' : 'Es soll EDDF nach EDDM sein, Alternate EDDN.'; } },
    { t: 'Flugnummer und Zeit', w: 'Die Flugnummer (Callsign) steht im Plan und später in der MCDU und im Funk, zum Beispiel DLH123. Die Abflugzeit (STD) ist in UTC, der Weltzeit. Aufgabe: Trage die Flugnummer DLH123 ein.', ck: function () { return F.flt.toUpperCase() === 'DLH123' ? '' : 'Die Flugnummer soll DLH123 sein.'; } },
    { t: 'Route', w: 'Die Route ist die Linie über Wegpunkte. SimBrief kann sie automatisch finden (Auto) oder du gibst sie selbst ein. Hier heißt der Knopf „Route automatisch finden“. Lies die Wegpunkte, du gibst sie später in der MCDU ein. Aufgabe: Lass die Route automatisch finden.', ck: function () { return F.routeTxt.trim().split(/\s+/).filter(Boolean).length >= 1 ? '' : 'Es steht noch keine Route da.'; } },
    { t: 'Höhe und Cost Index', w: 'Die Reiseflughöhe (CRZ) gibst du als Flugfläche an, FL350 sind 35 000 ft. Auf kurzen Strecken kommt man nicht so hoch: SimBrief warnt dann. Der Cost Index bestimmt das Tempo: klein heißt sparsam, groß heißt schnell. Aufgabe: Cost Index 30, Höhe nach der Warnung wählen, die zur Strecke passt.', ck: function () { var d = N.routeDist(F.from, F.routeTxt.trim().split(/\s+/).filter(Boolean), F.to) || 0; return +F.ci === 30 && F.crz <= P.maxFl(d + 12) ? '' : 'Cost Index 30 und eine Höhe, die zur Strecke passt (bei 174 NM etwa FL180).'; } },
    { t: 'Zuladung', w: 'Die Zuladung (Payload) sind Passagiere und Fracht. Pro Passagier rechnet der Plan mit etwa 84 kg samt Gepäck. Dazu kommt das Leergewicht, zusammen ergibt das die ZFW, das Zero Fuel Weight, das Gewicht ohne Kraftstoff. Aufgabe: 150 Passagiere und 600 kg Fracht.', ck: function () { return +F.pax === 150 && +F.cargo === 600 ? '' : '150 Passagiere und 600 kg Fracht.'; } },
    { t: 'Kraftstoff', w: 'Der Kraftstoff setzt sich aus Teilen zusammen. TAXI: Rollen. TRIP: der Flug selbst. CONT (Contingency): meist 5 % vom Trip als Puffer. ALTN: der Weg zum Ausweichflughafen. FINAL RESERVE: 30 Minuten Warteschleife als letzte Reserve. EXTRA: was du freiwillig mehr tankst. Die Summe ist der BLOCK. Aufgabe: Taxi 200 kg, Contingency 5 %, Final Reserve 30 Minuten, Extra 0.', ck: function () { return +F.taxi === 200 && +F.cont === 5 && +F.fin === 30 && +F.extra === 0 ? '' : 'Taxi 200, Contingency 5, Final 30, Extra 0.'; } },
    { t: 'Plan erzeugen und lesen', w: 'Jetzt „Flugplan erzeugen“ drücken. Im OFP siehst du oben die Kopfdaten, dann die Kraftstoffliste, die Gewichte und das Navlog. Das Navlog ist die Reise als Tabelle: für jeden Punkt Entfernung, Zeit und Rest-Kraftstoff. Frage: Wie viel Kilogramm BLOCK stehen im Plan? Trage die Zahl bei der Frage ein (±100 kg).', ck: function () { if (!plan || !plan.ok) return 'Erzeuge erst den Plan.'; return Math.abs(+answer - plan.blockKg) <= 100 ? '' : 'Das stimmt nicht. Schau in der Kraftstoffliste auf die Zeile BLOCK.'; }, ask: true },
    { t: 'In die MCDU holen', w: 'Speichere den Plan („Speichern und für die MCDU bereitstellen“). Dann öffne die MCDU, gehe auf die Seite INIT und drücke bei „INIT REQUEST“ die Taste rechts daneben. Die MCDU holt Strecke, Flugnummer, Cost Index und Höhe aus deinem Plan. Auf INIT B holst du mit „FUEL / W&B REQUEST“ die Gewichte und den Kraftstoff. Aufgabe: Plan speichern.', ck: function () { return saved ? '' : 'Drücke „Speichern und für die MCDU bereitstellen“.'; } }
  ];

  function ap(list, id, v) { return '<input class="in" id="' + id + '" list="' + list + '" value="' + esc(v) + '" maxlength="4" autocapitalize="characters" autocomplete="off" inputmode="text">'; }
  function field(l, h) { return '<label class="fl2"><span>' + l + '</span>' + h + '</label>'; }
  function num(id, v, min, max, step) { return '<input class="in" id="' + id + '" type="number" inputmode="numeric" value="' + v + '" min="' + min + '" max="' + max + '" step="' + step + '">'; }

  function routeList() { return F.routeTxt.trim().toUpperCase().split(/\s+/).filter(Boolean); }
  function formH() {
    var opts = Object.keys(N.AIRPORTS).map(function (k) { return '<option value="' + k + '">' + N.AIRPORTS[k][0] + '</option>'; }).join('');
    var fls = ''; for (var f = 100; f <= 390; f += 10) fls += '<option value="' + f + '"' + (f === +F.crz ? ' selected' : '') + '>FL' + f + '</option>';
    var rl = routeList(), bad = rl.filter(function (r) { return !N.DB[r] || N.DB[r].apt; });
    var dist = F.from && F.to && N.DB[F.from] && N.DB[F.to] ? Math.round(N.dist(F.from, F.to)) : null;
    return '<datalist id="apl">' + opts + '</datalist>' +
      '<div class="card"><div class="eyebrow">SIMBRIEF-NAME</div><div class="fgrid">' + field('Benutzername oder Pilot-ID', '<input class="in" id="f-user" value="' + esc(F.user) + '" autocomplete="off">') + '</div><p class="small">Mit diesem Namen holt sich die MCDU später deinen Plan.</p></div>' +
      '<div class="card"><div class="eyebrow">STRECKE</div><div class="fgrid">' + field('Abflug (ICAO)', ap('apl', 'f-from', F.from)) + field('Ziel (ICAO)', ap('apl', 'f-to', F.to)) + field('Alternate', ap('apl', 'f-altn', F.altn)) + field('Flugnummer', '<input class="in" id="f-flt" value="' + esc(F.flt) + '" maxlength="8" autocapitalize="characters" autocomplete="off">') + field('Abflugzeit (UTC)', '<input class="in" id="f-std" type="time" value="' + F.std + '">') + field('Flugzeug', '<input class="in" value="A320-251N (Airbus A320neo)" disabled>') + '</div>' +
      altHint() + (dist ? '<p class="small">Luftlinie ' + dist + ' NM. Flugzeug und Flughäfen sind Übungsdaten (Auswahl in der Liste).</p>' : '<p class="small">Tippe einen ICAO-Code. Es gibt 25 Flughäfen zur Auswahl, zum Beispiel EDDF, EDDM, EDDH, EDDK.</p>') + '</div>' +
      '<div class="card"><div class="eyebrow">ROUTE</div><div class="btnrow" style="margin-top:0"><button class="btn pri" id="f-auto" type="button">Route automatisch finden</button><button class="btn" id="f-clr" type="button">Leeren</button></div>' +
      '<label class="fl2" style="margin-top:10px"><span>Wegpunkte, mit Leerzeichen getrennt</span><input class="in" id="f-route" value="' + esc(F.routeTxt) + '" autocapitalize="characters" autocomplete="off"></label>' +
      (bad.length ? '<p class="small err">Unbekannt: ' + bad.map(esc).join(', ') + '. Nur Wegpunkte aus der Übungsdatenbank.</p>' : '<p class="small">Die Route fliegt von Punkt zu Punkt geradeaus („DCT“). Anflug- und Abflugverfahren (SID/STAR) gibt es in dieser Übung nicht.</p>') + '</div>' +
      '<div class="card"><div class="eyebrow">PROFIL</div><div class="fgrid">' + field('Cost Index (0 bis 100)', num('f-ci', F.ci, 0, 100, 1)) + field('Reiseflughöhe', '<select class="in" id="f-crz">' + fls + '</select>') + '</div></div>' +
      '<div class="card"><div class="eyebrow">ZULADUNG</div><div class="fgrid">' + field('Passagiere', num('f-pax', F.pax, 0, 180, 1)) + field('Fracht (kg)', num('f-cargo', F.cargo, 0, 4000, 50)) + '</div></div>' +
      '<div class="card"><div class="eyebrow">KRAFTSTOFF</div><div class="fgrid">' + field('Taxi (kg)', num('f-taxi', F.taxi, 0, 800, 10)) + field('Contingency (%)', num('f-cont', F.cont, 0, 15, 1)) + field('Final Reserve (min)', num('f-fin', F.fin, 15, 60, 5)) + field('Extra (kg)', num('f-extra', F.extra, 0, 3000, 50)) + '</div></div>' +
      '<div class="btnrow"><button class="btn pri big" id="f-go" type="button">Flugplan erzeugen</button></div>';
  }

  /* Plan (OFP) als weißes Blatt im Stil des SimBrief-Flugplans. Alle Werte sind Übungsdaten aus dem vereinfachten Rechenmodell. */
  function ofpH() {
    if (!plan) return '<div class="card"><p>Noch kein Plan. Fülle die Eingabe aus und drücke „Flugplan erzeugen“.</p></div>';
    if (!plan.ok) return '<div class="card"><p class="err">' + esc(plan.error) + '</p></div>';
    var p = plan, AC = P.AC, flow = p.tripKg / Math.max(1, p.eteMin) * 60;
    var tm = function (kg) { return P.hm(kg / flow * 60); };
    var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], d = new Date();
    var date = ('0' + d.getUTCDate()).slice(-2) + MON[d.getUTCMonth()] + String(d.getUTCFullYear()).slice(2);
    var row = function (a, b, c, d2, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + a + '</td><td class="rt">' + b + '</td><td class="rt">' + (c == null ? '' : c) + '</td><td class="rt">' + (d2 == null ? '' : d2) + '</td></tr>'; };
    var minTo = p.tripKg + p.contKg + p.altnKg + p.finKg, dAlt = p.altn ? Math.round(N.dist(p.to, p.altn)) : 0;
    var over = function (v, m) { return v > m ? ' over' : ''; };
    var h = '<div class="ofp">' +
      '<div class="ofp-h"><b>' + esc(p.flt || 'FLUGPLAN') + '</b><span>' + p.from + '/' + p.to + ' &nbsp; ' + date + '</span><span>' + esc(p.ac || AC.name) + '</span></div>' +
      '<div class="ofp-note">OPERATIONAL FLIGHT PLAN · NUR ZUM ÜBEN · ' + esc(F.user ? 'PILOT ' + F.user.toUpperCase() : 'PILOT') + '</div>' +
      '<div class="ofp-g2"><div><div class="ofp-t">FLUG</div><table class="ofp-tb">' + row('ABFLUG', p.from, 'STD', p.std + 'Z') + row('ZIEL', p.to, 'STA', p.sta + 'Z') + row('ALTERNATE', p.altn || '—', 'ETE', p.ete) + row('DISTANZ', p.dist + ' NM', 'REISEFLUG', p.crz) + row('COST INDEX', p.ci, 'PAX', p.pax) + '</table></div>' +
      '<div><div class="ofp-t">KRAFTSTOFF</div><table class="ofp-tb"><tr><th></th><th class="rt">KG</th><th class="rt">ZEIT</th><th></th></tr>' +
      row('TAXI', p.taxiKg, '0:12') + row('TRIP', p.tripKg, p.ete) + row('CONT', p.contKg, tm(p.contKg)) + row('ALTN', p.altnKg, p.altn ? tm(p.altnKg) : '', p.altn || '') + row('FINAL RES', p.finKg, tm(p.finKg)) + (p.extraKg ? row('EXTRA', p.extraKg, tm(p.extraKg)) : '') +
      row('MIN T/O', minTo, tm(minTo), '', 'sep') + row('BLOCK (RAMP)', p.blockKg, tm(p.blockKg), '', 'tot') + '</table></div></div>' +
      '<div class="ofp-t">GEWICHTE</div><table class="ofp-tb"><tr><th></th><th class="rt">KG</th><th class="rt">MAX</th><th></th></tr>' +
      row('OEW (LEER)', p.oew, '', '') + row('ZUL. · ' + p.pax + ' PAX + ' + p.cargo + ' KG', p.payload, '', '') + row('EZFW', '<span class="' + over(p.zfwKg, AC.mzfw) + '">' + p.zfwKg + '</span>', AC.mzfw) + row('ETOW', '<span class="' + over(p.towKg, AC.mtow) + '">' + p.towKg + '</span>', AC.mtow) + row('ELDW', '<span class="' + over(p.lwKg, AC.mlw) + '">' + p.lwKg + '</span>', AC.mlw) + '</table>' +
      '<div class="ofp-t">ROUTE</div><div class="ofp-rt">' + esc(p.routeStr) + '</div>';
    if (p.warn.length) h += '<div class="ofp-t">HINWEISE</div>' + p.warn.map(function (w) { return '<div class="ofp-w">* ' + esc(w) + '</div>'; }).join('');
    h += '<div class="ofp-t">NAVLOG</div><div class="tscroll"><table class="ofp-tb ofp-nav"><tr><th>IDENT</th><th class="rt">TRK</th><th class="rt">ALT</th><th class="rt">DIS</th><th class="rt">REST</th><th class="rt">ETE</th><th class="rt">ETA</th><th class="rt">FUEL</th></tr>';
    var prev = null;
    p.navlog.forEach(function (n) {
      var trk = '';
      if (!n.mark && prev && N.DB[prev] && N.DB[n.id]) { var b = N.bearing(prev, n.id); if (b != null) trk = ('00' + Math.round(b)).slice(-3); }
      h += '<tr' + (n.mark ? ' class="ofpm"' : '') + '><td>' + esc(n.id) + '</td><td class="rt">' + trk + '</td><td class="rt">' + (n.fl ? 'FL' + n.fl : '') + '</td><td class="rt">' + (n.d || '') + '</td><td class="rt">' + Math.max(0, p.dist - n.cum) + '</td><td class="rt">' + n.ete + '</td><td class="rt">' + n.eta + '</td><td class="rt">' + Math.round(n.fuel) + '</td></tr>';
      if (!n.mark) prev = n.id;
    });
    h += '</table></div><div class="ofp-s">TRK = Kurs rechtweisend. DIS = Strecke zum Punkt, REST = bis zum Ziel (NM). ETA in UTC. FUEL = Rest-Trip-Kraftstoff in kg. TOC = Beginn Reiseflug, TOD = Beginn Sinkflug.</div>';
    if (p.altn) h += '<div class="ofp-t">ALTERNATE ' + p.altn + '</div><table class="ofp-tb">' + row('ZIEL → ' + p.altn, dAlt + ' NM', '', '') + row('KRAFTSTOFF', p.altnKg + ' KG', '≈ ' + tm(p.altnKg), '') + '</table>';
    h += '<div class="ofp-s">Wind, Wetter, Luftstraßen, Frequenzen, SID und STAR gibt es in dieser Übungs-Version nicht. Echte Pläne holst du dir bei SimBrief. Der Aufbau hier zeigt, wo du später was findest.</div></div>' +
      '<div class="btnrow"><button class="btn pri big" id="o-save" type="button">' + (saved ? 'Gespeichert ✓' : 'Speichern und für die MCDU bereitstellen') + '</button><a class="btn big" href="mcdu.html">Zur MCDU</a></div>';
    return h;
  }

  function myH() {
    var l = P.load(), a = P.active();
    if (!l.length) return '<div class="card"><p>Noch keine gespeicherten Pläne. Erzeuge einen Plan und speichere ihn.</p></div>';
    return l.map(function (p) { return '<div class="card"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:180px"><b>' + esc(p.name) + '</b><div class="small">' + p.dist + ' NM · ' + p.ete + ' h · Block ' + p.blockKg + ' kg' + (p.id === a ? ' · <span style="color:var(--blue)">aktiv für die MCDU</span>' : '') + '</div></div><button class="btn" data-act="use" data-id="' + p.id + '" type="button">Für MCDU wählen</button><button class="btn" data-act="del" data-id="' + p.id + '" type="button">Löschen</button></div></div>'; }).join('');
  }

  function guideH() {
    if (!practice) return '';
    var L = LESSONS[lesson];
    return '<div class="card guide"><div class="eyebrow">SIMBRIEF ÜBEN · SCHRITT ' + (lesson + 1) + ' VON ' + LESSONS.length + '</div><h3 class="h3d">' + L.t + '</h3><p class="small gtxt">' + L.w + '</p>' +
      (L.ask ? '<label class="fl2"><span>Dein Wert für BLOCK (kg)</span><input class="in" id="g-ans" type="number" inputmode="numeric" value="' + esc(answer) + '"></label>' : '') +
      '<div class="btnrow"><button class="btn" id="g-back" type="button"' + (lesson ? '' : ' disabled') + '>Zurück</button>' + (L.ck ? '<button class="btn pri" id="g-ck" type="button">Prüfen</button>' : '') + '<button class="btn" id="g-next" type="button"' + (lesson < LESSONS.length - 1 ? '' : ' disabled') + '>Weiter</button></div><p class="small" id="g-msg"></p></div>';
  }

  var root;
  function draw() {
    var y = root.parentElement.scrollTop;
    var tabs = '<div class="tabs3"><button data-t="form" class="' + (tab === 'form' ? 'on' : '') + '" type="button">Eingabe</button><button data-t="ofp" class="' + (tab === 'ofp' ? 'on' : '') + '" type="button">Plan (OFP)</button><button data-t="my" class="' + (tab === 'my' ? 'on' : '') + '" type="button">Meine Pläne</button><button data-t="prac" class="' + (practice ? 'on' : '') + '" type="button">SimBrief üben ' + (practice ? '· an' : '') + '</button></div>';
    root.innerHTML = tabs + guideH() + (tab === 'form' ? formH() : tab === 'ofp' ? ofpH() : myH());
    root.parentElement.scrollTop = y;
  }
  function say(m) {
    var t = document.createElement('div'); t.textContent = m;
    t.style.cssText = 'position:fixed;left:16px;right:16px;bottom:84px;background:#223;color:#fff;padding:12px 14px;border-radius:10px;z-index:99;font:14px sans-serif';
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3500);
  }
  /* Alternate automatisch vorschlagen, sobald Abflug und Ziel stimmen. Eigene Eingaben bleiben stehen. */
  function autoAlt() {
    var ok = N.DB[F.from] && N.DB[F.from].apt && N.DB[F.to] && N.DB[F.to].apt && F.from !== F.to;
    if (!ok) { if (F.altn === altAuto) F.altn = ''; altAuto = ''; return; }
    var s = N.suggestAlt(F.to, F.from, 3)[0];
    if (!F.altn || F.altn === altAuto || F.altn === F.to || F.altn === F.from) { F.altn = s ? s.id : ''; altAuto = F.altn; }
  }
  function altHint() {
    if (!(N.DB[F.from] && N.DB[F.to] && N.DB[F.from].apt && N.DB[F.to].apt) || F.from === F.to) return '';
    var l = N.suggestAlt(F.to, F.from, 3); if (!l.length) return '';
    var h = '<p class="small" style="margin-bottom:6px">' + (F.altn && F.altn === altAuto ? 'Alternate automatisch gewählt: der nächste Flughafen zum Ziel. ' : '') + 'Vorschläge für ' + F.to + ' (Luftlinie vom Ziel):</p><div class="btnrow" style="margin-top:0;flex-wrap:wrap">';
    l.forEach(function (a) { h += '<button class="btn' + (a.id === F.altn ? ' pri' : '') + '" type="button" data-altn="' + a.id + '">' + a.id + ' · ' + esc(a.name) + ' · ' + a.nm + ' NM</button>'; });
    return h + '</div>';
  }
  function readForm() {
    var g = function (id) { var e = root.querySelector('#' + id); return e ? e.value : null; };
    var m = { user: 'f-user', from: 'f-from', to: 'f-to', altn: 'f-altn', flt: 'f-flt', std: 'f-std', routeTxt: 'f-route', crz: 'f-crz', ci: 'f-ci', pax: 'f-pax', cargo: 'f-cargo', taxi: 'f-taxi', cont: 'f-cont', fin: 'f-fin', extra: 'f-extra' };
    Object.keys(m).forEach(function (k) { var v = g(m[k]); if (v !== null) F[k] = /^(from|to|altn|flt|routeTxt)$/.test(k) ? v.toUpperCase() : v; });
  }
  function generate() {
    readForm();
    if (!N.DB[F.from] || !N.DB[F.from].apt) return 'Abflug: unbekannter Flughafen. Wähle einen aus der Liste.';
    if (!N.DB[F.to] || !N.DB[F.to].apt) return 'Ziel: unbekannter Flughafen. Wähle einen aus der Liste.';
    if (F.from === F.to) return 'Abflug und Ziel sind gleich.';
    if (F.altn && (!N.DB[F.altn] || !N.DB[F.altn].apt)) return 'Alternate: unbekannter Flughafen.';
    plan = P.calc({ from: F.from, to: F.to, altn: F.altn, flt: F.flt, ci: +F.ci, crz: +F.crz, route: routeList(), pax: +F.pax, cargo: +F.cargo, taxi: +F.taxi, contPct: +F.cont, finalMin: +F.fin, extra: +F.extra, std: F.std });
    saved = false; tab = 'ofp'; draw(); return '';
  }

  function mount(r) {
    root = r; draw();
    /* Zurück-Taste von Android: erst Reiter/Übungsmodus verlassen, dann die Seite */
    window.vpaBack = function () { if (tab !== 'form') { tab = 'form'; draw(); return true; } if (practice) { practice = false; draw(); return true; } return false; };
    root.addEventListener('input', function (e) { if (e.target.id === 'g-ans') answer = e.target.value; });
    root.addEventListener('change', function (e) { if (tab === 'form' && e.target.id) { readForm(); if (e.target.id === 'f-from' || e.target.id === 'f-to') { autoAlt(); draw(); } else if (e.target.id === 'f-altn') altAuto = ''; } });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button,a'); if (!b) return; var id = b.id, t = b.dataset.t;
      if (b.dataset.altn) { readForm(); F.altn = b.dataset.altn; altAuto = ''; draw(); return; }
      if (t) { if (t === 'prac') { practice = !practice; } else tab = t; draw(); return; }
      if (id === 'f-auto') { readForm(); if (!N.DB[F.from] || !N.DB[F.to] || !N.DB[F.from].apt || !N.DB[F.to].apt) { say('Trage zuerst Abflug und Ziel ein.'); return; } F.routeTxt = N.routeFor(F.from, F.to).join(' '); draw(); return; }
      if (id === 'f-clr') { F.routeTxt = ''; draw(); return; }
      if (id === 'f-go') { var m = generate(); if (m) say(m); return; }
      if (id === 'o-save') { if (plan && plan.ok) { var c = JSON.parse(JSON.stringify(plan)); c.user = F.user; P.add(c); saved = true; draw(); } return; }
      if (id === 'g-back') { lesson = Math.max(0, lesson - 1); draw(); return; }
      if (id === 'g-next') { lesson = Math.min(LESSONS.length - 1, lesson + 1); draw(); return; }
      if (id === 'g-ck') { readForm(); var msg = LESSONS[lesson].ck(), el = root.querySelector('#g-msg'); el.textContent = msg ? '✗ ' + msg : '✓ Richtig.'; el.className = 'small ' + (msg ? 'err' : 'okm'); return; }
      if (b.dataset.act === 'use') { P.setActive(b.dataset.id); draw(); return; }
      if (b.dataset.act === 'del') { P.remove(b.dataset.id); draw(); }
    });
  }
  window.VpAPlanApp = { mount: mount };
})();
