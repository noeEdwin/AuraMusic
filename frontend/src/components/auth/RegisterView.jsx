import { useState } from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { getApiErrorMessage } from '../../lib/api'
import { StatusBanner } from '../shared/StatusBanner'
import { AuthField } from './AuthField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { getPasswordStrength, validateRegister } from './authValidation'

export function RegisterView() {
  const location = useLocation()
  const navigate = useNavigate()
  const { authFeedback, clearAuthFeedback, register } = useAuth()
  const [values, setValues] = useState({
    fullName: '',
    phone: '+52',
    role: 'MUSICIAN',
    email: '',
    password: '',
  })
  const [touchedFields, setTouchedFields] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = validateRegister(values)
  const passwordStrength = getPasswordStrength(values.password)

  function markTouched(name) {
    setTouchedFields((current) => (current[name] ? current : { ...current, [name]: true }))
  }

  function handleChange(event) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: name === 'phone' ? normalizeMexicanPhone(value) : value,
    }))
    clearAuthFeedback()
    setSubmitError('')
    markTouched(name)
  }

  function handleBlur(event) {
    markTouched(event.target.name)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextTouchedFields = {
      fullName: true,
      phone: true,
      role: true,
      email: true,
      password: true,
    }

    setTouchedFields(nextTouchedFields)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        username: buildUsername(values.fullName),
        displayName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
         role: values.role,
      })
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: values.email.trim().toLowerCase(),
          from: location.state?.from,
        },
      })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'No fue posible crear la cuenta.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getFieldError(name) {
    return touchedFields[name] ? errors[name] : ''
  }

  return (
    <AuthLayout
      heading="Unete a la banda"
      subheading="Crea tu perfil de artista"
      footer={(
        <p>
          <span>Ya tienes cuenta? </span>
          <Link to="/login" state={{ from: location.state?.from }}>Inicia sesion</Link>
        </p>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <StatusBanner message={authFeedback?.message} tone={authFeedback?.tone} />

        <AuthField
          autoComplete="name"
          error={getFieldError('fullName')}
          icon="userCircle"
          label="Nombre completo"
          name="fullName"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="Diego Ash"
          value={values.fullName}
        />
        <AuthField
          autoComplete="tel"
          error={getFieldError('phone')}
          icon="phone"
          inputMode="tel"
          label="Telefono"
          name="phone"
          onBlur={handleBlur}
          onChange={handleChange}
           placeholder="+529518695421"
           value={values.phone}
         />
        <label className="auth-field">
          <span className="auth-field-label">Tipo de cuenta</span>
          <select
            aria-describedby={getFieldError('role') ? 'role-error' : undefined}
            aria-invalid={Boolean(getFieldError('role'))}
            className={`auth-role-select${getFieldError('role') ? ' is-invalid' : ''}`}
            name="role"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.role}
          >
            <option value="MUSICIAN">Musico de banda</option>
            <option value="SOLO">Musico solista</option>
          </select>
          {getFieldError('role') ? <span className="auth-field-error" id="role-error">{getFieldError('role')}</span> : null}
        </label>
        <AuthField
          autoComplete="email"
          error={getFieldError('email')}
          icon="mail"
          inputMode="email"
          label="Correo electronico"
          name="email"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="diego@auramusic.lat"
          type="email"
          value={values.email}
        />

        <PasswordField
          autoComplete="new-password"
          error={getFieldError('password')}
          helper={(
            <div className="password-strength" aria-hidden="true">
              <div className="password-strength-track">
                <div className={`password-strength-fill ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} />
              </div>
              <div className="password-strength-copy">
                <span>{passwordStrength.label}</span>
                <span className={`password-strength-status ${passwordStrength.tone}`}>{passwordStrength.status}</span>
              </div>
            </div>
          )}
          label="Password"
          name="password"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="........"
          value={values.password}
        />

        <StatusBanner message={submitError} tone="error" />

        <button className="auth-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </AuthLayout>
  )
}

function buildUsername(fullName) {
  return fullName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('.')
}

function normalizeMexicanPhone(value) {
  const digits = value.replace(/\D/g, '')
  const nationalNumber = digits.startsWith('52') ? digits.slice(2, 12) : digits.slice(0, 10)
  return `+52${nationalNumber}`
}
