import React from 'react';
import TextField from '@material-ui/core/TextField';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const MainFields = observer((props: any) => {
  if (props.hidden) return null;
  return <>
    <TextField label="Project Key" value={props.config.projectKey} fullWidth margin="normal"
      disabled={props.editing} error={!props.editing && props.availability !== 'available'}
      helperText={props.editing ? 'Existing keys are preserved.' : props.message}
      onChange={event => { const value = event.target.value; runInAction(() => { props.config._projectKey = value; }); }} />
    <TextField select label="GitLab namespace" fullWidth margin="normal" value={props.config.namespaceId}
      disabled={props.editing} SelectProps={{ native: true }}
      onChange={event => { const value = event.target.value; runInAction(() => { props.config.namespaceId = value; }); }}>
      <option value="">Select namespace</option>
      {props.namespaces.map((namespace:any) => <option key={namespace.id} value={namespace.id}>{namespace.path}</option>)}
    </TextField>
    <p>{props.destination}</p>
    <TextField select label="Application template" fullWidth margin="normal" value={props.config.template}
      disabled={props.editing} SelectProps={{ native: true }}
      helperText="Creates editable source, Dockerfile and matching CI. The first pipeline starts automatically."
      onChange={event => { const value = event.target.value; runInAction(() => { props.config.template = value; }); }}>
      <option value="react">React + TypeScript + Vite</option>
      <option value="angular">Angular + TypeScript</option>
      <option value="web">General web project — HTML, CSS, JavaScript</option>
      <option value="empty">Empty repository — add your own source later</option>
    </TextField>
  </>;
});
export default MainFields;
