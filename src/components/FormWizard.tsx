import React, {  useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { Button, Tabs, Toolbar } from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import GeneralForm from './form-wizard/GeneralForm';
// import ProjectForm from './form-wizard/ProjectForm';
import SaveIcon from '@material-ui/icons/Save';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import DownloadDockerDialog from './form-wizard/DownloadDockerDialog';

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

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

const useStyles = makeStyles(theme => ({
  paper: {
    padding     : theme.spacing(2),
    margin      : 'auto',
    maxWidth    : 1900,
    marginBottom: '1ch'
  },
  divider: {
    flexGrow: 1
  }
}));

const FormWizard = (props: any) => {
  const classes = useStyles();
  const main = props.main;
  const [tab, setTab] = useState(0);
  const [downloadDocker, setDownloadDocker] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: any, newTab: number) => {
    setTab(newTab);
  };

  return (
    <>
      {downloadDocker && <DownloadDockerDialog main={main} setClose={() => setDownloadDocker(false)} />}
      <Grid container direction="row" justify="center" spacing={2} alignItems="center">
        <Grid item xs={9}>
          <Paper className={classes.paper}>
            <Toolbar>
              <Tabs
                indicatorColor="primary"
                textColor="primary"
                value={tab}
                onChange={handleChange}>
                <Tab label="General Settings" {...a11yProps(0)} />
                <Tab label="Project Configurations" {...a11yProps(1)} />
              </Tabs>
              <div className={classes.divider} />

              <Button aria-controls="simple-menu"
                aria-haspopup="true"
                startIcon={<SaveIcon />}
                onClick={handleClick}>
                Download
              </Button>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Download Project</MenuItem>
                <Divider />
                <MenuItem onClick={() => setDownloadDocker(true)}>Download .docker.env</MenuItem>
              </Menu>
            </Toolbar>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <TabPanel value={tab} index={0}>
            <GeneralForm main={main} />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {/* <ProjectForm /> */}
          </TabPanel>
        </Grid>
      </Grid>
    </>
  );
};

export default FormWizard;