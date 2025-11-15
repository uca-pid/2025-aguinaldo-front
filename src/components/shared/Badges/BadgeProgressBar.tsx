import React from 'react';
import { LinearProgress, Tooltip, Box, Typography } from '@mui/material';
import type { BadgeProgress } from '#/models/Badge';
import './BadgeStyles.css';
import './BadgeProgressBar.css';

interface BadgeProgressBarProps {
  progress: BadgeProgress;
  showLabel?: boolean;
  variant?: 'default' | 'compact';
}

const BadgeProgressBar: React.FC<BadgeProgressBarProps> = ({
  progress,
  showLabel = true,
  variant = 'default'
}) => {
  const rawValue = typeof progress.progressPercentage === 'number' && isFinite(progress.progressPercentage)
    ? progress.progressPercentage
    : 0;
  const progressValue = Math.min(100, Math.max(0, rawValue));
  const isHighProgress = progressValue >= 75;

  if (variant === 'compact') {
    return (
      <Tooltip 
        title={
          <Box className="badge-progress-tooltip-title">
            <Typography className="badge-progress-tooltip-name">{progress.badgeName}</Typography>
            <Typography className="badge-progress-tooltip-description">{progress.description}</Typography>
            <Box className="badge-progress-tooltip-criteria-box">
              <Typography component="span" className="badge-progress-tooltip-criteria-label">📋 Cómo obtenerlo:</Typography>
              <br />
              <Typography component="span" className="badge-progress-tooltip-criteria-text">{progress.criteria}</Typography>
            </Box>
            <Typography className="badge-progress-tooltip-percentage">
              Progreso: {progressValue.toFixed(0)}%
            </Typography>
          </Box>
        }
        arrow
      >
        <Box className="badge-progress badge-progress--compact">
          <LinearProgress 
            variant="determinate" 
            value={progressValue}
            classes={{
              root: 'badge-progress-compact-linear-progress',
              bar: isHighProgress ? 'badge-progress-compact-linear-progress-high' : 'badge-progress-compact-linear-progress-normal'
            }}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip 
      title={
        <Box className="badge-progress-tooltip-title">
          <Typography className="badge-progress-tooltip-name">{progress.badgeName}</Typography>
          <Typography className="badge-progress-tooltip-description">{progress.description}</Typography>
          <Box className="badge-progress-tooltip-criteria-box">
            <Typography component="span" className="badge-progress-tooltip-criteria-label">📋 Cómo obtenerlo:</Typography>
            <br />
            <Typography component="span" className="badge-progress-tooltip-criteria-text">{progress.criteria}</Typography>
          </Box>
          <Typography className="badge-progress-tooltip-percentage">
            Progreso: {progressValue.toFixed(0)}%
          </Typography>
        </Box>
      }
      arrow
    >
      <Box className="badge-progress">
        {showLabel && (
          <Box className="badge-progress__header">
            <Typography component="span" className="badge-progress__label">
              {progress.icon} {progress.badgeName}
            </Typography>
            <Typography component="span" className="badge-progress__percentage">
              {progressValue.toFixed(0)}%
            </Typography>
          </Box>
        )}
        
        <Box className="badge-progress__bar-container">
          <Box 
            className={`badge-progress__bar ${isHighProgress ? 'badge-progress__bar--high' : ''}`}
            style={{
              '--progress-width': `${progressValue}%`,
              '--progress-background': isHighProgress 
                ? 'linear-gradient(90deg, #66bb6a 0%, #388e3c 100%)'
                : `linear-gradient(90deg, ${progress.color}88 0%, ${progress.color} 100%)`
            } as React.CSSProperties}
          />
        </Box>
      </Box>
    </Tooltip>
  );
};

export default BadgeProgressBar;
