import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

export const derivedWarning = 'These values were derived automatically. Please verify that they are correct and usable before pushing the configuration.';

export default function DerivedLabel(props: { label: string; source?: string }) {
  return <>{props.label}{props.source && (
    <Tooltip title={`${derivedWarning} Source: ${props.source}`}>
      <span tabIndex={0} aria-label={`${props.label}: derived value. ${derivedWarning}`} style={{ cursor: 'help' }}> *</span>
    </Tooltip>
  )}</>;
}
