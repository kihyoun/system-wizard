import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const ServerCredentialFields = observer((props: any) => {
  const [serverAddress, setServerAddress] = useState(props.main.sync.serverAddress);

  useEffect(() => {
    runInAction(() => {
      if (props.init) {
        props.main.sync.generateConfig();
      }

      if (props.main.config.syncEnable === 'true' && props.main.config.syncHost) {
        setServerAddress(props.main.config.syncHostInfo.url);
      }
    });
  },[]);

  return (
    <>
      <TextField
        label="Server Address"
        value={serverAddress}
        style={{ margin: 8 }}
        name="serverAddress"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() =>{
            props.main.sync.serverAddress = event.target.value;
            setServerAddress(event.target.value);
          });
        }}
      />
      <TextField
        label="Username"
        value={props.main.sync.userName}
        name="userName"
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.main.sync.userName = event.target.value);
        }}
      />
      <TextField
        label="Password"
        value={props.password}
        style={{ margin: 8 }}
        fullWidth
        type={'password'}
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.setPassword(event.target.value));
        }}
      />
    </>
  );
});

export default ServerCredentialFields;
