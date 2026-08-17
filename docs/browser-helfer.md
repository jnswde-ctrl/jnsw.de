# Browser-Helfer für die Bewerbungswerkstatt

Der Browser-Helfer ist eine lokale Chrome-Erweiterung. Er sichert die aktuell geöffnete Seite als XML, damit eine Stellenanzeige später nicht erneut über ihre URL abgerufen werden muss.

## Installation für die lokale Entwicklung

1. In Chrome `chrome://extensions` öffnen.
2. Den Entwicklermodus einschalten.
3. **Entpackte Erweiterung laden** auswählen.
4. Den Ordner `browser-helper` dieses Repositories auswählen.
5. Die Erweiterung über das Puzzleteil-Symbol an die Browser-Symbolleiste anheften.

## Nutzung

Eine Stellenanzeige öffnen und das Symbol der Erweiterung anklicken. Im Popup stehen zwei gleichwertige lokale Ausgaben bereit:

- **In Zwischenablage kopieren**: XML wird direkt zum Einfügen bereitgestellt.
- **Als TXT herunterladen**: XML wird als lokale Datei gespeichert.

Die XML-Datei enthält die Formatversion, den Erfassungszeitpunkt, URL, Seitentitel und das vollständige HTML von `document.body`.

## Datenschutz und Grenzen

Die Erweiterung sendet in dieser Version keine Daten an JNSW.DE oder an einen anderen Server. Sie verarbeitet nur die vom Nutzer aktiv geöffnete Seite. Browser-interne Seiten wie `chrome://…` dürfen Browser-Erweiterungen nicht auslesen.

Der vollständige Body enthält absichtlich auch Navigation, Cookie-Banner oder Footer. Das Herauslösen der eigentlichen Stellenbeschreibung ist eine spätere, getrennte Ausbaustufe.
