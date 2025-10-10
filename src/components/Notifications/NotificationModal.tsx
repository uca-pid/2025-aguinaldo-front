import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import { Close, Delete, CheckCircle, Warning } from '@mui/icons-material';
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
    notifications.forEach(notification => {
      notificationSend({ type: "DELETE_NOTIFICATION", notificationId: notification.id });
    });
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notificaciones</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ mr: 1 }}
            >
              Marcar todas como leídas
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay notificaciones nuevas
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    py: 2,
                    px: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {getSeverityIcon(notification.message)}
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" component="div">
                              Notificación
                            </Typography>
                            <Chip 
                              label={getSeverityColor(notification.message) === 'warning' ? 'Atención' : 'Éxito'}
                              size="small"
                              color={getSeverityColor(notification.message) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ wordWrap: 'break-word' }}
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                      
                      {notification.createdAt && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {new Date(notification.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      )}
                    </Box>
                    
                    <IconButton
                      onClick={() => handleDeleteNotification(notification.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;