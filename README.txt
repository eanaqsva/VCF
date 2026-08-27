VCF Lerntrainer v9 - stabile deutsche Lernansicht

GitHub:
1. learning-ui-v9.js neu hochladen
2. sw.js ersetzen
3. learning-aid-de.js, readability.js und counter-fix.js gelöscht lassen

Die index.html bleibt unverändert. Die sw.js bindet die Lernansicht ein.

Stabilitätsänderung:
- Kein MutationObserver
- Keine fortlaufende DOM-Beobachtung
- Aktualisierung nur nach Klick, Änderung, Seitenanzeige oder Sichtbarkeitswechsel

Inhalt:
- Schlüsselwörter direkt in der Frage hervorgehoben
- Deutsche Erklärung als Lernzusammenfassung
- Deutsche Prüfungstipps
- Aufklappbare Hinweise zu falschen Antworten
- Englische Originalerklärung bleibt wortgetreu verfügbar
