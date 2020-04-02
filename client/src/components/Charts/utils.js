import React from 'react';
import moment from 'moment';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';


const verticalMargin = 40;
const horizontalMargin = 25;

export function formatDate(tickItem) {
  return moment(tickItem).format('l')
}

export const chartMargins = {
  top: verticalMargin,
  right: horizontalMargin,
  left: horizontalMargin,
  bottom: verticalMargin
}

export function formatData(data) {
  return data.map(d => (
    {
      ...d,
      date: formatDate(d.date)
    }
  ))
}

const useStyles = makeStyles(theme => ({
  chartTitle: {
    color: theme.palette.text.primary,
    fontWeight: 600
  },
  section: {
    textAlign: "center"
  },
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

export const ChartTitle = ({ title }) => {
  const styles = useStyles()

  return (
    <Toolbar className={styles.root}>
      <Typography className={styles.chartTitle} variant="h6">
        { title }
      </Typography>
    </Toolbar>
  )
}
