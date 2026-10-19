import JSZip from 'jszip';
import {execFileSync} from 'child_process';
import md5 from 'md5';
import Main from './Main';
import MainConfig from './MainConfig';
import Helper from './Helper';
import {environment, shellQuote, shellValue} from './Environment';
import {websiteSetupDefaults} from './WebsiteConfig';

const signed = (body: string) => Helper.textLogo + body;
const assertSignature = (data: string) => {
  expect(data[807]).toBe('$');
  expect(md5(data.slice(0, 1184))).toBe('bd4a8426355824593a5e21ad759830c1');
};
const assignments = (data: string) => Object.fromEntries(environment(data).map(([key, value]) => [key, shellValue(value)]));

test.each([
  ['', ''],
  ["'a=b=c'", 'a=b=c'],
  ['"a=b=c" # comment', 'a=b=c'],
  ["'a'\\''b'", "a'b"],
  ['unquoted\\ space', 'unquoted space'],
  // eslint-disable-next-line no-useless-escape -- Explicit shell quote fixture.
  ['"a\\$b\\`c\\\\d\\\"e"', 'a$b`c\\d"e'],
  ['"a\\q"', 'a\\q'],
  ['"first\nsecond"', 'first\nsecond']
])('literal shell values decode without truncation: %s', (input, value) => {
  expect(shellValue(input)).toBe(value);
  expect(shellValue(shellQuote(value))).toBe(value);
});

test.each(['"unterminated', '$(touch /tmp/example)', '"$HOME"', '`id`', 'value; echo broken', 'value echo broken'])('unsupported shell expression fails before import: %s', value => {
  const main = new Main();
  const before = JSON.stringify(main.asJson);
  expect(() => main.importEnvData(signed(`SEED_DIR='/changed'\nSYNC_PASS=${value}\n`))).toThrow();
  expect(JSON.stringify(main.asJson)).toBe(before);
});

test('the observed single-quoted config preserves counts, modes, URLs, TLS and runtime image pins', () => {
  const main = new Main();
  const input = signed(`export SEED_DIR='/mnt/seed'
GITLAB_EXTERNAL_URL='https://gitlab.example.test:8443/path?a=b=c'
GITLAB_REGISTRY_URL='https://registry.example.test:5443'
GITLAB_HOST='gitlab.example.test'
GITLAB_DOMAIN_MODE='2'
GITLAB_SSL='/ssl/custom/fullchain.pem'
GITLAB_SSL_KEY='/ssl/custom/privkey.pem'
GITLAB_REGISTRY_HOST='registry.example.test'
GITLAB_REGISTRY_DOMAIN_MODE='3'
GITLAB_REGISTRY_SSL='/ssl/registry/fullchain.pem'
GITLAB_REGISTRY_SSL_KEY='/ssl/registry/privkey.pem'
GITLAB_RUNNER_TOKEN='test-token=a=b'
export GITLAB_RUNNER_SCALE='1'
export SYNC_ENABLE='true'
SYNC_HOST='sync.example.test'
SYNC_USER='test-user'
SYNC_PASS='test-password=a=b'
SYNC_DOMAIN_MODE='2'
SYNC_SSL='/ssl/sync/fullchain.pem'
SYNC_SSL_KEY='/ssl/sync/privkey.pem'
WIZARD_ENABLE='true'
WIZARD_HOST='wizard.example.test'
WIZARD_DOMAIN_MODE='2'
WIZARD_SSL='/ssl/wizard/fullchain.pem'
WIZARD_SSL_KEY='/ssl/wizard/privkey.pem'
GITLAB_IMAGE='gitlab/gitlab-ce:19.4.2-ce.0'
GITLAB_RUNNER_IMAGE='gitlab/gitlab-runner:v19.4.0'
GITLAB_SSH_BIND='127.0.0.1:2222'
GITLAB_REGISTRY_BIND='127.0.0.1:5050'
FUTURE_RUNTIME_OPTION='preserve=unknown'
`);
  main.importEnvData(input);
  expect(main.config!.gitlabRunnerScale).toBe(1);
  expect(main.config!.gitlabDomainMode).toBe(2);
  expect(main.config!.gitlabRegistryDomainMode).toBe(3);
  expect(main.config!.syncDomainMode).toBe(2);
  expect(main.config!.wizardDomainMode).toBe(2);
  const jsonCopy = new MainConfig(JSON.parse(JSON.stringify(main.asJson.main)));
  expect(assignments(jsonCopy.content)).toEqual({...websiteSetupDefaults, ...assignments(input)});
  assertSignature(main.config!.content);
  assertSignature(jsonCopy.content);
});

test('raw credentials are safely quoted exactly once and survive JSON and ENV', () => {
  const config = new MainConfig({syncEnable: 'true', gitlabRunnerScale: 0});
  // eslint-disable-next-line no-useless-escape -- Explicit shell quote fixture.
  const credential = ` quote'\" equals=a=b dollar$HOME backtick\` slash\\ end `;
  config.syncPass = credential;
  config.gitlabRunnerToken = credential;
  const main = new Main();
  main.importEnvData(config.content);
  expect(main.config!.syncPass).toBe(credential);
  expect(main.config!.gitlabRunnerToken).toBe(credential);
  const restored = new MainConfig(JSON.parse(JSON.stringify(main.asJson.main)));
  expect(restored.syncPass).toBe(credential);
  expect(restored.gitlabRunnerScale).toBe(0);
});

test('project receipt, unknown options, explicit mode zero and runner token survive backup', () => {
  const main = new Main();
  main.importProjectEnvData(signed(`PROJECT_NAME='sample'
PROJECT_TEMPLATE='empty'
USE_PROD_HOST='true'
PROD_HOST='sample.test'
PROD_DOMAIN_MODE='0'
USE_BETA_HOST='false'
USE_REVIEW_HOST='true'
REVIEW_HOST='review.sample.test'
REVIEW_DOMAIN_MODE='0'
GITLAB_RUNNER_TOKEN='test=a=b'
GITLAB_RUNNER_SCALE='2'
FUTURE_PROJECT_OPTION='test=value'
# BOOTSTRAPPER_PROJECT=eyJkZWZhdWx0UHJvamVjdCI6dHJ1ZX0=
`));
  const restored = new Main();
  restored.importJson(new File([], 'bootstrapper.json'), JSON.stringify(main.asJson));
  const project = restored.projects.get('sample')!;
  expect(project.gitlabRunnerToken).toBe('test=a=b');
  expect(project.gitlabRunnerScale).toBe(2);
  expect(project.reviewDomainMode).toBe(0);
  expect(project.runtimeOptions.FUTURE_PROJECT_OPTION).toBe('test=value');
  expect(project.content).toContain('# BOOTSTRAPPER_PROJECT=eyJkZWZhdWx0UHJvamVjdCI6dHJ1ZX0=');
  assertSignature(project.content);
});

test('ZIP exports the same recoverable JSON, main ENV and project ENV', async () => {
  const main = new Main();
  main.importEnvData(signed("SEED_DIR='/mnt/seed'\nGITLAB_IMAGE='gitlab/gitlab-ce:19.4.2-ce.0'\nGITLAB_RUNNER_SCALE='1'\n"));
  main.importProjectEnvData(signed("PROJECT_NAME='sample'\nGITLAB_RUNNER_TOKEN='test=a=b'\n"));
  const zip = await JSZip.loadAsync(await main.generateZip());
  const config = JSON.parse(await zip.file('bootstrapper.json')!.async('string'));
  const env = await zip.file('.docker.env')!.async('string');
  const project = await zip.file('.projects.env/.sample.env')!.async('string');
  expect(config.main.runtimeOptions.GITLAB_IMAGE).toBe('gitlab/gitlab-ce:19.4.2-ce.0');
  expect(config.main.gitlabRunnerScale).toBe(1);
  expect(assignments(env).GITLAB_IMAGE).toBe(config.main.runtimeOptions.GITLAB_IMAGE);
  expect(assignments(project).GITLAB_RUNNER_TOKEN).toBe('test=a=b');
  assertSignature(env);
  assertSignature(project);
});

test('Cube validation remains strict for main and project imports', () => {
  const altered = signed("GITLAB_RUNNER_SCALE='1'\n").replace('https://www.system-bootstrapper.com', 'http://www.system-bootstrapper.com');
  const main = new Main();
  expect(() => main.importEnvData(altered)).toThrow('Invalid Configuration');
  expect(() => main.importProjectEnvData(altered)).toThrow('Invalid Configuration');
});


test('multiline literal values remain valid shell assignments through Fetch and Backup', () => {
  const config = new MainConfig({syncEnable: 'true'});
  config.syncPass = 'first line\nsecond=line\nthird';
  const main = new Main();
  main.importEnvData(config.content);
  expect(main.config!.syncPass).toBe(config.syncPass);
  expect(environment('VALUE=one # a comment with an unmatched "\nNEXT=two\n').length).toBe(2);
});


test('generated shell values match actual Bash semantics without executing credentials', () => {
  for (const value of ['', ' a=b ', 'first\nsecond', `apostrophe' quote" slash\\ dollar$HOME literal$(id) backtick\`id\``]) {
    const output = execFileSync('bash', ['-s'], {input: `VALUE=${shellQuote(value)}\nprintf '%s' "$VALUE"\n`, encoding: 'utf8'});
    expect(output).toBe(value);
    expect(shellValue(shellQuote(value))).toBe(output);
  }
});


test('explicit empty credentials and project tokens are retained instead of invented defaults', () => {
  const main = new Main();
  main.importEnvData(signed(`SYNC_ENABLE='true'\nSYNC_USER=''\nSYNC_PASS=''\n`));
  main.importProjectEnvData(signed(`PROJECT_NAME='emptytoken'\nGITLAB_RUNNER_TOKEN=''\n`));
  const restored = new Main();
  restored.importJson(new File([], 'bootstrapper.json'), JSON.stringify(main.asJson));
  expect(restored.config!.syncUser).toBe('');
  expect(restored.config!.syncPass).toBe('');
  expect(restored.projects.get('emptytoken')!.gitlabRunnerToken).toBe('');
});
