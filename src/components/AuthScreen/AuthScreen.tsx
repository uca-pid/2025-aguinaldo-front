import { Box } from "@mui/material";
import LoginScreen from "./LoginScreen/LoginScreen";
import RegisterScreen from "./RegisterScreen/RegisterScreen";
import { useAuthMachine } from "#/providers/AuthProvider";

function AuthScreen() {
    const {authState} = useAuthMachine();

    // Handle loading state when authState is null
    if (!authState) {
        return (
            <Box>
                Loading authentication state...
            </Box>
        );
    }

    // Handle case where authState exists but context is undefined
    if (!authState.context) {
        console.error('AuthState exists but context is undefined:', authState);
        return (
            <Box>
                Error: Authentication context not available
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