import React, { useEffect, useState } from 'react';
import {
  createMuiTheme, makeStyles, ThemeProvider
} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Link } from '@material-ui/core';
import DarkModeSwitch from './DarkModeSwitch';
import FormWizard from './components/form-wizard/FormWizard';
import Main from './api/Main';
import { observer } from 'mobx-react';
import blue from '@material-ui/core/colors/blue';
import grey from '@material-ui/core/colors/grey';

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
  footer: {
    position: 'absolute',
    bottom  : 0
  }
}));

const App = observer(() => {
  const classes = useStyles();
  const [dark, setDark] = useState(false);
  const handleDarkMode = (event: any) => {
    setDark(event.target.checked);
  };

  const [main, setMain] = useState(new Main());

  useEffect(() => {
    setMain(new Main());
  }, []);

  const theme = createMuiTheme({
    palette: {
      primary: dark ? grey : blue,
      type   : dark ? 'dark' : 'light'
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Grid container justify="flex-end">
        <DarkModeSwitch handleChange={handleDarkMode} />
      </Grid>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={0} className={classes.paper}>
              <h1>System Bootstrapper Wizard (Beta)</h1>
              This Project was built with the <Link href="https://github.com/kihyoun/system">System Bootstrapper</Link>
            </Paper>
          </Grid>
          <FormWizard main={main} />
        </Grid>
      </div>
    </ThemeProvider>
  );
});

export default App;
