import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { IconButton, Toolbar, Typography } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import BackupForm from './general-form/BackupForm';
import GitlabSettingsForm from './general-form/GitlabSettingsForm';
import NginxSettingsForm from './general-form/NginxSettingsForm';
import ProxySettingsForm from './general-form/ProxySettingsForm';
import { observer } from 'mobx-react';

const useStyles = makeStyles(theme => ({
  paper: {
    padding     : theme.spacing(2),
    margin      : 'auto',
    maxWidth    : 1900,
    marginBottom: '1ch'
  }
}));

const GeneralForm = observer((props: any) => {
  const classes = useStyles();
  const main = props.main;
  const [backupSettings, setBackupSettings] = useState({ visible: true });
  const [gitlabSettings, setGitlabSettings] = useState({ visible: false, initialize: true });
  const [nginxSettings, setNginxSettings] = useState({ visible: false, initialize: true });
  const [proxySettings, setProxySettings] = useState({ visible: false, initialize: true });

  return (
    <>
      <Paper elevation={1} className={classes.paper}>
        <Toolbar onClick={() => setBackupSettings({ ...backupSettings, visible: !backupSettings.visible })}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            {(!backupSettings.visible && <AddCircleIcon />) || <AddCircleOutlineIcon />}
          </IconButton>
          <Typography variant="h6">Backup Settings</Typography>
        </Toolbar>
        <div hidden={!backupSettings.visible}>
          <BackupForm main={main} />
        </div>
      </Paper>
      <Paper elevation={1} className={classes.paper}>
        <Toolbar
          onClick={() => {
            setGitlabSettings({
              visible   : !gitlabSettings.visible,
              initialize: gitlabSettings.visible ? false : gitlabSettings.initialize
            });
          }}
        >
          <IconButton edge="start" color="inherit" aria-label="menu">
            {(!gitlabSettings.visible && <AddCircleIcon />) || <AddCircleOutlineIcon />}
          </IconButton>
          <Typography variant="h6">Gitlab Settings</Typography>
        </Toolbar>
        <GitlabSettingsForm gitlabSettings={gitlabSettings} main={main} />
      </Paper>
      <Paper elevation={1} className={classes.paper}>
        <Toolbar
          onClick={() => {
            setNginxSettings({
              visible   : !nginxSettings.visible,
              initialize: nginxSettings.visible ? false : nginxSettings.initialize
            });
          }}
        >
          <IconButton edge="start" color="inherit" aria-label="menu">
            {(!nginxSettings.visible && <AddCircleIcon />) || <AddCircleOutlineIcon />}
          </IconButton>
          <Typography variant="h6">NGINX Configuration</Typography>
        </Toolbar>
        <NginxSettingsForm nginxSettings={nginxSettings} main={main} />
      </Paper>
      <Paper elevation={1} className={classes.paper}>
        <Toolbar
          onClick={() => {
            setProxySettings({
              visible   : !proxySettings.visible,
              initialize: proxySettings.visible ? false : proxySettings.initialize
            });
          }}
        >
          <IconButton edge="start" color="inherit" aria-label="menu">
            {(!proxySettings.visible && <AddCircleIcon />) || <AddCircleOutlineIcon />}
          </IconButton>
          <Typography variant="h6">Nginx Proxy</Typography>
        </Toolbar>
        <ProxySettingsForm proxySettings={proxySettings} main={main} />
      </Paper>
    </>
  );
});

export default GeneralForm;
