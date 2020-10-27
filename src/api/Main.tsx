import { action, computed, observable } from 'mobx';
import MainConfig from './MainConfig';

/**
 * General Configuration Object
 */
export default class Main {
    @observable private _placeHolder: MainConfig | undefined;
    @observable private _config: MainConfig | undefined;
    private _generatingConfig = false;

    /**
     * Set Config
     * @param {MainConfig|undefined} config MainConfig
     */
    constructor(_config: MainConfig | undefined = undefined) {
      if (typeof this._config === 'undefined') {
        this._generatingConfig = true;
        console.log('generate main config');
        this.generateConfig();
        this._generatingConfig = false;
      } else {
        console.log('import main config');
        this._config = _config;
      }
    }

    @action public generateConfig(): void {
      this._config = new MainConfig();
      this._placeHolder = new MainConfig(this._config);
    }

    @computed public get placeholder(): MainConfig | undefined {
      return this._placeHolder;
    }

    @computed public get config(): MainConfig | undefined {
      return this._config;
    }
}
