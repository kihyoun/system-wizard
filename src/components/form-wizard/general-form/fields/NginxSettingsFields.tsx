import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const NginxSettingsFields = observer((props: any) => {
  const [init, setInit] = useState(true);

  useEffect(() => {
    if (!props.hidden && init) {
      runInAction(() => {
        props.main.config.generateNginxConfig()
        setInit(false);
      });
    }
    if (!props.main.init && init) {
      setInit(false);
    }
  }, [props.hidden, props.main.init]);

  if (props.hidden) return null;

  return (
    <>
      <TextField
        size="small"
        label="NGINX_TEMPLATE_DIR"
        value={props.main.config.nginxTemplateDir}
        placeholder={props.main.placeholder.nginxTemplateDir}
        style={{ margin: 8 }}
        fullWidth
        helperText="This Location contains the generated config for NGINX during runtime"
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.nginxTemplateDir = event.target.value));
        }}
      />
      <TextField
        label="SSL_BASEDIR"
        value={props.main.config.sslBaseDir}
        placeholder={props.main.placeholder.sslBaseDir}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (props.main.config.sslBaseDir = event.target.value));
        }}
      />
    </>
  );
});

export default NginxSettingsFields;
