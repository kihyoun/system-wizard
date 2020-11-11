import FileSaver from 'file-saver';
import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Helper from './Helper';
import Main, { HostInfo } from './Main';

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
    _prodPort!:number;
    set prodPort(port:any) {
      this._prodPort = parseInt(port, 10);
    }
    get prodPort() {
      return this._prodPort;
    }
    _prodDomainMode!:number;
    get prodDomainMode() {
      return this._prodDomainMode;
    }
    set prodDomainMode(mode:any) {
      this._prodDomainMode = parseInt(mode, 10) || 0;
    }
    _prodDeployMode!:number;
    get prodDeployMode() {
      return this._prodDeployMode;
    }
    set prodDeployMode(mode:any) {
      this._prodDeployMode = parseInt(mode, 10) || 0
    }
    prodSSL!:string;
    prodSSLKey!:string;

    useBetaHost!:string;
    betaHost!:string;
    _betaPort!:number;
    set betaPort(port:any) {
      this._betaPort = parseInt(port, 10);
    }
    get betaPort() {
      return this._betaPort;
    }
    _betaDomainMode!:number;
    get betaDomainMode() {
      return this._betaDomainMode;
    }
    set betaDomainMode(mode:any) {
      this._betaDomainMode = parseInt(mode, 10) || 0;
    }
    _betaDeployMode!:number;
    get betaDeployMode() {
      return this._betaDeployMode;
    }
    set betaDeployMode(mode:any) {
      this._betaDeployMode = parseInt(mode, 10) || 0
    }
    betaSSL!:string;
    betaSSLKey!:string;

    useReviewHost!:string;
    reviewHost!:string;
    _reviewPort!:number;
    _reviewDomainMode!:number;
    set reviewPort(port:any) {
      this._reviewPort = parseInt(port, 10);
    }
    get reviewPort() {
      return this._reviewPort;
    }
    get reviewDomainMode() {
      return this._reviewDomainMode;
    }
    set reviewDomainMode(mode:any) {
      this._reviewDomainMode = parseInt(mode, 10) || 0;
    }
    _reviewDeployMode!:number;
    get reviewDeployMode() {
      return this._reviewDeployMode;
    }
    set reviewDeployMode(mode:any) {
      this._reviewDeployMode = parseInt(mode, 10) || 0;
    }
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
      _config: ProjectConfigInterface | undefined = undefined
    ) {
      makeAutoObservable(this);
      this._main = main;
      this.generateConfig(_config);
    }

  @action generateConfig(_config: ProjectConfigInterface | undefined = undefined) {
      this.generateMainConfig(_config);
      this.generateProdProxyConfig(_config);
      this.generateBetaProxyConfig(_config);
      this.generateReviewProxyConfig(_config);
      this.generateRunnerConfig(_config);
    }

  @action generateMainConfig(_config: ProjectConfigInterface | undefined = undefined): void {
    runInAction(() => {
      this._projectKey = _config?.projectKey || 'systembootstrapper';
    });
  }

  @action generateProdProxyConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.useProdHost = _config?.useProdHost || 'true';
      this.prodHost = _config?.prodHost || `www.${this.projectKey}.com`;
      this.prodPort = parseInt(_config?.prodPort, 10) || 80;
      this.prodDomainMode = _config ? parseInt(_config.prodDomainMode, 10) : 2;
      this.prodDeployMode = _config ? parseInt(_config.prodDeployMode, 10) : 1;
      this.prodSSL = _config?.prodSSL.replace(/;/g, '')
        || `${this._main.config?.sslBaseDir}/${this.prodHost}/fullchain.pem`;
      this.prodSSLKey = _config?.prodSSLKey.replace(/;/g, '')
        || `${this._main.config?.sslBaseDir}/${this.prodHost}/privkey.pem`;
    });
  }

  @computed get prodHostInfo(): HostInfo {
    const host = (this.prodDomainMode === 1 || this.prodDomainMode === 3 ? '*.' : '')
        + this.prodHost;
    return {
      context   : 'Production',
      useHost   : this.useProdHost,
      host,
      port      : this.prodPort,
      domainMode: this.prodDomainMode,
      deployMode: this.prodDeployMode,
      ssl       : this.prodSSL,
      sslKey    : this.prodSSLKey,
      url       : (this.prodDomainMode < 2 ? 'http://' : 'https://') + host
    }
  }

  @action generateBetaProxyConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.useBetaHost = _config?.useBetaHost || 'false';
      this.betaHost = _config?.betaHost || `beta.${this.projectKey}.com`;
      this.betaPort = parseInt(_config?.betaPort, 10) || 80;
      this.betaDomainMode = _config ? parseInt(_config.betaDomainMode, 10) || 0 : 2;
      this.betaDeployMode = _config ? parseInt(_config.betaDeployMode, 10) || 0 : 1;
      this.betaSSL = _config?.betaSSL || `${this._main.config?.sslBaseDir}/${this.betaHost}/fullchain.pem`;
      this.betaSSLKey = _config?.betaSSLKey || `${this._main.config?.sslBaseDir}/${this.betaHost}/privkey.pem`;
    });
  }

  @computed get betaHostInfo() : HostInfo {
    const host = (this.betaDomainMode === 1 || this.betaDomainMode === 3 ? '*.' : '')
        + this.betaHost;
    return {
      context   : 'Beta',
      useHost   : this.useBetaHost,
      host,
      port      : this.betaPort,
      domainMode: this.betaDomainMode,
      deployMode: this.betaDeployMode,
      ssl       : this.betaSSL,
      sslKey    : this.betaSSLKey,
      url       : (this.betaDomainMode < 2 ? 'http://' : 'https://') + host
    }
  }

 @action generateReviewProxyConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.useReviewHost = _config?.useReviewHost || 'true';
      this.reviewHost = _config?.reviewHost || `${this.projectKey}.com`;
      this.reviewPort = parseInt(_config?.betaPort, 10) || 80;
      this.reviewDomainMode = _config ? parseInt(_config.reviewDomainMode, 10) || 0 : 1;
      this.reviewDeployMode = _config ? parseInt(_config.reviewDeployMode, 10) || 0 : 1;
      this.reviewSSL = _config?.betaSSL || `${this._main.config?.sslBaseDir}/${this.reviewHost}/fullchain.pem`;
      this.reviewSSLKey = _config?.betaSSLKey || `${this._main.config?.sslBaseDir}/${this.reviewHost}/privkey.pem`;
    });
  }

  @computed get reviewHostInfo() : HostInfo{
   const host = (this.reviewDomainMode === 1 || this.reviewDomainMode === 3 ? '*.' : '')
     + this.reviewHost;
   return {
     context   : 'Review',
     useHost   : this.useReviewHost,
     host,
     port      : this.reviewPort,
     domainMode: this.reviewDomainMode,
     deployMode: this.reviewDeployMode,
     ssl       : this.reviewSSL,
     sslKey    : this.reviewSSLKey,
     url       : (this.reviewDomainMode < 2 ? 'http://' : 'https://') + host
   }
 }

   @action generateRunnerConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.gitlabRunnerDockerScale = parseInt(_config?.gitlabRunnerDockerScale, 10) || 0;
      this.gitlabRunnerToken = _config?.gitlabRunnerToken || 'secret-token';
    });
  }
   public setProperty(propertyKey: any, value: any){
     switch (propertyKey) {
     case 'PROJECT_NAME': this.projectKey = value; break;
     case 'USE_PROD_HOST': this.useProdHost = value; break;
     case 'PROD_HOST': this.prodHost = value; break;
     case 'PROD_PORT': this.prodPort = parseInt(value, 10); break;
     case 'PROD_DOMAIN_MODE': this.prodDomainMode = parseInt(value, 10); break;
     case 'PROD_SSL': this.prodSSL = value.replace(/;/g, ''); break;
     case 'PROD_SSL_KEY': this.prodSSLKey = value.replace(/;/g, ''); break;
     case 'USE_BETA_HOST': this.useBetaHost = value; break;
     case 'BETA_HOST': this.betaHost = value; break;
     case 'BETA_PORT': this.betaPort = parseInt(value, 10); break;
     case 'BETA_DOMAIN_MODE': this.betaDomainMode = parseInt(value, 10); break;
     case 'BETA_SSL': this.betaSSL = value.replace(/;/g, ''); break;
     case 'BETA_SSL_KEY': this.betaSSLKey = value.replace(/;/g, ''); break;
     case 'USE_REVIEW_HOST': this.useReviewHost = value; break;
     case 'REVIEW_HOST': this.reviewHost = value; break;
     case 'REVIEW_PORT': this.reviewPort = parseInt(value, 10); break;
     case 'REVIEW_DOMAIN_MODE': this.reviewDomainMode = parseInt(value, 10); break;
     case 'GITLAB_RUNNER_TOKEN': this.gitlabRunnerToken = value || 'secret-token'; break;
     case 'GITLAB_RUNNER_DOCKER_SCALE': this.gitlabRunnerDockerScale = parseInt(value, 10); break;
     }
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
PROD_SSL=${this.prodSSL}
PROD_SSL_KEY=${this.prodSSLKey}
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
BETA_SSL=${this.betaSSL}
BETA_SSL_KEY=${this.betaSSLKey}
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
REVIEW_SSL=${this.reviewSSL}
REVIEW_SSL_KEY=${this.reviewSSLKey}
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

   public get gitlabCi() : string {
     const ret = Helper.textLogo + `# Gitlab CI Definition
# ProjectID: ${this.projectKey}
${this.useProdHost === 'true' ? `# Production: ${this.prodHostInfo.url}` : ''}
${this.useBetaHost === 'true' ? `# Beta: ${this.betaHostInfo.url}` : ''}
${this.useReviewHost === 'true' ? `# Review Apps: ${this.reviewHostInfo.url}` : ''}
# Filepath: ./gitlab-ci.yml
image: docker:latest
services:
  - docker:dind
variables:
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
  npm_config_cache: "$CI_PROJECT_DIR/.npm"
  CYPRESS_CACHE_FOLDER: "$CI_PROJECT_DIR/cache/Cypress"
stages:
  - build
  - test
  - deploy
cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths:
    - .npm
    - cache/Cypress
    - node_modules
build:
  stage: build
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG
  only:
    - merge_requests
    - master
test:cypress:
  stage: test
  services:
    - name: $IMAGE_TAG
      alias: alpha-host
  image: cypress/base:10
  script:
    - npm ci
    # check Cypress binary path and cached versions
    # useful to make sure we are not carrying around old versions
    - npx cypress cache path
    - npx cypress cache list
    - npx cypress run --config baseUrl=http://alpha-host:80
  artifacts:
    when: always
    paths:
      - cypress/videos/**/*.mp4
      - cypress/screenshots/**/*.png
    expire_in: 1 day
  only:
    - merge_requests
    - master
test:review:
  stage: test
  environment:
    name: review/$CI_BUILD_REF_NAME
    url: http://$CI_BUILD_REF_SLUG.${this.reviewHost}
    on_stop: stop:review
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
    - set +e
    - docker stop $CI_BUILD_REF_SLUG.${this.reviewHost}
    - docker rm $CI_BUILD_REF_SLUG.${this.reviewHost}
    - set -e
  script:
    - docker run -itd --network `
    + `${this.projectKey}_review_1 -e VIRTUAL_HOST=$CI_BUILD_REF_SLUG.${this.reviewHost} `
    + `--name $CI_BUILD_REF_SLUG.${this.reviewHost} $IMAGE_TAG
  except:
    - master
  only:
    - merge_requests
  ${this.reviewDeployMode === 0 && 'when: manual' || ''}
stop:review:
  stage: deploy
  allow_failure: true
  script:
    - docker stop $CI_BUILD_REF_SLUG.${this.reviewHost}
    - docker rm $CI_BUILD_REF_SLUG.${this.reviewHost}
  environment:
    name: review/$CI_BUILD_REF_NAME
    action: stop
  when: manual
  only:
    - merge_requests
`;
     const beta = `
deploy:beta:
  stage: deploy
  environment:
    name: production/beta
    url: ${this.betaDomainMode < 2 ? 'http://' : 'https://'}${this.betaHost}
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
    - set +e
    - docker stop ${this.betaHost}
    - docker rm ${this.betaHost}
    - set -e
  script:
    - docker run -itd --network ${this.projectKey}_beta_1 `
    + `-e VIRTUAL_HOST=${this.betaHost} `
    + `--name ${this.betaHost} $IMAGE_TAG
  only:
    - master
  ${this.betaDeployMode === 0 && 'when: manual' || ''}
`;
     const prod = `
deploy:prod:
  stage: deploy
  environment:
    name: production/www
    url: ${this.prodDomainMode < 2 ? 'http://' : 'https://'}${this.prodHost}
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login --username $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
    - set +e
    - docker stop ${this.prodHost}
    - docker rm ${this.prodHost}
    - set -e
  script:
    - docker run -itd --network ${this.projectKey}_prod_1 `
      + `-e VIRTUAL_HOST=${this.prodHost} `
      + `--name ${this.prodHost} $IMAGE_TAG
  only:
    - master
  ${this.prodDeployMode === 0 && 'when: manual' || ''}
`;
     return ret
     + (this.useBetaHost === 'true' && beta || '')
     + (this.useProdHost === 'true' && prod || '');
   }

   public exportGitlabCi() {
     const file = new File([this.gitlabCi],
       'gitlab-ci.yml', { type: 'text/plain;charset=utf-8' });
     FileSaver.saveAs(file);
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
         prodDomainMode: this.prodDomainMode,
         prodDeployMode: this.prodDeployMode
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
         betaDomainMode: this.betaDomainMode,
         betaDeployMode: this.betaDeployMode
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
         reviewDomainMode: this.reviewDomainMode,
         reviewDeployMode: this.reviewDeployMode
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