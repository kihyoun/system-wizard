# Ein Anwendungsprojekt erstellen

Verbinde den Wizard mit Sync, rufe die gespeicherte Konfiguration ab und öffne
**Projekte → Projekt hinzufügen**. Gib einen nicht leeren Projektschlüssel ein,
der nur ASCII-Kleinbuchstaben und Ziffern enthält. Wähle einen GitLab-Namensraum
und eine Anwendungsvorlage und konfiguriere anschließend Production-, Beta- und
Review-App-Hosts mit ihren HTTP-/HTTPS-, Zertifikats- und Deployment-Einstellungen.
Das Ziel unterhalb des Schlüssels ist der exakte Repository-Pfad; Domains ändern
ihn nicht. Bestehende gespeicherte Schlüssel werden nicht umbenannt.

Das Schlüsselfeld unterscheidet zwischen Prüfung, verfügbar, belegt und ungeprüft.
Ein lokales Duplikat oder ein belegtes GitLab-Ziel blockiert die Erstellung.
Ein API-Fehler bedeutet nicht, dass ein Name frei ist. Speichern prüft GitLab erneut;
eine konkurrierende Erstellung wird gemeldet, ohne sie zu verknüpfen, zu überschreiben
oder einen Namenszusatz anzuhängen.

## Speichern und die erste Pipeline prüfen

Speichern erstellt ein privates Repository, verwendet dessen konfigurierten
Standardbranch, installiert verwaltete CI unter `.system-bootstrapper/ci.yml`
und wählt diesen CI-Pfad aus. Die Bereitstellung läuft serverseitig über einen
authentifizierten Hintergrundjob; der Browser fragt mit kurzen Anfragen nach.
Lass das Formular bis zum Abschluss geöffnet. Eine fehlgeschlagene Anfrage kann
mit Speichern wiederholt werden. Rufe nach einem Browser-/Dienstneustart die
ausstehende Konfiguration ab und verwende **Bearbeiten → Speichern**, um denselben
Vorgang fortzusetzen.

Der private Vorgangsbeleg wird in `.projects.env/.<key>.env` gespeichert. Während
der Bereitstellung sind widersprechende Konfigurations-/Dienständerungen ausgeschlossen.
Ersetze keine ausstehende Konfiguration und lösche nicht ihren Beleg, um die
Wiederaufnahme zu umgehen.

React-, Angular- und allgemeine Webprojekte erhalten bearbeitbaren
Anwendungsquellcode, Dockerfile, NGINX-Konfiguration und passende CI. React verwendet
TypeScript/Vite; Angular verwendet seinen CLI-Build. Beide verwenden Node 24 mit
festgelegten Abhängigkeiten und Lockdateien. Allgemeines Web beginnt mit statischem
HTML/CSS/JavaScript und benötigt keinen Node-Build. `GETTING_STARTED.md` im erstellten
Repository enthält die lokalen Befehle.

Sobald das Routing bereit ist, startet Speichern die erste Pipeline. Sie baut und
veröffentlicht ein Image, führt einen HTTP-Kurztest aus und stellt automatische
Umgebungen bereit. Starte manuelle Deployment-Jobs in GitLab. Prüfe den Pipeline-Link
auf das tatsächliche Ergebnis: Ein wartender Build bedeutet nicht, dass eine
Anwendung läuft. Erneutes Speichern nimmt die erste Pipeline wieder auf, statt
Duplikate zu starten.

Ein **Leeres Repository** enthält README und erzeugte CI, aber keine laufende
Anwendung. Ergänze vor Build oder Deployment Quellcode und ein Dockerfile im
Wurzelverzeichnis, das mit dem erzeugten Docker-/Cypress-Ablauf kompatibel ist.
Umgebungs-URLs sind konfigurierte Ziele, keine Zustandsprüfungen.

Repository-ID, Pfad, URLs, Standardbranch, verwalteter CI-Pfad und Vorgangszustand
bleiben beim Abrufen und bei Konfigurations-Sichern/Öffnen erhalten. Gewöhnliche
Umgebungsänderungen verwenden den Konfigurations-/Übertragen-Ablauf; sie benennen
das Repository nicht um und schreiben eingecheckte CI nicht automatisch neu.
Prüfe Pipeline-Änderungen ausdrücklich im Repository.

## Das Systemprojekt Wizard verwalten

Beim Start mit aktiviertem konfiguriertem Wizard wird dieser als erstes
Systemprojekt registriert. Allgemein liefert seinen bestehenden Production-Host
und die Zertifikate, sodass die Registrierung keinen zweiten Proxy für diesen
Host erzeugt. Bearbeiten/Löschen und normale Umgebungsschalter sind für diesen
verwalteten Eintrag deaktiviert. Wiederholtes Starten behält das Repository und
seine serverseitig verwalteten Ablaufmetadaten. Behebe einen lokalen Schlüssel-
oder Repository-Eigentumskonflikt, bevor du den Start erneut versuchst.

Die Registrierung allein installiert ein deaktiviertes Grundgerüst. Verwende
die verwalteten Projektaktionen zum [Initialisieren des festgelegten Quellcodes](WIZARD_SOURCE.md),
[Bauen und Prüfen eines Kandidaten](WIZARD_BUILD.md) und Konfigurieren von
[Review-/Beta-Umgebungen](../project-bootstrap/wizard-environments/README.md).
Die optionalen Umgebungen sind anfangs deaktiviert und erfordern eine ausdrückliche
Host-/Zertifikatskonfiguration. Ihre Deploy-/Stop-Jobs sind manuell. Ein Kandidat
ersetzt die Production-Oberfläche nur durch das separate abgesicherte
[Freigabeverfahren des Betreibers](../project-bootstrap/wizard-production/README.md).

Übertragen/Abrufen und Öffnen/Sichern verwalten die Konfiguration unabhängig von
Harvest/Seed, das persistente Dienstdaten und Zertifikate verarbeitet. Bewahre
echte Konfigurationssicherungen privat auf; erzeugte Quellcode-Repositories sind
kein Ort für Zugangsdaten oder exportierte Konfigurationen.

## Prüfung

Baue Sync mit `cd sync && npm run build`. Die isolierte API-Regression
`node tests/gitlab/project-bootstrap.js` verwendet Port 8071 und muss in einem
entbehrlichen Container/Netzwerk-Namensraum laufen. Sie prüft Validierung,
Authentifizierung, Namensraumkonflikte, konkurrierendes Speichern, Wiederaufnahme,
Statusabfragen, den Ausschluss von Konfigurationsschreibvorgängen und Abrufen-Rundläufe.
Die Vorlagenerzeugung wird durch `node tests/gitlab/application-templates.js` geprüft.

Verwende für Wizard-Prüfungen die in `wizard/package.json` deklarierten Node-/npm-Versionen,
installiere mit `npm ci` und führe dann `npm run lint`, `npm test`, `npm run build`
und `npm run test:config-export` im Wizard-Verzeichnis aus. Die Tests prüfen
Metadaten, Zertifikats-/Deployment-Einstellungen, Schlüsselvalidierung und das
Ignorieren veralteter Antworten.

`tests/gitlab/live/project-bootstrap.js` ist ein ausdrücklich zu aktivierender
Test für eine entbehrliche Plattform. Er bezieht Sync-Zugangsdaten aus der Umgebung
und eine `PROJECT_PAYLOAD`-JSON-Datei mit `{projectKey, namespaceId, data, ci}` aus
dem Wizard-Generator. Er erstellt sein Projekt `bootstrapdemo` oder nimmt es wieder
auf, prüft gleichzeitiges/wiederholtes Speichern und Abrufen und lässt das Projekt
zur Prüfung bestehen. Richte ihn nicht auf einen fremden bestehenden Schlüssel.
Live-Prüfungen der Vorlagen befinden sich in
`tests/gitlab/live/application-templates.js` und
`tests/gitlab/live/application-templates-audit.rb`.

`tests/wizard/default-wizard.js` und
`tests/nginx/default-wizard-routing.sh` prüfen die verwaltete Registrierung und
das Verhalten mit genau einer Route; `tests/wizard/live/default-wizard.js` ist
die zugehörige authentifizierte Live-Prüfung. Lokale HTTP-Fixtures belegen weder
echtes DNS noch Zertifikatsausstellung/-erneuerung, GitLab-Job-Ausführung oder
einen erfolgreichen Production-Rollout. Prüfe diese Freigabebedingungen separat
auf einer ausdrücklich zugeordneten Testplattform.
