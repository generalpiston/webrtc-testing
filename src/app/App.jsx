import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import * as shortid from 'shortid';
import Channel from './components/Channel';

class App extends Component {
  componentDidMount() {
    if (!window.location.hash) {
      window.location.hash = '#' + shortid.generate();
      window.location.reload();
    }
  }

  render() {
    if (!window.location.hash) {
      return null;
    }

    const channel = window.location.hash.substring(1);

    return <Channel channel={channel} />;
  }
}

export default hot(module)(App);
