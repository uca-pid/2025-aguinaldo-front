import React from 'react';
import { IconButton, Badge, Box } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useMachines } from '#/providers/MachineProvider';

const NotificationBell: React.FC = () => {
  const { notificationState, uiSend } = useMachines();
  
  const notificationCount = notificationState?.context?.notifications?.length || 0;

  const handleBellClick = () => {
    uiSend({ type: "OPEN_NOTIFICATION_MODAL" });
  };

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleBellClick}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge 
          badgeContent={notificationCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: '16px',
              height: '16px',
            },
          }}
        >
          <Notifications />
        </Badge>
      </IconButton>
    </Box>
  );
};

export default NotificationBell;