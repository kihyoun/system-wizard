import React, { useState } from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const DarkModeSwitch = (props: any) => {
  const [dark, setDark] = useState(false);

  const handleChange = (event: any) => {
    setDark(event.target.checked);
    props.handleChange(event);
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={<Switch onChange={handleChange} color="default" defaultChecked={false} />}
        label={dark ? 'Light' : 'Dark'}
      />
    </FormGroup>
  );
};

export default DarkModeSwitch;
