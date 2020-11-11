import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { runInAction } from 'mobx';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

export default function ImportFileDialog(props:any) {
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    setOpen(false);
    props.setClose();
  };

  const handleImport = () => {
    console.log('handleimport')
    runInAction(() => {
      if (props.files.length < 1) {
        return;
      }
      const file = props.files[0];
      const reader = new FileReader();
      reader.readAsText(props.files[0], 'UTF-8');
      reader.onprogress = function (evt:any) {
        props.setProgress(100 * (evt.loaded / evt.total));
      }
      reader.onload = function (evt:any) {
        try {
          props.main.importFile(file, evt.target.result);
          props.setOpenSuccess('Import finished: ' + file.name);
        } catch (e) {
          props.setOpenAlert('error reading file: ' + e.toString());
        }
      }
      reader.onerror = function () {
        props.setOpenAlert('error reading file')
      }

      handleClose();
    });
  };

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'xs'}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >

        <DialogTitle id="responsive-dialog-title">Import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <p>
              Import File: <b>{props.files?.[0].name}</b>
            </p>
            Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleImport}
            color="primary" startIcon={<CloudUploadIcon />}>
            Import
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
