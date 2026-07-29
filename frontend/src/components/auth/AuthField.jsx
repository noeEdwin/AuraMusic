import { Icon } from '../ui/Icon'

export function AuthField({
  autoComplete,
  error,
  icon,
  inputMode,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  value,
}) {
  const errorId = `${name}-error`

  return (
    <label className="auth-field">
      <span className="auth-field-label">{label}</span>
      <span className={`auth-input-shell${error ? ' is-invalid' : ''}`}>
        <Icon type={icon} />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          name={name}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      </span>

      {error ? <span className="auth-field-error" id={errorId}>{error}</span> : null}
    </label>
  )
}
