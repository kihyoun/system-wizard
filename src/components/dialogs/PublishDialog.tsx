import React from 'react';
import Button from '@material-ui/core/Button';
import PublishIcon from '@material-ui/icons/Publish';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography
} from '@material-ui/core';

export default function PublishDialog(props:any) {

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth={'xs'}
        open={props.open}
        onClose={()=> props.setOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >

        <DialogTitle id="responsive-dialog-title">Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography color="secondary">
             This action will overwrite any settings
             on the System and cause potential Data loss.
            </Typography>
            <br />
            <br />
           Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={props.handlePush}
            color="secondary" startIcon={<PublishIcon />}>
            Publish
          </Button>
          <Button onClick={() => props.setOpen(false)} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
