import React from 'react';
import {Box,Button,List,ListItem,ListItemButton,ListItemIcon,ListItemText,Avatar,Typography,
  Divider,Slide,Backdrop} from '@mui/material';
import { Menu as MenuIcon, Person as PersonIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMachines } from '#/providers/MachineProvider';
import { useAuthMachine } from '#/providers/AuthProvider';
import { SignInResponse } from '#/models/Auth';
import { getMenuItems, getUserDisplayName } from '#/utils/sideBarMenuUtils';
import './FloatingMenu.css';

const FloatingMenu: React.FC = () => {
  const navigate = useNavigate();
  const { uiState, uiSend } = useMachines();
  const { authState, authSend } = useAuthMachine();
  const user = authState?.context?.authResponse as SignInResponse;
  const userRole= user.role;
  
  const isOpen = Boolean(uiState?.context?.toggleStates?.["floatingMenu"]);

  const handleLogout = () => {
    uiSend({ type: "TOGGLE", key: "floatingMenu" });
    authSend({ type: 'LOGOUT' });
  };

  const handleNavigation = (path: string) => {
    uiSend({ type: "TOGGLE", key: "floatingMenu" });
    navigate(path);
  };

  const menuItems = getMenuItems(userRole, handleLogout);

  return (
    <>
    
      {!isOpen && (
        <Button
          className="floating-menu-button"
          onClick={()=>{uiSend({ type: "TOGGLE", key: "floatingMenu" });}}
          variant="contained"
          sx={{
            '&.MuiButton-root': {
              position: 'fixed',
              top: '90px',
              left: '20px',
              zIndex: 1300,
              minWidth: '56px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#22577a',
              color: 'white',
              boxShadow: '0 4px 20px rgba(34, 87, 122, 0.3)',
              padding: 0,
              '&:hover': {
                backgroundColor: '#1a4660',
                boxShadow: '0 6px 25px rgba(34, 87, 122, 0.4)',
                transform: 'scale(1.1)',
              },
              '&:focus': {
                backgroundColor: '#22577a',
              },
            },
          }}
        >
          <MenuIcon sx={{ fontSize: '1.5rem', color: 'white' }} />
        </Button>
      )}

    
      <Backdrop
        open={isOpen}
        onClick={()=>uiSend({ type: "TOGGLE", key: "floatingMenu" })}
        sx={{ 
          zIndex: 1200,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      />

   
      <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
        <Box className="floating-menu-container">
        
          <Box className="floating-menu-header">
            <Avatar className="floating-menu-avatar">
              <PersonIcon />
            </Avatar>
            <Typography variant="h6" className="floating-menu-user-name">
              {getUserDisplayName(user)}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

       
          <List className="floating-menu-list">
            {menuItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  className={`floating-menu-item ${item.id === 'logout' ? 'logout-item' : ''}`}
                  onClick={() => item.action ? item.action() : handleNavigation(item.path)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <ListItemIcon className="floating-menu-icon">
                    {React.createElement(item.iconComponent)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    className="floating-menu-text"
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Slide>
    </>
  );
};

export default FloatingMenu;