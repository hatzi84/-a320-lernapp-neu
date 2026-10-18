# A320 Lernapp

Android-App zum Lernen und Üben des Airbus A320, unabhängig vom Simulator und von anderer Software. Läuft hochkant und quer
(die MCDU steht hochkant), auf Tablet und Handy.

## Inhalt

- **Flugplaner (wie SimBrief):** Strecke, Route, Gewichte und Kraftstoff eingeben, OFP mit Navlog lesen, Plan speichern. Zehn Übungsschritte erklären SimBrief. Der Plan lässt sich in der MCDU mit INIT REQUEST und FUEL / W&B REQUEST holen.
- **MCDU-Anleitung:** 13 Kapitel mit Zeichnungen, von Aufbau und Scratchpad bis zum Ablauf im Cockpit.
- **MCDU:** Flugplan laden, in die MCDU eingeben, auf dem ND prüfen. Geführt mit Aufgaben oder frei üben.
  Seiten: INIT A/B, F-PLN, DIR, PROG, PERF (alle Phasen), DATA, RAD NAV, FUEL PRED, SEC F-PLN, MCDU MENU.
- **Cockpit-Panel:** Overhead, Mittelkonsole · FCU, MCDU und Boden zum Antippen. Anzeigen und Schalter wie im Flugzeug.
- Vorgesehen: Systeme, Verfahren, Wiederholen mit Sicherheitsangabe.

Alle Zahlen, Wegpunkte und Flugpläne sind erfundene Beispiele. Die MCDU ist eine Nachbildung zum Lernen, kein Abbild der
MCDU im echten Flugzeug.

## Neue Version bekommen

Jeder Push auf `main` baut per GitHub Actions eine neue APK und legt sie unter „Releases“ ab.
In der App: Leiste unten, Punkt „Update“, dann „Update installieren“. Ein Punkt zeigt eine neue Version. Das Repo ist öffentlich, die Versionen sind ohne Anmeldung erreichbar. Der Schlüssel auf der Update-Seite ist nur nötig, falls das Repo einmal privat wird.
Auf anderen Zweigen baut der Workflow nur eine Test-APK (unter „Actions“ als Artefakt), ohne Release.

## Aufbau

- `lib/main.dart`: App-Rahmen (Vollbild, quer), Update-Funktion, Webansicht der Inhalte.
- `assets/web/`: die Inhalte als Webseiten (HTML, CSS, JS, Schriften). Sie liegen in der App, laufen ohne Internet.
- `android_patch/`: wird beim Bauen auf das erzeugte Android-Gerüst angewandt (Rechte, Update-Installation, App-Name).
- `keystore/debug.keystore`: bewusst im Repo, damit alle Versionen gleich signiert sind und als Update über die vorige passen.

## Navigationsdaten

Die Flughäfen sind echt (Koordinaten gerundet), die Wegpunkte und Strecken sind erfunden (`assets/web/js/navdata.js`). Nur zum Üben, nie zur Navigation.
