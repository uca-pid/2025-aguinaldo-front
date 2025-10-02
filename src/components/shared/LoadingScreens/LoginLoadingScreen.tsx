import { useState, useEffect } from "react";
import { 
  CircularProgress, 
  Box, 
  Typography, 
  Avatar,
  keyframes,
  Fade 
} from "@mui/material";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Cute animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const LoginLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Iniciando sesión...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 12;
        
        // Update messages based on progress
        if (newProgress >= 65) {
          setMessage("Preparando dashboard... 🏥");
        } else if (newProgress >= 45) {
          setMessage("Verificando credenciales... 🔐");
        } else if (newProgress >= 25) {
          setMessage("Conectando... 🌐");
        }
        
        return Math.min(newProgress, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <Fade in={true} timeout={600}>
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #0d2230 0%, #22577a 25%, #38a3a5 50%, #57cc99 75%, #c7f9cc 100%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Cute floating elements */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: `${10 + (i % 3) * 6}px`,
              height: `${10 + (i % 3) * 6}px`,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              animation: `${float} ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
              top: `${10 + (i % 4) * 25}%`,
              left: `${5 + (i % 5) * 20}%`,
            }}
          />
        ))}

        {/* Main loading card */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px 32px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            minWidth: '320px',
            animation: `${pulse} 4s ease-in-out infinite`,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Sparkles */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 6,
                height: 6,
                background: '#fbbf24',
                borderRadius: '50%',
                animation: `${sparkle} 2.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                top: `${15 + (i % 3) * 30}%`,
                left: `${10 + (i % 4) * 25}%`,
              }}
            />
          ))}

          {/* Medical icon */}
          <Avatar
            sx={{
              width: 70,
              height: 70,
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #22577a 0%, #38a3a5 100%)',
              boxShadow: '0 10px 20px rgba(34, 87, 122, 0.3)',
              animation: `${float} 3s ease-in-out infinite`,
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 35, color: 'white' }} />
          </Avatar>

          {/* Circular Progress with Percentage */}
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
            {/* Background circle */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={120}
              thickness={6}
              sx={{
                color: 'rgba(56, 163, 165, 0.15)',
                position: 'absolute',
              }}
            />
            {/* Progress circle */}
            <CircularProgress
              variant="determinate"
              value={progress}
              size={120}
              thickness={6}
              sx={{
                color: '#38a3a5',
                filter: 'drop-shadow(0 0 8px rgba(56, 163, 165, 0.4))',
              }}
            />
            {/* Percentage in center */}
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #22577a 0%, #38a3a5 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}
              >
                {Math.round(progress)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  mt: -0.5,
                }}
              >
                %
              </Typography>
            </Box>
          </Box>

          {/* Loading message */}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: '#22577a',
              animation: `${float} 2s ease-in-out infinite`,
              animationDelay: '0.3s',
            }}
          >
            {message}
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontStyle: 'italic',
              mb: 3,
            }}
          >
            Preparando MediBook para ti
          </Typography>

          {/* Loading dots */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0.8,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38a3a5 0%, #57cc99 100%)',
                  animation: `${float} 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default LoginLoadingScreen;
