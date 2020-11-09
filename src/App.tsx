import React, { useState } from 'react';
import {
  createMuiTheme, makeStyles, ThemeProvider
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {
  createStyles, Link, Theme
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

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display : 'flex',
    flexWrap: 'wrap'
  },
  paper: {
    padding : theme.spacing(2),
    margin  : 'auto',
    maxWidth: 1900
  },
  divider: { flexGrow: 1 },
  footer : {
    position: 'absolute',
    bottom  : 0
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
  const classes = useStyles();
  const drawerClasses = useDrawerStyles();
  const [dark, setDark] = useState(false);
  const handleDarkMode = (event: any) => {
    setDark(event.target.checked);
  };

  const [open, setOpen] = React.useState(true);
  const main = new Main();
  const [servers, setServers] = useState([main]);
  const [activeServer, setActiveServer] = useState(main);

  const getServerName = (server:Main) => {
    if (server.sync?.connected &&
        server.sync?.serverAddress) {
      return server.sync.serverAddress;
    } else if (server.config?.syncEnable === 'true' && server.config.syncHost) {
      return server.config.syncHostInfo.url;
    } else {
      return 'New Server';
    }
  };

  const handleAddServer = () => {
    const main = new Main();
    runInAction(() => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Grid container spacing={0}>
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
                    selected={activeServer.id === server.id} onClick={() => runInAction(() => setActiveServer(server))}>
                    <ListItemIcon>{server.sync.connected ?
                      <FiberManualRecordIcon style={{ color: green[500] }} /> : <InboxIcon />}</ListItemIcon>
                    <ListItemText primary={getServerName(server)} />
                  </ListItem>
                ))}
                <Divider />

                <ListItem button onClick={() => runInAction(() => handleAddServer())}>
                  <ListItemIcon>{<AddIcon />}</ListItemIcon>
                  <ListItemText primary={'Add Server'} />
                </ListItem>
              </List>

            </Drawer>
            <main
              className={clsx(drawerClasses.content, { [drawerClasses.contentShift]: open })}
            >
              <div className={drawerClasses.drawerHeader} />

              <Paper elevation={0} className={classes.paper}>
                <h1>
                  {getServerName(activeServer)}
                </h1>
              </Paper>
              <FormWizard main={activeServer} />
            </main>
          </div>
        </Grid>
      </div>
      Visit <Link href="https://github.com/kihyoun/system">System Bootstrapper on Github</Link>

    </ThemeProvider>
  );
});

export default App;
