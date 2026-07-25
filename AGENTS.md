# AGENTS.md

## Projektzweck

JNSW.DE ist eine deutschsprachige Portfolio- und Community-Website für digitale Produkte, Markenidentitäten, Werkzeuge und Informationen.

Der öffentliche Bereich umfasst derzeit:

- die Startseite
- `/tools`
- `/informationen`
- `/community`

Zusätzlich existiert eine Backend-Grundlage für Benutzerkonten, Sitzungen und Administration. Eine sichtbare Login-, Profil- oder Admin-Oberfläche ist noch nicht vorhanden.

## Wichtige Verzeichnisse

- `app/`: Next.js App Router, Seiten, gemeinsame UI und globale Styles
- `app/api/`: Route Handler für Authentifizierung, Konto und Administration
- `app/_sites-preview/`: isolierte Vorschau des ursprünglichen Sites-Starters
- `db/`: Drizzle-Schema sowie Benutzer- und Sitzungszugriff
- `drizzle/`: versionierte D1-/SQLite-Migrationen
- `worker/`: Cloudflare-Worker-Einstiegspunkt
- `build/`: projektspezifisches Vite-Plugin für Sites-Builds
- `docs/`: fachliche Dokumentation
- `tests/`: Tests mit dem Node.js-Test-Runner
- `public/`: statische Dateien
- `.openai/hosting.json`: Sites-Projekt und D1-Binding

Generierte oder lokale Verzeichnisse wie `node_modules/`, `dist/`, `.next/`, `.vinext/` und `.wrangler/` werden nicht als Quellcode behandelt.

## Technologien

- Node.js `>=22.13.0`
- TypeScript im Strict-Modus
- Next.js 16 mit App Router
- React 19
- vinext und Vite
- Cloudflare Workers und D1
- Drizzle ORM und Drizzle Kit
- Tailwind CSS 4 über PostCSS
- ESLint mit Next.js- und TypeScript-Regeln
- Node.js-Test-Runner

## Kommandos

Keine Installation ausführen, sofern sie nicht ausdrücklich beauftragt wurde.

```bash
npm run dev
npm run build
npm run start
npm test
npm run lint
npm run db:generate
```

Bedeutung:

- `npm run dev`: lokale vinext-Entwicklung starten
- `npm run build`: Produktions-Build erzeugen
- `npm run start`: gebauten Stand starten
- `npm test`: zuerst bauen, danach `tests/rendered-html.test.mjs` ausführen
- `npm run lint`: ESLint ausführen
- `npm run db:generate`: Drizzle-Migrationen aus `db/schema.ts` generieren

`Start-JnswLocal.ps1` startet keinen Server. Das Skript überwacht eine bereits unter `localhost:3000` laufende Instanz.

## Architekturkonventionen

- Seiten und Layouts verwenden den Next.js App Router unter `app/`.
- Gemeinsame Navigation liegt in `app/SiteNav.tsx`.
- Die Bereichsseiten verwenden `app/SectionPage.tsx`.
- Serverseitige API-Endpunkte liegen als Route Handler unter `app/api/`.
- Datenbankzugriffe werden in `db/` gekapselt.
- Das zentrale Schema liegt in `db/schema.ts`.
- Schemaänderungen benötigen eine passende Migration unter `drizzle/`.
- Das Cloudflare-D1-Binding heißt `DB`.
- Der Worker delegiert reguläre Requests an vinext.
- Öffentliche Seiten verwenden derzeit Server Components; Client Components nur bei tatsächlichem clientseitigem Verhalten einführen.
- UTF-8 verwenden und bestehende Zeichenkodierungsfehler nicht weiterverbreiten.

## Design und Komponenten

Die zentralen Designregeln stehen in `app/globals.css`.

Vorhandene Farbvariablen:

- `--ink: #08080a`
- `--paper: #f4f0e7`
- `--blue: #3157ff`
- `--acid: #b8ff62`
- `--line: rgba(244,240,231,.18)`

Typografie:

- Manrope für Überschriften und Fließtext
- DM Mono für Navigation, Labels und Metadaten
- Georgia als kursiver Editorial-Akzent

Bestehende gemeinsame Komponenten und Muster wiederverwenden, insbesondere:

- `SiteNav`
- `SectionPage`
- `.eyebrow`
- Hero- und Footer-Strukturen
- vorhandene CSS-Variablen
- den mobilen Breakpoint bei `720px`

Tailwind ist konfiguriert, die aktuelle Oberfläche verwendet jedoch überwiegend globale CSS-Klassen. Eine verbindliche Strategie für neue Styles ist ein offener Punkt.

## Authentifizierung und sensible Daten

Es bestehen zwei Anmeldewege:

- E-Mail und Passwort
- von der Hostingplattform bereitgestelltes „Sign in with ChatGPT“

Regeln:

- Die zentrale Benutzerauflösung erfolgt über `app/auth.ts`.
- ChatGPT-Identitäts-Header werden ausschließlich hinter der vorgesehenen Hostingplattform als vertrauenswürdig behandelt.
- Die reservierten Pfade `/signin-with-chatgpt`, `/signout-with-chatgpt` und `/callback` nicht als eigene App-Routen implementieren.
- Passwörter ausschließlich über die Funktionen in `app/passwords.ts` verarbeiten.
- Sitzungstoken nur gehasht speichern.
- Sitzungen über das Cookie `jnsw_session` verwalten.
- API-Antworten müssen `publicUser()` verwenden, wenn ein Benutzerobjekt zurückgegeben wird.
- Rollen- und Statusprüfungen für Admin-Endpunkte nicht umgehen.
- Secrets und lokale Umgebungsdateien nicht committen; `.env*` ist ignoriert.
- Schreibende Auth-Endpunkte verwenden eine Same-Origin-Prüfung. Die noch fehlende konsistente Prüfung anderer schreibender Endpunkte ist ein offener Sicherheitsaspekt.
- Die sichere Verknüpfung von ChatGPT- und Passwortkonten ist ein offener Punkt.

## Tests und Verifikation

Vor Abschluss einer Änderung mindestens die für den Umfang relevanten Prüfungen ausführen:

- `npm run lint`
- `npm run build`
- `npm test`, wenn die Änderung den Build, gerendertes HTML oder getestete Komponenten betrifft
- `npm run db:generate`, wenn `db/schema.ts` geändert wurde; die erzeugte Migration prüfen

Die bestehenden HTML-Tests beziehen sich teilweise noch auf den ursprünglichen Starter und müssen vor ihrer Verwendung als verlässliche Abnahme aktualisiert werden.

Frontend-Änderungen zusätzlich in den betroffenen Desktop- und Mobilansichten visuell prüfen. Ein festgelegter Browser-, Accessibility- oder Performance-Prüfstandard ist noch offen.

## Definition of Done

Eine Änderung ist abgeschlossen, wenn:

- der beauftragte Funktionsumfang umgesetzt ist
- bestehende gemeinsame Komponenten und Architekturgrenzen eingehalten wurden
- keine Secrets oder sensiblen Benutzerdaten offengelegt werden
- notwendige Schemaänderungen eine geprüfte Migration besitzen
- relevante Dokumentation aktualisiert wurde
- die anwendbaren Lint-, Build- und Testprüfungen erfolgreich sind
- bekannte nicht ausgeführte oder fehlschlagende Prüfungen ausdrücklich dokumentiert sind
- betroffene Oberflächen auf Desktop und Mobil visuell geprüft wurden
- keine unbeabsichtigten Änderungen an generierten oder fremden Dateien enthalten sind

## Offene Punkte

- verbindliche Stylingstrategie für globale CSS-Klassen und Tailwind
- Zielumfang und Zugriffsmodell des Community-Bereichs
- Browser- und Geräteunterstützung
- Accessibility- und Performance-Anforderungen
- E-Mail-Verifikation und Passwort-Reset
- sichere Verknüpfung der beiden Anmeldewege
- verbindlicher Deployment- und D1-Migrationsprozess

## KI- und Agent-Effizienz

- Subagents nur für klar abgegrenzte, unabhängige Aufgaben einsetzen.
- Vor einer Analyse relevante Dateien und Verzeichnisse eingrenzen.
- Bereits untersuchte Bereiche nicht ohne konkreten Grund erneut vollständig analysieren.
- Ergebnisse knapp zusammenfassen; keine vollständigen Dateiinhalte wiedergeben.
- Standardmäßig höchstens einen Subagent einsetzen. Parallelisierung nur bei tatsächlich unabhängigen Aufgaben.
- Hohe Reasoning-Stufen nur für komplexe Architektur-, Sicherheits- oder Fehleranalysen verwenden.
