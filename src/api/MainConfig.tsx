import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Helper from './Helper';
import JSZip from 'jszip';
import { HostInfo } from './Main';
/**
 * General Configuration Object
 */
export default class MainConfig implements MainConfigInterface {
  /**
   * Set Config
   * @param {MainConfig} config MainConfig
   */
  constructor(_config: any | undefined = undefined) {
    makeAutoObservable(this);
    this.generateConfig(_config);
  }

  syncEnable!: string;
  syncDomainMode!: number;
  syncHost!:string;
  syncUser!: string;
  syncPass!: string;
  syncSSL!: string;
  syncSSLKey!: string;

  @action generateConfig(_config: any | undefined = undefined) {
    this.generateMainConfig(_config);
    this.generateGitlabConfig(_config);
    this.generateNginxConfig(_config);
    this.generateProxyConfig(_config);
    this.generateSyncConfig(_config);
    this.generateRunnerConfig(_config);
  }

  @action generateMainConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.seedDir = _config?.seedDir || '/mnt/seed';
    });
  }

  @action generateGitlabConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.gitlabHost = _config?.gitlabHost || 'gitlab.example.com';
      this.gitlabRegistryHost = _config?.gitlabRegistryHost || 'registry.example.com';
    });
  }

  @action generateNginxConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.sslBaseDir = _config?.sslBaseDir || '/etc/letsencrypt';
    });
  }

  @action generateProxyConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.gitlabExternalUrl = _config?.gitlabExternalUrl || `https://${this.gitlabHost}`;
      this.gitlabRegistryUrl = _config?.gitlabRegistryUrl || `https://${this.gitlabRegistryHost}`;
      this.gitlabDomainMode = _config ? parseInt(_config.gitlabDomainMode) || 0 : 2;
      this.gitlabSSL = _config?.gitlabSSL?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.gitlabHost}/fullchain.pem`;
      this.gitlabSSLKey = _config?.gitlabSSLKey?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.gitlabHost}/privkey.pem`;
      this.gitlabRegistryDomainMode = _config ? parseInt(_config.gitlabRegistryDomainMode, 10) || 0 : 2;
      this.gitlabRegistrySSL = _config?.gitlabRegistrySSL?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/fullchain.pem`;
      this.gitlabRegistrySSLKey = _config?.gitlabRegistrySSLKey?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.gitlabRegistryHost}/privkey.pem`;
    });
  }
  @action generateSyncConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.syncEnable = _config?.syncEnable || 'false';
      this.syncHost = _config?.syncHost || `sync.${this.gitlabHost}.com`;
      this.syncUser = _config?.syncUser || 'admin';
      this.syncPass = _config?.syncPass || 'admin';
      this.syncDomainMode = _config ? parseInt(_config.syncDomainMode) || 0 : 2;
      this.syncSSL = _config?.syncSSL?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.syncHost}/fullchain.pem`;
      this.syncSSLKey = _config?.syncSSLKey?.replace(/;/g, '')
        || `${this.sslBaseDir}/live/${this.syncHost}/privkey.pem`;
    });
  }

   @action generateRunnerConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.gitlabRunnerDockerScale = _config ? parseInt(_config.gitlabRunnerDockerScale, 10) : 0;
      this.gitlabRunnerToken = _config?.gitlabRunnerToken || 'secret-token';
    });
  }

    @computed get syncHostInfo(): HostInfo {
     const host = (this.syncDomainMode === 1 || this.syncDomainMode === 3 ? '*.' : '')
        + this.syncHost;
     return {
       context   : 'Sync',
       deployMode: 1,
       useHost   : this.syncEnable,
       host,
       port      : 8071,
       domainMode: this.syncDomainMode,
       ssl       : this.syncSSL,
       sslKey    : this.syncSSLKey,
       url       : (this.syncDomainMode < 2 ? 'http://' : 'https://') + host
     }
   }


    public get content() : string {
      const ret = Helper.textLogo + `# Filepath: ./.docker.env

# -- SEED
export SEED_DIR=${this.seedDir}

# -- GITLAB
GITLAB_EXTERNAL_URL=${this.gitlabExternalUrl}
GITLAB_REGISTRY_URL=${this.gitlabRegistryUrl}

# -- NGINX
export GITLAB_HOST=${this.gitlabHost}
GITLAB_DOMAIN_MODE=${this.gitlabDomainMode}
`;
      const gitlabSSL = `
GITLAB_SSL=${this.gitlabSSL}
GITLAB_SSL_KEY=${this.gitlabSSLKey}
`;
      const registry = `
export GITLAB_REGISTRY_HOST=${this.gitlabRegistryHost}
GITLAB_REGISTRY_DOMAIN_MODE=${this.gitlabRegistryDomainMode}
`;
      const registrySSL = `
GITLAB_REGISTRY_SSL=${this.gitlabRegistrySSL}
GITLAB_REGISTRY_SSL_KEY=${this.gitlabRegistrySSLKey}
`;
      const nginx = `
export SSL_BASEDIR=${this.sslBaseDir}

# -- GITLAB RUNNER
GITLAB_RUNNER_TOKEN=${this.gitlabRunnerToken}
export GITLAB_RUNNER_DOCKER_SCALE=${this.gitlabRunnerDockerScale}

# --- Sync Settings
export SYNC_ENABLE=${this.syncEnable}
`;
      const syncSettings = `
export SYNC_HOST=${this.syncHost}
export SYNC_USER=${this.syncUser}
export SYNC_PASS=${this.syncPass}
export SYNC_DOMAIN_MODE=${this.syncDomainMode}
`;
      const syncSSL = `
export SYNC_SSL=${this.syncSSL}
export SYNC_SSL_KEY=${this.syncSSLKey}
`;
      const createdOn = `
# created on ${new Date()}
`;
      return ret
     + (this.gitlabDomainMode > 1 && gitlabSSL || '')
     + registry
     + (this.gitlabRegistryDomainMode > 1 && registrySSL || '')
     + nginx
     + (this.syncEnable === 'true' && syncSettings || '')
     + (this.syncEnable === 'true' && this.syncDomainMode && this.syncDomainMode > 1 && syncSSL || '')
     + createdOn;
    }

    public exportConfig() {
      const zip = new JSZip();
      zip.file('.docker.env', this.content);
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        saveAs(content, 'docker.env.zip');
      });
    }

  // Seed Settings
  seedDir!:string;

  // Gitlab
  gitlabExternalUrl!:string;
  gitlabRegistryUrl!:string;

  // Basic NGINX/SSL settings
  sslBaseDir!:string;

  // Pruxy
  gitlabHost = '';
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

  gitlabRegistryHost = '';
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

  gitlabRunnerDockerScale!:number;
  gitlabRunnerToken!:string;

  @computed public get asJson() : any {
    let ret = {
      seedDir          : this.seedDir,
      gitlabExternalUrl: this.gitlabExternalUrl,
      gitlabRegistryUrl: this.gitlabRegistryUrl,
      sslBaseDir       : this.sslBaseDir,
      gitlabHost       : this.gitlabHost,
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
      gitlabRegistryDomainMode: this.gitlabRegistryDomainMode
    });

    if (this.gitlabRegistryDomainMode > 1) {
      ret = Object.assign(ret, {
        gitlabRegistrySSL   : this.gitlabRegistrySSL,
        gitlabRegistrySSLKey: this.gitlabRegistrySSLKey
      });
    }

    ret = Object.assign(ret, { syncEnable: this.syncEnable });

    if (this.syncEnable === 'true') {
      ret = Object.assign(ret, {
        syncHost      : this.syncHost,
        syncUser      : this.syncUser,
        syncPass      : this.syncPass,
        syncDomainMode: this.syncDomainMode
      });

      if (this.syncDomainMode > 1) {
        ret = Object.assign(ret, {
          syncSSL   : this.syncSSL,
          syncSSLKey: this.syncSSLKey
        });
      }
    }

    return Object.assign(ret, {
      gitlabRunnerDockerScale: this.gitlabRunnerDockerScale,
      gitlabRunnerToken      : this.gitlabRunnerToken
    });
  }

  public setProperty(propertyKey : any, value : any) {
    switch (propertyKey) {
    case 'SEED_DIR': this.seedDir = value; break;
    case 'GITLAB_EXTERNAL_URL': this.gitlabExternalUrl = value; break;
    case 'GITLAB_REGISTRY_URL': this.gitlabRegistryUrl = value; break;
    case 'GITLAB_HOST': this.gitlabHost = value; break;
    case 'GITLAB_DOMAIN_MODE': this.gitlabDomainMode = parseInt(value, 10); break;
    case 'GITLAB_SSL': this.gitlabSSL = value.replace(/;/g, ''); break;
    case 'GITLAB_SSL_KEY': this.gitlabSSLKey = value.replace(/;/g, ''); break;
    case 'GITLAB_REGISTRY_HOST': this.gitlabRegistryHost = value; break;
    case 'GITLAB_REGISTRY_DOMAIN_MODE': this.gitlabRegistryDomainMode = parseInt(value, 10); break;
    case 'GITLAB_REGISTRY_SSL': this.gitlabRegistrySSL = value.replace(/;/g, ''); break;
    case 'GITLAB_REGISTRY_SSL_KEY': this.gitlabRegistrySSLKey = value.replace(/;/g, ''); break;
    case 'SSL_BASEDIR': this.sslBaseDir = value; break;
    case 'SYNC_ENABLE': this.syncEnable = value; break;
    case 'SYNC_HOST': this.syncHost = value; break;
    case 'SYNC_USER': this.syncUser = value; break;
    case 'SYNC_PASS': this.syncPass = value; break;
    case 'SYNC_DOMAIN_MODE': this.syncDomainMode = parseInt(value, 10); break;
    case 'SYNC_SSL': this.syncSSL = value.replace(/;/g, ''); break;
    case 'SYNC_SSL_KEY': this.syncSSLKey = value.replace(/;/g, ''); break;
    case 'GITLAB_RUNNER_TOKEN': this.gitlabRunnerToken = value || 'secret'; break;
    case 'GITLAB_RUNNER_DOCKER_SCALE': this.gitlabRunnerDockerScale = parseInt(value, 10); break;
    }
  }
}


export interface MainConfigInterface {
  seedDir:string;
  // Gitlab
  gitlabExternalUrl:string;
  gitlabRegistryUrl:string;

  sslBaseDir:string;

  gitlabHost:string;
  gitlabDomainMode:number;
  gitlabSSL?:string;
  gitlabSSLKey?:string;

  gitlabRegistryHost:string;
  gitlabRegistryDomainMode:number;
  gitlabRegistrySSL?:string;
  gitlabRegistrySSLKey?:string;

  syncEnable:string;
  syncDomainMode:number;
  syncHost:string;
  syncUser:string;
  syncPass:string;
  syncSSL:string;
  syncSSLKey:string;

  gitlabRunnerDockerScale:number;
  gitlabRunnerToken:string;
}
