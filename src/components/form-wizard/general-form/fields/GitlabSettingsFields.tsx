import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const GitlabSettingsFields = observer((props: any) => {
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        setInit(false);
        props.main.config.generateGitlabConfig()
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
        label="GITLAB_HOME"
        value={props.main.config.gitlabHome}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabHome}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.gitlabHome = event.target.value));
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
    </>
  );
});

export default GitlabSettingsFields;
