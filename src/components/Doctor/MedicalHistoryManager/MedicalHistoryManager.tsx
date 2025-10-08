import {Box,Typography,Paper,Button,TextField,Alert,CircularProgress,Dialog,DialogTitle,DialogContent,DialogActions,
  IconButton,Card,CardContent,CardActions} from '@mui/material';
import {Add,Delete,Save,PersonOutlined,AccessTime} from '@mui/icons-material';
import type { MedicalHistory } from '../../../models/MedicalHistory';
import { useMachines } from '#/providers/MachineProvider';


interface MedicalHistoryManagerProps {
  patientId: string;
  patientName: string;
  patientSurname: string;
  onHistoryUpdate?: () => void;
}


const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
  const currentPatientId = medicalHistoryState.context.currentPatientId;


  if (patientId && accessToken && 
      (patientId !== currentPatientId || currentPatientId === null)) {
        medicalHistorySend({
        type: 'LOAD_PATIENT_MEDICAL_HISTORY',
        patientId,
        accessToken,
        });
  }


  const handleOpenAddDialog = () => {
    uiSend({ type: 'TOGGLE', key: 'addMedicalHistoryDialog' });
    medicalHistorySend({ type: 'SET_NEW_CONTENT', content: '' });
  };

  const handleAddHistory = () => {
    if (!newContent.trim() || !accessToken || !doctorId) return;
    
    medicalHistorySend({
      type: 'ADD_HISTORY_ENTRY',
      content: newContent.trim(),
      accessToken,
      doctorId,
    });
    uiSend({ type: 'TOGGLE', key: 'addMedicalHistoryDialog' });
    onHistoryUpdate?.();
  };


  const handleDeleteHistory = (historyId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta entrada del historial médico?')) {
      return;
    }

    if (!accessToken || !doctorId) return;

    medicalHistorySend({
      type: 'DELETE_HISTORY_ENTRY',
      historyId,
      accessToken,
      doctorId,
    });
    onHistoryUpdate?.();
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
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
          }}
        >
          {sortedHistories.map((history: MedicalHistory) => (
            <Card key={history.id} elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonOutlined fontSize="small" />
                      Dr. {history.doctorName} {history.doctorSurname}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" />
                      {formatDate(history.createdAt)}
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
                      onClick={() => handleDeleteHistory(history.id)}
                      disabled={loading}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
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

    
    </Box>
  );
};

export default MedicalHistoryManager;