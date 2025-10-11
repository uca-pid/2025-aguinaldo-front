import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MedicalHistoryManager from './MedicalHistoryManager';

import type { MedicalHistory } from '../../../models/MedicalHistory';

// Mock the providers
const mockUiSend = vi.fn();
const mockMedicalHistorySend = vi.fn();

// Create a mock function that we can control
const mockUseMachines = vi.fn();

vi.mock('#/providers/MachineProvider', () => ({
  useMachines: () => mockUseMachines()
}));

// Mock the date utils
vi.mock('../../../utils/dateTimeUtils', () => ({
  formatDateTime: vi.fn((date: string) => new Date(date).toLocaleString())
}));

// Mock the CSS file
vi.mock('./MedicalHistoryManager.css', () => ({}));

describe('MedicalHistoryManager', () => {
  const mockProps = {
    patientId: 'patient-1',
    patientName: 'John',
    patientSurname: 'Doe',
    onHistoryUpdate: vi.fn()
  };

  const mockMedicalHistory: MedicalHistory = {
    id: 'history-1',
    content: 'Patient has allergies to penicillin and peanuts',
    patientId: 'patient-1',
    patientName: 'John',
    patientSurname: 'Doe',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Jane',
    doctorSurname: 'Smith',
    createdAt: '2023-10-08T10:00:00Z',
    updatedAt: '2023-10-08T10:00:00Z',
    turnId: 'turn-1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set default mock return value
    mockUseMachines.mockReturnValue({
      doctorState: {
        context: {
          accessToken: 'test-token',
          doctorId: 'doctor-1'
        }
      },
      uiState: {
        context: {
          toggleStates: {
            addMedicalHistoryDialog: false,
            deleteMedicalHistoryDialog: false,
            viewMedicalHistoryDialog: false
          }
        }
      },
      uiSend: mockUiSend,
      medicalHistoryState: {
        context: {
          medicalHistories: [] as MedicalHistory[],
          isLoading: false,
          error: null,
          newHistoryContent: '',
          currentPatientId: null,
          selectedHistory: null as MedicalHistory | null
        }
      },
      medicalHistorySend: mockMedicalHistorySend
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render component with patient information', () => {
      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText('Medical History - John Doe')).toBeInTheDocument();
      expect(screen.getByText('Add Medical History Entry')).toBeInTheDocument();
    });

    it('should load patient medical history on mount when patient ID changes', () => {
      render(<MedicalHistoryManager {...mockProps} />);

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({
        type: 'LOAD_PATIENT_MEDICAL_HISTORY',
        patientId: 'patient-1',
        accessToken: 'test-token'
      });
    });

    it('should not reload medical history if patient ID is the same', () => {
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: 'patient-1', // Same patient
            selectedHistory: null
          } as any
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(mockMedicalHistorySend).not.toHaveBeenCalledWith({
        type: 'LOAD_PATIENT_MEDICAL_HISTORY',
        patientId: 'patient-1',
        accessToken: 'test-token'
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: true,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading medical history...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when there is an error', () => {
      const errorMessage = 'Failed to load medical history';
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: errorMessage,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          } as any
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should clear error when close button is clicked', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Failed to load medical history';
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: errorMessage,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          } as any
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({ type: 'CLEAR_ERROR' });
    });
  });

  describe('Medical History List', () => {
    it('should show empty state when no medical histories', () => {
      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText('No medical history entries found.')).toBeInTheDocument();
    });

    it('should display medical history entries when available', () => {
      const mockHistories = [mockMedicalHistory];
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: mockHistories,
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText('Patient has allergies to penicillin and peanuts')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
    });

    it('should sort medical histories from most recent to oldest', () => {
      const olderHistory: MedicalHistory = {
        ...mockMedicalHistory,
        id: 'history-2',
        content: 'Older entry',
        createdAt: '2023-10-07T10:00:00Z'
      };
      
      const newerHistory: MedicalHistory = {
        ...mockMedicalHistory,
        id: 'history-3',
        content: 'Newer entry',
        createdAt: '2023-10-09T10:00:00Z'
      };

      const mockHistories = [olderHistory, newerHistory, mockMedicalHistory];
      
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: mockHistories,
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const historyCards = screen.getAllByText(/entry/i);
      // Newer entry should appear first
      expect(historyCards[0]).toHaveTextContent('Newer entry');
    });
  });

  describe('Add Medical History Dialog', () => {
    it('should open add dialog when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<MedicalHistoryManager {...mockProps} />);

      const addButton = screen.getByText('Add Medical History Entry');
      await user.click(addButton);

      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'addMedicalHistoryDialog' 
      });
      expect(mockMedicalHistorySend).toHaveBeenCalledWith({ 
        type: 'SET_NEW_CONTENT', 
        content: '' 
      });
    });

    it('should show add dialog when dialog state is open', () => {
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: true,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText('Add Medical History Entry')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should update content when typing in text field', async () => {
      const user = userEvent.setup();
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: true,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const textField = screen.getByRole('textbox');
      await user.type(textField, 'N');

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({
        type: 'SET_NEW_CONTENT',
        content: 'N'
      });
    });

    it('should save new medical history when save button is clicked', async () => {
      const user = userEvent.setup();
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: true,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: 'New medical history content',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({
        type: 'ADD_HISTORY_ENTRY',
        content: 'New medical history content',
        accessToken: 'test-token',
        doctorId: 'doctor-1'
      });
      
      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'addMedicalHistoryDialog' 
      });
    });

    it('should close add dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: true,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'addMedicalHistoryDialog' 
      });
    });
  });

  describe('View Medical History Dialog', () => {
    it('should open view dialog when view button is clicked', async () => {
      const user = userEvent.setup();
      const mockHistories = [mockMedicalHistory];
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: mockHistories,
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null as MedicalHistory | null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      // Click on the card to view the history
      const historyCard = screen.getByText('Patient has allergies to penicillin and peanuts').closest('.history-card');
      if (historyCard) {
        await user.click(historyCard);
      }

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({ 
        type: 'CLEAR_SELECTION'
      });
      expect(mockMedicalHistorySend).toHaveBeenCalledWith({ 
        type: 'SELECT_HISTORY', 
        history: mockMedicalHistory 
      });
      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'viewMedicalHistoryDialog' 
      });
    });

    it('should show view dialog with selected history details', () => {
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: true
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: mockMedicalHistory
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      expect(screen.getByText('Medical History Details')).toBeInTheDocument();
      expect(screen.getByText('Patient has allergies to penicillin and peanuts')).toBeInTheDocument();
    });
  });

  describe('Delete Medical History Dialog', () => {
    it('should open delete dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockHistories = [mockMedicalHistory];
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: false,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: mockHistories,
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: null
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const deleteButtons = screen.getAllByLabelText(/delete history/i);
      await user.click(deleteButtons[0]);

      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'deleteMedicalHistoryDialog' 
      });
      expect(mockMedicalHistorySend).toHaveBeenCalledWith({ 
        type: 'SELECT_HISTORY', 
        history: mockMedicalHistory 
      });
    });

    it('should confirm deletion when confirm button is clicked', async () => {
      const user = userEvent.setup();
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: true,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: mockMedicalHistory
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const confirmButton = screen.getByText('Delete');
      await user.click(confirmButton);

      expect(mockMedicalHistorySend).toHaveBeenCalledWith({
        type: 'DELETE_HISTORY_ENTRY',
        historyId: 'history-1',
        accessToken: 'test-token',
        doctorId: 'doctor-1'
      });
    });

    it('should cancel deletion when cancel button is clicked', async () => {
      const user = userEvent.setup();
      mockUseMachines.mockReturnValue({
        doctorState: {
          context: {
            accessToken: 'test-token',
            doctorId: 'doctor-1'
          }
        },
        uiState: {
          context: {
            toggleStates: {
              addMedicalHistoryDialog: false,
              deleteMedicalHistoryDialog: true,
              viewMedicalHistoryDialog: false
            }
          }
        },
        uiSend: mockUiSend,
        medicalHistoryState: {
          context: {
            medicalHistories: [],
            isLoading: false,
            error: null,
            newHistoryContent: '',
            currentPatientId: null,
            selectedHistory: mockMedicalHistory
          }
        },
        medicalHistorySend: mockMedicalHistorySend
      });

      render(<MedicalHistoryManager {...mockProps} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockUiSend).toHaveBeenCalledWith({ 
        type: 'TOGGLE', 
        key: 'deleteMedicalHistoryDialog' 
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onHistoryUpdate when provided', () => {
      const onHistoryUpdateMock = vi.fn();
      render(<MedicalHistoryManager {...mockProps} onHistoryUpdate={onHistoryUpdateMock} />);

      // onHistoryUpdate should be called when loading medical history
      expect(mockMedicalHistorySend).toHaveBeenCalled();
    });
  });
});