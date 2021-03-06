import React, {  useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {
  Button, ButtonGroup, createStyles, ListItemIcon, Tabs, Toolbar, Typography
} from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import GeneralForm from './general-form/GeneralForm';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import DownloadDockerDialog from './dialog/DownloadDockerDialog';
import DownloadProjectsDialog from './dialog/DownloadProjectsDialog';
import ProjectsOverview from './projects-overview/ProjectsOverview';
import DownloadJsonDialog from './dialog/DownloadJsonDialog';
import LaunchIcon from '@material-ui/icons/Launch';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

const TabPanel = (props: any) => {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </div>
  );
};

const a11yProps = (index: any) => {
  return {
    id             : `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const useStyles = makeStyles(theme =>
  createStyles({
    paper: {
      padding     : theme.spacing(2),
      margin      : 'auto',
      maxWidth    : 1900,
      marginBottom: '1ch'
    },
    divider      : { flexGrow: 1 },
    buttonDivider: { width: '1ch' },
    input        : { display: 'none' },
    progressBar  : {
      width: (props:any) => {
        if (props.progress === 100) return 0;
        return `${props.progress}%`
      },
      backgroundColor: theme.palette.primary.main,
      height         : '1ch'
    },
    downloadButtons: { textAlign: 'center' }
  })
);

const FormWizard = observer((props: any) => {
  const [main, setMain] = useState(props.main);
  const [tab, setTab] = useState(0);
  const [downloadDocker, setDownloadDocker] = useState(false);
  const [downloadProjects, setDownloadProjects] = useState(false);
  const [downloadJson, setDownloadJson] = useState(false);
  const [files, setFiles] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [progress, setProgress] = useState(100);
  const classes = useStyles({ progress: progress });

  useEffect(() => {
    runInAction(() => {
      setMain(props.main);
    });
  }, [props.main]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: any, newTab: number) => {
    setTab(newTab);
  };

  const onChangeHandler=(event:any)=>{
    if (event.target?.files?.length < 1 || event.dataTransfer?.files?.length < 1) {
      return;
    }
    const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onprogress = function (evt:any) {
      setProgress(100 * (evt.loaded / evt.total));
    }
    reader.onload = function (evt:any) {
      try {
        runInAction(() => {
          main.importFile(file, evt.target.result);
          props.setOpenSuccess('Import finished: ' + file.name);
          if (event.target) {
            setFiles([]);
          }
        });
      } catch (e) {
        runInAction(() => {
          props.setOpenAlert('error reading file: ' + e.toString());
          if (event.target) {
            setFiles([]);
          }
        });
      }
    }
    reader.onerror = function () {
      props.setOpenAlert('error reading file')
    }
  };

  return (
    <React.Fragment>
      {downloadDocker && <DownloadDockerDialog main={main}
        setClose={() => setDownloadDocker(false)} />}
      {downloadProjects && <DownloadProjectsDialog main={main}
        setClose={() => setDownloadProjects(false)} />}
      {downloadJson && <DownloadJsonDialog main={main}
        setClose={() => setDownloadJson(false)} />}
      <Grid item xs={12}>
        <div className={classes.progressBar}></div>
      </Grid>
      <Grid container direction="row" spacing={0}
        alignItems="center" justify="center"
        onDragOver={ev => {
          ev.preventDefault();
        }}
        onDrop={(ev:any) => {
          if (ev.dataTransfer.files.length > 0
            && (ev.dataTransfer.files[0].name.substr(-4) === '.env'
            || ev.dataTransfer.files[0].name.substr(-4) === 'json')) {
            onChangeHandler(ev);
            ev.preventDefault();
          }}}
      >
        <Grid item xs={12}>
          <Paper className={classes.paper} elevation={0}>
            <Toolbar>
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                value={tab}
                onChange={handleChange}>
                <Tab label="General" {...a11yProps(0)} />
                <Tab label="Proxy" {...a11yProps(1)} />
              </Tabs>

              <div className={classes.divider} />

              <ButtonGroup disableElevation
                color="primary"
                className={classes.downloadButtons}
                aria-label="vertical contained primary button group"
                variant="text">

                <Button
                  htmlFor="contained-button-file"
                  aria-haspopup="true"
                  component="label"
                  startIcon={<InsertDriveFileIcon />}
                  color="primary">
                Open
                </Button>
                <input
                  accept="application/json, .env"
                  className={classes.input}
                  id="contained-button-file"
                  multiple
                  value={files}
                  type="file"
                  onChange={onChangeHandler}
                />
                <Button aria-controls="simple-menu"
                  aria-haspopup="true"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  onClick={handleClick}>
                Backup
                </Button>

              </ButtonGroup>

              <Menu
                anchorEl={anchorEl}
                keepMounted
                transitionDuration={0}
                elevation={1}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => props.main.exportZip()}>
                  <ListItemIcon>
                    <GetAppIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">bootstrapper.zip</Typography>
                </MenuItem>
                <MenuItem onClick={() => setDownloadJson(true)}>
                  <ListItemIcon>
                    <LaunchIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">bootstrapper.json</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setDownloadDocker(true)}>
                  <ListItemIcon>
                    <LaunchIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">.docker.env</Typography>
                </MenuItem>
                <MenuItem onClick={() => setDownloadProjects(true)}>
                  <ListItemIcon>
                    <LaunchIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">Proxies</Typography>
                </MenuItem>
              </Menu>
            </Toolbar>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={tab} index={0}>
            <GeneralForm main={main} />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <ProjectsOverview main={main} />
          </TabPanel>
        </Grid>
      </Grid>
    </React.Fragment>
  );
});

export default FormWizard;
