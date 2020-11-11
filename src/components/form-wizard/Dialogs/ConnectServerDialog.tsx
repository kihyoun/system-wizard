import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ServerCredentialFields from 'src/components/fields/ServerCredentialFields';

export default function ConnectServerDialog(props:any) {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState(props.main.config.syncPass);

  const handleClose = () => {
    setOpen(false);
    props.setClose();
  };

  useEffect(() => {
    if (props.main.sync.connected) {
      handleClose();
    }
  },[props.main.sync.connected]);

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'xs'}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >

        <DialogTitle id="responsive-dialog-title">Connect</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <ServerCredentialFields
              setPassword={(value:string) => setPassword(value)}
              password={password}
              init={props.main.init}
              main={props.main} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => props.handleSubmit(password)}
            color="primary" variant="contained" >
            Submit
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
