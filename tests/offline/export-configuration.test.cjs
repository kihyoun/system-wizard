const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const {test} = require('node:test');
const JSZip = require('jszip');
const logo = fs.readFileSync('src/api/Helper.tsx', 'utf8').match(/return `([\s\S]*?)`;/)[1];
const cli = path.resolve('build-tools/export-configuration.cjs');

test('offline adapter executes actual Wizard models and writes a signed private backup without browser or network', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wizard-config-export-'));
  try {
    const input = path.join(root, 'input.json'), output = path.join(root, 'bootstrapper.zip');
    fs.writeFileSync(input, JSON.stringify({main: {data: logo + "\nSEED_DIR='/mnt/seed'\nGITLAB_RUNNER_SCALE='0'\nWIZARD_IMAGE='registry.example.test/ui@sha256:" + 'a'.repeat(64) + "'\n"}, projects: []}));
    const result = spawnSync(process.execPath, [cli, input, output], {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'Wizard configuration ZIP written.\n');
    assert.equal(fs.statSync(output).mode & 0o777, 0o600);
    const zip = await JSZip.loadAsync(fs.readFileSync(output));
    const env = await zip.file('.docker.env').async('string');
    assert.equal(env[807], '$');
    assert.equal(crypto.createHash('md5').update(env.slice(0, 1184)).digest('hex'), 'bd4a8426355824593a5e21ad759830c1');
    const json = JSON.parse(await zip.file('bootstrapper.json').async('string'));
    assert.equal(json.main.gitlabRunnerScale, 0);
    assert.equal(json.main.runtimeOptions.WIZARD_IMAGE, 'registry.example.test/ui@sha256:' + 'a'.repeat(64));
    const second = spawnSync(process.execPath, [cli, input, output], {encoding: 'utf8'});
    assert.equal(second.status, 1, 'Existing backups must not be overwritten');
    assert.equal(second.stderr, 'Wizard configuration export failed.\n');
    assert.equal(second.stdout, '');
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});
