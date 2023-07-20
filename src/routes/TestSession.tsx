import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect } from 'react'

const backendUrl = 'http://198.199.76.102:5000';

const CreateSession: React.FC = () => {
  const [dataFromBackend, setDataFromBackend] = useState<string>('');
  useEffect(() => {
    fetch(`${backendUrl}/api/data`) // Change the endpoint to match your backend API route
      .then((response) => response.json())
      .then((data) => setDataFromBackend(data.message))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
        <p>Data from Backend: {dataFromBackend}</p>
      
    </Box>
  );
};

export default CreateSession;
