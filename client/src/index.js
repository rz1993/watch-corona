import React, { Component, useState } from 'react';
import ReactDOM from 'react-dom';
import { makeStyles } from '@material-ui/core/styles';
//import Paper from '@material-ui/core/Paper';
import { Paper } from './components/shared';
import Grid from '@material-ui/core/Grid';
import { AppBar, Button, Toolbar, IconButton, Typography } from '@material-ui/core'
import Table from './components/CountTable';
import Banner from './components/Banner';
import Dashboard from './components/Dashboard';

/*
TODO:
  - Add a loading animation while the dashboard downloads rest of javascript
    - Might need to use redux
    - https://blog.logrocket.com/use-hooks-and-context-not-react-and-redux/ (instead of full blown redux)
  - Add a last updated indicator somewhere
  - [DONE] Add a tab for state and city, just like country for newest totals
  - [DONE] Add ability to search for a value in newest totals table
  - Add ability to select a certain date in newest totals table
  - Change banner to Totals rather than just US
  - [PARTIAL] Add themes so that things are uniform/can add light theme and dark theme
  - [FIXED] Add Client Layer caching
  - [FIXED] Some cities are "Unassigned" - show "State" for cities so that we know where these belong (some cities are have same name)
  - [FIXED] Data for some cities and states have missing dates, these show up as 0, fix numbers in database
*/


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));


function App() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            COVID-19 Tracker
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Banner />
          </Paper>
        </Grid>
        <Grid item>
        <Dashboard />
        </Grid>
      </Grid>
    </div>
  );
}


ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
