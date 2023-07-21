// app.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIO(server
  , {
  cors: {
    origin: "*"
  }
}
);
app.use(cors());

const mp = {};

const UUIDToYoutube = {};

// Middleware: Enable CORS and parse incoming JSON data
// app.use(cors());
app.use(express.json());


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (data) => {
    console.log('join', data);
    socket.join(data.room);
  });
  // Handle events from the frontend here

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });

  socket.on('leave', (data) => {
    console.log('leave', data);
    socket.leave(data.room);
  });

  socket.on('play', (data) => {
    console.log('play', data);
    socket.to(data.sessionId).emit('play', data);
  });

  socket.on('screenClick', (data) => {
    console.log('Received click event from client:', data);
    socket.to(data.room).emit('screenClick', data);
  });


});


// Example route
app.get('/api/data', (req, res) => {
  console.log('GET /api/data');
  res.json({ message: 'Hello from the backend!' });
});
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
// Example route
app.get('/create/session/:link', (req, res) => {
    link = req.params.link;
    console.log("youtube link is: "+link);
    sessionId = uuidv4();
    mp[sessionId] = link;
    console.log("link received: "+link+" session_id: "+sessionId);
    res.json({ message: sessionId});
  });

  // Example route
app.get('/watch/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  console.log("session id is: "+sessionId);
  const link = mp[sessionId];
  console.log("link for this session id is: "+link);
  res.json({ message: link});
});

// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
