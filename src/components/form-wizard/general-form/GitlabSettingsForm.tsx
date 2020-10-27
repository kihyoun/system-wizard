import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const GitlabSettingsForm = observer((props: any) => {
  const main = props.main;
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (props.gitlabSettings.visible && props.gitlabSettings.initialize) {
      props.main.config.generateGitlabConfig();
      setInit(true);
    }
  }, [props.gitlabSettings.visible, props.gitlabSettings.initialize]);

  if (!init || !props.gitlabSettings.visible) return null;

  return (
    <>
      <TextField
        label="GITLAB_HOME"
        defaultValue={main.config.gitlabHome}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabHome}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.gitlabHome = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_HOST"
        defaultValue={main.config.gitlabHost}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabHost}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.gitlabHost = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_REGISTRY_HOST"
        defaultValue={main.config.gitlabRegistryHost}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabRegistryHost}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.gitlabRegistryHost = event.target.value));
        }}
      />
    </>
  );
});

export default GitlabSettingsForm;
