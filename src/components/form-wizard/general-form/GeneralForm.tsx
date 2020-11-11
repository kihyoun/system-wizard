import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Grid,
  Paper,
  Step, StepButton, StepContent, Stepper
} from '@material-ui/core';

import SeedFields from './fields/SeedFields';
import GitlabSettingsFields from './fields/GitlabSettingsFields';
import NginxSettingsFields from './fields/NginxSettingsFields';
import ProxySettingsFields from './fields/ProxySettingsFields';
import GitlabRunnerFields from './fields/GitlabRunnerFields';

import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import SyncServerFields from './fields/SyncServerFields';

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
  const [main, setMain] = useState(props.main);
  const [seedInit, setSeedInit] = useState(main.init);
  const [syncInit, setSyncInit] = useState(main.init);
  const [gitlabInit, setGitlabInit] = useState(main.init);
  const [nginxInit, setNginxInit] = useState(main.init);
  const [proxyInit, setProxyInit] = useState(main.init);
  const [runnerInit, setRunnerInit] = useState(main.init);

  useEffect(() => {
    runInAction(() => {
      setSeedInit(main.init);
      setSyncInit(main.init);
      setGitlabInit(main.init);
      setNginxInit(main.init);
      setProxyInit(main.init);
      setRunnerInit(main.init);
    });
  },[main.init]);

  useEffect(() => {
    runInAction(() => setMain(props.main));
  }, [props.main.id]);

  const [activeStep, setActiveStep] = useState(0);

  const steps = [{
    label  : 'Seed',
    enabled: true
  }, {
    label  : 'Sync',
    enabled: !syncInit
  },{
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
      case 0: setSeedInit(false); break;
      case 1: setSyncInit(false); break;
      case 2: setGitlabInit(false); break;
      case 3: setNginxInit(false); break;
      case 4: setProxyInit(false); break;
      case 5: setRunnerInit(false); break;
      }

      if (step > steps.length - 1) {
        console.log('laststep')
      } else {
        setActiveStep(step);
      }
    });
  };

  return (
    <Paper className={classes.paper} elevation={0}>
      <Grid container justify="center">
        <Grid item xs={3}>
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
        <Grid item xs={7}>
          <SeedFields init={seedInit} hidden={activeStep !== 0} main={main} />
          <SyncServerFields init={syncInit} hidden={activeStep !== 1} main={main} />
          <GitlabSettingsFields init={gitlabInit} hidden={activeStep !== 2} main={main} />
          <NginxSettingsFields init={nginxInit} hidden={activeStep !== 3} main={main} />
          <ProxySettingsFields init={proxyInit} hidden={activeStep !== 4} main={main} />
          <GitlabRunnerFields init={runnerInit} hidden={activeStep !== 5} main={main} />
        </Grid>
      </Grid>
    </Paper>
  );
});

export default GeneralForm;
