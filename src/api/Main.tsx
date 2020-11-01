import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction
} from 'mobx';
import MainConfig from './MainConfig';
import ProjectConfig from './ProjectConfig';

/**
 * General Configuration Object
 */
export default class Main {
    @observable private _placeHolder!: MainConfig;
    @observable private _config!: MainConfig | undefined;
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
}
