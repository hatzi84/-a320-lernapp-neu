# Übergabe: A320 Lernapp

Stand: 18.10.2026. Dieses Dokument ist für den Chat, der die App weiterbaut. **Mit dem Nutzer nur auf Deutsch sprechen.**

## Worum es geht
Eine normale Android-App (APK), mit der der Nutzer den Airbus A320 lernt und übt, **unabhängig vom Simulator und von der Tablet-Software**
(das ist ein anderes Projekt im Repo `hatzi84/a320-tablet-panel`). Läuft hochkant und quer, Tablet und Handy. Der Nutzer arbeitet
überwiegend am Handy, daher: einfache Schritte, keine Technik-Rückfragen, kein Terminal beim Nutzer.

- Repo: `hatzi84/-a320-lernapp-neu` (öffentlich; der Name beginnt mit einem Bindestrich, das ist so gewollt/vorhanden).
- Vorläufer: Repo `hatzi84/bzf-lernapp` (privat, BZF-Lern-App; Zweig `backup-bzf-v1` ist der alte Stand). Die App dort ist nicht mehr in Gebrauch.
- Keine Birkenbihl-Methoden in dieser App.

## Was schon da ist
- **Startseite** mit Kacheln und untere Leiste: Start, Planer, MCDU, Panel, Update.
- **Flugplaner** (`plan.html`): wie SimBrief, vereinfacht. Eingabe, OFP mit Kraftstoff, Gewichten und Navlog, speichern, 10 Übungsschritte „SimBrief üben“.
- **MCDU** (`mcdu.html`): Übungs-MCDU mit allen Seitentasten (INIT A/B, F-PLN mit TMPY/INSERT/ERASE, DIR, PROG, PERF-Phasen, DATA mit Unterseiten,
  RAD NAV, FUEL PRED, SEC F-PLN, ATC COMM, MCDU MENU, AIRPORT), Eingabeprüfung mit Fehlermeldungen, Erklärung je Feld, ND (Planansicht).
  Zwei Modi: „Geführt lernen“ (6 Aufgaben mit Schritten, Hinweis, Lösung) und „Frei üben“. Plan aus dem Planer per INIT REQUEST und FUEL / W&B REQUEST holen.
  Hochkant füllt das Gerät den Bildschirm, quer steht es links und rechts die Reiter (Aufgabe, Erklärung, ND, Flugplan).
- **MCDU-Anleitung** (`anleitung.html`): 13 Kapitel mit SVG-Zeichnungen, „Probier es“ springt in die MCDU (über `sessionStorage 'vpa.go'`).
- **Cockpit-Panel** (`panel.html`): Reiter Overhead (ca. 120 Elemente nach echtem A320-Overhead), Mittelkonsole · FCU, MCDU, Boden. Zustände sind Beispiele, mit Voreinstellungen „Kalt und dunkel“ / „Vor dem Anlassen“.
- **Update-Funktion** in der App (siehe unten).

## Aufbau
```
lib/main.dart            Flutter-Rahmen: Vollbild, alle Ausrichtungen, WebView auf assets/web, Update-Seite, Schlüsselfeld
assets/web/              die Inhalte als Webseiten (laufen offline in der App)
  index.html             Start
  plan.html              Planer       -> js/navdata.js, js/planer.js, js/plan-app.js
  mcdu.html              MCDU Üben    -> js/navdata.js, js/planer.js, js/mcdu.js, js/mcdu-app.js
  anleitung.html         Anleitung    -> js/anleitung.js
  panel.html             Panel        -> js/navdata.js, js/mcdu.js, js/tablet-airbus.js, js/tablet-airbus2.js
  js/nav.js              untere Leiste (alle Seiten)
  css/neu.css            Bauteil-Stile (MCDU, ND, Panel, Karten); css/app.css überschreibt Farben/Gerüst; css/fonts.css Schriften (lokal)
  fonts/                 Jost und Figtree (offline)
android_patch/           wird beim Bauen auf das erzeugte Android-Gerüst angewandt (Rechte, Update-Installation, App-Name)
keystore/debug.keystore  fester Signaturschlüssel (bewusst im Repo, Hobby-Schlüssel)
.github/workflows/build.yml  Bau und Veröffentlichung
```
- `js/navdata.js`: **Übungsdaten**. 25 echte Flughäfen (Koordinaten gerundet), Wegpunkte sind erfunden (Raster mit Silbennamen), Routenfinder im Korridor.
  Nur zum Üben, nie zur Navigation. SID/STAR gibt es nicht.
- `js/planer.js` (`VpAPlan`): Rechenmodell für Distanz, Zeit, Kraftstoff, Gewichte, Navlog; Speicher in `localStorage` (`vpa.plans`, `vpa.active`).
  Das Modell ist grob vereinfacht (A320-251N: OEW 42 500 kg, MTOW 79 000 kg usw.). Zahlen sind plausibel, nicht echt.
- `js/mcdu.js` (`VpAMcdu`): die MCDU-Logik. `mount(root,{page,explainEl,onChange})` liefert `{state,render,reset,setPlan,type,go}`; `nd(root,{getPlan})` zeichnet das ND.
  Seiten sind in `pages(S)` als Zeilenlisten beschrieben (Felder mit `lk`/`rk` = Taste links/rechts, Prüfregeln in `validate()`, Erklärungen in `EXPL`).
- `js/mcdu-app.js`: Seite „MCDU“ mit Aufgaben (Array `T`), Plan-Reiter, Skalierung des Geräts (`fit()` per CSS `zoom`).
- Alle Seiten sind reines HTML/CSS/JS ohne Framework. Das Ganze steckt in einer Flutter-WebView (`webview_flutter`). Die Inhalte werden mit der App als Asset ausgeliefert, kein Internet nötig.

## Bauen und Updates
- Jeder Push baut per GitHub Actions. **Nur Pushes auf `main` veröffentlichen ein Release** (`build-N`, APK `a320-lernapp.apk`, bis build-115 hieß sie `bzf-lernapp.apk`); andere Zweige legen nur ein Test-APK als Artefakt ab.
- **Build-Nummer = 100 + Lauf-Nummer** (`BN=$((100+run_number))`), damit sie höher als die alten Builds aus dem BZF-Repo ist (Android verweigert sonst Updates mit kleinerer Versionsnummer).
- In der App: untere Leiste „Update“ oder der Punkt dort. Die App fragt `https://api.github.com/repos/hatzi84/-a320-lernapp-neu/releases/latest` ab, vergleicht `build-N` mit `BUILD_NUMBER` und lädt die APK.
  Repo ist öffentlich, kein Schlüssel nötig. Ein optionales Schlüsselfeld (SharedPreferences `gh_token`) bleibt für den Fall, dass das Repo einmal privat wird.
- Paketname bleibt `de.hatzi.bzf_lernapp` (aus `flutter create --project-name bzf_lernapp`), App-Name „A320 Lernapp“. Gleiche Signatur wie früher, daher Update über die alte App möglich.
- **Signatur:** `android_patch/patch.py` setzt in `android/app/build.gradle(.kts)` den Schlüssel `keystore/debug.keystore` fest ein; der Schritt „Signatur prüfen“ im Workflow bricht ab, wenn die APK anders signiert ist. Bis build-113 war jede APK zufällig signiert (Updates scheiterten mit „Paket steht in Konflikt“); ab build-115 ist die Signatur fest. Beim Bau ist die Code-Verkleinerung aus (`--no-shrink`), weil sie Plugin-Code beschädigt hat.
- Der optionale Zugriffsschlüssel und `shared_preferences` sind entfernt; die Update-Suche läuft ohne Schlüssel gegen das öffentliche Repo.
- Flutter lässt sich in der Cloud-Sitzung **nicht ausführen**. Dart-Änderungen immer zuerst auf einem Zweig pushen und den Lauf bei GitHub (Actions) abwarten, erst bei grün nach `main`. Die Webseiten in `assets/web` kann man dagegen vorab mit Playwright prüfen
  (Chromium ist vorinstalliert, `/opt/node22/lib/node_modules/playwright`, Fenstergrößen 800×1280, 1280×800, 390×844).
- Ein Bau dauert etwa 7 bis 9 Minuten. Mit `send_later` (Erinnerung an sich selbst) auf das Ergebnis warten, nicht pollen.
- Stolpersteine in der Sitzungsumgebung: Das Anlegen von Tags per Push wurde vom Proxy abgelehnt. Bei flachem Klon (`--depth 1`) schlägt ein Push nach `main` mit „non-fast-forward“ fehl, wenn die Historie nicht bekannt ist:
  `git fetch --depth=6 origin <zweig> main` und danach pushen. Upstream setzen mit `git config remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'` und `git branch -u`.
- Der Nutzer installiert Versionen bisher über die Releases-Seite im Handy-Browser (einmalig), später über den Update-Knopf. Vor Android-Updates fragt Android einmalig nach „Apps installieren“.

## Entscheidungen des Nutzers
- App ist **komplett unabhängig** von der PC-/Tablet-Software und deren Aussehen. Eigene Oberfläche (Türkis auf Dunkel, untere Leiste).
- **Hochkant und quer.** Die MCDU ist ein hochkantes Gerät, sie darf nie auf Querformat gezwungen sein.
- Zwei MCDU-Wege: **Geführt** (Schritt für Schritt) und **frei üben**. Die Übungs-MCDU wirkt auf nichts außerhalb der App (kein Sim).
- „SimBrief nachbauen“: Planer in der App mit Übungsschritten; der Plan wird per INIT REQUEST in die MCDU geholt.
- Anleitung mit Zeichnungen zum Nachlesen, Schritt für Schritt.
- Alle Daten sind erfundene oder gerundete Beispiele und das wird auch so benannt. Quellen offen nennen, Inhalte in eigenen Worten. Keine Handbuch-Texte kopieren (FCOM ist geschützt).

## Bekannte Lücken und nächste Ideen
- **Systeme, Verfahren, Wiederholen** sind auf der Startseite als „bald“ markiert und noch leer. Gedacht: Systeme (Strom, Kraftstoff, Hydraulik, Klima, Enteisung, Feuer, Fahrwerk, Flugsteuerung, Triebwerke) mit erklärten Panels, Normalverfahren und Checklisten,
  Wiederholung mit Sicherheitsangabe und Wiederholungsabständen, Prüfungssimulation.
- MCDU-Abgleich mit der FlyByWire-Doku (docs.flybywiresim.com, A32NX Pilot Briefing → MCDU, Stand Okt. 2026): **erledigt** für INIT A, INIT B, PERF (alle Phasen), PROG und FUEL PRED (Feldanordnung, Beschriftungen, Farben: orange Kästchen = Pflicht, blau = änderbar, grün = berechnet; ZFW-Format ZFW/ZFWCG; FUEL PLANNING; Mittelspalte). Ebenfalls erledigt: F-PLN (TIME, SPD/ALT, BRG/TRK, Strecke, DEST-Zeile mit DIST/EFOB, END OF F-PLN, F-PLN DISCONTINUITY; Änderungen direkt auf F-PLN gelten sofort, INIT REQUEST lädt ohne INSERT) und DIR TO (Auswahl, <ERASE, DIRECT TO*). **Offen:** DATA, RAD NAV, SEC F-PLN, MCDU MENU, DEPARTURE/ARRIVAL (SID/STAR fehlen in den Übungsdaten), FIX INFO. Weitere Quelle vom Nutzer: YouTube-Tutorial „MCDU programmieren“ (Sandro, https://www.youtube.com/watch?v=d5tzNBJ7TSA): DIFSRIP-Ablauf, INIT REQUEST lädt Route direkt, am Ende keine DISCONTINUITY, ZFWCG ohne Loadsheet etwa 30, SEC F-PLN als Quick Return, RAD NAV mit VORs am Platz. Nur in eigenen Worten verwenden. Zweite Quelle vom Nutzer: Tutorial eines A320-Kapitäns zur kompletten MCDU-Vorbereitung im FBW A32NX (https://www.youtube.com/watch?v=AcFSNyLLFfU): FLT NBR = ATC-Rufzeichen, Cost Index 0–999, LAT REV mit DEPARTURE/AIRWAYS/NEXT WPT als TMPY + INSERT, Gesamtstrecke mit OFP vergleichen, RAD NAV per Kennung, THR RED/ACC in Deutschland oft 1000 ft, TO SHIFT bei Intersection, TRIP WIND, Reserven. Danach eingebaut: LAT REV (NEXT WPT, NEW DEST → TMPY/INSERT/ERASE), TO SHIFT, TRIP WIND, THR RED/ACC einzeln (/xxxx), A/C STATUS mit AIRAC-Gültigkeit, RAD NAV mit Übungs-Funkfeuern (erfunden, eins je Flughafen, Kennung aus dem Ortsnamen). Die Doku-Texte lassen sich mit curl laden.
- MCDU: ATSU, AIDS, CFDS, ATC-Datalink und gespeicherte Daten sind nur Namen. Navigationsdatenbank ist ein Raster mit erfundenen Namen. PERF-Rechenwerte wie VAPP sind Näherungen.
  Vor dem Ausbau jede Seite gegen eine belastbare Quelle prüfen (FlyByWire-Doku, eigene Worte), nichts raten.
- Der Planer ist **nicht** an den echten SimBrief angebunden (kein Abruf, kein OFP-Import). Das Rechenmodell ist vereinfacht.
- Panel: Leuchtenlogik vereinfacht, keine Systemlinien, einzelne Panels fehlen (RMP, Feueranzeigen der Triebwerke, Cockpit-Tür, Hauptpanel nur Auswahl).
- Das Gerät wird per CSS `zoom` skaliert (gut in Chromium/Android-WebView, nicht auf allen Browsern).
- Android-WebView-Verhalten auf dem echten Gerät ist nur teilweise geprüft: Der Nutzer hat bestätigt, dass Drehen, MCDU hochkant und das Panel laufen. Planer, Anleitung und neue MCDU-Aufgaben hat er noch nicht zurückgemeldet.

## Quellen und Hintergrund
- Design und Vorlagen des MCDU- und Panel-Codes stammen aus dem privaten Repo `hatzi84/a320-tablet-panel`, Ordner `design-neu/` (HTML-Entwürfe, Notizen in `design-neu/ideen/`, Referenzbilder in `design-neu/referenz/a320/` mit Quellen und Lizenzen).
  Dort liegen auch die Notizen `mcdu-funktionsumfang.md` und `flugzeug-profile.md`. Der Entwurf wird im anderen Chat weiterentwickelt; Änderungen müssen bewusst in diese App übernommen werden (kopieren und anpassen, nicht verlinken).
- MCDU-Seitenliste und SimBrief/INIT-REQUEST-Ablauf stammen aus Suchtreffern zur FlyByWire-Doku und zu SimBrief-Anleitungen. Die Seiten selbst waren aus der Sitzung nicht abrufbar; Unterseiten sind Fachwissen und noch nicht gegen die A32NX-Doku abgeglichen.
- Bilder aus Wikimedia Commons (CC-Lizenzen) nur als Vorlage in `a320-tablet-panel/design-neu/referenz/a320/`, nicht in dieser App eingebaut.
- Hinweis zu Inhalten von Captain Ingo (a320tutorial.de, Videos): nur einbetten oder verlinken, nie herunterladen; eigene Blätter nur privat, mit Quelle (Regel aus dem Projekt `a320-tablet-panel`).

## Arbeitsweise
- Kleine, testbare Schritte. Nach jedem Schritt dem Nutzer kurz sagen, was er auf dem Gerät prüfen soll, und konkrete Tippschritte nennen (er arbeitet am Handy, nutzt die deutsche GitHub-Oberfläche).
- Nichts committen oder veröffentlichen, was nicht zur App gehört. Keine Schlüssel oder Zugangsdaten in den Chat oder ins Repo schreiben.
- Dieser Übergabe-Chat ist getrennt vom Chat für die Tablet-Software und die Design-Ideen. Dort wird `a320-tablet-panel` weitergeführt.

## Overhead als Zeichnung (Stand Oktober 2026)
- Panel → Overhead ist jetzt eine SVG-Zeichnung (`ovhdSvg()` in `assets/web/js/tablet-airbus.js`, Fläche 1569 × 1212), Lage der Schalter nach echten A320-Fotos (Wikimedia Commons) und einer Vorlage des Nutzers. Fotos/Bilder werden NICHT eingebettet, nur nachgezeichnet.
- Grüne Systemlinien (HYD, FUEL, ELEC, AIR COND), Leuchtfelder in echten Farben, rote Schutzkappen, Batterie-Anzeigen.
- Beleuchtung: OVHD INTEG LT lässt die Beschriftung leuchten, DOME hellt das Panel auf (nur mit Strom).
- Verschieben mit einem Finger, Zoomen mit zwei; Knöpfe Ganz/Links/Mitte/Rechts.
- Weitere Reiter als Zeichnung (`assets/web/js/cockpit.js`, VpACockpit): Glareshield (EFIS, FCU, Master Warn/Caut), Hauptpanel (PFD, ND, E/WD, SD, ISIS, Uhr, Fahrwerk, Autobremse, Bremsdruck), Pedestal (MCDU 1/2 → MCDU-Reiter, Switching, ECAM-Bedienteil, RMP, ACP, Schub, Klappen, Spoiler, ENG, Ruder-Trimm, Parkbremse, ATC/TCAS, WX, Tür) und „Overhead oben“ (Wartung, Sicherungen). Aktionen mit Präfix `xc` laufen über `VpACockpit.click`.
- Bildschirme zeigen rote Flaggen (ATT/HDG/SPD/ALT, MAP NOT AVAIL), solange ADIRS aus ist.
