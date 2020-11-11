import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SyncIcon from '@material-ui/icons/Sync';
import { runInAction } from 'mobx';
import PublishDialog from './dialogs/PublishDialog';

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
        props.setOpenSuccess('Ready.');
        handleClose();
        setPublish(false);
      } catch(err:any) {
        props.setOpenAlert(err.response?.data || err.toString());
        handleClose();
        setPublish(false);
      }
    });
  };

  const handleRestart = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Restarting...');
        await props.main.sync.restart();
        props.setOpenSuccess('Ready.');
        handleClose();
      } catch(err:any) {
        props.setOpenAlert(err.response?.data || err.toString());
        handleClose();
      }
    });
  };

  const handleReset = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Shutting down Project Proxies...');
        await props.main.sync.deleteProjects();
        props.setOpenSuccess('Deleting main Config and restarting');
        await props.main.sync.deleteMain();
        props.setOpenSuccess('Ready.');
      } catch(err:any) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };

  const handleRestore = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Pushing main...');
        await props.main.sync.pushMain();
        props.setOpenSuccess('Starting restore...');
        await props.main.sync.restore();
        props.setOpenSuccess('Ready.');
      } catch (err) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };
  const handleBackup = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Starting Backup...');
        await props.main.sync.backup();
        props.setOpenSuccess('Ready.');
      } catch (err) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };

  const handleRegister = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Registering runners...');
        await props.main.sync.registerRunners();
        props.setOpenSuccess('Ready.');
      } catch (err) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };

  const handleUnregister = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Unregistering runners...');
        await props.main.sync.unregisterRunners();
        props.setOpenSuccess('Ready.');
      } catch (err) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };

  const handleHotPatch = () => {
    runInAction(async () => {
      props.setOpenSuccess('Hotpatch started...');
      await props.main.sync.hotPatch();
      props.setOpenSuccess('Ready.');
      handleClose();
    });
  };

  return (
    <React.Fragment>
      <PublishDialog
        open={publish}
        setOpen={setPublish}
        handlePush={handlePush}
        onClose={()=> setPublish(false)}
      />
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
        <MenuItem onClick={() => setPublish(true)}>Publish</MenuItem>
        <MenuItem onClick={() => handleRestore()}>Restore</MenuItem>
        <MenuItem onClick={() => handleRestart()}>Restart</MenuItem>
        <MenuItem onClick={handleFetch}>Fetch</MenuItem>
        <MenuItem onClick={() => handleReset()}>Reset</MenuItem>
        <MenuItem onClick={() => handleHotPatch()}>Pull</MenuItem>
        <MenuItem onClick={() => handleRegister()}>Register</MenuItem>
        <MenuItem onClick={() => handleUnregister()}>Unregister</MenuItem>
        <MenuItem onClick={() => handleBackup()}>Backup</MenuItem>
      </Menu>
    </React.Fragment>
  );
}
