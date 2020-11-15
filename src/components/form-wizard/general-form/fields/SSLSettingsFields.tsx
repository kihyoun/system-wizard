import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import {
  FormControl, FormHelperText, InputAdornment, InputLabel, Link, makeStyles, NativeSelect
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  },
  positionStart: { marginRight: 0 }
}));

const SSLSettingsFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.main.init);
  const entry = { 'insecure-registries': [`${props.main.config.gitlabRegistryUrl}:5050`] };
  const warning = <div>
    <b>Attention:</b> You are using an insecure-registry. This is not recommended.
    <br />(Insecure Registries <Link>https://docs.docker.com/registry/insecure/</Link>)
    <br />
    In order to use it, add the following entry to /etc/docker/daemon.json:
    <SyntaxHighlighter language="json" style={duotoneLight}>
      {JSON.stringify(entry, null, 2)}
    </SyntaxHighlighter>
  </div>;
  const [insecureRegistryWarning, setInsercureRegistryWarning] =
    useState(props.main.config.gitlabRegistryDomainMode < 2 ? warning : '');

  useEffect(() => {
    if (!props.hidden && init && props.main.init) {
      runInAction(() => {
        props.main.config.generateProxyConfig()
        setInit(false)
      });
    }
    if (!props.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.init, props.main.init]);

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
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.main.config.seedDir}</InputAdornment>
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
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.main.config.seedDir}</InputAdornment>
        }}
      />
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="regdomainmode-native-helper">
              GITLAB_REGISTRY_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.main.config.gitlabRegistryDomainMode}
          onChange={(event: any) => {
            runInAction(() => {
              props.main.config.gitlabRegistryDomainMode = event.target.value;
              if (event.target.value < 2) {
                setInsercureRegistryWarning(warning);
              } else {
                setInsercureRegistryWarning('')
              }
            });
          }}
          inputProps={{
            name: 'regdomainmode',
            id  : 'regdomainmode-native-helper'
          }}
        >
          <option value={0}>Default, HTTP</option>
          <option value={2}>SSL encrypted</option>
        </NativeSelect>
        <FormHelperText>{props.main.config.gitlabRegistryUrl}{insecureRegistryWarning}</FormHelperText>
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
        InputProps={{
          startAdornment: <InputAdornment
            classes={{ positionStart: classes.positionStart }}
            position="start">
            {props.main.config.seedDir}</InputAdornment>
        }}
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

export default SSLSettingsFields;
