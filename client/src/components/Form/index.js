import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));


export default function CountryForm(props) {
  const classes = useStyles();
  const {
    onChangeLevel,
    onChangeValue,
    level,
    options,
    value
  } = props;

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-native-simple">Level</InputLabel>
        <Select
          native
          value={level}
          onChange={onChangeLevel}
          inputProps={{
            name: 'age',
            id: 'age-native-simple',
          }}
        >
          <option value="country">Country</option>
          <option value="state">State</option>
          <option value="city">City</option>
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="age-native-simple">{ level }</InputLabel>
        <Select
          native
          value={value}
          onChange={onChangeValue}
          inputProps={{
            name: 'age',
            id: 'age-native-simple',
          }}
        >
          <option aria-label="None" value="" />
          { options.map(c => <option key={c} value={c}>{c}</option>) }
        </Select>
      </FormControl>
    </form>
  );
}
