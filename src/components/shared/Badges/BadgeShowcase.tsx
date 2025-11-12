import React from 'react';
import { Box, CircularProgress, Typography, Button, Tooltip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import BadgeCard from './BadgeCard';
import type { Badge, BadgeProgress, BadgeStats } from '#/models/Badge';
import './BadgeStyles.css';
import './BadgeShowcase.css';

const SHOW_EVALUATE_BUTTON = import.meta.env.DEV || false;

interface BadgeShowcaseProps {
  badges: Badge[];
  progress: BadgeProgress[];
  stats: BadgeStats | null;
  isLoading?: boolean;
  isEvaluating?: boolean;
  onViewAll?: () => void;
  onEvaluate?: () => void;
  userRole?: 'DOCTOR' | 'PATIENT';
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  stats,
  isLoading = false,
  isEvaluating = false,
  onViewAll,
  onEvaluate,
  userRole = 'DOCTOR'
}) => {
  if (isLoading) {
    return (
      <Box className="badge-showcase">
        <Box className="badge-showcase-loading">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  const { totalEarned, totalAvailable, completionPercentage, recentlyEarned, closestToEarn } = stats;

  return (
    <Box className="badge-showcase">
      {/* Header */}
      <Box className="badge-showcase__header">
        <Box className="badge-showcase__title">
          <EmojiEventsIcon className="badge-showcase__title-icon" />
          Mis Logros
        </Box>
        <Box className="badge-showcase__header-actions">
          {SHOW_EVALUATE_BUTTON && onEvaluate && (
            <Tooltip title="Recalcular todos los logros manualmente. Útil para doctores existentes.">
              <Button
                variant="outlined"
                size="small"
                startIcon={isEvaluating ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={onEvaluate}
                disabled={isEvaluating}
                className="badge-showcase__evaluate-button"
              >
                {isEvaluating ? 'Evaluando...' : 'Evaluar Badges'}
              </Button>
            </Tooltip>
          )}
          {onViewAll && (
            <Box 
              className="badge-showcase__view-all" 
              onClick={onViewAll}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onViewAll();
                }
              }}
            >
              Ver todos <ArrowForwardIcon style={{ fontSize: 16, marginLeft: 4, verticalAlign: 'middle' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Statistics */}
      <Box className="badge-showcase__stats">
        <Box className="badge-showcase__stat">
          <Typography component="span" className="badge-showcase__stat-value">{totalEarned}</Typography>
          <Typography component="span" className="badge-showcase__stat-label">Obtenidos</Typography>
        </Box>
        <Box className="badge-showcase__stat">
          <Typography component="span" className="badge-showcase__stat-value">{totalAvailable}</Typography>
          <Typography component="span" className="badge-showcase__stat-label">Disponibles</Typography>
        </Box>
        <Box className="badge-showcase__stat">
          <Typography component="span" className="badge-showcase__stat-value">{completionPercentage}%</Typography>
          <Typography component="span" className="badge-showcase__stat-label">Completado</Typography>
        </Box>
      </Box>

      {/* Recently Earned Badges */}
      {recentlyEarned.length > 0 && (
        <Box className="badge-showcase__recent">
          <Box className="badge-showcase__section-title">
            ✨ Recién Obtenidos
          </Box>
          <Box className="badge-showcase__recent-grid">
            {recentlyEarned.slice(0, 4).map((badge) => (
              <BadgeCard
                key={badge.id}
                badgeType={badge.badgeType}
                badge={badge}
                size="small"
                userRole={userRole}
                onClick={() => onViewAll?.()}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Closest to Earn */}
      {closestToEarn.length > 0 && (
        <Box className="badge-showcase__recent badge-showcase__recent--closest">
          <Box className="badge-showcase__section-title">
            🎯 Próximos a Conseguir
          </Box>
          <Box className="badge-showcase__recent-grid">
            {closestToEarn.slice(0, 3).map((prog) => (
              <BadgeCard
                key={prog.badgeType}
                badgeType={prog.badgeType}
                progress={prog}
                size="small"
                userRole={userRole}
                onClick={() => onViewAll?.()}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Empty State */}
      {totalEarned === 0 && closestToEarn.length === 0 && (
        <Box className="badge-showcase__empty-state">
          <Typography className="badge-showcase__empty-title" gutterBottom>
            ¡Comienza tu colección de badges!
          </Typography>
          <Typography className="badge-showcase__empty-subtitle">
            Completa consultas, documenta casos y brinda atención de calidad para obtener badges
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BadgeShowcase;
