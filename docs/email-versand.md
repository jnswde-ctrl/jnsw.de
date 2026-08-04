# E-Mail-Versand

Transaktionale Nachrichten werden über die Mailgun-HTTP-API in der EU-Region versendet. Der Worker erhält seine Konfiguration ausschließlich über die Cloudflare-Secrets `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAIL_FROM` und `MAILGUN_API_BASE_URL`.

Bei der Registrierung wird ein zufälliger Bestätigungstoken erzeugt, ausschließlich als SHA-256-Hash in D1 gespeichert und nach 24 Stunden ungültig. Passwortkonten können sich erst nach der E-Mail-Bestätigung anmelden. Ein Anmeldeversuch mit korrektem Passwort und noch unbestätigter Adresse sendet einen neuen Bestätigungslink.

Mailgun-Tracking ist für diese Nachrichten deaktiviert. Die verifizierte Versanddomain ist `jnsw.de`; der Absender ist `service@jnsw.de`.
