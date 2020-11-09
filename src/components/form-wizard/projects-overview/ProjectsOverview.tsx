import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {
  Button,Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Snackbar,
  Toolbar
} from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ProjectFormDialog from './ProjectFormDialog';
import ProjectConfig from 'src/api/ProjectConfig';
import { observer } from 'mobx-react';
import ProjectCard from './ProjectCard';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { runInAction } from 'mobx';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import DownloadReactCiDialog from '../dialogs/DownloadReactCiDialog';
import SaveAltIcon from '@material-ui/icons/SaveAlt';

const useStyles = makeStyles({
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
  }
});

const useRowStyles = makeStyles({ root: { '& > *': { borderBottom: 'unset' } } });

const ProjectsOverview = observer((props:any) => {
  const classes = useStyles();
  const rowClasses = useRowStyles();

  const [open, setOpen] = useState(false);
  const [cellOpen, setCellOpen] = useState('');

  const [openDelete, setOpenDelete] = useState(false);
  const [activeProject, setActiveProject] = useState('');
  const [openDeleteSuccess, setOpenDeleteSuccess] = useState(false);
  const [downloadReactCi, setDownloadReactCi] = useState(false);


  const handleDelete = () => {
    runInAction(() => {
      setOpenDelete(false);
      props.main.projects.delete(activeProject);
      setActiveProject('');
      setOpenDeleteSuccess(true)
    });
  };

  return (
    <>
      <Snackbar open={openDeleteSuccess} autoHideDuration={6000}
        onClose={() => setOpenDeleteSuccess(false)}
        message={'Project successfully deleted.'} />
      {downloadReactCi && <DownloadReactCiDialog main={props.main} project={activeProject}
        setClose={() => setDownloadReactCi(false)} />}
      <TableContainer component={Paper} elevation={0}>
        <Table className={classes.table}
          size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Proxy Key</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Beta URL</TableCell>
              <TableCell>Review App Domain(s)</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...props.main.projects.values()].map( (projectConfig:ProjectConfig) => (
              <React.Fragment key={projectConfig.projectKey}>
                <TableRow
                  className={rowClasses.root}
                  onClick={() => setCellOpen(cellOpen !== projectConfig.projectKey ? projectConfig.projectKey : '')}>
                  <TableCell component="th" scope="row" >
                    {projectConfig.projectKey}
                  </TableCell>
                  <TableCell>{projectConfig.prodHostInfo.url}</TableCell>
                  <TableCell>{projectConfig.betaHostInfo.url}</TableCell>
                  <TableCell>{projectConfig.reviewHostInfo.url}</TableCell>
                  <TableCell>
                    <ButtonGroup variant="text" color="primary" aria-label="text primary button group">

                      <IconButton aria-label="edit"
                        onClick={event => {
                          setActiveProject(projectConfig.projectKey);
                          setOpen(true);
                          event.stopPropagation();
                          event.preventDefault();
                        }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton aria-label="delete"
                        onClick={event => {
                          setActiveProject(projectConfig.projectKey);
                          setOpenDelete(true);
                          event.stopPropagation();
                          event.preventDefault();
                        }}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton aria-label="export"
                        onClick={event => {
                          runInAction(() => {
                            setActiveProject(projectConfig.projectKey);
                            setDownloadReactCi(true);
                          });
                          event.stopPropagation();
                          event.preventDefault();
                        }}>
                        <SaveAltIcon />
                      </IconButton>
                    </ButtonGroup>

                  </TableCell>

                </TableRow>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Collapse in={cellOpen === projectConfig.projectKey} timeout="auto" unmountOnExit>
                      <Grid container spacing={3}>
                        <ProjectCard hostInfo={projectConfig.prodHostInfo}
                          handleChange={(checked:boolean) => runInAction(() =>
                            projectConfig.useProdHost = checked.toString())} />
                        <ProjectCard hostInfo={projectConfig.betaHostInfo}
                          handleChange={(checked:boolean) => runInAction(() =>
                            projectConfig.useBetaHost = checked.toString())} />
                        <ProjectCard hostInfo={projectConfig.reviewHostInfo}
                          handleChange={(checked:boolean) => runInAction(() =>
                            projectConfig.useReviewHost = checked.toString())} />
                      </Grid>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={openDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete {activeProject}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
           Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} color="primary">
            Disagree
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>

      <Toolbar>
        <div className={classes.divider} />
        <Button variant="contained" color="primary"
          onClick={() => {
            setActiveProject('');
            setOpen(true);
          }}
          className={classes.button}
          startIcon={<PlaylistAddIcon />}
        >
        Add Proxy
        </Button>
      </Toolbar>

      <ProjectFormDialog open={open} activeProject={activeProject}
        main={props.main} handleClose={() => setOpen(false)} />
    </>
  );
});

export default ProjectsOverview;