import React from 'react';
import {Box,Typography,Paper,Button,TextField,Alert,CircularProgress,Dialog,DialogTitle,DialogContent,DialogActions,
  IconButton,Card,CardContent,CardActions,Slide,Grow} from '@mui/material';
import {Add,Delete,Save,PersonOutlined,AccessTime,Warning} from '@mui/icons-material';
import type { MedicalHistory } from '../../../models/MedicalHistory';
import { useMachines } from '#/providers/MachineProvider';
import { formatDateTime } from '../../../utils/dateTimeUtils';


interface MedicalHistoryManagerProps {
  patientId: string;
  patientName: string;
  patientSurname: string;
  onHistoryUpdate?: () => void;
}

const MedicalHistoryManager: React.FC<MedicalHistoryManagerProps> = ({patientId,patientName,patientSurname,onHistoryUpdate}) => {
  const { doctorState, uiState, uiSend, medicalHistoryState, medicalHistorySend} = useMachines();

  const accessToken = doctorState.context.accessToken;
  const doctorId = doctorState.context.doctorId;

  const histories = medicalHistoryState.context.medicalHistories || [];
  const loading = medicalHistoryState.context.isLoading;
  const error = medicalHistoryState.context.error;
  const newContent = medicalHistoryState.context.newHistoryContent || '';

  const sortedHistories = [...histories].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const isAddDialogOpen = uiState.context.toggleStates.addMedicalHistoryDialog || false;
  const isDeleteDialogOpen = uiState.context.toggleStates.deleteMedicalHistoryDialog || false;
  const isViewDialogOpen = uiState.context.toggleStates.viewMedicalHistoryDialog || false;
  const currentPatientId = medicalHistoryState.context.currentPatientId
  const entryToDelete = medicalHistoryState.context.selectedHistory?.id;
  const selectedHistoryForView = isViewDialogOpen ? medicalHistoryState.context.selectedHistory : null;


  if (patientId && accessToken && (patientId !== currentPatientId || currentPatientId === null)) {
    medicalHistorySend({type: 'LOAD_PATIENT_MEDICAL_HISTORY',patientId,accessToken,});
  }

  const handleOpenAddDialog = () => {
    uiSend({ type: 'TOGGLE', key: 'addMedicalHistoryDialog' });
    medicalHistorySend({ type: 'SET_NEW_CONTENT', content: '' });
  };

  const handleAddHistory = () => {
    if (!newContent.trim() || !accessToken || !doctorId) return;
    medicalHistorySend({type: 'ADD_HISTORY_ENTRY',content: newContent.trim(),accessToken,doctorId,});
    uiSend({ type: 'TOGGLE', key: 'addMedicalHistoryDialog' });
    onHistoryUpdate?.();
  };


  const handleDeleteHistory = (historyId: string) => {
    // Close view dialog if open and clear any previous selections
    if (isViewDialogOpen) {
      uiSend({ type: 'TOGGLE', key: 'viewMedicalHistoryDialog' });
    }
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
    
    // Find and select the history entry to be deleted
    const historyToDelete = histories.find((h: MedicalHistory) => h.id === historyId);
    if (historyToDelete) {
      medicalHistorySend({ type: 'SELECT_HISTORY', history: historyToDelete });
      uiSend({ type: 'TOGGLE', key: 'deleteMedicalHistoryDialog' });
    }
  };

  const handleViewHistory = (history: MedicalHistory) => {
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
    if (isDeleteDialogOpen) {
      uiSend({ type: 'TOGGLE', key: 'deleteMedicalHistoryDialog' });
    }
    medicalHistorySend({ type: 'SELECT_HISTORY', history });
    uiSend({ type: 'TOGGLE', key: 'viewMedicalHistoryDialog' });
  };

  const handleCloseViewDialog = () => {
    uiSend({ type: 'TOGGLE', key: 'viewMedicalHistoryDialog' });
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
  };

  const handleConfirmDelete = () => {
    if (!entryToDelete || !accessToken || !doctorId) return;

    medicalHistorySend({type: 'DELETE_HISTORY_ENTRY',historyId: entryToDelete,accessToken,doctorId,});
    uiSend({ type: 'TOGGLE', key: 'deleteMedicalHistoryDialog' });
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
    onHistoryUpdate?.();
  };

  const handleCancelDelete = () => {
    uiSend({ type: 'TOGGLE', key: 'deleteMedicalHistoryDialog' });
    medicalHistorySend({ type: 'CLEAR_SELECTION' });
  };

  const handleCloseAddDialog = () => {
    uiSend({ type: 'TOGGLE', key: 'addMedicalHistoryDialog' });
    medicalHistorySend({ type: 'SET_NEW_CONTENT', content: '' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Historia Clínica
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          sx={{
            background: 'linear-gradient(135deg, #22577a 0%, #38a3a5 100%)',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1a4760 0%, #2a8082 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(34, 87, 122, 0.3)',
            },
            '&:active': {
              transform: 'translateY(0px)',
            }
          }}
        >
          Nueva Entrada
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ color: '#38a3a5' }} />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && sortedHistories.length === 0 && (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            No hay entradas en la historia clínica para este paciente.
          </Typography>
        </Paper>
      )}

      {sortedHistories.length > 0 && (
        <Grow in={true} timeout={600}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
            }}
          >
            {sortedHistories.map((history: MedicalHistory, index) => (
              <Grow 
                key={history.id} 
                in={true} 
                timeout={400 + index * 150}
                style={{ transformOrigin: '0 0 0' }}
              >
              <Card 
                elevation={2}
                onClick={() => handleViewHistory(history)}
                sx={{ 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  borderLeft: '4px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    borderLeft: '4px solid #38a3a5',
                    '&::before': {
                      opacity: 1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(56, 163, 165, 0.03) 0%, rgba(34, 87, 122, 0.03) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  },
                  '&:active': {
                    transform: 'translateY(-2px) scale(1.01)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonOutlined fontSize="small" />
                        Dr. {history.doctorName} {history.doctorSurname}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime fontSize="small" />
                        {formatDateTime(history.createdAt, 'DD/MM/YYYY HH:mm')}
                        {history.updatedAt !== history.createdAt && ' (Actualizada)'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {history.content}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  {history.doctorId === doctorId && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation(); // Prevent card click event
                          handleDeleteHistory(history.id);
                        }}
                        disabled={loading}
                        color="error"
                        sx={{ 
                          transition: 'all 0.2s ease',
                          '&:hover': { 
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(211, 47, 47, 0.1)' 
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grow>
          ))}
          </Box>
        </Grow>
      )}


      <Dialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Agregar Nueva Entrada - {patientName} {patientSurname}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={newContent}
            onChange={(e) => medicalHistorySend({ type: 'SET_NEW_CONTENT', content: e.target.value })}
            placeholder="Ingrese el contenido de la historia clínica..."
            helperText={`${newContent.length}/5000 caracteres`}
            error={newContent.length > 5000}
            disabled={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddHistory}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
            disabled={loading || newContent.length > 5000 || !newContent.trim()}
          >
            Agregar Entrada
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={isViewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Grow as any}
        TransitionProps={{ timeout: 400 } as any}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #22577a 0%, #38a3a5 100%)',
            }
          }
        }}
      >
        {selectedHistoryForView && (
          <>
            <DialogTitle sx={{ 
              pt: 4, 
              pb: 2,
              background: 'linear-gradient(135deg, rgba(56, 163, 165, 0.05) 0%, rgba(34, 87, 122, 0.05) 100%)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonOutlined sx={{ color: '#38a3a5', fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#22577a' }}>
                    Historia Clínica - {patientName} {patientSurname}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#666', opacity: 0.8 }}>
                    Dr. {selectedHistoryForView.doctorName} {selectedHistoryForView.doctorSurname}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ px: 4, py: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Grow in={true} timeout={800} style={{ transformOrigin: 'center top' }}>
                  <Typography variant="caption" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: '#888',
                    mb: 2
                  }}>
                    <AccessTime fontSize="small" />
                    Creado: {formatDateTime(selectedHistoryForView.createdAt, 'DD/MM/YYYY HH:mm')}
                    {selectedHistoryForView.updatedAt !== selectedHistoryForView.createdAt && (
                      <span style={{ marginLeft: '12px' }}>
                        • Actualizado: {formatDateTime(selectedHistoryForView.updatedAt, 'DD/MM/YYYY HH:mm')}
                      </span>
                    )}
                  </Typography>
                </Grow>
              </Box>
              
              <Slide in={true} direction="up" timeout={1000}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    position: 'relative',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(180deg, #22577a 0%, #38a3a5 100%)',
                      borderRadius: '0 2px 2px 0',
                      transform: 'scaleY(0)',
                      transformOrigin: 'center top',
                      animation: 'expandVerticalBar 0.8s ease 0.5s forwards',
                    },
                    '@keyframes expandVerticalBar': {
                      'to': {
                        transform: 'scaleY(1)',
                      }
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: 1.8,
                      color: '#2d3748',
                      fontSize: '1rem',
                      pl: 2,
                      opacity: 0,
                      animation: 'fadeInContent 0.8s ease 0.8s forwards',
                      '@keyframes fadeInContent': {
                        'to': {
                          opacity: 1,
                        }
                      }
                    }}
                  >
                    {selectedHistoryForView.content}
                  </Typography>
                </Paper>
              </Slide>
            </DialogContent>
            
            <DialogActions sx={{ px: 4, pb: 3 }}>
              <Grow in={true} timeout={1200} style={{ transformOrigin: 'center bottom' }}>
                <Button 
                  onClick={handleCloseViewDialog}
                  variant="contained"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #22577a 0%, #38a3a5 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1a4760 0%, #2a8082 100%)',
                      transform: 'translateY(-2px) scale(1.05)',
                      boxShadow: '0 6px 20px rgba(34, 87, 122, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Cerrar
                </Button>
              </Grow>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide as any}
        TransitionProps={{ direction: "up" } as any}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            pt: 4, 
            pb: 2,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#d32f2f'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Warning sx={{ color: '#d32f2f', fontSize: '2rem' }} />
            <span>Confirmar Eliminación</span>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', px: 4 }}>
          <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
            ¿Está seguro de que desea eliminar esta entrada del historial médico?
          </Typography>
          <Typography variant="body2" sx={{ color: '#888', mt: 1, fontStyle: 'italic' }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', gap: 2, px: 4, pb: 4 }}>
          <Button 
            onClick={handleCancelDelete} 
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#bdbdbd',
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Delete />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default MedicalHistoryManager;