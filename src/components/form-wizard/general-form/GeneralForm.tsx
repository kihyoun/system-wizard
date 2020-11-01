import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Grid,
  Paper,
  Step, StepButton, StepContent, Stepper
} from '@material-ui/core';

import BackupFields from './fields/BackupFields';
import GitlabSettingsFields from './fields/GitlabSettingsFields';
import NginxSettingsFields from './fields/NginxSettingsFields';
import ProxySettingsFields from './fields/ProxySettingsFields';
import GitlabRunnerFields from './fields/GitlabRunnerFields';

import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

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

const GeneralForm = observer((props: any) => {
  const classes = useStyles();
  const main = props.main;
  const [gitlabInit, setGitlabInit] = useState(true);
  const [nginxInit, setNginxInit] = useState(true);
  const [proxyInit, setProxyInit] = useState(true);
  const [runnerInit, setRunnerInit] = useState(true);

  const [activeStep, setActiveStep] = useState(0);

  const steps = [{
    label  : 'Backup',
    enabled: true
  }, {
    label  : 'Gitlab',
    enabled: !gitlabInit
  }, {
    label  : 'Nginx',
    enabled: !nginxInit
  }, {
    label  : 'Proxy',
    enabled: !proxyInit
  },{
    label  : 'Gitlab Runner',
    enabled: !runnerInit
  }];

  const handleStep = (step: number) => () => {
    runInAction(() => {
      switch (step) {
      case 1: setGitlabInit(false); break;
      case 2: setNginxInit(false); break;
      case 3: setProxyInit(false); break;
      case 4: setRunnerInit(false); break;
      }

      if (step > steps.length - 1) {
        console.log('laststep')
      } else {
        setActiveStep(step);
      }
    });
  };

  return (
    <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={2}>
          <Stepper activeStep={activeStep} nonLinear orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton onClick={handleStep(index)} completed={step.enabled}>
                  {step.label}
                </StepButton>
                <StepContent>
                  <div className={classes.actionsContainer}>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleStep(index-1)}
                        className={classes.button}
                      >Back</Button>
                      <Button
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
        <Grid item xs={6}>
          <BackupFields init={true} hidden={activeStep !== 0} main={main} />
          <GitlabSettingsFields init={true} hidden={activeStep !== 1} main={main} />
          <NginxSettingsFields init={true} hidden={activeStep !== 2} main={main} />
          <ProxySettingsFields init={true} hidden={activeStep !== 3} main={main} />
          <GitlabRunnerFields init={true} hidden={activeStep !== 4} main={main} />
        </Grid>
      </Grid>
    </Paper>
  );
});

export default GeneralForm;
