import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { readLocalAvatar } from '../../auth/localAvatarStorage'
import { getApiErrorMessage } from '../../lib/api'
import { confirmAction } from '../../lib/confirmAction'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import './profile.css'

export function ProfileView() {
  const navigate = useNavigate()
  const { updateLocalAvatar, updateProfile, user } = useAuth()
  const [localAvatar, setLocalAvatar] = useState(() => readLocalAvatar(user))
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido.')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 3 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLocalAvatar(String(reader.result))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const shouldSave = await confirmAction({
      title: '¿Guardar cambios del perfil?',
      text: 'Se actualizarán los datos visibles de tu cuenta.',
      confirmText: 'Guardar cambios',
      icon: 'question',
    })

    if (!shouldSave) return

    setIsSaving(true)
    setError('')
    setMessage('')

    try {
      await updateProfile({
        displayName: form.displayName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        avatarUrl: null,
      })
      updateLocalAvatar(localAvatar)
      setMessage('Tu información se actualizó correctamente.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible actualizar tu información.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShellLayout contentClassName="content-grid profile-grid">
      <section className="panel page-panel profile-panel">
        <div className="profile-page-header">
          <div>
            <span className="page-panel-badge">Mi cuenta</span>
            <h1>Configuración de perfil</h1>
            <p>Actualiza los datos que se muestran en tu cuenta sin cambiar tu rol ni tu nombre de usuario.</p>
          </div>
          <div className="profile-page-avatar">
            {localAvatar ? <img src={localAvatar} alt="Vista previa del perfil" /> : getInitials(form.displayName)}
          </div>
        </div>

        <StatusBanner message={error} tone="error" />
        <StatusBanner message={message} tone="info" />

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <label className="catalog-field">
              <span>Nombre visible</span>
              <input name="displayName" value={form.displayName} onChange={handleChange} required maxLength={100} />
            </label>
            <label className="catalog-field">
              <span>Correo electrónico</span>
              <input name="email" value={form.email} onChange={handleChange} required maxLength={120} type="email" />
            </label>
            <label className="catalog-field">
              <span>Número de teléfono</span>
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={20} inputMode="tel" placeholder="+52 555 555 5555" />
            </label>
            <label className="catalog-field profile-form-wide">
              <span>Imagen de perfil</span>
              <input accept="image/*" onChange={handleAvatarChange} type="file" />
              <small>Se guarda solo en este navegador y dispositivo. Máximo 3 MB.</small>
            </label>
          </div>

          <div className="profile-form-footer">
            <span className="profile-protected-copy">Usuario: {user?.username} · Rol: {formatRole(user?.role)}</span>
            <div className="profile-form-actions">
              <button className="catalog-clear" type="button" onClick={() => navigate(-1)} disabled={isSaving}>Cancelar</button>
              <button className="catalog-submit" type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </div>
        </form>
      </section>
    </AppShellLayout>
  )
}

function getInitials(value = '') {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'AM'
}

function formatRole(role) {
  if (role === 'ADMIN') return 'Administrador'
  if (role === 'MUSICIAN') return 'Músico'
  if (role === 'SOLO') return 'Solista'
  return role ?? 'Sin rol'
}
