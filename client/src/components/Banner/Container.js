import React, { Component } from 'react';
import Banner from './Component';
import { CountryApi } from '../../api';


class BannerContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    CountryApi.change({value: 'US'})
      .then(resp => this.setState({
        data: resp.data, loading: false
      }))
  }

  render() {
    const { data, loading } = this.state
    return (
      <div>
        {
          loading ? (
            <h2>Loading</h2>
          ) : (
            <Banner data={data} />
          )
        }
      </div>
    )
  }
}

export default BannerContainer;
