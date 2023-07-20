// app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

const mp = {};

// Middleware: Enable CORS and parse incoming JSON data
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get('/api/data', (req, res) => {
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
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
