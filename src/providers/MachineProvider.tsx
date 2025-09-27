import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { orchestrator } from '#/core/Orchestrator';
import { useStateMachine } from '#/hooks/useStateMachine';
import { uiMachine, UI_MACHINE_ID, UI_MACHINE_EVENT_TYPES, type UiMachineEvent } from '../machines/uiMachine';
import { turnMachine, TURN_MACHINE_ID, TURN_MACHINE_EVENT_TYPES, type TurnMachineEvent } from '../machines/turnMachine';
import doctorMachine, { DOCTOR_MACHINE_ID, DOCTOR_MACHINE_EVENT_TYPES, type DoctorMachineEvent } from '../machines/doctorMachine';
import { adminUserMachine, ADMIN_USER_MACHINE_ID, ADMIN_USER_MACHINE_EVENT_TYPES } from '#/machines/adminUserMachine';
import { profileMachine, PROFILE_MACHINE_ID, PROFILE_MACHINE_EVENT_TYPES, type ProfileMachineEvent } from '../machines/profileMachine';
import patientDetailsMachine, { PATIENT_DETAILS_MACHINE_ID, PATIENT_DETAILS_MACHINE_EVENT_TYPES, type PatientDetailsMachineEvent } from '../machines/patientDetailsMachine';

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
    patientDetailsState: any;
    patientDetailsSend: (event: PatientDetailsMachineEvent) => void;
}

interface MachineProviderProps {
  children: ReactNode;
}

const MachineContext = createContext<MachineInstances | null>(null);

orchestrator.registerMachine({
  id: UI_MACHINE_ID,
  machine: uiMachine,
  eventTypes: UI_MACHINE_EVENT_TYPES
});

orchestrator.registerMachine({
  id: TURN_MACHINE_ID,
  machine: turnMachine,
  eventTypes: TURN_MACHINE_EVENT_TYPES
});

orchestrator.registerMachine({
  id: DOCTOR_MACHINE_ID,
  machine: doctorMachine,
  eventTypes: DOCTOR_MACHINE_EVENT_TYPES
});

orchestrator.registerMachine({
  id: ADMIN_USER_MACHINE_ID,
  machine: adminUserMachine,
  eventTypes: ADMIN_USER_MACHINE_EVENT_TYPES
});

orchestrator.registerMachine({
  id: PROFILE_MACHINE_ID,
  machine: profileMachine,
  eventTypes: PROFILE_MACHINE_EVENT_TYPES
});

orchestrator.registerMachine({
  id: PATIENT_DETAILS_MACHINE_ID,
  machine: patientDetailsMachine,
  eventTypes: PATIENT_DETAILS_MACHINE_EVENT_TYPES
});

export const MachineProvider: React.FC<MachineProviderProps> = ({ children }) => {
  const { state: uiState, send: uiSend } = useStateMachine(UI_MACHINE_ID);
  const { state: turnState, send: turnSend } = useStateMachine(TURN_MACHINE_ID);
  const { state: doctorState, send: doctorSend } = useStateMachine(DOCTOR_MACHINE_ID);
  const { state: adminUserState, send: adminUserSend } = useStateMachine(ADMIN_USER_MACHINE_ID);
  const { state: profileState, send: profileSend } = useStateMachine(PROFILE_MACHINE_ID);
  const { state: patientDetailsState, send: patientDetailsSend } = useStateMachine(PATIENT_DETAILS_MACHINE_ID);

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
      patientDetailsState: patientDetailsState,
      patientDetailsSend: patientDetailsSend
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
