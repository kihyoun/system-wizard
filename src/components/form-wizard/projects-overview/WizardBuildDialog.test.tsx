import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import WizardBuildDialog from './WizardBuildDialog';

const preview = {
  version     : 1,
  recipeHash  : 'previewed-recipe',
  importCommit: 'imported-source',
  repository  : { path: 'root/wizard' }
};
const button = (label:string) => Array.from(document.body.querySelectorAll('button'))
  .find(element => element.textContent === label) as HTMLButtonElement | undefined;
const click = async (label:string) => {
  const element = button(label);
  if (!element) throw new Error('Missing button: ' + label);
  await act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
let root: HTMLDivElement;
beforeEach(() => { root = document.createElement('div'); document.body.appendChild(root); });
afterEach(() => { act(() => { ReactDOM.unmountComponentAtNode(root); }); root.remove(); });

test('preview never activates; explicit confirmation uses the previewed recipe and remains locked until complete',
  async () => {
    let finish: (result:any) => void = () => undefined;
    const projectRequest = jest.fn().mockResolvedValueOnce(preview)
      .mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const onClose = jest.fn();
    await act(async () => {
      ReactDOM.render(<WizardBuildDialog sync={{ projectRequest }} onClose={onClose} />, root);
    });
    expect(projectRequest).toHaveBeenCalledTimes(1);
    expect(projectRequest).toHaveBeenCalledWith('/projects/wizard/build');
    expect(document.body.textContent).toContain('Production is not deployed or replaced');
    await click('Enable build pipeline');
    expect(projectRequest).toHaveBeenLastCalledWith('/projects/wizard/build', { recipeHash: 'previewed-recipe' });
    expect(button('Close')?.disabled).toBe(true);
    await click('Close'); expect(onClose).not.toHaveBeenCalled();
    await act(async () => { finish({
      build  : { phase: 'pipeline-running' },
      message: 'Pipeline started.'
    }); });
    expect(button('Close')?.disabled).toBe(false);
    expect(button('Enable build pipeline')).toBeUndefined();
    expect(document.body.textContent).toContain('pipeline is in progress');
  });

test('uncertain pipeline creation offers refresh without reactivation or stale verified artifact', async () => {
  const phase = 'requires-reconciliation';
  const projectRequest = jest.fn().mockResolvedValueOnce({
    ...preview,
    build: {
      phase,
      artifact: { imageRef: 'stale-image' }
    }
  }).mockResolvedValueOnce({
    build  : { phase },
    message: 'Inspect the existing operation.'
  });
  await act(async () => {
    ReactDOM.render(<WizardBuildDialog sync={{ projectRequest }} onClose={jest.fn()} />, root);
  });
  expect(button('Enable build pipeline')).toBeUndefined();
  expect(document.body.textContent).not.toContain('stale-image');
  expect(document.body.textContent).toContain('Do not clear the checkpoint');
  expect(button('Resume activation')).toBeUndefined();
  await click('Refresh status');
  expect(projectRequest).toHaveBeenLastCalledWith('/projects/wizard/build/status');
  expect(projectRequest.mock.calls.every(call => !call[1])).toBe(true);
});

test.each(['pending', 'verification-failed', 'recipe-installed'])(
  '%s can resume only after a fresh preview, with the recipe explicitly confirmed', async phase => {
    const reserved = {
      ...preview,
      build: { phase }
    };
    const projectRequest = jest.fn().mockResolvedValueOnce(reserved)
      .mockResolvedValueOnce({
        build  : { phase },
        message: 'Status refreshed.'
      })
      .mockResolvedValueOnce(reserved)
      .mockResolvedValueOnce({ build: { phase: 'pipeline-running' } });
    await act(async () => {
      ReactDOM.render(<WizardBuildDialog sync={{ projectRequest }} onClose={jest.fn()} />, root);
    });
    expect(button('Resume activation')?.disabled).toBe(false);
    expect(projectRequest).toHaveBeenCalledTimes(1);
    await click('Refresh status');
    expect(button('Resume activation')?.disabled).toBe(true);
    await click('Refresh preview');
    expect(projectRequest).toHaveBeenLastCalledWith('/projects/wizard/build');
    expect(button('Resume activation')?.disabled).toBe(false);
    await click('Resume activation');
    expect(projectRequest).toHaveBeenLastCalledWith('/projects/wizard/build', { recipeHash: 'previewed-recipe' });
    expect(projectRequest.mock.calls.filter(call => !!call[1])).toHaveLength(1);
  });

test('failed refresh immediately hides prior verified artifact and never falls back to activation', async () => {
  const projectRequest = jest.fn().mockResolvedValueOnce({
    ...preview,
    build: {
      phase   : 'candidate-verified',
      artifact: { imageRef: 'verified-image' }
    }
  }).mockRejectedValueOnce(new Error('Verification lookup failed.'));
  await act(async () => {
    ReactDOM.render(<WizardBuildDialog sync={{ projectRequest }} onClose={jest.fn()} />, root);
  });
  expect(document.body.textContent).toContain('verified-image');
  await click('Refresh status');
  expect(document.body.textContent).not.toContain('verified-image');
  expect(document.body.textContent).toContain('Previous artifact claims are hidden');
  expect(button('Enable build pipeline')).toBeUndefined();
  expect(button('Resume activation')?.disabled).toBe(true);
});

test('a pending read-only preview can close and its late response is ignored', async () => {
  let finish: (result:any) => void = () => undefined;
  const projectRequest = jest.fn(() => new Promise(resolve => { finish = resolve; }));
  const onClose = jest.fn(() => { ReactDOM.unmountComponentAtNode(root); });
  await act(async () => {
    ReactDOM.render(<WizardBuildDialog sync={{ projectRequest }} onClose={onClose} />, root);
  });
  expect(button('Close')?.disabled).toBe(false);
  await click('Close'); expect(onClose).toHaveBeenCalledTimes(1);
  const errors = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    await act(async () => { finish({
      ...preview,
      repository: { path: 'late-preview' }
    }); });
    expect(document.body.textContent).not.toContain('late-preview');
    expect(projectRequest).toHaveBeenCalledTimes(1);
    expect(errors).not.toHaveBeenCalled();
  } finally { errors.mockRestore(); }
});
