import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

const NginxSettingsForm = observer((props: any) => {
  const main = props.main;
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (props.nginxSettings.visible && props.nginxSettings.initialize) {
      props.main.config.generateNginxConfig();
      setInit(true);
    }
  }, [props.nginxSettings.visible,props.nginxSettings.initialize ])

  if (!init || !props.nginxSettings.visible) return null;

  return (
    <>
      <TextField
        label="NGINX_TEMPLATE_DIR"
        defaultValue={main.config.nginxTemplateDir}
        placeholder={main.placeholder.nginxTemplateDir}
        style={{ margin: 8 }}
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true
        }}
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
        InputLabelProps={{
          shrink: true
        }}
        onChange={event => {
          runInAction(() => (main.config.sslBaseDir = event.target.value));
        }}
      />
    </>
  );
});

export default NginxSettingsForm;
