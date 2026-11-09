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
    const recovery = JSON.parse(await zip.file('recovery.json').async('string'));
    assert.deepEqual(json.recovery, recovery);
    assert.equal(recovery.observedRuntime.status, 'unavailable');
    assert.equal(recovery.seed.verified, false);
    assert.equal(recovery.savedImages.wizard.reference, 'registry.example.test/ui@sha256:' + 'a'.repeat(64));
    assert.match(await zip.file('RECOVERY.md').async('string'), /matching completed Seed/);
    assert.equal(json.main.runtimeOptions.WIZARD_IMAGE, 'registry.example.test/ui@sha256:' + 'a'.repeat(64));
    const second = spawnSync(process.execPath, [cli, input, output], {encoding: 'utf8'});
    assert.equal(second.status, 1, 'Existing backups must not be overwritten');
    assert.equal(second.stderr, 'Wizard configuration export failed.\n');
    assert.equal(second.stdout, '');
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});

 test('offline Fetch adapter carries supplied authenticated observation without confusing it with saved settings', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wizard-config-observation-'));
  try {
    const observation = {format: 'system-runtime-observation-v1', observedAt: '2026-01-01T00:00:00.000Z',
      status: 'partial', system: {sourceRevision: 'b'.repeat(40), release: null}, wizard: null, images: {}};
    const input = path.join(root, 'fetch.json'), output = path.join(root, 'backup.zip');
    fs.writeFileSync(input, JSON.stringify({main: {data: logo + "\nBOOTSTRAPPER_IMAGE='example/saved:tag'\n", recoveryObservation: observation}, projects: []}));
    const result = spawnSync(process.execPath, [cli, input, output], {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const zip = await JSZip.loadAsync(fs.readFileSync(output));
    const metadata = JSON.parse(await zip.file('recovery.json').async('string'));
    assert.deepEqual(metadata.observedRuntime, observation);
    assert.equal(metadata.savedImages.controller.reference, 'example/saved:tag');
    assert.equal(metadata.seed.manifest, null);
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
});
