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

const ReviewFields = observer((props: any) => {
  const classes = useStyles();
  const [init, setInit] = useState(props.init);

  useEffect(() => {
    if (init && !props.hidden) {
      runInAction(() => props.config.generateReviewProxyConfig());
      setInit(false);
    }
  }, [props.init, props.hidden]);

  if (props.hidden) return null;

  return (
    <>
      <FormControlLabel
        control={
          <Switch
            checked={props.config.useReviewHost === 'true'}
            onChange={event => {
              runInAction(() => props.config.useReviewHost = event.target.checked ? 'true' : 'false' )
            }}
            name="reviewCfg"
            color="primary"
          />
        }
        label="Enable Review Environment"
      />
      <TextField
        disabled={props.config.useReviewHost === 'false'}
        label="REVIEW_HOST"
        style={{ margin: 8 }}
        value={props.config.reviewHost}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.config.reviewHost = event.target.value));
        }}
      />
      <TextField
        label="REVIEW_PORT"
        disabled={props.config.useReviewHost === 'false'}
        style={{ margin: 8 }}
        value={props.config.reviewPort}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.config.reviewPort = event.target.value));
        }}
      />
      <FormControl className={classes.formControl}
        disabled={props.config.useReviewHost === 'false'}
      >
        <InputLabel htmlFor="regdomainmode-native-helper">
              REVIEW_DOMAIN_MODE
        </InputLabel>
        <NativeSelect
          value={props.config.reviewDomainMode}
          onChange={(event: any) => {
            runInAction(() => (props.config.reviewDomainMode = event.target.value));
          }}
          inputProps={{
            name: 'reviewDomainMode',
            id  : 'reviewDomainMode-native-helper'
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
        label="REVIEW_SSL"
        disabled={props.config.useReviewHost === 'false' || props.config.reviewDomainMode < 2}
        value={props.config.reviewSSL}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.reviewSSL = event.target.value));
        }}
        helperText="Path to Registry SSL Certificate"
      />
      <TextField
        label="REVIEW_SSL_KEY"
        disabled={props.config.useReviewHost === 'false' || props.config.reviewDomainMode < 2}
        value={props.config.reviewSSLKey}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={(event: any) => {
          runInAction(() => (props.config.reviewSSLKey = event.target.value));
        }}
        helperText="Path to SSL Key"
      />
    </>
  );
});

export default ReviewFields;
