# Visuelle Prüfung

## Zweck

Oberflächenänderungen werden zusätzlich zu automatisierten Tests auf einer echten, lokalen Browseransicht geprüft. Die Prüfung dient dem Erkennen von Layoutfehlern, Überläufen und nicht sichtbaren Interaktionszuständen.

## Lokale Vorschau bereitstellen

In einem eigenen Terminal im Projektverzeichnis starten:

```bash
npm run dev
```

Die Vorschau ist erreichbar, sobald vinext die lokale URL ausgibt (üblicherweise `http://localhost:3000`). Das Terminal bleibt während der Prüfung geöffnet. `Start-JnswLocal.ps1` ist kein Bestandteil dieses Repositories und wird nicht vorausgesetzt.

## Prüfumfang

Bei jeder betroffenen Oberfläche werden mindestens diese Ansichten kontrolliert:

| Ansicht |  Breite | Prüfpunkte                                                                                   |
| ------- | ------: | -------------------------------------------------------------------------------------------- |
| Desktop | 1440 px | Lesbarkeit, Flächenhierarchie, Abstände, vollständige Interaktionszustände                   |
| Mobil   |  390 px | Kein horizontaler Überlauf, mindestens 44 px große Bedienelemente, keine überdeckten Inhalte |

Zusätzlich prüfen, sofern vorhanden:

- Tastaturnavigation und sichtbare `:focus-visible`-Zustände.
- Formulare: Lade-, Fehler- und deaktivierte Zustände.
- Scroll-Plattform: festes Menü, korrekte Abschnittsmarkierung und Navigation ohne Seitenwechsel.
- Geschützte Seiten: Zugriff nur mit der erwarteten Anmeldung und Rolle.

## Arbeitsablauf

1. Änderungen bauen und automatisierte Prüfungen ausführen.
2. Den lokalen Entwicklungsserver nach obigem Ablauf laufen lassen.
3. Die betroffenen Routen in Desktop- und Mobilbreite prüfen.
4. Befunde vor dem Abschluss beheben oder als bekannte Einschränkung dokumentieren.

Der Browserzugriff wird nur für diese Sichtprüfung verwendet; sensible Browserdaten wie Cookies, gespeicherte Zugangsdaten und lokale Speicherinhalte werden nicht ausgelesen.
