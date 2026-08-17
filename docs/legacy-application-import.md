# Altbestandsimport Bewerbungswerkstatt

Die Bewerbungswerkstatt importiert den strukturierten Altbestand aus `bewerbungen.json` kontrolliert in die Datenbank des angemeldeten Kontos. Die Quelldatei bleibt außerhalb des Repositories. `bewerbungen.md` ist eine lesbare Übersicht ohne stabile Vorgangs-ID und wird deshalb nicht als Schreibquelle verwendet.

## Sicherer Ablauf

Nach der Anmeldung in der Bewerbungswerkstatt wählst du `bewerbungen.json` aus und startest den Probelauf. Die Datei wird im Browser gelesen. Anschreiben können optional gewählt werden und fließen nur als Zähler in den Bericht ein.

Der Probelauf gibt ausschließlich Zähler aus, einschließlich einer Menge pro Altstatusgruppe. Damit lässt sich die erwartete Verteilung ohne Freitexte oder personenbezogene Daten abgleichen. Erst die separate Aktion `Jetzt … Einträge übernehmen` schreibt in die Datenbank. Die Route verwendet das Sites-D1-Binding `DB`; ein direkter `wrangler d1 --remote`-Import ist absichtlich nicht vorgesehen, weil er nicht die Sites-Produktionsdatenbank adressiert.

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

Der Schlüssel `legacy-json:<alte-id>` ist pro Zielkonto stabil. Bei identischem Bestand wird der Vorgang übersprungen. Fehlt bei einer ansonsten identischen Opportunity nur die erwartete Bewerbung, wird sie nachgetragen. Abweichungen bei Unternehmen, Rolle, URL, Prüfdatum, Status oder Notiz gelten als Konflikt: Der Import stoppt vor der Schreiboperation.

Dokument- und Nachweisreferenzen bleiben getrennt: Der Browser reduziert sie vor dem Request auf einen Zähler; Namen und Pfade werden weder hochgeladen noch in Git übernommen. Anschreiben werden nur gezählt; ohne einen belastbaren gemeinsamen Schlüssel werden sie nicht automatisch einer Bewerbung zugeordnet.
