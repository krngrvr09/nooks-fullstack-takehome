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

const mp = new Map();

const UUIDToYoutube = {};

// Middleware: Enable CORS and parse incoming JSON data
// app.use(cors());
app.use(express.json());


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (data) => {
    console.log('join', data);
    socket.join(data.room);

    // if I have previous data, send it to the new user.
    if(mp.has(data.room)&& mp.get(data.room).has("playing")){
      console.log("sending previous data to new user");
      console.log("playing: "+mp.get(data.room).get("playing"));
      console.log("old seekVal: "+mp.get(data.room).get("seekVal"));
      // console.log("new seekVal: "+(mp.get(data.room).get("seekVal")+(Date.now()-mp.get(data.room).get("time"))/mp.get(data.room).get("duration"))/1000.0);
      console.log("duration: "+mp.get(data.room).get("duration"));
      if(mp.get(data.room).get("playing") == true){
        const time_elapsed = (Date.now()-mp.get(data.room).get("time"))/1000;
        console.log("time elapsed: "+time_elapsed);
        const newSeekVal = (mp.get(data.room).get("seekVal")+time_elapsed/mp.get(data.room).get("duration"));
        console.log("new seekVal: "+newSeekVal);
        socket.emit('playPause', {playing: mp.get(data.room).get("playing"), seekVal: newSeekVal});
      }
      else{
        const newSeekVal = mp.get(data.room).get("seekVal");
        console.log("new seekVal: "+newSeekVal);
        socket.emit('playPause', {playing: mp.get(data.room).get("playing"), seekVal: newSeekVal});
      }
      
    }
    else{
      console.log("no previous data found");
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });

  // PLAY/PAUSE Controls
  socket.on('playPause', (data) => {
    console.log('Received play event from client:', data);
    mp.get(data.room).set("playing", data.playing);
    mp.get(data.room).set("seekVal", data.seekVal);
    mp.get(data.room).set("time", Date.now());
    socket.to(data.room).emit('playPause', data);
  });

  // SEEK Controls
  socket.on('seekchange', (data) => {
    console.log('Received seek event from client:', data);
    mp.get(data.room).set("playing", data.playing);
    mp.get(data.room).set("seekVal", data.seekVal);
    mp.get(data.room).set("time", Date.now());
    socket.to(data.room).emit('seekchange', data);
  });

  // DURATION Controls
  socket.on('duration', (data) => {
    console.log('Received duration event from client:', data);
    mp.get(data.room).set("duration", data.duration);
  });

// -------------------------------------------------------------
  // socket.on('leave', (data) => {
  //   console.log('leave', data);
  //   socket.leave(data.room);
  // });

  // socket.on('play', (data) => {
  //   console.log('play', data);
  //   socket.to(data.sessionId).emit('play', data);
  // });

  // socket.on('screenClick', (data) => {
  //   console.log('Received click event from client:', data);
  //   socket.to(data.room).emit('screenClick', data);
  // });

  // socket.on('videoReady', (data) => {
  //   console.log('Received ready event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });



  // socket.on('videoPause', (data) => {
  //   console.log('Received pause event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });

  // socket.on('videoBufferStart', (data) => {
  //   console.log('Received buffer start event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });

  // socket.on('videoBufferEnd', (data) => {
  //   console.log('Received buffer end event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });

  // socket.on('videoProgress', (data) => {
  //   console.log('Received video Progress event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });

  // socket.on('videoEnd', (data) => {
  //   console.log('Received end event from client:', data);
  //   // socket.to(data.room).emit('ready', data);
  // });

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
    mp.set(sessionId, new Map());
    mp.get(sessionId).set("link", link);
    // mp[sessionId] = link;
    console.log("link received: "+link+" session_id: "+sessionId);
    res.json({ message: sessionId});
  });

  // Example route
app.get('/watch/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  console.log("session id is: "+sessionId);
  // const link = mp[sessionId];
  const link = mp.get(sessionId).get("link");
  
  console.log("link for this session id is: "+link);
  res.json({ message: link});
});

// Start the server
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
