# Akzeptierte Produkt-Releases

System verwendet **MAJOR.MINOR.PATCH** mit Tags `vX.Y.Z` gemäß
[Semantic Versioning](https://semver.org/): Inkompatible öffentliche Konfigurations-,
Backup-, API- oder Installationsverträge erfordern eine Hauptversion; kompatible
Funktionen verwenden eine Nebenversion, kompatible Fehler-/Sicherheitskorrekturen
eine Patchversion. Eine Datenbankmigration kann auch bei kompatiblem Betreibervertrag
Ausfallzeit und Checkpoint benötigen. Versionshinweise müssen Migrations- und
Wiederherstellungsanforderungen erklären; SemVer allein beweist keine Upgrade-Sicherheit.

**1.0.0 ist die erste unterstützte Produktbasis.** Historische Commits und Image-
Veröffentlichungen behalten ihre ursprünglichen Identitäten. `VERSION` und das
[gepflegte Änderungsprotokoll](https://github.com/kihyoun/system/blob/master/CHANGELOG.md)
werden mit jedem geplanten Release geprüft. Fehlgeschlagene Kandidaten, Wiederholungen
und gewöhnliche Pipelineläufe erhalten keine neuen Versionen. Wenn ein Quellcode-/Image-
Versuch bereits eine Version belegt, benötigt ein anderer akzeptierter Versuch eine neue geprüfte Version.

## Öffentliche Release-Inhalte

[GitHub Releases](https://github.com/kihyoun/system/releases) zeigen das Ergebnis des
vertrauenswürdigen GitLab-Ablaufs. Der öffentliche Quellcodespiegel und Docker Hub
bleiben die Verteilwege für Quellcode und Images. GitHub Actions ist kein Teil der
Veröffentlichung. Jedes stabile Release liefert:

- Ein nur neu anlegbares GitHub-Präsentationstag auf dem exakt gespiegelten akzeptierten
  System-Commit sowie benutzerbezogene Hinweise aus dem geprüften Änderungsprotokoll.
- `system-release-vX.Y.Z.json` und eine SHA-256-Begleitdatei: exakter System-Commit,
  Quellcodebaum und Wizard-Gitlink; passende öffentliche Controller-/Wizard-Referenzen,
  unveränderliche Manifest-/Konfigurations-Digests und akzeptierte Image-IDs; Nachweishash
  desselben Versuchs und geprüfte Hostkompatibilität; Installations-/Upgrade-/Wiederherstellungslinks.
- `quickstart.sh`, gebunden an das Release-Tag, und `release-notes.md`.

Das öffentliche Manifestformat lautet `system-accepted-release-v1`. Alle Daten werden
aus dem akzeptierten Kandidaten derselben Pipeline, der Docker-Hub-Veröffentlichung
und den exakten Nachweisen der Wizard-Quellcodeveröffentlichung erzeugt. Interne
Rohnachweise, private Registry-URLs, Konfiguration, Seeds, Zugangsdaten und Betriebslogs
sind keine Release-Artefakte. Metadaten und Prüfsumme stammen beide aus dem vertrauten
GitHub-Release; die Prüfsumme erkennt inkonsistente Übertragung, ist aber keine unabhängige Signaturidentität.

Beispielabruf für eine ausdrücklich ausgewählte Version:

```bash
curl -fLO https://github.com/kihyoun/system/releases/download/v1.0.0/system-release-v1.0.0.json
curl -fLO https://github.com/kihyoun/system/releases/download/v1.0.0/system-release-v1.0.0.json.sha256
sha256sum -c system-release-v1.0.0.json.sha256
```

Checken Sie die `source.revision` des Manifests aus und initialisieren Sie das festgelegte Submodul:

```bash
git clone https://github.com/kihyoun/system.git
cd system
git checkout --detach v1.0.0
git submodule update --init --recursive
git rev-parse HEAD HEAD^{tree}
git ls-tree HEAD wizard
```

Vergleichen Sie die Ausgaben mit dem Manifest. GitHubs einfache Quellcodearchive enthalten
keine Wizard-Submodulinhalte und sind daher kein vollständiger rekursiver Checkout.
Aufbewahrte Wizard-Release-Referenzen machen den festgelegten Gitlink öffentlich abrufbar,
ohne den Wizard-Standardbranch zu ändern.

Installieren Sie einen frischen Host mit der [Schnellinstallation](QUICKSTART.md), oder
übergeben Sie `images.controller.reference` und `images.wizard.reference` aus dem Manifest an
`bootstrapper/install-release.py --controller ... --wizard ... --release-metadata ...`.
Das native Installationsprogramm prüft exakte Quellcode- und geladene Image-Identitäten.
Referenzen allein bewahren keine Image-Inhalte: Halten Sie geprüfte Image-Archive vor
oder stellen Sie die Wiederherstellbarkeit öffentlicher/privater Registries während des benötigten Zeitraums sicher.

## Vertrauenswürdige Veröffentlichung und Wiederholungsverhalten

Erforderliche Komponenten-, Browser-, Kandidatenimage- und kurzlebige Plattformprüfungen,
geprüfter Merge, Prüfungen nach dem Merge, öffentliche Image-Kopie und Quellcodespiegel
bleiben in GitLab. Der geschützte native Standardbranch-Job `deploy:github-release`
läuft nach diesen Jobs; er prüft deren exakte Pipeline-/Quellcode-/Artefaktzuordnung
über die GitLab-API und anonym die Verfügbarkeit öffentlichen Quellcodes und der Images.
Er kopiert keine Images und baut nichts neu. Bestehende GitLab-Versions-Tag-Pipeline-Prüfungen
bleiben unverändert. Das reine GitHub-Präsentationstag erzeugt keine GitLab-Tag-Pipeline.

Der Publisher verwendet eine serialisierte Ressourcengruppe. Er erstellt einen Entwurf,
lädt konsistente Artefakte hoch, veröffentlicht und prüft anonymen Abruf. Eine Wiederholung
verwendet nur ein Tag am identischen Commit, identische Release-Felder und bytegleiche
Artefakte; Neuzuordnung oder Austausch werden abgelehnt. Unterbrochene Entwürfe können
durch Wiederholen desselben Versuchs abgeschlossen werden. Eine veröffentlichte Version
kann keine fehlenden oder ersetzten Artefakte erhalten. Aktivieren Sie unveränderliche
GitHub-Releases und Registry-Erkennungstags als zusätzlichen serverseitigen Schutz vor
Schreibzugriffen außerhalb dieses Ablaufs.

Konfigurieren Sie diese geschützten Variablen auf vertrauenswürdigen GitLab-Runnern:

- `GITHUB_RELEASE_PUBLISH_ENABLED=true` sowie die vorhandenen Aktivierungsflags und
  Zugangsdaten für Docker Hub, GitHub-Backup und Wizard-Quellcodeveröffentlichung.
- `GITHUB_RELEASE_REPOSITORY=kihyoun/system` (oder den öffentlichen Spiegel des Betreibers).
- `GITHUB_RELEASE_TOKEN_FILE`: externe Datei mit Modus 0600 und einem GitHub-Token mit
  auf das Release-Repository begrenztem Contents-Schreibzugriff. Ein geschütztes,
  maskiertes `GITHUB_RELEASE_TOKEN` dient als Ersatz. Die Dateiauswahl hat Vorrang.
- `SYSTEM_RELEASE_GITLAB_TOKEN_FILE`: externe Datei mit Modus 0600 und einem auf das
  Quellprojekt begrenzten GitLab-`read_api`-Token; geschütztes, maskiertes
  `SYSTEM_RELEASE_GITLAB_TOKEN` dient als Ersatz. SSH-Spiegelzugangsdaten können nicht
  über die Release-API veröffentlichen.

Halten Sie beide Tokens von nicht vertrauenswürdigem MR-Code fern sowie außerhalb
von Checkout und Artefaktpfaden. Fehlende Zugangsdaten führen zum sicheren Abbruch.
Ein vorhandener SSH-Spiegelschlüssel wird nicht als nutzbares API-Token vorausgesetzt.
Öffentliche Metadaten enthalten diese Zugangsdaten niemals.

## Upgrade und Rollback

Veröffentlichung dient Darstellung und Verteilung; sie gibt Production nicht frei.
Betreiber vorhandener Installationen verwenden akzeptierte Quellcode-/Image-Eingaben
mit den nativen Abläufen für [Controller-Freigabe](../bootstrapper/README.md),
[GitLab-Migration und Wiederherstellung aus kaltem Checkpoint](HANDBOOK.md#5-evolving-a-running-system)
und [Konfiguration-plus-Seed-Wiederherstellung](RECOVERY_CONTRACT.md).
Bewahren Sie vorherigen Controller/Image, Konfiguration, passenden Seed oder kalten
Checkpoint, Quellcode und unabhängig zugängliche Zugangsdaten auf. Ein Container-Rollback
kann keine Datenbankmigration rückgängig machen. Prüfen Sie die erklärte Kompatibilität
jedes Releases und führen Sie vor der bewussten Freigabe die vorgeschriebenen Prüfungen aus.
