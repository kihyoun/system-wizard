import FileSaver from 'file-saver';
import { action, makeAutoObservable, runInAction } from 'mobx';

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

    if (typeof _config !== 'undefined') {
      this.importConfig(_config);
    } else {
      this.generateMainConfig();
      this.generateGitlabConfig();
      this.generateNginxConfig();
      this.generateProxyConfig();
    }
  }

  @action importConfig(config: MainConfig): void {
    runInAction(() => {
      this.liveDir = config.liveDir;
      this.backupDir = config.backupDir;
      this.gitlabHome = config.gitlabHome;
      this.gitlabHost = config.gitlabHost;
      this.gitlabRegistryHost = config.gitlabRegistryHost;
      this.gitlabExternalUrl = config.gitlabExternalUrl;
      this.gitlabRegistryUrl = config.gitlabRegistryUrl;
      this.nginxTemplateDir = config.nginxTemplateDir;
      this.sslBaseDir = config.sslBaseDir;
      this.gitlabPort = config.gitlabPort;
      this.gitlabDomainMode = config.gitlabDomainMode;
      this.gitlabSSL = config.gitlabSSL;
      this.gitlabSSLKey = config.gitlabSSLKey;
      this.gitlabUpstream = config.gitlabUpstream;
      this.gitlabRegistryPort = config.gitlabRegistryPort;
      this.gitlabRegistryDomainMode = config.gitlabRegistryDomainMode;
      this.gitlabRegistrySSL = config.gitlabRegistrySSL;
      this.gitlabRegistrySSLKey = config.gitlabRegistrySSLKey;
      this.gitlabRegistryUpstream = config.gitlabRegistryUpstream;
    });
  }

  @action generateMainConfig(): void {
    runInAction(() => {
      this.liveDir = '/srv';
      this.backupDir = '/mnt/backup';
    });
  }

  @action generateGitlabConfig(): void {
    runInAction(() => {
      this.gitlabHome = `${this.liveDir}/gitlab`;
      this.gitlabHost = 'gitlab.example.com';
      this.gitlabRegistryHost = 'registry.example.com';
    });
  }

  @action generateNginxConfig(): void {
    runInAction(() => {
      this.nginxTemplateDir = `${this.liveDir}/nginx/templates`;
      this.sslBaseDir = '/etc/letsencrypt';
    });
  }

  @action generateProxyConfig(): void {
    runInAction(() => {
      this.gitlabExternalUrl = `https://${this.gitlabHost}`;
      this.gitlabRegistryUrl = `https://${this.gitlabRegistryHost}`;
      this.gitlabPort = 80;
      this.gitlabDomainMode = 2;
      this.gitlabSSL = `${this.sslBaseDir}/live/${this.gitlabHost}/fullchain.pem`;
      this.gitlabSSLKey = `${this.sslBaseDir}/live/${this.gitlabHost}/privkey.pem`;
      this.gitlabUpstream = 'gitlab';
      this.gitlabRegistryPort = 5050;
      this.gitlabRegistryDomainMode = 2;
      this.gitlabRegistrySSL = `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/fullchain.pem`;
      this.gitlabRegistrySSLKey = `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/privkey.pem`;
      this.gitlabRegistryUpstream = 'registry';
    });
  }

  public get content() : string {
    const ret = `
# This file was auto-generated using the system-bootstrapper
# https://www.system-bootstrapper.com

# -- BACKUP
BACKUPDIR=${this.backupDir}
LIVEDIR=${this.liveDir}

# -- GITLAB
export GITLAB_HOME=${this.gitlabHome}
GITLAB_EXTERNAL_URL=${this.gitlabExternalUrl}
GITLAB_REGISTRY_URL=${this.gitlabExternalUrl}

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
`;
    return ret;
  }

  public exportConfig() {
    const file = new Blob([this.content],
      { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(file);
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
  gitlabDomainMode = 2;
  gitlabSSL = '';
  gitlabSSLKey = '';
  gitlabUpstream = '';

  gitlabRegistryHost = '';
  gitlabRegistryPort = 80;
  gitlabRegistryDomainMode = 2;
  gitlabRegistrySSL = '';
  gitlabRegistrySSLKey = '';
  gitlabRegistryUpstream = '';
}
