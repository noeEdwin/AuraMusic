import { useState } from 'react'

import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { getApiErrorMessage } from '../../lib/api'
import { StatusBanner } from '../shared/StatusBanner'
import { AuthField } from './AuthField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { validateLogin } from './authValidation'

export function LoginView() {
  const location = useLocation()
  const navigate = useNavigate()
  const { authFeedback, clearAuthFeedback, login } = useAuth()
  const [values, setValues] = useState({
    email: location.state?.email ?? '',
    password: '',
  })
  const [touchedFields, setTouchedFields] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = validateLogin(values)

  function markTouched(name) {
    setTouchedFields((current) => (current[name] ? current : { ...current, [name]: true }))
  }

  function handleChange(event) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
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
    const nextTouchedFields = { email: true, password: true }
    setTouchedFields(nextTouchedFields)

    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const session = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      })
      const nextRoute = location.state?.from ?? (session.user.role === 'ADMIN' ? '/admin' : '/dashboard')
      navigate(nextRoute, { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'No fue posible iniciar sesion.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getFieldError(name) {
    return touchedFields[name] ? errors[name] : ''
  }

  return (
    <AuthLayout
      showLogo
      heading="Bienvenido"
      subheading="Por favor ingresa tus credenciales"
      footer={(
        <p>
          <span>Aun no tienes cuenta? </span>
          <Link to="/register">Registrate</Link>
        </p>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <StatusBanner
          message={getLoginFeedbackMessage(location.state, authFeedback)}
          tone={getLoginFeedbackTone(location.state, authFeedback)}
        />

        <AuthField
          autoComplete="email"
          error={getFieldError('email')}
          icon="mail"
          inputMode="email"
          label="Correo"
          name="email"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="diego@auramusic.lat"
          type="email"
          value={values.email}
        />

        <PasswordField
          action={<button className="auth-inline-link auth-inline-button" type="button">Olvidaste tu contrasena?</button>}
          autoComplete="current-password"
          error={getFieldError('password')}
          label="Contrasena"
          name="password"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="........"
          value={values.password}
        />

        <StatusBanner message={submitError} tone="error" />

        <button className="auth-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </AuthLayout>
  )
}

function getLoginFeedbackMessage(locationState, authFeedback) {
  if (locationState?.from) {
    return 'Inicia sesion para continuar con la ruta solicitada.'
  }

  if (locationState?.registered) {
    return 'Cuenta creada correctamente. Inicia sesion para continuar.'
  }

  return authFeedback?.message
}

function getLoginFeedbackTone(locationState, authFeedback) {
  return locationState?.from || locationState?.registered ? 'info' : authFeedback?.tone
}
