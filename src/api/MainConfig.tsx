import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Helper from './Helper';
import JSZip from 'jszip';
import { HostInfo } from './Main';
/**
 * General Configuration Object
 */
export default class MainConfig {
  /**
   * Set Config
   * @param {MainConfig} config MainConfig
   */
  constructor(_config: any | undefined = undefined) {
    makeAutoObservable(this);
    this.generateConfig(_config);
  }

  syncEnable!: string;
  _syncDomainMode!: number;
  get syncDomainMode() {
    return this._syncDomainMode;
  }
  set syncDomainMode(mode:any) {
    this._syncDomainMode = parseInt(mode, 10) || 0;
  }
  syncHost!:string;
  syncUser!: string;
  syncPass!: string;
  syncSSL!: string;
  syncSSLKey!: string;

  wizardEnable!: string;
  _wizardDomainMode!: number;
  get wizardDomainMode() {
    return this._wizardDomainMode;
  }
  set wizardDomainMode(mode:any) {
    this._wizardDomainMode = parseInt(mode, 10) || 0;
  }
  wizardHost!:string;
  wizardSSL!: string;
  wizardSSLKey!: string;

  @action generateConfig(_config: any | undefined = undefined) {
    this.generateMainConfig(_config);
    this.generateProxyConfig(_config);
    this.generateSyncConfig(_config);
    this.generateWizardConfig(_config);
  }

  @action generateMainConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.seedDir = _config?.seedDir || '/mnt/seed';
      this.gitlabHost = _config?.gitlabHost || 'gitlab.example.com';
      this.gitlabRegistryHost = _config?.gitlabRegistryHost || 'registry.example.com';
      this.gitlabRunnerScale = _config ? parseInt(_config.gitlabRunnerScale, 10) : 0;
      this.gitlabRunnerToken = _config?.gitlabRunnerToken || 'secret-token';
    });
  }

  @action generateProxyConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.gitlabExternalUrl = _config?.gitlabExternalUrl || `https://${this.gitlabHost}`;
      this.gitlabRegistryUrl = _config?.gitlabRegistryUrl || `https://${this.gitlabRegistryHost}`;
      this.gitlabDomainMode = _config ? parseInt(_config.gitlabDomainMode) || 0 : 2;
      this.gitlabSSL = _config?.gitlabSSL?.replace(/;/g, '')
        || `/live/${this.gitlabHost}/fullchain.pem`;
      this.gitlabSSLKey = _config?.gitlabSSLKey?.replace(/;/g, '')
        || `/live/${this.gitlabHost}/privkey.pem`;
      this.gitlabRegistryDomainMode = _config ? parseInt(_config.gitlabRegistryDomainMode, 10) || 0 : 2;
      this.gitlabRegistrySSL = _config?.gitlabRegistrySSL?.replace(/;/g, '')
        || `/live/${this.gitlabRegistryHost}/fullchain.pem`;
      this.gitlabRegistrySSLKey = _config?.gitlabRegistrySSLKey?.replace(/;/g, '')
        || `/live/${this.gitlabRegistryHost}/privkey.pem`;
    });
  }

  @action generateSyncConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.syncEnable = _config?.syncEnable || 'false';
      this.syncHost = _config?.syncHost || `sync${this.gitlabHost.replace('gitlab','')}`;
      this.syncUser = _config?.syncUser || 'admin';
      this.syncPass = _config?.syncPass || 'admin';
      this.syncDomainMode = _config ? parseInt(_config.syncDomainMode) || 0 : 2;
      this.syncSSL = _config?.syncSSL?.replace(/;/g, '')
        || `/live/${this.syncHost}/fullchain.pem`;
      this.syncSSLKey = _config?.syncSSLKey?.replace(/;/g, '')
        || `/live/${this.syncHost}/privkey.pem`;
    });
  }

  @action generateWizardConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.wizardEnable = _config?.wizardEnable || 'false';
      this.wizardHost = _config?.wizardHost || `wizard${this.gitlabHost.replace('gitlab','')}`;
      this.wizardDomainMode = _config ? parseInt(_config.wizardDomainMode) || 0 : 2;
      this.wizardSSL = _config?.wizardSSL?.replace(/;/g, '')
        || `/live/${this.wizardHost}/fullchain.pem`;
      this.wizardSSLKey = _config?.wizardSSLKey?.replace(/;/g, '')
        || `/live/${this.wizardHost}/privkey.pem`;
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
      domainMode: this.syncDomainMode,
      ssl       : this.syncSSL,
      sslKey    : this.syncSSLKey,
      url       : (this.syncDomainMode < 2 ? 'http://' : 'https://') + host
    }
  }

  @computed get wizardHostInfo(): HostInfo {
    const host = (this.wizardDomainMode === 1 || this.wizardDomainMode === 3 ? '*.' : '')
        + this.wizardHost;
    return {
      context   : 'Wizard',
      deployMode: 1,
      useHost   : this.wizardEnable,
      host,
      domainMode: this.wizardDomainMode,
      ssl       : this.wizardSSL,
      sslKey    : this.wizardSSLKey,
      url       : (this.wizardDomainMode < 2 ? 'http://' : 'https://') + host
    }
  }


  public get content() : string {
    const ret = Helper.textLogo + `# Filepath: ./.docker.env

# -- SEED
export SEED_DIR='${this.seedDir}'

# -- GITLAB
GITLAB_EXTERNAL_URL='${this.gitlabExternalUrl}'
GITLAB_REGISTRY_URL='${this.gitlabRegistryUrl}'

# -- NGINX
export GITLAB_HOST='${this.gitlabHost}'
GITLAB_DOMAIN_MODE='${this.gitlabDomainMode}'
`;
    const gitlabSSL = `GITLAB_SSL='${this.gitlabSSL}'
GITLAB_SSL_KEY='${this.gitlabSSLKey}'
`;
    const registry = `export GITLAB_REGISTRY_HOST='${this.gitlabRegistryHost}'
GITLAB_REGISTRY_DOMAIN_MODE='${this.gitlabRegistryDomainMode}'
`;
    const registrySSL = `GITLAB_REGISTRY_SSL='${this.gitlabRegistrySSL}'
GITLAB_REGISTRY_SSL_KEY='${this.gitlabRegistrySSLKey}'
`;
    const nginx = `
# -- GITLAB RUNNER
GITLAB_RUNNER_TOKEN='${this.gitlabRunnerToken}'
export GITLAB_RUNNER_SCALE=${this.gitlabRunnerScale}

# --- Sync Settings
export SYNC_ENABLE='${this.syncEnable}'
`;
    const syncSettings = `export SYNC_HOST='${this.syncHost}'
export SYNC_USER='${this.syncUser}'
export SYNC_PASS='${this.syncPass}'
export SYNC_DOMAIN_MODE=${this.syncDomainMode}
`;
    const syncSSL = `export SYNC_SSL='${this.syncSSL}'
export SYNC_SSL_KEY='${this.syncSSLKey}'
`;
    const wizard = `
# --- Wizard
export WIZARD_ENABLE='${this.wizardEnable}'
`;
    const wizardSettings = `export WIZARD_HOST='${this.wizardHost}'
export WIZARD_DOMAIN_MODE=${this.wizardDomainMode}
`;
    const wizardSSL = `export WIZARD_SSL='${this.wizardSSL}'
export WIZARD_SSL_KEY='${this.wizardSSLKey}'
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
     + wizard
     + (this.wizardEnable === 'true' && wizardSettings || '')
     + (this.wizardEnable === 'true' && this.wizardDomainMode && this.wizardDomainMode > 1 && wizardSSL || '')
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

  // Pruxy
  gitlabHost = '';
  _gitlabDomainMode = 2;

  set gitlabDomainMode(mode:any) {
    runInAction(() => {
      this._gitlabDomainMode = parseInt(mode, 10) || 0;
      this.gitlabExternalUrl = (mode < 2 ? 'http://' : 'https://')
      + this.gitlabHost;
    });
  }

  get gitlabDomainMode() {
    return this._gitlabDomainMode;
  }

  gitlabSSL!:string;
  gitlabSSLKey!:string;

  gitlabRegistryHost = '';
  _gitlabRegistryDomainMode = 2;

  set gitlabRegistryDomainMode(mode:any) {
    runInAction(() => {
      this._gitlabRegistryDomainMode = parseInt(mode, 10) || 0;
      this.gitlabRegistryUrl = (mode < 2 ? 'http://' : 'https://')
      + this.gitlabRegistryHost;
    });
  }

  get gitlabRegistryDomainMode() {
    return this._gitlabRegistryDomainMode;
  }

  gitlabRegistrySSL = '';
  gitlabRegistrySSLKey = '';

  gitlabRunnerScale!:number;
  gitlabRunnerToken!:string;

  @computed public get asJson() : any {
    let ret = {
      seedDir          : this.seedDir,
      gitlabExternalUrl: this.gitlabExternalUrl,
      gitlabRegistryUrl: this.gitlabRegistryUrl,
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

    ret = Object.assign(ret, { wizardEnable: this.wizardEnable });

    if (this.wizardEnable === 'true') {
      ret = Object.assign(ret, {
        wizardHost      : this.wizardHost,
        wizardDomainMode: this.wizardDomainMode
      });

      if (this.wizardDomainMode > 1) {
        ret = Object.assign(ret, {
          wizardSSL   : this.wizardSSL,
          wizardSSLKey: this.wizardSSLKey
        });
      }
    }

    return Object.assign(ret, {
      gitlabRunnerScale: this.gitlabRunnerScale,
      gitlabRunnerToken: this.gitlabRunnerToken
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
    case 'SYNC_ENABLE': this.syncEnable = value; break;
    case 'SYNC_HOST': this.syncHost = value; break;
    case 'SYNC_USER': this.syncUser = value; break;
    case 'SYNC_PASS': this.syncPass = value; break;
    case 'SYNC_DOMAIN_MODE': this.syncDomainMode = parseInt(value, 10); break;
    case 'SYNC_SSL': this.syncSSL = value.replace(/;/g, ''); break;
    case 'SYNC_SSL_KEY': this.syncSSLKey = value.replace(/;/g, ''); break;
    case 'WIZARD_ENABLE': this.wizardEnable = value; break;
    case 'WIZARD_HOST': this.wizardHost = value; break;
    case 'WIZARD_DOMAIN_MODE': this.wizardDomainMode = parseInt(value, 10); break;
    case 'WIZARD_SSL': this.wizardSSL = value.replace(/;/g, ''); break;
    case 'WIZARD_SSL_KEY': this.wizardSSLKey = value.replace(/;/g, ''); break;
    case 'GITLAB_RUNNER_TOKEN': this.gitlabRunnerToken = value || 'secret'; break;
    case 'GITLAB_RUNNER_SCALE': this.gitlabRunnerScale = parseInt(value, 10); break;
    }
  }
}
