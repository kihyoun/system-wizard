import React from 'react';
import {
  Card,
  CardContent,
  createStyles,
  FormControlLabel,
  Grid,
  List, ListItem, ListItemText, makeStyles,
  Switch,
  Theme,
  Toolbar
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { green } from '@material-ui/core/colors';

const useCardStyles = makeStyles({
  root  : { minWidth: 275 },
  bullet: {
    display  : 'inline-block',
    margin   : '0 2px',
    transform: 'scale(0.8)'
  },
  title: {
    fontSize: 14,
    flexGrow: 1
  },
  pos  : { marginBottom: 12 },
  green: { color: green[500] }
});

const useListSyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth       : 360,
      backgroundColor: theme.palette.background.paper,
      overflow       : 'hidden'
    }
  })
);
const ProjectCard = observer((props: any) => {
  const cardClasses = useCardStyles();
  const listClasses = useListSyles();

  return (
    <Grid item xs={4}>
      <Card color="primary.main" className={cardClasses.root}>
        <CardContent>
          <Toolbar>
            <FormControlLabel
              control={
                <Switch
                  checked={props.useHost === 'true'}
                  onChange={ev => props.handleChange(ev.target.checked)}
                  name="prodCfg"
                  color="primary"
                />
              }
              label={props.context}
            />
          </Toolbar>

          {props.useHost === 'true' &&
          <List className={listClasses.root}>
            <ListItem>
              <ListItemText primary="Host"
                secondary={(props.domainMode < 2 && 'http' || 'https') + `://${props.host}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Internal Port"
                secondary={props.port} />
            </ListItem>
            {props.domainMode > 1 && (
              <>
                <ListItem>
                  <ListItemText primary="SSL Certificate Path"
                    secondary={props.ssl} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="SSL Certificate Key" secondary={props.sslKey} />
                </ListItem>
              </> )}
          </List>
          }
        </CardContent>
      </Card>
    </Grid>
  );
});

export default ProjectCard;
