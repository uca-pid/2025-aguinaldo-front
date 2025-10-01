import {
  Box,
  Typography,
  Container,
  Avatar,
  Paper
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import "./AdminDashboard.css";

export default function AdminPatients() {
  return (
    <Box className="dashboard-container">
      <Container maxWidth="lg">
        <Box className="dashboard-header-section">
          <Box className="dashboard-header-content">
            <Avatar className="dashboard-header-avatar admin-header-avatar">
              <PersonIcon className="dashboard-header-icon" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="dashboard-header-title">
                Estadísticas de Pacientes
              </Typography>
              <Typography variant="h6" className="dashboard-header-subtitle admin-header-subtitle">
                Análisis detallado del comportamiento y métricas de pacientes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Placeholder */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <Paper 
            sx={{ 
              p: 8, 
              maxWidth: 700,
              textAlign: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 4,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            <PersonIcon 
              sx={{ 
                fontSize: 100, 
                color: '#22577a', 
                mb: 4,
                opacity: 0.5
              }} 
            />
            <Typography variant="h5" gutterBottom sx={{ color: '#0d2230', fontWeight: 600, mb: 4 }}>
              Análisis de Pacientes
            </Typography>
            
            {/* Visual placeholder mockup */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 140px', p: 2, bgcolor: '#f1f5f9', borderRadius: 2, minWidth: '140px' }}>
                <Typography variant="h6" sx={{ color: '#22577a', opacity: 0.7 }}>—</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Registrados</Typography>
              </Box>
              <Box sx={{ flex: '1 1 140px', p: 2, bgcolor: '#f1f5f9', borderRadius: 2, minWidth: '140px' }}>
                <Typography variant="h6" sx={{ color: '#22577a', opacity: 0.7 }}>—</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Activos</Typography>
              </Box>
              <Box sx={{ flex: '1 1 140px', p: 2, bgcolor: '#f1f5f9', borderRadius: 2, minWidth: '140px' }}>
                <Typography variant="h6" sx={{ color: '#22577a', opacity: 0.7 }}>—</Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Turnos Prom.</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                📊 Gráficos · 📈 Actividad · 🏥 Especialidades
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}