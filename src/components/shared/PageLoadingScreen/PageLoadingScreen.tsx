import React from 'react';
import { 
  Box, 
  Fade,
  keyframes
} from '@mui/material';
import LoadingThreeDotsJumping from './LoadingThreeDots';

// Cute pulse animation for the loading circle
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

interface PageLoadingScreenProps {
  overlay?: boolean;
}

const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({ 
  overlay = true 
}) => {

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          position: overlay ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlay ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: overlay ? 'blur(4px)' : 'none',
          zIndex: overlay ? 9999 : 1,
          minHeight: overlay ? '100vh' : 120,
        }}
      >
        {/* Simple cute jumping dots */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: `${pulse} 2s ease-in-out infinite`
          }}
        >
          <LoadingThreeDotsJumping />
        </Box>
      </Box>
    </Fade>
  );
};

export default PageLoadingScreen;