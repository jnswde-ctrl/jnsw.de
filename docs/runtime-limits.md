# Laufzeitgrenzen

Die Sites-Worker-Laufzeit begrenzt PBKDF2 auf 100.000 Iterationen. Passwort-Hashes werden deshalb mit PBKDF2-SHA-256 und genau 100.000 Iterationen erzeugt.

Eine h?here Iterationszahl verursacht beim Anlegen eines Passwortkontos einen Fehler der Worker-Web-Crypto-Implementierung.
