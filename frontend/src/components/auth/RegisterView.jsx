import { useState } from 'react'

import { AuthField } from './AuthField'
import { AuthLayout } from './AuthLayout'
import { PasswordField } from './PasswordField'
import { getPasswordStrength, validateRegister } from './authValidation'

export function RegisterView() {
  const [values, setValues] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  })
  const [touchedFields, setTouchedFields] = useState({})

  const errors = validateRegister(values)
  const passwordStrength = getPasswordStrength(values.password)

  function markTouched(name) {
    setTouchedFields((current) => (current[name] ? current : { ...current, [name]: true }))
  }

  function handleChange(event) {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: name === 'phone' ? value.replace(/\D/g, '') : value,
    }))
    markTouched(name)
  }

  function handleBlur(event) {
    markTouched(event.target.name)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setTouchedFields({
      fullName: true,
      phone: true,
      email: true,
      password: true,
    })
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
          <a href="?view=login">Inicia sesion</a>
        </p>
      )}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
          placeholder="9518695421"
          value={values.phone}
        />
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

        <button className="auth-primary-button" type="submit">Registrarse</button>
      </form>
    </AuthLayout>
  )
}
