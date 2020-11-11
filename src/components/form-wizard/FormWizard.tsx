import React, {  useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {
  Button, ButtonGroup, createStyles, Tabs, Toolbar
} from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import GeneralForm from './general-form/GeneralForm';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import DownloadDockerDialog from './dialogs/DownloadDockerDialog';
import DownloadProjectsDialog from './dialogs/DownloadProjectsDialog';
import ProjectsOverview from './projects-overview/ProjectsOverview';
import DownloadJsonDialog from './dialogs/DownloadJsonDialog';
import ImportFileDialog from './dialogs/ImportFileDialog';

import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import SaveIcon from '@material-ui/icons/Save';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

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
    }
  })
);

const FormWizard = observer((props: any) => {
  const [main, setMain] = useState(props.main);
  const [tab, setTab] = useState(0);
  const [downloadDocker, setDownloadDocker] = useState(false);
  const [downloadProjects, setDownloadProjects] = useState(false);
  const [downloadJson, setDownloadJson] = useState(false);
  const [importFile, setImportFile] = useState(false);
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

    if (event.target.files.length < 1) {
      return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(event.target.files[0], 'UTF-8');
    reader.onprogress = function (evt:any) {
      setProgress(100 * (evt.loaded / evt.total));
    }
    reader.onload = function (evt:any) {
      try {
        main.importFile(file, evt.target.result);
        props.setOpenSuccess('Import finished: ' + file.name);
      } catch (e) {
        props.setOpenAlert('error reading file: ' + e.toString());
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
      {importFile && <ImportFileDialog setOpenSuccess={props.setOpenSuccess}
        setOpenAlert={props.setOpenAlert}
        setProgress={setProgress}
        main={main}
        tab={tab}
        files={importFile}
        setClose={() => setImportFile(false)} />}
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
            setImportFile(ev.dataTransfer.files);
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

              <ButtonGroup disableElevation orientation="vertical"
                color="primary"
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
                  type="file"
                  onChange={onChangeHandler}
                />
                <Button aria-controls="simple-menu"
                  aria-haspopup="true"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleClick}>
                Save
                </Button>

              </ButtonGroup>

              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => setDownloadJson(true)}>Export as JSON</MenuItem>
                <MenuItem onClick={() => props.main.exportZip()}>Save as ZIP</MenuItem>
                <Divider />
                <MenuItem onClick={() => setDownloadDocker(true)}>Save .docker.env</MenuItem>
                <MenuItem onClick={() => setDownloadProjects(true)}>Save projects.env Files</MenuItem>
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
