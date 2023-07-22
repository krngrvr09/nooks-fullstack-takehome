import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { hot } from 'react-hot-loader'
import screenfull from 'screenfull'
import {io, Socket} from 'socket.io-client';
import ReactPlayer from "react-player";
import Duration from './Duration'
import './App.css'

class NewVideoPlayer extends Component {

  constructor(props) {
      super(props);
      this.sessionId = this.props.sessionId;
      this.url = this.props.url;
      this.backendUrl = this.props.backendUrl;
  }

  state = {
      url: null,
      pip: false,
      playing: false,
      controls: false,
      light: false,
      volume: 0.8,
      muted: true,
      played: 0,
      loaded: 0,
      duration: 0,
      playbackRate: 1.0,
      loop: false
    }    

  componentDidMount() {
    // Initialize socket for communication
    this.socket = io(this.backendUrl);
    
    // When the socket connects with backend, emit a join event to join the room
    this.socket.on('connect', () => {
      console.log('I just connected to the socket.io server');
      this.socket.emit('join', { room: this.sessionId });
    });
    
    // // When the socket disconnects from backend, emit a leave event to leave the room
    // this.socket.on('disconnect', () => {
    //   console.log('I disconnected from the socket.io server');
    //   this.socket.emit('leave', { room: this.sessionId });
    // });
    
    // Assign url to the react player.
    this.setState({ url: this.url });
    
    // If you get a playPause event from the server, update the state of the player.
    this.socket.on('playPause', (data) => {
        console.log('Received play event from client:', data);
        this.setState({ playing: data.playing}, () => {
            this.player.seekTo(parseFloat(data.seekVal));
            console.log("new playing state is: "+data.playing)
            console.log("seeked to: "+data.seekVal);
        });
    });
    
    // If you get a seekchange event from the server, update the state of the player.
    this.socket.on('seekchange', (data) => {
        console.log('Received seek event from server:', data);
        this.player.seekTo(parseFloat(data.seekVal));
    });

  }

  // When the component unmounts, emit a leave event to leave the room
  componentWillUnmount() {
    this.socket.emit('leave', { room: this.sessionId });
  }

  load = url => {
    this.setState({
      url,
      played: 0,
      loaded: 0,
      pip: false
    })
  }


  // PLAY/PAUSE Controls
  handlePlayPause = () => {
    console.log('handlePlayPause')
    console.log("current playing state is: "+this.state.playing);
    
    // If the user plays/pauses the video, update the state of the player and emit the playPause event to the server.
    this.setState({ playing: !this.state.playing, muted: false}, () => {
        console.log("new playing state is: "+this.state.playing)
        this.socket.emit('playPause', {playing: this.state.playing, room: this.sessionId, seekVal: this.state.played});
        console.log(this.state)
    });
  }


  // MUTE Controls
  handleToggleMuted = () => {
    console.log('handleToggleMuted')
    this.setState({ muted: !this.state.muted })
  }


  // SEEK Controls
  handleSeekMouseDown = e => {
    this.setState({ seeking: true })
  }


  // SEEK Controls
  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })
  }


  // SEEK Controls
  // We only need to update the video when the user releases the seek slider.
  handleSeekMouseUp = e => {
    this.setState({ seeking: false })
    this.player.seekTo(parseFloat(e.target.value))
    console.log("seeked to: "+this.state.played)
    this.socket.emit('seekchange', {playing: this.state.playing,seekVal: this.state.played, room: this.sessionId});
  }

  
  handleStop = () => {
    console.log('handleStop')
    this.setState({ playing: false })
  }


  handleToggleControls = () => {
    console.log('handleToggleControls')
    const url = this.state.url
    this.setState({
      controls: !this.state.controls,
      url: null
    }, () => this.load(url))
  }


  handlePlay = () => {
    if (this.state.playing === false) {
      console.log('onPlay')
      this.setState({ playing: true, muted: false}, () => {
        console.log("new playing state is: "+this.state.playing)
        this.socket.emit('playPause', {playing: this.state.playing, room: this.sessionId, seekVal: this.state.played});
        console.log(this.state)
      });
    }
    // this.setState({ playing: true })
  }


  handlePause = () => {
    if (this.state.playing === true) {
      console.log('onPause')
      this.setState({ playing: false, muted: false}, () => {
        console.log("new playing state is: "+this.state.playing)
        this.socket.emit('playPause', {playing: this.state.playing, room: this.sessionId, seekVal: this.state.played});
        console.log(this.state)
      });
  }
    // this.setState({ playing: false })
  }


  handleProgress = state => {
    console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    console.log('onEnded')
    this.setState({ playing: this.state.loop })
  }


  // Send the duration to server as soon as it is available. This information allows new users to catch up to the current state of the video. See notes.txt.
  handleDuration = (duration) => {
    console.log('onDuration', duration)
    this.setState({ duration }, () => {
        console.log("sending duration to server: "+this.state.duration);
        this.socket.emit('duration', {duration: this.state.duration, room: this.sessionId});
    });
  }


  handleClickFullscreen = () => {
    screenfull.request(findDOMNode(this.player))
  }

  renderLoadButton = (url, label) => {
    return (
      <button onClick={() => this.load(url)}>
        {label}
      </button>
    )
  }

  ref = player => {
    this.player = player
  }

  render () {
    const { url, playing, controls, light, volume, muted, loop, played, loaded, duration, playbackRate, pip } = this.state
    const SEPARATOR = ' · '

    return (
      <div className='app'>
        <section className='section'>
          <div className='player-wrapper'>
            <ReactPlayer
              ref={this.ref}
              className='react-player'
              width='100%'
              height='100%'
              url={url}
              //pip={pip}
              playing={playing}
              controls={controls}
              //light={light}
              //loop={loop}
              //playbackRate={playbackRate}
              //volume={volume}
              muted={muted}
              onReady={() => {console.log('onReady');console.log(this.state)}}
              onStart={() => console.log('onStart')}
              onPlay={this.handlePlay}
              //onEnablePIP={this.handleEnablePIP}
              //onDisablePIP={this.handleDisablePIP}
              onPause={this.handlePause}
              onBuffer={() => console.log('onBuffer')}
              //onPlaybackRateChange={this.handleOnPlaybackRateChange}
              onSeek={e => console.log('onSeek', e)}
              onEnded={this.handleEnded}
              onError={e => console.log('onError', e)}
              onProgress={this.handleProgress}
              onDuration={this.handleDuration}
            //   onPlaybackQualityChange={e => console.log('onPlaybackQualityChange', e)}
            />
          </div>

          <table>
            <tbody>
              <tr>
                <th>Controls</th>
                <td>
                  <button onClick={this.handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
                  <button onClick={this.handleClickFullscreen}>Fullscreen</button>
                  {light &&
                    <button onClick={() => this.player.showPreview()}>Show preview</button>}
                  {ReactPlayer.canEnablePIP(url) &&
                    <button onClick={this.handleTogglePIP}>{pip ? 'Disable PiP' : 'Enable PiP'}</button>}
                </td>
              </tr>
              <tr>
                <th>Seek</th>
                <td>
                  <input
                    type='range' min={0} max={0.999999} step='any'
                    value={played}
                    onMouseDown={this.handleSeekMouseDown}
                    onChange={this.handleSeekChange}
                    onMouseUp={this.handleSeekMouseUp}
                  />
                </td>
              </tr>
              <tr>
                <th>Played</th>
                <td><progress max={1} value={played} /></td>
              </tr>
              <tr>
                <th>Loaded</th>
                <td><progress max={1} value={loaded} /></td>
              </tr>
              <tr>
                <th>
                  <label htmlFor='muted'>Muted</label>
                </th>
                <td>
                  <input id='muted' type='checkbox' checked={muted} onChange={this.handleToggleMuted} />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className='section'>
          

          <h2>State</h2>

          <table>
            <tbody>
              <tr>
                <th>url</th>
                <td className={!url ? 'faded' : ''}>
                  {(url instanceof Array ? 'Multiple' : url) || 'null'}
                </td>
              </tr>
              <tr>
                <th>playing</th>
                <td>{playing ? 'true' : 'false'}</td>
              </tr>
              <tr>
                <th>volume</th>
                <td>{volume.toFixed(3)}</td>
              </tr>
              <tr>
                <th>speed</th>
                <td>{playbackRate}</td>
              </tr>
              <tr>
                <th>played</th>
                <td>{played.toFixed(3)}</td>
              </tr>
              <tr>
                <th>loaded</th>
                <td>{loaded.toFixed(3)}</td>
              </tr>
              <tr>
                <th>duration</th>
                <td><Duration seconds={duration} /></td>
              </tr>
              <tr>
                <th>elapsed</th>
                <td><Duration seconds={duration * played} /></td>
              </tr>
              <tr>
                <th>remaining</th>
                <td><Duration seconds={duration * (1 - played)} /></td>
              </tr>
            </tbody>
          </table>
        </section>
        
      </div>
    )
  }
}

export default hot(module)(NewVideoPlayer)
