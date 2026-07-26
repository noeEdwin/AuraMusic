const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const phonePattern = /^\d{10}$/
const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/

export function validateLogin(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Ingresa tu correo.'
  } else if (!emailPattern.test(values.email)) {
    errors.email = 'Ingresa un correo valido.'
  }

  if (!values.password) {
    errors.password = 'Ingresa tu contrasena.'
  }

  return errors
}

export function validateRegister(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Ingresa tu nombre completo.'
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Escribe al menos 3 caracteres.'
  } else if (!namePattern.test(values.fullName.trim())) {
    errors.fullName = 'El nombre no debe contener numeros ni simbolos.'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Ingresa tu telefono.'
  } else if (!phonePattern.test(values.phone)) {
    errors.phone = 'Ingresa un telefono de 10 digitos.'
  }

  if (!values.email.trim()) {
    errors.email = 'Ingresa tu correo electronico.'
  } else if (!emailPattern.test(values.email)) {
    errors.email = 'Ingresa un correo valido.'
  }

  if (!values.password) {
    errors.password = 'Crea una contrasena.'
  } else if (!passwordPattern.test(values.password)) {
    errors.password = 'Usa 8 caracteres, una mayuscula, un numero y un simbolo.'
  }

  return errors
}

export function getPasswordStrength(password) {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]

  const score = checks.filter(Boolean).length

  if (!password) {
    return { label: 'Sin definir', status: 'Debil', tone: 'weak', width: '10%' }
  }

  if (score <= 2) {
    return { label: 'Fuerza: baja', status: 'Debil', tone: 'weak', width: '33%' }
  }

  if (score === 3) {
    return { label: 'Fuerza: media', status: 'Media', tone: 'medium', width: '66%' }
  }

  return { label: 'Fuerza: alta', status: 'Segura', tone: 'strong', width: '100%' }
}
