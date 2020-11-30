import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,  Grid, makeStyles,
  Snackbar,
  Step, StepButton, StepContent, Stepper
} from '@material-ui/core';
import { observer } from 'mobx-react';
import MainFields from './fields/MainFields';
import ProjectConfig from 'src/api/ProjectConfig';
import ProdFields from './fields/ProdFields';
import BetaFields from './fields/BetaFields';
import ReviewFields from './fields/ReviewFields';
import { runInAction } from 'mobx';
import GitlabRunnerFields from './fields/GitlabRunnerFields';

const useStyles = makeStyles(theme => ({
  paper: {
    padding     : theme.spacing(2),
    margin      : 'auto',
    maxWidth    : 1900,
    marginBottom: '1ch'
  },
  actionsContainer: { marginBottom: theme.spacing(2) },
  resetContainer  : { padding: theme.spacing(3) },
  button          : {
    marginTop  : theme.spacing(1),
    marginRight: theme.spacing(1)
  }
}));

const ProjectFormDialog = observer((props: any) => {
  const classes = useStyles();
  const [projectConfig, setProjectConfig] = useState(new ProjectConfig(props.main));
  const [projectPlaceholderConfig, setProjectPlaceholderConfig] = useState(new ProjectConfig(props.main));
  const [activeStep, setActiveStep] = useState(0);

  const [openAlert, setOpenAlert] = useState('');
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openEditSuccess, setOpenEditSuccess] = useState(false);

  useEffect(() => {
    const config = props.main.projects.get(props.activeProject);
    setActiveStep(0);
    setProjectConfig(typeof config !== 'undefined'
      ? new ProjectConfig(props.main, config)
      : new ProjectConfig(props.main));
    setProjectPlaceholderConfig(typeof config !== 'undefined'
      ? new ProjectConfig(props.main, config)
      : new ProjectConfig(props.main));
  }, [props.activeProject, props.open]);

  const steps = [{
    label  : 'Start',
    enabled: (projectConfig.projectKey.length > 0).toString()
  }, {
    label  : 'Production',
    enabled: projectConfig.useProdHost
  }, {
    label  : 'Beta',
    enabled: projectConfig.useBetaHost
  }, {
    label  : 'Review Apps',
    enabled: projectConfig.useReviewHost
  },{
    label  : 'Gitlab Runner',
    enabled: (projectConfig.gitlabRunnerScale > 0).toString()
  }];

  const handleStep = (step: number) => () => {
    runInAction(() => {
      if (step > steps.length - 1) {
        handleSave();
      } else {
        setActiveStep(step);
      }
    });
  };

  const handleSave = () => {
    runInAction(() => {
      if (props.activeProject === '') {
        if (props.main.projects.has(projectConfig.projectKey)) {
          setOpenAlert(projectConfig.projectKey);
        } else {
          props.main.addProject(projectConfig);
          props.handleClose();
          setOpenSuccess(true);
        }
      } else {
        props.main.saveProject(projectConfig, projectPlaceholderConfig);
        props.handleClose();
        setOpenEditSuccess(true);
      }
    })
  };

  return (
    <>
      <Snackbar open={openAlert.length > 0} autoHideDuration={6000} onClose={() => setOpenAlert('')}
        message={(
          <>Duplicate key {openAlert}. Please choose another key</>
        )} />
      <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}
        message={'Project successfully added.'} />
      <Snackbar open={openEditSuccess} autoHideDuration={6000} onClose={() => setOpenEditSuccess(false)}
        message={'Changes successfully saved.'} />
      <Dialog
        transitionDuration={0}
        fullWidth={true}
        maxWidth={'lg'}
        open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        {props.activeProject === '' && <DialogTitle id="form-dialog-title">Create Proxy Configuration</DialogTitle>
        || <DialogTitle id="form-dialog-title">Edit {projectPlaceholderConfig.projectKey}</DialogTitle>}
        <DialogContent>
          <DialogContentText>
          </DialogContentText>
          <Grid container>
            <Grid item xs={3}>
              <Stepper activeStep={activeStep} nonLinear orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepButton onClick={handleStep(index)} completed={step.enabled === 'true'}>
                      {step.label}
                    </StepButton>

                    <StepContent>
                      <div className={classes.actionsContainer}>
                        <div>
                          <Button
                            disableElevation
                            disabled={activeStep === 0}
                            onClick={handleStep(index-1)}
                            className={classes.button}
                          >Back</Button>
                          <Button
                            disableElevation
                            variant="contained"
                            onClick={handleStep(index+1)}
                            color="primary"
                            className={classes.button}
                          >
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                          </Button>
                        </div>
                      </div>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            <Grid item xs={8}>
              <MainFields openAlert={(value:string) =>
                runInAction(() => setOpenAlert(value))
              }
              hidden={activeStep !== 0} config={projectConfig}
              placeholder={projectPlaceholderConfig} />
              <ProdFields
                init={props.activeProject === ''}
                hidden={activeStep !== 1}
                config={projectConfig}
                placeholder={projectPlaceholderConfig} />
              <BetaFields
                init={props.activeProject === ''}
                hidden={activeStep !== 2}
                config={projectConfig}
                placeholder={projectPlaceholderConfig} />
              <ReviewFields
                init={props.activeProject === ''}
                hidden={activeStep !== 3}
                config={projectConfig}
                placeholder={projectPlaceholderConfig} />
              <GitlabRunnerFields
                init={props.activeProject === ''}
                hidden={activeStep !== 4}
                config={projectConfig}
                placeholder={projectPlaceholderConfig} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default ProjectFormDialog;
