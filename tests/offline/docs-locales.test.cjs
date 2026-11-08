const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { test } = require('node:test');

test('German docs compiler rejects stale, missing, summarized or technically changed translations', async () => {
  const { compile } = await import('../../scripts/compile-docs-locales.mjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wizard-docs-locales-'));
  const source = '# Setup\n\nUse `SEED_DIR` and the [guide](#docs/recovery).\n\n| Key | Meaning |\n| --- | --- |\n| `SEED_DIR` | Backup directory |\n\n```sh\nrsync --delete "$SOURCE/" "$TARGET/"\n```\n';
  const translation = '# Einrichtung\n\nVerwenden Sie `SEED_DIR` und die [Anleitung](#docs/recovery).\n\n| Schlüssel | Bedeutung |\n| --- | --- |\n| `SEED_DIR` | Sicherungsverzeichnis |\n\n```sh\nrsync --delete "$SOURCE/" "$TARGET/"\n```\n';
  const dir = path.join(root, 'src/docs/locales/de');
  fs.mkdirSync(dir, { recursive: true });
  const content = { chapters: [{ id: 'setup', markdown: source }] };
  const contentFile = path.join(root, 'src/docs/content.json');
  const translationFile = path.join(dir, 'setup.md');
  fs.writeFileSync(contentFile, JSON.stringify(content));
  fs.writeFileSync(path.join(dir, 'sources.json'), JSON.stringify({ setup: crypto.createHash('sha256').update(source).digest('hex') }));
  try {
    fs.writeFileSync(translationFile, translation);
    assert.equal(compile(root).chapters.setup.markdown, translation);
    for (const broken of [
      translation.replace('--delete', '--archive'), translation.replace('`SEED_DIR`', '`PERSISTENT_DIR`'),
      translation.replace('#docs/recovery', '#docs/storage'), translation.replace('# Einrichtung', '## Einrichtung'),
      translation.replace('| Schlüssel | Bedeutung |', '| Schlüssel | Bedeutung | Zusätzliche Spalte |'),
      '# Einrichtung\n\nZusammenfassung.\n', source,
    ]) {
      fs.writeFileSync(translationFile, broken);
      assert.throws(() => compile(root));
    }
    fs.writeFileSync(translationFile, translation);
    content.chapters[0].markdown += '\nChanged source.\n'; fs.writeFileSync(contentFile, JSON.stringify(content));
    assert.throws(() => compile(root), /English source changed/);
    fs.unlinkSync(translationFile);
    content.chapters[0].markdown = source; fs.writeFileSync(contentFile, JSON.stringify(content));
    assert.throws(() => compile(root), /ENOENT/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
