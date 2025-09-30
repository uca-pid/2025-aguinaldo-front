import { TurnService } from "../service/turn-service.service";
import { orchestrator } from '#/core/Orchestrator';

export const approveModifyRequest = async (
  requestId: string,
  accessToken: string
) => {
  if (!accessToken) return;
  orchestrator.send({ type: "TOGGLE", key: "loadingApprove" });
  try {
    await TurnService.approveModifyRequest(requestId, accessToken);
    orchestrator.send({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" });
    orchestrator.send({type: "OPEN_SNACKBAR", message: "Solicitud aprobada correctamente", severity: "success"});
  } catch (error) {
    orchestrator.send({type: "OPEN_SNACKBAR", message: "Error al aprobar la solicitud", severity: "error"});
  } finally {
    orchestrator.send({ type: "TOGGLE", key: "loadingApprove" });
  }
};

export const rejectModifyRequest = async (
  requestId: string,
  accessToken: string
) => {
  if (!accessToken) return;
  orchestrator.send({ type: "TOGGLE", key: "loadingReject" });
  try {
    await TurnService.rejectModifyRequest(requestId, accessToken);
    orchestrator.send({ type: "LOAD_DOCTOR_MODIFY_REQUESTS" });
    orchestrator.send({type: "OPEN_SNACKBAR", message: "Solicitud rechazada correctamente", severity: "success"});
  } catch (error) {
    orchestrator.send({type: "OPEN_SNACKBAR", message: "Error al rechazar la solicitud", severity: "error"});
  } finally {
    orchestrator.send({ type: "TOGGLE", key: "loadingReject" });
  }
};