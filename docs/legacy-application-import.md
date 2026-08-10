# Altbestandsimport Bewerbungswerkstatt

Das lokale Kommando importiert den strukturierten Altbestand aus `bewerbungen.json` kontrolliert in D1. Die Quelldatei bleibt außerhalb des Repositories. `bewerbungen.md` ist eine lesbare Übersicht ohne stabile Vorgangs-ID und wird deshalb nicht als Schreibquelle verwendet.

## Sicherer Ablauf

Der Standard ist ein Dry-Run. Er liest nur bereits importierte Vorgänge des angegebenen Kontos und gibt ausschließlich Zähler aus.

```bash
npm run import:legacy-applications -- --applications <lokaler-pfad>/bewerbungen.json --letters <lokaler-pfad>/anschreiben_jobs.json --user-id <zielkonto-id> --remote
```

Erst nach einem konfliktfreien Dry-Run schreibt `--apply` in die bewusst angegebene Datenbank:

```bash
npm run import:legacy-applications -- --applications <lokaler-pfad>/bewerbungen.json --letters <lokaler-pfad>/anschreiben_jobs.json --user-id <zielkonto-id> --remote --apply
```

Das Werkzeug erzeugt beim Schreiben eine temporäre SQL-Datei und entfernt sie anschließend. Weder Quelldateien noch Freitexte oder Konfliktkennungen werden ausgegeben.

## Mapping

| Altstatus            | Opportunity                                     | Bewerbung               |
| -------------------- | ----------------------------------------------- | ----------------------- |
| `applied`            | `recommended`, Quelle unbekannt                 | `sent`                  |
| `rejected`           | `recommended`, Quelle unbekannt                 | `rejected`              |
| `application_closed` | Quelle `closed`; bei Versanddatum `recommended` | bei Versanddatum `sent` |
| `not_recommended`    | `not_recommended`                               | keine                   |
| `reviewed_hold`      | `on_hold`                                       | keine                   |
| `status_unknown`     | `unreviewed`                                    | keine                   |

Das Versanddatum bleibt unabhängig vom Quellenstatus erhalten. Fehlende oder nicht vorhandene Zeitpunkte werden als `null` gespeichert, nicht durch Schätzwerte ersetzt.

## Idempotenz und Konflikte

Der Schlüssel `legacy-json:<alte-id>` ist pro Zielkonto stabil. Bei identischem Bestand wird der Vorgang übersprungen. Fehlt bei einer ansonsten identischen Opportunity nur die erwartete Bewerbung, wird sie nachgetragen. Abweichungen bei Unternehmen, Rolle, URL, Prüfdatum, Status oder Notiz gelten als Konflikt: Das Kommando beendet sich mit Fehlercode `2` und führt keine Schreiboperation aus.

Dokument- und Nachweisreferenzen bleiben getrennt: Sie werden gezählt, aber weder hochgeladen noch in Git übernommen. Anschreiben werden nur gezählt; ohne einen belastbaren gemeinsamen Schlüssel werden sie nicht automatisch einer Bewerbung zugeordnet.
