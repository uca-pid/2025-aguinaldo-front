import { Box } from "@mui/material";
import LoginScreen from "./LoginScreen/LoginScreen";
import RegisterScreen from "./RegisterScreen/RegisterScreen";
import { useAuthMachine } from "#/providers/AuthProvider";
import LoadingThreeDotsJumping from "../shared/PageLoadingScreen/LoadingThreeDots";

function AuthScreen() {
    const {authState} = useAuthMachine();

    // Handle loading state when authState is null
    if (!authState) {
        return (
            <Box 
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }}
          >
            <LoadingThreeDotsJumping />
          </Box>
        );
    }

    // Handle case where authState exists but context is undefined
    if (!authState.context) {
        console.error('AuthState exists but context is undefined:', authState);
        return (
            <Box 
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }}
          >
            <LoadingThreeDotsJumping />
          </Box>
        );
    }

    const mode = authState.context.mode || "login";

    return (
        <Box>
            {mode === "login" ? <LoginScreen /> : <RegisterScreen />}
        </Box>
    );
}

export default AuthScreen;