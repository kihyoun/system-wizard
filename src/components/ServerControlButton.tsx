import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SyncIcon from '@material-ui/icons/Sync';
import RotateRightIcon from '@material-ui/icons/RotateRight';
import { runInAction } from 'mobx';

export default function ServerControlButton(props:any) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
        props.setOpenAlert(err);
        handleClose();
      });
    });
  };

  return (
    <React.Fragment>
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
      </Menu>
    </React.Fragment>
  );
}
