/* Übungs-Navigationsdaten: echte Flughäfen (Koordinaten gerundet), erfundene Wegpunkte. Nur zum Üben, nicht zur Navigation. */
window.VpANav = (function () {
  var R_NM = 3440.065;
  var AIRPORTS = {
    EDDF: ['Frankfurt', 50.0333, 8.5706, 364], EDDM: ['München', 48.3538, 11.7861, 1487], EDDH: ['Hamburg', 53.6304, 9.9882, 53],
    EDDB: ['Berlin Brandenburg', 52.3667, 13.5033, 157], EDDL: ['Düsseldorf', 51.2895, 6.7668, 147], EDDK: ['Köln/Bonn', 50.8659, 7.1427, 302],
    EDDS: ['Stuttgart', 48.6899, 9.2220, 1276], EDDV: ['Hannover', 52.4611, 9.6851, 183], EDDN: ['Nürnberg', 49.4987, 11.0669, 1046],
    EDDW: ['Bremen', 53.0475, 8.7867, 14], EDDP: ['Leipzig/Halle', 51.4324, 12.2416, 466], EDDC: ['Dresden', 51.1328, 13.7672, 755],
    EDDG: ['Münster/Osnabrück', 52.1346, 7.6848, 160], EDLW: ['Dortmund', 51.5183, 7.6122, 770], EDSB: ['Karlsruhe/Baden-Baden', 48.7794, 8.0805, 408],
    LOWW: ['Wien', 48.1103, 16.5697, 183], LSZH: ['Zürich', 47.4647, 8.5492, 1416], EHAM: ['Amsterdam', 52.3086, 4.7639, -11],
    LFPG: ['Paris Charles de Gaulle', 49.0097, 2.5479, 392], EGLL: ['London Heathrow', 51.4706, -0.4619, 83], EKCH: ['Kopenhagen', 55.6180, 12.6560, 17],
    LEMD: ['Madrid', 40.4719, -3.5626, 2000], LIRF: ['Rom Fiumicino', 41.8003, 12.2389, 13], ESSA: ['Stockholm Arlanda', 59.6519, 17.9186, 137]
  };
  var DB = {}, WPS = [];
  Object.keys(AIRPORTS).forEach(function (k) { var a = AIRPORTS[k]; DB[k] = { lat: a[1], lon: a[2], apt: 1, name: a[0], elev: a[3] }; });

  /* Erfundene Wegpunkte auf einem versetzten Raster über Europa, Namen aus Silben */
  var seed = 20261018;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var C = 'BDFGKLMNPRSTVZ', V = 'AEIOU', used = {};
  function name() { for (var n = 0; n < 50; n++) { var s = ''; for (var i = 0; i < 5; i++) { var set = i % 2 ? V : C; s += set[Math.floor(rnd() * set.length)]; } if (!used[s] && !DB[s]) { used[s] = 1; return s; } } return 'XXXXX'; }
  for (var la = 40.2; la <= 60; la += 0.55) for (var lo = -5; lo <= 20; lo += 0.8) {
    var lat = la + (rnd() - 0.5) * 0.3, lon = lo + (rnd() - 0.5) * 0.45, id = name();
    DB[id] = { lat: lat, lon: lon }; WPS.push(id);
  }

  function rad(d) { return d * Math.PI / 180; }
  function distNm(a, b) {
    var p = DB[a], q = DB[b]; if (!p || !q) return null;
    var dLat = rad(q.lat - p.lat), dLon = rad(q.lon - p.lon), h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p.lat)) * Math.cos(rad(q.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function distPts(p, q) { var dLat = rad(q.lat - p.lat), dLon = rad(q.lon - p.lon), h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p.lat)) * Math.cos(rad(q.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(h))); }
  function bearing(a, b) { var p = DB[a], q = DB[b]; if (!p || !q) return null; var y = Math.sin(rad(q.lon - p.lon)) * Math.cos(rad(q.lat)), x = Math.cos(rad(p.lat)) * Math.sin(rad(q.lat)) - Math.sin(rad(p.lat)) * Math.cos(rad(q.lat)) * Math.cos(rad(q.lon - p.lon)); return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; }

  /* Automatische Route: Wegpunkte im Korridor um die Luftlinie, grob alle 45 bis 90 NM */
  function routeFor(from, to) {
    var A = DB[from], B = DB[to]; if (!A || !B) return null;
    var total = distNm(from, to), out = [];
    WPS.forEach(function (id) {
      var P = DB[id], dA = distPts(A, P), dB = distPts(P, B); if (dA < 25 || dB < 25) return;
      var along = (dA * dA - dB * dB + total * total) / (2 * total); if (along < 20 || along > total - 20) return;
      var off = Math.sqrt(Math.max(0, dA * dA - along * along)); if (off > 22) return;
      out.push({ id: id, along: along, off: off });
    });
    out.sort(function (a, b) { return a.along - b.along; });
    var res = [], last = 0;
    out.forEach(function (o) { if (o.along - last >= 50) { res.push(o.id); last = o.along; } });
    return res.slice(0, 14);
  }
  function routeDist(from, route, to) { var ids = [from].concat(route, [to]), t = 0; for (var i = 1; i < ids.length; i++) { var d = distNm(ids[i - 1], ids[i]); if (d == null) return null; t += d; } return t; }

  /* Ausweichflughäfen für ein Ziel: nächste Flughäfen, mindestens 30 NM entfernt, nie der Abflug. Nur Übungsdaten. */
  function suggestAlt(to, from, n) {
    if (!DB[to] || !DB[to].apt) return [];
    return Object.keys(AIRPORTS).filter(function (k) { return k !== to && k !== from && distNm(to, k) >= 30; })
      .map(function (k) { return { id: k, name: AIRPORTS[k][0], nm: Math.round(distNm(to, k)) }; })
      .sort(function (a, b) { return a.nm - b.nm; }).slice(0, n || 3);
  }
  return { suggestAlt: suggestAlt, AIRPORTS: AIRPORTS, DB: DB, WPS: WPS, dist: distNm, distPts: distPts, bearing: bearing, routeFor: routeFor, routeDist: routeDist };
})();
