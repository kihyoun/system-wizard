import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  InputLabel, makeStyles,
  NativeSelect
} from '@material-ui/core';
import { observer } from 'mobx-react';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  },
  positionStart: { marginRight: 0 }
}));

const ProdFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (init && !props.hidden) {
      runInAction(() => props.config.generateProdProxyConfig());
      setInit(false);
    }
  }, [props.init, props.hidden]);

  if (props.hidden) return null;

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={props.config.useProdHost === 'true'}
            onChange={event => {
              runInAction(() => props.config.useProdHost
                  = event.target.checked ? 'true' : 'false')
            }}
            name="prodCfg"
            color="primary"
          />
        }
        label="Enable Production Environment"
      />
      <TextField
        disabled={props.config.useProdHost === 'false'}
        label="PROD_HOST"
        style={{ margin: 8 }}
        value={props.config.prodHost}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.config.prodHost = event.target.value));
        }}
      />
      <FormControl className={classes.formControl}
        disabled={props.config.useProdHost==='false'}
      >
        <InputLabel htmlFor="proddeploymode-native-helper">
              Deployment
        </InputLabel>
        <NativeSelect
          value={parseInt(props.config.prodDeployMode)}
          onChange={(event: any) => {
            runInAction(() => (props.config.prodDeployMode = event.target.value));
          }}
          inputProps={{
            name: 'prodDeployMode',
            id  : 'prodDeployMode-native-helper'
          }}
        >
          <option value={0} aria-label="Manual" >Manual</option>
          <option value={1}>Auto</option>
        </NativeSelect>
      </FormControl>

      <FormControl className={classes.formControl}
        disabled={props.config.useProdHost === 'false'}
      >
        <InputLabel htmlFor="regdomainmode-native-helper">
              PROD_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.config.prodDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.config.prodDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'prodDomainMode',
            id  : 'prodDomainMode-native-helper'
          }}
        >
          <option aria-label="Default (unencrypted)" value={0}>
                Default, HTTP
          </option>
          <option value={1}>Wildcard HTTP</option>
          <option value={2}>SSL encrypted</option>
          <option value={3}>Wildcard SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.config.prodHostInfo.url}</FormHelperText>
      </FormControl>
      <TextField
        label="PROD_SSL"
        disabled={props.config.useProdHost === 'false' || props.config.prodDomainMode < 2}
        value={props.config.prodSSL}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.prodSSL = event.target.value));
        }}
        helperText="Path to Registry SSL Certificate"
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.config.main.config.seedDir}</InputAdornment>
        }}
      />
      <TextField
        label="PROD_SSL_KEY"
        disabled={props.config.useProdHost === 'false' || props.config.prodDomainMode < 2}
        value={props.config.prodSSLKey}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.prodSSLKey = event.target.value));
        }}
        helperText="Path to SSL Key"
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.config.main.config.seedDir}</InputAdornment>
        }}
      />
    </>
  );
});

export default ProdFields;
