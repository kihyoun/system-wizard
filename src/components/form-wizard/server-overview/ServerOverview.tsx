import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {
  Button, ButtonGroup, createStyles, Toolbar, Typography
} from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { observer } from 'mobx-react';

const useStyles = makeStyles(theme =>
  createStyles({
    table: {
      minWidth: 650,
      overflow: 'hidden'
    },
    button: {
      marginBottom: '1ch',
      marginTop   : '3ch'
    },
    divider: {
      flexGrow: 1,
      witdh   : '100%'
    },
    paper: {
      padding  : theme.spacing(2),
      textAlign: 'center',
      color    : theme.palette.text.secondary
    }
  }))


const ServerOverview = observer((props:any) => {
  const classes = useStyles();
  return (
    <Grid item xs={12}>
      <Paper elevation={0} className={classes.paper}>
        {!props.main.sync.connected && (
          <Typography>
              Not connected.
          </Typography>
        )}
        <Paper className={classes.paper} elevation={0}>
          <Toolbar>
            <div className={classes.divider} />

            <ButtonGroup disableElevation variant="contained" >
              <Button
                aria-haspopup="true"
                component="label"
                color="primary">
                Import
              </Button>
              <Button aria-controls="simple-menu"
                aria-haspopup="true"
                color="primary">
                Export
              </Button>
              <Button
                component="span"
              >TEst
              </Button>
            </ButtonGroup>

          </Toolbar>
        </Paper>

        {!props.main.sync.connected && (
          <TableContainer component={Paper} elevation={0}>
            <Table className={classes.table} aria-label="simple table">
              <TableBody>
                <TableRow>
                  <TableCell align="right">Server Address:</TableCell>
                  <TableCell align="right">ADdress</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Grid>
  );
});

export default ServerOverview;