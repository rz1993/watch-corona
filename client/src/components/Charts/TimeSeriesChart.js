import React, { Component } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { chartMargins, formatData, ChartTitle } from './utils';
import { getClient } from '../../api';


class TimeSeries extends Component {
  render() {
    let { data } = this.props

    return (
      <ResponsiveContainer width="99%" aspect={2}>
        <LineChart data={data} margin={chartMargins}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date" angle={45} textAnchor="start" height={60}/>
          <YAxis tickCount={10}/>
          <Tooltip/>
          <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingLeft: 20 }}/>
          <Line type="monotone" dataKey="confirmed" stroke="#fdd835" activeDot={{ r: 8 }}/>
          <Line type="monotone" dataKey="deaths" stroke="#EF5350" activeDot={{ r: 8 }}/>
          <Line type="monotone" dataKey="recovered" stroke="#81D4FA" activeDot={{ r: 8 }}/>
        </LineChart>
      </ResponsiveContainer>
    )
  }
}

class TimeSeriesContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      logScale: false,
      data: []
    }
  }

  fetchData(level, value) {
    const apiClient = getClient(level)
    apiClient.timeline({ value })
      .then(resp => this.setState({
        loading: false,
        data: formatData(resp.data)
      }))
      .catch(err => console.log(err))
  }

  componentDidMount() {
    const { level, value } = this.props
    this.fetchData(level, value)
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props
    if (prevProps.value && nextProps.value && prevProps.value !== nextProps.value) {
      const { level, value } = nextProps
      this.fetchData(level, value)
    }
  }

  toggleLogScale(evt) {
    evt.preventDefault()
    this.setState(lastState => ({
      ...lastState,
      logScale: !lastState.logScale
    }))
  }

  render() {
    const { loading, logScale } = this.state
    const { value } = this.props
    if (loading) {
      return <h1>Loading</h1>
    } else {
      const data = logScale ? (
        this.state.data.map(d => ({
          ...d,
          confirmed: Math.log(d.confirmed+1),
          deaths: Math.log(d.deaths+1),
          recovered: Math.log(d.recovered+1)
        }))
      ) : this.state.data

      return (
        <div>
          <ChartTitle title="Daily Totals"/>
          <TimeSeries data={data} />
        </div>
      )
    }
  }
}

export default TimeSeriesContainer;
