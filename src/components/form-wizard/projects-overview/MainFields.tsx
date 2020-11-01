import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const MainFields = observer((props: any) => {
  const [inputDelay, setInputDelay] = useState(setTimeout(() => {return undefined},0));
  const [projectKey, setProjectKey] = useState(props.config.projectKey);

  if (props.hidden) return null;

  return (
    <>
      <TextField
        label="PROJECT_NAME"
        style={{ margin: 8 }}
        value={projectKey}
        helperText="This must be a unique key"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          clearTimeout(inputDelay);
          const value = event.target.value;
          setProjectKey(value);
          const timeout = setTimeout(() => {
            runInAction(() => {
              try {
                props.config.projectKey = value;
              } catch (e) {
                props.openAlert(value);
                setProjectKey(props.config.projectKey);
              }
            });
          }, 300);
          setInputDelay(timeout);
        }}
      />
    </>
  );
});

export default MainFields;
