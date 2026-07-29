import './auth.css'
import logo from '../../assets/logo.png'

export function AuthLayout({ children, footer, heading, subheading, tertiaryText, showLogo = false }) {
  return (
    <section className="auth-shell">
      <div className="auth-orb auth-orb-left" aria-hidden="true" />
      <div className="auth-orb auth-orb-right" aria-hidden="true" />

      <div className="auth-card">
        <div className={`auth-brand${showLogo ? ' auth-brand-with-logo' : ''}`}>
          {showLogo ? <img className="auth-brand-mark" src={logo} alt="AuraMusic" /> : null}
          <span className="auth-brand-name">AuraMusic</span>
        </div>

        <header className="auth-header">
          <h1>{heading}</h1>
          <p>{subheading}</p>
          {tertiaryText ? <p className="auth-tertiary-text">{tertiaryText}</p> : null}
        </header>

        <div className="auth-form-shell">{children}</div>

        {footer ? <footer className="auth-footer">{footer}</footer> : null}
      </div>
    </section>
  )
}
