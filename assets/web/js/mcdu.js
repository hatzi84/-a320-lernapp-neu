/* Übungs-MCDU und Navigation Display für den Entwurf.
   Vereinfachte Nachbildung (Seiten INIT, F-PLN, PERF), kein Abbild der FBW-MCDU. Alle Wegpunkte im Beispielplan sind erfunden. */
(function () {
  var EXPL = {
    route: ['FROM/TO', 'Hier gibst du Abflug- und Zielflughafen als ICAO-Codes ein, getrennt durch einen Schrägstrich, zum Beispiel EDDM/EDDH. Danach richtet sich der ganze Flugplan.'],
    req: ['INIT REQUEST', 'Holt den Plan aus dem Flugplaner (SimBrief). Er füllt die INIT-Seite und legt die Route als vorläufigen Flugplan (gelb) in die F-PLN-Seite. Dort musst du ihn mit INSERT übernehmen.'],
    flt: ['FLT NBR', 'Die Flugnummer, bis zu 8 Zeichen. Sie erscheint später auf der Bodenstation und in der ATC-Kommunikation.'],
    ci: ['COST INDEX', 'Verhältnis von Zeitkosten zu Spritkosten. Ein kleiner Wert heißt sparsam und langsam, ein großer heißt schneller und durstiger. Er steuert die Geschwindigkeit im Reiseflug.'],
    crz: ['CRZ FL/TEMP', 'Geplante Reiseflughöhe als Flugfläche, zum Beispiel FL350. Die Temperatur darf folgen, sie wird sonst geschätzt.'],
    v1: ['V1', 'Entscheidungsgeschwindigkeit, Pflichtfeld (orange Kästchen). Ab hier wird der Start nicht mehr abgebrochen, auch bei einer Störung.'],
    vr: ['VR', 'Rotationsgeschwindigkeit. Hier hebst du die Nase an. VR liegt gleich hoch oder höher als V1.'],
    v2: ['V2', 'Startsteiggeschwindigkeit mit einem Triebwerk ausgefallen. V2 liegt gleich hoch oder höher als VR.'],
    trans: ['TRANS ALT', 'Übergangshöhe. Sie kommt aus der Datenbank, sobald der Abflughafen feststeht (in Deutschland meist 5000 ft), und kann geändert werden. Darüber stellst du den Höhenmesser auf Standard (1013). In Deutschland meist 5000 ft.'],
    thr: ['THR RED/ACC', 'Höhen über dem Meer, in denen die Schubreduzierung und die Beschleunigung nach dem Start beginnen. Standard: 1500 ft über der Piste, mindestens 400 ft. CLR stellt den Standard wieder her.'],
    flaps: ['FLAPS/THS', 'Klappenstellung und Trimmung für den Start, zum Beispiel 1/UP0.5.'],
    flex: ['FLEX TO TEMP', 'Angenommene Temperatur, mit der der Start mit weniger Schub berechnet wird. Das schont die Triebwerke.'],
    from: ['FROM', 'Der Abflugort ganz oben im Flugplan. Von hier an zählt die Route.'],
    wp: ['Wegpunkt', 'Ein Wegpunkt der Route. Tippe einen anderen Namen ins Schreibfeld und drücke die Taste neben diesem Eintrag: Der neue Punkt wird davor eingefügt. Mit CLR und dann der Taste löschst du ihn.'],
    'new': ['Freie Zeile', 'Hier hängst du einen weiteren Wegpunkt an das Ende der Route an. Der Name muss in der Datenbank stehen, sonst kommt NOT IN DATABASE.'],
    dest: ['DEST', 'Der Zielflughafen am Ende des Flugplans.'],
    erase: ['ERASE', 'Verwirft den vorläufigen Flugplan (gelb). Es bleibt der bisherige gültige Flugplan.'],

    go: ['Seitenwechsel', 'Mit dieser Taste springst du zur genannten Unterseite. Der Pfeil zeigt die Richtung: < links gehört zur linken, > zur rechten Taste.'],
    ret: ['RETURN', 'Zurück zur vorherigen Seite.'],
    taxi: ['TAXI', 'Kraftstoff, der beim Rollen vor dem Start verbraucht wird, in Tonnen. Standard sind etwa 0,2 bis 0,4. Er zählt zum Block, nicht zum Reiseflug.'],
    zfw: ['ZFW/ZFWCG', 'Zero Fuel Weight in Tonnen und Schwerpunkt dazu in Prozent, zum Beispiel 60.5/28.0. Pflichtfeld (orange Kästchen). In der FlyByWire-A320 drückst du die Taste einmal ohne Eingabe: Der Wert erscheint im Schreibfeld, ein zweiter Druck übernimmt ihn.'],
    block: ['BLOCK', 'Gesamter Kraftstoff vor dem Start in Tonnen, wie ihn der Flugplan vorgibt. Daraus rechnet die MCDU die Reserven.'],
    trip: ['TRIP / TIME', 'Geschätzter Kraftstoff und Flugzeit bis zum Ziel auf der geplanten Route. Wird aus dem Flugplan berechnet.'],
    rsv: ['RTE RSV / %', 'Streckenreserve (Contingency) in Tonnen und als Prozent des Trips. Üblich sind 5 Prozent.'],
    altnf: ['ALTN / TIME', 'Kraftstoff und Zeit bis zum Ausweichflughafen.'],
    final: ['FINAL / TIME', 'Endreserve, meist für 30 Minuten Warteschleife in 1500 ft über dem Ziel.'],
    extra: ['EXTRA / TIME', 'Was nach allen Pflichtreserven übrig bleibt. Negativ heißt: zu wenig Kraftstoff geplant.'],
    dir: ['DIR TO', 'Direkt zu einem Wegpunkt der Route. Alle Punkte davor werden übersprungen. Das Ergebnis ist ein vorläufiger Plan (gelb), den du mit INSERT übernimmst.'],
    optfl: ['OPT FL', 'Wirtschaftlich beste Flughöhe für das jetzige Gewicht. Sie steigt, wenn das Flugzeug leichter wird.'],
    recmax: ['REC MAX', 'Höchste empfohlene Flughöhe. Höher fliegt man mit wenig Reserve zum Buffet.'],
    prog_to: ['TO', 'Der nächste Wegpunkt mit Abstand und Zeit. Hier prüfst du im Flug, ob du auf Plan liegst.'],
    efob: ['EFOB', 'Geschätzter Kraftstoff bei Ankunft. Sinkt er unter die Reserve, musst du reagieren.'],
    vor1: ['VOR 1 / FREQ', 'Funkfeuer-Frequenz für den ersten Empfänger, 108.00 bis 117.95 MHz. Oder der Kennbuchstabe des Feuers.'],
    vor2: ['VOR 2 / FREQ', 'Dasselbe für den zweiten Empfänger.'],
    crs1: ['CRS (VOR 1)', 'Kurs, den du auf dem Feuer 1 fliegen willst, 3 Ziffern.'],
    crs2: ['CRS (VOR 2)', 'Kurs zum Feuer 2, 3 Ziffern.'],
    ils: ['ILS / FREQ', 'Frequenz des Instrumentenlandesystems, 108.10 bis 111.95 MHz. Nur dann zeigt das PFD den ILS-Kurs.'],
    ilscrs: ['ILS CRS', 'Anflugkurs der Landebahn, 3 Ziffern (steht auf der Anflugkarte).'],
    adf1: ['ADF 1', 'Frequenz des Funkfeuers (NDB) in kHz, 190 bis 1750.'],
    adf2: ['ADF 2', 'Zweiter ADF-Empfänger.'],
    copy: ['COPY ACTIVE', 'Kopiert den aktiven Flugplan in den sekundären Plan. So hast du Platz für einen Ausweichplan.'],
    secdel: ['DELETE SEC', 'Löscht den sekundären Flugplan.'],
    secact: ['ACTIVATE SEC', 'Macht den sekundären Plan zum aktiven. Der alte aktive wird zum sekundären.'],
    qnh: ['QNH', 'Luftdruck am Ziel in hPa, vier Ziffern. Daraus rechnet die MCDU die Anflugwerte.'],
    atemp: ['TEMP', 'Temperatur am Ziel in Grad Celsius, 2 Ziffern, mit Minus bei Frost.'],
    awind: ['MAG WIND', 'Wind am Ziel: Richtung/Stärke in Knoten, zum Beispiel 270/12.'],
    mda: ['MDA/MDH', 'Mindestsinkflughöhe bei Nichtpräzisionsanflug, 3 bis 4 Ziffern in ft.'],
    dh: ['DH', 'Entscheidungshöhe beim ILS, 2 bis 3 Ziffern in ft.'],
    ldgconf: ['LDG CONF', 'Landeklappenstellung: CONF3 oder FULL. FULL ist Standard, CONF3 bei bestimmten Störungen.'],
    vapp: ['VAPP', 'Anfluggeschwindigkeit: VLS plus Zuschlag für Wind, mindestens 5 kt. Wird beim Eintragen der Landedaten berechnet.'],
    clbspd: ['CLB SPD', 'Steiggeschwindigkeit in kt. Leer bleibt ECON, also nach Cost Index.'],
    desspd: ['DES SPD', 'Sinkfluggeschwindigkeit in kt. Leer bleibt ECON.'],
    desmach: ['DES MACH', 'Sinkflug-Machzahl, zum Beispiel .78, bis die Höhe die Geschwindigkeit übernimmt.'],
    ena: ['ENG OUT ACC', 'Höhe über Grund, ab der bei Triebwerksausfall beschleunigt wird.'],
    fmgc: ['FMGC', 'Das Flugführungssystem: Hier liegen Flugplan, Leistung und Navigation.'],
    na: ['Nicht nachgebildet', 'Diese Unterseite gibt es im echten Flugzeug, sie ist im Entwurf nur als Name da.'],
    tropo: ['TROPO', 'Höhe der Tropopause, Standard 36090 ft. Änderbar bis 60000 ft. Sie beeinflusst die Vorhersagen.'],
    progto: ['BRG/DIST TO', 'Tippe einen Wegpunkt oder Flughafen ein. Links stehen Peilung und Entfernung von der jetzigen Position (am Boden: vom Abflughafen).'],
    baro: ['BARO', 'Mindesthöhe (MDA) über dem Meer in ft für einen Anflug ohne ILS-Gleitweg, oder als Barometer-Minimum.'],
    radio: ['RADIO', 'Entscheidungshöhe (DH) über Grund in ft für CAT II/III-Anflüge, 0 bis 700. Auch NO DH ist möglich.'],
    vapp: ['VAPP', 'Anfluggeschwindigkeit. Die MCDU rechnet VLS plus ein Drittel des Gegenwinds, mindestens 5, höchstens 15 kt. Du kannst den Wert überschreiben, CLR stellt die Rechnung wieder her.'],
    ldg3: ['LDG CONF CONF3', 'Landung mit Klappen 3 statt FULL. Taste drücken, ohne etwas einzutippen. VLS und VAPP werden etwas höher.'],
    ldgfull: ['LDG CONF FULL', 'Landung mit vollen Klappen, das ist der Normalfall.'],
    fplan: ['FUEL PLANNING', 'Lässt die MCDU den Block-Kraftstoff ausrechnen: Taxi + Trip + Reserve + Alternate + Endreserve. Braucht vorher ZFW und eine Route.'],
    thrga: ['THR RED/ACC (Durchstarten)', 'Höhen für Schubreduzierung und Beschleunigung nach dem Durchstarten. Standard: 1500 ft über dem Zielflughafen.'],
    enaga: ['ENG OUT ACC (Durchstarten)', 'Beschleunigungshöhe beim Durchstarten mit einem Triebwerk.'],
    req2: ['FUEL / W&B REQUEST', 'Holt Gewicht (ZFW mit Schwerpunkt), Block- und Taxi-Kraftstoff aus dem Flugplan (SimBrief). So musst du die Werte nicht von Hand abtippen.'],
    altn: ['ALTN / CO RTE', 'Ausweichflughafen als ICAO-Code. Wenn das Ziel nicht nutzbar ist, fliegst du dorthin. Der Flugplan sieht dafür Kraftstoff vor.'],
    insert: ['INSERT', 'Macht den vorläufigen Flugplan (gelb) gültig. Erst dann fliegt das Flugzeug diese Route. Die Zwischenstufe schützt vor Tippfehlern.']
  };
  var KEYS_PAGE = [['DIR', 'dir'], ['PROG', 'prog'], ['PERF', 'perf'], ['INIT', 'init'], ['DATA', 'data'], ['F-PLN', 'fpln'], ['RAD NAV', 'rad'], ['FUEL PRED', 'fuel'], ['SEC F-PLN', 'sec'], ['ATC COMM', 'atc'], ['MCDU MENU', 'menu'], ['AIRPORT', 'apt']];
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var DB = window.VpANav ? window.VpANav.DB : {};

  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function dist(a, b) { var d = window.VpANav ? window.VpANav.dist(a, b) : null; return d == null ? null : Math.round(d); }


  /* Übergangshöhen je Flughafen (Werte der Übungsdatenbank, Stand der jeweiligen AIP nicht geprüft) */
  var TA = { EDDF: '5000', EDDM: '5000', EDDH: '5000', EDDB: '5000', EDDL: '5000', EDDK: '5000', EDDS: '5000', EDDV: '5000', EDDN: '5000', EDDW: '5000', EDDP: '5000', EDDC: '5000', EDDG: '5000', EDLW: '5000', EDSB: '5000',
    LOWW: '10000', LSZH: '7000', EHAM: '3000', LFPG: '5000', EGLL: '6000', EKCH: '5000', LEMD: '13000', LIRF: '7000', ESSA: '5000' };
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function routeDist(S) {
    var ids = []; if (S.v.from) ids.push(S.v.from); (S.tmp || S.route).forEach(function (i) { ids.push(i); }); if (S.v.to) ids.push(S.v.to);
    if (ids.length < 2) return 0; var t = 0; for (var i = 1; i < ids.length; i++) { var d = dist(ids[i - 1], ids[i]); if (d == null) return 0; t += d; } return t;
  }
  function validate(f, s) {
    var m;
    if (f === 'route') { m = /^([A-Z]{4})\/([A-Z]{4})$/.exec(s); return m ? { from: m[1], to: m[2] } : null; }
    if (f === 'altn') return /^[A-Z]{4}$/.test(s.split('/')[0]) ? s.split('/')[0] : null;
    if (f === 'flt') return /^[A-Z0-9]{1,8}$/.test(s) ? s : null;
    if (f === 'ci') return /^\d{1,3}$/.test(s) ? String(parseInt(s, 10)) : null;
    if (f === 'crz') { m = /^(?:FL)?(\d{3})(?:\/-?\d{1,2})?$/.exec(s); return m ? 'FL' + m[1] : null; }
    if (f === 'v1' || f === 'vr' || f === 'v2') return /^\d{3}$/.test(s) && +s >= 100 && +s <= 250 ? s : null;
    if (f === 'trans') return /^\d{4,5}$/.test(s) && +s <= 18000 ? s : null;
    if (f === 'thr') return /^\d{3,4}\/\d{3,4}$/.test(s) ? s : null;
    if (f === 'flaps') { m = /^([0-3])\/(?:(UP|DN)(\d(?:\.\d)?)|(\d(?:\.\d)?)(UP|DN))$/.exec(s); return m ? m[1] + '/' + (m[2] || m[5]) + (+(m[3] || m[4])).toFixed(1) : null; }
    if (f === 'flex') return /^\d{2}$/.test(s) ? s : null;

    if (f === 'taxi') return /^\d(\.\d)?$/.test(s) ? s : null;
    if (f === 'zfw') { m = /^(\d{2,3}(?:\.\d)?)\/(\d{2}(?:\.\d)?)$/.exec(s); return m && +m[1] >= 35 && +m[1] <= 64.3 && +m[2] >= 8 && +m[2] <= 50 ? (+m[1]).toFixed(1) + '/' + (+m[2]).toFixed(1) : null; }
    if (f === 'tropo') return /^\d{4,5}$/.test(s) && +s <= 60000 ? s : null;
    if (f === 'progto') return DB[s] ? s : null;
    if (f === 'baro') return /^\d{3,4}$/.test(s) ? s : null;
    if (f === 'radio') return /^\d{1,3}$/.test(s) && +s <= 700 ? s : (/^NO ?DH$|^NO$/.test(s) ? 'NO DH' : null);
    if (f === 'vapp') return /^\d{3}$/.test(s) && +s >= 100 && +s <= 180 ? s : null;
    if (f === 'thrga') return /^\d{3,4}\/\d{3,4}$/.test(s) ? s : null;
    if (f === 'enaga') return /^\d{3,4}$/.test(s) ? s : null;
    if (f === 'block') return /^\d{1,2}\.\d$/.test(s) ? s : null;
    if (f === 'dir') return DB[s] && !DB[s].apt ? s : null;
    if (f === 'vor1' || f === 'vor2') return /^1(0[89]|1[0-7])\.\d{2}$/.test(s) ? s : null;
    if (f === 'crs1' || f === 'crs2' || f === 'ilscrs') return /^\d{3}$/.test(s) && +s <= 360 ? s : null;
    if (f === 'ils') return /^1(0[89]|1[01])\.\d{2}$/.test(s) ? s : null;
    if (f === 'adf1' || f === 'adf2') return /^\d{3,4}(\.\d)?$/.test(s) && +s >= 190 && +s <= 1750 ? s : null;
    if (f === 'qnh') return /^(9\d{2}|10\d{2})$/.test(s) ? s : (/^\d{2}(\.\d{2})?$/.test(s) ? (+s).toFixed(2) : null);
    if (f === 'atemp') return /^-?\d{1,2}$/.test(s) ? s : null;
    if (f === 'awind') { m = /^(\d{1,3})\/(\d{1,3})$/.exec(s); return m && +m[1] <= 360 ? ('00' + m[1]).slice(-3) + '°/' + ('00' + m[2]).slice(-3) : null; }
    if (f === 'mda') return /^\d{3,4}$/.test(s) ? s : null;
    if (f === 'dh') return /^\d{2,3}$/.test(s) ? s : null;
    if (f === 'ldgconf') return s === 'CONF3' || s === 'FULL' ? s : null;
    if (f === 'clbspd') return /^\d{3}$/.test(s) && +s >= 100 && +s <= 350 ? s : null;
    if (f === 'desspd') return (/^\d{3}$/.test(s) && +s >= 100 && +s <= 350) || /^\.\d{2}(\/\d{3})?$/.test(s) ? s : null;
    if (f === 'desmach') return /^\.\d{2}$/.test(s) ? s : null;
    if (f === 'ena') return /^\d{3,5}$/.test(s) ? s : null;
    return null;
  }

  function fplnEntries(S) {
    var list = S.tmp || S.route, e = [];
    e.push({ k: 'from', id: S.v.from || '----' });
    list.forEach(function (id, i) { e.push({ k: 'wp', id: id, idx: i }); });
    e.push({ k: 'new', id: '-----' });
    e.push({ k: 'dest', id: S.v.to || '----' });
    return e;
  }

  function pages(S) {
    var v = S.v, ph = function (x, n) { return x || new Array(n + 1).join('_'); };
    var box = function (n) { return new Array(n + 1).join('□'); };
    var dep = DB[v.from], el = dep && dep.elev != null ? dep.elev : null, accDef = el != null ? String(Math.round(el + 1500)) : null;
    var arr = DB[v.to], elA = arr && arr.elev != null ? arr.elev : null, accDefA = elA != null ? String(Math.round(elA + 1500)) : null;
    var taDef = TA[v.from] || (v.from ? '5000' : '');
    var isa = function (fl) { return Math.round(15 - 1.98 * (+fl) / 10); };
    var crzN = v.crz ? +v.crz.slice(2) : 0;
    /* Seiten nach FlyByWire-Doku (A32NX Pilot Briefing, MCDU). Farben: weiß = Beschriftung/Sprung, blau = änderbar,
       grün = berechnet, nicht änderbar, orange Kästchen = Pflichteingabe, magenta = Grenzwert. */
    var P = {
      init: { title: 'INIT', rows: [
        { l: 'CO RTE', ld: v.from ? '' : box(10), lk: 'na', r: 'FROM/TO', rd: v.from ? v.from + '/' + v.to : box(4) + '/' + box(4), rk: 'route' },
        { l: 'ALTN/CO RTE', ld: v.from ? (v.altn || 'NONE') : '----/----------', lk: v.from ? 'altn' : null, lc: v.from ? 'c' : 'w', r: v.from && S.route.length ? '' : 'INIT', rd: v.from && S.route.length ? '' : 'REQUEST*', rk: v.from && S.route.length ? null : 'req', rc: 'a' },
        { l: 'FLT NBR', ld: v.flt || box(8), lk: 'flt', r: '', rd: 'IRS INIT>', rk: 'na' },
        { l: '', ld: '', r: '', rd: '' },
        { l: 'COST INDEX', ld: v.ci || box(3), lk: 'ci', r: '', rd: 'WIND/TEMP>', rk: 'na' },
        { l: 'CRZ FL/TEMP', ld: v.crz ? v.crz + '/' + isa(crzN) + '°' : box(5) + '/' + box(3) + '°', lk: 'crz', r: 'TROPO', rd: v.tropo || '36090', rk: 'tropo' }
      ] },
      perf: { title: 'TAKE OFF', rows: [
        { l: 'V1', ld: v.v1 || box(3), lk: 'v1', m: 'FLP RETR', md: 'F=' + (v.v2 ? String(+v.v2 + 12) : '---'), r: 'RWY', rd: '--' },
        { l: 'VR', ld: v.vr || box(3), lk: 'vr', m: 'SLT RETR', md: 'S=' + (v.v2 ? String(+v.v2 + 32) : '---'), r: 'TO SHIFT', rd: '[M][    ]*', rk: 'na' },
        { l: 'V2', ld: v.v2 || box(3), lk: 'v2', m: 'CLEAN', md: 'O=' + (v.v2 ? String(+v.v2 + 62) : '---'), r: 'FLAPS/THS', rd: v.flaps || '[ ]/[    ]', rk: 'flaps' },
        { l: 'TRANS ALT', ld: v.trans || taDef || '[    ]', lk: 'trans', r: 'FLEX TO TEMP', rd: v.flex ? v.flex + '°' : '[  ]°', rk: 'flex' },
        { l: 'THR RED/ACC', ld: v.thr || (accDef ? accDef + '/' + accDef : '[    ]/[    ]'), lk: 'thr', r: 'ENG OUT ACC', rd: v.ena || accDef || '[    ]', rk: 'ena' },
        { l: '', ld: '', r: 'NEXT', rd: 'PHASE>', rk: 'go:perf-clb' }
      ] }
    };

    var RD = function (id, t) { return { l: '', ld: '', r: '', rd: '' }; };
    var back = function (to) { return { l: '', ld: '<RETURN', lk: 'go:' + (to || 'data'), r: '', rd: '' }; };
    var nav = function (lab, to, side) { var r = { l: '', ld: '', r: '', rd: '' }; if (side === 'R') { r.rd = lab + '>'; r.rk = 'go:' + to; } else { r.ld = '<' + lab; r.lk = 'go:' + to; } return r; };
    var tot = routeDist(S), trip = tot ? Math.round(tot * 5.5 + 600) / 1000 : null, tmin = tot ? Math.round(tot / 7 + 10) : null, pp = S.plan && S.plan.tripKg && S.plan.to === S.v.to && S.plan.from === S.v.from ? S.plan : null; if (pp) { trip = pp.tripKg / 1000; tmin = Math.round(pp.eteMin); }
    var fmt = function (m) { return pad2(Math.floor(m / 60)) + pad2(m % 60); };
    var ready = !!(v.zfw && v.block && trip != null);
    var rsv = trip != null ? Math.round(trip * 50) / 1000 : null;
    var altF = pp ? pp.altnKg / 1000 : (v.altn && v.to && DB[v.altn] && DB[v.to] ? (700 + dist(v.to, v.altn) * 5.2) / 1000 : 0);
    var altT = altF ? Math.round(altF / 2.4 * 60) : 0, finF = pp ? pp.finKg / 1000 : 1.0, taxiF = parseFloat(v.taxi || '0.2');
    var zfwN = v.zfw ? parseFloat(v.zfw.split('/')[0]) : null, blk = v.block ? parseFloat(v.block) : null;
    var extra = ready ? Math.round((blk - taxiF - trip - rsv - altF - finF) * 10) / 10 : null;
    if (extra === 0) extra = 0;
    P.initb = { title: v.block ? 'INIT FUEL PREDICTION' : 'INIT', rows: [
      { l: 'TAXI', ld: taxiF.toFixed(1), lk: 'taxi', r: 'ZFW/ZFWCG', rd: v.zfw || box(4) + '/' + box(4), rk: 'zfw' },
      { l: 'TRIP/TIME', ld: ready ? trip.toFixed(1) + '/' + fmt(tmin) : '---.-/----', r: 'BLOCK', rd: v.block || box(4), rk: 'block' },
      { l: 'RTE RSV/%', ld: ready ? rsv.toFixed(1) + '/5.0' : '---.-/5.0', lc: 'c', r: '', rd: v.block ? '' : 'FUEL PLANNING}', rk: v.block ? null : 'fplan', rc: 'a' },
      { l: 'ALTN/TIME', ld: ready && altF ? altF.toFixed(1) + '/' + fmt(altT) : '---.-/----', lc: 'c', r: 'TOW/LW', rd: ready ? (zfwN + blk - taxiF).toFixed(1) + '/' + (zfwN + blk - taxiF - trip).toFixed(1) : '---.-/---.-' },
      { l: 'FINAL/TIME', ld: ready ? finF.toFixed(1) + '/0030' : '---.-/0030', lc: 'c', r: 'TRIP WIND', rd: 'HD000', rc: 'c' },
      { l: 'MIN DEST FOB', ld: ready ? (altF + finF).toFixed(1) : '---.-', lc: 'c', r: 'EXTRA/TIME', rd: ready ? extra.toFixed(1) + '/' + (extra > 0 ? fmt(Math.round(extra / 2.4 * 60)) : '----') : '---.-/----', rc: extra != null && extra < 0 ? 'a' : 'g' }
    ] };
    P.dir = { title: 'DIR TO', rows: [
      { l: 'WAYPOINT', ld: '[    ]', lk: 'dir', lin: true, r: '', rd: '' },
      RD(), RD(), RD(), RD(), RD()
    ] };
    var pto = v.progto && DB[v.progto] && v.from ? DB[v.progto] : null, pbrg = pto ? window.VpANav.bearing(v.from, v.progto) : null;
    P.prog = { title: 'PREFLIGHT', sub: v.flt || '', rows: [
      { l: 'CRZ', ld: v.crz || '-----', lk: 'crz', m: 'OPT', md: v.crz && v.zfw ? 'FL' + Math.min(390, crzN + 20) : '-----', r: 'REC MAX', rd: v.zfw ? 'FL398' : '-----', rc: 'm' },
      { l: '', ld: '<REPORT', lk: 'na', r: '', rd: '' },
      { l: 'POSITION UPDATE AT', ld: '*[    ]', lk: 'na', lc: 'c', r: '', rd: '' },
      { l: '  BRG /DIST', ld: pto ? ('00' + Math.round(pbrg)).slice(-3) + '°/' + Math.round(dist(v.from, v.progto)) + '.0' : '---°/----.-', r: 'TO', rd: v.progto || '[     ]', rk: 'progto' },
      { l: 'PREDICTIVE', ld: '<GPS', lk: 'na', r: '', rd: 'GPS PRIMARY' },
      { l: 'REQUIRED', ld: '1.0NM', lc: 'c', m: 'ACCUR', md: 'HIGH', r: 'ESTIMATED', rd: '0.05NM' }
    ] };
    P.data = { title: 'DATA INDEX', sub: '1/2', rows: [
      { l: 'POSITION', ld: '<MONITOR', lk: 'go:data-pos', r: 'IRS', rd: 'MONITOR>', rk: 'go:data-irs' },
      { l: 'GPS', ld: '<MONITOR', lk: 'go:data-gps', r: 'A/C', rd: 'STATUS>', rk: 'go:data-ac' },
      { l: 'CLOSEST', ld: '<AIRPORTS', lk: 'go:data-clo', r: 'EQUITIME', rd: 'POINT>', rk: 'go:data-eqt' },
      { l: 'WAYPOINTS', ld: '<STORED', lk: 'na', r: 'NAVAIDS', rd: 'STORED>', rk: 'na' },
      { l: 'ROUTES', ld: '<STORED', lk: 'na', r: 'RUNWAYS', rd: 'STORED>', rk: 'na' },
      { l: '', ld: '', r: '', rd: '' }
    ] };
    P['data-pos'] = { title: 'POSITION MONITOR', rows: [{ l: 'FMGC1', ld: '4829.1N/01147.6E', r: '', rd: '' }, { l: 'GPIRS', ld: '4829.0N/01147.7E', r: '', rd: '' }, { l: 'MIX IRS', ld: '4829.1N/01147.6E', r: '', rd: '' }, { l: 'IRS 1', ld: '4829.1N/01147.7E', r: '', rd: '' }, { l: 'IRS 2', ld: '4829.0N/01147.6E', r: '', rd: '' }, back()] };
    P['data-irs'] = { title: 'IRS MONITOR', rows: [{ l: 'IRS 1', ld: 'NAV', r: 'GS', rd: '0KT' }, { l: 'IRS 2', ld: 'NAV', r: 'GS', rd: '0KT' }, { l: 'IRS 3', ld: 'NAV', r: 'GS', rd: '0KT' }, RD(), RD(), back()] };
    P['data-gps'] = { title: 'GPS MONITOR', rows: [{ l: 'GPS 1', ld: 'NAV', r: 'SAT', rd: '9' }, { l: 'GPS 2', ld: 'NAV', r: 'SAT', rd: '9' }, { l: 'ACCURACY', ld: 'HIGH', r: '', rd: '' }, RD(), RD(), back()] };
    P['data-ac'] = { title: 'A/C STATUS', rows: [{ l: 'ENG', ld: 'LEAP-1A26', r: 'ACTIVE NAV DATA BASE', rd: 'BEISPIEL' }, { l: 'CHG CODE', ld: '[ ]', r: 'VALIDITY', rd: 'ENTWURF' }, { l: 'IDLE/PERF', ld: '+0.0/+0.0', r: '', rd: '' }, { l: 'SECOND NAV DATA BASE', ld: '', r: '', rd: '' }, RD(), back()] };
    var o0 = S.v.from || 'EDDF', airs = Object.keys(window.VpANav.AIRPORTS).filter(function (k) { return k !== o0; }).map(function (k) { return { k: k, d: Math.round(window.VpANav.dist(o0, k)) }; }).sort(function (x, y) { return x.d - y.d; }).slice(0, 3).map(function (x) { return { l: x.k, ld: x.k, r: 'DIST', rd: x.d + 'NM' }; });
    P['data-clo'] = { title: 'CLOSEST AIRPORTS', rows: [airs[0], airs[1], airs[2], RD(), RD(), back()] };
    P['data-eqt'] = { title: 'EQUI-TIME POINT', rows: [{ l: 'ETP', ld: '[ ]', r: 'TO', rd: '[ ]' }, { l: 'FROM', ld: S.v.from || '----', r: '', rd: '' }, RD(), RD(), RD(), back()] };
    P.rad = { title: 'RADIO NAV', rows: [
      { l: 'VOR1/FREQ', ld: v.vor1 || '[ ]/[   ]', lk: 'vor1', lin: !v.vor1, r: 'FREQ/VOR2', rd: v.vor2 || '[   ]/[ ]', rk: 'vor2', rin: !v.vor2 },
      { l: 'CRS', ld: v.crs1 || '[ ]', lk: 'crs1', lin: !v.crs1, r: 'CRS', rd: v.crs2 || '[ ]', rk: 'crs2', rin: !v.crs2 },
      { l: 'ILS /FREQ', ld: v.ils || '[   ]', lk: 'ils', lin: !v.ils, r: '', rd: '' },
      { l: 'CRS', ld: v.ilscrs || '[ ]', lk: 'ilscrs', lin: !v.ilscrs, r: '', rd: '' },
      { l: 'ADF1/FREQ', ld: v.adf1 || '[   ]', lk: 'adf1', lin: !v.adf1, r: 'FREQ/ADF2', rd: v.adf2 || '[   ]', rk: 'adf2', rin: !v.adf2 },
      { l: '', ld: '', r: '', rd: '' }
    ] };
    P.fuel = { title: 'FUEL PRED', rows: [
      { l: 'AT', ld: v.to || '----', lc: 'g', m: 'TIME', md: '----', r: 'EFOB', rd: '---.-' },
      { l: '', ld: v.altn || '----', lc: 'g', m: '', md: '----', r: '', rd: '---.-' },
      { l: 'RTE RSV/%', ld: '---.-/---', r: 'ZFW/ZFWCG', rd: v.zfw || '---.-/--.-', rk: 'zfw' },
      { l: 'ALTN/TIME', ld: '---.-/----', r: 'FOB', rd: '---.-' },
      { l: 'FINAL/TIME', ld: '---.-/----', r: 'GW/CG', rd: '---.-/--.-' },
      { l: 'MIN DEST FOB', ld: '---.-', r: 'EXTRA/TIME', rd: '---.-/----' }
    ] };
    P.sec = { title: 'SEC F-PLN', rows: [
      { l: '', ld: '<COPY ACTIVE', lk: 'copy', r: '', rd: '' },
      { l: '', ld: '<INIT', lk: 'go:initb', r: '', rd: '' },
      { l: 'SEC ROUTE', ld: S.sec && S.sec.length ? S.sec.length + ' WPT' : 'EMPTY', r: '', rd: '' },
      { l: '', ld: '', r: '', rd: '' },
      { l: '', ld: '<DELETE SEC', lk: 'secdel', r: '', rd: 'ACTIVATE SEC>', rk: 'secact' },
      { l: '', ld: '', r: '', rd: '' }
    ] };
    P.atc = { title: 'ATC COMM', rows: [{ l: '', ld: '<MSG RECORD', lk: 'na', r: '', rd: 'REPORTS>', rk: 'na' }, { l: '', ld: '<DEPART REQ', lk: 'na', r: '', rd: 'ATIS>', rk: 'na' }, RD(), RD(), RD(), { l: '', ld: '', r: '', rd: 'DATALINK NICHT VERFÜGBAR' }] };
    P.menu = { title: 'MCDU MENU', rows: [{ l: '', ld: '<FMGC', lk: 'go:init', r: '', rd: '' }, { l: '', ld: '<ATSU', lk: 'na', r: '', rd: '' }, { l: '', ld: '<AIDS', lk: 'na', r: '', rd: '' }, { l: '', ld: '<CFDS', lk: 'na', r: '', rd: '' }, RD(), RD()] };
    P.apt = P['data-clo'];
    var ph = ['perf', 'perf-clb', 'perf-crz', 'perf-des', 'perf-appr', 'perf-ga'], nm = ['TAKE OFF', 'CLB', 'CRZ', 'DES', 'APPR', 'GO AROUND'];
    function phase(i, rows) { var a = rows.slice(); while (a.length < 5) a.push({ l: '', ld: '', r: '', rd: '' }); a.push({ l: i > 1 ? 'PREV' : '', ld: i > 1 ? '<PHASE' : '', lk: i > 1 ? 'go:' + ph[i - 1] : null, r: i < 5 ? 'NEXT' : '', rd: i < 5 ? 'PHASE>' : '', rk: i < 5 ? 'go:' + ph[i + 1] : null }); return { title: nm[i], rows: a }; }
    var efob = ready ? (blk - taxiF - trip).toFixed(1) : '---.-', tdes = ready ? fmt(tmin) : '----';
    P['perf-clb'] = phase(1, [
      { l: 'ACT MODE', ld: 'MANAGED', r: '', rd: '' },
      { l: 'CI', ld: v.ci || '---', lk: 'ci', r: 'PRED TO', rd: v.crz || 'FL---', rc: 'c' },
      { l: 'MANAGED', ld: crzN > 280 ? '290/.78' : '290', lc: 'g', r: '', rd: '' },
      { l: 'PRESEL', ld: v.clbspd || '*[ ]', lk: 'clbspd', r: '', rd: '' }]);
    P['perf-crz'] = phase(2, [
      { l: 'ACT MODE', ld: 'MANAGED', m: 'TIME', md: tdes, r: 'DEST EFOB', rd: efob },
      { l: 'CI', ld: v.ci || '---', lk: 'ci', r: '', rd: '' },
      { l: 'MANAGED', ld: crzN > 280 ? '.78' : '300', lc: 'g', r: '', rd: '' },
      { l: 'PRESEL', ld: '*[ ]', lk: 'na', r: 'DES CABIN RATE', rd: '-350FT/MN', rc: 'c' },
      { l: '', ld: '', r: '', rd: 'STEP ALTS>', rk: 'na' }]);
    P['perf-des'] = phase(3, [
      { l: 'ACT MODE', ld: 'MANAGED', m: 'TIME', md: tdes, r: 'DEST EFOB', rd: efob },
      { l: 'CI', ld: v.ci || '---', lk: 'ci', r: 'PRED TO', rd: 'FL100', rc: 'c' },
      { l: 'MANAGED', ld: v.desspd || (crzN > 280 ? '.78/300' : '300'), lk: 'desspd', r: '', rd: '' }]);
    var vls = v.ldgconf === 'CONF3' ? 133 : 130, hw = v.awind ? +v.awind.split('/')[1] : 0;
    var vapp = v.vapp || String(vls + Math.max(5, Math.min(15, Math.round(hw / 3))));
    P['perf-appr'] = phase(4, [
      { l: 'QNH', ld: v.qnh || box(4), lk: 'qnh', m: 'FINAL', md: 'ILS', r: '', rd: '' },
      { l: 'TEMP', ld: v.atemp ? v.atemp + '°' : box(3) + '°', lk: 'atemp', m: '', md: 'O=' + (vls + 72), r: 'BARO', rd: v.baro || '[    ]', rk: 'baro' },
      { l: 'MAG WIND', ld: v.awind || '[ ]°/[ ]', lk: 'awind', m: '', md: 'S=' + (vls + 42), r: 'RADIO', rd: v.radio || '[    ]', rk: 'radio' },
      { l: 'TRANS ALT', ld: v.trans || TA[v.to] || '5000', lk: 'trans', m: '', md: 'F=' + (vls + 12), r: 'LDG CONF', rd: v.ldgconf === 'CONF3' ? 'CONF3' : 'CONF3*', rk: 'ldg3', rc: v.ldgconf === 'CONF3' ? 'c' : 'w' },
      { l: 'VAPP', ld: vapp, lk: 'vapp', m: 'VLS', md: String(vls), r: '', rd: v.ldgconf === 'CONF3' ? 'FULL*' : 'FULL', rk: 'ldgfull', rc: v.ldgconf === 'CONF3' ? 'w' : 'c' }]);
    P['perf-ga'] = phase(5, [{ l: '', ld: '', r: '', rd: '' }, { l: '', ld: '', r: '', rd: '' }, { l: '', ld: '', r: '', rd: '' }, { l: '', ld: '', r: '', rd: '' },
      { l: 'THR RED/ACC', ld: v.thrga || (accDefA ? accDefA + '/' + accDefA : '[    ]/[    ]'), lk: 'thrga', r: 'ENG OUT ACC', rd: v.enaga || accDefA || '[    ]', rk: 'enaga' }]);
    /* F-PLN: fünf Zeilen Liste, sechste Zeile ERASE/INSERT bei vorläufigem Plan */
    var en = fplnEntries(S), rows = [], i;
    var prevId = null;
    en.forEach(function (x, k) { x.prev = k > 0 ? en[k - 1].id : null; });
    for (i = 0; i < 5; i++) {
      var x = en[S.scroll + i];
      if (!x) { rows.push({ l: '', ld: '', r: '', rd: '' }); continue; }
      var d = x.prev && x.k !== 'new' && x.prev !== '-----' ? dist(x.prev === '-----' ? null : x.prev, x.id) : null;
      if (x.k === 'dest') { var last = en[S.scroll + i - 1]; var lid = last && last.k === 'new' ? en[S.scroll + i - 2] : last; d = lid ? dist(lid.id, x.id) : null; }
      rows.push({ l: x.k === 'from' ? 'FROM' : x.k === 'dest' ? 'DEST' : x.k === 'new' ? '' : 'DCT', ld: x.id, lk: 'fp' + i, lin: x.k === 'new', fe: x, r: d != null ? 'DIST' : '', rd: d != null ? d + 'NM' : '' });
    }
    rows.push(S.tmp ? { l: '', ld: '<ERASE', lk: 'erase', lamb: true, r: '', rd: 'INSERT*', rk: 'insert', ramb: true } : { l: '', ld: '', r: '', rd: '' });
    P.fpln = { title: S.tmp ? 'TMPY' : 'F-PLN', tmp: !!S.tmp, rows: rows };
    return P;
  }

  function mount(root, opt) {
    opt = opt || {};
    var S = { page: opt.page || 'init', sp: '', msg: '', v: {}, expl: null, route: [], tmp: null, sec: [], scroll: 0, plan: null };
    root.classList.add('mcdu');
    var top = el('div', 'mc-top', '<span class="mc-ann"><b class="fail">FAIL</b><b class="fm">FM</b></span><span class="mc-name">MCDU</span><span class="mc-ann"><b class="ind">IND</b><b class="rdy">RDY</b></span>');
    var wrap = el('div', 'mc-wrap');
    var screen = el('div', 'mc-screen'); screen.style.gridColumn = '2'; screen.style.gridRow = '1 / span 14';
    wrap.appendChild(screen);
    var lsk = {};
    for (var i = 1; i <= 6; i++) {
      ['L', 'R'].forEach(function (side) {
        var b = el('button', 'mc-lsk ' + (side === 'L' ? 'lft' : 'rgt'), '<span></span>'); b.type = 'button';
        b.style.gridColumn = side === 'L' ? '1' : '3'; b.style.gridRow = (2 * i) + ' / span 2';
        b.setAttribute('aria-label', 'Taste ' + side + i); b.dataset.s = side; b.dataset.n = i;
        wrap.appendChild(b); lsk[side + i] = b;
      });
    }
    var keys = el('div', 'mc-keys');
    var pk = el('div', 'mc-pk');
    var PL = { 'RAD NAV': 'RAD<br>NAV', 'FUEL PRED': 'FUEL<br>PRED', 'SEC F-PLN': 'SEC<br>F-PLN', 'ATC COMM': 'ATC<br>COMM', 'MCDU MENU': 'MCDU<br>MENU' };
    var PM = {}; KEYS_PAGE.forEach(function (k) { PM[k[0]] = k[1]; });
    var AR = { '←': 'l', '→': 'r', '↑': 'up', '↓': 'dn' };
    [['DIR', 'PROG', 'PERF', 'INIT', 'DATA', null], ['F-PLN', 'RAD NAV', 'FUEL PRED', 'SEC F-PLN', 'ATC COMM', 'MCDU MENU'], ['AIRPORT', null, null, null, '←', '↑'], [null, null, null, null, '→', '↓']].forEach(function (row) {
      row.forEach(function (k) {
        if (!k) { pk.appendChild(el('span', 'mk-gap')); return; }
        var b = el('button', 'mk pg' + (AR[k] ? ' ar' : ''), PL[k] || k); b.type = 'button';
        if (AR[k]) b.dataset.ar = AR[k]; else b.dataset.pg = PM[k];
        pk.appendChild(b);
      });
    });
    var alpha = el('div', 'mc-alpha'); LETTERS.forEach(function (c) { var b = el('button', 'mk', c); b.type = 'button'; b.dataset.ch = c; alpha.appendChild(b); });
    ['SP', 'OVFY', '/', 'CLR'].forEach(function (c) { var b = el('button', 'mk' + (c === 'CLR' ? ' clr' : ''), c); b.type = 'button'; b.dataset.ch = c; alpha.appendChild(b); });
    var num = el('div', 'mc-num'); ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '+/-'].forEach(function (c) { var b = el('button', 'mk n', c); b.type = 'button'; b.dataset.ch = c; num.appendChild(b); });
    var kb = el('div', 'mc-kb'); kb.appendChild(num); kb.appendChild(alpha);
    keys.appendChild(pk); keys.appendChild(kb);
    root.appendChild(top); root.appendChild(wrap); root.appendChild(keys);
    root.tabIndex = 0;

    /* Farbe einer Anzeige: Pflichtkästchen orange, Sprünge (<X, X>) weiß, änderbare Felder blau, berechnete grün */
    function cell(t, col, key) {
      t = t || '';
      if (!col) col = t.indexOf('□') >= 0 ? 'a' : /^</.test(t) || />$/.test(t) ? 'w' : key && key !== 'na' ? 'c' : key === 'na' ? 'w' : 'g';
      return '<span class="k' + col + '">' + esc(t) + '</span>';
    }
    function render() {
      var P = pages(S), pg = P[S.page], h = '';
      if (!pg) {
        h += '<div class="ln ti">' + esc(S.page.toUpperCase()) + '</div><div class="ln"></div><div class="ln da cen"><span>IM ENTWURF NICHT NACHGEBILDET</span></div>';
        for (var k = 0; k < 10; k++) h += '<div class="ln"></div>';
      } else {
        h += '<div class="ln ti' + (pg.tmp ? ' amb' : '') + '">' + esc(pg.title) + (pg.sub ? '<small>' + esc(pg.sub) + '</small>' : '') + '</div>';
        pg.rows.forEach(function (r) {
          h += '<div class="ln lb"><span>' + esc(r.l) + '</span><span>' + esc(r.m || '') + '</span><span>' + esc(r.r) + '</span></div>';
          h += '<div class="ln da">' + cell(r.ld, r.lc || (r.lamb ? 'a' : r.lin ? 'c' : ''), r.lk) + cell(r.md || '', r.mc || 'g') + cell(r.rd, r.rc || (r.ramb ? 'a' : r.rin ? 'c' : ''), r.rk) + '</div>';
        });
      }
      var sp = S.msg ? '<span class="msg">' + esc(S.msg) + '</span>' : '<span class="sp">' + esc(S.sp) + '</span><span class="cur"></span>';
      h += '<div class="ln scr">' + sp + '</div>';
      screen.innerHTML = h;
      var rows = pg ? pg.rows : [];
      for (var i = 1; i <= 6; i++) {
        var r = rows[i - 1] || {};
        lsk['L' + i].classList.toggle('act', !!r.lk); lsk['R' + i].classList.toggle('act', !!r.rk);
        lsk['L' + i].dataset.f = r.lk ? (r.fe ? r.fe.k : r.lk) : ''; lsk['R' + i].dataset.f = r.rk || '';
      }
      /* kein Hervorheben der aktiven Seitentaste: das Original hat das nicht */
      false && pk.querySelectorAll('.mk').forEach(function (b) { var pg2 = S.page === 'initb' ? 'init' : S.page.indexOf('perf') === 0 ? 'perf' : S.page.indexOf('data') === 0 ? 'data' : S.page === 'apt' ? 'apt' : S.page; b.classList.toggle('on', b.dataset.pg === pg2); });
      if (opt.onChange) opt.onChange(S);
      showExpl();
    }
    function showExpl() {
      if (!opt.explainEl) return;
      var e = S.expl && (EXPL[S.expl] || (S.expl.indexOf('go:') === 0 ? EXPL.go : null));
      opt.explainEl.innerHTML = e ? '<div class="eyebrow">ERKLÄRUNG</div><h3 style="font-family:var(--display);font-weight:300;font-size:22px;margin:6px 0">' + esc(e[0]) + '</h3><p style="margin:0">' + esc(e[1]) + '</p>' : '<div class="eyebrow">ERKLÄRUNG</div><p class="small" style="margin:6px 0 0">Tippe auf eine Taste neben einem Feld. Hier steht dann, wofür das Feld da ist.</p>';
    }
    function press(ch) {
      if (S.msg && ch !== 'CLR') S.msg = '';
      if (ch === 'CLR') { if (S.msg) S.msg = ''; else if (S.sp === 'CLR') S.sp = ''; else if (S.sp) S.sp = S.sp.slice(0, -1); else S.sp = 'CLR'; }
      else if (ch === 'SP') S.sp += ' ';
      else if (ch === '+/-') S.sp += '-';
      else if (ch === 'OVFY') { }
      else { if (S.sp === 'CLR') S.sp = ''; if (S.sp.length < 22) S.sp += ch; }
      render();
    }
    function loadPlan() {
      var p = S.plan;
      if (!p) { S.msg = 'KEIN PLAN GELADEN'; render(); return; }
      S.v.from = p.from; S.v.to = p.to; S.v.flt = p.flt; S.v.ci = p.ci; S.v.crz = p.crz; if (p.altn) S.v.altn = p.altn;
      S.tmp = p.route.slice(); S.scroll = 0; S.msg = 'PLAN GELADEN · F-PLN: INSERT'; S.expl = 'req'; render();
    }
    function fpSel(i) {
      var P = pages(S), r = P.fpln.rows[i]; if (!r || !r.fe) return;
      var e = r.fe, list = (S.tmp || S.route).slice();
      S.expl = e.k;
      if (S.sp === 'CLR') {
        if (e.k !== 'wp') { S.msg = 'NOT ALLOWED'; S.sp = ''; render(); return; }
        list.splice(e.idx, 1); S.tmp = list; S.sp = ''; render(); return;
      }
      if (!S.sp) { render(); return; }
      var id = S.sp.trim();
      if (!DB[id]) { S.msg = 'NOT IN DATABASE'; S.sp = ''; render(); return; }
      if (e.k === 'from') { S.msg = 'NOT ALLOWED'; S.sp = ''; render(); return; }
      if (e.k === 'wp') list.splice(e.idx, 0, id); else list.push(id);
      S.tmp = list; S.sp = ''; render();
    }
    function sk(side, n) {
      var P = pages(S), pg = P[S.page]; if (!pg) return;
      var r = pg.rows[n - 1] || {}, f = side === 'L' ? r.lk : r.rk;
      if (!f) return;
      if (S.page === 'fpln') {
        if (f === 'erase') { S.tmp = null; S.expl = 'erase'; S.msg = ''; render(); return; }
        if (f === 'insert') { S.route = S.tmp.slice(); S.tmp = null; S.expl = 'insert'; S.msg = ''; render(); return; }
        fpSel(n - 1); return;
      }
      S.expl = f;
      if (f.indexOf('go:') === 0) { S.page = f.slice(3); S.scroll = 0; S.msg = ''; S.sp = ''; render(); return; }
      if (f === 'na') { S.msg = 'NICHT NACHGEBILDET'; render(); return; }
      if (f === 'copy') { S.sec = (S.tmp || S.route).slice(); S.msg = 'SEC KOPIERT'; render(); return; }
      if (f === 'secdel') { S.sec = []; S.msg = ''; render(); return; }
      if (f === 'secact') { var old = S.route; S.route = (S.sec || []).slice(); S.sec = old.slice(); S.msg = 'SEC AKTIVIERT'; render(); return; }
      if (f === 'optfl' || f === 'recmax' || f === 'prog_to' || f === 'efob') { render(); return; }
      if (f === 'req') { loadPlan(); return; }
      if (f === 'ldg3') { S.v.ldgconf = 'CONF3'; S.msg = ''; render(); return; }
      if (f === 'ldgfull') { S.v.ldgconf = 'FULL'; S.msg = ''; render(); return; }
      if (f === 'zfw' && !S.sp) { var pz = S.plan; if (!pz || pz.zfwT == null) { S.msg = 'KEIN PLAN GELADEN'; render(); return; } S.sp = pz.zfwT + '/' + pz.zfwCg; S.msg = ''; render(); return; }
      if (f === 'fplan') { if (!S.v.zfw) { S.msg = 'INITIALIZE WEIGHT/CG'; render(); return; } var tr = routeDist(S); if (!tr) { S.msg = 'NO F-PLN'; render(); return; }
        var pq = S.plan && S.plan.to === S.v.to && S.plan.from === S.v.from ? S.plan : null, t = pq ? pq.tripKg / 1000 : Math.round(tr * 5.5 + 600) / 1000;
        var al = pq ? pq.altnKg / 1000 : (S.v.altn && DB[S.v.altn] ? (700 + dist(S.v.to, S.v.altn) * 5.2) / 1000 : 0), fi = pq ? pq.finKg / 1000 : 1.0;
        S.v.block = (Math.ceil((parseFloat(S.v.taxi || '0.2') + t + Math.round(t * 50) / 1000 + al + fi) * 10) / 10).toFixed(1); S.msg = ''; render(); return; }
      if (f === 'req2') { var pl = S.plan; if (!pl || pl.blockT == null) { S.msg = 'KEIN PLAN GELADEN'; render(); return; } S.v.zfw = pl.zfwCg + '/' + pl.zfwT; S.v.block = pl.blockT; S.v.taxi = pl.taxiT; S.msg = 'FUEL/W&B GELADEN'; render(); return; }
      if (S.sp === 'CLR') {
        if (['thr', 'trans', 'vapp', 'desspd', 'tropo', 'baro', 'radio', 'clbspd', 'thrga', 'enaga', 'taxi', 'altn', 'progto', 'ena'].indexOf(f) >= 0) { delete S.v[f]; S.sp = ''; S.msg = ''; }
        else { S.msg = 'NOT ALLOWED'; S.sp = ''; }
        render(); return;
      }
      if (!S.sp) { render(); return; }
      var val = validate(f, S.sp);
      if (val == null) { S.msg = 'FORMAT ERROR'; render(); return; }
      if (f === 'dir') { var cur = (S.tmp || S.route).slice(), ix = cur.indexOf(val); if (ix < 0) { S.msg = 'NOT IN FLIGHT PLAN'; render(); return; } S.tmp = cur.slice(ix); S.sp = ''; S.page = 'fpln'; S.msg = 'DIR TO · INSERT?'; render(); return; }
      if (f === 'route' && (!DB[val.from] || !DB[val.to] || !DB[val.from].apt || !DB[val.to].apt)) { S.msg = 'NOT IN DATABASE'; render(); return; }
      if (f === 'altn' && !(DB[val] && DB[val].apt)) { S.msg = 'NOT IN DATABASE'; render(); return; }
      if (f === 'route') { S.v.from = val.from; S.v.to = val.to; } else S.v[f] = val;
      S.sp = ''; S.msg = ''; render();
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
      if (b.classList.contains('mc-lsk')) { sk(b.dataset.s, +b.dataset.n); return; }
      if (b.dataset.pg) { S.page = b.dataset.pg; S.msg = ''; S.scroll = 0; render(); return; }
      if (b.dataset.ar && (S.page === 'init' || S.page === 'initb') && (b.dataset.ar === 'l' || b.dataset.ar === 'r')) { S.page = S.page === 'init' ? 'initb' : 'init'; S.msg = ''; render(); return; }
      if (b.dataset.ar) { if (S.page === 'fpln') { var max = Math.max(0, fplnEntries(S).length - 5); S.scroll = Math.max(0, Math.min(max, S.scroll + (b.dataset.ar === 'dn' ? 1 : b.dataset.ar === 'up' ? -1 : 0))); render(); } return; }
      if (b.dataset.ch) press(b.dataset.ch);
    });
    root.addEventListener('mouseover', function (e) {
      var b = e.target.closest('.mc-lsk'); if (!b || !b.dataset.f) return;
      var f = b.dataset.f; S.expl = f.indexOf('fp') === 0 ? 'wp' : f; showExpl();
    });
    root.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (k === 'Backspace') { e.preventDefault(); press('CLR'); }
      else if (k === ' ') { e.preventDefault(); press('SP'); }
      else if (/^[a-zA-Z0-9\/.]$/.test(k)) { e.preventDefault(); press(k.toUpperCase()); }
      else if (k === '-') { e.preventDefault(); press('+/-'); }
    });
    render();
    return {
      state: S, render: render,
      reset: function () { S.page = opt.page || 'init'; S.sp = ''; S.msg = ''; S.v = {}; S.expl = null; S.route = []; S.tmp = null; S.scroll = 0; render(); },
      setPlan: function (p) { S.plan = p; render(); },
      type: function (str) { str.split('').forEach(function (c) { press(c === ' ' ? 'SP' : c); }); },
      go: function (p) { S.page = p; S.scroll = 0; render(); }
    };
  }

  /* Navigation Display (Planansicht, schematisch) */
  function nd(root, opt) {
    opt = opt || {};
    var NS = 'http://www.w3.org/2000/svg';
    var box = el('div', 'nd'); root.appendChild(box);
    var PRJ = null;
    function setPrj(ids) {
      var pl = ids.filter(function (i) { return DB[i]; }); if (!pl.length) { PRJ = null; return; }
      var la = pl.map(function (i) { return DB[i].lat; }), lo = pl.map(function (i) { return DB[i].lon; });
      var la0 = Math.min.apply(null, la), la1 = Math.max.apply(null, la), lo0 = Math.min.apply(null, lo), lo1 = Math.max.apply(null, lo), lc = (la0 + la1) / 2, c = Math.cos(lc * Math.PI / 180);
      var w = Math.max((lo1 - lo0) * 60 * c, 30), h = Math.max((la1 - la0) * 60, 30);
      PRJ = { lc: lc, c: c, lo: (lo0 + lo1) / 2, s: 320 / Math.max(w, h) };
    }
    function xy(id) { var d = DB[id]; return [200 + (d.lon - PRJ.lo) * 60 * PRJ.c * PRJ.s, 200 - (d.lat - PRJ.lc) * 60 * PRJ.s]; }
    function pts(ids) { return ids.filter(function (i) { return DB[i] && PRJ; }).map(function (i) { var q = xy(i); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }); }
    function update(S) {
      var plan = opt.getPlan ? opt.getPlan() : null, h = '';
      var allIds = (plan ? [plan.from].concat(plan.route, [plan.to]) : []).concat(S.v.from ? [S.v.from] : [], S.route, S.tmp || [], S.v.to ? [S.v.to] : []); setPrj(allIds);
      h += '<svg viewBox="0 0 400 400" role="img" aria-label="Navigationsanzeige, schematisch">';
      h += '<rect width="400" height="400" fill="#02070a"/>';
      for (var r = 1; r <= 3; r++) h += '<circle cx="200" cy="200" r="' + r * 62 + '" fill="none" stroke="#12303a" stroke-dasharray="3 5"/>';
      h += '<text x="14" y="26" fill="#cfe3ec" font-size="13">PLAN</text><text x="354" y="26" fill="#cfe3ec" font-size="13">N ↑</text>';
      var full = function (S2) { var ids = []; if (S2.v.from) ids.push(S2.v.from); (S2.tmp || S2.route).forEach(function (i) { ids.push(i); }); if (S2.v.to) ids.push(S2.v.to); return ids; };
      if (plan) {
        var po = [plan.from].concat(plan.route, [plan.to]);
        h += '<polyline points="' + pts(po).join(' ') + '" fill="none" stroke="#5b6c78" stroke-width="2" stroke-dasharray="4 6"/>';
      }
      var act = full({ v: S.v, route: S.route, tmp: null });
      if (S.v.from && S.v.to && act.length > 1) h += '<polyline points="' + pts(act).join(' ') + '" fill="none" stroke="#4ce38a" stroke-width="3"/>';
      if (S.tmp && S.v.from && S.v.to) h += '<polyline points="' + pts(full(S)).join(' ') + '" fill="none" stroke="#ffb347" stroke-width="3" stroke-dasharray="8 5"/>';
      var shown = {};
      (plan ? [plan.from].concat(plan.route, [plan.to]) : []).forEach(function (i) { shown[i] = 'p'; });
      full(S).forEach(function (i) { shown[i] = 'a'; });
      full({ v: S.v, route: S.route, tmp: null }).forEach(function (i) { shown[i] = 'a'; });
      Object.keys(shown).forEach(function (i) {
        var d = DB[i]; if (!d || !PRJ) return; var on = shown[i] === 'a', q = xy(i), cx = q[0], cy = q[1];
        h += d.apt ? '<rect x="' + (cx - 6) + '" y="' + (cy - 6) + '" width="12" height="12" fill="none" stroke="' + (on ? '#f2f6fa' : '#5b6c78') + '" stroke-width="2"/>' : '<path d="M' + cx + ' ' + (cy - 7) + ' L' + (cx + 6) + ' ' + cy + ' L' + cx + ' ' + (cy + 7) + ' L' + (cx - 6) + ' ' + cy + 'Z" fill="none" stroke="' + (on ? '#f2f6fa' : '#5b6c78') + '" stroke-width="1.5"/>';
        h += '<text x="' + (cx + 10) + '" y="' + (cy + 4) + '" fill="' + (on ? '#f2f6fa' : '#7b8c98') + '" font-size="11">' + i + '</text>';
      });
      if (!S.v.from || !S.v.to) h += '<text x="200" y="210" text-anchor="middle" fill="#7b8c98" font-size="13">Noch kein Flugplan eingegeben</text>';
      h += '<text x="14" y="388" fill="#7b8c98" font-size="11">grau gestrichelt: Plan · grün: gültig · gelb: vorläufig</text></svg>';
      box.innerHTML = h;
    }
    return { update: update };
  }

  window.VpAMcdu = { mount: mount, nd: nd, EXPL: EXPL, DB: DB, dist: dist };
})();
