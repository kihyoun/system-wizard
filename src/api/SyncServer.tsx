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

  @action login(username:string, password:string) {
    const data = {
      username,
      password
    };

    return new Promise((resolve, reject) => {
      axios.post(this.serverAddress + '/login', data).then(res => {
        runInAction(() => {
          this.accessToken = res.data.accessToken;
          this.refreshToken = res.data.refreshToken;
          this.connected = true;
        });
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }

  @action logout() {
    return new Promise((resolve, reject) => {
      axios.post(this.serverAddress + '/logout').then(() => {
        runInAction(() => {
          this.accessToken = '';
          this.refreshToken = '';
          this.connected = false;
        });
        resolve();
      }).catch(err => {
        reject(err);
      });
    });
  }

  serverAddress!:string;
  userName!:string;
  accessToken!:string;
  refreshToken!:string;
  connected!:boolean;
}