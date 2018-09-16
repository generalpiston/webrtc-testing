import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as fetch from 'isomorphic-fetch';
import RedPeer from './RedPeer';

async function getChannelMessages(channel) {
  const response = await fetch(`http://localhost:8081/${channel}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function getChannelMessage(channel, order) {
  const response = await fetch(`http://localhost:8081/${channel}/${order}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function pushChannelMessage(channel, message) {
  const response = await fetch(`http://localhost:8081/` + channel, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default class Channel extends Component {
  static propTypes = {
    channel: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      initiating: false,
      order: 0,
      message: null,
    };

    this.timer = null;
  }

  async componentDidMount() {
    const { channel } = this.props;
    const instances = await getChannelMessages(channel);
    if (!instances || !instances.length) {
      this.setState({
        order: 0,
        message: null,
        initiating: true,
        loading: false,
      });
    } else {
      this.setState({
        order: instances.length,
        message: instances[instances.length - 1],
        initiating: false,
        loading: false,
      });
    }

    this.timer = setInterval(() => {
      const { order } = this.state;
      getChannelMessage(channel, order).then(message => {
        if (message) {
          this.setState({
            message,
            order: message.order + 1,
          });
        }
      });
    }, 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    const { channel } = this.props;
    const { initiating, loading, message } = this.state;
    if (loading) {
      return null;
    }
    const pushMessage = data => {
      const { order } = this.state;
      this.setState({ order: order + 1, message: null });
      pushChannelMessage(channel, data);
    };
    return (
      <RedPeer
        {...this.state}
        {...this.props}
        initiator={initiating}
        message={message}
        pushMessage={pushMessage}
      />
    );
  }
}
