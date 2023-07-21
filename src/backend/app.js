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

  // Handle the 'userClick' event from the frontend
  socket.on('userClick', (data) => {
    console.log('User clicked:', data.message);
    // Perform any backend processing here
  });

  // Handle events from the frontend here

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});


// Example route
app.get('/api/data', (req, res) => {
  console.log('GET /api/data');
  res.json({ message: 'Hello from the backend!' });
});

// Example route
app.get('/create/session/:link', (req, res) => {
    const link = req.params.link;
    console.log("youtube link is: "+link);
    const sessionId = uuidv4();
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
  
  res.json({ message: "link received: "+link+" session_id: "+sessionId});
});
// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
