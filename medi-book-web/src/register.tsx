import { useState } from 'react'
import './register.css'

function Register() {
  const [activeForm, setActiveForm] = useState<'doctor' | 'patient'>('patient')
  const [fade, setFade] = useState<'in' | 'out'>('in')
  const [pendingForm, setPendingForm] = useState<'doctor' | 'patient' | null>(null)
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())
  const [passwords, setPasswords] = useState<{[key: string]: string}>({})
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({})

  const getMaxDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMinDate = () => {
    const today = new Date()
    const minDate = new Date(today.getFullYear() - 110, today.getMonth(), today.getDate())
    return minDate.toISOString().split('T')[0]
  }

   const handleSwitch = (form: 'doctor' | 'patient') => {
    if (form !== activeForm) {
      setFade('out')
      setPendingForm(form)
      // Clear all form data
      setInvalidFields(new Set())
      setPasswords({})
      setValidationMessages({})
      // Clear all input values
      const inputs = document.querySelectorAll('input')
      inputs.forEach((input: HTMLInputElement) => {
        input.value = ''
      })
    }
  }

  const handleTransitionEnd = () => {
    if (fade === 'out' && pendingForm) {
      setActiveForm(pendingForm)
      setFade('in')
      setPendingForm(null)
    }
  }

  const validateField = (name: string, value: string) => {
  let message = ''

  if (value.trim() === '') {
    message = 'This field is required'
    setInvalidFields(prev => new Set(prev).add(name))
  } 

  else if ((name === 'doctor-first-name' || 
              name === 'doctor-last-name' || 
              name === 'patient-first-name' || 
              name === 'patient-last-name') && 
              value.length > 20) {
    message = 'Maximum 20 characters allowed'
    setInvalidFields(prev => new Set(prev).add(name))
  }

  else if (name === 'patient-identity-number') {
    const numStr = value.toString()
    if (numStr.length !== 8) {
      message = 'Must be exactly 8 digits'
      setInvalidFields(prev => new Set(prev).add(name))
    }
  } 

  else if (name === 'patient-birthdate' || name === 'doctor-birthdate') {
    const selectedDate = new Date(value)
    const today = new Date()
    const minDate = new Date(today.getFullYear() - 110, today.getMonth(), today.getDate())
    
    if (selectedDate > today) {
      message = 'Date cannot be in the future'
      setInvalidFields(prev => new Set(prev).add(name))
    } else if (selectedDate < minDate) {
      message = 'Date cannot be more than 110 years ago'
      setInvalidFields(prev => new Set(prev).add(name))
    }
  } 

  else if (name === 'patient-mail' || name === 'doctor-mail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      message = 'Please enter a valid email address'
      setInvalidFields(prev => new Set(prev).add(name))
    }
  } 
  
  else if (name.includes('password') && !name.includes('confirm')) {
    if (value.length < 6) {
      message = 'Password must be at least 6 characters'
    }

    setPasswords(prev => ({...prev, [name]: value}))
    const confirmName = `${name.split('-')[0]}-confirm-password`
    const confirmValue = passwords[confirmName]
    if (confirmValue) {
      setValidationMessages(prev => ({
        ...prev,
        [confirmName]: confirmValue !== value ? 'Passwords do not match' : ''
      }))
    }
  }
  
  else if (name.includes('confirm-password')) {
    const mainPasswordName = name.replace('confirm-', '')
    const mainPassword = passwords[mainPasswordName]
    if (value !== mainPassword) {
      message = 'Passwords do not match'
    }
  }

  setValidationMessages(prev => ({
    ...prev,
    [name]: message
  }))

  if (!message) {
    setInvalidFields(prev => {
      const newSet = new Set(prev)
      newSet.delete(name)
      return newSet
    })
  }
}

const isFormValid = (formType: 'doctor' | 'patient'): boolean => {
    const requiredFields = {
      doctor: [
        'doctor-first-name',
        'doctor-last-name',
        'doctor-registration-number',
        'doctor-birthdate',
        'doctor-mail',
        'doctor-password',
        'doctor-confirm-password'
      ],
      patient: [
        'patient-first-name',
        'patient-last-name',
        'patient-identity-number',
        'patient-birthdate',
        'patient-mail',
        'patient-password',
        'patient-confirm-password'
      ]
    }

    // Check if any field is invalid
    const hasInvalidFields = Array.from(invalidFields).some(field => 
      field.startsWith(formType)
    )
    if (hasInvalidFields) return false

    // Check if all required fields have been touched and validated
    const fieldsToCheck = requiredFields[formType]
    const allFieldsFilled = fieldsToCheck.every(field => {
      const message = validationMessages[field]
      // Field is valid if it has been touched (has a validation message) and the message is empty
      return message !== undefined && message === ''
    })

    return allFieldsFilled
  }

  const preventPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    validateField(name, value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() 
    const formData = new FormData(e.currentTarget)
    const formType = activeForm // 'doctor' or 'patient'

    const jsonData = {
      type: formType,
      data: {
        firstName: formData.get(`${formType}-first-name`),
        lastName: formData.get(`${formType}-last-name`),
        birthdate: formData.get(`${formType}-birthdate`),
        email: formData.get(`${formType}-mail`),
        password: formData.get(`${formType}-password`),
        ...(formType === 'doctor' 
          ? {
              registrationNumber: formData.get('doctor-registration-number')
            }
          : {
              identityNumber: formData.get('patient-identity-number')
            }
        )
      }
    }
    
    console.log('Form data as JSON:', JSON.stringify(jsonData, null, 2))
  }

  return (
    <>
      <div className="top-bar">
        MediBook
      </div>

      <div>
        Register as ...
      </div>

      <div className="switch-buttons">
        <button
          className={activeForm === 'patient' ? 'active' : ''}
          onClick={() => handleSwitch('patient')}
        >
          Patient
        </button>
        <button
          className={activeForm === 'doctor' ? 'active' : ''}
          onClick={() => handleSwitch('doctor')}
        >
          Doctor
        </button>
        
      </div>
      
      <div className="forms-slider">
        <form
          className={`form ${fade === 'in' ? 'fade-in' : 'fade-out'}`}
          onTransitionEnd={handleTransitionEnd}
          onSubmit={handleSubmit}
        >
          {activeForm === 'doctor' ? (
            <>
              
              <div className="input-group">
                <label className="inputLabel">First Name*</label>
                <input 
                  type="text" 
                  name="doctor-first-name"
                  maxLength={20}
                  className={invalidFields.has('doctor-first-name') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['doctor-first-name'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-first-name']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Last Name*</label>
                <input 
                  type="text" 
                  name="doctor-last-name"
                  maxLength={20} 
                  className={invalidFields.has('doctor-last-name') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['doctor-last-name'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-last-name']}
                  </span>
                )}
              </div>

              <div className='input-group'>
                <label className="inputLabel">Specialty*</label>
                <input 
                  type="text"
                  name="doctor-specialty"
                  maxLength={30}
                  className={invalidFields.has('doctor-specialty') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)
                  }
                  />
                {validationMessages['doctor-specialty'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-specialty']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Registration Number*</label>
                <input type="number" name="doctor-registration-number" 
                  className={invalidFields.has('doctor-registration-number') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['doctor-registration-number'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-registration-number']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Birthdate*</label>
                <input 
                  type="date" 
                  name="doctor-birthdate"
                  max={getMaxDate()}
                  min={getMinDate()}
                  className={invalidFields.has('doctor-birthdate') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['doctor-birthdate'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-birthdate']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Mail*</label>
                <input type="text" name="doctor-mail"
                  className={invalidFields.has('doctor-mail') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['doctor-mail'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-mail']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Password*</label>
                <input 
                  type="password" 
                  name="doctor-password"
                  className={invalidFields.has('doctor-password') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  autoComplete="new-password"
                />
                {validationMessages['doctor-password'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-password']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Confirm Password*</label>
                <input 
                  type="password" 
                  name="doctor-confirm-password"
                  className={invalidFields.has('doctor-confirm-password') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  onPaste={preventPaste}
                  autoComplete="new-password"
                />
                {validationMessages['doctor-confirm-password'] && (
                  <span className="validation-message">
                    {validationMessages['doctor-confirm-password']}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                name="submit-doctor"
                disabled={!isFormValid('doctor')}
                className={!isFormValid('doctor') ? 'button-disabled' : ''}
              >
                Register
              </button>

              <h6 className={invalidFields.size > 0 ? 'mandatory-text invalid' : 'mandatory-text'}>
                (*) Indicates mandatory
              </h6>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="inputLabel">First Name*</label>
                <input 
                  type="text" 
                  name="patient-first-name"
                  maxLength={20}
                  className={invalidFields.has('patient-first-name') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['patient-first-name'] && (
                  <span className="validation-message">
                    {validationMessages['patient-first-name']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Last Name*</label>
                <input 
                  type="text" 
                  name="patient-last-name"
                  maxLength={20}
                  className={invalidFields.has('patient-last-name') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['patient-last-name'] && (
                  <span className="validation-message">
                    {validationMessages['patient-last-name']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Identity Number*</label>
                <input 
                  type="number"
                  name="patient-identity-number"
                  className={invalidFields.has('patient-identity-number') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  onInput={(e) => {
                    const value = e.currentTarget.value
                    if (value.length > 8) {
                      e.currentTarget.value = value.slice(0, 8)
                    }
                  }}
                />
                {validationMessages['patient-identity-number'] && (
                  <span className="validation-message">
                    {validationMessages['patient-identity-number']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Birthdate*</label>
                <input 
                  type="date" 
                  name="patient-birthdate"
                  max={getMaxDate()}
                  min={getMinDate()}
                  className={invalidFields.has('patient-birthdate') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['patient-birthdate'] && (
                  <span className="validation-message">
                    {validationMessages['patient-birthdate']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Mail*</label>
                <input type="email" name="patient-mail"
                  className={invalidFields.has('patient-mail') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {validationMessages['patient-mail'] && (
                  <span className="validation-message">
                    {validationMessages['patient-mail']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Password*</label>
                <input 
                  type="password" 
                  name="patient-password"
                  className={invalidFields.has('patient-password') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  autoComplete="new-password"
                />
                {validationMessages['patient-password'] && (
                  <span className="validation-message">
                    {validationMessages['patient-password']}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="inputLabel">Confirm Password*</label>
                <input 
                  type="password" 
                  name="patient-confirm-password"
                  className={invalidFields.has('patient-confirm-password') ? 'invalid' : ''}
                  onChange={handleInputChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  onPaste={preventPaste}
                  autoComplete="new-password"
                />
                {validationMessages['patient-confirm-password'] && (
                  <span className="validation-message">
                    {validationMessages['patient-confirm-password']}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                name="submit-patient"
                disabled={!isFormValid('patient')}
                className={!isFormValid('patient') ? 'button-disabled' : ''}
              >
                Register
              </button>

              <h6 className={invalidFields.size > 0 ? 'mandatory-text invalid' : 'mandatory-text'}>
                (*) Indicates mandatory
              </h6>
            </>
          )}
        </form>
      </div>
    </>
  )
}

export default Register