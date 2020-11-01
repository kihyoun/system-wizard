import React, { useState } from 'react';
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
import { Toolbar } from '@material-ui/core';
import Helper from 'src/api/Helper';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.background.paper,
      width          : 500,
      position       : 'relative',
      minHeight      : 200
    },
    fab: {
      top  : theme.spacing(2),
      right: 0
    },
    fabGreen: {
      top  : theme.spacing(2),
      right: 0
    },
    toolbarWrapper: {
      '& .MuiToolbar-gutters': {
        paddingLeft : 0,
        paddingRight: 0
      }
    }
  })
);

export default function DownloadJsonDialog(props:any) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const [clipboard, setClipboard ] = useState(false);

  const classes = useStyles();

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
      icon     : <FileCopyIcon />
    },
    {
      color    : 'secondary' as const,
      className: classes.fabGreen,
      icon     : <CheckIcon />
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

        <DialogTitle id="responsive-dialog-title">Export settings as JSON</DialogTitle>
        <DialogContent>
        The JSON File can be imported using the import Dialog
          <React.Fragment >
            <div className={classes.toolbarWrapper}>
              <Toolbar>
                <div />
                {fabs.map((fab, index) => {
                  const tooltip = index < 1
                    ? 'Copy the contents into Clipboard'
                    : 'Copy successful.';

                  return (
                    <Zoom
                      key={fab.color}
                      in={clipboard === Boolean(index)}
                      timeout={transitionDuration}
                      style={{ transitionDelay: `${clipboard === Boolean(index) ? transitionDuration.exit : 0}ms` }}
                      unmountOnExit
                    >
                      <Tooltip title={tooltip}
                        aria-label={tooltip}>
                        <Button size="small" onClick={() => {
                          const copyListener = (e:any) => {
                            e?.clipboardData?.setData('text/plain',
                              Helper.jsonLogo + JSON.stringify(props.main.asJson, null, 4));
                            e?.clipboardData?.setData('text/html',
                              Helper.jsonLogo + JSON.stringify(props.main.asJson, null, 4));
                            e?.preventDefault();
                          }

                          document.addEventListener('copy', copyListener);
                          document.execCommand('copy');
                          document.removeEventListener('copy', copyListener);
                          setClipboard(true)
                        }}
                        aria-label={tooltip}
                        className={fab.className} color={fab.color}
                        startIcon={fab.icon}>{index === 0 && 'Copy & Paste' || 'Done'}
                        </Button>
                      </Tooltip>
                    </Zoom>
                  )
                })}
              </Toolbar>
            </div>
            <DialogContentText>
              <SyntaxHighlighter language="json" style={duotoneLight}>
                {Helper.jsonLogo + JSON.stringify(props.main.asJson, null, 4)}
              </SyntaxHighlighter>
            </DialogContentText>
          </React.Fragment>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => props.main.exportJson()}
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
