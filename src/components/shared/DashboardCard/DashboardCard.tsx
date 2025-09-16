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

type CardType = 'admin' | 'patient' | 'dashboard';
type CardVariant = 'primary' | 'secondary' | 'accent';

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
  badge
}) => {
  const getClassNames = () => {
    const baseClasses = {
      item: `${type}-action-item`,
      card: `${type}-action-card`,
      content: `${type}-action-content`,
      avatar: `${type}-action-avatar ${type}-action-avatar-${variant}`,
      icon: `${type}-action-icon`,
      title: `${type}-action-title`,
      description: `${type}-action-description`,
      button: `${type}-action-button ${type}-action-button-${variant}`
    };
    
    return baseClasses;
  };

  const classes = getClassNames();

  return (
    <div className={classes.item}>
      <Card className={classes.card} onClick={!disabled ? onClick : undefined}>
        <CardContent className={classes.content}>
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
