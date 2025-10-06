import { useMachines } from "#/providers/MachineProvider";
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
    onChange: (val: string) => void;
    maxLength?: number; // Límite de caracteres
}

const MotionBox = motion.create(Box);

const EditField :React.FC<EditFieldProps>= ({label, value, isEditing, toggleKey, fieldKey, onChange, maxLength})=>{
    const { uiSend, profileState, profileSend } = useMachines();
    const profileContext = profileState?.context;

    // Use machine's formValues instead of local state
    const currentValue = isEditing ? (profileContext?.formValues?.[fieldKey as keyof typeof profileContext.formValues] ?? value) : value;
    const isUpdating = profileContext?.updatingProfile;

    const handleChange = (newValue: string) => {
      // Apply maxLength validation if provided
      if (maxLength && newValue.length > maxLength) {
        return; // Don't update if exceeds limit
      }
      onChange(newValue);
    };

    const handleSave = () => {
      // The value is already in machine's formValues from onChange calls
      // Just call UPDATE_PROFILE to save
      profileSend({ type: "UPDATE_PROFILE" });
      // Cerrar el modo de edición
      uiSend({type: "TOGGLE", key: toggleKey});
    };

    const handleCancel = () => {
      // Revertir al valor original en la máquina
      profileSend({ type: "CANCEL_PROFILE_EDIT", key: fieldKey });
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
                  value={currentValue}
                  onChange={(e) => handleChange(e.target.value)}
                  size="small"
                  fullWidth
                  helperText={maxLength ? `${currentValue?.length || 0}/${maxLength} caracteres` : undefined}
                  error={maxLength ? (currentValue?.length || 0) > maxLength : false}
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