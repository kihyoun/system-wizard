import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';

const BackupFields = (props: any) => {
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => props.main.config.generateMainConfig());
      setInit(false);

    }
  }, [props.hidden, props.init]);

  if (props.hidden) return null;

  return (
    <>
      <TextField
        label="LIVEDIR"
        style={{ margin: 8 }}
        defaultValue={props.main.config.liveDir}
        placeholder={props.main.placeholder.liveDir}
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
        defaultValue={props.main.config.backupDir}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.backupDir}
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
};

export default BackupFields;
