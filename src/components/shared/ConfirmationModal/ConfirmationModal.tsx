
import { useMachines } from "#/providers/MachineProvider";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from "@mui/material";
import { approveModifyRequest, rejectModifyRequest } from "#/utils/turnModificationsUtils";
import { useAuthMachine } from "#/providers/AuthProvider";
import { SignInResponse } from "#/models/Auth";

export default function ConfirmationModal() {
    const { uiState, uiSend, turnSend } = useMachines();
    const { authState } = useAuthMachine();
    const user: SignInResponse = authState?.context?.authResponse || {};

    const getDialogContent = () => {
        const action = uiState.context.confirmDialog.action;
        
        if (action === 'cancel_turn') {
            return '¿Estás seguro de que quieres cancelar este turno? Esta acción no se puede deshacer.';
        } else if (action === 'approve') {
            return '¿Estás seguro de que quieres aprobar esta solicitud de modificación de turno?';
        } else if (action === 'reject') {
            return '¿Estás seguro de que quieres rechazar esta solicitud de modificación de turno?';
        }
        return '';
    };

    const getConfirmButtonText = () => {
        const action = uiState.context.confirmDialog.action;
        
        if (action === 'cancel_turn') {
            return 'Cancelar Turno';
        } else if (action === 'approve') {
            return 'Confirmar';
        } else if (action === 'reject') {
            return 'Confirmar';
        }
        return 'Confirmar';
    };

    const getConfirmButtonColor = () => {
        const action = uiState.context.confirmDialog.action;
        
        if (action === 'cancel_turn') {
            return 'error';
        } else if (action === 'approve') {
            return 'success';
        } else if (action === 'reject') {
            return 'error';
        }
        return 'primary';
    };

    const handleConfirm = () => {
        const action = uiState.context.confirmDialog.action;
        
        if (action === 'cancel_turn' && uiState.context.confirmDialog.turnId) {
            turnSend({ 
                type: "CANCEL_TURN", 
                turnId: uiState.context.confirmDialog.turnId 
            });
        } else if (action === 'approve' && uiState.context.confirmDialog.requestId) {
            approveModifyRequest(uiState.context.confirmDialog.requestId, user.accessToken!);
        } else if (action === 'reject' && uiState.context.confirmDialog.requestId) {
            rejectModifyRequest(uiState.context.confirmDialog.requestId, user.accessToken!);
        }
        
        uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" });
    };

  return (
    <Dialog open={uiState.context.confirmDialog.open} onClose={() => uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" })}>
        <DialogTitle>Confirmar Acción</DialogTitle>
        <DialogContent>
          <Typography>
            {getDialogContent()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => uiSend({ type: "CLOSE_CONFIRMATION_DIALOG" })}>Cancelar</Button>
          <Button 
            onClick={handleConfirm}
            color={getConfirmButtonColor() as any}
          >
            {getConfirmButtonText()}
          </Button>
        </DialogActions>
    </Dialog>
  );
}