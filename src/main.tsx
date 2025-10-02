import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MachineProvider } from "./providers/MachineProvider";
import { AuthProvider } from "./providers/AuthProvider";
import AuthScreen from "./components/AuthScreen/AuthScreen";
import { useAuthMachine } from "./providers/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "./providers/DataProvider";
import LoginLoadingScreen from "./components/shared/LoadingScreens/LoginLoadingScreen";
import LogoutLoadingScreen from "./components/shared/LoadingScreens/LogoutLoadingScreen";

const AppRouter = () => {
  const { authState } = useAuthMachine();

  // Show login loading when authenticating
  if (authState?.context?.loading) {
    return <LoginLoadingScreen />;
  }

  // Show logout loading when logging out
  if (authState?.context?.loggingOut) {
    return <LogoutLoadingScreen />;
  }

  return authState?.context.isAuthenticated ? <App /> : <AuthScreen />;
};

const Root = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <MachineProvider>
            <StrictMode>
              <AppRouter />
            </StrictMode>
          </MachineProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);