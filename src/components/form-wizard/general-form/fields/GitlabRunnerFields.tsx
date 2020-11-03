import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import {
  FormLabel,
  Input,
  makeStyles
} from '@material-ui/core';
import { observer } from 'mobx-react';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  },
  input: { width: 42 }
}));

const GitlabRunnerFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(true);

  const handleInputChange = (event: any) => {
    runInAction(() => {
      props.main.config.gitlabRunnerDockerScale =
      event.target.value === '' ? 0 : Number(event.target.value)
    });
  };

  useEffect(() => {
    if (init && !props.hidden) {
      runInAction(() => {
        props.main.config.generateRunnerConfig()
        setInit(false);
      });
    }
    if (!props.main.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.main.init]);

  const handleBlur = () => {
    if ( props.main.config.gitlabRunnerDockerScale < 0) {
      runInAction(() => props.main.config.gitlabRunnerDockerScale = 0);
    } else if (props.main.config.gitlabRunnerDockerScale > 50) {
      runInAction(() => props.main.config.gitlabRunnerDockerScale = 50);
    }
  };

  if (props.hidden) return null;

  return (
    <>
      <FormLabel component="legend">Number of Gitlab Runners</FormLabel>
      <Input
        className={classes.input}
        defaultValue={props.main.config.gitlabRunnerDockerScale}
        margin="dense"
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
        label="GITLAB_RUNNER_TOKEN"
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

export default GitlabRunnerFields;
