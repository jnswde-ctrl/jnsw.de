# Design-Richtlinie: Dark Scroll Platform

## Zielbild

JNSW.DE ist eine durchgängig dunkle, zusammenhängende Produktoberfläche. Die PDF-Werkzeug-Ansicht ist die visuelle Referenz: tiefschwarzer Grund, leicht angehobene dunkle Arbeitsflächen, feine Linien, klare Typografie und gezielt eingesetzte Akzentfarben. Helle Inhaltsbereiche werden nicht verwendet.

Die öffentliche Startseite ist eine ruhige Scroll-Plattform, keine Sammlung aneinandergeklebter Landing Pages. Projekte, Tools, Informationen und Community folgen einer logischen Erzählung und bleiben Teil derselben visuellen Landschaft.

## Navigation und Bewegung

- Das Hauptmenü ist fest sichtbar und navigiert auf der Startseite ausschließlich zu Abschnittsankern.
- Menü-Klicks verwenden Smooth-Scroll; sie dürfen keinen Seitenwechsel auslösen.
- Der sichtbare Abschnitt wird im Menü markiert. Die Markierung ist Orientierung, keine dekorative Animation.
- Jeder Abschnitt erhält `scroll-margin-top`, damit der feste Header keine Überschriften verdeckt.
- Bewegungen bleiben kurz und funktional. `prefers-reduced-motion` respektieren.
- Detailseiten sind für direkte Links und vertiefende Inhalte erlaubt, gehören aber nicht in die primäre Plattformnavigation.

## Farb- und Flächenhierarchie

- `--ink` (`#08080a`) ist die tiefste Ebene für Seitenhintergründe und Hero-Bereiche.
- `--surface` (`#0d0d10`) ist die reguläre Inhaltsfläche für Abschnitte, Formulare und Fallstudien.
- `--surface-raised` (`#15151a`) ist ausschließlich für Eingabefelder und abgegrenzte interaktive Teilflächen vorgesehen.
- `--paper` (`#f4f0e7`) dient nur als Textfarbe und für feine Kontraste, nie als großflächiger Hintergrund.
- `--blue` (`#3157ff`) kennzeichnet Navigation, Fokus und räumliche Tiefe. Es ist keine Standardfläche.
- `--acid` (`#b8ff62`) markiert die primäre Aktion, aktive Zustände und kleine Statussignale. Es wird nicht als große Inhaltsfläche eingesetzt.
- `--line` ist die Standardlinie zwischen Bereichen und in Komponenten.

## Fließende Plattformfläche

- Die gesamte Scroll-Plattform erhält einen gemeinsamen dunklen Grund mit subtilen radialen oder linearen Verläufen.
- Abschnitte setzen sich über Abstand, Typografie und feine Linien ab, nicht über harte Hintergrundwechsel.
- Farbverläufe schaffen Tiefe, dürfen die Lesbarkeit aber nicht beeinträchtigen oder wie separate Seiten wirken.
- Karten bleiben dunkel. Varianten entstehen durch sehr dunkles Blau oder Grün, nicht durch helle Vollflächen.

## Komponentenregeln

- Abgetrennte Arbeitsbereiche folgen dem PDF-Dialog: `--surface`, 1px `--line`, zurückhaltender Schatten nur bei Overlays.
- Formulare verwenden dunkle Felder auf `--surface-raised`, helle Schrift und `--line` als Rahmen.
- Primäre Buttons sind acidfarben mit dunklem Text. Sekundäre Buttons bleiben transparent, mit `--line`-Rahmen und heller Schrift.
- Hover darf eine Oberfläche leicht aufhellen oder mit Acid hervorheben. Fokus ist immer deutlich über den blauen Fokusrahmen sichtbar.

## Typografie und Lesbarkeit

- Manrope ist die Lesetypografie, DM Mono ist für Navigation, Metadaten und Bedienelemente reserviert, Georgia nur für sparsame editoriale Kursivakzente.
- Fließtext auf dunklem Grund nutzt `--paper` oder `--muted`; nie dunklen Text auf dunklen Flächen.
- Kontrast und sichtbare Tastaturfokusse haben Vorrang vor rein dekorativer Gestaltung.

## Umsetzung und Review

- Vor einer neuen Oberfläche zuerst vorhandene Klassen, Tokens und das PDF-Dialogmuster wiederverwenden.
- Neue Farbwerte nur als Token ergänzen; keine mehrfach kopierten Hexwerte in Komponenten.
- Im Review prüfen: Gibt es eine helle Inhaltsfläche? Wirkt ein Abschnitt wie eine abgetrennte Seite? Bleibt das Menü beim Scrollen verständlich? Sind Hover-, Fokus- und Fehlermeldungszustände auf dunklem Grund lesbar?
