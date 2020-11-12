import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import {
  FormControl, FormHelperText, InputLabel, makeStyles, NativeSelect
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin  : theme.spacing(1),
    minWidth: 120
  },
  paper: {
    padding : theme.spacing(2),
    margin  : 'auto',
    maxWidth: 1900
  },
  selectEmpty: { marginTop: theme.spacing(2) },
  heading    : {
    fontSize  : theme.typography.pxToRem(15),
    flexBasis : '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color   : theme.palette.text.secondary
  }
}));

const SSLSettingsFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        props.main.config.generateProxyConfig()
        setInit(false)
      });
    }
    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init]);

  if (props.hidden) return null;

  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="domainmode-native-helper">GITLAB_DOMAIN_MODE</InputLabel>
        <NativeSelect
          value={props.main.config.gitlabDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.main.config.gitlabDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'domainmode',
            id  : 'domainmode-native-helper'
          }}
        >
          <option value={0}>Default, HTTP</option>
          <option value={2}>SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.main.config.gitlabExternalUrl}</FormHelperText>
      </FormControl>
      <TextField
        label="GITLAB_SSL"
        disabled={props.main.config.gitlabDomainMode < 2}
        value={props.main.config.gitlabSSL}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabSSL}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Path to SSL Certificate"
        onChange={(event: any) => {
          runInAction(() => (props.main.config.gitlabSSL = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_SSL_KEY"
        disabled={props.main.config.gitlabDomainMode < 2}
        value={props.main.config.gitlabSSLKey}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabSSLKey}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Path to SSL Key"
        onChange={(event: any) => {
          runInAction(() => (props.main.config.gitlabSSLKey = event.target.value));
        }}
      />

      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="regdomainmode-native-helper">
              GITLAB_REGISTRY_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.main.config.gitlabRegistryDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.main.config.gitlabRegistryDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'regdomainmode',
            id  : 'regdomainmode-native-helper'
          }}
        >
          <option value={0}>Default, HTTP</option>
          <option value={2}>SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.main.config.gitlabRegistryUrl}</FormHelperText>
      </FormControl>
      <TextField
        label="GITLAB_REGISTRY_SSL"
        value={props.main.config.gitlabRegistrySSL}
        disabled={props.main.config.gitlabRegistryDomainMode < 2}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabRegistrySSL}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.gitlabRegistrySSL = event.target.value));
        }}
        helperText="Path to Registry SSL Certificate"
      />
      <TextField
        label="GITLAB_REGISTRY_SSL_KEY"
        disabled={props.main.config.gitlabRegistryDomainMode < 2}
        value={props.main.config.gitlabRegistrySSLKey}
        style={{ margin: 8 }}
        placeholder={props.main.placeholder.gitlabRegistrySSLKey}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.main.config.gitlabRegistrySSLKey = event.target.value));
        }}
        helperText="Path to Registry SSL Key"
      />
    </>
  );
});

export default SSLSettingsFields;
