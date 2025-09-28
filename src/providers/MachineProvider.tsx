import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { orchestrator } from '#/core/Orchestrator';
import { useStateMachine } from '#/hooks/useStateMachine';
import { uiMachine, UI_MACHINE_ID, UI_MACHINE_EVENT_TYPES, type UiMachineEvent } from '../machines/uiMachine';
import { turnMachine, TURN_MACHINE_ID, TURN_MACHINE_EVENT_TYPES, type TurnMachineEvent } from '../machines/turnMachine';
import doctorMachine, { DOCTOR_MACHINE_ID, DOCTOR_MACHINE_EVENT_TYPES, type DoctorMachineEvent } from '../machines/doctorMachine';
import { adminUserMachine, ADMIN_USER_MACHINE_ID, ADMIN_USER_MACHINE_EVENT_TYPES } from '#/machines/adminUserMachine';
import { profileMachine, PROFILE_MACHINE_ID, PROFILE_MACHINE_EVENT_TYPES, type ProfileMachineEvent } from '../machines/profileMachine';
import { dataMachine, DATA_MACHINE_ID, DATA_MACHINE_EVENT_TYPES, type DataMachineEvent } from '../machines/dataMachine';


interface MachineInstances {
    uiState: any;
    uiSend: (event: UiMachineEvent) => void;
    turnState: any;
    turnSend: (event: TurnMachineEvent) => void;
    doctorState: any;
    doctorSend: (event: DoctorMachineEvent) => void;
    adminUserState: any;
    adminUserSend: (event: any) => void;
    profileState: any;
    profileSend: (event: ProfileMachineEvent) => void;
    dataState: any;
    dataSend: (event: DataMachineEvent) => void;
}

interface MachineProviderProps {
  children: ReactNode;
}

const MachineContext = createContext<MachineInstances | null>(null);

// Register machines only if not already registered (prevents hot reload duplicates)
if (!orchestrator.isRegistered(UI_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: UI_MACHINE_ID,
    machine: uiMachine,
    eventTypes: UI_MACHINE_EVENT_TYPES
  });
}

if (!orchestrator.isRegistered(TURN_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: TURN_MACHINE_ID,
    machine: turnMachine,
    eventTypes: TURN_MACHINE_EVENT_TYPES
  });
}

if (!orchestrator.isRegistered(DOCTOR_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: DOCTOR_MACHINE_ID,
    machine: doctorMachine,
    eventTypes: DOCTOR_MACHINE_EVENT_TYPES
  });
}

if (!orchestrator.isRegistered(ADMIN_USER_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: ADMIN_USER_MACHINE_ID,
    machine: adminUserMachine,
    eventTypes: ADMIN_USER_MACHINE_EVENT_TYPES
  });
}

if (!orchestrator.isRegistered(PROFILE_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: PROFILE_MACHINE_ID,
    machine: profileMachine,
    eventTypes: PROFILE_MACHINE_EVENT_TYPES
  });
}

if (!orchestrator.isRegistered(DATA_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: DATA_MACHINE_ID,
    machine: dataMachine,
    eventTypes: DATA_MACHINE_EVENT_TYPES
  });
}




export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const { state: uiState, send: uiSend } = useStateMachine(UI_MACHINE_ID);
  const { state: turnState, send: turnSend } = useStateMachine(TURN_MACHINE_ID);
  const { state: doctorState, send: doctorSend } = useStateMachine(DOCTOR_MACHINE_ID);
  const { state: adminUserState, send: adminUserSend } = useStateMachine(ADMIN_USER_MACHINE_ID);
  const { state: profileState, send: profileSend } = useStateMachine(PROFILE_MACHINE_ID);
  const { state: dataState, send: dataSend } = useStateMachine(DATA_MACHINE_ID);


  const machines: MachineInstances = {
      uiState: uiState,
      uiSend: uiSend,
      turnState: turnState,
      turnSend: turnSend,
      doctorState: doctorState,
      doctorSend: doctorSend,
      adminUserState: adminUserState,
      adminUserSend: adminUserSend,
      profileState: profileState,
      profileSend: profileSend,
      dataState: dataState,
      dataSend: dataSend
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
