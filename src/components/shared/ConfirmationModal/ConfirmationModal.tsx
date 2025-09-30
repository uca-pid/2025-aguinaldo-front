
import { useMachines } from "#/providers/MachineProvider";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from "@mui/material";
import { approveModifyRequest, rejectModifyRequest } from "#/utils/turnModificationsUtils";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";

export default function ConfirmationModal() {
    const { uiState, uiSend } = useMachines();
    const { authState } = useAuthMachine();
    const user: SignInResponse = authState?.context?.authResponse || {};

  return (
    <Dialog open={uiState.context.confirmDialog.open} onClose={() => uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" })}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres {uiState.context.confirmDialog.action === 'approve' ? 'aprobar' : 'rechazar'} esta solicitud de modificación de turno?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" })}>Cancelar</Button>
          <Button onClick={() => {
            if (uiState.context.confirmDialog.action === 'approve' && uiState.context.confirmDialog.requestId) {
              approveModifyRequest(uiState.context.confirmDialog.requestId, user.accessToken!);
            } else if (uiState.context.confirmDialog.action === 'reject' && uiState.context.confirmDialog.requestId) {
              rejectModifyRequest(uiState.context.confirmDialog.requestId, user.accessToken!);
            }
            uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" });
          }} color={uiState.context.confirmDialog.action === 'approve' ? 'success' : 'error'}>
            Confirmar
          </Button>
        </DialogActions>
    </Dialog>
  );
}