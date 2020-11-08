import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const ServerCredentialFields = observer((props: any) => {
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        props.main.sync.generateConfig();
        setInit(false);
      });
    }

    if (!props.main.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.main.init]);

  if (props.hidden) return null;

  return (
    <>
      <TextField
        label="Server Address"
        value={props.main.sync.serverAddress}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.main.sync.serverAddress = event.target.value);
        }}
      />
      <TextField
        label="Username"
        value={props.main.sync.userName}
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
