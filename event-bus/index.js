const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// create 'datastore' for all events
const events = [];

app.post('/events', (req, res) => {
  // request body could be string, json, ..., allowing for various types of requests
  const event = req.body;

  // push each new event into the events array
  events.push(event);

  // send requests to each service for local access
  // axios.post('http://localhost:4000/events', event); // posts
  // axios.post('http://localhost:4001/events', event); // comments
  // axios.post('http://localhost:4002/events', event); // query service
  // axios.post('http://localhost:4003/events', event); // moderation service

  // use IPs for K8s services access
  axios.post('http://posts-clusterip-srv:4000/events', event); // posts
  axios.post('http://comments-srv:4001/events', event); // comments
  axios.post('http://query-srv:4002/events', event); // query service
  axios.post('http://moderation-srv:4003/events', event); // moderation service

  res.send({ status: 'OK' });
});

// create request for all past events (to re-stock events in services that are new or interrupted)
app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log('Event Bus Listening on 4005');
});
