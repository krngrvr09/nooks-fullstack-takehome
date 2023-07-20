// app.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');

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
app.get('/create/session', (req, res) => {
    const sessionId = uuidv4();
    mp[sessionId] = 1;
    res.json({ message: sessionId });
  });
  
// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
