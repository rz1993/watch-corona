import React from 'react';
import MuiPaper from '@material-ui/core/Paper';
import { makeStyles, withStyles } from '@material-ui/core/styles';


export const Paper = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    color: theme.palette.text.primary
  }
}))(MuiPaper)
