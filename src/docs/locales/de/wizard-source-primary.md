# Ein quellcodeführendes Wizard-Repository

Ein bestehendes Wizard-Quellcode-Repository kann auch seinen nativen Build,
Browsertests, Review-/Beta-Jobs und Production-Images verwalten. Entwicklung und
Auslieferung verwenden dann ein Projekt; ein separates Anwendungsrepository ist
nicht erforderlich. Ein optionaler GitHub-Spiegel veröffentlicht geprüften
Quellcode weiterhin über die normale CI des Repositories.

Dies ist eine ausdrückliche Betreiberübernahme, kein automatischer Quellcodeimport.
Die standardmäßige verwaltete Registrierung und ihre bisherigen Initialisierungs-/
Upgrade-Abläufe bleiben für Installationen verfügbar, die sie verwenden. Nach
der Übernahme erkennt der Wizard das kanonische Projekt anhand seiner exakten
GitLab-ID, seines Namensraums und Pfads. Quellcodeimport und alte Rezept-Upgrades
lehnen diesen Modus ab, statt Entwicklung zu überschreiben.

## Repository und aufbewahrten Zustand vorbereiten

1. Bewahre einen privaten Export des alten Projekts, alle erforderlichen
   Git-Referenzen, seine Quellcode-/Build-/Umgebungsbelege und Deployment-Prüfpunkte
   auf. Exportiere erforderliche Job-Nachweise und Registry-Images separat:
   Ein Projektexport ist keine vollständige Registry- oder CI-Artefaktsicherung.
   Merge private Deployment-Historie nicht in den öffentlichen Quellcodebranch,
   um sie aufzubewahren.
2. Stoppe aktive Review-/Beta-Umgebungen und gleiche ausstehende oder stillgelegte
   Leases ab. Verwende vor der Neuzuordnung das bestehende Hilfsprogramm zur
   Bereinigung gestoppter Umgebungen, damit alte Routenfragmente durch ihren
   verifizierten Eigentümer entfernt werden. Das Übernahmearchiv bewahrt alte
   Tombstones unverändert; neue Plätze behalten ihre Generationsuntergrenzen.
3. Prüfe `.gitlab/primary.yml` des Quellcodeprojekts. Sie muss ihre
   Quellcodeprüfungen und vorgesehene Veröffentlichungsrolle bewahren und
   erforderliche Jobs `build:wizard` und `test:wizard` mit dem geprüften allgemeinen
   Build-Rezept bereitstellen. Konfiguriere die Auslieferung ausdrücklich mit
   `WIZARD_DELIVERY_ENABLED=true` und dem erforderlichen Runner-Zugriff. Merge
   über normale Reviews mit aktivierten Bedingungen für erfolgreiche Pipelines
   und Diskussionen. Überspringe oder deaktiviere diese Bedingungen nicht.
4. Prüfe eine native **Push**-Pipeline des Standardbranches für genau den
   resultierenden Commit. Beide Auslieferungsjobs müssen erforderlich und
   erfolgreich sein. Ihre `build-evidence.json` und `wizard-evidence.json` müssen
   bei Commit, Pipeline-ID und unveränderlicher Image-Referenz übereinstimmen.
   Die Prüfungen enthalten Vitest, Lint, TypeScript, Production-Build, dargestellte
   Oberfläche, Navigation, Konfigurations-ZIP und exakte Cube-Signatur.
   Erforderliche Jobs `build:source` und `test:browser` müssen ebenfalls erfolgreich
   sein. Ein allein ausstehender, laufender, fehlgeschlagener oder abgebrochener
   `deploy:github`-Veröffentlichungsjob blockiert die private Auslieferung nicht;
   sein tatsächlicher Veröffentlichungsstatus bleibt sichtbar. Jeder andere
   nicht optionale Job muss erfolgreich sein. Keine erforderliche native Prüfung
   darf übersprungen oder ignoriert werden; normale Merge-Bedingungen bleiben aktiv.
5. Baue und prüfe einen passenden Controller/ein Hilfs-Image mit Unterstützung
   für den quellcodeführenden Modus. Bewahre das vorherige Wizard-Image auf dem
   Daemon auf. Bereite die im [Umgebungsleitfaden](../wizard-environments/README.md)
   beschriebenen privaten Umgebungsvariablen vor.

## Vorschau und Übernahme

Erstelle eine private Eingabe-JSON mit diesen Feldern und Werten aus deinem
eigenen Projekt und der verifizierten Pipeline:

```json
{
  "version": 1,
  "projectId": 42,
  "projectPath": "example/system-wizard",
  "namespaceId": 7,
  "defaultBranch": "master",
  "pipelineId": 100,
  "sourceCommit": "REPLACE_WITH_THE_EXACT_40_HEX_COMMIT",
  "imageRef": "registry.example.test/example/system-wizard@sha256:REPLACE_WITH_THE_64_HEX_DIGEST",
  "helperImage": "sha256:REPLACE_WITH_THE_REVIEWED_64_HEX_SYSTEM_IMAGE_ID",
  "ciFiles": [
    {"path": ".gitlab/primary.yml", "sha256": "REPLACE_WITH_64_HEX_SHA256_OF_EXACT_COMMITTED_BYTES"}
  ]
}
```

`ciFiles` ist ein vollständiges freigegebenes CI-Manifest, nicht nur die eine
beispielhafte Zeile. Nimm die native CI-Definition, ihren Auslieferungs-/
Umgebungsstarter, die allgemeinen Rezeptdateien unter
`.system-bootstrapper/build-v1/` und referenzierte `.gitlab/`-Skripte auf.
Berechne jeden SHA-256 aus den exakten Bytes bei `sourceCommit`. Das Hilfsprogramm
prüft diese Dateien über GitLab und validiert das reservierte allgemeine
Build-Rezept unabhängig. Künftige Änderungen an diesem Manifest erfordern einen
weiteren geprüften Bindungsvorgang; normale Anwendungsänderungen können die
bestehende Bindung unverändert verwenden.

Speichere die Eingabe und eine ablaufende GitLab-API-Zugangsdaten-Datei mit Modus
`0600` unterhalb des persistenten Konfigurationsverzeichnisses. Die Zugangsdaten-JSON
enthält `baseUrl` und `token`; ihr TLS-Ursprung muss zum konfigurierten eigenen
GitLab-Host passen. Zugangsdaten und Konfigurationsinhalte werden niemals
ausgegeben. Widerrufe die Betreiberzugangsdaten nach der Verwendung.

```sh
docker exec system_bootstrapper_1 node /system/project-bootstrap/wizard-source-primary/run.js plan /state/adoption-input.json /state/adoption-credential.json
docker exec system_bootstrapper_1 node /system/project-bootstrap/wizard-source-primary/run.js apply /state/adoption-input.json /state/adoption-credential.json PLAN_HASH
```

Prüfe den exakten Plan-Hash, alte/neue Projekt-IDs, das vorherige Production-Image,
neue Pipeline/Image und Konfigurations-Hashes. Apply prüft GitLab erneut,
erwirbt den bestehenden Umgebungs-Mutex, speichert die vollständige alte
Konfiguration/den Beleg privat unter `/state/wizard-source-primary/` und ändert
atomar nur die Projektbindung. Eine veraltete Bestätigung oder gleichzeitige
Bearbeitung schlägt fehl, ohne sie zu überschreiben. Dieselbe abgeschlossene
Übernahme erneut auszuführen ist ein verifiziertes Nichtstun.

Die Übernahme ändert weder den laufenden Production-Container noch die
Image-Fixierung. Genau das eine vorherige Image wird als ausdrücklicher
Wiederherstellungsalias aufgezeichnet, solange das alte Projekt noch existiert.
Ein anderer Digest oder ein fremdes Projekt wird nicht akzeptiert. Die
Build-Status-Aktion liest native Pipeline-Nachweise, ohne Pipelines zu erzeugen
oder Quellcode zu importieren. Eine ausstehende oder fehlgeschlagene aktuelle
Standardbranch-Pipeline wird als ungeprüft angezeigt, statt einen älteren Build
als aktuell darzustellen.

## Ein bestehendes quellcodeführendes Build-Rezept aktualisieren

Eine Controller-Aktualisierung bewahrt die bestehende Build-Reservierung.
Wähle für einen bereits übernommenen modernen Wizard in einer neuen
Übernahmeeingabe ausdrücklich `"buildProfile": "node24-vite8-ca-v4"`, um diese
Reservierung zu aktualisieren. Akzeptierte Ausgangsprofile sind `node24-vite8`,
seine Cleanup-v2- und Overview-v3-Profile sowie CA-v4 selbst. Legacy-Rezepte und
die erste Übernahme können dieses Upgrade nicht auswählen. Fehlt `buildProfile`,
bleiben das exakte bestehende Rezept und historische Eingabe-Hashes erhalten.

Öffne zuerst einen normalen Merge Request im kanonischen Wizard-Quellcodeprojekt.
Verwende das Ergebnis von `wizard-build/recipe.js` aus dem geprüften Controller
mit `generate(cube,
'node24-vite8-ca-v4')`, um jeden zurückgegebenen Eintrag `files` einschließlich
des öffentlichen CA-Pakets und Aktualisierungsskripts zu installieren. Bewahre
Anwendungsquellcode und aktualisiere die bestehende `.gitlab/primary.yml`, statt
sie durch das separate CI-Dokument des verwalteten Rezepts zu ersetzen.
Aktualisiere die Eltern der Quellcode- und Auslieferungsjobs, installiere das
eingecheckte öffentliche Paket vor Netzwerkvorgängen und setze
`NODE_OPTIONS=--use-openssl-ca` für Node-Jobs. Behalte erforderliche Quellcode-,
Browser- und Auslieferungsprüfungen, den öffentlichen Spiegel und Umgebungsjobs.
Baue und prüfe sowohl das Auslieferungsimage als auch Browser-/Job-Images neu;
eine alte erfolgreiche Pipeline ist kein Nachweis für die neuen Vertrauenseingaben.

Merge nach dem Review und prüfe die exakte Push-Pipeline des Standardbranches.
Bereite das neue vollständige Manifest `ciFiles` aus diesem Commit, seinen
unveränderlichen Image-Digest, die Pipeline-Identität und das passende geprüfte
Hilfs-Image vor. Stoppe Review/Beta und gleiche sie ab; verwende dieselben
Befehle `plan`/`apply` wie oben. Der Plan enthält alte und neue Build-Rezept-Hashes.
Apply prüft unabhängig jeden freigegebenen CI-Hash und alle allgemeinen
Rezeptbytes, bewahrt die vorherige Konfiguration und den Beleg in einem neuen
privaten Archiv und erhält kanonische Identität sowie Umgebungs-Generationsuntergrenzen.
Eine geänderte oder fehlende CA-Datei, ein fremdes Rezept oder ein erforderlicher
CI-Fehler verweigern die Bindung. Die Production-Image-Freigabe bleibt der separate
Schritt unten.

## Freigeben und das Duplikat entfernen

Lade genau das neue Image vorab über eingeschränkte Registry-Authentifizierung
und verwende den bestehenden [Production-Plan-/Apply-Ablauf](../wizard-production/README.md).
Sein Prüfer für quellcodeführende Projekte verlangt die kanonische Bindung, das
freigegebene CI-Manifest, die exakte aktuelle Push-Pipeline des Standardbranches,
erforderliche Jobs und passende Artefakte. Production bleibt eine Betreiberfreigabe;
ein Quellcode-Merge allein schaltet sie nicht um.

Prüfe die tatsächliche öffentliche Oberfläche, Review-/Beta-Bereitstellen/-Stoppen,
Konfigurationsabruf, nativen Build-Status und die kalte Image-Wiederherstellung
aus dem übernommenen Projekt. Bewahre das vorherige Image und den Rollback-
Prüfpunkt auf. Aktualisiere Wiederherstellungsanleitungen und Konfigurationssicherung,
damit ein neuer Host das neue Projekt und die Registry-Fixierung verwendet.

Lösche erst dann das doppelte Projekt, nachdem bestätigt ist, dass keine aktive
Abhängigkeit mehr besteht. Löschen entfernt seinen Registry-Endpunkt; ein
historisches Rollback-Image aus diesem Projekt muss in einem bewusst angelegten
lokalen/Offline-Archiv erhalten bleiben. Der exakte Wiederherstellungsalias
erstellt keine gelöschte Registry neu und macht alte Sicherungen nicht unabhängig davon.
