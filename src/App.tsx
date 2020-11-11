import React, { useEffect, useState } from 'react';
import {
  createMuiTheme, makeStyles, ThemeProvider
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {
  Button,
  ButtonGroup,
  createStyles, Link, Snackbar, Theme
} from '@material-ui/core';
import DarkModeSwitch from './DarkModeSwitch';
import FormWizard from './components/form-wizard/FormWizard';
import Main from './api/Main';
import AddIcon from '@material-ui/icons/Add';
import { observer } from 'mobx-react';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { green } from '@material-ui/core/colors';
import { runInAction } from 'mobx';
import ConnectServerDialog from './components/form-wizard/dialog/ConnectServerDialog';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import moment from 'moment';
import ServerControlButton from './components/ServerControlButton';
import EditIcon from '@material-ui/icons/Edit';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root : {},
  paper: {
    padding : theme.spacing(2),
    margin  : 'auto',
    maxWidth: 1900
  },
  divider    : { flexGrow: 1 },
  progressBar: {
    width: (props:any) => {
      if (props.progress === 100) return 0;
      return `${props.progress}%`
    },
    backgroundColor: (props:any) => props.theme.palette.primary.main,
    height         : '1ch'
  }
}));
const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    root  : { display: 'flex' },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing  : theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      width     : `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing  : theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    menuButton: { marginRight: theme.spacing(2) },
    hide      : { display: 'none' },
    drawer    : {
      width     : drawerWidth,
      flexShrink: 0
    },
    drawerPaper : { width: drawerWidth },
    drawerHeader: {
      display       : 'flex',
      alignItems    : 'center',
      padding       : theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end'
    },
    content: {
      flexGrow  : 1,
      padding   : theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing  : theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      marginLeft: -drawerWidth
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing  : theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    }
  })
);
const App = observer(() => {
  const drawerClasses = useDrawerStyles();
  const [dark, setDark] = useState(false);
  const handleDarkMode = (event: any) => {
    setDark(event.target.checked);
  };

  const [open, setOpen] = React.useState(true);
  const main = new Main();
  const [servers, setServers] = useState([main]);
  const [activeServer, setActiveServer] = useState(main);
  const [connected, setConnected] = useState(activeServer.sync.connected);
  const [connectServer, setConnectServer] = useState(false);
  const [lastStatusMessage, setLastStatusMessage] = useState('Not connected.')
  const [openSuccess, setOpenSuccess] = useState('');
  const [openAlert, setOpenAlert] = useState('');
  const [progress, setProgress] = useState(activeServer.sync.progress);

  useEffect(() => {
    setConnected(activeServer.sync.connected);
  }, [activeServer.sync.connected]);

  useEffect(() => {
    setProgress(activeServer.sync.progress);
  }, [activeServer.sync.progress]);

  const getServerName = (server:Main) => {
    if (server.sync?.connected &&
        server.sync?.serverAddress) {
      return server.sync.serverAddress;
    } else {
      return 'Server';
    }
  };

  const handleAddServer = () => {
    runInAction(() => {
      const main = new Main();
      servers.push(main);
      setServers(servers);
      setActiveServer(main);
    });
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const theme = createMuiTheme({
    palette: {
      primary: dark ? grey : blue,
      type   : dark ? 'dark' : 'light'
    }
  });

  const classes = useStyles({
    progress: progress,
    theme   : theme
  });

  const handleLogout = () => {
    runInAction(() => {
      activeServer.sync.logout()
        .then((res:any) => {
          setConnected(false);
          setOpenSuccess('Logged out.');
          setLastStatusMessage(res.message);
        })
        .catch((err:any) => {
          setOpenAlert(err.response?.data || err.toString());
        });
    });
  };

  const handleServerDialog = () => {
    runInAction(() => {
      setConnectServer(true);
    });
  };

  const onLoginSuccess = () => {
    runInAction(() => {
      setOpenSuccess('Login successful.');
      setLastStatusMessage('Last Login: ' + moment().format());
      setConnectServer(false);
    });
  };

  const handleSubmit = async (password:any) => {
    if (activeServer.sync.connected) {
      handleLogout();
    } else {
      runInAction(() => {
        activeServer.sync.login(activeServer.sync.userName, password)
          .then(() => {
            onLoginSuccess();
          })
          .catch((err:any) => {
            setOpenAlert(err.response?.data || err.toString());
          });
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Snackbar open={openSuccess.length > 0} autoHideDuration={6000}
          onClose={() => setOpenSuccess('')}
          message={openSuccess} />
        <Snackbar open={openAlert.length > 0} autoHideDuration={6000}
          onClose={() => setOpenAlert('')}
          message={openAlert} />
        {connectServer && <ConnectServerDialog onLoginSuccess={onLoginSuccess}
          handleSubmit={(password:string) => handleSubmit(password)}
          connectServer={connectServer}
          setOpenAlert={(err:string) => setOpenAlert(err)}
          main={activeServer} setClose={() => setConnectServer(false)} />}
        <Grid container spacing={0}>
          <Grid item xs={12}>

            <div className={drawerClasses.root}>
              <AppBar
                position="fixed"
                className={clsx(drawerClasses.appBar, { [drawerClasses.appBarShift]: open })}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    className={clsx(drawerClasses.menuButton, open && drawerClasses.hide)}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap>
            System Bootstrapper Control Panel
                  </Typography>
                  <div className={classes.divider} />
                  <DarkModeSwitch handleChange={handleDarkMode} />
                </Toolbar>
              </AppBar>
              <Drawer
                className={drawerClasses.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{ paper: drawerClasses.drawerPaper }}
              >
                <div className={drawerClasses.drawerHeader}>
                  <IconButton onClick={handleDrawerClose}>
                    {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </IconButton>
                </div>
                <Divider />

                <List>
                  {servers.map((server:any) => (
                    <ListItem button key={server.id}
                      selected={activeServer.id === server.id}
                      onClick={() => runInAction(() => setActiveServer(server))}>
                      <ListItemIcon>{server.sync.connected ?
                        <FiberManualRecordIcon style={{ color: green[500] }} /> : <InboxIcon />}</ListItemIcon>
                      <ListItemText primary={getServerName(server)} />
                    </ListItem>
                  ))}
                  <Divider />

                  <ListItem button onClick={() => runInAction(() => handleAddServer())}>
                    <ListItemIcon>{<AddIcon />}</ListItemIcon>
                    <ListItemText primary={'Add'} />
                  </ListItem>
                </List>

              </Drawer>
              <main
                className={clsx(drawerClasses.content, { [drawerClasses.contentShift]: open })}
              >
                <div className={drawerClasses.drawerHeader} />
                <Paper elevation={0} className={classes.paper}>
                  <Toolbar>
                    <Typography variant="h6">
                      {getServerName(activeServer)}
                    </Typography>

                    <div className={classes.divider} />
                    {activeServer.sync.connected &&
                    <ServerControlButton
                      setOpenAlert={(value:string) => setOpenAlert(value)}
                      setOpenSuccess={(value:string) => setOpenSuccess(value)}
                      setLastStatusMessage={(value:string) => setLastStatusMessage(value)}
                      main={activeServer} />}

                    <ButtonGroup variant={'contained'}>
                      <Button
                        component="span"
                        color={connected ? 'secondary': 'primary' }
                        onClick={handleServerDialog}
                      >
                        <EditIcon />
                      </Button>
                      <Button
                        color={connected ? 'secondary': 'primary' }
                        component="span"
                        startIcon={connected ? <LockIcon /> : <LockOpenIcon />}
                        onClick={() => handleSubmit(activeServer.config?.syncPass)}
                      >
                        {connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </ButtonGroup>

                  </Toolbar>
                </Paper>
                {activeServer.sync.connected && (
                  <>
                    <Grid item xs={12}>
                      <div className={classes.progressBar}></div>
                    </Grid>
                    <Paper elevation={0} className={classes.paper}>
                      <Typography>
                        {lastStatusMessage}
                      </Typography>
                    </Paper>
                  </>
                )}
                <FormWizard main={activeServer}
                  setOpenAlert={setOpenAlert}
                  setOpenSuccess={setOpenSuccess}/>
              </main>
            </div>
          </Grid>
        </Grid>
      </div>
      Visit <Link href="https://github.com/kihyoun/system">System Bootstrapper on Github</Link>

    </ThemeProvider>
  );
});

export default App;
