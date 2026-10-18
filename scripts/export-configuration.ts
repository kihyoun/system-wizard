/** Offline test adapter for the Wizard's actual Fetch -> Backup model. */
import fs from 'node:fs';
import Main from '../src/api/Main';

export async function exportConfiguration(inputPath: string, outputPath: string): Promise<void> {
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (typeof input.main?.data !== 'string' || !Array.isArray(input.projects)) {
    throw new Error('Expected authenticated main and project Fetch responses');
  }
  const main = new Main();
  main.importEnvData(input.main.data);
  for (const fileinfo of input.projects) {
    if (typeof fileinfo.data !== 'string') throw new Error('Invalid project Fetch response');
    main.importProjectEnvData(fileinfo.data);
    const project = Array.from(main.projects.values()).pop();
    if (!project) throw new Error('Project import failed');
    project.repository = fileinfo.repository || project.repository;
    project.namespaceId = project.repository?.namespaceId || fileinfo.namespaceId || '';
    project.bootstrapPending = fileinfo.bootstrapPending || false;
    project.template = fileinfo.template || project.repository?.template || project.template;
  }
  const archive = await main.generateZip();
  fs.writeFileSync(outputPath, Buffer.from(await archive.arrayBuffer()), {mode: 0o600, flag: 'wx', flush: true});
}

if (typeof require !== 'undefined' && require.main === module) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || process.argv.length !== 4) {
    process.stderr.write('Usage: export-configuration INPUT_JSON OUTPUT_ZIP\n');
    process.exitCode = 1;
  } else {
    exportConfiguration(input, output).then(() => {
      process.stdout.write('Wizard configuration ZIP written.\n');
    }).catch(() => {
      // Configuration, credentials and raw import errors never enter CI logs.
      process.stderr.write('Wizard configuration export failed.\n');
      process.exitCode = 1;
    });
  }
}
