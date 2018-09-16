const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const { Message } = require('./entities');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function channelToJSON(instance) {
  return {
    channel: instance.channel,
    data: JSON.parse(instance.data),
    order: instance.order,
  };
}

app.get('/:channel', (req, res) => {
  const { channel } = req.params;

  Message.findAll({ where: { channel } })
    .then(instances => {
      res.status(200).json(instances.map(channelToJSON));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: {
          message: err.message || err.toString(),
          code: -1,
        },
      });
    });
});

app.get('/:channel/:order', (req, res) => {
  const { channel, order } = req.params;

  Message.findOne({ where: { channel, order } })
    .then(instance => {
      if (instance) {
        res.status(200).json(channelToJSON(instance));
      } else {
        res.status(404).send();
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: {
          message: err.message || err.toString(),
          code: -1,
        },
      });
    });
});

app.post('/:channel', (req, res) => {
  const { channel } = req.params;
  const data = req.body;

  if (!data) {
    res.status(400).json({
      error: {
        message: 'no message provided',
        code: 100,
      },
    });
  }

  if (['offer', 'answer'].indexOf(data.type) === -1) {
    res.status(400).json({
      error: {
        message: 'Wrong type provided',
        code: 101,
      },
    });
  }

  Message.findOne({ where: { channel }, order: [['order', 'DESC']] })
    .then(instance => {
      let order = 0;
      if (instance) {
        order = instance.order + 1;
      }
      return Message.create({ channel, data: JSON.stringify(data), order });
    })
    .then(instance => {
      res.status(200).json(instance);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: {
          message: err.message || err.toString(),
          code: -1,
        },
      });
    });
});

const server = app.listen(8081, () => {
  const { host, port } = server.address();

  console.log('Listening at http://%s:%s', host, port);
});
