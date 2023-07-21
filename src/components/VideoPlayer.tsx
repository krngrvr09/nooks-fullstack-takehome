import { Box, Button } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import {io, Socket} from 'socket.io-client';

interface VideoPlayerProps {
  url: string;
  hideControls?: boolean;
  socket: Socket;
  sessionId: string;

}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, hideControls, socket, sessionId }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const player = useRef<ReactPlayer>(null);

  socket.on('videoPlay', (data) => {
    console.log('videoPlay from server:', data);
    // player.current?.seekTo(data.time, 'seconds');
    player.current?.seekTo(data.time, 'seconds');
    // player.current?.play();
    
  });
  

  const handleReady = () => {
    console.log("Video ready");
    setIsReady(true);
    socket.emit('videoReady', { room: sessionId });
  };

  const handleEnd = () => {
    console.log("Video ended");
    socket.emit('videoEnd', { room: sessionId });
  };

  const handleSeek = (seconds: number) => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?

    console.log(
      "This never prints because seek decetion doesn't work: ",
      seconds
    );
  };

  const handlePlay = () => {
    console.log(
      "User played video at time: ",
      player.current?.getCurrentTime()
    );
    socket.emit('videoPlay', { room: sessionId });

  };

  const handlePause = () => {
    console.log(
      "User paused video at time: ",
      player.current?.getCurrentTime()
    );
    socket.emit('videoPause', { room: sessionId });
  };

  const handleBuffer = () => {
    console.log("Video buffered");
    socket.emit('videoBufferStart', { room: sessionId });
  };

  const handleBufferEnd = () => {
    console.log("Video buffered");
    socket.emit('videoBufferEnd', { room: sessionId });
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    console.log("Video progress: ", state);
    socket.emit('videoProgress', { room: sessionId });
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="100%"
        display={hasJoined ? "flex" : "none"}
        flexDirection="column"
      >
        <ReactPlayer
          ref={player}
          url={url}
          playing={hasJoined}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onSeek={handleSeek}
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />
      </Box>
      {!hasJoined && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => setHasJoined(true)}
        >
          Watch Session
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
