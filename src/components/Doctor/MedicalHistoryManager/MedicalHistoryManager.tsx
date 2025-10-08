import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  PersonOutlined,
  AccessTime
} from '@mui/icons-material';
import type { MedicalHistory } from '../../../models/MedicalHistory';
import { MedicalHistoryService } from '../../../service/medical-history-service.service';

interface MedicalHistoryManagerProps {
  patientId: string;
  patientName: string;
  patientSurname: string;
  accessToken: string;
  doctorId: string;
  onHistoryUpdate?: () => void;
}

const MedicalHistoryManager: React.FC<MedicalHistoryManagerProps> = ({
  patientId,
  patientName,
  patientSurname,
  accessToken,
  doctorId,
  onHistoryUpdate
}) => {
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPatientMedicalHistory();
  }, [patientId]);

  const loadPatientMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const medicalHistories = await MedicalHistoryService.getPatientMedicalHistory(accessToken, patientId);
      setHistories(medicalHistories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHistory = async () => {
    if (!editContent.trim()) return;

    try {
      setSaving(true);
      const newHistory = await MedicalHistoryService.addMedicalHistory(accessToken, doctorId, {
        patientId,
        content: editContent.trim()
      });
      
      setHistories(prev => [newHistory, ...prev]);
      setEditContent('');
      setIsAddDialogOpen(false);
      onHistoryUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding medical history');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateHistory = async (historyId: string) => {
    if (!editContent.trim()) return;

    try {
      setSaving(true);
      const updatedHistory = await MedicalHistoryService.updateMedicalHistory(
        accessToken,
        doctorId,
        historyId,
        { content: editContent.trim() }
      );

      setHistories(prev => 
        prev.map(h => h.id === historyId ? updatedHistory : h)
      );
      setEditingHistoryId(null);
      setEditContent('');
      onHistoryUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating medical history');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta entrada del historial médico?')) {
      return;
    }

    try {
      setSaving(true);
      await MedicalHistoryService.deleteMedicalHistory(accessToken, doctorId, historyId);
      setHistories(prev => prev.filter(h => h.id !== historyId));
      onHistoryUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting medical history');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (history: MedicalHistory) => {
    setEditingHistoryId(history.id);
    setEditContent(history.content);
  };

  const cancelEdit = () => {
    setEditingHistoryId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const toggleCardExpansion = (historyId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(historyId)) {
        newSet.delete(historyId);
      } else {
        newSet.add(historyId);
      }
      return newSet;
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
          onClick={() => setIsAddDialogOpen(true)}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {histories.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            No hay entradas en la historia clínica para este paciente.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {histories.map((history) => {
            const isExpanded = expandedCards.has(history.id);
            const isEditing = editingHistoryId === history.id;

            return (
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
                    <Chip 
                      label={history.doctorId === doctorId ? 'Mi entrada' : 'Otro doctor'} 
                      size="small"
                      color={history.doctorId === doctorId ? 'primary' : 'default'}
                    />
                  </Box>

                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Ingrese el contenido de la historia clínica..."
                      helperText={`${editContent.length}/5000 caracteres`}
                      error={editContent.length > 5000}
                      disabled={saving}
                    />
                  ) : (
                    <Box>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {isExpanded ? history.content : truncateContent(history.content)}
                      </Typography>
                      {history.content.length > 150 && (
                        <Button
                          size="small"
                          onClick={() => toggleCardExpansion(history.id)}
                          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                          sx={{ mt: 1 }}
                        >
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  {isEditing ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={cancelEdit}
                        startIcon={<Cancel />}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleUpdateHistory(history.id)}
                        startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                        disabled={saving || editContent.length > 5000 || !editContent.trim()}
                      >
                        Guardar
                      </Button>
                    </Box>
                  ) : (
                    history.doctorId === doctorId && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => startEdit(history)}
                          disabled={saving}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteHistory(history.id)}
                          disabled={saving}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Add History Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
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
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Ingrese el contenido de la historia clínica..."
            helperText={`${editContent.length}/5000 caracteres`}
            error={editContent.length > 5000}
            disabled={saving}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddHistory}
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
            disabled={saving || editContent.length > 5000 || !editContent.trim()}
          >
            Agregar Entrada
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalHistoryManager;