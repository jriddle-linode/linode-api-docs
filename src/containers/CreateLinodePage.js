import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SourceSelection from '../components/create-linode/SourceSelection';
import { fetchDistros } from '../actions/distros';

class CreateLinodePage extends Component {
  constructor() {
    super();
    this.render = this.render.bind(this);
  }

  componentDidMount() {
      const { dispatch } = this.props;
      dispatch(fetchDistros());
  }

  render() {
    const { distros } = this.props;
    return (
      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <h1>Create a Linode</h1>
          <SourceSelection distros={distros} />
        </div>
      </div>
    );
  }
}

function select(state) {
  return { distros: state.distros.distros };
}

export default connect(select)(CreateLinodePage);