import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { TextField } from '@material-ui/core';

const GitlabSettingsFields = observer((props: any) => {
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        setInit(false);
        props.main.config.generateGitlabConfig()
      });
    }

    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init]);

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
        defaultValue={props.main.config.gitlabRunnerScale}
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

export default GitlabSettingsFields;
