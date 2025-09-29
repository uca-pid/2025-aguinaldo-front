import { TurnService } from "../service/turn-service.service";

export const approveModifyRequest = async (
  requestId: string,
  accessToken: string,
  dataSend: (event: any) => void,
  uiSend: (event: any) => void,
  setLoading: (id: string | null) => void
) => {
  if (!accessToken) return;
  setLoading(requestId);
  try {
    await TurnService.approveModifyRequest(requestId, accessToken);
    dataSend({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" });
    uiSend({type: "OPEN_SNACKBAR", message: "Solicitud aprobada correctamente", severity: "success"});
  } catch (error) {
    console.error("Error approving request", error);
    uiSend({type: "OPEN_SNACKBAR", message: "Error al aprobar la solicitud", severity: "error"});
  } finally {
    setLoading(null);
  }
};

export const rejectModifyRequest = async (
  requestId: string,
  accessToken: string,
  dataSend: (event: any) => void,
  uiSend: (event: any) => void,
  setLoading: (id: string | null) => void
) => {
  if (!accessToken) return;
  setLoading(requestId);
  try {
    await TurnService.rejectModifyRequest(requestId, accessToken);
    dataSend({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" });
    uiSend({type: "OPEN_SNACKBAR", message: "Solicitud rechazada correctamente", severity: "success"});
  } catch (error) {
    console.error("Error rejecting request", error);
    uiSend({type: "OPEN_SNACKBAR", message: "Error al rechazar la solicitud", severity: "error"});
  } finally {
    setLoading(null);
  }
};