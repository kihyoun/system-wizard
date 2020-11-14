import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import {
  FormControl, FormControlLabel, FormHelperText, InputAdornment, InputLabel, makeStyles, NativeSelect
} from '@material-ui/core';
import Switch from '@material-ui/core/Switch';
const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  },
  positionStart: { marginRight: 0 }
}));
const WizardFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.main.init);
  useEffect(() => {
    if (!props.hidden && init && props.main.init) {
      runInAction(() => {
        props.main.config.generateWizardConfig();
        setInit(false);
      });
    }
    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init, props.main.init]);

  if (props.hidden) return null;

  return (
    <>
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
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.main.config.seedDir}</InputAdornment>
        }}
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
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.main.config.seedDir}</InputAdornment>
        }}
      />
    </>
  );
});

export default WizardFields;
