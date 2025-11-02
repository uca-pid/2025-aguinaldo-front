import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, FormControl, InputLabel, Select, MenuItem,
  Rating, Box, Paper, Chip, OutlinedInput
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useDataMachine } from '#/providers/DataProvider';
import { useMachines } from '#/providers/MachineProvider';
import { TurnService } from '#/service/turn-service.service';
import { orchestrator } from '#/core/Orchestrator';
import { UI_MACHINE_ID } from '#/machines/uiMachine';
import dayjs from '#/utils/dayjs.config';
import './RatingModal.css';

const RatingModal = () => {
  const { uiState, ratingState, ratingSend } = useMachines();
  const { dataState } = useDataMachine();

  const modalData = uiState.context.ratingModal;
  const open = modalData.open;
  const turn = modalData.turn;
  
  const ratingSubcategories = dataState.context.ratingSubcategories || [];
  const accessToken = dataState.context.accessToken;
  const turnsNeedingRating = dataState.context.turnsNeedingRating || [];
  
  const rating = ratingState?.context?.rating || 0;
  const subcategories = ratingState?.context?.subcategories || [];
  const loading = ratingState?.context?.loading || false;
  
  const currentTurnIndex = turnsNeedingRating.findIndex((t: any) => t.id === turn?.id);
  const currentPosition = currentTurnIndex >= 0 ? currentTurnIndex + 1 : 1;
  const totalTurns = turnsNeedingRating.length;
  const showProgress = totalTurns > 1;
  
  const handleClose = () => {
  };

  const handleSuccessfulSubmit = () => {
    ratingSend({ type: 'RESET_RATING' });
    
    const currentTurnIndex = turnsNeedingRating.findIndex((t: any) => t.id === turn?.id);
    const nextTurnIndex = currentTurnIndex + 1;
    
    if (nextTurnIndex < turnsNeedingRating.length) {
      const nextTurn = turnsNeedingRating[nextTurnIndex];
      orchestrator.sendToMachine(UI_MACHINE_ID, { 
        type: "OPEN_RATING_MODAL", 
        turn: nextTurn 
      });
    } else {
      orchestrator.sendToMachine(UI_MACHINE_ID, { type: "CLOSE_RATING_MODAL" });
    }
  };

  const handleSubmit = async () => {
    if (!rating || !turn?.id || !accessToken) {
      return;
    }

    ratingSend({ type: 'START_SUBMIT' });
    try {
      await TurnService.createRating(
        turn.id,
        { score: rating, subcategories },
        accessToken
      );

      orchestrator.sendToMachine(UI_MACHINE_ID, {
        type: "OPEN_SNACKBAR",
        message: "Calificación enviada exitosamente",
        severity: "success"
      });

      ratingSend({ type: 'SUBMIT_SUCCESS' });
      handleSuccessfulSubmit();
    } catch (error) {
      orchestrator.sendToMachine(UI_MACHINE_ID, {
        type: "OPEN_SNACKBAR",
        message: error instanceof Error ? error.message : "Error al enviar la calificación",
        severity: "error"
      });
      ratingSend({ type: 'SUBMIT_ERROR' });
    }
  };

  const isValidSubmission = rating > 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={true}
      className="rating-modal"
    >
      <DialogTitle className="rating-modal-header">        
        <Box className="rating-modal-header-content">
          <MedicalServicesIcon />
          <Typography variant="h5" className="rating-modal-title">
            {showProgress 
              ? `Calificar consulta ${currentPosition} de ${totalTurns}`
              : 'Calificar Consulta'
            }
          </Typography>
        </Box>
        
        <Typography variant="body2" className="rating-modal-subtitle">
          Tu evaluación es <strong>confidencial</strong> y nos ayuda a mejorar
        </Typography>
      </DialogTitle>
      
      <DialogContent className="rating-modal-content">
        {turn && (
          <Paper className="rating-modal-info-card">
            <Box className="rating-modal-doctor-info">
              <Box className="rating-modal-doctor-details">
                <Typography variant="h6" className="rating-modal-doctor-name">
                  Dr. {turn.doctorName}
                </Typography>
                <Typography variant="body2" className="rating-modal-doctor-specialty">
                  {turn.doctorSpecialty || 'Medicina General'}
                </Typography>
                <Box className="rating-modal-appointment-details">
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(turn.scheduledAt).format('DD/MM/YYYY [a las] HH:mm')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        <Box className="rating-modal-rating-section">
          <Typography variant="h6" className="rating-modal-section-title">
            Calificación General
          </Typography>
          
          <Box className="rating-modal-rating-container">
            <Rating
              name="rating"
              value={rating}
              onChange={(_, newValue) => ratingSend({ type: 'SET_RATING', rating: newValue || 0 })}
              size="large"
              className="rating-modal-stars"
            />
            <Typography variant="body2" className="rating-modal-rating-description">
              {rating === 0 && 'Selecciona una calificación'}
              {rating === 1 && 'Muy insatisfecho'}
              {rating === 2 && 'Insatisfecho'}
              {rating === 3 && 'Neutral'}
              {rating === 4 && 'Satisfecho'}
              {rating === 5 && 'Muy satisfecho'}
            </Typography>
          </Box>
        </Box>

        <Box className="rating-modal-subcategory">
          <Typography variant="h6" className="rating-modal-section-title">
            Aspectos a Destacar (opcional)
          </Typography>
          
          <FormControl fullWidth className="rating-modal-select">
            <InputLabel>Selecciona aspectos a destacar (máximo 3)</InputLabel>
            <Select
              multiple
              value={subcategories}
              onChange={(e) => {
                const value = e.target.value as string[];
                if (value.length <= 3) {
                  ratingSend({ type: 'SET_SUBCATEGORIES', subcategories: value });
                }
              }}
              input={<OutlinedInput label="Selecciona aspectos a destacar (máximo 3)" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {ratingSubcategories.map((category: string) => (
                <MenuItem 
                  key={category} 
                  value={category}
                  disabled={subcategories.length >= 3 && !subcategories.includes(category)}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      
      <DialogActions className="rating-modal-actions">
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValidSubmission || loading}
          className="rating-modal-submit-btn"
        >
          {loading ? 'Enviando...' : 'Enviar Evaluación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingModal;