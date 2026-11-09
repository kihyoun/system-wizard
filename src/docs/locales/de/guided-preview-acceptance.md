# Native geführte Vorschau-Abnahme nach dem Deployment

Der geprüfte Einstieg `guided-preview-live.js` prüft die erstmalige geführte
Einrichtung auf einem ausdrücklich ausgewählten, lokal laufenden System-Controller.
Führen Sie ihn erst aus, nachdem der neue Controller akzeptiert und bewusst
bereitgestellt wurde. Er verwendet die native Wizard-Einrichtung, die
Source-Primary-Übernahme, GitLab-Pipelines und Umgebungshelfer. Er installiert
keinen Controller und führt keine Production-Promotion durch.

Diese Prüfung ist von der isolierten Plattform-Prüfschranke getrennt. Ihre privaten
Eingaben bezeichnen eine Betreiberinstanz; es gibt keinen Standardhost und keine
implizite Aktivierung in CI. Die Offline-Transportverträge belegen nicht, dass diese
echte Abnahme durchgeführt wurde. Ein erfolgreicher reiner Prüfbericht ist ein
Plan und keine bestandene Funktionsabnahme.

## Voraussetzungen

Verwenden Sie eine frische öffentliche Production-Installation mit ihrem
akzeptierten Controller-/Wizard-Image-Paar und dem aufbewahrten
Release-Installationsbeleg. Allgemeine Konfiguration, verwaltete Wizard-Registrierung,
HTTPS für GitLab und Registry, Runner-Registrierung sowie vertrauenswürdige
DNS-Einträge und Zertifikate für die exakten Hosts müssen bereits funktionieren.
Der akzeptierte unveränderliche System-Umgebungshelfer muss über das native
Verfahren bereitgestellt worden sein. Der ausgewählte Runner muss die normalen
nativen Wizard-Jobs zulassen, einschließlich der Tags `docker` und
`wizard-source-primary`. Paket-, Browser- und Image-Abhängigkeiten müssen für diese
Jobs verfügbar sein.

Wählen Sie einen Namespace und einen neuen privaten Quellprojektnamen, der noch
nicht existiert. Die öffentliche HTTPS-Wizard-Quelle oder ihr Fork muss dieselben
freigegebenen nativen CI-Erzeugerbytes wie der akzeptierte Controller-Snapshot
enthalten. Die Quellübertragung prüft öffentliches DNS und bindet Git an die geprüfte
Auflösung. Ein privater Quellendpunkt, erfundener Beleg oder veränderter CI-Erzeuger
ist keine Abkürzung zur Abnahme. Der Review-Host muss frei sein, das angegebene
Zertifikat und den Schlüssel besitzen und auf diese Installation auflösen. Beta
kann deaktiviert bleiben. Führen Sie eine unabhängige System-Quelleinrichtung
separat durch; die Wizard-Abnahme erfordert keine weitere System-Migrationspipeline.

Das Werkzeug läuft mit Node 24 auf dem Linux-Host des Betreibers und benötigt
Docker-Zugriff auf den lokalen Unix-Socket. Vor dem Lesen der nativen
Authentifizierung prüft es die vom Betreiber angegebene exakte Controller-Image-ID.
Entnehmen Sie diese ID unabhängig geprüften Deployment-/Image-Belegen. Ersetzen
Sie sie nicht durch ein beliebiges aktuelles Image, nur damit die Prüfung besteht.

## Private Eingabe und Befehle

Bewahren Sie Eingabe und Bericht außerhalb des Checkouts auf. Erstellen Sie ein
privates Betreiberverzeichnis und eine JSON-Eingabe mit Modus 0600 in dieser Form.
Ersetzen Sie sämtliche Beispielwerte:

```json
{
  "version": 1,
  "syncUrl": "https://sync.example.com",
  "gitlabUrl": "https://gitlab.example.com",
  "controllerImageId": "sha256:<64 verified hexadecimal characters>",
  "settings": {
    "version": 1,
    "namespace": "operator-team",
    "wizard": {
      "mode": "import",
      "project": "wizard-preview-source",
      "origin": "https://github.com/REPLACE_OWNER/REPLACE_REPOSITORY.git"
    },
    "review": {
      "enabled": true,
      "host": "review.example.com",
      "ssl": "/ssl/live/review.example.com/fullchain.pem",
      "sslKey": "/ssl/live/review.example.com/privkey.pem"
    },
    "beta": {"enabled": false, "host": "", "ssl": "", "sslKey": ""}
  },
  "reportPath": "/root/private-preview-acceptance/report.json",
  "timeBudgetMilliseconds": 3600000
}
```

Prüfen Sie zuerst den nativen Voraussetzungenplan:

```sh
node tests/e2e/guided-preview-live.js --check-only /root/private-preview-acceptance/input.json
```

Der reine Prüfmodus validiert das installierte öffentliche Paar, die
Production-Identität und die native DNS-/Zertifikats-/Quellen-/Runner-Vorprüfung.
Er importiert kein Repository, startet keine Quellpipeline, übernimmt keine
Bindung und stellt Review nicht bereit. Die native Authentifizierung kann während
der Vorprüfung ihre üblichen kurzlebigen API-Zugangsdaten erstellen und widerrufen.

Starten Sie die echte Abnahme bewusst, nachdem Sie ausgewählte Instanz, Quelle,
Namespace und Review-Host geprüft haben:

```sh
node tests/e2e/guided-preview-live.js --apply /root/private-preview-acceptance/input.json
```

Die Zugangsdaten gelangen aus der gespeicherten Konfiguration des ausgewählten
Controllers in den Prozessspeicher. Das GitLab-Administrator-API-Token erhält
einen eindeutigen Abnahmenamen, wird ausschließlich über die Anfrageeingabe
übergeben und nach Abschluss oder Fehler widerrufen. Weder Token noch Passwort
oder privater Schlüssel sind in Befehlsargumenten oder der Eingabedatei erforderlich.
Rohe Unterprozessfehler, Job-Traces und HTTP-Antwortinhalte werden aus Berichten
ausgeschlossen. Der Bericht ist privat, weil er betreiberspezifische Projekt- und
Job-IDs erfasst.

## Prüfzusicherungen und aufbewahrte Ergebnisse

Die Anwendung verlangt eine anfängliche verwaltete Registrierung und noch nicht
vorhandene Zielprojekte. Der echte native Import erstellt frische Projekt-IDs auf
der eigenen Instanz und eine normale Push-Pipeline des Standardbranches. Das
Werkzeug wartet auf die erfolgreichen erforderlichen Jobs `build:source`,
`test:browser`, `build:wizard` und `test:wizard` auf echten Runnern. Es liest ihre
echten Artefakte und verwendet den nativen Nachweisvertrag, um Quellcommit,
Pipeline-/Image-Identität, freigegebene Erzeugerprüfsummen und Projekt-Merge-Schranken
zu prüfen, bevor die Übernahme akzeptiert wird.

Das Werkzeug setzt die Einrichtung über dieselbe authentifizierte API fort. Es
erstellt anschließend einen eigenen Branch und Entwurfs-MR, wartet auf dessen
normale native Prüfungen und startet die tatsächlichen manuellen Review-Deploy-
und Stop-Jobs. Sowohl der Standard-Push- als auch der MR-Kontext sind durch den
bestehenden Produktvertrag erforderlich. Es wird kein alternativer CI-Erzeuger
und keine System-Pipeline eingeführt. Geprüft werden die geroutete HTTPS-Seite,
der laufende Kandidatencontainer, die kanonische Deployment-Identität und die
Entfernung nach Stop.

Die exakten Hauptkonfigurationsbytes und die laufende unveränderliche
Production-Image-ID müssen durchgehend unverändert bleiben. Die
Source-Primary-Bindung und die gewünschten Vorschau-Einstellungen der Einrichtung
bleiben bewusst konfiguriert. Quellprojekte, Branch, Entwurfs-MR und
Pipeline-Nachweise bleiben zur Prüfung erhalten; das Werkzeug löscht weder die
kanonische Quelle noch akzeptierte Historie. Nur vorübergehende Zugangsdaten und
das eigene Review-Deployment werden bereinigt.

Ein bestandener Anwendungsbericht enthält `acceptancePassed: true`. Lesen Sie seine
einzelnen Phasenergebnisse und echten Projekt-/Pipeline-/Job-IDs, bevor Sie die
Abnahme festhalten. Ein unterbrochener oder fehlgeschlagener Lauf bleibt
unvollständig, auch wenn einige native Jobs bestanden wurden. Prüfen Sie vor einer
Reparatur den gespeicherten geführten Einrichtungsstatus, die Quellprojekte und die
exakte Review-Generation. Falls der Stop-Job fehlgeschlagen ist, verwenden Sie das
bestehende native Stop-/Abgleichverfahren für diese eigene Generation. Entfernen
Sie niemals eine aktive Umgebungssperre und wiederholen Sie die Einrichtung nicht
mit einem anderen Quellnamen, um einen Eigentumskonflikt zu umgehen.
