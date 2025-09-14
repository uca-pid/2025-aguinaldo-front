import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { homeHeaderMachine,} from '../machines/homeHeaderMachine';
import type {HomeHeaderMachineContext, HomeHeaderMachineEvent} from '../machines/homeHeaderMachine';
import { uiMachine} from '../machines/uiMachine';
import type { UiMachineContext, UiMachineEvent } from '../machines/uiMachine';

interface MachineInstances {
  homeHeader: {
    state: any;
    send: (event: HomeHeaderMachineEvent) => void;
    context: HomeHeaderMachineContext;
  };
  ui: {
    state: any;
    send: (event: UiMachineEvent) => void;
    context: UiMachineContext;
  };
}

const MachineContext = createContext<MachineInstances | null>(null);

interface MachineProviderProps {
  children: ReactNode;
}

export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const [homeHeaderState, homeHeaderSend] = useMachine(homeHeaderMachine);
  const [uiState, uiSend] = useMachine(uiMachine);

  const machines: MachineInstances = {
    homeHeader: {
      state: homeHeaderState,
      send: homeHeaderSend,
      context: homeHeaderState.context
    },
    ui: {
      state: uiState,
      send: uiSend,
      context: uiState.context
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
