import axios from 'axios';
import Main from './Main';
import Helper from './Helper';

jest.mock('axios');
const get = axios.get as jest.Mock;

function connected() {
  const main = new Main();
  (axios.post as jest.Mock).mockResolvedValue({ data: { accessToken: 'test-token' } });
  main.sync.userName = 'local-test';
  return main;
}

beforeEach(() => jest.clearAllMocks());

test('a saved configuration wins and is not marked as derived', async () => {
  const main = connected();
  main.derivedFields = { gitlabHost: 'old guess' };
  get.mockResolvedValueOnce({ data: { data: Helper.textLogo + '\nexport GITLAB_HOST="gitlab.saved.test"\n' } });
  get.mockResolvedValueOnce({ data: [] });
  await main.sync.fetch();
  expect(main.config!.gitlabHost).toBe('gitlab.saved.test');
  expect(main.derivedFields).toEqual({});
  expect(get).toHaveBeenCalledTimes(2);
  expect(get.mock.calls.every(call => !call[0].endsWith('/config/suggestions'))).toBe(true);
});

test('missing config loads marked suggestions without generating credentials', async () => {
  const main = connected();
  get.mockRejectedValueOnce({ response: { status: 404 } });
  get.mockResolvedValueOnce({
    data: {
      source: 'derived',
      config: {
        gitlabHost      : 'gitlab.localhost',
        gitlabDomainMode: 0
      },
      fields: { gitlabHost: 'Connection hostname' }
    }
  });
  await main.sync.fetch();
  expect(main.config!.gitlabHost).toBe('gitlab.localhost');
  expect(main.config!.gitlabExternalUrl).toBe('http://gitlab.localhost');
  expect(main.config!.gitlabRegistryHost).toBe('');
  expect(main.config!.gitlabRunnerToken).toBe('');
  expect(main.config!.syncPass).toBe('');
  expect(main.derivedFields.gitlabHost).toBe('Connection hostname');
  expect(main.init).toBe(false);
  expect((axios.post as jest.Mock).mock.calls.every(call => call[0].endsWith('/token'))).toBe(true);
});

test('authentication and server errors do not replace the form with guesses', async () => {
  const main = connected();
  const before = main.config!.gitlabHost;
  get.mockRejectedValueOnce({ response: { status: 401 } });
  await expect(main.sync.fetch()).rejects.toEqual({ response: { status: 401 } });
  expect(main.config!.gitlabHost).toBe(before);
  expect(get).toHaveBeenCalledTimes(1);
});
