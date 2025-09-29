import React from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Slide,
  Backdrop
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMachines } from '#/providers/MachineProvider';
import { useAuthMachine } from '#/providers/AuthProvider';
import { SignInResponse } from '#/models/Auth';
import './FloatingMenu.css';

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactElement;
  path: string;
  action?: () => void;
}

interface FloatingMenuProps {
  userRole?: 'DOCTOR' | 'PATIENT' | 'ADMIN';
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ userRole = 'DOCTOR' }) => {
  const navigate = useNavigate();
  const { uiState, uiSend } = useMachines();
  const { authState, authSend } = useAuthMachine();
  const user = authState?.context?.authResponse as SignInResponse;

  // Use state machine for menu toggle state
  const isOpen = Boolean(uiState?.context?.toggleStates?.["floatingMenu"]);

  const handleToggle = () => {
    uiSend({ type: "TOGGLE", key: "floatingMenu" });
  };

  const handleClose = () => {
    if (isOpen) {
      uiSend({ type: "TOGGLE", key: "floatingMenu" });
    }
  };

  const handleLogout = () => {
    handleClose();
    authSend({ type: 'LOGOUT' });
  };

  const handleNavigation = (path: string) => {
    handleClose();
    navigate(path); // ← Usar navigate directamente, sin máquina de estado
  };

  const getDoctorMenuItems = (): MenuItem[] => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      id: 'patients',
      title: 'Pacientes',
      icon: <PeopleIcon />,
      path: '/doctor/view-patients'
    },
    {
      id: 'turns',
      title: 'Mis Turnos',
      icon: <CalendarIcon />,
      path: '/doctor/view-turns'
    },
    {
      id: 'availability',
      title: 'Disponibilidad',
      icon: <ScheduleIcon />,
      path: '/doctor/enable-hours'
    },
    {
      id: 'requests',
      title: 'Solicitudes',
      icon: <NotificationsIcon />,
      path: '/doctor/turns-modifications'
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: <PersonIcon />,
      path: '/profile'
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      icon: <ExitIcon />,
      path: '',
      action: handleLogout
    }
  ];

  const getPatientMenuItems = (): MenuItem[] => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      id: 'reservation',
      title: 'Reservar Turno',
      icon: <CalendarIcon />,
      path: '/patient/reservation-turns'
    },
    {
      id: 'turns',
      title: 'Mis Turnos',
      icon: <CalendarIcon />,
      path: '/patient/view-turns'
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: <PersonIcon />,
      path: '/profile'
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      icon: <ExitIcon />,
      path: '',
      action: handleLogout
    }
  ];

  const getAdminMenuItems = (): MenuItem[] => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/'
    },
    {
      id: 'pending',
      title: 'Solicitudes Pendientes',
      icon: <NotificationsIcon />,
      path: '/admin/pending'
    },
    {
      id: 'patients',
      title: 'Pacientes',
      icon: <PeopleIcon />,
      path: '/admin/patients'
    },
    {
      id: 'doctors',
      title: 'Doctores',
      icon: <PersonIcon />,
      path: '/admin/doctors'
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      icon: <PersonIcon />,
      path: '/profile'
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      icon: <ExitIcon />,
      path: '',
      action: handleLogout
    }
  ];

  const getMenuItems = (): MenuItem[] => {
    switch (userRole) {
      case 'PATIENT':
        return getPatientMenuItems();
      case 'ADMIN':
        return getAdminMenuItems();
      case 'DOCTOR':
      default:
        return getDoctorMenuItems();
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Floating Menu Button - Only show when menu is closed */}
      {!isOpen && (
        <Button
          className="floating-menu-button"
          onClick={handleToggle}
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

      {/* Backdrop */}
      <Backdrop
        open={isOpen}
        onClick={handleClose}
        sx={{ 
          zIndex: 1200,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Sliding Menu */}
      <Slide direction="right" in={isOpen} mountOnEnter unmountOnExit>
        <Box className="floating-menu-container">
          {/* User Header */}
          <Box className="floating-menu-header">
            <Avatar className="floating-menu-avatar">
              <PersonIcon />
            </Avatar>
            <Typography variant="h6" className="floating-menu-user-name">
              Dr. {user?.name || 'Usuario'}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Menu Items */}
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
                    {item.icon}
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