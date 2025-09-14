import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { homeHeaderMachine,} from '../machines/homeHeaderMachine';
import type {HomeHeaderMachineContext, HomeHeaderMachineEvent} from '../machines/homeHeaderMachine';
import { registerMachine } from '../machines/registerMachine';
import type { RegisterMachineContext, RegisterMachineEvent } from '../machines/registerMachine';
import { uiMachine} from '../machines/uiMachine';
import type { UiMachineContext, UiMachineEvent } from '../machines/uiMachine';
import { showTurnReservationMachine } from '../machines/showTurnsReservationsMachine';
import type { ShowTurnsReservationsMachineContext,ShowTurnsReservationsMachineEvent } from '../machines/showTurnsReservationsMachine';
import { takeTurnPacientMachine, type TakeTurnPatientMachineContext, type TakeTurnPatientMachineEvent } from '../machines/takeTurnPatientMachine';

interface MachineInstances {
  homeHeader: {
    state: any;
    send: (event: HomeHeaderMachineEvent) => void;
    context: HomeHeaderMachineContext;
  };
  register: {
    state: any;
    send: (event: RegisterMachineEvent) => void;
    context: RegisterMachineContext;
  };
  ui: {
    state: any;
    send: (event: UiMachineEvent) => void;
    context: UiMachineContext;
  };
  takeTurnsReservation:{
    state:any;
    send: (event: TakeTurnPatientMachineEvent) => void;
    context: TakeTurnPatientMachineContext;
  };
  showTurnsReservation:{
    state:any;
    send: (event: ShowTurnsReservationsMachineEvent) => void;
    context: ShowTurnsReservationsMachineContext;
  };
}

const MachineContext = createContext<MachineInstances | null>(null);

interface MachineProviderProps {
  children: ReactNode;
}

export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const [homeHeaderState, homeHeaderSend] = useMachine(homeHeaderMachine);
  const [registerState, registerSend] = useMachine(registerMachine);
  const [uiState, uiSend] = useMachine(uiMachine);
  const [turnsReservationState, turnsReservationSend] = useMachine(takeTurnPacientMachine);
  const[showTurnsReservationState, showTurnsReservationSend]= useMachine(showTurnReservationMachine);

  const machines: MachineInstances = {
    homeHeader: {
      state: homeHeaderState,
      send: homeHeaderSend,
      context: homeHeaderState.context
    },
    register: {
      state: registerState,
      send: registerSend,
      context: registerState.context
    },
    ui: {
      state: uiState,
      send: uiSend,
      context: uiState.context
    },
    takeTurnsReservation:{
      state:turnsReservationState,
      send: turnsReservationSend,
      context: turnsReservationState.context
    },
    showTurnsReservation:{
      state:showTurnsReservationState,
      send: showTurnsReservationSend,
      context: showTurnsReservationState.context
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
