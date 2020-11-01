import FileSaver from 'file-saver';
import {
  action, makeAutoObservable, runInAction
} from 'mobx';

/**
 * General Configuration Object
 */
export default class MainConfig {
  /**
   * Set Config
   * @param {MainConfig} config MainConfig
   */
  constructor(_config: MainConfig | undefined = undefined) {
    makeAutoObservable(this);
    this.generateConfig(_config);
  }

  @action generateConfig(_config: MainConfig | undefined = undefined) {
    this.generateMainConfig(_config);
    this.generateGitlabConfig(_config);
    this.generateNginxConfig(_config);
    this.generateProxyConfig(_config);
    this.generateRunnerConfig(_config);
  }

  @action generateMainConfig(_config: MainConfig | undefined = undefined): void {
    runInAction(() => {
      this.liveDir = _config?.liveDir || '/srv';
      this.backupDir = _config?.backupDir || '/mnt/backup';
    });
  }

  @action generateGitlabConfig(_config: MainConfig | undefined = undefined): void {
    runInAction(() => {
      this.gitlabHome = _config?.gitlabHome || `${this.liveDir}/gitlab`;
      this.gitlabHost = _config?.gitlabHost || 'gitlab.example.com';
      this.gitlabRegistryHost = _config?.gitlabRegistryHost || 'registry.example.com';
    });
  }

  @action generateNginxConfig(_config: MainConfig | undefined = undefined): void {
    runInAction(() => {
      this.nginxTemplateDir = _config?.nginxTemplateDir || `${this.liveDir}/nginx/templates`;
      this.sslBaseDir = _config?.sslBaseDir || '/etc/letsencrypt';
    });
  }

  @action generateProxyConfig(_config: MainConfig | undefined = undefined): void {
    runInAction(() => {
      this.gitlabExternalUrl = _config?.gitlabExternalUrl || `https://${this.gitlabHost}`;
      this.gitlabRegistryUrl = _config?.gitlabRegistryUrl || `https://${this.gitlabRegistryHost}`;
      this.gitlabPort = _config?.gitlabPort || 80;
      this.gitlabDomainMode = _config?.gitlabDomainMode || 2;
      this.gitlabSSL = _config?.gitlabSSL || `${this.sslBaseDir}/live/${this.gitlabHost}/fullchain.pem`;
      this.gitlabSSLKey = _config?.gitlabSSLKey || `${this.sslBaseDir}/live/${this.gitlabHost}/privkey.pem`;
      this.gitlabUpstream = _config?.gitlabUpstream || 'gitlab';
      this.gitlabRegistryPort = _config?.gitlabRegistryPort || 5050;
      this.gitlabRegistryDomainMode = _config?.gitlabRegistryDomainMode || 2;
      this.gitlabRegistrySSL = _config?.gitlabRegistrySSL
        || `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/fullchain.pem`;
      this.gitlabRegistrySSLKey = _config?.gitlabRegistrySSLKey
        || `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/privkey.pem`;
      this.gitlabRegistryUpstream = _config?.gitlabRegistryUpstream || 'registry';
    });
  }

   @action generateRunnerConfig(_config: MainConfig | undefined = undefined): void {
    runInAction(() => {
      this.gitlabRunnerDockerScale = _config?.gitlabRunnerDockerScale || 0;
      this.gitlabRunnerToken = _config?.gitlabRunnerToken || 'secret-token';
    });
  }

   public get content() : string {
     const ret = `
#-------------------------------------------------------------
# This file was auto-generated using the system-bootstrapper
#-------------------------------------------------------------
#                +------------------+
#               /|                 /|
#              / |                / |
#             *--+---------------*  |
#             |  |               |  |
#             |  |  System       |  |
#             |  |  Bootstrapper |  |
#             |  +---------------+--+
#             | /                | /
#             |/                 |/
#             *------------------*
#    +------+ https://www.system-bootstrapper.com
#   /      /|
#  +------+ |
#  |      | +
#  |      |/
#  +------+

# -- BACKUP
BACKUPDIR=${this.backupDir}
LIVEDIR=${this.liveDir}

# -- GITLAB
export GITLAB_HOME=${this.gitlabHome}
GITLAB_EXTERNAL_URL=${this.gitlabExternalUrl}
GITLAB_REGISTRY_URL=${this.gitlabRegistryUrl}

# -- NGINX
export GITLAB_HOST=${this.gitlabHost}
GITLAB_PORT=${this.gitlabPort}
GITLAB_DOMAIN_MODE=${this.gitlabDomainMode}
GITLAB_SSL=${this.gitlabSSL}
GITLAB_SSL_KEY=${this.gitlabSSLKey}
GITLAB_UPSTREAM=${this.gitlabUpstream}

GITLAB_REGISTRY_HOST=${this.gitlabRegistryHost}
GITLAB_REGISTRY_DOMAIN_MODE=${this.gitlabRegistryDomainMode}
GITLAB_REGISTRY_PORT=${this.gitlabRegistryPort}
GITLAB_REGISTRY_SSL=${this.gitlabRegistrySSL}
GITLAB_REGISTRY_SSL_KEY=${this.gitlabRegistrySSLKey}
GITLAB_REGISTRY_UPSTREAM=${this.gitlabRegistryUpstream}

export NGINX_TEMPLATE_DIR=${this.nginxTemplateDir}
export SSL_BASEDIR=${this.sslBaseDir}

# -- GITLAB RUNNER
GITLAB_RUNNER_TOKEN=${this.gitlabRunnerToken}
export GITLAB_RUNNER_DOCKER_SCALE=${this.gitlabRunnerDockerScale}

# EOF

`;
     return ret;
   }

   public exportConfig() {
     const file = new Blob([this.content],
       { type: 'text/plain;charset=utf-8' });
     FileSaver.saveAs(file, '.docker.env');
   }

  // Backup Settings
  liveDir = '/srv';

  backupDir = '';

  // Gitlab
  gitlabHome = '';
  gitlabExternalUrl = '';
  gitlabRegistryUrl = '';

  // Basic NGINX/SSL settings
  nginxTemplateDir = '';
  sslBaseDir = '';

  // Pruxy
  gitlabHost = '';
  gitlabPort = 80;
  _gitlabDomainMode = 2;

  set gitlabDomainMode(mode:number) {
    runInAction(() => {
      this._gitlabDomainMode = mode;
      this.gitlabExternalUrl = (mode < 2 ? 'http://' : 'https://')
     + this.gitlabHost;
    });
  }

  get gitlabDomainMode(): number {
    return this._gitlabDomainMode;
  }

  gitlabSSL = '';
  gitlabSSLKey = '';
  gitlabUpstream = '';

  gitlabRegistryHost = '';
  gitlabRegistryPort = 80;
  _gitlabRegistryDomainMode = 2;

  set gitlabRegistryDomainMode(mode:number) {
    runInAction(() => {
      this._gitlabRegistryDomainMode = mode;
      this.gitlabRegistryUrl = (mode < 2 ? 'http://' : 'https://')
      + this.gitlabRegistryHost;
    });
  }

  get gitlabRegistryDomainMode(): number {
    return this._gitlabRegistryDomainMode;
  }

  gitlabRegistrySSL = '';
  gitlabRegistrySSLKey = '';
  gitlabRegistryUpstream = '';

  gitlabRunnerDockerScale!:number;
  gitlabRunnerToken!:string;
}
