import { PendingDoctor } from "#/models/Admin";
import { SignInResponse } from "#/models/Auth";
import { useAuthMachine } from "#/providers/AuthProvider";
import { useMachines } from "#/providers/MachineProvider";
import { Box, Button, Card, CardContent, CircularProgress, Container, Typography } from "@mui/material";
import "../AdminDashboard.css";
import "./PendingScreen.css";


export default function PendingScreen() {
    const { auth } = useAuthMachine();
    const { authResponse } = auth;
    const user = authResponse as SignInResponse;
    const { adminUser, ui } = useMachines();
    const { context: adminContext, send: adminSend, state: adminState } = adminUser;
    const { send: uiSend } = ui;

    const pendingDoctors = adminContext.pendingDoctors || [];

    return (
    <Box className="admin-dashboard-container">
      <Container maxWidth="lg">
        <Box className="admin-header-section">
          <Box className="admin-header-content">
            <Box>
              <Button
                variant="text"
                className="pending-back-button"
                onClick={() => {
                  uiSend({ type: 'NAVIGATE', to: '/' });
                }}
              >
                ←
              </Button>
            </Box>
            <Box>
              <Typography variant="h3" component="h1" className="admin-header-title">
                Solicitudes de Médicos Pendientes
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
            {/* Pending Doctors List */}
            {pendingDoctors.length > 0 ? (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom className="pending-section-title">
                Médicos Pendientes de Aprobación
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingDoctors.map((doctor: PendingDoctor) => (
                    <Card key={doctor.id} className="pending-doctor-card">
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom className="pending-doctor-name">
                            Dr. {doctor.name} {doctor.surname}
                            </Typography>
                            <Typography variant="body2" className="pending-doctor-info" gutterBottom>
                            <strong>Email:</strong> {doctor.email}
                            </Typography>
                            <Typography variant="body2" className="pending-doctor-info" gutterBottom>
                            <strong>Especialidad:</strong> {doctor.specialty}
                            </Typography>
                            <Typography variant="body2" className="pending-doctor-info" gutterBottom>
                            <strong>Fecha de registro:</strong> {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('es-AR') : 'N/A'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button
                            variant="contained"
                            className="pending-approve-button"
                            onClick={() => adminSend({ 
                                type: 'APPROVE_DOCTOR', 
                                doctorId: doctor.id,
                                accessToken: user?.accessToken
                            })}
                            disabled={adminState.matches('approvingDoctor')}
                            startIcon={adminState.matches('approvingDoctor') ? <CircularProgress size={16} /> : null}
                            >
                            {adminState.matches('approvingDoctor') ? 'Aprobando...' : 'Aprobar'}
                            </Button>
                            <Button
                            variant="contained"
                            className="pending-reject-button"
                            onClick={() => adminSend({ 
                                type: 'REJECT_DOCTOR', 
                                doctorId: doctor.id,
                                accessToken: user?.accessToken
                            })}
                            disabled={adminState.matches('rejectingDoctor')}
                            startIcon={adminState.matches('rejectingDoctor') ? <CircularProgress size={16} /> : null}
                            >
                            {adminState.matches('rejectingDoctor') ? 'Rechazando...' : 'Rechazar'}
                            </Button>
                        </Box>
                        </Box>
                    </CardContent>
                    </Card>
                    ))}
                    </Box>
                </Box>
                ) : (
                <Box className="pending-empty-state" sx={{ mt: 4 }}>
                    <Box className="pending-empty-emoji">📋</Box>
                    <Typography variant="h5" className="pending-empty-title" gutterBottom>
                        No hay solicitudes pendientes
                    </Typography>
                    <Typography variant="body1" className="pending-empty-subtitle">
                        Todas las solicitudes de médicos han sido procesadas
                    </Typography>
                </Box>
                )}
            </Box>
        </Container>
    </Box>
    
    );
}