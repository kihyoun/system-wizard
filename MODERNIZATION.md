# Wizard modernization and delivery plan

Tracked in [System #22](https://github.com/kihyoun/system/issues/22) and
[System #18](https://github.com/kihyoun/system/issues/18).

## Baseline and targets (2026-10-18)

The baseline is React 16, Material UI 4, Create React App 4, TypeScript 4,
Cypress 5 and Node 13.12. Node 13 and Create React App are obsolete. The lockfile
contains their transitive build dependencies and the UI uses legacy rendering,
JSS styling, duplicate MobX decorators and deprecated component APIs.

Use Node 24.22.0 LTS/npm 11.19.1 consistently in development, Docker and managed
CI. Replace CRA with Vite 8.3.4 while keeping the existing `build/` artifact
contract. Target React/React DOM 19.3.1, MUI 9.5.0 with Emotion/tss-react, MobX
7.0.6/mobx-react 10.0.2, TypeScript 6.0.3, Vitest 5.0.5 and Playwright 1.64.1.
TypeScript 7.0.2 is the current latest release, but typescript-eslint 8.71.2
explicitly supports versions below 6.1; pin supported TypeScript 6.0.3 until that
parser supports 7. All package versions are exact, with a new locked dependency
installation. Remove obsolete type stubs and unused CRA/Cypress dependencies.

The current versions and compatibility ranges were checked from each package's
maintainer-published npm registry metadata. Primary migration references:

- [Node release support](https://nodejs.org/en/about/previous-releases)
- [React versions](https://react.dev/versions) and
  [React 19 migration](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Vite guide](https://vite.dev/guide/)
- [Material UI migration](https://mui.com/material-ui/migration/upgrade-to-v9/)
- [tss-react makeStyles migration](https://docs.tss-react.dev/api/makestyles)
- [Vitest migration](https://vitest.dev/guide/migration.html)

## Implementation sequence

1. Pin the runtime and dependency graph. Replace CRA entry/build/test/lint
   configuration and development startup. Preserve browser downloads and SPA
   routing without adding a service worker that could retain a stale UI.
2. Migrate createRoot, MUI components and JSS to Emotion/tss-react. Use existing
   makeAutoObservable state; remove duplicate legacy decorators. Preserve all
   System Cube bytes, port 8071, Sync authentication, project creation and
   automatically managed Wizard registration.
3. Port the existing workflow regression tests to React 19/Vitest. Integrate
   #43's separately owned lossless configuration import/export fixes and tests.
4. Update Docker and managed GitLab build/test recipes together. Preserve the
   separate upstream publishing roles and explicitly configured domains. Never
   activate upstream credentials or GitHub/GitLab cutover in this migration.
5. Run locked install, typecheck, lint, existing workflow tests, production build,
   development startup and browser checks on an isolated candidate. Then commit
   the candidate to the platform's private GitLab and validate its own runner,
   registry and separate Review deployment with coordinator scheduling.

## Promotion and recovery gates

Production stays on its verified image throughout implementation. A deliberately
failed candidate build must leave that image and its HTTPS interface available.
Record successful pipeline/job/image digest and Review browser evidence before
requesting coordinator review of the precise promotion and rollback operation.
Keep the previous immutable image and matching controller, verify health before
routing, and demonstrate rollback before declaring #18/#22 complete. No merge,
issue closure or Production switch is implied by local checks.

## Validation checkpoint

The migrated checkout passes a fresh locked installation (369 packages), lint,
TypeScript checking, 58 tests in 11 suites, and the Vite production build. The
browser gate exercises the actual rendered React 19/MUI interface, Projects,
configuration ZIP download, JSON parsing, exact Cube marker/hash and SPA fallback.
The Cube text is byte-for-byte equal to the baseline. The npm registry audit
reports zero vulnerabilities at all severities for the new lockfile.

The production bundle currently emits Vite's advisory 500 kB chunk-size warning
(about 1.02 MB uncompressed, 312 kB gzip); it does not suppress the warning or
change validation severity. Syntax highlighting now loads only the three
languages used by the interface. Node 13, CRA, Cypress and obsolete type stubs
are absent from the migrated dependency graph.

#43's lossless environment/JSON/ZIP configuration model is included. Unit checks
also execute generated quoting with Bash, so the build stage deliberately uses
the pinned Debian Node image with Bash available. Browser runs require the
standard Playwright Chromium runtime libraries.

These local checks do not establish private GitLab runner/registry, Review,
Production promotion or rollback acceptance. Those are separate delivery gates
that must have recorded identities before the tracking issues can be closed.

## Offline recovery adapter

`npm run test:config-export` builds and checks a self-contained Node 24 adapter
from `scripts/export-configuration.ts` and the exact Wizard models. The output is
`build-tools/export-configuration.cjs`. It accepts a private JSON file containing
the authenticated `/config/main` response and `/config/projects` array, then
writes the same model-generated configuration ZIP with mode 0600 without
overwriting an existing file. Errors and progress never print configuration.
This adapter enables the isolated recovery test to exercise Fetch -> Backup
semantics without copying a dependency cache or adding a browser to its server.
The container includes it at
`/opt/system-bootstrapper/test-tools/export-configuration.cjs`, outside the web
root; it contains code only. The regular browser remains the production export
interface.

The first own-GitLab pipeline exposed app lint scanning generated server-owned CI
files. App lint now explicitly excludes `.system-bootstrapper/` and generated
`build-tools/`; those files are verified by their separate immutable System
recipe tests. Application, CLI and browser-test lint remain required.
