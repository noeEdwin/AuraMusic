import { useState } from 'react'

import { AuthField } from './AuthField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { validateLogin } from './authValidation'

export function LoginView() {
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [touchedFields, setTouchedFields] = useState({})

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
    markTouched(name)
  }

  function handleBlur(event) {
    markTouched(event.target.name)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setTouchedFields({ email: true, password: true })
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
          <a href="?view=register">Registrate</a>
        </p>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

        <button className="auth-primary-button" type="submit">Ingresar</button>
      </form>
    </AuthLayout>
  )
}
