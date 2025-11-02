import {
  Box,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import './SpecialtyDistribution.css';

export interface SpecialtyData {
  specialty: string;
  count: number;
  percentage: number;
}

interface SpecialtyDistributionProps {
  specialties: SpecialtyData[];
  totalDoctors: number;
  loading: boolean;
  title?: string;
  subtitle?: string;
}

export default function SpecialtyDistribution({ 
  specialties, 
  loading,
  title = "Distribución por Especialidades",
  subtitle = "Cantidad de doctores por especialidad médica"
}: SpecialtyDistributionProps) {

  if (loading) {
    return (
      <Box className="specialty-distribution-loading">
        <Typography variant="body2" className="loading-text">
          Cargando datos de especialidades...
        </Typography>
      </Box>
    );
  }

  if (specialties.length === 0) {
    return (
      <Box className="specialty-distribution-empty">
        <MedicalServicesIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
        <Typography variant="h6" className="empty-title">
          No hay especialidades disponibles
        </Typography>
        <Typography variant="body2" className="empty-subtitle">
          No se encontraron doctores registrados en el sistema
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="specialty-distribution-section">
      <Box className="specialty-distribution-header">
        <Box>
          <Typography variant="h6" className="specialty-distribution-title">
            <MedicalServicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {title}
          </Typography>
          <Typography variant="body2" className="specialty-distribution-subtitle">
            {subtitle}
          </Typography>
        </Box>
        {specialties.length > 0 && (
          <Chip 
            label={`${specialties.length} especialidades`}
            size="small"
            variant="outlined"
            className="specialty-count-chip"
          />
        )}
      </Box>

      <Box className="specialty-grid">
        {specialties.map((item, index) => (
          <Box key={index} className="specialty-card">
            <Box className="specialty-card-header">
              <Chip 
                label={item.specialty}
                className="specialty-chip"
              />
              <Box className="doctor-count-container">
                <Typography variant="h6" className="doctor-count-number">
                  {item.count}
                </Typography>
                <Typography variant="caption" className="doctor-count-label">
                  {item.count === 1 ? 'doctor' : 'doctores'}
                </Typography>
              </Box>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={item.percentage}
              className="specialty-progress"
            />
            
            <Box className="specialty-footer">
              <Typography variant="body2" className="specialty-footer-text">
                {item.count === 0 ? "Sin doctores" : "Del total"}
              </Typography>
              <Box className="percentage-badge">
                {Math.round(item.percentage)}%
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
