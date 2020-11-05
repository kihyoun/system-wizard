import FileSaver from 'file-saver';
import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction
} from 'mobx';
import MainConfig from './MainConfig';
import ProjectConfig, { ProjectConfigInterface } from './ProjectConfig';
import JSZip from 'jszip';

/**
 * General Configuration Object
 */
export default class Main {
    @observable private _placeHolder!: MainConfig;
    @observable private _config!: MainConfig;
    @observable private _projects: Map<string, ProjectConfig>;
    init = true;
    uploadProgress = false;

    /**
     * Set Config
     * @param {MainConfig|undefined} config MainConfig
     */
    constructor(
      _config: MainConfig | undefined = undefined,
      _projects: Map<string, ProjectConfig> | undefined = undefined
    ) {
      makeAutoObservable(this);
      this.generateConfig(_config);

      this._projects = _projects || observable(new Map<string, ProjectConfig>());
    }

    @action public generateConfig(_config: any | undefined): void {
      this._config = new MainConfig(_config);
      this._placeHolder = new MainConfig(_config);
    }

    @computed public get placeholder(): MainConfig | undefined {
      return this._placeHolder;
    }

    @computed public get config(): MainConfig | undefined {
      return this._config;
    }

    @action public addProject(project: ProjectConfig) {
      runInAction(() => {
        this._projects.set(project.projectKey, project);
        project.saved = true;
      });
    }

    @action public saveProject(project: ProjectConfig, oldConfig: ProjectConfig) {
      runInAction(() => {
        this._projects.delete(oldConfig.projectKey);
        this._projects.set(project.projectKey, project);
        project.saved = true;
      });
    }

    @computed get projects(): Map<string, ProjectConfig> {
      return this._projects;
    }

    @computed public get asJson() {
      const proxies:ProjectConfigInterface[] = [];
      this._projects.forEach(config => proxies.push(config.asJson));

      return {
        main   : this._config.asJson,
        proxies: proxies
      }
    }

    public exportJson() {
      const file = new Blob([JSON.stringify(this.asJson, null, 4)],
        { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(file, 'bootstrapper.json');
    }

    public importFile(file: File, result:string) {
      if (file.name.substr(-4) === 'json') {
        this.importJson(file, result);
      } else if (file.name.substr(-3) === 'env') {
        this.importEnv(file, result);
      }
    }

    public importProjectFile(file: File, result:string) {
      if (file.name.substr(-3) === 'env') {
        this.importProjectEnv(file, result);
      }
    }

    public importJson(file:File, result:string) {
      const config = JSON.parse(result);
      runInAction(() => this.uploadProgress = true);
      runInAction(() => {
        this.generateConfig(config.main);
        this._projects = observable(new Map<string, ProjectConfig>());
        config.proxies.forEach((pConfig:ProjectConfigInterface) => {
          this._projects.set(pConfig.projectKey, new ProjectConfig(this, pConfig));
        });
        this.init = false;
        this.uploadProgress = false;
        console.group('JSON File import');
        console.log(`Filename: ${file.name}`)
        console.log('Raw data:', `\n${result}`);
        console.groupEnd();
      });
    }

    public importEnv(file:File, result:string) {
      runInAction(() => {
        this.uploadProgress = true;
        this.init=false;
      });
      runInAction(() => {
        const lines = result.split('\n');
        lines.forEach(line => {
        // Skip comments
          if (line.substr(0, 1) === '#' || line.length < 3) {
            return;
          }
          const parts = line.split('=');
          const value = parts[1];
          const key = parts[0].split(' ').reverse()[0];
          this._config.setProperty(key, value);
        });
        this.uploadProgress = false;
        console.group('Env File import');
        console.log(`Filename: ${file.name}`)
        console.log('Raw data:', `\n${result}`);
        console.groupEnd();
      });
    }

    public importProjectEnv(file:File, result:string) {
      const config = new ProjectConfig(this);
      runInAction(() => {
        this.uploadProgress = true;
        this.init = false;
      });
      runInAction(() => {
        const lines = result.split('\n');
        lines.forEach(line => {
        // Skip comments
          if (line.substr(0, 1) === '#' || line.length < 3) {
            return;
          }
          const parts = line.split('=');
          const value = parts[1];
          const key = parts[0].split(' ').reverse()[0];
          config.setProperty(key, value);
        });
        this.addProject(config);
        this.uploadProgress = false;
        console.group('Env File import');
        console.log(`Filename: ${file.name}`)
        console.log('Raw data:', `\n${result}`);
        console.groupEnd();
      });
    }

    public exportZip() {
      const zip = new JSZip();
      zip.file('bootstrapper.json', JSON.stringify(this.asJson, null, 4));
      zip.file('.docker.env', this._config.content);
      const projects = zip.folder('.projects.env');
      this._projects.forEach(projectConfig => {
        projects?.file(`.${projectConfig.projectKey}.env`, projectConfig.content);
      });

      zip.generateAsync({ type: 'blob' }).then(function(content:any) {
        saveAs(content, 'bootstrapper.zip');
      });
    }

    public exportProjectConfigs() {
      const zip = new JSZip();
      const projects = zip.folder('.projects.env');
      this._projects.forEach(projectConfig => {
        projects?.file(`.${projectConfig.projectKey}.env`, projectConfig.content);
      });

      zip.generateAsync({ type: 'blob' }).then(function(content:any) {
        saveAs(content, 'projects.env.zip');
      });

    }

}
