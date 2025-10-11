import { 
  CircularProgress, 
  Box, 
  Typography, 
  Fade 
} from "@mui/material";
import SecurityIcon from '@mui/icons-material/Security';

const AuthCheckingScreen = () => {
  return (
    <Fade in={true} timeout={400}>
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #0d2230 0%, #22577a 25%, #38a3a5 50%, #57cc99 75%, #c7f9cc 100%)',
        }}
      >
        {/* Main loading card */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '400px',
            width: '90%',
          }}
        >
          {/* Icon with animation */}
          <Box sx={{ mb: 3 }}>
            <SecurityIcon 
              sx={{ 
                fontSize: 48, 
                color: '#22577a',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.05)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              }} 
            />
          </Box>

          {/* Loading spinner */}
          <CircularProgress 
            sx={{ 
              color: '#22577a',
              mb: 3,
            }} 
            size={32}
            thickness={4}
          />

          {/* Loading message */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#22577a',
              mb: 1,
            }}
          >
            Verificando autenticación...
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            Comprobando sesión guardada
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default AuthCheckingScreen;