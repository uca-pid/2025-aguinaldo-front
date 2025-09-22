import React, { createContext, useContext } from 'react';
import { AUTH_MACHINE_ID, AUTH_MACHINE_EVENT_TYPES, authMachine } from '../machines/authMachine';
import { orchestrator } from '#/core/Orchestrator';
import { useStateMachine } from '#/hooks/useStateMachine';

interface AuthMachineInstance {
  authState: any;
  authSend: (event: any) => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthMachineContext = createContext<AuthMachineInstance | null>(null);

orchestrator.registerMachine({
  id: AUTH_MACHINE_ID,
  machine: authMachine,
  eventTypes: AUTH_MACHINE_EVENT_TYPES,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { state: authState, send: authSend } = useStateMachine(AUTH_MACHINE_ID);

  const authMachine: AuthMachineInstance = {
    authState: authState,
    authSend: authSend
  };

  return (
    <AuthMachineContext.Provider value={authMachine}>
      {children}
    </AuthMachineContext.Provider>
  );
};

export const useAuthMachine = (): AuthMachineInstance => {
  const context = useContext(AuthMachineContext);
  if (!context) {
    throw new Error('useAuthMachine must be used within a AuthProvider');
  }
  return context;
};