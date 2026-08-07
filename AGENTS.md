# AGENTS.md

## Projektzweck

JNSW.DE ist eine deutschsprachige Portfolio- und Community-Plattform für digitale Produkte, Werkzeuge und Informationen.

Die öffentliche Haupterfahrung ist eine zusammenhängende One-Page-Plattform unter `/`. Projekte, Tools, Informationen und Community sind Scroll-Abschnitte derselben Seite. Das feste Menü fokussiert diese Abschnitte per Smooth-Scroll ohne Seitenwechsel. Detailrouten wie `/tools/pdf-zusammenfuegen` und `/projekte/pdf-tool` bleiben als direkte Einstiege für einzelne Produkte und Case Studies bestehen.

Zusätzlich existiert eine Backend-Grundlage für Benutzerkonten, Sitzungen und Administration. Eine sichtbare Login-, Profil- oder Admin-Oberfläche ist noch nicht vorhanden.

## Wichtige Verzeichnisse

- `app/`: Next.js App Router, Seiten, gemeinsame UI und globale Styles
- `app/api/`: Route Handler für Authentifizierung, Konto und Administration
- `db/`: Drizzle-Schema sowie Benutzer- und Sitzungszugriff
- `drizzle/`: versionierte D1-/SQLite-Migrationen
- `worker/`: Cloudflare-Worker-Einstiegspunkt
- `build/`: projektspezifisches Vite-Plugin für Sites-Builds
- `docs/`: fachliche Dokumentation und Gestaltungsrichtlinien
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

- `npm run dev`: lokale vinext-Entwicklung starten
- `npm run build`: Produktions-Build erzeugen
- `npm run start`: gebauten Stand starten
- `npm test`: baut zuerst und führt die Unit-Tests aus
- `npm run lint`: ESLint ausführen
- `npm run db:generate`: Drizzle-Migrationen aus `db/schema.ts` generieren

`Start-JnswLocal.ps1` startet keinen Server. Das Skript überwacht eine bereits unter `localhost:3000` laufende Instanz.

## Architekturkonventionen

- Seiten und Layouts verwenden den Next.js App Router unter `app/`.
- Die Plattformstartseite in `app/page.tsx` ist die primäre öffentliche Navigationserfahrung.
- Gemeinsame Navigation liegt in `app/SiteNav.tsx`. Sie verwendet Abschnittsanker und darf auf der Startseite keine Routenwechsel auslösen.
- Abschnitts-IDs und Menüpunkte bleiben synchron: `top`, `projekte`, `tools`, `informationen`, `community`.
- Direkte Detailrouten ergänzen die Plattform, ersetzen aber nicht die Scroll-Navigation.
- Serverseitige API-Endpunkte liegen als Route Handler unter `app/api/`.
- Datenbankzugriffe werden in `db/` gekapselt; das zentrale Schema liegt in `db/schema.ts`.
- Schemaänderungen benötigen eine passende Migration unter `drizzle/`.
- Das Cloudflare-D1-Binding heißt `DB`; der Worker delegiert reguläre Requests an vinext.
- Öffentliche Seiten verwenden Server Components. Client Components sind nur für tatsächliches clientseitiges Verhalten wie Menüstatus, Dialoge oder Formulare erlaubt.
- UTF-8 verwenden und bestehende Zeichenkodierungsfehler nicht weiterverbreiten.

## Design und Komponenten

Die verbindliche Gestaltungsrichtlinie liegt in `docs/design-richtlinie.md`; sie geht allgemeinen Stilpräferenzen vor.

- Oberfläche durchgehend dunkel: `--ink`, `--surface` und `--surface-raised` sind die einzigen Flächenebenen.
- `--paper` ist Text- und Kontrastfarbe, kein großflächiger Hintergrund.
- `--blue` steht für Fokus und räumliche Tiefe; `--acid` für primäre Aktionen und kleine Statussignale.
- Der Seitenhintergrund muss zwischen Abschnitten fließend bleiben. Keine harten Farbwechsel, die getrennte Seiten suggerieren.
- Das feste Menü bleibt beim Scrollen sichtbar, kennzeichnet den aktuellen Abschnitt und respektiert Tastaturfokus sowie `prefers-reduced-motion`.
- Den PDF-Dialog als Referenz für dunkle Arbeitsflächen, feine Linien und Interaktionszustände verwenden.
- Vorhandene Klassen, `SiteNav`, `.eyebrow`, Hero-/Footer-Strukturen und den mobilen Breakpoint bei `720px` wiederverwenden.
- Tailwind ist konfiguriert; neue Styles folgen weiterhin den bestehenden globalen CSS-Klassen, bis eine andere Strategie beschlossen wird.

## Authentifizierung und sensible Daten

Es bestehen zwei Anmeldewege: E-Mail/Passwort sowie „Sign in with ChatGPT“ der Hostingplattform.

- Die zentrale Benutzerauflösung erfolgt über `app/auth.ts`.
- ChatGPT-Identitäts-Header sind nur hinter der vorgesehenen Hostingplattform vertrauenswürdig.
- Die reservierten Pfade `/signin-with-chatgpt`, `/signout-with-chatgpt` und `/callback` nicht als eigene App-Routen implementieren.
- Passwörter ausschließlich über `app/passwords.ts` verarbeiten.
- Sitzungstoken nur gehasht speichern und über das Cookie `jnsw_session` verwalten.
- API-Antworten verwenden für Benutzer `publicUser()`.
- Rollen- und Statusprüfungen für Admin-Endpunkte nicht umgehen.
- Secrets und lokale Umgebungsdateien nicht committen; `.env*` ist ignoriert.
- Schreibende Endpunkte benötigen eine Same-Origin-Prüfung.

## Tests und Verifikation

Vor Abschluss einer Änderung mindestens die relevanten Prüfungen ausführen:

- `npm run lint`
- `npm run build`
- `npm test`, wenn Build, gerendertes HTML oder getestete Komponenten betroffen sind
- `npm run db:generate`, wenn `db/schema.ts` geändert wurde; die Migration anschließend prüfen
- Funktionsänderungen erhalten passende neue oder angepasste automatisierte Tests; ist das nicht sinnvoll möglich, wird der Grund im PR dokumentiert.

Frontend-Änderungen auf Desktop und Mobil visuell prüfen. Für die Scroll-Plattform zusätzlich kontrollieren: Menü bleibt sichtbar, aktive Abschnittsmarkierung folgt dem Scrollen, jeder Menüpunkt fokussiert den korrekten Abschnitt und es entstehen keine Seitenwechsel.

## GitHub-Workflow

- Jede nicht-triviale Änderung ist einem GitHub-Issue zugeordnet.
- Vor Beginn wird der im Issue referenzierte Branch ausgecheckt. Fehlt die Branch-Referenz, wird das Issue zuerst ergänzt; bis dahin beginnt keine Umsetzung.
- Das Issue dokumentiert vor und während der Umsetzung das Vorgehen, die Gründe für wesentliche Entscheidungen, den betroffenen Umfang sowie die ausgeführten oder bewusst nicht ausgeführten Prüfungen.
- Commits und Pull Requests referenzieren das zugehörige Issue; nicht zusammenhängende Änderungen bleiben außerhalb des Branches.

Der verbindliche Ablauf, die lokalen Voraussetzungen und Prüfpunkte stehen in `docs/visuelle-pruefung.md`. Für eine Sichtprüfung muss ein lokaler Entwicklungsserver in einem persistenten Terminal laufen.

## Definition of Done

Eine Änderung ist abgeschlossen, wenn der beauftragte Umfang umgesetzt ist, Architektur- und Sicherheitsgrenzen eingehalten sind, relevante Dokumentation aktualisiert wurde, die anwendbaren Prüfungen erfolgreich sind und bekannte nicht ausgeführte Prüfungen dokumentiert sind. Vor einem Merge nach `main` müssen Informationsdateien, Kommentare und Projektanweisungen auf notwendigen Aktualisierungsbedarf geprüft und das Ergebnis im PR festgehalten werden.

## Offene Punkte

- Zielumfang und Zugriffsmodell des Community-Bereichs
- Browser- und Geräteunterstützung
- verbindliche Accessibility- und Performance-Anforderungen
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

### Auswahl von Subagents

- Keinen Subagent einsetzen, wenn die Aufgabe klein, eindeutig oder direkt selbst umsetzbar ist.
- `explorer` für eine eng abgegrenzte, lesende Frage zur Codebasis einsetzen.
- `worker` für eine klar abgegrenzte Umsetzung mit benannten Dateien oder Verantwortungsbereich einsetzen.
- `auth_reviewer` ausschließlich für lesende Prüfungen von Authentifizierung, Sitzungen und Berechtigungen einsetzen.
- `design_researcher` für lesende UX-, Responsive- und Accessibility-Reviews einsetzen.
- `prompt_coach` nur verwenden, wenn ein größerer Auftrag vor der Umsetzung sinnvoll geschärft werden muss.
- `default` nur wählen, wenn keine spezialisierte Rolle passt; der Auftrag bleibt trotzdem klar eingegrenzt.

### Auswahl von Skills

- Einen Skill nur einsetzen, wenn seine Aufgabenbeschreibung unmittelbar zur Aufgabe passt; ansonsten die normale Projektkonvention anwenden.
- Bei Repository-Änderungen `git-officer` für Issue-, Branch- und PR-Disziplin verwenden.
- Wenn `.openai/hosting.json` vorhanden ist oder eine Site gebaut beziehungsweise veröffentlicht wird, die passenden `sites`-Skills verwenden.
- Für Cloudflare Workers, D1, Wrangler oder Cloudflare-Konfiguration die passenden Cloudflare- oder Wrangler-Skills verwenden.
- Bei OpenAI-Produkten und -APIs `openai-docs` verwenden; aktuelle Aussagen daraus ableiten.
- Für GitHub-Issues, Pull Requests, Reviews oder Actions die zugehörigen GitHub-Skills verwenden.
- Für Browsersteuerung, visuelle Frontend-Prüfungen oder Performance-Messungen die Browser-, Chrome- oder `web-perf`-Skills verwenden.
- Für eigenständige Dokumente, PDFs, Präsentationen, Tabellen oder Bildmaterial die jeweiligen Artefakt- oder Bild-Skills verwenden.
- Keine Skill-Liste in dieser Datei pflegen: maßgeblich ist die zur Laufzeit verfügbare Skill-Beschreibung.
