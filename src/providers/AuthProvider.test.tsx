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

// Mock the auth machine
vi.mock('../machines/authMachine', () => ({
  AUTH_MACHINE_ID: 'auth-machine',
  AUTH_MACHINE_EVENT_TYPES: ['AUTH_EVENT_1', 'AUTH_EVENT_2'],
  authMachine: {
    id: 'auth-machine',
  },
}));

// Import the mocked module
import { useStateMachine } from '../hooks/useStateMachine';

// Import the provider AFTER the mocks
import { AuthProvider, useAuthMachine } from './AuthProvider';
import { AUTH_MACHINE_ID } from '../machines/authMachine';

// Test component that uses the auth machine hook
const TestComponent = () => {
  const { authState, authSend } = useAuthMachine();
  return (
    <div>
      <div data-testid="auth-state">{JSON.stringify(authState)}</div>
      <button
        data-testid="auth-send"
        onClick={() => authSend({ type: 'TEST_EVENT' })}
      >
        Send Event
      </button>
    </div>
  );
};

// Test component that throws error when used outside provider
const TestComponentOutsideProvider = () => {
  try {
    useAuthMachine();
    return <div>No error thrown</div>;
  } catch (error) {
    return <div data-testid="error">{(error as Error).message}</div>;
  }
};

describe('AuthProvider', () => {
  const mockAuthState = { value: 'idle', context: { user: null } };
  const mockAuthSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStateMachine as any).mockReturnValue({
      state: mockAuthState,
      send: mockAuthSend,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide authState and authSend through context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent(JSON.stringify(mockAuthState));
  });

  it('should render children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });

  it('should call authSend when send function is invoked', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const sendButton = screen.getByTestId('auth-send');
    sendButton.click();

    expect(mockAuthSend).toHaveBeenCalledWith({ type: 'TEST_EVENT' });
  });

  it('should throw error when useAuthMachine is used outside provider', () => {
    render(<TestComponentOutsideProvider />);

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useAuthMachine must be used within a AuthProvider'
    );
  });

  it('should call useStateMachine with correct machine ID', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(useStateMachine).toHaveBeenCalledWith(AUTH_MACHINE_ID);
  });

  it('should provide the correct machine instance structure', () => {
    let capturedContext: any = null;

    const CaptureContextComponent = () => {
      capturedContext = useAuthMachine();
      return <div>Captured</div>;
    };

    render(
      <AuthProvider>
        <CaptureContextComponent />
      </AuthProvider>
    );

    expect(capturedContext).toEqual({
      authState: mockAuthState,
      authSend: mockAuthSend,
    });
  });
});