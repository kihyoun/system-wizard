import React from 'react';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
export default function PushDialog(props: any) {
    return (<React.Fragment>
      <Dialog transitionDuration={0} fullWidth={true} maxWidth={'xs'} open={props.open} onClose={() => props.setOpen(false)} aria-labelledby="responsive-dialog-title">

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
          <Button autoFocus disableElevation variant="contained" onClick={props.handlePush} color="secondary" startIcon={<PublishIcon />}>
            Push
          </Button>
          <Button onClick={() => props.setOpen(false)} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>);
}
