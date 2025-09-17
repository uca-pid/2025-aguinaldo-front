import React, { createContext,useContext } from 'react';
import type { ReactNode } from 'react';
import { useMachine } from '@xstate/react';
import { uiMachine} from '../machines/uiMachine';
import type { UiMachineContext, UiMachineEvent } from '../machines/uiMachine';
import { turnMachine, type TurnMachineContext, type TurnMachineEvent } from '../machines/turnMachine';
import doctorMachine, { type DoctorMachineContext, type DoctorMachineEvent } from '../machines/doctorMachine';
import { adminUserMachine } from '#/machines/adminUserMachine';
import { useNavigate } from 'react-router-dom';

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
  doctor: {
    state:any;
    send: (event: DoctorMachineEvent) => void;
    context: DoctorMachineContext;
  };
  adminUser: {
    state:any;
    send: (event: any) => void;
    context: any;
  };
}

const MachineContext = createContext<MachineInstances | null>(null);

interface MachineProviderProps {
  children: ReactNode;
}

export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [uiState, uiSend] = useMachine(uiMachine, { input: { navigate } });
  const [turnState, turnSend] = useMachine(turnMachine);
  const [doctorState, doctorSend] = useMachine(doctorMachine);
  const [adminUserState, adminUserSend] = useMachine(adminUserMachine);

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
    },
    doctor: {
      state: doctorState,
      send: doctorSend,
      context: doctorState.context
    },
    adminUser: {
      state: adminUserState,
      send: adminUserSend,
      context: adminUserState.context
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
