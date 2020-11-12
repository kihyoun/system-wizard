import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import {
  FormControl,
  FormControlLabel,
  InputLabel, makeStyles,
  NativeSelect
} from '@material-ui/core';
import { observer } from 'mobx-react';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  }
}));

const BetaFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (init && !props.hidden) {
      runInAction(() => props.config.generateBetaProxyConfig());
      setInit(false);
    }
  }, [props.init, props.hidden]);

  if (props.hidden) return null;

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={props.config.useBetaHost === 'true'}
            onChange={event => {
              runInAction(() =>
                props.config.useBetaHost = event.target.checked ? 'true' : 'false'
              );
            }}
            name="betaCfg"
            color="primary"
          />
        }
        label="Enable Beta Environment"
      />
      <TextField
        disabled={props.config.useBetaHost==='false'}
        label="BETA_HOST"
        style={{ margin: 8 }}
        value={props.config.betaHost}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.config.betaHost = event.target.value));
        }}
      />
      <FormControl className={classes.formControl}
        disabled={props.config.useBetaHost==='false'}
      >
        <InputLabel htmlFor="betadeploymode-native-helper">
              Deployment
        </InputLabel>
        <NativeSelect
          value={props.config.betaDeployMode}
          onChange={(event: any) => {
            runInAction(() => (props.config.betaDeployMode = event.target.value));
          }}
          inputProps={{
            name: 'betaDeployMode',
            id  : 'betaDeployMode-native-helper'
          }}
        >
          <option value={0}>Manual</option>
          <option value={1}>Auto</option>
        </NativeSelect>
      </FormControl>
      <FormControl className={classes.formControl}
        disabled={props.config.useBetaHost==='false'}
      >
        <InputLabel htmlFor="regdomainmode-native-helper">
              BETA_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.config.betaDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.config.betaDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'betaDomainMode',
            id  : 'betaDomainMode-native-helper'
          }}
        >
          <option aria-label="Default (unencrypted)" value={0}>
                Default, HTTP
          </option>
          <option value={1}>Wildcard HTTP</option>
          <option value={2}>SSL encrypted</option>
          <option value={3}>Wildcard SSL encrypted</option>
        </NativeSelect>
      </FormControl>
      <TextField
        label="BETA_SSL"
        disabled={props.config.useBetaHost === 'false'
          || props.config.betaDomainMode < 2}
        value={props.config.betaSSL}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.betaSSL = event.target.value));
        }}
        helperText="Path to Registry SSL Certificate"
      />
      <TextField
        label="BETA_SSL_KEY"
        disabled={props.config.useBetaHost === 'false' || props.config.betaDomainMode < 2}
        value={props.config.betaSSLKey}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.betaSSLKey = event.target.value));
        }}
        helperText="Path to SSL Key"
      />
    </>
  );
});

export default BetaFields;
