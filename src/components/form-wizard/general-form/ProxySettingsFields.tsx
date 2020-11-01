import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import {
  FormControl, InputLabel, makeStyles, NativeSelect
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

const ProxySettingsFields = observer((props: any) => {
  const classes = useStyles();
  const main = props.main;

  useEffect(() => {
    if (!props.hidden && props.init) {
      props.main.config.generateProxyConfig();
    }
  }, [props.hidden, props.init]);

  if (props.hidden) return null;

  return (
    <>
      <h2>Gitlab Proxy Settings</h2>

      <TextField
        label="GITLAB_EXTERNAL_URL"
        value={main.config.gitlabExternalUrl}
        disabled={true}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="GITLAB_PORT"
        defaultValue={main.config.gitlabPort}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabPort?.toString()}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Internal Port"
        onChange={event => {
          runInAction(() => (main.config.gitlabPort = event.target.value));
        }}
      />
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="domainmode-native-helper">
              GITLAB_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          defaultValue={main.config.gitlabDomainMode}
          onChange={(event: any) => {
            runInAction(() => (main.config.gitlabDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'domainmode',
            id  : 'domainmode-native-helper'
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
        label="GITLAB_SSL"
        disabled={main.config.gitlabDomainMode < 2}
        defaultValue={main.config.gitlabSSL}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabSSL}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Path to SSL Certificate"
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabSSL = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_SSL_KEY"
        defaultValue={main.config.gitlabSSLKey}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabSSLKey}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Path to SSL Key"
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabSSLKey = event.target.value));
        }}
      />
      <TextField
        label="GITLAB_UPSTREAM"
        defaultValue={main.config.gitlabUpstream}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabUpstream}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="The Name of the upstream
              inside the NGINX Main configuration"
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabUpstream = event.target.value));
        }}
      />

      <h2>Gitlab Registry Settings</h2>

      <TextField
        label="GITLAB_REGISTRY_URL"
        value={main.config.gitlabRegistryUrl}
        style={{ margin: 8 }}
        disabled={true}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="GITLAB_REGISTRY_PORT"
        style={{ margin: 8 }}
        defaultValue={main.config.gitlabRegistryPort}
        placeholder={main.placeholder.gitlabRegistryPort.toString()}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        helperText="Internal Port"
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabRegistryPort = event.target.value));
        }}
      />
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="regdomainmode-native-helper">
              GITLAB_REGISTRY_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={main.config.gitlabRegistryDomainMode}
          onChange={(event: any) => {
            runInAction(() => (main.config.gitlabRegistryDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'regdomainmode',
            id  : 'regdomainmode-native-helper'
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
        label="GITLAB_REGISTRY_SSL"
        value={main.config.gitlabRegistrySSL}
        disabled={main.config.gitlabRegistryDomainMode < 2}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabRegistrySSL}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabRegistrySSL = event.target.value));
        }}
        helperText="Path to Registry SSL Certificate"
      />
      <TextField
        label="GITLAB_REGISTRY_SSL_KEY"
        disabled={main.config.gitlabRegistryDomainMode < 2}
        defaultValue={main.config.gitlabRegistrySSLKey}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabRegistrySSLKey}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabRegistrySSLKey = event.target.value));
        }}
        helperText="Path to Registry SSL Key"
      />
      <TextField
        label="GITLAB_REGISTRY_UPSTREAM"
        defaultValue={main.config.gitlabRegistryUpstream}
        style={{ margin: 8 }}
        placeholder={main.placeholder.gitlabRegistryUpstream}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (main.config.gitlabRegistryUpstream = event.target.value));
        }}
      />
    </>
  );
});

export default ProxySettingsFields;
