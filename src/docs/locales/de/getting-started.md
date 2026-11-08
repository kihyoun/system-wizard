## Ihre erste Plattform, Schritt für Schritt

Der **Bootstrapper** betreibt Ihre Plattform. Der **Wizard** konfiguriert sie im Browser. **Sync** verbindet beide. Kubernetes-Erfahrung ist nicht erforderlich.

1. [Plattform installieren](#docs/installation). Nutzen Sie lokales HTTP auf einem vertrauenswürdigen Ubuntu-/WSL2-Rechner oder wählen Sie den HTTPS-Weg für öffentliche Server.
2. [Verbinden und konfigurieren](#docs/configuration). Öffnen Sie **Wizard**, wählen Sie den Stift neben **Verbinden**, geben Sie Ihre eigene Sync-Adresse und Zugangsdaten ein und anschließend **Übernehmen → Synchronisieren → Abrufen**.
3. Prüfen Sie die Einstellungen, erstellen Sie über **Sichern** eine private Sicherung und führen Sie **Übertragen** aus. Übertragen wendet die Konfiguration an und startet die Dienste automatisch neu.
4. [Runner einrichten](#docs/runners), dann [Ihr erstes Projekt erstellen](#docs/projects). Warten Sie auf dessen Build- und Deployment-Jobs, bevor Sie seine Domain öffnen.

> **Tipp:** Beginnen Sie mit lokalem HTTP, um den Ablauf kennenzulernen. Lesen Sie die vollständige Anleitung für öffentliche Server, bevor Sie Dienste im Internet zugänglich machen.

## Zwei Arten von Backups aufbewahren

**Öffnen / Sichern** und **Abrufen / Übertragen** verwalten Konfiguration einschließlich Geheimnissen. **Harvest / Seed** schützt persistente Dienstdaten. Eine Konfigurations-ZIP enthält keine GitLab-Datenbanken oder Repositorys. Lesen Sie [Wiederherstellung](#docs/recovery), bevor Sie sich auf ein Backup verlassen.

## Ausgangspunkt prüfen

Führen Sie dies in Ihrer Ubuntu-Konsole aus:

```bash
uname -m
git --version
```

Das öffentliche Release ist für `x86_64` / `linux/amd64` vorgesehen. Das Installationskapitel beschreibt die Vorbereitung von Git und Docker, exakte Release-Parameter, das Ermitteln der Zugangsdaten und die erwarteten Prüfungen in jeder Phase.

> **Info:** Beispieldomains und Release-Platzhalter müssen zu Ihrer eigenen Bereitstellung passen. Ein eigenständiger Wizard startet weder Sync noch GitLab oder Runner.
