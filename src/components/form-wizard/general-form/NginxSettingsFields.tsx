import React, { useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const NginxSettingsFields = observer((props: any) => {
  const main = props.main;

  useEffect(() => {
    if (!props.hidden && props.init) {
      props.main.config.generateNginxConfig();
    }
  }, [props.hidden, props.init]);

  if (props.hidden) return null;

  return (
    <>
      <TextField
        size="small"
        label="NGINX_TEMPLATE_DIR"
        defaultValue={main.config.nginxTemplateDir}
        placeholder={main.placeholder.nginxTemplateDir}
        style={{ margin: 8 }}
        fullWidth
        helperText="This Location contains the generated config for NGINX during runtime"
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (main.config.nginxTemplateDir = event.target.value));
        }}
      />
      <TextField
        label="SSL_BASEDIR"
        defaultValue={main.config.sslBaseDir}
        placeholder={main.placeholder.sslBaseDir}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        onChange={event => {
          runInAction(() => (main.config.sslBaseDir = event.target.value));
        }}
      />
    </>
  );
});

export default NginxSettingsFields;
