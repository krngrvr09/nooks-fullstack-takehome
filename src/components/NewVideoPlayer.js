import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import { hot } from 'react-hot-loader'
import screenfull from 'screenfull'

// import './reset.css'
// import './defaults.css'
// import './range.css'
// import './App.css'

// import { version } from '../../package.json'
import ReactPlayer from "react-player";
import Duration from './Duration'

class NewVideoPlayer extends Component {


    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.sessionId = this.props.sessionId;
        this.url = this.props.url;
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
        this.setState({ url: this.url });
        
        this.socket.on('playPause', (data) => {
            console.log('Received play event from client:', data);
            this.setState({ playing: data.playing}, () => {
                this.player.seekTo(parseFloat(data.seekVal));
                console.log("new playing state is: "+data.playing)
                console.log("seeked to: "+data.seekVal);
            });
        });

        this.socket.on('seekchange', (data) => {
            console.log('Received seek event from server:', data);
            this.player.seekTo(parseFloat(data.seekVal));
        });

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
    console.log(this.state)
    console.log("current playing state is: "+this.state.playing);
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
  handleSeekMouseUp = e => {
    this.setState({ seeking: false })
    this.player.seekTo(parseFloat(e.target.value))
    console.log("seeked to: "+this.state.played)
    this.socket.emit('seekchange', {playing: this.state.playing,seekVal: this.state.played, room: this.sessionId});
  }

  // ----------------------------------------------------------------------

  handleStop = () => {
    console.log('handleStop')
    this.setState({ url: null, playing: false })
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
    console.log('onPlay')
    // this.setState({ playing: true })
  }


  handlePause = () => {
    console.log('onPause')
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
          <h1>ReactPlayer Demo</h1>
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
                  <button onClick={this.handleStop}>Stop</button>
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
          <table>
            <tbody>
              <tr>
                <th>YouTube</th>
                <td>
                  {this.renderLoadButton('https://www.youtube.com/watch?v=oUFJJNQGwhk', 'Test A')}
                  {this.renderLoadButton('https://www.youtube.com/watch?v=jNgP6d9HraI', 'Test B')}
                  {this.renderLoadButton('https://www.youtube.com/playlist?list=PLogRWNZ498ETeQNYrOlqikEML3bKJcdcx', 'Playlist')}
                </td>
              </tr>
              <tr>
                <th>Custom URL</th>
                <td>
                  <input ref={input => { this.urlInput = input }} type='text' placeholder='Enter URL' />
                  <button onClick={() => this.setState({ url: this.urlInput.value })}>Load</button>
                </td>
              </tr>
              
            </tbody>
          </table>

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
        <footer className='footer'>
          {/* Version <strong>{version}</strong> */}
          {SEPARATOR}
          <a href='https://github.com/CookPete/react-player'>GitHub</a>
          {SEPARATOR}
          <a href='https://www.npmjs.com/package/react-player'>npm</a>
        </footer>
      </div>
    )
  }
}

export default hot(module)(NewVideoPlayer)
