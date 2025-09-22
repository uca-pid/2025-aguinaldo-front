import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { Box, Divider, IconButton, ListItem, ListItemText, TextField, CircularProgress } from "@mui/material"

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
    fieldKey: string; // Nueva prop para identificar el campo
    onChange: (val: string) => void 
}

const MotionBox = motion(Box);

const EditField :React.FC<EditFieldProps>= ({label, value, isEditing, toggleKey, fieldKey, onChange})=>{
    const { uiSend } = useMachines();
    const { authState, authSend } = useAuthMachine();
    const authContext = authState?.context;

    const [localValue, setLocalValue] = React.useState(value ?? "");
    const isUpdating = authContext.updatingProfile;

    React.useEffect(() => {
      setLocalValue(value ?? ""); 
    }, [value]);

    const handleSave = () => {
      // Actualizar el valor en el contexto de auth
      onChange(localValue);
      // Llamar a la API para actualizar el perfil
      authSend({ type: "UPDATE_PROFILE" });
      // Cerrar el modo de edición
      uiSend({type: "TOGGLE", key: toggleKey});
    };

    const handleCancel = () => {
      // Revertir al valor original
      setLocalValue(value ?? "");
      authSend({ type: "CANCEL_PROFILE_EDIT", key: fieldKey });
      // Cerrar el modo de edición
      uiSend({type: "TOGGLE", key: toggleKey});
    };
    
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
                <IconButton onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? <CircularProgress size={20} /> : <CheckIcon color="success" />}
                </IconButton>
                <IconButton onClick={handleCancel} disabled={isUpdating}>
                  <CloseIcon color="error" />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => uiSend({type: "TOGGLE", key:toggleKey})} disabled={isUpdating}>
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