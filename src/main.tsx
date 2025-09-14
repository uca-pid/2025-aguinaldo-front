import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MachineProvider } from "./providers/MachineProvider";
import { AuthProvider } from "./providers/AuthProvider";
import AuthScreen from "./components/AuthScreen/AuthScreen";
import { useAuthMachine } from "./providers/AuthProvider";
import { CircularProgress, Box } from "@mui/material";

const AppRouter = () => {
  const { auth } = useAuthMachine();
  
  if (auth.isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #0d2230 0%, #22577a 25%, #38a3a5 50%, #57cc99 75%, #c7f9cc 100%)'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#38a3a5' }} />
      </Box>
    );
  }
  
  return auth.isAuthenticated ? <App /> : <AuthScreen />;
};

const Root = () => {
  return (
    <AuthProvider>
      <MachineProvider>
        <StrictMode>
          <AppRouter />
        </StrictMode>
      </MachineProvider>
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);