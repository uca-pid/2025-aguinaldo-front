import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Fade,
  Paper,
} from '@mui/material';
import { 
  Close, 
  Delete, 
  CheckCircle, 
  Warning, 
  NotificationsActive,
  MarkEmailRead,
  Schedule
} from '@mui/icons-material';
import { useMachines } from '#/providers/MachineProvider';
import { NotificationResponse } from '#/service/notification-service.service';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ open, onClose }) => {
  const { notificationState, notificationSend } = useMachines();
  
  const notifications: NotificationResponse[] = notificationState?.context?.notifications || [];

  const handleDeleteNotification = (notificationId: string) => {
    notificationSend({ type: "DELETE_NOTIFICATION", notificationId });
  };

  const handleMarkAllAsRead = () => {
    // Delete all notifications in one batch operation
    notificationSend({ type: "DELETE_ALL_NOTIFICATIONS" });
  };

  const getSeverityIcon = (message: string) => {
    const isWarning = message.toLowerCase().includes('rechazada') || 
                     message.toLowerCase().includes('cancelado');
    return isWarning ? <Warning color="warning" /> : <CheckCircle color="success" />;
  };

  const getSeverityColor = (message: string) => {
    const isWarning = message.toLowerCase().includes('rechazada') || 
                     message.toLowerCase().includes('cancelado');
    return isWarning ? 'warning' : 'success';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          borderRadius: '16px',
          boxShadow: '0 12px 30px rgba(34, 87, 122, 0.15)',
          border: '1px solid #e2e8f0',
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #22577a 0%, #2d7d90 100%)',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '16px 16px 0 0',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(34, 87, 122, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            width: 40, 
            height: 40,
            backdropFilter: 'blur(10px)',
          }}>
            <NotificationsActive sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Notificaciones
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {notifications.length === 0 
                ? 'No hay notificaciones' 
                : `${notifications.length} notificación${notifications.length !== 1 ? 'es' : ''}`
              }
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<MarkEmailRead />}
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Marcar todas como leídas
            </Button>
          )}
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, backgroundColor: '#f8fafc' }}>
        {notifications.length === 0 ? (
          <Box sx={{ 
            p: 6, 
            textAlign: 'center',
            backgroundColor: 'white',
          }}>
            <Avatar sx={{ 
              mx: 'auto', 
              mb: 3, 
              width: 80, 
              height: 80,
              bgcolor: '#f1f5f9',
              border: '3px solid #e2e8f0',
            }}>
              <NotificationsActive sx={{ fontSize: 40, color: '#64748b' }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#1f4f6f', mb: 1, fontWeight: 600 }}>
              No hay notificaciones nuevas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando tengas nuevas notificaciones aparecerán aquí
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <Fade in={true} timeout={300 + index * 100} key={notification.id}>
                <Paper 
                  elevation={0}
                  sx={{
                    mb: index === notifications.length - 1 ? 0 : 1,
                    mx: 2,
                    mt: index === 0 ? 2 : 0,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(34, 87, 122, 0.1)',
                      borderColor: '#22577a',
                    }
                  }}
                >
                  <ListItem
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      py: 3,
                      px: 3,
                      backgroundColor: 'white',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: getSeverityColor(notification.message) === 'warning' ? '#f59e0b' : '#57cc99',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', ml: 1 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        mt: 0.5,
                        width: 48,
                        height: 48,
                        bgcolor: getSeverityColor(notification.message) === 'warning' 
                          ? 'rgba(245, 158, 11, 0.1)' 
                          : 'rgba(87, 204, 153, 0.1)',
                        border: `2px solid ${getSeverityColor(notification.message) === 'warning' ? '#f59e0b' : '#57cc99'}`,
                      }}>
                        {getSeverityIcon(notification.message)}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Typography variant="subtitle1" component="div" sx={{ 
                            fontWeight: 600, 
                            color: '#0d2230',
                          }}>
                            Nueva Notificación
                          </Typography>
                          <Chip 
                            label={getSeverityColor(notification.message) === 'warning' ? 'Atención' : 'Confirmación'}
                            size="small"
                            color={getSeverityColor(notification.message) as any}
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#1f4f6f',
                            lineHeight: 1.6,
                            wordWrap: 'break-word',
                            mb: 2,
                            fontSize: '0.95rem',
                          }}
                        >
                          {notification.message}
                        </Typography>
                        
                        {notification.createdAt && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule sx={{ fontSize: 16, color: '#64748b' }} />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#64748b',
                                fontWeight: 500,
                              }}
                            >
                              {new Date(notification.createdAt).toLocaleString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <IconButton
                        onClick={() => handleDeleteNotification(notification.id)}
                        size="small"
                        sx={{ 
                          ml: 1,
                          color: '#64748b',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Paper>
              </Fade>
            ))}
            <Box sx={{ height: 16 }} /> {/* Bottom spacing */}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;