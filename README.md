# System Wizard

System Wizard is the browser interface for
[System Bootstrapper](https://github.com/kihyoun/system). It manages platform
configuration, GitLab runners, application projects and deployment settings
through the Bootstrapper's authenticated Sync service.

The existing Wizard uses React 16, TypeScript 4, Create React App 4, MobX and
Material UI 4. Its build environment is separate from the modern application
starters it can generate.

## Use the Wizard with a Bootstrapper

Start with the [handbook](https://github.com/kihyoun/system/blob/master/docs/HANDBOOK.md)
for installation, first login, runner setup and troubleshooting. A standalone
Wizard development server does not start Sync, GitLab, the registry or runners.

1. Open **Edit** using the pencil icon next to **Connect**. Enter the Sync server
   address and credentials from your own Bootstrapper output, then select **Submit**.
   For a fresh local setup, the address is `http://localhost/sync`; after applying
   the documented configuration, it is `http://sync.localhost`.
2. Select **Synchronize → Fetch** to load the instance's saved settings and projects.
3. Review changes, use **Backup** to save a local JSON copy, and use **Push** and
   **Restart** when applying platform configuration changes.

**Open/Backup** handle configuration files in the browser. **Push/Fetch** transfer
configuration to and from the connected instance. **Harvest/Seed** handle
persistent service data and certificates; they are not needed for an ordinary
configuration backup. The existing Seed action also transfers the form's main
configuration before restoring data, so review the form before invoking it.

Configuration backups contain credentials and runner tokens. Keep them private.
Sync credentials are separate from the GitLab login.

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
use Node 24, independently of the Wizard's Node 13 toolchain.

Repeated Save resumes the same operation instead of creating duplicate projects
or initial pipelines. Repository and template metadata survive Fetch and JSON
Backup/Open. See the
[project guide](https://github.com/kihyoun/system/blob/master/docs/PROJECT_BOOTSTRAP_GUIDE.md)
for error recovery and deployment details. Ordinary edits to an existing
project's environments retain the configuration/Push workflow; they do not
rename its repository or rewrite committed CI automatically.

### The default Wizard project

With the matching System update, configured startup automatically registers
**wizard** as the first project. Fetch after setup completes to load it. Its
Production URL is the real system-interface address from General; the existing
Wizard keeps running at that address. The entry is managed under General, so
project edit/delete controls and environment switches are disabled.

The private `root/wizard` repository currently contains a README/CI registration
scaffold. It does not import Wizard source, start a pipeline or replace the UI.
Beta and Review remain disabled. Registration is idempotent and survives
Fetch, Backup/Open, Push and restart. Conflicting local keys or foreign
repositories are reported without overwriting them.

This delivery is tracked in [the registration issue](https://github.com/kihyoun/system/issues/19).
Source import, development using the local GitLab, Review/Beta and a controlled
Production rollout are tracked as the
[next expansion](https://github.com/kihyoun/system/issues/18).

## Local development

The existing Wizard has been built and tested with **Node 13.12.0**. Use that
version with the committed package-lock.json for this legacy toolchain. New
application templates do not inherit this requirement.

Install dependencies from the lockfile, then start the development server:

```bash
npm ci
npm start
```

The development server normally runs at `http://localhost:3000`. Connect it to a
running Bootstrapper's Sync service to exercise server operations. Follow the
[handbook build instructions](https://github.com/kihyoun/system/blob/master/docs/HANDBOOK.md#02-prepare-docker-and-build-the-wizard-image)
if you prefer the documented Node container build.

### Tests and production build

Run the Jest suite once and build the static production bundle:

```bash
CI=true npm test -- --watch=false --runInBand
npm run build
```

The production output is written to `build/`. The current local validation passed
12 tests across 6 suites and a Node 13 production build. Existing Hook lint and
Browserslist warnings remain. Those checks are separate from the live GitLab
starter pipelines verified in the project guide.

Cypress is a separate browser smoke test. With the development server running
and Cypress's browser/runtime dependencies installed, run:

```bash
npm run test:ci
```

Its default base URL is `http://localhost:3000` from `cypress.json`. The checked-in
spec only visits the home page; it does not validate the complete provisioning
or deployment flow. On a machine used only for Jest/build checks, dependencies
can be installed with `CYPRESS_INSTALL_BINARY=0 npm ci`; a later Cypress run still
requires its binary and runtime dependencies.

## Container and publishing workflow

The repository Dockerfile builds the Wizard with Node 13.12.0 and serves the
static result through NGINX on port 80. The Compose file defines the Wizard build
but does not publish a host port; the Bootstrapper normally supplies routing.
Updating source alone does not replace an already running Wizard image.

The existing upstream `.gitlab-ci.yml` builds and tests the Wizard, creates review
apps, deploys to the project's public domain, publishes the Docker Hub image and
performs repository/platform rollout steps. Those jobs depend on the configured
registry, credentials, networks and domains. They are distinct from the managed
CI generated for new applications and were not validated as a complete public
release by the local starter tests. The separate `Dockerhub` recipe checks out
a historical fixed commit; use the regular Dockerfile to build this checkout.

Project documentation is maintained in English. See [AGENTS.md](AGENTS.md) for
repository instructions, including the immutable System Cube signature.
