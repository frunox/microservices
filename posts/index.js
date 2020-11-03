const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title
  };

  // await axios.post('http://localhost:4005/events', {  // uses IP for local access
  await axios.post('http://event-bus-srv:4005/events', {  // use IP for K8s services access
    type: 'PostCreated',
    data: {
      id,
      title
    }
  });

  res.status(201).send(posts[id]);
});
// add handler for post requests (events from bus)
app.post('/events', (req, res) => {
  console.log('Posts Service Received Event', req.body.type);

  res.send({});
});

app.listen(4000, () => {
  console.log('Posts Service Listening on 4000');
});