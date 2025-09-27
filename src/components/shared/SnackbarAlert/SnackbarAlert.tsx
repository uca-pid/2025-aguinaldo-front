import { Snackbar, Alert } from "@mui/material";
import { useMachines } from "../../../providers/MachineProvider";

function SnackbarAlert() {
  const { uiState, uiSend } = useMachines();
  const { snackbar } = uiState.context;

  const handleClose = () => {
    uiSend({ type: "CLOSE_SNACKBAR" });
  };

  return (
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}

export default SnackbarAlert;