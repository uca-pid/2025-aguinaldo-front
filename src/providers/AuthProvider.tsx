import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { authMachine } from '../machines/authMachine';
import type { AuthMachineContext, AuthMachineEvent } from '../machines/authMachine';

interface AuthMachineInstance {
  auth: {
    state: any;
    send: (event: AuthMachineEvent) => void;
    context: AuthMachineContext;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}

const AuthMachineContext = createContext<AuthMachineInstance | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, authSend] = useMachine(authMachine);

  const machines: AuthMachineInstance = {
    auth: {
      state: authState,
      send: authSend,
      context: authState.context,
      isAuthenticated: authState.context.isAuthenticated,
      isLoading: authState.matches('checkingAuth') || authState.matches('submitting')
    },
  };

  return (
    <AuthMachineContext.Provider value={machines}>
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