import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import Main from '../../../api/Main';
import ProjectConfig from '../../../api/ProjectConfig';
import ProjectsOverview from './ProjectsOverview';

// The export dialog's ESM syntax-highlighter is unrelated to this table behavior.
jest.mock('../dialog/DownloadReactCiDialog', () => () => null);

test('the managed Wizard appears first with its actual URL and cannot be edited or deleted here', () => {
  const main = new Main();
  main.projects.set('example', new ProjectConfig(main, {projectKey:'example'}));
  const project = new ProjectConfig(main, {projectKey:'wizard', template:'wizard',
    useProdHost:'true', prodHost:'localhost', prodDomainMode:0,
    useBetaHost:'false', useReviewHost:'false',
    repository:{systemProject:true, template:'wizard', webUrl:'http://gitlab.localhost/root/wizard', generatedCi:'scaffold'}});
  main.projects.set('wizard', project);
  const root = document.createElement('div');
  document.body.appendChild(root);
  act(() => { ReactDOM.render(<ProjectsOverview main={main} />, root); });
  const row = root.querySelector('tbody tr')!;
  expect(row.textContent).toContain('wizard · System interface');
  expect(row.textContent).toContain('http://localhost');
  expect((row.querySelector('[aria-label="edit"]') as HTMLButtonElement).disabled).toBe(true);
  expect((row.querySelector('[aria-label="delete"]') as HTMLButtonElement).disabled).toBe(true);
  act(() => { row.dispatchEvent(new MouseEvent('click', {bubbles:true})); });
  expect(root.textContent).toContain('Existing Wizard interface');
  expect(root.textContent).toContain('Beta and Review are not enabled');
  const copy = new Main();
  copy.importProjectEnvData(project.content);
  expect(copy.projects.get('wizard')!.repository.systemProject).toBe(true);
  expect(copy.projects.get('wizard')!.gitlabCi).toBe('scaffold');
  act(() => { ReactDOM.unmountComponentAtNode(root); });
  root.remove();
});
