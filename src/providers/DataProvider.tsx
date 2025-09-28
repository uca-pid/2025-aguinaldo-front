import React, { createContext, useContext } from 'react';
import { DATA_MACHINE_ID, DATA_MACHINE_EVENT_TYPES, dataMachine } from '../machines/dataMachine';
import { orchestrator } from '#/core/Orchestrator';
import { useStateMachine } from '#/hooks/useStateMachine';

interface DataMachineInstance {
  dataState: any; 
  dataSend: (event: any) => void;
}
interface DataProviderProps {children: React.ReactNode;}
const DataMachineContext = createContext<DataMachineInstance | null>(null);

if (!orchestrator.isRegistered(DATA_MACHINE_ID)) {
  orchestrator.registerMachine({
    id: DATA_MACHINE_ID,
    machine: dataMachine,
    eventTypes: DATA_MACHINE_EVENT_TYPES,
  });
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { state: dataState, send: dataSend } = useStateMachine(DATA_MACHINE_ID);

  const dataMachine: DataMachineInstance = {
    dataState: dataState,
    dataSend: dataSend
  };

  return (
    <DataMachineContext.Provider value={dataMachine}>
      {children}
    </DataMachineContext.Provider>
  );
};

export const useDataMachine = (): DataMachineInstance => {
  const context = useContext(DataMachineContext);
  if (!context) {
    throw new Error('useDataMachine must be used within a DataProvider');
  }
  return context;
};