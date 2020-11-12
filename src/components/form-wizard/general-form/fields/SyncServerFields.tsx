import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import {
  FormControl, FormControlLabel, FormHelperText, InputLabel, makeStyles, NativeSelect
} from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  }
}));
const SyncServerFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.init);
  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        props.main.config.generateSyncConfig();
        setInit(false);
      });
    }
    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init]);

  if (props.hidden) return null;

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={props.main.config.syncEnable === 'true'}
            onChange={event => {
              runInAction(() => props.main.config.syncEnable = event.target.checked ? 'true' : 'false' )
            }}
            color="primary"
          />
        }
        label="Enable Synchronization Server"
      />
      <FormControl className={classes.formControl}
        disabled={props.main.config.syncEnable === 'false'}
      >
        <InputLabel htmlFor="syncdomainmode-native-helper">
              SYNC_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.main.config.syncDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.main.config.syncDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'syncDomainMode',
            id  : 'syncDomainMode-native-helper'
          }}
        >
          <option aria-label="Default (unencrypted)" value={0}>
                Default, HTTP
          </option>
          <option value={2}>SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.main.config.syncHostInfo.url}</FormHelperText>
      </FormControl>
      <TextField
        label="SYNC_HOST"
        disabled={props.main.config.syncEnable === 'false'}
        value={props.main.config.syncHost}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.syncHost = event.target.value));
        }}
      />
      <TextField
        label="SYNC_USER"
        disabled={props.main.config.syncEnable === 'false'}
        value={props.main.config.syncUser}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.syncUser = event.target.value));
        }}
      />
      <TextField
        label="SYNC_PASS"
        disabled={props.main.config.syncEnable === 'false'}
        value={props.main.config.syncPass}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.syncPass = event.target.value));
        }}
      />
      <TextField
        label="SYNC_SSL"
        disabled={props.main.config.syncEnable === 'false' || props.main.config.syncDomainMode < 2}
        value={props.main.config.syncSSL}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.syncSSL = event.target.value));
        }}
        helperText="Path to SSL Certificate"
      />
      <TextField
        label="SYNC_SSL_KEY"
        disabled={props.main.config.syncEnable === 'false' || props.main.config.syncDomainMode < 2}
        value={props.main.config.syncSSLKey}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.syncSSLKey = event.target.value));
        }}
        helperText="Path to SSL Key"
      />

      <FormControlLabel
        control={
          <Switch
            checked={props.main.config.wizardEnable === 'true'}
            onChange={event => {
              runInAction(() => props.main.config.wizardEnable = event.target.checked ? 'true' : 'false' )
            }}
            color="primary"
          />
        }
        label="Enable Wizard"
      />
      <FormControl className={classes.formControl}
        disabled={props.main.config.wizardEnable === 'false'}
      >
        <InputLabel htmlFor="wizarddomainmode-native-helper">
              WIZARD_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.main.config.wizardDomainMode}
          onChange={(event: any) => {
            runInAction(() => props.main.config.wizardDomainMode = event.target.value);
          }}
          inputProps={{
            name: 'wizardDomainMode',
            id  : 'wizardDomainMode-native-helper'
          }}
        >
          <option aria-label="Default (unencrypted)" value={0}>
                Default, HTTP
          </option>
          <option value={2}>SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.main.config.wizardHostInfo.url}</FormHelperText>
      </FormControl>
      <TextField
        label="WIZARD_HOST"
        disabled={props.main.config.wizardEnable === 'false'}
        value={props.main.config.wizardHost}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.wizardHost = event.target.value));
        }}
      />
      <TextField
        label="WIZARD_SSL"
        disabled={props.main.config.wizardEnable === 'false' || props.main.config.wizardDomainMode < 2}
        value={props.main.config.wizardSSL}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.wizardSSL = event.target.value));
        }}
        helperText="Path to SSL Certificate"
      />
      <TextField
        label="WIZARD_SSL_KEY"
        disabled={props.main.config.wizardEnable === 'false' || props.main.config.wizardDomainMode < 2}
        value={props.main.config.wizardSSLKey}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => props.main.config.wizardSSLKey = event.target.value);
        }}
        helperText="Path to SSL Key"
      />
    </>
  );
});

export default SyncServerFields;