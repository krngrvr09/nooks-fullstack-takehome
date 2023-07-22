import { useEffect, useState } from "react";
import NewVideoPlayer from "../components/NewVideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField, Tooltip } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const backendUrl = 'http://198.199.76.102:5000';


const WatchSession: React.FC = () => {

  // `navigator.clipboard` is only available in secure contexts (HTTPS), so we need to use a workaround for development. See notes.txt.
  const unsecuredCopyToClipboard = (text: any) => { 
    const textArea = document.createElement("textarea");
    textArea.value=text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try{
      document.execCommand('copy')
    }
    catch(err){
      console.error('Unable to copy to clipboard',err)
    }
    document.body.removeChild(textArea)
  };

  const copyToClipboard = (content: any) => {
    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };


  const {sessionId} = useParams();
  console.log('sessionId is '+sessionId)
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);  
  const [linkCopied, setLinkCopied] = useState(false);
  

  useEffect(() => {
    console.log('getting youtube url from session id: '+sessionId);
    const fetchData = async () => {
      const response = await fetch(`${backendUrl}/watch/${sessionId}`);
      const data = await response.json();

      console.log('youtube ID from backend is '+data.message);
      setUrl("https://www.youtube.com/watch?v="+data.message);
    };

    if (sessionId){
        fetchData();
    }
    else{
      //TODO: redirect to home /create page.
    }     
  }, [sessionId]);

  
  if (!!url) {
    return (
      <>
        <Box
          width="100%"
          maxWidth={1000}
          display="flex"
          gap={1}
          marginTop={1}
          alignItems="center"
        >
          <TextField
            label="Youtube URL"
            variant="outlined"
            value={url}
            inputProps={{
              readOnly: true,
              disabled: true,
            }}
            fullWidth
          />
          <Tooltip title={linkCopied ? "Link copied" : "Copy link to share"}>
            <Button
              onClick={() => {
                copyToClipboard(window.location.href);
                // navigator.clipboard.writeText(window.location.href);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              disabled={linkCopied}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <LinkIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Create new watch party">
            <Button
              onClick={() => {
                navigate("/create");
              }}
              variant="contained"
              sx={{ whiteSpace: "nowrap", minWidth: "max-content" }}
            >
              <AddCircleOutlineIcon />
            </Button>
          </Tooltip>
        </Box>
        
        {sessionId !== undefined && url !== undefined ? (
        <NewVideoPlayer url={url} sessionId={sessionId} backendUrl={backendUrl} />
      ) : (
        <p>Loading...</p> // Display a loading message or handle the case when 'sessionId' or 'url' is undefined
      )}
      </>
    );
  }

  return null;
};

export default WatchSession;
