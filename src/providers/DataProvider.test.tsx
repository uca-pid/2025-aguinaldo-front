import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the orchestrator BEFORE importing the provider
vi.mock('../core/Orchestrator', () => ({
  orchestrator: {
    registerMachine: vi.fn(),
  },
}));

// Mock the useStateMachine hook
vi.mock('../hooks/useStateMachine', () => ({
  useStateMachine: vi.fn(),
}));

// Mock the data machine
vi.mock('../machines/dataMachine', () => ({
  DATA_MACHINE_ID: 'data-machine',
  DATA_MACHINE_EVENT_TYPES: ['DATA_EVENT_1', 'DATA_EVENT_2'],
  dataMachine: {
    id: 'data-machine',
  },
}));

// Import the mocked module
import { useStateMachine } from '../hooks/useStateMachine';

// Import the provider AFTER the mocks
import { DataProvider, useDataMachine } from './DataProvider';
import { DATA_MACHINE_ID } from '../machines/dataMachine';

// Test component that uses the data machine hook
const TestComponent = () => {
  const { dataState, dataSend } = useDataMachine();
  return (
    <div>
      <div data-testid="data-state">{JSON.stringify(dataState)}</div>
      <button
        data-testid="data-send"
        onClick={() => dataSend({ type: 'TEST_EVENT' })}
      >
        Send Event
      </button>
    </div>
  );
};

// Test component that throws error when used outside provider
const TestComponentOutsideProvider = () => {
  try {
    useDataMachine();
    return <div>No error thrown</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
};

describe('DataProvider', () => {
  const mockDataState = { value: 'idle', context: { data: null } };
  const mockDataSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStateMachine as any).mockReturnValue({
      state: mockDataState,
      send: mockDataSend,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide dataState and dataSend through context', () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(screen.getByTestId('data-state')).toHaveTextContent(JSON.stringify(mockDataState));
  });

  it('should render children correctly', () => {
    render(
      <DataProvider>
        <div data-testid="child">Test Child</div>
      </DataProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });

  it('should call dataSend when send function is invoked', () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    const sendButton = screen.getByTestId('data-send');
    sendButton.click();

    expect(mockDataSend).toHaveBeenCalledWith({ type: 'TEST_EVENT' });
  });

  it('should throw error when useDataMachine is used outside provider', () => {
    render(<TestComponentOutsideProvider />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useDataMachine must be used within a DataProvider'
    );
  });

  it('should call useStateMachine with correct machine ID', () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(useStateMachine).toHaveBeenCalledWith(DATA_MACHINE_ID);
  });

  it('should provide the correct machine instance structure', () => {
    let capturedContext: any = null;

    const CaptureContextComponent = () => {
      capturedContext = useDataMachine();
      return <div>Captured</div>;
    };

    render(
      <DataProvider>
        <CaptureContextComponent />
      </DataProvider>
    );

    expect(capturedContext).toEqual({
      dataState: mockDataState,
      dataSend: mockDataSend,
    });
  });
});