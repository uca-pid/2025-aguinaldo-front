import React from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Chip
} from "@mui/material";
import dayjs from "dayjs";
import "./DashboardUpcomingCard.css";

type CardType = 'patient' | 'doctor';

interface Turn {
  id: string;
  scheduledAt: string;
  status: string;
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
  reason?: string;
}

interface DashboardUpcomingCardProps {
  type: CardType;
  title: string;
  turns: Turn[];
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
}

const DashboardUpcomingCard: React.FC<DashboardUpcomingCardProps> = ({
  type,
  title,
  turns,
  isLoading = false,
  error,
  emptyMessage = "No hay turnos próximos"
}) => {
  const renderTurnContent = (turn: Turn) => {
    if (type === 'patient') {
      return (
        <>
          <Typography variant="body1" className="upcoming-card-date">
            {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
          </Typography>
          <Typography variant="body2" className="upcoming-card-secondary">
            {turn.doctorName || "Doctor"} - {turn.doctorSpecialty || "Especialidad"}
          </Typography>
        </>
      );
    } else {
      return (
        <>
          <Box className="upcoming-card-header-row">
            <Typography variant="body1" className="upcoming-card-date">
              {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
            </Typography>
            {turn.status === 'CANCELED' && (
              <Chip 
                label="CANCELADO" 
                size="small" 
                className="upcoming-card-canceled-chip"
                sx={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
          <Typography variant="body2" className="upcoming-card-secondary">
            Paciente: {turn.patientName || "Paciente"}
          </Typography>
          {turn.reason && (
            <Typography variant="body2" className="upcoming-card-reason">
              Motivo: {turn.reason}
            </Typography>
          )}
        </>
      );
    }
  };

  return (
    <Box className="dashboard-card-item">
      <Card className={`upcoming-card ${type}-upcoming-card`}>
        <Typography variant="h6" className={`upcoming-card-header ${type}-upcoming-header`}>
          {title}
        </Typography>
        
        <Box className="upcoming-card-content">
          {isLoading ? (
            <Box className="upcoming-card-loading">
              <CircularProgress size={24} />
              {type === 'doctor' && (
                <Typography className="upcoming-card-loading-text">
                  Cargando turnos...
                </Typography>
              )}
            </Box>
          ) : error ? (
            <Typography variant="body2" className="upcoming-card-error">
              Error al cargar turnos: {error}
            </Typography>
          ) : turns.length > 0 ? (
            turns.map((turn, index) => (
              <Box 
                key={turn.id || index} 
                className={`upcoming-card-item ${turn.status === 'CANCELED' ? 'upcoming-card-item-canceled' : ''}`}
              >
                {renderTurnContent(turn)}
              </Box>
            ))
          ) : (
            <Typography variant="body2" className="upcoming-card-empty">
              {emptyMessage}
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default DashboardUpcomingCard;