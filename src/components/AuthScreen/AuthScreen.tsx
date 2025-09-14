import { Box } from "@mui/material";
import LoginScreen from "./LoginScreen/LoginScreen";
import RegisterScreen from "./RegisterScreen/RegisterScreen";
import { useAuthMachine } from "../../providers/AuthProvider";

function AuthScreen() {
    const { auth } = useAuthMachine();
    const { context: authContext} = auth;

    return (
        <Box>
            {authContext.mode === "login" ? <LoginScreen /> : <RegisterScreen />}
        </Box>
    );
}

export default AuthScreen;