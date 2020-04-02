import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { Paper } from '../shared';
import Form from '../Form';
import ChangeChart from '../Charts/ChangeChart';
import TimeSeriesChart from '../Charts/TimeSeriesChart';
import CountTable from '../CountTable';
import { getClient } from '../../api';


const DEFAULT_LEVEL_VALUES = {
  country: 'US',
  state: 'New York',
  city: 'New York City'
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  }
}));

function Charts({ level, value }) {
  const classes = useStyles()

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Paper>
          <TimeSeriesChart level={level} value={value}/>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Paper className={classes.paper}>
          <ChangeChart level={level} value={value} />
        </Paper>
      </Grid>
    </Grid>
  )
}

export default function Dashboard(props) {
  const [level, setLevel] = useState('country')
  const [value, setValue] = useState('US')

  return (
    <Grid container spacing={3}>
      <Grid item md={12} lg={5}>
        <CountTable handleRowSelect={(level, name) => {
          setLevel(level)
          setValue(name)
        }}/>
      </Grid>
      <Grid item md={12} lg={7}>
        <Charts level={level} value={value}/>
      </Grid>
    </Grid>
  )
}
