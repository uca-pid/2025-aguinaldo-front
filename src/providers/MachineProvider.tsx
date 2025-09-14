import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { uiMachine} from '../machines/uiMachine';
import type { UiMachineContext, UiMachineEvent } from '../machines/uiMachine';
import { turnMachine, type TurnMachineContext, type TurnMachineEvent } from '../machines/turnMachine';

interface MachineInstances {
  ui: {
    state: any;
    send: (event: UiMachineEvent) => void;
    context: UiMachineContext;
  };
  turn:{
    state:any;
    send: (event: TurnMachineEvent) => void;
    context: TurnMachineContext;
  };
}

const MachineContext = createContext<MachineInstances | null>(null);

interface MachineProviderProps {
  children: ReactNode;
}

export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const [uiState, uiSend] = useMachine(uiMachine);
  const [turnState, turnSend] = useMachine(turnMachine);

  const machines: MachineInstances = {
    ui: {
      state: uiState,
      send: uiSend,
      context: uiState.context
    },
    turn:{
      state:turnState,
      send: turnSend,
      context: turnState.context
    }
    
  };

  return (
    <MachineContext.Provider value={machines}>
      {children}
    </MachineContext.Provider>
  );
};

export const useMachines = (): MachineInstances => {
  const context = useContext(MachineContext);
  if (!context) {
    throw new Error('useMachines must be used within a MachineProvider');
  }
  return context;
};
