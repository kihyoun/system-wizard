import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  createStyles, makeStyles, Theme, useTheme
} from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Zoom from '@material-ui/core/Zoom';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CheckIcon from '@material-ui/icons/Check';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      width          : 500,
      position       : 'relative',
      minHeight      : 200
    },
    fab: {
      position: 'absolute',
      top     : theme.spacing(2),
      right   : theme.spacing(2)
    },
    fabGreen: {
      position: 'absolute',
      top     : theme.spacing(2),
      right   : theme.spacing(2)
    }
  })
);

export default function DownloadDockerDialog(props:any) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const [clipboard, setClipboard ] = useState(false);
  const classes = useStyles();

  const copyListener = (e:any) => {
    // e.clipboardData is initially empty, but we can set it to the
    // data that we want copied onto the clipboard.
    e?.clipboardData?.setData('text/plain', props.main.config.content);
    e?.clipboardData?.setData('text/html', props.main.config.content);

    // This is necessary to prevent the current document selection from
    // being written to the clipboard.
    e?.preventDefault();
  }

  useEffect(() => {
    document.addEventListener('copy', copyListener);
    return () => document.removeEventListener('copy', copyListener);
  },[]);

  const handleClose = () => {
    setOpen(false);
    props.setClose();
  };

  if (!open) {
    return null;
  }

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit : theme.transitions.duration.leavingScreen
  };


  const fabs = [
    {
      color    : 'primary' as const,
      className: classes.fab,
      icon     : <FileCopyIcon />,
      label    : 'Copy .docker.env to Clipboard',
      tooltip  : 'Copy .docker.env to Clipboard'
    },
    {
      color    : 'secondary' as const,
      className: classes.fabGreen,
      icon     : <CheckIcon />,
      label    : 'Done',
      tooltip  : 'Contents have been successfully copied to Clipboard'
    }
  ];

  return (
    <div>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        {fabs.map((fab, index) => (
          <Zoom
            key={fab.color}
            in={clipboard === Boolean(index)}
            timeout={transitionDuration}
            style={{ transitionDelay: `${clipboard === Boolean(index) ? transitionDuration.exit : 0}ms` }}
            unmountOnExit
          >
            <Tooltip title={fab.tooltip}
              aria-label={fab.tooltip}>
              <Button onClick={() => {
                /* Copy the text inside the text field */
                document.execCommand('copy');
                setClipboard(true)
              }}
              aria-label={fab.label} className={fab.className} color={fab.color}
              startIcon={fab.icon}>{fab.label}
              </Button>
            </Tooltip>
          </Zoom>
        ))}
        <DialogTitle id="responsive-dialog-title">Export Configuration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <SyntaxHighlighter language="bash" style={duotoneLight}>
              {'$ cat ./.docker.env'}
            </SyntaxHighlighter>
            <SyntaxHighlighter language="bash" style={duotoneLight}>
              {props.main.config.content}
            </SyntaxHighlighter>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => props.main.config.exportConfig()}
            color="primary" startIcon={<SaveIcon />}>
            Save
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
