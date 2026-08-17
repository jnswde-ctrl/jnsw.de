# Browser-Helfer für die Bewerbungswerkstatt

Der Browser-Helfer ist eine lokale Chrome-Erweiterung. Er sichert eine bereits geöffnete Stellenanzeige als XML. So bleibt der Inhalt erhalten, auch wenn die Bewerbungswerkstatt dieselbe Seite später über ihre URL wegen Bot-Schutz, Anmeldung oder dynamisch geladenen Inhalten nicht mehr zuverlässig abrufen kann.

Die Erweiterung verarbeitet nur die Seite, die du selbst geöffnet hast. Sie sendet in dieser ersten Version keine Daten an JNSW.DE und startet keine KI-Auswertung.

## Einmalig installieren

Die erste Version ist für die lokale Nutzung während der Entwicklung gedacht und wird noch nicht über den Chrome Web Store verteilt.

1. Stelle sicher, dass sich dein lokales JNSW.DE-Repository auf dem Stand befindet, der den Ordner `browser-helper` enthält.
2. Öffne in Chrome die Adresse `chrome://extensions`.
3. Schalte oben rechts den **Entwicklermodus** ein.
4. Klicke auf **Entpackte Erweiterung laden**.
5. Wähle den Ordner `browser-helper` innerhalb deines JNSW.DE-Repositories aus – nicht den gesamten Projektordner.
6. Öffne das Puzzleteil-Symbol in der Chrome-Symbolleiste und hefte **JNSW.DE Browser-Helfer** an.

Danach ist das Symbol immer sichtbar, während Chrome geöffnet ist.

## Eine Stellenanzeige erfassen

1. Öffne die Stellenanzeige im Browser und warte, bis ihr Inhalt geladen ist.
2. Klicke auf das Symbol **JNSW.DE Browser-Helfer**.
3. Wähle eine Ausgabe:
   - **In Zwischenablage kopieren**: XML steht danach zum Einfügen in ein anderes Programm bereit.
   - **Als TXT herunterladen**: Chrome speichert den XML-Text als lokale Datei. Das ist praktisch zum Archivieren oder für eine spätere manuelle Weiterverarbeitung.
4. Prüfe die Erfolgsmeldung im Popup.

Die erzeugte XML-Datei enthält URL, Seitentitel, Erfassungszeitpunkt, Formatversion und das vollständige HTML von `document.body`.

## Selbst testen

Nach der Installation solltest du den Ablauf einmal mit einer unkritischen, öffentlich erreichbaren Seite prüfen:

1. Öffne eine Testseite oder eine echte Stellenanzeige.
2. Kopiere den Export in die Zwischenablage und füge ihn in einen leeren Texteditor ein.
3. Kontrolliere, ob ein XML-Dokument mit `<jnsw-page-capture>`, `<url>`, `<title>` und `<body-html>` entstanden ist.
4. Wiederhole den Test mit **Als TXT herunterladen** und öffne die gespeicherte Datei im Texteditor.
5. Öffne testweise eine Browser-interne Adresse wie `chrome://settings`. Die Erweiterung muss dort eine verständliche Fehlermeldung zeigen, weil Chrome solche Seiten vor dem Auslesen schützt.

Für die erste Version genügt es, den Ablauf an zwei unterschiedlichen Seiten zu prüfen. Notiere dabei, ob Titel, URL und Seiteninhalt plausibel übernommen wurden.

## Aktualisieren

Die lokal geladene Erweiterung aktualisiert sich nicht selbst.

1. Aktualisiere dein lokales JNSW.DE-Repository auf den gewünschten Stand.
2. Öffne `chrome://extensions`.
3. Suche die Karte **JNSW.DE Browser-Helfer** und klicke auf das Aktualisieren-Symbol.
4. Wiederhole den kurzen Selbsttest, besonders nach Änderungen am Exportformat.

## Datenschutz und bekannte Grenzen

- Es findet in dieser Version kein Upload zu JNSW.DE oder einem anderen Server statt.
- Erfasst wird absichtlich der vollständige `document.body`. Dadurch können Navigation, Cookie-Banner oder Footer im Export stehen.
- Browser-interne Seiten wie `chrome://…` dürfen Erweiterungen nicht auslesen.
- Die Erweiterung umgeht weder Captchas noch Paywalls, Login-Pflichten oder Bot-Schutz. Sie verarbeitet lediglich das, was du im geöffneten Browser selbst sehen darfst.
- Der Export wird noch nicht direkt in die Bewerbungswerkstatt importiert. Dieser Schritt ist eine spätere Ausbaustufe.
