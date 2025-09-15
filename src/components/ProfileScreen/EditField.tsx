import { useMachines } from "#/providers/MachineProvider";
import { Box, Divider, IconButton, ListItem, ListItemText, TextField } from "@mui/material"

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

type EditFieldProps={
    label:string;
    value:any;
    isEditing:boolean;
    toggleKey:string
}

const EditField :React.FC<EditFieldProps>= ({label, value,isEditing, toggleKey})=>{
    const {ui}= useMachines()
    const { send: uiSend } = ui;
    return(
        <>
        <ListItem
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {isEditing ? (
            <TextField
              label={label}
              value={value}
              onChange={()=> uiSend({type: "TOGGLE", key: toggleKey })}
              size="small"
              fullWidth
            />
          ) : (
            <ListItemText primary={label} secondary={value} />
          )}

          <Box>
            {isEditing ? (
              <>
                <IconButton onClick={()=>uiSend({type: "TOGGLE", key:toggleKey})}>
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