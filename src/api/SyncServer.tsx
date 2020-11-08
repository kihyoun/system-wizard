import {
  action, makeAutoObservable, runInAction
} from 'mobx';
import Main from './Main';
import axios from 'axios';

/**
 * General Configuration Object
 */
export default class SyncServer {
  /**
   * Set Config
   * @param {ServerConfig} config ServerConfig
   */
  constructor(
    private main: Main,
    _config: any | undefined = undefined
  ) {
    makeAutoObservable(this);
    this.generateConfig(_config);
  }

  @action generateConfig(_config: any | undefined = undefined): void {
    runInAction(() => {
      this.serverAddress = _config?.serverAddress || this.main.config?.syncHostInfo.url;
      this.userName = _config?.userName || this.main.config?.syncUser;
      this.accessToken = _config?.accessToken || 'secret-token';
      this.refreshToken = _config?.refreshToken || 'secret-refresh-token';
      this.connected = _config?.connected || false;
    });
  }

  @action async login(username:string, password:string) {

    const options = {
      params : { '': '' },
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data   : {
        username,
        password
      }
    };

    axios.post(this.serverAddress + '/login', options).then(function (response) {
      console.log(response.data);
    }).catch(function (error) {
      console.error(error);
    });

  }

  serverAddress!:string;
  userName!:string;
  accessToken!:string;
  refreshToken!:string;
  connected!:boolean;
}