import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect } from 'react'

const backendUrl = 'http://198.199.76.102:5000';


const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState("");
  //TODO: instead of any, make a type for the response.
  const [dataFromBackend, setDataFromBackend] = useState<any>('');
  
  const createSession = async () => {
    console.log("url is "+newUrl);
    
    // useEffect(() => {
    console.log('getting data from backend /api/data');
    fetch(`${backendUrl}/create/session/${newUrl}`) // Change the endpoint to match your backend API route
    .then((response) => response.json())
    .then((data) => setDataFromBackend(data))
    .catch((error) => console.error(error));
    // }, []);
    
    console.log('data from backend is '+dataFromBackend.message);
    // setNewUrl("");
    // const sessionId = uuidv4();
    // navigate(`/watch/${dataFromBackend.message}`);
  };

  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
      <TextField
        label="Youtube URL"
        variant="outlined"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        fullWidth
      />
      <Button
        disabled={!newUrl}
        onClick={createSession}
        size="small"
        variant="contained"
      >
        Create a session
      </Button>
    </Box>
  );
};

export default CreateSession;
