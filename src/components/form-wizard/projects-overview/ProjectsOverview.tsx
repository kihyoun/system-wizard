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
  Snackbar
} from '@material-ui/core';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import ProjectFormDialog from './ProjectFormDialog';
import ProjectConfig from 'src/api/ProjectConfig';
import { observer } from 'mobx-react';
import ProjectCard from './ProjectCard';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { runInAction } from 'mobx';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
    overflow: 'hidden'
  },
  button: {
    marginBottom: '1ch',
    marginTop   : '3ch'
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
      <Snackbar open={openDeleteSuccess} autoHideDuration={6000} onClose={() => setOpenDeleteSuccess(false)}
        message={'Project successfully deleted.'} />
      <TableContainer component={Paper} >
        <Table className={classes.table}
          size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell><EditIcon /></TableCell>
              <TableCell>Proxy Key</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Beta URL</TableCell>
              <TableCell>Review App Domain(s)</TableCell>
              <TableCell># Runners</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...props.main.projects.values()].map( (projectConfig:ProjectConfig) => (
              <React.Fragment key={projectConfig.projectKey}>
                <TableRow
                  className={rowClasses.root}
                  onClick={() => setCellOpen(cellOpen !== projectConfig.projectKey ? projectConfig.projectKey : '')}>
                  <TableCell>
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
                  </TableCell>

                  <TableCell component="th" scope="row" >
                    {projectConfig.projectKey}
                  </TableCell>
                  <TableCell>{projectConfig.prodHost}</TableCell>
                  <TableCell>{projectConfig.betaHost}</TableCell>
                  <TableCell>{projectConfig.reviewHost}</TableCell>
                  <TableCell>{projectConfig.gitlabRunnerDockerScale}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6}>
                    <Collapse in={cellOpen === projectConfig.projectKey} timeout="auto" unmountOnExit>
                      <Grid container spacing={3}>
                        <ProjectCard {...projectConfig.prodHostInfo}
                          handleChange={(checked:boolean) => runInAction(() =>
                            projectConfig.useProdHost = checked.toString())} />
                        <ProjectCard {...projectConfig.betaHostInfo}
                          handleChange={(checked:boolean) => runInAction(() =>
                            projectConfig.useBetaHost = checked.toString())} />
                        <ProjectCard {...projectConfig.reviewHostInfo}
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
      <ProjectFormDialog open={open} activeProject={activeProject}
        main={props.main} handleClose={() => setOpen(false)} />
    </>
  );
});

export default ProjectsOverview;