# ADR 0001: Stellen-Opportunities und Bewerbungen trennen

- Status: Akzeptiert
- Datum: 9. August 2026
- Epic: GitHub-Issue #44
- Umsetzung: GitHub-Issues #46 bis #51

## Kontext

Die Bewerbungswerkstatt speichert derzeit jeden importierten Stellenvorschlag direkt als
`job_application`. Der fachliche Prozess beginnt jedoch früher: Eine Stelle wird zunächst gefunden,
auf Erreichbarkeit geprüft, gegen das Profil bewertet und anschließend empfohlen, zurückgestellt
oder verworfen. Viele geprüfte Stellen werden nie zu einer Bewerbung. Werden diese Vorgänge als
Bewerbung gespeichert, sind Pipeline, Statistiken und Timeline fachlich falsch.

Außerdem vermischt das bestehende Modell Daten der Stellenanzeige mit Daten der Bewerbung. Das Feld
`salary` kann beispielsweise sowohl die veröffentlichte Vergütung als auch die persönliche
Gehaltsvorstellung meinen. Ein Anzeigenstatus wie „geschlossen“ ist ebenfalls kein
Bewerbungsstatus.

## Entscheidung

Die Domäne wird in eine Stellen-Opportunity und eine optional daraus entstehende Bewerbung geteilt.

- Eine **Opportunity** bildet genau eine konkrete Stellenanzeige oder einen manuell erfassten
  Stellenhinweis ab.
- Eine **Bewerbung** entsteht erst durch eine ausdrückliche Benutzeraktion aus einer Opportunity.
- Neue Bewerbungen benötigen eine Opportunity. Bestehende Bewerbungen werden während der Migration
  jeweils mit einer erzeugten Legacy-Opportunity verknüpft.
- Eine Opportunity kann höchstens eine aktive Bewerbung besitzen. Eine erneute Ausschreibung wird
  als neue Opportunity mit eigenem Quellschlüssel behandelt.
- Anzeigenverfügbarkeit, fachliche Bewertung und Bewerbungsfortschritt bleiben getrennte Zustände.
- KI-Ergebnisse bleiben Entwürfe. Eine Analyse oder Überführung wird erst nach Bestätigung
  gespeichert.

## Fachliches Modell

### Opportunity

Die neue Entität `job_opportunities` enthält mindestens:

| Feldgruppe   | Inhalt                                                                        |
| ------------ | ----------------------------------------------------------------------------- |
| Identität    | `id`, `userId`, stabiler `sourceKey`                                          |
| Anzeige      | Unternehmen, Rolle, URL, Ort, Remote-Modell, veröffentlichte Vergütung, Frist |
| Herkunft     | Quelltyp, letzter Prüfzeitpunkt, Anzeigenstatus                               |
| Bewertung    | Prüfstatus und allgemeine Notizen                                             |
| Lebenszyklus | `createdAt`, `updatedAt`, optional `archivedAt`                               |

Ansprechpartner, Kontaktdaten und Freitexte sind privat und werden nur gespeichert, wenn sie für den
Bewerbungsprozess erforderlich sind. Der vollständige Text einer fremden Stellenanzeige wird nicht
dauerhaft übernommen. Gespeichert werden extrahierte Fakten, Quell-URL, Prüfzeitpunkt und optional
ein Hash zur Nachvollziehbarkeit.

### Bewerbung

`job_applications` bleibt für den tatsächlichen Bewerbungsprozess zuständig und erhält eine
eindeutige Referenz `opportunityId`. Stellenbezogene Felder werden langfristig aus der Opportunity
gelesen. Bewerbungsspezifisch sind insbesondere:

- Status der Bewerbung
- Gehaltsvorstellung
- Verfügbarkeit und gewünschter Arbeitsort
- Versandweg und Bewerbungsdatum
- Follow-up-Datum
- private Notizen, Dokumente und Timeline

Während der Migration dürfen bisherige redundante Felder vorübergehend bestehen bleiben. Sie werden
erst entfernt, wenn alle Lese- und Schreibpfade auf die Opportunity umgestellt und geprüft sind.

## Getrennte Zustandsachsen

### Anzeigenstatus

Der Anzeigenstatus beschreibt nur die technische beziehungsweise fachliche Verfügbarkeit der
Quelle:

- `unknown`
- `open`
- `closed`

Der Status wird zusammen mit `sourceCheckedAt` gespeichert. Eine geschlossene Anzeige verändert
nicht rückwirkend den Status einer bereits versendeten Bewerbung.

### Prüfstatus

Der Prüfstatus beschreibt die Entscheidung vor einer Bewerbung:

- `unreviewed`
- `reviewing`
- `recommended`
- `on_hold`
- `not_recommended`

Die versionierte Passungsanalyse aus Issue #48 liefert die Begründung. Der Prüfstatus allein enthält
keine KI-generierte Wahrheit, sondern die bestätigte Entscheidung des Benutzers.

Erlaubte Kernübergänge:

```text
unreviewed -> reviewing
reviewing -> recommended | on_hold | not_recommended
recommended -> reviewing | on_hold | not_recommended
on_hold -> reviewing | recommended | not_recommended
not_recommended -> reviewing
```

Archivierung ist ein eigener Lebenszyklus über `archivedAt` und kein Prüfstatus. Der Anzeigenstatus
`closed` kann unabhängig von jedem Prüfstatus gesetzt werden.

### Bewerbungsstatus

Die vorhandenen Werte bleiben der Bewerbung vorbehalten:

```text
draft -> ready -> sent -> waiting -> interview -> offer
                         |          |            |
                         +----------+------------+-> rejected
                         +----------+------------+-> withdrawn
```

`archived` bleibt vorerst aus Kompatibilitätsgründen erhalten. Mittelfristig soll auch hier
`archivedAt` den Lebenszyklus ausdrücken. Serverseitige Übergangsregeln verhindern widersprüchliche
Sprünge. Jeder bestätigte Statuswechsel erzeugt automatisch ein Timeline-Ereignis.

## Überführung in eine Bewerbung

Die Überführung erfolgt über einen eigenen serverseitigen Anwendungsfall und nicht über zwei
unabhängige Client-Requests.

1. Opportunity und Eigentümerschaft laden.
2. Prüfen, dass noch keine Bewerbung verknüpft ist.
3. Benutzerbestätigung und notwendige Startdaten validieren.
4. Bewerbung im Status `draft` anlegen und eindeutig verknüpfen.
5. Timeline-Ereignisse für Opportunity und Bewerbung schreiben.
6. Die neu angelegte Bewerbung zurückgeben.

Die Operation muss bei Wiederholung entweder dieselbe Bewerbung zurückgeben oder konfliktfrei mit
HTTP 409 antworten. Sie darf nie eine zweite Bewerbung erzeugen.

## Herkunft und Duplikaterkennung

`sourceKey` ist innerhalb eines Benutzerkontos eindeutig. Der Schlüssel wird in dieser Reihenfolge
gebildet:

1. Plattform und stabile Stellen-ID, wenn zuverlässig erkennbar
2. kanonische URL ohne Trackingparameter
3. bei manueller Erfassung ein expliziter manueller Schlüssel

Ein unsicherer Hash aus Unternehmen und Rollenbezeichnung darf nur als Warnsignal dienen, nicht als
automatischer Zusammenführungsschlüssel. Unterschiedliche Ausschreibungen derselben Rolle müssen
getrennt bleiben.

## Timeline

Opportunity- und Bewerbungsereignisse werden in getrennten Tabellen gespeichert. Eine polymorphe
Timeline ohne Datenbank-Fremdschlüssel wird verworfen, weil D1/SQLite dann die referenzielle
Integrität nicht absichern könnte.

Mindestens folgende Opportunity-Ereignisse werden strukturiert protokolliert:

- erfasst
- Quelle geprüft
- Prüfstatus geändert
- Analyse bestätigt
- in Bewerbung überführt
- archiviert

Bestehende Bewerbungsevents bleiben erhalten. Freie Notizen ergänzen strukturierte Ereignistypen,
ersetzen sie aber nicht.

## Migration

Die Schemaumstellung erfolgt in zwei sicheren Schritten:

1. `job_opportunities` und die zunächst optionale Referenz `opportunityId` anlegen.
2. Für jede bestehende Bewerbung eine Legacy-Opportunity mit `sourceKey = legacy:<application-id>`
   erzeugen und verknüpfen.

Neue Schreibpfade verlangen danach eine Opportunity. Die Datenbank- beziehungsweise
Anwendungsinvariante „höchstens eine Bewerbung je Opportunity“ wird durch einen eindeutigen Index
und serverseitige Prüfung abgesichert. Erst ein späteres Cleanup darf redundante Stellenfelder aus
`job_applications` entfernen.

Der separate Altbestandsimport aus Issue #47 nutzt fachliche Quellschlüssel und darf Legacy-Schlüssel
nur nach einem gemeldeten, bestätigten Abgleich ersetzen.

## Sicherheit und Datenschutz

- Jede Tabelle trägt `userId`; alle Abfragen prüfen Eigentümerschaft serverseitig.
- Schreibende Endpunkte behalten die Same-Origin-Prüfung bei.
- Persönliche Daten, Analysen und Dokumente bleiben außerhalb von Git, öffentlichen Logs und
  GitHub-Artefakten.
- Quelldokumente und Anhänge werden ausschließlich über die private Ablage gespeichert.
- Hard Delete bleibt als ausdrückliche Benutzeraktion möglich und löscht abhängige Datensätze per
  Cascade. Die normale Oberfläche verwendet Archivierung.

## Folgen

### Positiv

- Bewerbungsstatistiken zählen nur tatsächliche Bewerbungen.
- Geschlossene oder ungeeignete Stellen bleiben nachvollziehbar, ohne die Pipeline zu verfälschen.
- Anzeigenvergütung und persönliche Gehaltsvorstellung sind eindeutig getrennt.
- Analyse, Dokumente und Statuspflege erhalten stabile fachliche Bezugspunkte.
- Der historische Datenbestand kann kontrolliert und idempotent migriert werden.

### Kosten und Risiken

- Schema, API und UI werden komplexer.
- Die Einführung benötigt eine gestufte Migration mit vorübergehend redundanten Feldern.
- Opportunity- und Bewerbungstimeline müssen konsistent, aber getrennt gepflegt werden.
- URL-Kanonisierung darf unterschiedliche Anzeigen nicht versehentlich zusammenführen.

## Verworfene Alternativen

### Alle Vorstufen in `job_applications` aufnehmen

Verworfen, weil eine nicht empfohlene oder geschlossene Stelle keine Bewerbung ist. Statistiken,
Pflichtfelder und Statusübergänge würden dauerhaft Sonderfälle enthalten.

### Nur ein freies Statusfeld verwenden

Verworfen, weil Anzeigenverfügbarkeit, Bewertung und Bewerbung drei unabhängige Sachverhalte sind.
Ein gemeinsames Feld erzeugt widersprüchliche oder nicht auswertbare Kombinationen.

### Eine polymorphe Timeline für beide Entitäten

Verworfen, weil SQLite keine sauberen Fremdschlüssel auf unterschiedliche Zieltabellen erzwingen
kann. Getrennte Tabellen sind expliziter und sicherer.

### Vollständige Stellenanzeige dauerhaft speichern

Verworfen, weil sie für den Workflow nicht erforderlich ist und unnötige urheberrechtliche,
datenschutzrechtliche und Aufbewahrungsrisiken erzeugt.
