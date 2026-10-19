# System Wizard

System Wizard is the browser interface for
[System Bootstrapper](https://github.com/kihyoun/system). It manages platform
configuration, GitLab runners, application projects and deployment settings
through the Bootstrapper's authenticated Sync service.

The Wizard uses React 19, TypeScript 6, Vite 8, MobX and Material UI.
Use the Node/npm versions pinned in `package.json` and `.nvmrc` with the committed
lockfile. Application starters have their own generated build definitions.

## Use the Wizard with a Bootstrapper

Start with the [handbook](https://github.com/kihyoun/system/blob/master/docs/HANDBOOK.md)
for installation, first login, runner setup and troubleshooting. A standalone
Wizard development server does not start Sync, GitLab, the registry or runners.

1. Open **Edit** using the pencil icon next to **Connect**. Enter the Sync server
   address and credentials from your own Bootstrapper configuration, then select **Submit**.
   For a fresh local setup, the address is `http://localhost/sync`; after applying
   the documented configuration, it is `http://sync.localhost`.
2. Select **Synchronize → Fetch** to load the instance's saved settings and projects.
3. Review changes, use **Backup** to save a local JSON copy, and use **Push** to
   apply platform configuration changes. A successful ZIP Push automatically restarts
   the Bootstrapper; wait for the interface to return and reconnect.

**Open/Backup** handle configuration files in the browser. **Push/Fetch** transfer
configuration to and from the connected instance. **Harvest/Seed** handle
persistent service data and certificates; they are not needed for an ordinary
configuration backup. The existing Seed action also transfers the form's main
configuration before restoring data, so review the form before invoking it.

Configuration backups contain credentials and runner tokens. Keep them private.
Sync credentials are separate from the GitLab login. The controller logs confirm
that authentication is configured without printing its values. Follow the
handbook to read your effective credentials locally; saved configuration can
override the generated first-setup defaults.

Runner count controls independent managers sharing the configured GitLab runner
registration. Open the runner's detail page in GitLab to see its managers. Manager
system IDs have separate persistent directories; ordinary container recreation
reuses them. An offline manager entry can represent retained capacity from an
earlier pool size and does not by itself require deregistration.

### First-setup suggestions

If no main configuration exists, Fetch requests derived suggestions from the
updated Sync API instead. Existing NGINX routes take precedence over suggestions
based on the connection hostname. Both components must support
`GET /config/suggestions`; an older server does not provide this fallback.

Suggested fields carry an asterisk and a tooltip asking you to verify their
values before pushing. Unknown values, passwords and runner tokens remain empty.
No suggestions are pushed automatically, and they do not configure DNS or prove
that certificates exist. Saved server configuration always takes priority.
Loading saved settings clears the derived markers; JSON Backup/Open preserves
markers already present in the local configuration.

## Create an application project

Connect to Sync, Fetch the configuration, then select **Projects → Add Project**.
Choose a GitLab namespace and enter a nonempty Project Key containing only
lowercase ASCII letters and digits. The key determines the exact repository name
and path; environment domains are independent settings. Existing stored keys are
not renamed.

Choose an **Application template**:

| Template | Generated files |
| --- | --- |
| React + TypeScript + Vite | React source, Vite build settings, pinned dependencies and lockfile, Dockerfile and managed CI |
| Angular + TypeScript | Angular source, CLI build settings, pinned dependencies and lockfile, Dockerfile and managed CI |
| General web project | HTML, CSS and JavaScript, NGINX runtime, Dockerfile and managed CI; no Node build |
| Empty repository | README and managed CI; add your own application source and Dockerfile later |

Configure enabled **Production**, **Beta** and **Review Apps** environments,
including their HTTP/HTTPS and automatic/manual deployment settings. **Save**
creates a private repository through Sync. Availability checks distinguish an
occupied destination from a failed lookup; existing repositories are not adopted
or overwritten. Setup runs asynchronously and reports progress while the browser
polls with short requests.

For the three application starters, Sync installs the source and matching CI,
configures routing, then starts the first pipeline. The pipeline builds and
publishes the image, checks its HTTP response and deploys automatic environments.
Start manual deployment jobs in GitLab yourself. The empty option waits for a
root Dockerfile before running the application workflow.

Expand the project row to open its repository and pipeline links. Wait for the
build and deployment jobs to succeed before checking an application domain;
repository creation alone does not confirm a running application. Generated
source, Dockerfile and CI remain editable. Each starter includes a
GETTING_STARTED.md with local development commands. React and Angular starters
use their own pinned Node 24 toolchain.

Repeated Save resumes the same operation instead of creating duplicate projects
or initial pipelines. Repository and template metadata survive Fetch and JSON
Backup/Open. See the
[project guide](https://github.com/kihyoun/system/blob/master/docs/PROJECT_BOOTSTRAP_GUIDE.md)
for error recovery and deployment details. Ordinary edits to an existing
project's environments retain the configuration/Push workflow; they do not
rename its repository or rewrite committed CI automatically.

### The default Wizard project

Configured Bootstrapper startup automatically registers
**wizard** as the first project. Fetch after setup completes to load it. Its
Production URL is the real system-interface address from General; the existing
Wizard keeps running at that address. The entry is managed under General, so
project edit/delete controls and environment switches are disabled.

The private `root/wizard` repository starts with a README/CI registration
scaffold. Automatic registration does not import Wizard source, start a pipeline
or replace the UI.

Expand the Wizard row and select **Initialize
Wizard source**. The preview identifies the private repository, pinned source
revision and file count. **Import source** explicitly installs that revision;
opening the preview alone changes nothing. The original scaffold README stays
in place; the source README is stored separately. Conflicting repository files
are never overwritten. Retry the action after a reported interruption to
recover the same source import.

The source-import action imports source only: managed CI remains disabled, no pipeline is
started, and Production, Beta and Review deployments are unchanged. See the
[source initialization guide](https://github.com/kihyoun/system/blob/master/docs/WIZARD_SOURCE.md)
for prerequisites, state and recovery. The separate build action is described below.
Registration is idempotent and survives Fetch, Backup/Open, Push and restart.
Conflicting local keys or foreign repositories are reported without overwriting
them. Review/Beta environments and Production promotion have separate controls;
source import alone does not enable them.

### Build and verify the imported Wizard

Expand the managed Wizard row and select
**Build and verify Wizard**. Its preview identifies the owned repository,
imported source commit and recipe version. **Enable build pipeline** explicitly
installs the managed build recipe and starts or recovers its initial pipeline.
Opening the preview alone does not activate anything. **Refresh status** updates
the recorded pipeline and required checks. A verified candidate image appears
only after the controller validates the required job and artifact evidence.

For a pending, installed or temporarily unverifiable operation, review
**Refresh preview** before using **Resume activation**. A status refresh or
failed request invalidates the previous preview confirmation. The server still
enforces ownership, expected content and durable pipeline identity.

An uncertain pipeline-creation outcome offers refresh and administrator
inspection only. Do not clear its checkpoint or start another activation to
work around it. Failed verification hides previous artifact claims until
verification succeeds again. Source initialization is separate from this build
operation; after enabling CI, use the build/status action rather than repeating
source import.

The managed build recipe selects a toolchain profile for the imported source;
the Vite source uses the Node 24/Vite profile. Build verification alone does not
promote Production. Review/Beta require explicit environment configuration, and
Production uses the guarded operator plan/apply/rollback workflow. See the
[managed build guide](https://github.com/kihyoun/system/blob/master/docs/WIZARD_BUILD.md),
[environment guide](https://github.com/kihyoun/system/blob/master/project-bootstrap/wizard-environments/README.md)
and [Production guide](https://github.com/kihyoun/system/blob/master/project-bootstrap/wizard-production/README.md).

## Local development

Use Node 24.22.0 and npm 11.19.1 (`.nvmrc`, `engines` and `packageManager`).
Install the exact dependency graph and start the Vite development server:

```bash
npm ci
npm start
```

Vite serves development at `http://localhost:5173`. Connect to an explicitly
chosen Bootstrapper Sync endpoint to exercise authenticated operations. Use the committed dependency versions and configuration when reproducing builds.

Run the checks and build the production SPA into the existing `build/` directory:

```bash
npm run lint
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:ci
```

Vitest covers configuration and workflow regressions. Playwright checks the
rendered interface, navigation, backup download and SPA fallback. Set
`WIZARD_BASE_URL` to check an already running isolated candidate instead of
starting the local preview server.

## Container and publishing workflow

The Dockerfile uses the same Node/npm versions and locked installation, checks
lint/tests/types, and serves the built SPA through NGINX on port 80. Updating
source does not replace the running image. Keep the last verified immutable
image for recovery and validate separate candidates before Production rollout.

The upstream CI preserves distinct Review, Production, Docker Hub, GitHub mirror
and platform-update roles. Public domains and publishing credentials remain
operator configuration; the managed private-GitLab build/environment recipe is
separate and does not invoke upstream publishing credentials.

### GitLab source-primary workflow

A clean source repository can explicitly select `.gitlab/primary.yml` in its
GitLab **CI/CD configuration file** setting. This runs lint, unit tests,
TypeScript/Vite build and signed configuration-export checks, then Playwright
against that exact build artifact in a disposable loopback preview. The existing
`.gitlab-ci.yml` publishing jobs and private managed delivery recipe stay separate.
This source pipeline never deploys Production, Review or Beta or updates System's
Wizard gitlink automatically.

Its opt-in `deploy:github` job forwards the exact successful protected default-
branch push commit to one configured existing GitHub branch, after both required
checks. Set `GITHUB_BACKUP_ENABLED=true`, `GITHUB_BACKUP_SOURCE_PROJECT`,
`GITHUB_BACKUP_REMOTE` and `GITHUB_BACKUP_BRANCH` as reviewed protected variables.
Supply the write-enabled repository deploy key as protected file variable
`GITHUB_SSH_PRIVATE_KEY` (an existing multiline key is also supported) and verified
GitHub host keys as protected file variable `GITHUB_SSH_KNOWN_HOSTS`. Host keys
must be verified independently; jobs never discover or trust them with keyscan.
Failures remain visible and retryable. The job forwards no tags, side branches
or deletions and never force-pushes or rewrites `origin`.

Keep source-primary history distinct from a managed delivery repository's private
scaffold, configuration and deployment ancestry. Transfer reviewed source changes
deliberately without overwriting managed files or receipts; record the mapping
between the merged source commit and delivery commit privately. The managed
delivery pipeline then supplies its own build/test/image evidence for the separate
manual Production promotion. See the
[primary/backup guide](https://github.com/kihyoun/system/blob/master/docs/GITLAB_GITHUB_BACKUP.md)
for history, credentials, serialization, gitlink ordering and recovery policies.

Project documentation is maintained in English. See [AGENTS.md](AGENTS.md) for
the immutable System Cube signature, which must remain unchanged in generated and imported configuration.
