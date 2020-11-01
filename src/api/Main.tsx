import FileSaver from 'file-saver';
import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction
} from 'mobx';
import Helper from './Helper';
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

    @action public generateConfig(_config: MainConfig | undefined): void {
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
      const file = new Blob([Helper.jsonLogo + JSON.stringify(this.asJson, null, 4)],
        { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(file, 'bootstrapper.json');
    }

    public exportZip() {
      const zip = new JSZip();
      zip.file('bootstrapper.json', Helper.jsonLogo+this.asJson);
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
