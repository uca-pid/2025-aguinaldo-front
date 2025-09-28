import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Badge,
  CircularProgress
} from "@mui/material";
import "./DashboardCard.css";

type CardType = 'admin' | 'patient' | 'doctor' | 'dashboard';
type CardVariant = 'primary' | 'secondary' | 'accent' | 'warning';

interface DashboardCardProps {
  type: CardType;
  variant?: CardVariant;
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  warning?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  type,
  variant = 'primary',
  icon,
  title,
  description,
  buttonText,
  onClick,
  disabled = false,
  loading = false,
  badge,
  warning = false
}) => {
  const getClassNames = () => {
    const baseClasses = {
      item: 'dashboard-card-item',
      card: 'dashboard-card',
      content: 'dashboard-card-content',
      avatar: `dashboard-card-avatar ${type}-avatar-${variant}`,
      icon: 'dashboard-card-icon',
      title: 'dashboard-card-title',
      description: 'dashboard-card-description',
      button: `dashboard-card-button ${type}-button-${variant}`
    };
    
    return baseClasses;
  };

  const classes = getClassNames();

  return (
    <div className={classes.item}>
      <Card className={`${classes.card} ${warning ? 'dashboard-card-warning' : ''}`} onClick={!disabled ? onClick : undefined}>
        <CardContent className={classes.content}>
          {warning && <div className="dashboard-card-warning-indicator"></div>}
          <Avatar className={classes.avatar}>
            {icon}
            {badge && badge > 0 && (
              <Badge
                badgeContent={badge}
                color="error"
                className="pending-badge"
              />
            )}
          </Avatar>
          <Typography variant="h5" component="h2" className={classes.title}>
            {title}
          </Typography>
          <Typography variant="body1" className={classes.description}>
            {description}
          </Typography>
          <Button 
            variant="contained" 
            className={classes.button}
            disabled={disabled}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCard;
