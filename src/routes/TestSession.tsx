import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect } from 'react'
import io from 'socket.io-client';


const backendUrl = 'http://198.199.76.102:5000';

const CreateSession: React.FC = () => {
  console.log('CreateSession');
  // const [dataFromBackend, setDataFromBackend] = useState<string>('');
  // useEffect(() => {
  //   console.log('getting data from backend /api/data');
  //   fetch(`${backendUrl}/api/data`) // Change the endpoint to match your backend API route
  //     .then((response) => response.json())
  //     .then((data) => setDataFromBackend(data.message))
  //     .catch((error) => console.error(error));
  // }, []);

  useEffect(() => {
    console.log("making socket objects and connections");
    // Connect to the Socket.IO backend
    const socket = io(`${backendUrl}/api/data`); // Replace with the backend URL

    // Add event listeners to receive data from the backend
    socket.on('message', (data) => {
      console.log('Message from server:', data);
    });

    document.addEventListener('click', () => {
      console.log("user clicked");
      // Emit the 'userClick' event to the backend
      socket.emit('userClick', { message: 'User clicked on the screen' });
    });

    // Cleanup the socket connection when the component unmounts
    // return () => {
    //   console.log('Cleanup');
    //   socket.disconnect();
    // };
  }, []);


  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
        <p>Data from Backend: </p>
      
    </Box>
  );
};

export default CreateSession;
