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
      const videoId = newUrl.split("v=")[1];
      
        console.log('getting data from backend /api/data');
        const response = await fetch(`${backendUrl}/create/session/${videoId}`);
        const data = await response.json();

        console.log('sessionId from backend is '+data.message);
        navigate(`/watch/${data.message}`);
      
      // setNewUrl("");
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
