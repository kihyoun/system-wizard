import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SyncIcon from '@material-ui/icons/Sync';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import { runInAction } from 'mobx';
import PublishIcon from '@material-ui/icons/Publish';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography
} from '@material-ui/core';

export default function ServerControlButton(props:any) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [publish, setPublish] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFetch = () => {
    runInAction(() => {
      props.main.sync.fetch().then((res:any) => {
        props.setOpenSuccess('Import finished. ' +
          (res > 0 ? `(Skipped ${res} File(s)` : ''));
        handleClose();
      }).catch((err:any) => {
        props.setOpenAlert(err.toString());
        handleClose();
      });
    });
  };

  const handlePush = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Sending Data...');
        await props.main.sync.push();
        props.setOpenSuccess('Restarting...');
        await props.main.sync.restart();
        props.setOpenSuccess('Ready.');
        handleClose();
        setPublish(false);
      } catch(err:any) {
        props.setOpenAlert(err.toString());
        handleClose();
        setPublish(false);
      }
    });
  };

  return (
    <React.Fragment>
      <Dialog
        fullWidth={true}
        maxWidth={'xs'}
        open={publish}
        onClose={()=> setPublish(false)}
        aria-labelledby="responsive-dialog-title"
      >

        <DialogTitle id="responsive-dialog-title">Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography color="secondary">
             This action will reset the System and cause potential Data loss.
            </Typography>
            <br />
            <br />
           Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handlePush}
            color="secondary" startIcon={<PublishIcon />}>
            Publish
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Button style={{ marginRight: '1ch' }} variant="text" aria-controls="simple-menu" aria-haspopup="true"
        color={'primary'}
        component="span"
        startIcon={<SyncIcon />}
        onClick={handleClick}>
        Synchronize
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleFetch}><RotateRightIcon />Fetch</MenuItem>
        <MenuItem onClick={() => setPublish(true)}><PublishIcon />Publish</MenuItem>
      </Menu>
    </React.Fragment>
  );
}
