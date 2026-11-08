import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import console from 'node:console';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

export function structure(markdown) {
  const code = [], headings = [], links = [], inline = [], tables = [];
  const prose = [];
  let fence = '', block = '';
  for (const line of markdown.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      block += line;
      if (marker?.[0] === fence[0] && marker.length >= fence.length) { code.push(block); block = ''; fence = ''; }
    } else if (marker) { fence = marker; block = line; }
    else {
      prose.push(line);
      const heading = /^(#{1,6}) (.+?)\s*$/.exec(line);
      if (heading) headings.push(heading[1].length);
      for (const match of line.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) links.push(match[1]);
      if (/^\s*\|/.test(line)) tables.push((line.match(/(?<!\\)\|/g) ?? []).length);
    }
  }
  if (fence) throw new Error('Documentation contains an unclosed fenced code block.');
  for (const match of prose.join('').matchAll(/(?<!`)(`+)([^`]*?)\1(?!`)/g)) inline.push(match[2]);
  return { code, headings, links, inline, tables };
}

export function compile(directory = root) {
  const content = JSON.parse(fs.readFileSync(path.join(directory, 'src/docs/content.json'), 'utf8'));
  const sources = JSON.parse(fs.readFileSync(path.join(directory, 'src/docs/locales/de/sources.json'), 'utf8'));
  const chapters = {};
  if (Object.keys(sources).sort().join() !== content.chapters.map(chapter => chapter.id).sort().join())
    throw new Error('German documentation must cover the complete English chapter catalog.');
  for (const chapter of content.chapters) {
    const sourceSha256 = hash(chapter.markdown);
    if (sources[chapter.id] !== sourceSha256) throw new Error(`Review the German translation of ${chapter.id} after its English source changed.`);
    const markdown = fs.readFileSync(path.join(directory, 'src/docs/locales/de', chapter.id + '.md'), 'utf8');
    const original = structure(chapter.markdown), translated = structure(markdown);
    for (const key of ['code', 'headings', 'links', 'inline', 'tables']) {
      if (JSON.stringify(original[key]) !== JSON.stringify(translated[key]))
        throw new Error(`German ${chapter.id} must preserve every code block, heading level and link target (${key}).`);
    }
    if (markdown.trim().length < chapter.markdown.trim().length * .6 || markdown === chapter.markdown)
      throw new Error(`A complete German translation is required for ${chapter.id}.`);
    chapters[chapter.id] = { sourceSha256, markdown };
  }
  return { version: 1, chapters };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = JSON.stringify(compile(), null, 2) + '\n';
    const output = path.join(root, 'src/docs/locales/de.json');
    if (process.argv.includes('--check')) {
      if (fs.readFileSync(output, 'utf8') !== result) throw new Error('Compile the reviewed German documentation with npm run docs:compile.');
      console.log('German documentation matches all English source hashes; commands, structure and links are preserved.');
    } else { fs.writeFileSync(output, result); console.log('Compiled complete German documentation.'); }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
