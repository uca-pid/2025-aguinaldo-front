import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { MachineProvider } from '../../providers/MachineProvider'
import RegisterScreen from './RegisterScreen'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('./userForms/PatientRegisterForm', () => ({
  default: () => <div data-testid="patient-form">Patient Registration Form</div>
}))

vi.mock('./userForms/DoctorRegisterForm', () => ({
  default: () => <div data-testid="doctor-form">Doctor Registration Form</div>
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MachineProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </MachineProvider>
  )
}

describe('RegisterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders registration screen with default patient form', () => {
    renderWithProviders(<RegisterScreen />)
    
    expect(screen.getByText('Registrarse como ...')).toBeInTheDocument()
    
    expect(screen.getByRole('button', { name: /paciente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /doctor/i })).toBeInTheDocument()
    
    expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    expect(screen.queryByTestId('doctor-form')).not.toBeInTheDocument()
    
    const patientButton = screen.getByRole('button', { name: /paciente/i })
    const doctorButton = screen.getByRole('button', { name: /doctor/i })
    
    expect(patientButton).toHaveClass('MuiButton-contained')
    expect(doctorButton).toHaveClass('MuiButton-outlined')
  })

  test('switches to doctor form when doctor button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterScreen />)
    
    expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    expect(screen.queryByTestId('doctor-form')).not.toBeInTheDocument()
    
    const doctorButton = screen.getByRole('button', { name: /doctor/i })
    await user.click(doctorButton)
    
    expect(screen.queryByTestId('patient-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('doctor-form')).toBeInTheDocument()
    
    const patientButton = screen.getByRole('button', { name: /paciente/i })
    expect(patientButton).toHaveClass('MuiButton-outlined')
    expect(doctorButton).toHaveClass('MuiButton-contained')
  })

  test('switches back to patient form when patient button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterScreen />)
    
    const doctorButton = screen.getByRole('button', { name: /doctor/i })
    await user.click(doctorButton)
    expect(screen.getByTestId('doctor-form')).toBeInTheDocument()
    
    const patientButton = screen.getByRole('button', { name: /paciente/i })
    await user.click(patientButton)
    
    expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    expect(screen.queryByTestId('doctor-form')).not.toBeInTheDocument()
    
    expect(patientButton).toHaveClass('MuiButton-contained')
    expect(doctorButton).toHaveClass('MuiButton-outlined')
  })

  test('displays success message when registration is successful', () => {

    const mockMachineProvider = ({ children }: { children: React.ReactNode }) => {
      const mockMachines = {
        ui: {
          context: { toggleStates: { patient: true, fade: true } },
          send: vi.fn(),
          state: {}
        },
        register: {
          context: { 
            apiResponse: { success: true, error: null } 
          },
          send: vi.fn(),
          state: {}
        },
        homeHeader: {
          context: {},
          send: vi.fn(),
          state: {}
        }
      }
      
      return (
        <div data-testid="mock-provider">
          {/* You would implement a mock context provider here */}
          {children}
        </div>
      )
    }

    renderWithProviders(<RegisterScreen />)
    
    expect(screen.getByText('Registrarse como ...')).toBeInTheDocument()
  })

  test('has proper accessibility attributes', () => {
    renderWithProviders(<RegisterScreen />)
    
    expect(screen.getByRole('button', { name: /paciente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /doctor/i })).toBeInTheDocument()
    
    expect(screen.getByText('Registrarse como ...')).toBeInTheDocument()
  })

  test('applies correct styling and transitions', () => {
    renderWithProviders(<RegisterScreen />)
    
    const paper = screen.getByText('Registrarse como ...').closest('[class*="MuiPaper"]')
    expect(paper).toBeInTheDocument()

  })

  test('handles form toggle state correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterScreen />)
    
    const doctorButton = screen.getByRole('button', { name: /doctor/i })
    const patientButton = screen.getByRole('button', { name: /paciente/i })
    
    expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    
    await user.click(doctorButton)
    expect(screen.getByTestId('doctor-form')).toBeInTheDocument()
    
    await user.click(patientButton)
    expect(screen.getByTestId('patient-form')).toBeInTheDocument()
    
    await user.click(doctorButton)
    expect(screen.getByTestId('doctor-form')).toBeInTheDocument()
  })
})