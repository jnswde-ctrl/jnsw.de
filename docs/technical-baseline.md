# Technische Ausgangslage

Stand: 9. August 2026

## Architektur

JNSW.DE nutzt Next.js 16 mit App Router und React 19. vinext baut die Anwendung für Cloudflare Workers; `worker/index.ts` delegiert reguläre Requests an vinext. D1 ist über das Binding `DB` angebunden, der Datenzugriff liegt in `db/` und die versionierten Migrationen in `drizzle/`.

Verbindliche Architekturentscheidungen werden als ADR unter `docs/architecture/` dokumentiert. Für
die Bewerbungswerkstatt trennt
[ADR 0001](architecture/0001-opportunity-und-bewerbung-trennen.md) eine gefundene und geprüfte
Stellen-Opportunity von der erst später entstehenden Bewerbung.

| Bereich    | Verantwortung                                         |
| ---------- | ----------------------------------------------------- |
| `app/`     | Seiten, gemeinsame UI und Route Handler               |
| `db/`      | Drizzle-Schema sowie Benutzer- und Sitzungszugriff    |
| `drizzle/` | D1-/SQLite-Migrationen                                |
| `worker/`  | Cloudflare-Worker-Einstiegspunkt                      |
| `tests/`   | Node.js-Tests für PDF-Logik und Sicherheitsfunktionen |

## Qualitäts- und Sicherheitslage

- Das PDF-Zusammenführen geschieht lokal im Browser; Tests sichern Reihenfolge, Fehlerfälle und fehlende Netzwerkanfragen ab.
- Passwort-Hashes und Sitzungstokens werden nicht im Klartext gespeichert. Schreibende Routen verwenden die zentrale Same-Origin-Prüfung in `app/request-security.ts`.
- Die Community-Seite besitzt Anmeldung und Konto-Grundlage, aber noch keinen verbindlichen Community-Nutzen, kein Zugriffsmodell und keine Moderationsentscheidung.

## Offene Risiken und Entscheidungen

1. E-Mail-Verifikation, Passwort-Reset und sichere Verknüpfung mit „Sign in with ChatGPT“ fehlen.
2. Der Produktionsprozess für D1-Migrationen ist nicht verbindlich definiert.
3. Accessibility-Ziele, Performance-Budgets und Browser-Unterstützung sind offen.
4. Tailwind ist installiert, während die Oberfläche vorwiegend globale CSS-Klassen verwendet; die Stylingstrategie muss festgelegt werden.

## Arbeitsregeln

Neue Datenbankzugriffe bleiben in `db/`; jede Schemaänderung erhält eine geprüfte Migration. Vor dem Merge laufen `npm run lint`, `npm run build` und `npm test`; betroffene Oberflächen werden auf Desktop und Mobil geprüft.
