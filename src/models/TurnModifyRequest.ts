export interface TurnModifyRequest {
  id: string;
  turnId: string;
  patientId: string;
  doctorId: string;
  currentScheduledAt: string;
  requestedScheduledAt: string;
  status: string;
}
