const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  // 'emit' the event to the event bus
  // await axios.post('http://localhost:4005/events', {
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending'
    }
  });

  res.status(201).send(comments);
});

// add handler for incoming post requests (events sent back from bus)
app.post('/events', async (req, res) => {
  console.log('Comments Service Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;

    const comments = commentsByPostId[postId];

    const comment = comments.find(comment => {
      return comment.id === id;
    });
    comment.status = status;
    console.log('moderated', status)
    // await axios.post('http://localhost:4005/events', {  // for local use
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { id, status, postId, content }
    });
  };

  res.send({});
});

app.listen(4001, () => {
  console.log('Comments Listening on 4001');
});
