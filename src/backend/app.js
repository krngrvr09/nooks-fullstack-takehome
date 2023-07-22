// app.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Initializing the express app, http server, and socket.io server.
const app = express();
const server = http.createServer(app);
const io = socketIO(server
  , {
  cors: {
    origin: "*"
  }
}
);

// Middleware: Enable CORS and parse incoming JSON data
app.use(cors());
app.use(express.json());

// Map acts like a database to store the state. See notes.txt for details.
const mp = new Map();


// Connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // A user joining a room
  socket.on('join', (data) => {
    console.log('User joined', data);
    socket.join(data.room);

    // if I have previous video state, send it to the new user so that they can catch up.
    if(mp.has(data.room)&& mp.get(data.room).has("playing")){
      console.log("sending previous data to new user");
      console.log("playing: "+mp.get(data.room).get("playing"));
      console.log("old seekVal: "+mp.get(data.room).get("seekVal"));
      console.log("duration: "+mp.get(data.room).get("duration"));
      
      if(mp.get(data.room).get("playing") == true){
        // If the previous data was recorded when video played, then predict how far the video has progressed since then.
        
        const time_elapsed = (Date.now()-mp.get(data.room).get("time"))/1000;
        console.log("time elapsed: "+time_elapsed);
      
        const newSeekVal = (mp.get(data.room).get("seekVal")+time_elapsed/mp.get(data.room).get("duration"));
        console.log("new seekVal: "+newSeekVal);
      
        socket.emit('playPause', {playing: mp.get(data.room).get("playing"), seekVal: newSeekVal});
      }
      else{
        // If the previous data was recorded when video paused, then just send the seekVal.
        const newSeekVal = mp.get(data.room).get("seekVal");
        console.log("new seekVal: "+newSeekVal);
      
        socket.emit('playPause', {playing: mp.get(data.room).get("playing"), seekVal: newSeekVal});
      }
      
    }
    else{
      console.log("no previous data found");
    }
  });

  socket.on('leave', (data) => {
    console.log('User left', data);
    socket.leave(data.room);
  });

  // Disconnect event. Not leaving room - see notes.txt for details.
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });

  // PLAY/PAUSE Controls
  socket.on('playPause', (data) => {
    console.log('Received play event from client:', data);

    // Record the current state of the video
    mp.get(data.room).set("playing", data.playing);
    mp.get(data.room).set("seekVal", data.seekVal);
    mp.get(data.room).set("time", Date.now());

    // Broadcast the play/pause event to all users in the room
    socket.to(data.room).emit('playPause', data);
  });

  // SEEK Controls
  socket.on('seekchange', (data) => {
    console.log('Received seek event from client:', data);

    // Record the current state of the video
    mp.get(data.room).set("playing", data.playing);
    mp.get(data.room).set("seekVal", data.seekVal);
    mp.get(data.room).set("time", Date.now());

    // Broadcast the seek event to all users in the room
    socket.to(data.room).emit('seekchange', data);
  });

  // DURATION Controls
  socket.on('duration', (data) => {
    // Recording the duration of the video through this event.
    // Used for helping new users catch up to the current state of the video.
    // See notes.txt

    console.log('Received duration event from client:', data);
    mp.get(data.room).set("duration", data.duration);
  });

});


// Route to create a new watch party. Returns a session id.
app.get('/create/session/:link', (req, res) => {
    link = req.params.link;
    console.log("youtube link is: "+link);
    
    sessionId = uuidv4();
    mp.set(sessionId, new Map());
    mp.get(sessionId).set("link", link);
    
    console.log("link received: "+link+" session_id: "+sessionId);
    res.json({ message: sessionId});
  });


// Route to get the youtube link for a session id. All people for a watch party will have the same session id and join the same link.
app.get('/watch/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  console.log("session id is: "+sessionId);
  if(!mp.has(sessionId)){
    res.json({ code: 404, message: "no such session id"});
    return;
  }
  const link = mp.get(sessionId).get("link");
  
  console.log("link for this session id is: "+link);
  res.json({ code: 200, message: link});
});


// Start the server. Backend server runs at port 5000. 
// Frontend server runs at port 3000.
const port = 5000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
