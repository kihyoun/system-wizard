import {
  action, computed, makeAutoObservable, runInAction
} from 'mobx';
import Main from './Main';
import axios from 'axios';

/**
 * General Configuration Object
 */
export default class SyncServer {
  progress = 100;
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
      this.token().then(() =>
        axios.post(this.serverAddress + '/logout', { t: this.accessToken }, this.getHeaders()).then(res => {
          runInAction(() => {
            this.accessToken = '';
            this.refreshToken = '';
            this.connected = false;
          });
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      ).catch(err => reject(err));
    });
  }

  @action fetch() {
    return new Promise((resolve, reject) => {
      this.token().then(() => {
        axios.get(this.serverAddress + '/config/main', this.getHeaders())
          .then((res:any) => {
            try {
              this.main.importEnvData(res.data);
            } catch (err) {
              reject('Invalid Configuration');
            }
          }).catch(err => reject(err));
        axios.get(this.serverAddress + '/config/projects', this.getHeaders())
          .then((res:any) => {
            let skipCount = 0;
            res.data.forEach((fileinfo:any) => {
              try {
                this.main.importProjectEnvData(fileinfo);
              } catch (err) {
                skipCount++;
                console.log(`${fileinfo.filename} is invalid, skipped`);
              }
            })
            resolve(skipCount);
          }).catch(err => reject(err))
      }
      ).catch(err => {
        reject(err)
      });
    });
  }

  @action token() {
    return new Promise((resolve, reject) => {
      axios.post(this.serverAddress + '/token', { token: this.refreshToken })
        .then((res:any) => {
          this.accessToken = res.data.accessToken;
          resolve(res);
        }).catch(() => {
          reject('Login expired.');
          this.connected = false;
        });
    });
  }

  @computed getHeaders() {
    return {
      onDownloadProgress: (progressEvent:any) => {
        runInAction(() => this.progress = 100 * (progressEvent.loaded / progressEvent.total))
      },
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    };
  }

  serverAddress!:string;
  userName!:string;
  accessToken!:string;
  refreshToken!:string;
  connected!:boolean;
}