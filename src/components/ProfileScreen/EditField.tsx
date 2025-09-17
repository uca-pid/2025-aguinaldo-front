import { useMachines } from "#/providers/MachineProvider";
import { Box, Divider, IconButton, ListItem, ListItemText, TextField } from "@mui/material"

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type EditFieldProps={
    label:string;
    value:any;
    isEditing:boolean;
    toggleKey:string;
    onChange: (val: string) => void 
}

const MotionBox = motion(Box);

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
        <AnimatePresence mode="wait" initial={false}>
          {isEditing ? (
            <MotionBox key="edit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              sx={{ flex: 1, mr: 1 }}>
                <TextField
                  label={label}
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  size="small"
                  fullWidth
                />
              </MotionBox>
              ) : (
                <MotionBox
                  key="view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  sx={{ flex: 1, mr: 1 }}
                >
                  <ListItemText primary={label} secondary={value} />
                </MotionBox>
              )}
        </AnimatePresence>
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