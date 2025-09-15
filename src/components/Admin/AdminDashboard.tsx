import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Badge,
  Container,
  Avatar,
  Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { styled } from "@mui/material/styles";

const HoverCard = styled(Card)(() => ({
  transition: "all 0.3s ease-in-out",
  height: "100%",
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 4px 15px rgba(34, 87, 122, 0.1)',
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: '0 12px 30px rgba(34, 87, 122, 0.2)',
    borderColor: '#22577a',
  },
}));

const DashboardContainer = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  padding: '32px 16px',
});

const HeaderSection = styled(Box)({
  textAlign: 'center',
  marginBottom: '48px',
});

const StatsCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #22577a 0%, #2d7d90 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 25px rgba(34, 87, 122, 0.3)',
  transition: 'all 0.3s ease-in-out',
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: '0 12px 35px rgba(34, 87, 122, 0.4)',
  },
}));

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, pending: 0 });
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      // These would be actual API calls
      setStats({
        patients: 150,
        doctors: 25,
        pending: 5,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <DashboardContainer>
      <Container maxWidth="lg">
        <HeaderSection>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, width: 56, height: 56, background: 'linear-gradient(135deg, #22577a 0%, #2d7d90 100%)' }}>
              <LocalHospitalIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 700, 
                color: '#1a365d',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Panel de Administración
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 400 }}>
                Gestiona pacientes, doctores y solicitudes pendientes
              </Typography>
            </Box>
          </Box>
        </HeaderSection>

        {/* Stats Section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 6, justifyContent: 'center' }}>
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.patients}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Pacientes Registrados
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.doctors}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Doctores Activos
                    </Typography>
                  </Box>
                  <LocalHospitalIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats.pending}
                      {stats.pending > 0 && (
                        <Badge
                          badgeContent={stats.pending}
                          color="error"
                          sx={{ ml: 2 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Solicitudes Pendientes
                    </Typography>
                  </Box>
                  <PendingActionsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StatsCard>
          </Box>
        </Box>

        {/* Action Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <HoverCard onClick={() => navigate('/admin/patients')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ 
                  mx: 'auto', 
                  mb: 3, 
                  width: 72, 
                  height: 72, 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
                }}>
                  <PersonIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#1a365d' 
                }}>
                  Gestionar Pacientes
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                  Ver lista completa de pacientes registrados y su información
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
                    }
                  }}
                >
                  Ver Pacientes
                </Button>
              </CardContent>
            </HoverCard>
          </Box>

          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <HoverCard onClick={() => navigate('/admin/doctors')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ 
                  mx: 'auto', 
                  mb: 3, 
                  width: 72, 
                  height: 72, 
                  background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' 
                }}>
                  <LocalHospitalIcon sx={{ fontSize: 36 }} />
                </Avatar>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#1a365d' 
                }}>
                  Gestionar Doctores
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                  Administrar doctores activos y sus especialidades
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                    }
                  }}
                >
                  Ver Doctores
                </Button>
              </CardContent>
            </HoverCard>
          </Box>

          <Box sx={{ flex: '1 1 300px', maxWidth: 400 }}>
            <HoverCard onClick={() => navigate('/admin/pending-doctors')}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ 
                  mx: 'auto', 
                  mb: 3, 
                  width: 72, 
                  height: 72, 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  position: 'relative'
                }}>
                  <PendingActionsIcon sx={{ fontSize: 36 }} />
                  {stats.pending > 0 && (
                    <Badge
                      badgeContent={stats.pending}
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                      }}
                    />
                  )}
                </Avatar>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#1a365d' 
                }}>
                  Solicitudes Pendientes
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                  Revisar y aprobar solicitudes de registro de doctores
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    }
                  }}
                >
                  {stats.pending > 0 ? `Revisar (${stats.pending})` : 'Ver Solicitudes'}
                </Button>
              </CardContent>
            </HoverCard>
          </Box>
        </Box>
      </Container>
    </DashboardContainer>
  );
}
