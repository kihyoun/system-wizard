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
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const res = await axios.get(this.serverAddress + '/config/main', this.getHeaders());
        this.main.importEnvData(res.data);
        const projects = await axios.get(this.serverAddress + '/config/projects', this.getHeaders());
        let skipCount = 0;
        projects.data.forEach((fileinfo:any) => {
          try {
            this.main.importProjectEnvData(fileinfo);
          } catch (err) {
            skipCount++;
            console.log(`${fileinfo.filename} is invalid, skipped`);
          }
        })
        resolve(skipCount);
      } catch (err) {
        reject(err)
      }
    });
  }

  @action push() {
    return new Promise(async (resolve, reject) => {
      try {
        this.main.generateZip().then( async (bootstrapperRaw:any) => {
          const file = new File([bootstrapperRaw], 'bootstrapper.zip');
          const formData = new FormData();
          formData.append('bootstrapper.zip',file);
          await this.token();
          const res = await axios.post(this.serverAddress + '/config/zip',
            formData,
            this.getFileHeaders());
          resolve(res);
        });
      } catch(err) {
        reject(err)
      }
    });
  }

  @action restart() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const options:any = Object.assign(this.getHeaders(), {
          method: 'PATCH',
          url   : this.serverAddress + '/command/restart'
        });

        const res = await axios.request(options);
        resolve(res);
      } catch(err) {
        reject(err)
      }
    });
  }

  @action deleteMain() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const res = await axios.delete(this.serverAddress + '/config/main', this.getHeaders());
        resolve(res);
      } catch(err) {
        reject(err)
      }
    });
  }

  @action deleteProjects() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const res = await axios.delete(this.serverAddress + '/config/projects', this.getHeaders());
        resolve(res);
      } catch(err) {
        reject(err)
      }
    });
  }

  @action restore() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const options:any = Object.assign(this.getHeaders(), {
          method: 'PATCH',
          url   : this.serverAddress + '/command/restore'
        });
        const res = await axios.request(options);
        resolve(res);
      } catch(err) {
        reject(err)
      }
    });
  }

  @action hotPatch() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.token();
        const options:any = Object.assign(this.getHeaders(), {
          method: 'PATCH',
          url   : this.serverAddress + '/command/system/patch'
        });
        const res = await axios.request(options);
        resolve(res);
      } catch(err) {
        reject(err)
      }
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

  @computed getFileHeaders() {
    return {
      headers: {
        'Content-Type' : 'multipart/form-data',
        'Authorization': `Bearer ${this.accessToken}`
      }
    };
  }

  @computed getHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.accessToken}` ,
        'Content-Type' : 'application/x-www-form-urlencoded'
      }
    };
  }

  serverAddress!:string;
  userName!:string;
  accessToken!:string;
  refreshToken!:string;
  connected!:boolean;
}