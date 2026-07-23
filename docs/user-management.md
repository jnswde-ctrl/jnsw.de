# Benutzerverwaltung

Die Anwendung unterst�tzt zwei Anmeldewege: **E-Mail/Passwort** und **�Mit ChatGPT anmelden�**. Windows-Benutzerkonten spielen keine Rolle. Ein Konto wird �ber seine E-Mail-Adresse zusammengef�hrt, wenn beide Anmeldewege dieselbe Adresse verwenden.

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Konto mit E-Mail, Anzeigename und Passwort erstellen |
| `POST` | `/api/auth/login` | Mit E-Mail und Passwort anmelden |
| `POST` | `/api/auth/logout` | Sitzung beenden |
| `GET` | `/api/account` | Eigenes Profil laden/erzeugen |
| `PATCH` | `/api/account` | Anzeigenamen �ndern |
| `GET` | `/api/admin/users?limit=50&offset=0` | Benutzerliste (Admin) |
| `PATCH` | `/api/admin/users/:id` | Rolle oder Status �ndern (Admin) |

Passw�rter m�ssen mindestens 12 Zeichen lang sein und werden mit PBKDF2-SHA-256 (600.000 Iterationen, individuellem Zufallssalt) gespeichert. Sitzungen sind zuf�llig generiert, werden nur gehasht gespeichert und liegen in `HttpOnly`, `Secure`, `SameSite=Lax` Cookies. Schreibende Anmelde-Endpunkte pr�fen zus�tzlich die Origin.

## Erg�nzungen vor �ffentlichem Launch

F�r �Passwort vergessen� und E-Mail-Verifikation wird ein E-Mail-Versanddienst ben�tigt. Diese Endpunkte sind absichtlich noch nicht vorhanden, da ohne einen konfigurierten Versandweg keine sicheren Reset-Links zugestellt werden k�nnen.

## Erstes Administratorkonto

Nach dem Deployment einmal mit dem vorgesehenen Konto anmelden. Anschlie�end in D1 ausf�hren:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
