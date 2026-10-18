import React, { useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
const DarkModeSwitch = (props: any) => {
    const [dark, setDark] = useState(false);
    const handleChange = (event: any) => {
        setDark(event.target.checked);
        props.handleChange(event);
    };
    return (<FormGroup row>
      <FormControlLabel control={<Switch onChange={handleChange} color="default" defaultChecked={false}/>} label={dark ? 'Light' : 'Dark'}/>
    </FormGroup>);
};
export default DarkModeSwitch;
