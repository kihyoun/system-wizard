import React from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';

const BackupForm = (props: any) => {
  const main = props.main;
  return (
    <>
      <TextField
        label="LIVEDIR"
        style={{ margin: 8 }}
        defaultValue={main.config.liveDir}
        placeholder={main.placeholder.liveDir}
        helperText="Persistent/temporary Storage Folder.
          Must be read/writable by the Docker User"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.liveDir = event.target.value));
        }}
      />
      <TextField
        label="BACKUPDIR"
        defaultValue={main.config.backupDir}
        style={{ margin: 8 }}
        placeholder={main.placeholder.backupDir}
        helperText="Location for persistent Data, will be synced with rsync"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.backupDir = event.target.value));
        }}
      />
    </>
  );
};

export default BackupForm;
