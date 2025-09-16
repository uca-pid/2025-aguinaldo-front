import { useMachines } from "#/providers/MachineProvider";
import { Box, Divider, IconButton, ListItem, ListItemText, TextField } from "@mui/material"

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import React from "react";

type EditFieldProps={
    label:string;
    value:any;
    isEditing:boolean;
    toggleKey:string;
    onChange: (val: string) => void 
}

const EditField :React.FC<EditFieldProps>= ({label, value,isEditing, toggleKey, onChange})=>{
    const {ui}= useMachines()
    const { send: uiSend } = ui;

    const [localValue, setLocalValue] = React.useState(value ?? "");

    React.useEffect(() => {
      setLocalValue(value ?? ""); 
    }, [value]);
    
    return(
        <>
        <ListItem
          sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
        >
          {isEditing ? (
            <TextField
              label={label}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              size="small"
              fullWidth
            />
          ) : (
            <ListItemText primary={label} secondary={value} />
          )}

          <Box>
            {isEditing ? (
              <>
                <IconButton onClick={()=>uiSend({type: "TOGGLE", key: toggleKey})}>
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton onClick={()=>uiSend({type: "TOGGLE", key: toggleKey})}>
                  <CloseIcon color="error" />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => uiSend({type: "TOGGLE", key:toggleKey})}>
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </ListItem>
        <Divider component="li" />
        </>
    )
 }
 export default EditField;