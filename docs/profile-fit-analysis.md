# Evidenzbasierte Stellenanalyse

Eine Analyse ist ein unveränderlicher Entwurf. Jede neue oder korrigierte Bewertung wird als
neue Version gespeichert; `supersedesAnalysisId` stellt den Bezug zur korrigierten Version her.
Anforderungen gehören zu genau dieser Analyseversion.

Positive Aussagen sind Stärken sowie Anforderungen mit `met` oder `partial`. Sie enthalten je
eine Liste eigener Karriere- oder Projektbelege. Lernfelder sind keine positiven
Erfahrungsaussagen und dürfen ohne Beleg erfasst werden; Erfahrungs-Kompetenzen nicht.

## Bewertung

`profileVersion` identifiziert den unveränderlichen Profilstand der Analyse und wird mit ihr persistiert.

Die Skala ist `0-100`: 0-39 bedeutet wesentliche unbelegte Muss-Anforderungen, 40-69 eine
teilweise Passung mit klaren Lücken oder Risiken und 70-100 eine weitgehend belegte
Muss-Passung. Die Empfehlung (`recommended`, `on_hold`, `not_recommended`) muss mit Stärken,
Lücken und Risiken begründet werden. Modell- und Prompt-Version sind Pflichtfelder.

Ein Entwurf wird erst nach einer expliziten Benutzerbestätigung zur Übernahme freigegeben.
Bestätigungen sind separate, unveränderliche Datensätze; sie ändern den Analyseentwurf nicht.
