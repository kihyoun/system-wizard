import ListItemButton from '@mui/material/ListItemButton';
import { makeStyles } from 'tss-react/mui';
import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Box, Button, ButtonGroup, Link, Snackbar, Tab, Tabs, Theme, useMediaQuery } from '@mui/material';
import DarkModeSwitch from './DarkModeSwitch';
import FormWizard from './components/form-wizard/FormWizard';
import Main from './api/Main';
import AddIcon from '@mui/icons-material/Add';
import { observer } from 'mobx-react';
import { blue, pink } from '@mui/material/colors';
import { grey } from '@mui/material/colors';
import clsx from 'clsx';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { green } from '@mui/material/colors';
import { runInAction } from 'mobx';
import ConnectServerDialog from './components/form-wizard/dialog/ConnectServerDialog';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import moment from 'moment';
import ServerControlButton from './components/ServerControlButton';
import EditIcon from '@mui/icons-material/Edit';
import Helper from './api/Helper';
import Overview from './components/Overview';
import Privacy from './components/Privacy';
import Imprint from './components/Imprint';
import { usePublicSiteInfo } from './components/legal/PublicSiteInfo';
const drawerWidth = 240;
const useStyles = makeStyles<{
    progress: number;
    theme: Theme;
}>()((theme, props) => ({
    root: {},
    paper: {
        padding: theme.spacing(2),
        margin: '0 auto',
        width: '100%',
        maxWidth: 1900,
        marginBottom: theme.spacing(2)
    },
    divider: { flexGrow: 1 },
    progressBar: {
        width: props.progress === 100 ? 0 : `${props.progress}%`,
        backgroundColor: props.theme.palette.primary.main,
        height: '1ch'
    }
}));
const useDrawerStyles = makeStyles()((theme: Theme) => ({
    root: { display: 'flex' },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        })
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    menuButton: { marginRight: theme.spacing(2) },
    hide: { display: 'none' },
    drawerPaper: { width: drawerWidth },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        minHeight: 64,
        justifyContent: 'flex-end'
    },
    content: {
        flexGrow: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(3),
        [theme.breakpoints.down('sm')]: { padding: theme.spacing(1.5) }
    }
}));
const App = observer(() => {
    useEffect(() => {
        console.log(Helper.textLogo);
    }, []);
    const { classes: drawerClasses } = useDrawerStyles();
    const [dark, setDark] = useState(false);
    const [view, setView] = useState<'overview' | 'wizard' | 'privacy' | 'imprint'>(() =>
        window.location.pathname.replace(/\/$/, '') === '/configuration' ? 'wizard' : 'overview');
    const publicSite = usePublicSiteInfo(view === 'privacy' || view === 'imprint');
    const handleDarkMode = (event: any) => {
        setDark(event.target.checked);
    };
    const [open, setOpen] = React.useState(true);
    const [activeServer, setActiveServer] = useState(new Main());
    const [servers, setServers] = useState([activeServer]);
    const [connected, setConnected] = useState(activeServer.sync.connected);
    const [connectServer, setConnectServer] = useState(false);
    const [lastStatusMessage, setLastStatusMessage] = useState('Not connected.');
    const [openSuccess, setOpenSuccess] = useState('');
    const [openAlert, setOpenAlert] = useState('');
    const [progress, setProgress] = useState(activeServer.sync.progress);
    useEffect(() => {
        setConnected(activeServer.sync.connected);
    }, [activeServer.sync.connected]);
    useEffect(() => {
        setProgress(activeServer.sync.progress);
    }, [activeServer.sync.progress]);
    const getServerName = (server: Main) => {
        if (server.sync?.connected &&
            server.sync?.serverAddress) {
            return server.sync.serverAddress;
        }
        else {
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
    const theme = createTheme({
        typography: { fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
        palette: {
            primary: dark ? grey : blue,
            secondary: {
                light: pink.A200,
                main: pink.A400,
                dark: pink.A700,
                contrastText: '#fff'
            },
            background: dark
                ? { default: '#303030', paper: grey[800] }
                : { default: grey[50], paper: '#fff' },
            mode: dark ? 'dark' : 'light'
        }
    });
    const compact = useMediaQuery(theme.breakpoints.down('md'));
    const wizardActive = view === 'wizard';
    const desktopDrawerOpen = wizardActive && open && !compact;
    const showView = (nextView: typeof view, focusNavigation = false) => {
        setView(nextView);
        window.scrollTo({ top: 0 });
        if (focusNavigation) window.requestAnimationFrame(() => {
            document.getElementById(nextView === 'privacy' || nextView === 'imprint' ? `${nextView}-heading` : `main-tab-${nextView}`)?.focus();
        });
    };
    useEffect(() => {
        if (compact) setOpen(false);
    }, [compact]);
    const { classes } = useStyles({
        progress: progress,
        theme: theme
    });
    const handleLogout = () => {
        runInAction(() => {
            activeServer.sync.logout()
                .then((res: any) => {
                setConnected(false);
                setOpenSuccess('Logged out.');
                setLastStatusMessage(res.message);
            })
                .catch((err: any) => {
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
    const handleSubmit = async (password: any) => {
        if (activeServer.sync.connected) {
            handleLogout();
        }
        else {
            runInAction(() => {
                activeServer.sync.login(activeServer.sync.userName, password)
                    .then(() => {
                    onLoginSuccess();
                })
                    .catch((err: any) => {
                    setOpenAlert(err.response?.data || err.toString());
                });
            });
        }
    };
    return (<ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Snackbar open={openSuccess.length > 0} autoHideDuration={6000} onClose={() => setOpenSuccess('')} message={openSuccess}/>
        <Snackbar open={openAlert.length > 0} autoHideDuration={6000} onClose={() => setOpenAlert('')} message={openAlert}/>
        {connectServer && <ConnectServerDialog onLoginSuccess={onLoginSuccess} handleSubmit={(password: string) => handleSubmit(password)} connectServer={connectServer} setOpenAlert={(err: string) => setOpenAlert(err)} main={activeServer} setClose={() => setConnectServer(false)}/>}
        <Grid container spacing={0}>
          <Grid size={12}>

            <div className={drawerClasses.root}>
              <AppBar elevation={0} position="fixed" className={clsx(drawerClasses.appBar, { [drawerClasses.appBarShift]: desktopDrawerOpen })}>
                <Toolbar>
                  {wizardActive && <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" className={clsx(drawerClasses.menuButton, open && drawerClasses.hide)}>
                    <MenuIcon />
                  </IconButton>}
                  <Typography variant="h6" noWrap sx={{ minWidth: 0, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {wizardActive ? 'System Bootstrapper Control Panel' : 'System Bootstrapper'}
                  </Typography>
                  <div className={classes.divider}/>
                  <DarkModeSwitch handleChange={handleDarkMode}/>
                </Toolbar>
              </AppBar>
              {wizardActive && <Drawer variant={compact ? 'temporary' : 'persistent'} anchor="left" open={open} onClose={handleDrawerClose} sx={{ width: desktopDrawerOpen ? drawerWidth : 0, flexShrink: 0 }} classes={{ paper: drawerClasses.drawerPaper }}>
                <div className={drawerClasses.drawerHeader}>
                  <IconButton onClick={handleDrawerClose} aria-label="Close server drawer">
                    {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </IconButton>
                </div>
                <Divider />

                <List>
                  {servers.map((server: any) => (<ListItemButton key={server.id} selected={activeServer.id === server.id} onClick={() => runInAction(() => setActiveServer(server))}>
                      <ListItemIcon>{server.sync.connected ?
                <FiberManualRecordIcon style={{ color: green[500] }}/> : <InboxIcon />}</ListItemIcon>
                      <ListItemText primary={getServerName(server)}/>
                    </ListItemButton>))}
                  <Divider />

                  <ListItemButton onClick={() => runInAction(() => handleAddServer())}>
                    <ListItemIcon>{<AddIcon />}</ListItemIcon>
                    <ListItemText primary={'Add'}/>
                  </ListItemButton>
                </List>

              </Drawer>}
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', flexGrow: 1, minWidth: 0 }}>
              <main className={drawerClasses.content}>
                <div className={drawerClasses.drawerHeader}/>
                <Paper elevation={0} className={classes.paper} sx={{ py: 0 }}>
                  <Tabs value={view === 'overview' || view === 'wizard' ? view : false} onChange={(_event, nextView: 'overview' | 'wizard') => showView(nextView)} aria-label="Main navigation" indicatorColor="secondary" textColor="inherit">
                    <Tab value="overview" label="Overview" id="main-tab-overview" aria-controls="main-panel-overview" />
                    <Tab value="wizard" label="Wizard" id="main-tab-wizard" aria-controls="main-panel-wizard" />
                  </Tabs>
                </Paper>
                <div role="tabpanel" hidden={view !== 'overview'} id="main-panel-overview" aria-labelledby="main-tab-overview">
                  <Overview onOpenWizard={() => showView('wizard', true)} />
                </div>
                <div role="tabpanel" hidden={!wizardActive} inert={!wizardActive} id="main-panel-wizard" aria-labelledby="main-tab-wizard">
                <Paper elevation={0} className={classes.paper}>
                  <Toolbar sx={{ gap: 1, flexWrap: 'wrap', px: { xs: 0, sm: 2 } }}>
                    <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                      {getServerName(activeServer)}
                    </Typography>

                    <div className={classes.divider}/>
                    {activeServer.sync.connected &&
            <ServerControlButton setOpenAlert={(value: string) => setOpenAlert(value)} setOpenSuccess={(value: string) => setOpenSuccess(value)} setLastStatusMessage={(value: string) => setLastStatusMessage(value)} main={activeServer}/>}

                    <ButtonGroup variant={'contained'} disableElevation>
                      <Button aria-label="Edit connection" color={connected ? 'secondary' : 'primary'} onClick={handleServerDialog}>
                        <EditIcon />
                      </Button>
                      <Button color={connected ? 'secondary' : 'primary'} startIcon={connected ? <LockIcon /> : <LockOpenIcon />} onClick={() => handleSubmit(activeServer.config?.syncPass)}>
                        {connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </ButtonGroup>

                  </Toolbar>
                </Paper>
                {activeServer.sync.connected && (<>
                    <Grid size={12}>
                      <div className={classes.progressBar}></div>
                    </Grid>
                    <Paper elevation={0} className={classes.paper}>
                      <Typography>
                        {lastStatusMessage}
                      </Typography>
                    </Paper>
                  </>)}
                <FormWizard main={activeServer} setOpenAlert={setOpenAlert} setOpenSuccess={setOpenSuccess}/>
                </div>
                {view === 'privacy' && <section aria-labelledby="privacy-heading">
                  <Privacy {...publicSite} />
                </section>}
                {view === 'imprint' && <section aria-labelledby="imprint-heading">
                  <Imprint {...publicSite} />
                </section>}
              </main>
                <Box component="footer" sx={{ mt: 'auto', py: 3, px: 2, textAlign: 'center', bgcolor: '#0d47a1', color: '#fff' }}>
                    <Box component="nav" aria-label="Footer navigation" sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mb: 2 }}>
                      {(['overview', 'wizard', 'privacy', 'imprint'] as const).map(destination => (<Link key={destination} component="button" type="button" id={`footer-${destination}`} color="inherit" underline="hover" aria-current={view === destination ? 'page' : undefined} onClick={() => showView(destination, true)}>
                        {destination === 'overview' ? 'Overview' : destination === 'wizard' ? 'Wizard' : destination === 'privacy' ? 'Privacy' : 'Imprint'}
                      </Link>))}
                    </Box>
                    <Link href="https://github.com/kihyoun/system" color="inherit" sx={{ textDecorationColor: 'rgba(255,255,255,0.7)' }}>System Bootstrapper on GitHub</Link>
                </Box>
              </Box>
            </div>
          </Grid>
        </Grid>
      </div>

    </ThemeProvider>);
});
export default App;
