import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import WizardSourceDialog from './WizardSourceDialog';

test('preview is read-only; confirmation imports the previewed manifest', async () => {
  const projectRequest = jest.fn().mockResolvedValueOnce({
    manifestHash  : 'previewed',
    sourceRevision: 'source-revision',
    fileCount     : 73,
    repository    : { path: 'root/wizard' }
  }).mockResolvedValueOnce({ message: 'Pinned Wizard source imported.' });
  const root = document.createElement('div'); document.body.appendChild(root);
  await act(async () => {
    ReactDOM.render(<WizardSourceDialog sync={{ projectRequest }} onClose={jest.fn()} />, root);
  });
  expect(projectRequest).toHaveBeenCalledTimes(1);
  expect(projectRequest).toHaveBeenCalledWith('/projects/wizard/source');
  expect(document.body.textContent).toContain('does not start a build or deploy Production');
  expect(document.body.textContent).toContain('root/wizard');
  const confirm = Array.from(document.body.querySelectorAll('button'))
    .find(button => button.textContent === 'Import source') as HTMLButtonElement;
  await act(async () => { confirm.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  expect(projectRequest).toHaveBeenLastCalledWith('/projects/wizard/source', { manifestHash: 'previewed' });
  expect(document.body.textContent).toContain('Pinned Wizard source imported.');
  expect(document.body.textContent).not.toContain('Import source');
  act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove();
});

test('failed preview cannot enable import and exposes the actionable safe error', async () => {
  const data = { message: 'Snapshot is missing. Rebuild the System image.' };
  const projectRequest = jest.fn().mockRejectedValue({ response: { data } });
  const root = document.createElement('div'); document.body.appendChild(root);
  await act(async () => {
    ReactDOM.render(<WizardSourceDialog sync={{ projectRequest }} onClose={jest.fn()} />, root);
  });
  expect(document.body.textContent).toContain('Snapshot is missing');
  const confirm = Array.from(document.body.querySelectorAll('button'))
    .find(button => button.textContent === 'Import source') as HTMLButtonElement;
  expect(confirm.disabled).toBe(true);
  expect(projectRequest).toHaveBeenCalledTimes(1);
  act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove();
});
