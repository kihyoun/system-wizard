import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const BackupFields = observer((props: any) => {
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        props.main.config.generateMainConfig();
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
        label="LIVEDIR"
        style={{ margin: 8 }}
        value={props.main.config.liveDir}
        helperText="Persistent/temporary Storage Folder.
          Must be read/writable by the Docker User"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.main.config.liveDir = event.target.value);
        }}
      />
      <TextField
        label="BACKUPDIR"
        value={props.main.config.backupDir}
        style={{ margin: 8 }}
        helperText="Location for persistent Data, will be synced with rsync"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => props.main.config.backupDir = event.target.value);
        }}
      />
    </>
  );
});

export default BackupFields;
