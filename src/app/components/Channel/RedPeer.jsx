import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as Peer from 'simple-peer';

const startStream = (video, s) => {
  video.srcObject = s;
  video.onloadedmetadata = () => {
    video.play();
  };
  return s;
};

async function getMediaStream(config) {
  if (navigator.mediaDevices) {
    return navigator.mediaDevices.getUserMedia(config);
  }

  const getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  return new Promise((resolve, reject) => {
    getUserMedia(
      {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      },
      resolve,
      reject,
    );
  });
}

export default class RedPeer extends Component {
  static propTypes = {
    initiator: PropTypes.bool.isRequired,
    pushMessage: PropTypes.func.isRequired,
    message: PropTypes.any,
  };

  constructor(props) {
    super(props);

    this.me = React.createRef();
    this.them = React.createRef();

    this.peer = new Peer({
      config: {
        iceServers: [
          {
            urls: 'stun:mobidex.io:3478?transport=tcp',
            username: 'test',
            credential: 'test',
          },
          {
            urls: 'turn:mobidex.io:3478?transport=tcp',
            username: 'test',
            credential: 'test',
          },
        ],
      },
      initiator: this.props.initiator,
      reconnectTimer: 100,
      iceTransportPolicy: 'relay',
      trickle: false,
    });
  }

  async componentDidMount() {
    const { message, pushMessage } = this.props;

    this.peer.on('signal', data => {
      console.debug('SIGNAL', JSON.stringify(data));
      pushMessage(data);
    });

    this.peer.on('stream', s => {
      console.log('STREAM', s);
      startStream(this.them.current, s);
    });

    if (message) {
      console.debug('ANSWER-PREV', JSON.stringify(message.data));
      this.peer.signal(message.data);
    }
  }

  async componentDidUpdate() {
    const { message } = this.props;
    if (message) {
      console.debug('ANSWER', JSON.stringify(message.data));
      this.peer.signal(message.data);
    }
  }

  render() {
    return (
      <div>
        <video style={{ height: 100, width: 100 }} autoPlay ref={this.me} />
        <video style={{ height: 100, width: 100 }} autoPlay ref={this.them} />

        <button
          type="button"
          onClick={() => {
            getMediaStream({
              video: true,
              audio: false,
            }).then(s => {
              startStream(this.me.current, s);
              this.peer.addStream(s);
            });
          }}
        >
          Start Video
        </button>
      </div>
    );
  }
}
