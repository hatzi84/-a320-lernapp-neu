/* Flugplaner (wie SimBrief, vereinfacht): Rechnung, Speicher. Alle Werte sind ein vereinfachtes Modell zum Üben. */
window.VpAPlan = (function () {
  var N = window.VpANav, KEY = 'vpa.plans', ACT = 'vpa.active';
  var AC = { name: 'A320-251N', oew: 42500, mzfw: 64300, mtow: 79000, mlw: 67400, fuelMax: 18700, paxKg: 84 };

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function hm(min) { min = Math.round(min); return pad2(Math.floor(min / 60)) + ':' + pad2(min % 60); }
  function maxFl(dist) { return dist < 120 ? 120 : dist < 200 ? 180 : dist < 300 ? 240 : dist < 420 ? 300 : dist < 600 ? 340 : 390; }
  function tas(fl) { return Math.min(455, 290 + fl * 0.471); }

  /* in: from, to, altn, flt, ci, crz (Zahl, Flugfläche), route (Liste), pax, cargo, taxi, contPct, finalMin, extra, std ('HH:MM') */
  function calc(i) {
    var warn = [], ids = [i.from].concat(i.route, [i.to]), legs = [], total = 0;
    for (var k = 1; k < ids.length; k++) { var d = N.dist(ids[k - 1], ids[k]); if (d == null) return { error: 'Unbekannter Punkt: ' + (N.DB[ids[k - 1]] ? ids[k] : ids[k - 1]) }; legs.push(d); total += d; }
    total += 12; /* Zuschlag für Abflug- und Anflugverfahren */
    var mx = maxFl(total), fl = Math.min(i.crz || mx, mx);
    if ((i.crz || 0) > mx) warn.push('Reiseflughöhe FL' + i.crz + ' ist für ' + Math.round(total) + ' NM zu hoch. Der Plan nutzt FL' + fl + '.');
    var fk = fl / 10, cd = fk * 3.6, dd = fk * 3.1, ct = fk * 0.62, dt = fk * 0.5, cruise = Math.max(0, total - cd - dd), gs = tas(fl);
    var cft = cruise / gs * 60;
    var payload = (i.pax || 0) * AC.paxKg + (i.cargo || 0), zfw = AC.oew + payload;
    var climbF = fk * 40, descF = fk * 9 + 100;
    var gw = zfw + 5000, ff = 2450 * Math.pow(gw / 65000, 0.9) * (1 + (50 - (i.ci || 30)) * -0.0008);
    var cruiseF = cft / 60 * ff, trip = climbF + cruiseF + descF;
    var cont = Math.max(trip * (i.contPct == null ? 5 : i.contPct) / 100, 150);
    var da = i.altn ? N.dist(i.to, i.altn) : 0, altn = i.altn ? 700 + da * 5.2 : 0;
    var fin = (i.finalMin == null ? 30 : i.finalMin) / 60 * 2000, taxi = i.taxi == null ? 200 : i.taxi, extra = i.extra || 0;
    var block = Math.round(taxi + trip + cont + altn + fin + extra), tow = zfw + block - taxi, lw = tow - trip;
    if (payload < 0) warn.push('Negative Zuladung.');
    if (zfw > AC.mzfw) warn.push('ZFW über dem Maximum (' + AC.mzfw + ' kg).');
    if (tow > AC.mtow) warn.push('Startgewicht über dem Maximum (' + AC.mtow + ' kg).');
    if (lw > AC.mlw) warn.push('Landegewicht über dem Maximum (' + AC.mlw + ' kg).');
    if (block > AC.fuelMax) warn.push('Block über der Tankkapazität (' + AC.fuelMax + ' kg).');
    if (!i.altn) warn.push('Kein Ausweichflughafen: Der Plan enthält keinen Alternate-Kraftstoff.');
    /* Navlog */
    var eteMin = ct + cft + dt + 8, nav = [], along = 6, st = (i.std || '10:00').split(':'), t0 = (+st[0]) * 60 + (+st[1]) + 12;
    function atDist(d) { var t, f; if (d <= cd) { var q = d / cd; t = ct * q; f = climbF * q; } else if (d <= total - dd) { t = ct + (d - cd) / gs * 60; f = climbF + (d - cd) / gs * 60 / 60 * ff; } else { var q2 = (d - (total - dd)) / dd; t = ct + cft + dt * q2; f = climbF + cruiseF + descF * q2; } return { t: t, f: f }; }
    nav.push({ id: i.from, d: 0, cum: 0, fl: 0, t: 0, fuel: trip });
    var acc = 6;
    ids.forEach(function (id, k) {
      if (!k) return; acc += legs[k - 1]; var d = k === ids.length - 1 ? total : acc, a = atDist(d);
      nav.push({ id: id, d: Math.round(legs[k - 1]), cum: Math.round(d), fl: d <= cd ? Math.round(fl * d / cd) : d >= total - dd ? Math.round(fl * (total - d) / dd) : fl, t: a.t, fuel: Math.max(0, trip - a.f) });
    });
    var rows = nav.slice();
    function ins(label, d) { var a = atDist(d), at = rows.findIndex(function (r) { return r.cum > d; }); rows.splice(at < 0 ? rows.length - 1 : at, 0, { id: label, d: 0, cum: Math.round(d), fl: fl, t: a.t, fuel: Math.max(0, trip - a.f), mark: 1 }); }
    if (cruise > 10) { ins('TOC', cd); ins('TOD', total - dd); }
    rows.forEach(function (r) { r.eta = hm(t0 + r.t); r.ete = hm(r.t); });
    var routeStr = [i.from].concat(i.route.length ? i.route.map(function (r) { return 'DCT ' + r; }) : [], ['DCT ' + i.to]).join(' ').replace(i.from + ' DCT', i.from + ' DCT');
    return {
      ok: 1, from: i.from, to: i.to, altn: i.altn || '', flt: (i.flt || '').toUpperCase(), ci: String(i.ci == null ? 30 : i.ci), crz: 'FL' + fl, crzNum: fl, route: i.route.slice(), routeStr: routeStr,
      dist: Math.round(total), ete: hm(eteMin), eteMin: eteMin, std: (i.std || '10:00'), sta: hm(t0 + eteMin - 12 + 0), time: hm(eteMin), fuel: (trip / 1000).toFixed(1).replace('.', ',') + ' t',
      zfw: (zfw / 1000).toFixed(1).replace('.', ',') + ' t', pax: i.pax || 0, cargo: i.cargo || 0, payload: payload, name: i.from + ' → ' + i.to + ' · ' + ((i.flt || '').toUpperCase() || '—'),
      tripKg: Math.round(trip), contKg: Math.round(cont), altnKg: Math.round(altn), finKg: Math.round(fin), taxiKg: Math.round(taxi), extraKg: extra, blockKg: block,
      blockT: (block / 1000).toFixed(1), taxiT: (taxi / 1000).toFixed(1), zfwT: (zfw / 1000).toFixed(1), zfwCg: '28.0',
      zfwKg: Math.round(zfw), towKg: Math.round(tow), lwKg: Math.round(lw), oew: AC.oew, navlog: rows, warn: warn, ac: AC.name, climbDist: Math.round(cd), descDist: Math.round(dd)
    };
  }

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { } }
  function add(plan) { var l = load(); plan.id = 'u' + Date.now(); plan.saved = true; l.unshift(plan); save(l.slice(0, 20)); setActive(plan.id); return plan; }
  function remove(id) { save(load().filter(function (p) { return p.id !== id; })); if (active() === id) setActive(''); }
  function setActive(id) { try { localStorage.setItem(ACT, id); } catch (e) { } }
  function active() { try { return localStorage.getItem(ACT) || ''; } catch (e) { return ''; } }
  function activePlan() { var a = active(); return a ? load().filter(function (p) { return p.id === a; })[0] || null : null; }
  function example(from, to, altn, flt, pax) { var r = N.routeFor(from, to); var p = calc({ from: from, to: to, altn: altn, flt: flt, ci: 30, crz: 350, route: r, pax: pax, cargo: 600, std: '10:00' }); p.id = 'ex-' + from + to; return p; }
  return { calc: calc, load: load, add: add, remove: remove, setActive: setActive, active: active, activePlan: activePlan, example: example, hm: hm, AC: AC, maxFl: maxFl };
})();
