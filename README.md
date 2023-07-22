## Running Instructions
- Make sure to change the `backendUrl` in `<root>/src/utils.js`
- Run the backend server using `node app.js` in `<root>/src/backend`
- Run the frontend server using `npm start` in `<root>/`


## Nooks Watch Party Project
Your task is to build a collaborative “Watch Party” app that lets a distributed group of users watch youtube videos together. The frontend should be written in Typescript (we have a skeleton for you set up) and the backend should be written in Node.JS. The app should support two main pages:

- `/create` **Create a new session**
    - by giving it a name and a youtube video link. After creating a session `ABC`, you should be automatically redirected to the page `/watch` page for that session
- `/watch/:sessionId` **Join an existing session**
    
    *⚠️ The player must be **synced for all users at all times** no matter when they join the party*
    
    - **Playing/pausing/seek** the video. When someone plays/pauses the video or jumps to a certain time in the video, this should update for everyone in the session
    - **Late to the party**... Everything should stay synced if a user joins the session late (e.g. if the video was already playing, the new user should see it playing at the correct time)
        
### Notes
- I am using the concept of `rooms` in the socket.io library, to group users watching the same video. The socket.io library takes care of mapping socket connections to rooms. The room name is the `sessionId`, which is a UUID created through the `/create` endpoint and is sent with every `/watch/:sessionId` endpoint.
- Right now the rest of the state is being stored in a hashmap. If I had more time, I'd have liked to use an in-memory database like Redis. This way, I could have scaled out the servers and the state would have been shared across all the instances of the server. However, that will come with it's own challenges of tracking the mapping of sockets to server instances, etc.
- I have implemented my own controls because the iframe API wasn't giving me .play() and .pause() controls. The code for implementing custom controls has been taken from the official react-player github repository. [Source](https://github.com/cookpete/react-player/tree/master)
- To allow new joinees to see the updated video state, I had to choose between two design decisions.
    1. Keep broadcasting the current play time to the room, as the video is playing. As soon as the new person will join the room, they will also receive the current play time and will be able to catch up.
    2. Keep track of when the video was last started or stopped and what was the status of the seek bar(called `seekVal`). Eg. If the video is paused, we will track that the status is paused and the seek bar is at, say, 5% => seekVal = 0.05. If the video is played, we will track the same information. This way, when the new person joins, they will first check the the last play status. If the last recorded status is pause, then the video is seeked till `seekVal`. If the last recorded status is play, then I try to predict where the video will be right now. I do this by calculating the time elapsed and divide it by the total length of the video to find out how much you should add to `seekVal`. The idea is that `seekVal` will increase proportionally to the time elapsed since last state record. This approach is better because we send very minimal data.
- Because of this, the people who are late to the party will be out of sync by atleast 2 RTTs. However, we will see below that I have made design choices to help them converge eventually.
- I send `seekVal` with every play and pause message. This way, members who might have gotten out of sync, have a chance to resync. They might see the video jump a little bit, but they will be in sync. This is okay because users rarely ever press pause/play without informing the group. hence, any jumps will be not be unexpected.
- To copy the link to clipboard, I have used a workaround from stackoverflow. This is because the recommended way of copying things requires HTTPS. I check if secure context is valid, if so use `navigator.clipboard`, otherwise a hacky workaround using `document.execCommand`. [Source](https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext)
- For seeking, I only update the video when the user releases the seek slider. If I had more time, I would have experimented with updating the video as the user drags the slider. This would have given a more responsive feel to the user.
- One big issue with the app is that for automatic pause and play, the video has to be on mute. This is because of the autoplay policy in many browsers - [Source](https://developer.chrome.com/blog/autoplay/). If I had more time, I would have checked if it can be bypassed when everything runs on localhost.
- The app will not perform well, when the group members have a significant difference in bandwidth. This is because we have separate events for buffering and playing. It's possible that one person sends a play event and the whole group starts watching a video except one person, for whom it's still buffering. When the video starts playing for the slow person, it will send another play message and others' videos would be disrupted. One way to solve this would be to not allow a client to skip back in time, but it's not the best solution. Other possible solutions could be adaptive bitrate streaming - showing lower quality video to slower nodes, showing network strength for all users to each other to prevent surprises or pause until everyone has buffered and is ready to play.
- Finally, I am showing some debugging information on the `/watch` page for you to verify that the videos are running in sync. They can be easily removed, but I am choosing to leave them for your convenience.

<img width="1180" alt="Screen Shot 2023-07-22 at 5 02 17 AM" src="https://github.com/krngrvr09/nooks-fullstack-takehome/assets/5905966/26a4b5e6-a0f6-47a6-8858-35c4e84eed06">

### Completed Features

- [x] **Creating a session**. Any user should be able to create a session to watch a given Youtube video.
- [x] **Joining a session**. Any user should be able to join a session created by another user using the shareable session link.
- [x] **Playing/pausing** the video. When a participant pauses the video, it should pause for everyone. When a participant plays the video, it should start playing for everyone.
- [x] **“Seek”**. When someone jumps to a certain time in the video it should jump to that time for everyone.
- [x] **Late to the party**... Everything should stay synced even if a user joins the watch party late (e.g. the video is already playing)
- [x] **Player controls.** All the player controls (e.g. play, pause, and seek) should be intuitive and behave as expected. For play, pause & seek operations you can use the built-in YouTube controls or disable the YouTube controls and build your own UI (including a slider for the seek operation)
