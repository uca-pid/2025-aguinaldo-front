import React from 'react';
import {
  Box, 
  Typography, 
  Avatar,
  CircularProgress,
  Chip
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useMachines } from "#/providers/MachineProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BadgeCard from "../../shared/Badges/BadgeCard";
import { 
  BADGE_METADATA,
  BadgeType,
  BadgeRarity
} from "#/models/Badge";
import type { Badge, BadgeProgress } from "#/models/Badge";
import "./DoctorBadges.css";

const DoctorBadges: React.FC = () => {
  const { badgeState } = useMachines();
  const badgeContext = badgeState?.context;

  const isLoading = badgeContext?.isLoadingBadges || badgeContext?.isLoadingProgress;
  const badges = badgeContext?.badges || [];
  const progress = badgeContext?.progress || [];
  const stats = badgeContext?.stats || null;

  const allBadgeTypes = Object.values(BadgeType);
  const earnedBadgeTypes = new Set(badges.map((b: Badge) => b.badgeType));

  const rarityOrder = {
    [BadgeRarity.COMMON]: 1,
    [BadgeRarity.RARE]: 2,
    [BadgeRarity.EPIC]: 3,
    [BadgeRarity.LEGENDARY]: 4,
  };

  const sorted = [...allBadgeTypes];
  sorted.sort((a, b) => {
    const rarityA = BADGE_METADATA[a].rarity;
    const rarityB = BADGE_METADATA[b].rarity;
    return rarityOrder[rarityA] - rarityOrder[rarityB];
  });
  const sortedBadges = sorted;

  const lockedBadgesCount = sortedBadges.filter(type => !earnedBadgeTypes.has(type)).length;

  const getBadgeObject = (badgeType: BadgeType): Badge | undefined => {
    return badges.find((b: Badge) => b.badgeType === badgeType);
  };

  const getProgressForBadge = (badgeType: BadgeType): BadgeProgress | undefined => {
    return progress.find((p: BadgeProgress) => p.badgeType === badgeType);
  };
    
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="shared-container">
        <Box className="shared-header">
          <Box className="shared-header-layout">
            <Box className="shared-header-content">
              <Avatar className="shared-header-icon doctor-header-avatar">
                <EmojiEventsIcon className="doctor-header-icon" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" className="shared-header-title">
                  Colección de Logros
                </Typography>
                <Typography variant="h6" className="shared-header-subtitle doctor-header-subtitle">
                  Explora todos tus logros y progreso
                </Typography>
              </Box>
            </Box>
            <Box className="shared-header-spacer">
              {isLoading && <CircularProgress />}
            </Box>
          </Box>
        </Box>

        <Box className="badges-content">
          {stats && (
            <Box className="doctor-badges-stats-summary">
              <Box className="doctor-stat-card">
                <Typography className="doctor-stat-value">
                  {stats.totalEarned}
                </Typography>
                <Typography className="doctor-stat-label">
                  Obtenidos
                </Typography>
              </Box>
              <Box className="doctor-stat-card">
                <Typography className="doctor-stat-value">
                  {stats.totalAvailable}
                </Typography>
                <Typography className="doctor-stat-label">
                  Disponibles
                </Typography>
              </Box>
              <Box className="doctor-stat-card">
                <Typography className="doctor-stat-value">
                  {stats.completionPercentage}%
                </Typography>
                <Typography className="doctor-stat-label">
                  Completado
                </Typography>
              </Box>
              <Box className="doctor-stat-card">
                <Typography className="doctor-stat-locked-value">
                  {lockedBadgesCount}
                </Typography>
                <Typography className="doctor-stat-label">
                  Por Desbloquear
                </Typography>
              </Box>
            </Box>
          )}

          {sortedBadges.length > 0 && (
            <Box className="badges-section">
              <Box className="badges-section-header">
                <Typography variant="h5" className="badges-section-title">
                  🏆 Todos los Badges
                </Typography>
                <Chip 
                  label={`${sortedBadges.length} badges`} 
                  size="small" 
                  className="doctor-badges-chip"
                />
              </Box>
              <Box className="badges-grid">
                {sortedBadges.map((badgeType) => {
                  const badge = getBadgeObject(badgeType);
                  const prog = getProgressForBadge(badgeType);
                  return (
                    <BadgeCard
                      key={badgeType}
                      badgeType={badgeType}
                      badge={badge}
                      progress={prog}
                      size="medium"
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {sortedBadges.length === 0 && (
            <Box className="badges-empty-state">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No se encontraron logros
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Los logros se cargarán automáticamente
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DoctorBadges;
