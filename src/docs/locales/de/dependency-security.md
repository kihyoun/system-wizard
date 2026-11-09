# Sicherheit von Abhängigkeiten

Prüfen Sie die eingecheckten Lockfiles sowie die daraus gebauten Anwendungen.
Eine Entwicklungsabhängigkeit kann lokale Entwicklungsserver oder Builds betreffen,
auch wenn sie im Production-Image fehlt.

Verwenden Sie die im Repository festgelegten Node-/npm-Versionen. Führen Sie
`npm audit --json` in jedem dieser Verzeichnisse aus:

- `sync`
- `wizard`
- `project-bootstrap/templates/angular`
- `project-bootstrap/templates/react`
- `project-bootstrap/wizard-build/modern/smoke`
- `project-bootstrap/wizard-build/recipe/smoke`

Das letzte Verzeichnis ist ein aufbewahrtes historisches Rezept. Bewahren Sie dessen
Quellcode und Rezeptidentität; Änderungen an einem aktuellen verwalteten Build gehören
in ein neues unterstütztes Rezept und dessen Migrationsablauf.

Ordnen Sie einen Fund dem tatsächlichen Abhängigkeitspfad, der betroffenen Version
und dem Upstream-Sicherheitshinweis zu. Unterscheiden Sie Browseranwendung, Node-
HTTP-Client, Entwicklungsserver und Buildwerkzeug. Eine Registry-Prüfung beweist
weder, dass die Warnungsübersicht eines privaten Hostinganbieters gelesen wurde,
noch dass dessen Warnungen geschlossen sind.

## Stabile Korrekturen und Kompatibilität

Bevorzugen Sie eine korrigierte kompatible Version und erzeugen Sie das Lockfile mit
npm neu. Behalten Sie exakte direkte Versionsangaben und verwenden Sie stabile Releases.
Verwenden Sie `npm audit fix --force` nicht anstelle einer Kompatibilitätsprüfung.
Führen Sie betroffene Lint-, Typ-, Build- und Anwendungsprüfungen aus, anschließend
die vorgeschriebenen gebündelten System-Kandidaten- und Nach-Merge-Prüfungen.

Die aktuellen Korrekturen betreffen diese unterschiedlichen Pfade:

| Abhängigkeit | Relevante Verwendung | Korrigierte Auswahl |
| --- | --- | --- |
| `body-parser` | Sync verarbeitet Anfragekörper vor der Routenauthentifizierung. | `2.4.0` korrigiert [Denial of Service durch komprimierte Anfragekörper](https://github.com/advisories/GHSA-27r3-jxmh-p828). |
| `follow-redirects` | Axios-Node-HTTP-Adapter; der Browser verwendet einen anderen Adapter. | Die kompatible Lockfile-Auswahl `1.16.3` enthält die [Korrektur für vertrauliche Header](https://github.com/advisories/GHSA-mrwp-f3q8-3g9p). |
| `minimatch` | Entwicklungswerkzeuge ESLint und TypeScript ESLint. | Begrenzte `11.0.5`-Overrides enthalten die [Korrektur für Musterverstärkung](https://github.com/advisories/GHSA-g3hv-75wg-m249). |
| Angular build/Vite | Build- und Entwicklungsserverwerkzeuge der Angular-Vorlage. | Stabile Angular-build-/CLI-Version `22.2.6` wählt den korrigierten Vite-Zweig. |
| `fast-uri` | Transitive URI-/Schemaverarbeitung im Angular-Werkzeugsatz. | Eine kompatible Lockfile-Auswahl `3.1.9` korrigiert URI-Normalisierung und Schemabehandlung. |

Die `minimatch`-Overrides sind in Sync und Wizard auf `eslint`, `@eslint/config-array`
und `@typescript-eslint/typescript-estree` begrenzt. Deren übergeordnete Releases
fordern weiterhin den betroffenen 10.x-Zweig. Version 11 entfernt APIs zum Aufbau
regulärer Ausdrücke; diese Aufrufer verwenden die erhaltenen APIs `Minimatch`/`match`.
Prüfen Sie beim Ändern dieser Overrides den tatsächlichen Lint-/Konfigurationsdurchlauf
des Projekts mit der festgelegten Node-24-Laufzeit. Entfernen Sie einen Override,
sobald das übergeordnete Paket selbst eine korrigierte kompatible Abhängigkeit wählt,
und wiederholen Sie diese Prüfungen. Bewahren Sie bei Paketaktualisierungen die Lizenzhinweise Dritter.

Verwenden Sie [Renovates freigabegesteuerte Pakete](DEPENDENCY_UPDATES.md) zur weiteren
Erkennung. Ein Botvorschlag, erfolgreiches Audit oder veröffentlichtes Release gibt
Production nicht selbst frei; Release-Abnahme und bewusste Bereitstellung bleiben erforderlich.
