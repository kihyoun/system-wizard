import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SyncIcon from '@material-ui/icons/Sync';
import { runInAction } from 'mobx';
import PushDialog from './dialogs/PushDialog';

export default function ServerControlButton(props:any) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [push, setPush] = React.useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFetch = () => {
    runInAction(() => {
      props.main.sync.fetch().then((res:any) => {
        const msg = 'Import finished. ' +
          (res > 0 ? `(Skipped ${res} File(s)` : '');
        props.setOpenSuccess(msg);
        props.setLastStatusMessage(msg);
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
        setPush(false);
      } catch(err:any) {
        const msg = err.response?.data || err.toString();
        props.setOpenAlert(msg);
        props.setLastStatusMessage(msg);
        handleClose();
        setPush(false);
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

  const handleSeed = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Pushing Seed Information...');
        await props.main.sync.pushMain();
        props.setOpenSuccess('Initiating Seed...');
        await props.main.sync.seed();
        props.setOpenSuccess('Ready.');
      } catch (err) {
        props.setOpenAlert(err.response?.data || err.toString());
      }
      handleClose();
    });
  };

  const handleHarvest = () => {
    runInAction(async () => {
      try {
        props.setOpenSuccess('Starting Harvest...');
        await props.main.sync.harvest();
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
      <PushDialog
        open={push}
        setOpen={setPush}
        handlePush={handlePush}
        onClose={()=> setPush(false)}
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
        <MenuItem onClick={() => setPush(true)}>Push</MenuItem>
        <MenuItem onClick={() => handleSeed()}>Seed</MenuItem>
        <MenuItem onClick={() => handleRestart()}>Restart</MenuItem>
        <MenuItem onClick={handleFetch}>Fetch</MenuItem>
        <MenuItem onClick={() => handleReset()}>Reset</MenuItem>
        <MenuItem onClick={() => handleHotPatch()}>Update</MenuItem>
        <MenuItem onClick={() => handleRegister()}>Register</MenuItem>
        <MenuItem onClick={() => handleUnregister()}>Unregister</MenuItem>
        <MenuItem onClick={() => handleHarvest()}>Harvest</MenuItem>
      </Menu>
    </React.Fragment>
  );
}
