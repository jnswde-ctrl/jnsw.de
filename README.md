# JNSW.DE

JNSW.DE ist eine deutschsprachige Portfolio- und Community-Website für digitale Produkte, Markenidentitäten, Werkzeuge und Informationen.

Die Anwendung ist zugleich ein öffentliches Praxisprojekt für moderne Webentwicklung: eine TypeScript-/Next.js-Anwendung auf Cloudflare Workers mit D1-Datenbank, versionierten Migrationen, automatisierten Prüfungen und dokumentierten Sicherheitsentscheidungen.

Website: [jnsw.de](https://jnsw.de) · GitHub: [jnswde-ctrl](https://github.com/jnswde-ctrl)

## Voraussetzungen

- Node.js `>=22.13.0`
- Eine aktuelle npm-Installation

## Entwicklung

```bash
npm run dev
npm run format
npm run format:check
npm run lint
npm run build
npm test
```

`npm run dev` startet die lokale vinext-Entwicklung. `npm run build` erzeugt den Produktions-Build. `npm test` führt die verlässlichen Node-Unit-Tests aus; Worker-Render-Integrationstests werden erst mit einer Cloudflare-kompatiblen Testlaufzeit ergänzt.

## Qualitätsworkflow

Jede Änderung an `main` und jeder Pull Request wird automatisch geprüft. Die CI installiert die Abhängigkeiten reproduzierbar und führt Lint, Produktions-Build sowie die Test-Suite aus.

`npm run format` formatiert den handgeschriebenen Quellcode mit Prettier. `npm run format:check` prüft die Formatierung in der CI. Die Produktionsoptimierung bleibt getrennt: vinext/Vite erzeugt beim Build die auslieferungsoptimierten Dateien; Quellcode wird nicht beim Speichern minifiziert.

Für Änderungen wird der Ablauf **Issue → Branch → Pull Request → CI → Review → Merge** verwendet. KI-gestützte Vorschläge sind dabei Ausgangspunkt, nicht Freigabe: Änderungen werden gegen Anforderungen, Sicherheitsregeln, Tests und den tatsächlichen Diff geprüft.

## Projektstruktur

- `app/` – Next.js App Router, Oberflächen und API-Route-Handler
- `db/` – Drizzle-Schema sowie Benutzer- und Sitzungszugriffe
- `drizzle/` – versionierte D1-Migrationen
- `worker/` – Cloudflare-Worker-Einstiegspunkt
- `tests/` – Unit-Tests
- `docs/` – technische und fachliche Dokumentation

## Datenbank und Migrationen

Das Cloudflare-D1-Binding heißt `DB`. Nach Änderungen an `db/schema.ts` wird eine Migration erzeugt und geprüft:

```bash
npm run db:generate
npm exec wrangler -- d1 migrations apply DB --local --persist-to .wrangler/state
npm exec wrangler -- d1 migrations list DB --local --persist-to .wrangler/state
```

Lokale D1-Daten liegen unter `.wrangler/state` und sind nicht versioniert. Produktionsmigrationen werden ausschließlich über den später festzulegenden Deployment-Prozess ausgeführt; keine Produktions-ID oder Secrets gehören in dieses Repository.

`wrangler.jsonc` beschreibt ausschließlich die lokale D1-Simulation. Die Produktion erhält die
Binding `DB` ausschließlich über `.openai/hosting.json` und Sites. Deshalb sind direkte
`wrangler d1 ... --remote`-Befehle aus diesem Repository nicht zulässig: Sie könnten nie die von
Sites verwaltete Produktionsdatenbank zuverlässig adressieren.

## Sicherheitsregeln

- Passwortverarbeitung erfolgt ausschließlich über `app/passwords.ts`.
- Sitzungstokens werden ausschließlich gehasht gespeichert.
- Schreibende API-Routen prüfen dieselbe Origin zentral über `app/request-security.ts`.
- Nutzerobjekte in API-Antworten werden mit `publicUser()` reduziert.

Weitere Architektur- und Risikoentscheidungen stehen in [`docs/technical-baseline.md`](docs/technical-baseline.md).

## Browser-Helfer

Die wiederverwendbare Anwenderanleitung für Installation, Aktualisierung und Test der lokalen Chrome-Erweiterung steht in [`docs/browser-helfer.md`](docs/browser-helfer.md).
