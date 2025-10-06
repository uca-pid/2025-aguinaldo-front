import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import App from './App'
import { useAuthMachine } from './providers/AuthProvider'
import { useMachines } from './providers/MachineProvider'


// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

// Mock the providers
vi.mock('./providers/AuthProvider', () => ({
  useAuthMachine: vi.fn()
}))

vi.mock('./providers/MachineProvider', () => ({
  useMachines: vi.fn()
}))

// Mock all the components to avoid complex dependencies
vi.mock('./components/HomeScreen/HomeScreen', () => ({
  default: () => <div data-testid="home-screen">Home Screen</div>
}))

vi.mock('./components/Admin/PendingScreen/PendingScreen', () => ({
  default: () => <div data-testid="pending-screen">Pending Screen</div>
}))

vi.mock('./components/Admin/AdminPatients', () => ({
  default: () => <div data-testid="admin-patients">Admin Patients</div>
}))

vi.mock('./components/Admin/AdminDoctors', () => ({
  default: () => <div data-testid="admin-doctors">Admin Doctors</div>
}))

vi.mock('./components/ProfileScreen/ProfileScreen', () => ({
  default: () => <div data-testid="profile-screen">Profile Screen</div>
}))

vi.mock('./components/Patient/ReservationTurns', () => ({
  default: () => <div data-testid="reservation-turns">Reservation Turns</div>
}))

vi.mock('./components/Patient/ViewTurns', () => ({
  default: () => <div data-testid="view-turns">View Turns</div>
}))

vi.mock('./components/Patient/ModifyTurn', () => ({
  default: () => <div data-testid="modify-turn">Modify Turn</div>
}))

vi.mock('./components/Doctor/EnableHours/EnableHours', () => ({
  default: () => <div data-testid="enable-hours">Enable Hours</div>
}))

vi.mock('./components/Doctor/ViewPatients/ViewPatients', () => ({
  default: () => <div data-testid="view-patients">View Patients</div>
}))

vi.mock('./components/Doctor/DoctorViewTurns/DoctorViewTurns', () => ({
  default: () => <div data-testid="doctor-view-turns">Doctor View Turns</div>
}))

vi.mock('./components/Doctor/PatientDetails/PatientDetails', () => ({
  default: () => <div data-testid="patient-details">Patient Details</div>
}))

vi.mock('./components/shared/SnackbarAlert/SnackbarAlert', () => ({
  default: () => <div data-testid="snackbar-alert">Snackbar Alert</div>
}))

vi.mock('./components/Doctor/PendingActivation/PendingActivation', () => ({
  default: () => <div data-testid="pending-activation">Pending Activation</div>
}))

vi.mock('./components/Doctor/TurnsModifications/TurnsModifications', () => ({
  default: () => <div data-testid="turns-modifications">Turns Modifications</div>
}))

vi.mock('./components/shared/FloatingMenu/FloatingMenu', () => ({
  default: () => <div data-testid="floating-menu">Floating Menu</div>
}))

vi.mock('./components/shared/ConfirmationModal/ConfirmationModal', () => ({
  default: () => <div data-testid="confirmation-modal">Confirmation Modal</div>
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: null
        }
      }
    })

    ;(useMachines as Mock).mockReturnValue({
      uiSend: vi.fn()
    })
  })

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    expect(screen.getByTestId('snackbar-alert')).toBeInTheDocument()
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument()
  })

  it('shows header when user status is ACTIVE', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'PATIENT',
            status: 'ACTIVE'
          }
        }
      }
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('floating-menu')).toBeInTheDocument()
    expect(screen.getByText('MediBook')).toBeInTheDocument()
  })

  it('hides header when user status is not ACTIVE', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'PATIENT',
            status: 'PENDING'
          }
        }
      }
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(screen.queryByTestId('floating-menu')).not.toBeInTheDocument()
    expect(screen.queryByText('MediBook')).not.toBeInTheDocument()
  })

  it('renders admin routes for ADMIN role', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'ADMIN',
            status: 'ACTIVE'
          }
        }
      }
    })

    render(
      <MemoryRouter initialEntries={['/admin/pending']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('pending-screen')).toBeInTheDocument()
  })

  it('renders doctor routes for DOCTOR role', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'DOCTOR',
            status: 'ACTIVE'
          }
        }
      }
    })

    render(
      <MemoryRouter initialEntries={['/doctor/enable-hours']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('enable-hours')).toBeInTheDocument()
  })

  it('renders patient routes for PATIENT role', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'PATIENT',
            status: 'ACTIVE'
          }
        }
      }
    })

    render(
      <MemoryRouter initialEntries={['/patient/reservation-turns']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('reservation-turns')).toBeInTheDocument()
  })

  it('renders profile screen on /profile route', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('profile-screen')).toBeInTheDocument()
  })

  it('renders pending activation screen on /pending-activation route', () => {
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'DOCTOR',
            status: 'PENDING'
          }
        }
      }
    })

    render(
      <MemoryRouter initialEntries={['/pending-activation']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByTestId('pending-activation')).toBeInTheDocument()
  })

  it('navigates to home when clicking MediBook title', () => {
    const mockUiSend = vi.fn()
    ;(useAuthMachine as Mock).mockReturnValue({
      authState: {
        context: {
          authResponse: {
            role: 'PATIENT',
            status: 'ACTIVE'
          }
        }
      }
    })
    ;(useMachines as Mock).mockReturnValue({
      uiSend: mockUiSend
    })

    render(
      <MemoryRouter initialEntries={['/some-other-route']}>
        <App />
      </MemoryRouter>
    )

    const title = screen.getByText('MediBook')
    fireEvent.click(title)

    expect(mockUiSend).toHaveBeenCalledWith({
      type: 'NAVIGATE',
      to: '/'
    })
  })

  it('calls uiSend with ADD_NAVIGATE_HOOK on mount', () => {
    const mockUiSend = vi.fn()
    ;(useMachines as Mock).mockReturnValue({
      uiSend: mockUiSend
    })

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )

    expect(mockUiSend).toHaveBeenCalledWith({
      type: 'ADD_NAVIGATE_HOOK',
      navigate: expect.any(Function),
      initialPath: expect.any(String)
    })
  })
})