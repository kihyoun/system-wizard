import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const StartFields = observer((props: any) => {
  const [init, setInit] = useState(props.main.init);

  useEffect(() => {
    if (!props.hidden && init && props.main.init) {
      runInAction(() => {
        props.main.config.generateMainConfig();
        setInit(false);
      });
    }

    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init, props.main.init]);

  if (props.hidden) return null;

  const handleInputChange = (event: any) => {
    runInAction(() => {
      props.main.config.gitlabRunnerScale =
      event.target.value === '' ? 0 : Number(event.target.value)
    });
  };

  const handleBlur = () => {
    if ( props.main.config.gitlabRunnerScale < 0) {
      runInAction(() => props.main.config.gitlabRunnerScale = 0);
    } else if (props.main.config.gitlabRunnerScale > 50) {
      runInAction(() => props.main.config.gitlabRunnerScale = 50);
    }
  };

  return (
    <>
      <TextField
        label="SEED_DIR"
        value={props.main.config.seedDir}
        style={{ margin: 8 }}
        helperText="Location for persistent Data, will be synced with rsync"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.main.config.seedDir = event.target.value);
        }}
      />
      <TextField
        label="GITLAB_HOST"
        value={props.main.config.gitlabHost}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabHost}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.gitlabHost = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_REGISTRY_HOST"
        value={props.main.config.gitlabRegistryHost}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabRegistryHost}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.gitlabRegistryHost = event.target.value));
        }}
      />
      <TextField
        label="Gitlab Runners"
        fullWidth
        margin="normal"
        style={{ margin: 8 }}
        InputLabelProps={{ shrink: true }}
        value={props.main.config.gitlabRunnerScale}
        onChange={e => handleInputChange(e)}
        onBlur={()=> handleBlur()}
        inputProps={{
          step             : 1,
          min              : 0,
          max              : 50,
          type             : 'number',
          'aria-labelledby': 'input-slider'
        }}
      />
      <TextField
        label="Secret Runner Token"
        style={{ margin: 8 }}
        value={props.main.config.gitlabRunnerToken}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.gitlabRunnerToken = event.target.value));
        }}
      />
    </>
  );
});

export default StartFields;
