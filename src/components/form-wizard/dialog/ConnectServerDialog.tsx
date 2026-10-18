import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ServerCredentialFields from '../../fields/ServerCredentialFields';
import { observer } from 'mobx-react';
export const ConnectServerDialog = observer((props: any) => {
    const [open, setOpen] = useState(props.connectServer);
    const [password, setPassword] = useState(props.main.config.syncPass);
    const handleClose = () => {
        setOpen(false);
        props.setClose();
    };
    useEffect(() => {
        setOpen(props.connectServer);
    }, [props.connectServer]);
    return (<div>
      <Dialog transitionDuration={0} fullWidth={true} maxWidth={'xs'} open={open} onClose={handleClose} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">Connect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <ServerCredentialFields setPassword={(value: string) => setPassword(value)} password={password} init={props.main.init} main={props.main}/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button size="large" disableElevation autoFocus onClick={() => props.handleSubmit(password)} color="primary" variant="contained">
            {props.main.sync.connected ? 'Logout' : 'Submit'}
          </Button>
          <Button size="large" onClick={handleClose} color="primary" autoFocus disableElevation>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>);
});
export default ConnectServerDialog;
