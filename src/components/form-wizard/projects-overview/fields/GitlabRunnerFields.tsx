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
  const [init, setInit] = useState(props.init);

  const handleInputChange = (event: any) => {
    runInAction(() => {
      props.config.gitlabRunnerScale =
      event.target.value === '' ? 0 : Number(event.target.value)
    });
  };

  useEffect(() => {
    if (init && !props.hidden) {
      runInAction(() => props.config.generateRunnerConfig());
      setInit(false);
    }
  }, [props.init, props.hidden]);

  const handleBlur = () => {
    if ( props.config.gitlabRunnerScale < 0) {
      runInAction(() => props.config.gitlabRunnerScale = 0);
    } else if (props.config.gitlabRunnerScale > 50) {
      runInAction(() => props.config.gitlabRunnerScale = 50);
    }
  };

  if (props.hidden) return null;

  return (
    <>
      <FormLabel component="legend">Number of Gitlab Runners</FormLabel>
      <Input
        className={classes.input}
        value={props.config.gitlabRunnerScale}
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
        value={props.config.gitlabRunnerToken}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.config.gitlabRunnerToken = event.target.value));
        }}
      />
    </>
  );
});

export default GitlabRunnerFields;
