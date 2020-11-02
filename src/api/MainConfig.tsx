import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Helper from './Helper';
import JSZip from 'jszip';
/**
 * General Configuration Object
 */
export default class MainConfig implements MainConfigInterface {
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
     const ret = Helper.textLogo + `# Filepath: ./.docker.env

# -- BACKUP
BACKUPDIR=${this.backupDir}
LIVEDIR=${this.liveDir}

# -- GITLAB
export GITLAB_HOME=${this.gitlabHome}
GITLAB_EXTERNAL_URL=${this.gitlabExternalUrl}
GITLAB_REGISTRY_URL=${this.gitlabRegistryUrl}

# -- NGINX
export GITLAB_HOST=${this.gitlabHost}
GITLAB_UPSTREAM=${this.gitlabUpstream}
GITLAB_PORT=${this.gitlabPort}
GITLAB_DOMAIN_MODE=${this.gitlabDomainMode}
`;
     const gitlabSSL = `
GITLAB_SSL=${this.gitlabSSL}
GITLAB_SSL_KEY=${this.gitlabSSLKey}
`;
     const registry = `
GITLAB_REGISTRY_UPSTREAM=${this.gitlabRegistryUpstream}

GITLAB_REGISTRY_HOST=${this.gitlabRegistryHost}
GITLAB_REGISTRY_DOMAIN_MODE=${this.gitlabRegistryDomainMode}
GITLAB_REGISTRY_PORT=${this.gitlabRegistryPort}
`;
     const registrySSL = `
GITLAB_REGISTRY_SSL=${this.gitlabRegistrySSL}
GITLAB_REGISTRY_SSL_KEY=${this.gitlabRegistrySSLKey}
`;
     const nginx = `
export NGINX_TEMPLATE_DIR=${this.nginxTemplateDir}
export SSL_BASEDIR=${this.sslBaseDir}

# -- GITLAB RUNNER
GITLAB_RUNNER_TOKEN=${this.gitlabRunnerToken}
export GITLAB_RUNNER_DOCKER_SCALE=${this.gitlabRunnerDockerScale}

# created on ${new Date()}
`;
     return ret
     + (this.gitlabDomainMode > 1 && gitlabSSL || '')
     + registry
     + (this.gitlabRegistryDomainMode > 1 && registrySSL || '')
     + nginx
   }

   public exportConfig() {
     const zip = new JSZip();
     zip.file('.docker.env', this.content);
     zip.generateAsync({ type: 'blob' }).then(function(content) {
       saveAs(content, 'docker.env.zip');
     });
   }

  // Backup Settings
  liveDir!:string;

  backupDir!:string;

  // Gitlab
  gitlabHome!:string;
  gitlabExternalUrl!:string;
  gitlabRegistryUrl!:string;

  // Basic NGINX/SSL settings
  nginxTemplateDir!:string;
  sslBaseDir!:string;

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

  gitlabSSL!:string;
  gitlabSSLKey!:string;
  gitlabUpstream!:string;

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

  @computed public get asJson() : any {
    let ret = {
      liveDir          : this.liveDir,
      backupDir        : this.backupDir,
      gitlabHome       : this.gitlabHome,
      gitlabExternalUrl: this.gitlabExternalUrl,
      gitlabRegistryUrl: this.gitlabRegistryUrl,
      nginxTemplateDir : this.nginxTemplateDir,
      sslBaseDir       : this.sslBaseDir,
      gitlabUpstream   : this.gitlabUpstream,
      gitlabHost       : this.gitlabHost,
      gitlabPort       : this.gitlabPort,
      gitlabDomainMode : this.gitlabDomainMode
    };

    if (this.gitlabDomainMode > 1) {
      ret = Object.assign(ret, {
        gitlabSSL   : this.gitlabSSL,
        gitlabSSLKey: this.gitlabSSLKey
      });
    }

    ret = Object.assign(ret, {
      gitlabRegistryHost      : this.gitlabRegistryHost,
      gitlabRegistryPort      : this.gitlabRegistryPort,
      gitlabRegistryDomainMode: this.gitlabRegistryDomainMode
    });

    if (this.gitlabRegistryDomainMode > 1) {
      ret = Object.assign(ret, {
        gitlabRegistrySSL   : this.gitlabRegistrySSL,
        gitlabRegistrySSLKey: this.gitlabRegistrySSLKey
      });
    }

    return Object.assign(ret, {
      gitlabRunnerDockerScale: this.gitlabRunnerDockerScale,
      gitlabRunnerToken      : this.gitlabRunnerToken
    });
  }

  public setProperty(propertyKey : any, value : any) {
    switch (propertyKey) {
    case 'BACKUPDIR': this.backupDir = value; break;
    case 'LIVEDIR': this.liveDir = value; break;
    case 'GITLAB_HOME': this.gitlabHome = value; break;
    case 'GITLAB_EXTERNAL_URL': this.gitlabExternalUrl = value; break;
    case 'GITLAB_REGISTRY_URL': this.gitlabRegistryUrl = value; break;
    case 'GITLAB_HOST': this.gitlabHost = value; break;
    case 'GITLAB_PORT': this.gitlabPort = value; break;
    case 'GITLAB_DOMAIN_MODE': this.gitlabDomainMode = value; break;
    case 'GITLAB_SSL': this.gitlabSSL = value; break;
    case 'GITLAB_SSL_KEY': this.gitlabSSLKey = value; break;
    case 'GITLAB_UPSTREAM': this.gitlabUpstream = value; break;
    case 'GITLAB_REGISTRY_HOST': this.gitlabRegistryHost = value; break;
    case 'GITLAB_REGISTRY_DOMAIN_MODE': this.gitlabRegistryDomainMode = value; break;
    case 'GITLAB_REGISTRY_PORT': this.gitlabRegistryPort = value; break;
    case 'GITLAB_REGISTRY_SSL': this.gitlabRegistrySSL = value; break;
    case 'GITLAB_REGISTRY_SSL_KEY': this.gitlabRegistrySSLKey = value; break;
    case 'GITLAB_REGISTRY_UPSTREAM': this.gitlabRegistryUpstream = value; break;
    case 'NGINX_TEMPLATE_DIR': this.nginxTemplateDir = value; break;
    case 'SSL_BASEDIR': this.sslBaseDir = value; break;
    case 'GITLAB_RUNNER_TOKEN': this.gitlabRunnerToken = value; break;
    case 'GITLAB_RUNNER_DOCKER_SCALE': this.gitlabRunnerDockerScale = value; break;
    }
  }
}


export interface MainConfigInterface {
  liveDir:string;
  backupDir:string;
  // Gitlab
  gitlabHome:string;
  gitlabExternalUrl:string;
  gitlabRegistryUrl:string;

  nginxTemplateDir:string;

  sslBaseDir:string;

  gitlabUpstream:string;
  gitlabHost:string;
  gitlabPort:number;
  gitlabDomainMode:number;
  gitlabSSL?:string;
  gitlabSSLKey?:string;

  gitlabRegistryHost:string;
  gitlabRegistryUpstream:string;
  gitlabRegistryPort:number;
  gitlabRegistryDomainMode:number;
  gitlabRegistrySSL?:string;
  gitlabRegistrySSLKey?:string;

  gitlabRunnerDockerScale:number;
  gitlabRunnerToken:string;
}
