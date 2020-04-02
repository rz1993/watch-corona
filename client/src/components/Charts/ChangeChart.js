import React, { Component } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { chartMargins, formatData } from './utils';
import { getClient } from '../../api';
import { formatDate, ChartTitle } from './utils';


class ChangeChart extends Component {
	render () {
    const { data } = this.props
    return (
      <ResponsiveContainer width="99%" aspect={2}>
      	<BarChart data={data} margin={chartMargins}>
         <CartesianGrid strokeDasharray="3 3"/>
         <XAxis dataKey="date" angle={45} textAnchor="start"/>
         <YAxis tickCount={10}/>
         <Tooltip/>
         <Legend layout="vertical" verticalAlign="top" align="right" wrapperStyle={{ paddingLeft: 20 }}/>
         <Bar dataKey="deaths" stackId="a" fill="#EF5350" />
         <Bar dataKey="recovered" stackId="a" fill="#81D4FA" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}

class ChangeChartContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      data: []
    }
  }

  fetchData(level, value) {
    const apiClient = getClient(level)
    const deaths = apiClient.deltas({ value, stat: 'deaths'})
    const recovered = apiClient.deltas({ value, stat: 'recovered'})
    Promise.all([deaths, recovered])
      .then(([resp1, resp2]) => {
        const deaths = resp1.data;
        const recovered = resp2.data;
        this.setState({
          loading: false,
          data: deaths.map(
            (d, i) => ({ date: formatDate(d.date), deaths: d.change, recovered: recovered[i].change })
          )
        })
      })
  }

  componentDidMount() {
    const { level, value, stat } = this.props
    this.fetchData(level, value)
  }

  componentDidUpdate(prevProps) {
    const nextProps = this.props
    if (prevProps.value && nextProps.value && prevProps.value !== nextProps.value) {
      const { level, value, stat } = nextProps
      this.fetchData(level, value)
    }
  }

  render() {
    const { data, loading } = this.state
    return (
      <div>
        <ChartTitle title="Daily Increase" />
        <ChangeChart data={data} />
      </div>
    )
  }
}

export default ChangeChartContainer;
