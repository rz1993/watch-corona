import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles({
  heavy: {
    fontWeight: "500",
    color: "#212121"
  },
  section: {
    textAlign: "center"
  }
})

const Banner = props => {
  const styles = useStyles();

  //const { change, changePercent, dayOf, dayBefore } = props.data
  const sections = [
    { title: 'CONFIRMED', key: 'confirmed' },
    { title: 'DEATHS', key: 'deaths' },
    { title: 'RECOVERED', key: 'recovered' }
  ]
  return (
    <div>
      <Box display="flex" flexDirection="row" justifyContent="space-around">
        {
          sections.map(section => {
            const { dayOf, change, changePercent } = props.data[section.key]
            return (
              <Box className={styles.section} key={section.key} display="flex" flexDirection="column">
                <Typography className={styles.heavy} variant="subtitle2">
                  {section.title}
                </Typography>
                <Typography className={styles.heavy} variant="h6">
                  {dayOf}
                </Typography>
                { change >= 0 ? (
                    <Typography className={styles.heavy} variant="subtitle2">
                      ( + {change} / + {changePercent.toFixed(2)}% )
                    </Typography>
                ) : (
                    <Typography className={styles.heavy} variant="subtitle2">
                      ( - {-1 * change} / + {-1 * changePercent.toFixed(2)}% )
                    </Typography>
                )}
              </Box>
            )
          })
        }
      </Box>
    </div>
  )
}

export default Banner;
