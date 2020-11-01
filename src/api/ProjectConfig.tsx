import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Helper from './Helper';
import Main from './Main';

/**
 * General Configuration Object
 */
export default class ProjectConfig implements ProjectConfigInterface {
    _projectKey!:string;

    get projectKey() {
      return this._projectKey;
    }

    set projectKey(key:string) {
      runInAction(() => {
        if (this._main.projects.has(key)) {
          throw 'Key already exists!';
        }

        this._projectKey = key;
      });
    }

    prodHost!: string;
    useProdHost!:string;
    prodPort!:number;
    prodDomainMode!:number;
    prodSSL!:string;
    prodSSLKey!:string;

    useBetaHost!:string;
    betaHost!:string;
    betaPort!:number;
    betaDomainMode!:number;
    betaSSL!:string;
    betaSSLKey!:string;

    useReviewHost!:string;
    reviewHost!:string;
    reviewPort!:number;
    reviewDomainMode!:number;
    reviewSSL!:string;
    reviewSSLKey!:string;

    gitlabRunnerToken!:string;
    gitlabRunnerDockerScale!:number;

    _main!: Main;
    saved = false;
    /**
   * Set Config
   * @param {ProjectConfig} config ProjectConfig
   */
    constructor(main: Main,
      _config: ProjectConfig | undefined = undefined
    ) {
      makeAutoObservable(this);
      this._main = main;
      this.generateConfig(_config);
    }

  @action generateConfig(_config: ProjectConfig | undefined = undefined) {
      this.generateMainConfig(_config);
      this.generateProdProxyConfig(_config);
      this.generateBetaProxyConfig(_config);
      this.generateReviewProxyConfig(_config);
      this.generateRunnerConfig(_config);
    }

  @action generateMainConfig(_config: ProjectConfig | undefined = undefined): void {
    runInAction(() => {
      this._projectKey = _config?.projectKey || 'systembootstrapper';
    });
  }

  @action generateProdProxyConfig(_config: ProjectConfig | undefined = undefined): void {
    runInAction(() => {
      this.useProdHost = _config?.useProdHost || 'true';
      this.prodHost = _config?.prodHost || `www.${this.projectKey}.com`;
      this.prodPort = _config?.prodPort || 80;
      this.prodDomainMode = _config?.prodDomainMode || 2;
      this.prodSSL = _config?.prodSSL || `${this._main.config?.sslBaseDir}/${this.prodHost}/fullchain.pem`;
      this.prodSSLKey = _config?.prodSSLKey || `${this._main.config?.sslBaseDir}/${this.prodHost}/privkey.pem`;
    });
  }

  @computed get prodHostInfo(): HostInfo {
    return {
      context   : 'Production',
      useHost   : this.useProdHost,
      host      : this.prodHost,
      port      : this.prodPort,
      domainMode: this.prodDomainMode,
      ssl       : this.prodSSL,
      sslKey    : this.prodSSLKey
    }
  }

  @action generateBetaProxyConfig(_config: ProjectConfig | undefined = undefined): void {
    runInAction(() => {
      this.useBetaHost = _config?.useBetaHost || 'false';
      this.betaHost = _config?.betaHost || `beta.${this.projectKey}.com`;
      this.betaPort = _config?.betaPort || 80;
      this.betaDomainMode = _config?.betaDomainMode || 2;
      this.betaSSL = _config?.betaSSL || `${this._main.config?.sslBaseDir}/${this.betaHost}/fullchain.pem`;
      this.betaSSLKey = _config?.betaSSLKey || `${this._main.config?.sslBaseDir}/${this.betaHost}/privkey.pem`;
    });
  }

  @computed get betaHostInfo() : HostInfo {
    return {
      context   : 'Beta',
      useHost   : this.useBetaHost,
      host      : this.betaHost,
      port      : this.betaPort,
      domainMode: this.betaDomainMode,
      ssl       : this.betaSSL,
      sslKey    : this.betaSSLKey
    }
  }

 @action generateReviewProxyConfig(_config: ProjectConfig | undefined = undefined): void {
    runInAction(() => {
      this.useReviewHost = _config?.useReviewHost || 'false';
      this.reviewHost = _config?.reviewHost || `${this.projectKey}.com`;
      this.reviewPort = _config?.betaPort || 80;
      this.reviewDomainMode = _config?.reviewDomainMode || 1;
      this.reviewSSL = _config?.betaSSL || `${this._main.config?.sslBaseDir}/${this.reviewHost}/fullchain.pem`;
      this.reviewSSLKey = _config?.betaSSLKey || `${this._main.config?.sslBaseDir}/${this.reviewHost}/privkey.pem`;
    });
  }

  @computed get reviewHostInfo() : HostInfo{
   return {
     context   : 'Review',
     useHost   : this.useReviewHost,
     host      : this.reviewHost,
     port      : this.reviewPort,
     domainMode: this.reviewDomainMode,
     ssl       : this.reviewSSL,
     sslKey    : this.reviewSSLKey
   }
 }

   @action generateRunnerConfig(_config: ProjectConfig | undefined = undefined): void {
    runInAction(() => {
      this.gitlabRunnerDockerScale = _config?.gitlabRunnerDockerScale || 0;
      this.gitlabRunnerToken = _config?.gitlabRunnerToken || 'secret-token';
    });
  }

   public get content() : string {
     const ret = Helper.textLogo + `# Filepath: ./.projects.env/.${this.projectKey}.env

USE_PROD_HOST=${this.useProdHost}
`;
     const prod = `
PROJECT_NAME=${this.projectKey}
PROD_HOST=${this.prodHost}
PROD_PORT=${this.prodPort}
PROD_DOMAIN_MODE=${this.prodDomainMode}
`;
     const prodSSL = `
PROD_SSL=${this.prodSSL};
PROD_SSL_KEY=${this.prodSSLKey};
`;
     const betaUse = `
# Set false if not using a Beta Deployment
USE_BETA_HOST=${this.useBetaHost}
`;
     const beta = `
BETA_HOST=${this.betaHost}
BETA_PORT=${this.betaPort}
BETA_DOMAIN_MODE=${this.betaDomainMode}
`;
     const betaSSL = `
BETA_SSL=${this.betaSSL};
BETA_SSL_KEY=${this.betaSSLKey};
`;
     const reviewUse = `
# Set false if not using the Review
USE_REVIEW_HOST=${this.useReviewHost}
`;
     const reviewHost =`
REVIEW_HOST=${this.reviewHost}
REVIEW_PORT=${this.reviewPort}
REVIEW_DOMAIN_MODE=${this.reviewDomainMode}
`;
     const reviewSSL = `
REVIEW_SSL=${this.reviewSSL};
REVIEW_SSL_KEY=${this.reviewSSLKey};
  `;
     const gitlabRunner = `
# -- GITLAB RUNNER for Project
GITLAB_RUNNER_TOKEN=${this.gitlabRunnerToken}
export GITLAB_RUNNER_DOCKER_SCALE=${this.gitlabRunnerDockerScale}
`;
     const createdOn = `# created on ${new Date()}`;
     return ret
     + (this.useProdHost === 'true' && prod || '')
     + (this.prodDomainMode > 1 && prodSSL || '')
     + betaUse + (this.useBetaHost === 'true' && beta || '')
     + (this.betaDomainMode > 1 && betaSSL || '')
     + reviewUse + (this.useReviewHost === 'true' && reviewHost || '')
     + (this.reviewDomainMode > 1 && reviewSSL || '')
     + gitlabRunner
     + createdOn;
   }

  @computed public get asJson() : any {
     let ret = {
       projectKey : this.projectKey,
       useProdHost: this.useProdHost
     };

     if (this.useProdHost === 'true' ) {
       ret = Object.assign(ret, {
         prodHost      : this.prodHost,
         prodPort      : this.prodPort,
         prodDomainMode: this.prodDomainMode
       });

       if (this.prodDomainMode > 1) {
         ret = Object.assign(ret, {
           prodSSL   : this.prodSSL,
           prodSSLKey: this.prodSSLKey
         });
       }
     }

     ret = Object.assign(ret, { useBetaHost: this.useBetaHost });

     if (this.useBetaHost === 'true') {
       ret = Object.assign(ret, {
         betaHost      : this.betaHost,
         betaPort      : this.betaPort,
         betaDomainMode: this.betaDomainMode
       });

       if (this.betaDomainMode > 1) {
         ret = Object.assign(ret, {
           betaSSL   : this.betaSSL,
           betaSSLKey: this.betaSSLKey
         });
       }
     }

     ret = Object.assign(ret, { useReviewHost: this.useReviewHost });

     if (this.useReviewHost === 'true') {
       ret = Object.assign(ret, {
         reviewHost      : this.reviewHost,
         reviewPort      : this.reviewPort,
         reviewDomainMode: this.reviewDomainMode
       });

       if (this.reviewDomainMode > 1) {
         ret = Object.assign(ret, {
           reviewSSL   : this.reviewSSL,
           reviewSSLKey: this.reviewSSLKey
         });
       }
     }

     const config = Object.assign(ret, {
       gitlabRunnerToken      : this.gitlabRunnerToken,
       gitlabRunnerDockerScale: this.gitlabRunnerDockerScale
     });

     return config;
   }

}

export interface HostInfo {
  context: string;
  useHost: string;
  domainMode: number;
  host: string;
  port: number;
  ssl: string;
  sslKey: string;
}

export interface ProjectConfigInterface {
  projectKey:string;
  prodHost?: string;
  useProdHost:string;
  prodPort?:number;
  prodDomainMode?:number;
  prodSSL?:string;
  prodSSLKey?:string;
  useBetaHost:string;
  betaHost?:string;
  betaPort?:number;
  betaDomainMode:number;
  betaSSL?:string;
  betaSSLKey?:string;
  useReviewHost:string;
  reviewHost?:string;
  reviewPort?:number;
  reviewDomainMode?:number;
  reviewSSL?:string;
  reviewSSLKey?:string;
  gitlabRunnerToken:string;
  gitlabRunnerDockerScale:number;
}