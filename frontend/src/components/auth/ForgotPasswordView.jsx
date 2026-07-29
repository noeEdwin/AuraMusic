import { useState } from 'react'
import { Link } from 'react-router-dom'

import { requestPasswordReset } from '../../auth/passwordRecoveryApi'
import { getApiErrorMessage } from '../../lib/api'
import { StatusBanner } from '../shared/StatusBanner'
import { AuthField } from './AuthField'
import { AuthLayout } from './AuthLayout'
import './auth.css'

export function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      await requestPasswordReset(email.trim().toLowerCase())
      setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible solicitar el restablecimiento.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      showLogo
      heading="Restablecer contraseña"
      subheading="Te enviaremos un enlace para crear una nueva contraseña"
      footer={<p><span>¿Ya la recuerdas? </span><Link to="/login">Volver al inicio de sesión</Link></p>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <StatusBanner message={error} tone="error" />
        <StatusBanner message={message} tone="info" />
        <AuthField
          autoComplete="email"
          icon="mail"
          inputMode="email"
          label="Correo electrónico"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu-correo@ejemplo.com"
          required
          type="email"
          value={email}
        />
        <button className="auth-primary-button" type="submit" disabled={isSubmitting || !email.trim()}>
          {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </AuthLayout>
  )
}
