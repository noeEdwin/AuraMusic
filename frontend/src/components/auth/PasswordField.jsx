import { useState } from 'react'

import { Icon } from '../ui/Icon'

export function PasswordField({
  action,
  autoComplete,
  error,
  helper,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const errorId = `${name}-error`

  return (
    <div className="auth-field-stack">
      <div className="auth-field-row">
        <span className="auth-field-label">{label}</span>
        {action}
      </div>

      <span className={`auth-input-shell${error ? ' is-invalid' : ''}`}>
        <Icon type="lock" />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          type={isVisible ? 'text' : 'password'}
          value={value}
        />
        <button
          className="auth-visibility-toggle"
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        >
          <Icon type="eye" />
        </button>
      </span>

      {error ? <span className="auth-field-error" id={errorId}>{error}</span> : null}
      {helper}
    </div>
  )
}
