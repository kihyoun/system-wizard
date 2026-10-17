import Main from './Main';
import ProjectConfig from './ProjectConfig';
import md5 from 'md5';

test('repository, deployment modes and certificates survive ENV and JSON round trips', () => {
  const main = new Main();
  const project = new ProjectConfig(main, {
    projectKey: 'sample', useProdHost: 'false', useBetaHost: 'true', useReviewHost: 'true',
    betaHost: 'beta.localhost', reviewHost: 'review.localhost', betaDomainMode: 0,
    reviewDomainMode: 3, prodDeployMode: 0, betaDeployMode: 0, reviewDeployMode: 1,
    reviewSSL: '/ssl/custom/fullchain.pem', reviewSSLKey: '/ssl/custom/key.pem',
    repository: {id: 42, namespaceId: 1, path: 'root/sample', defaultBranch: 'main',
      webUrl: 'http://gitlab.localhost/root/sample', deploymentState: 'awaiting-source'}
  });
  const content = project.content;
  expect(content.substr(807, 1)).toBe('$');
  expect(md5(content.substr(0, 1184))).toBe('bd4a8426355824593a5e21ad759830c1');
  expect(content).toContain('https://www.system-bootstrapper.com');
  const imported = new Main();
  imported.importProjectEnvData(content);
  const fetched = imported.projects.get('sample')!;
  expect(fetched.repository).toEqual(project.repository);
  expect(fetched.betaDeployMode).toBe(0);
  expect(fetched.reviewSSL).toBe('/ssl/custom/fullchain.pem');
  const copy = new Main();
  copy.importJson(new File([], 'backup.json'), JSON.stringify(imported.asJson));
  expect(copy.projects.get('sample')!.repository).toEqual(project.repository);
  expect(copy.projects.get('sample')!.reviewSSLKey).toBe('/ssl/custom/key.pem');
  expect(project.gitlabCi).toContain('$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH');
  expect(project.gitlabCi).toContain('https://$CI_COMMIT_REF_SLUG.review.localhost');
  expect(project.gitlabCi).toContain('- Dockerfile');
});

test('legacy keys remain importable without renaming', () => {
  const main = new Main();
  const project = new ProjectConfig(main, {projectKey: 'old-project'});
  main.importProjectEnvData(project.content);
  expect(main.projects.has('old-project')).toBe(true);
});

test('application template and canonical generated CI survive Fetch and JSON', () => {
  const main = new Main();
  const ci = 'canonical template CI';
  const project = new ProjectConfig(main, {projectKey:'reactapp', template:'react', repository:{template:'react', generatedCi:ci}});
  main.importProjectEnvData(project.content);
  const imported = main.projects.get('reactapp')!;
  expect(imported.template).toBe('react');
  expect(imported.gitlabCi).toBe(ci);
  const stable = (value:string) => value.split('\n').filter(line => !line.startsWith('# created on ')).join('\n');
  expect(stable(imported.content)).toBe(stable(project.content));
  const copy = new ProjectConfig(main, JSON.parse(JSON.stringify(imported.asJson)));
  expect(copy.template).toBe('react');
  expect(copy.gitlabCi).toBe(ci);
});
