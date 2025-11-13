import React from 'react';
import { Tooltip, Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import type { Badge, BadgeType, BadgeProgress, PatientBadgeType } from '#/models/Badge';
import { getBadgeMetadata, getRarityColor, getPatientBadgeMetadata, getRarityDisplayName } from '#/models/Badge';
import { BadgeService } from '#/service/badge-service.service';
import './BadgeStyles.css';
import './BadgeCard.css';

interface BadgeCardProps {
  badgeType: BadgeType | PatientBadgeType;
  badge?: Badge;
  progress?: BadgeProgress;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  userRole?: 'DOCTOR' | 'PATIENT';
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  badgeType,
  badge,
  progress,
  onClick,
  size = 'medium',
  userRole = 'DOCTOR'
}) => {
  const metadata = userRole === 'PATIENT' 
    ? getPatientBadgeMetadata(badgeType as PatientBadgeType)
    : getBadgeMetadata(badgeType as BadgeType);
  const isEarned = !!badge;
  const rarityColor = getRarityColor(metadata.rarity);

  const rawValue = progress && typeof progress.progressPercentage === 'number' && isFinite(progress.progressPercentage)
    ? progress.progressPercentage
    : 0;
  const progressValue = Math.min(100, Math.max(0, rawValue));
  const isHighProgress = progressValue >= 75;

  const sizeClasses = {
    small: 'badge-card--small',
    medium: 'badge-card--medium',
    large: 'badge-card--large'
  };

  return (
    <Tooltip 
      title={
        <Box className="badge-card-tooltip-title">
          <Typography className="badge-card-tooltip-text">
            {metadata.criteria}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        className={`badge-card ${isEarned ? 'badge-card--earned' : 'badge-card--locked'} ${sizeClasses[size]}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.();
          }
        }}
        style={{
          '--badge-rarity-color': rarityColor,
          '--badge-rarity-color-light': `${rarityColor}22`,
          '--badge-rarity-color-lighter': `${rarityColor}44`,
          '--badge-color': metadata.color,
          '--badge-color-light': `${metadata.color}88`
        } as React.CSSProperties}
      >
        {/* Glow effect for earned badges */}
        {isEarned && (
          <Box className="badge-card__glow" />
        )}

        {/* Rarity indicator */}
        <Box className="badge-card__rarity-indicator">
          {getRarityDisplayName(metadata.rarity)}
        </Box>

        {/* Lock icon for unearned badges */}
        {!isEarned && (
          <LockIcon className="badge-card__lock-icon" />
        )}

        {/* Card content */}
        <Box className="badge-card__content">
          <Box 
            className={`badge-card__icon-container ${isEarned ? 'badge-card__icon-container--earned' : 'badge-card__icon-container--locked'}`}
          >
            <Typography component="span" className="badge-card__icon">{metadata.icon}</Typography>
          </Box>
          <Typography className="badge-card__name">{metadata.name}</Typography>
          <Typography className="badge-card__description">{metadata.description}</Typography>

          {isEarned && badge && (
            <Typography className="badge-card__earned-date">
              {BadgeService.formatEarnedDate(badge.earnedAt)}
            </Typography>
          )}

          {/* Progress bar for unearned badges */}
          {!isEarned && progress && (
            <Box className="badge-card-progress-container">
              <Box className="badge-card-progress-bar-wrapper">
                <Box className="badge-card-progress-bar">
                  <Box 
                    className={`badge-card-progress-fill ${isHighProgress ? 'badge-card-progress-fill--high' : 'badge-card-progress-fill--normal'}`}
                    style={{ width: `${progressValue}%` }}
                  />
                </Box>
                <Typography 
                  component="span" 
                  className={`badge-card-progress-percentage ${isHighProgress ? 'badge-card-progress-percentage--high' : 'badge-card-progress-percentage--normal'}`}
                >
                  {progressValue.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default BadgeCard;
