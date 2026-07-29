import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { resetPassword } from '../../auth/passwordRecoveryApi'
import { getApiErrorMessage } from '../../lib/api'
import { confirmAction } from '../../lib/confirmAction'
import { StatusBanner } from '../shared/StatusBanner'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { getPasswordStrength } from './authValidation'
import './auth.css'

export function ResetPasswordView() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = searchParams.get('token') ?? ''
  const passwordStrength = getPasswordStrength(password)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('El enlace de recuperación no contiene un token válido.')
      return
    }

    if (!passwordStrengthIsValid(password)) {
      setError('Usa mínimo 8 caracteres, una mayúscula, un número y un símbolo.')
      return
    }

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const shouldReset = await confirmAction({
      title: '¿Cambiar contraseña?',
      text: 'Tu contraseña actual dejará de funcionar después de este cambio.',
      confirmText: 'Cambiar contraseña',
      icon: 'question',
    })

    if (!shouldReset) return

    setIsSubmitting(true)

    try {
      await resetPassword(token, password)
      navigate('/login', { replace: true, state: { reset: true } })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'El enlace no es válido o ya expiró.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      showLogo
      heading="Nueva contraseña"
      subheading="Crea una contraseña segura para volver a entrar a AuraMusic"
      footer={<p><span>¿Necesitas otro enlace? </span><Link to="/forgot-password">Solicitar recuperación</Link></p>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <StatusBanner message={error} tone="error" />
        <PasswordField
          autoComplete="new-password"
          helper={<div className="password-strength"><div className="password-strength-track"><div className={`password-strength-fill ${passwordStrength.tone}`} style={{ width: passwordStrength.width }} /></div><div className="password-strength-copy"><span>{passwordStrength.label}</span><span className={`password-strength-status ${passwordStrength.tone}`}>{passwordStrength.status}</span></div></div>}
          label="Nueva contraseña"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="........"
          value={password}
        />
        <PasswordField
          autoComplete="new-password"
          label="Confirmar contraseña"
          name="confirmation"
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="........"
          value={confirmation}
        />
        <button className="auth-primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </AuthLayout>
  )
}

function passwordStrengthIsValid(password) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
}
