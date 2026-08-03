# Design-Richtlinie: Dark Product UI

## Zielbild

JNSW.DE ist eine durchgängig dunkle Produktoberfläche. Die PDF-Werkzeug-Ansicht ist die visuelle Referenz: tiefschwarzer Grund, leicht angehobene dunkle Arbeitsflächen, feine Linien, klare Typografie und gezielt eingesetzte Akzentfarben. Helle Inhaltsbereiche werden nicht verwendet.

## Farb- und Flächenhierarchie

- `--ink` (`#08080a`) ist die tiefste Ebene für Seitenhintergründe und Hero-Bereiche.
- `--surface` (`#0d0d10`) ist die reguläre Inhaltsfläche für Abschnitte, Formulare und Fallstudien.
- `--surface-raised` (`#15151a`) ist ausschließlich für Eingabefelder und abgegrenzte, interaktive Teilflächen vorgesehen.
- `--paper` (`#f4f0e7`) dient nur als Textfarbe und für feine Kontraste, nie als großflächiger Hintergrund.
- `--blue` (`#3157ff`) kennzeichnet Navigation, Fokus und räumliche Tiefe. Es ist keine Standardfläche.
- `--acid` (`#b8ff62`) markiert die primäre Aktion, aktive Zustände und kleine Statussignale. Es wird nicht als große Inhaltsfläche eingesetzt.
- `--line` ist die einzige Standardlinie zwischen Bereichen und in Komponenten.

## Komponentenregeln

- Jede neue Seite beginnt auf `--ink` oder `--surface`; keine weißen, cremefarbenen oder hellgrauen Content-Container.
- Abgetrennte Arbeitsbereiche folgen dem PDF-Dialog: `--surface`, 1px `--line`, zurückhaltender Schatten nur bei Overlays.
- Formulare verwenden dunkle Felder auf `--surface-raised`, helle Schrift und `--line` als Rahmen.
- Primäre Buttons sind acidfarben mit dunklem Text. Sekundäre Buttons bleiben transparent, mit `--line`-Rahmen und heller Schrift.
- Karten bleiben dunkel. Varianten entstehen durch sehr dunkles Blau oder Grün, nicht durch helle Vollflächen.
- Hover darf eine Oberfläche leicht aufhellen oder mit Acid hervorheben. Fokus ist immer deutlich über den blauen Fokusrahmen sichtbar.

## Typografie und Lesbarkeit

- Manrope ist die Lesetypografie, DM Mono ist für Navigation, Metadaten und Bedienelemente reserviert, Georgia nur für sparsame editoriale Kursivakzente.
- Fließtext auf dunklem Grund nutzt `--paper` oder eine gedeckte Textfarbe wie `--muted`; nie dunklen Text auf dunklen Flächen.
- Kontrast und sichtbare Tastaturfokusse haben Vorrang vor rein dekorativer Gestaltung.

## Umsetzung und Review

- Vor einer neuen Oberfläche zuerst vorhandene Klassen, Tokens und das PDF-Dialogmuster wiederverwenden.
- Neue Farbwerte nur als Token ergänzen; keine mehrfach kopierten Hexwerte in Komponenten.
- Im Review prüfen: Gibt es eine helle Inhaltsfläche? Wird Acid großflächig eingesetzt? Sind Hover-, Fokus- und Fehlermeldungszustände auf dunklem Grund lesbar?
