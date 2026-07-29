import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import { activateAdminUser, deactivateAdminUser, fetchAdminUsers, updateAdminUser } from '../../admin/adminApi'
import { useAuth } from '../../auth/useAuth'
import { confirmAction } from '../../lib/confirmAction'
import { getApiErrorMessage } from '../../lib/api'
import { AppShellLayout } from '../layout/AppShellLayout'
import { StatusBanner } from '../shared/StatusBanner'
import '../catalog/catalog.css'
import './admin.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AdminUsersView() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchAdminUsers()
        if (!ignore) setUsers(data)
      } catch (requestError) {
        if (!ignore) setError(getApiErrorMessage(requestError, 'No fue posible cargar los usuarios.'))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadUsers()
    return () => { ignore = true }
  }, [])

  const activeUsers = users.filter((candidate) => candidate.enabled).length
  const inactiveUsers = users.length - activeUsers

  async function openEditModal(candidate) {
    if (candidate.id === user?.id || isActionInProgress) return

    setError('')
    setMessage('')

    const result = await Swal.fire({
      title: `Editar a ${candidate.displayName || candidate.username}`,
      html: buildEditUserFormHtml(candidate),
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: 'auramusic-alert',
        title: 'auramusic-alert-title',
        htmlContainer: 'auramusic-alert-form-container',
        confirmButton: 'auramusic-alert-confirm',
        cancelButton: 'auramusic-alert-cancel',
      },
      preConfirm: readEditUserForm,
    })

    if (!result.isConfirmed || !result.value) return

    setIsActionInProgress(true)
    try {
      const updatedUser = await updateAdminUser(candidate.id, result.value)
      setUsers((current) => current.map((currentUser) => currentUser.id === updatedUser.id ? updatedUser : currentUser))
      setMessage('Usuario actualizado correctamente.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible actualizar el usuario.'))
    } finally {
      setIsActionInProgress(false)
    }
  }

  async function handleUserDeactivate(candidate) {
    if (!candidate.enabled || candidate.id === user?.id || isActionInProgress) return

    const shouldDeactivate = await confirmAction({
      title: '¿Desactivar usuario?',
      text: `La cuenta de ${candidate.displayName || candidate.username} no se borrará, pero ya no podrá iniciar sesión.`,
      confirmText: 'Desactivar usuario',
    })

    if (!shouldDeactivate) return

    setIsActionInProgress(true)
    setError('')
    setMessage('')

    try {
      await deactivateAdminUser(candidate.id)
      setUsers((current) => current.map((currentUser) => currentUser.id === candidate.id ? { ...currentUser, enabled: false } : currentUser))
      setMessage(`La cuenta de ${candidate.displayName || candidate.username} fue desactivada.`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible desactivar el usuario.'))
    } finally {
      setIsActionInProgress(false)
    }
  }

  async function handleUserActivate(candidate) {
    if (candidate.enabled || candidate.id === user?.id || isActionInProgress) return

    const shouldActivate = await confirmAction({
      title: '¿Activar usuario?',
      text: `La cuenta de ${candidate.displayName || candidate.username} podrá volver a iniciar sesión.`,
      confirmText: 'Activar usuario',
      icon: 'question',
    })

    if (!shouldActivate) return

    setIsActionInProgress(true)
    setError('')
    setMessage('')

    try {
      const activatedUser = await activateAdminUser(candidate.id)
      setUsers((current) => current.map((currentUser) => currentUser.id === activatedUser.id ? activatedUser : currentUser))
      setMessage(`La cuenta de ${activatedUser.displayName || activatedUser.username} fue activada.`)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No fue posible activar el usuario.'))
    } finally {
      setIsActionInProgress(false)
    }
  }

  return (
    <AppShellLayout contentClassName="content-grid admin-grid">
      <section className="panel page-panel admin-panel">
        <div className="admin-hero">
          <div>
            <span className="page-panel-badge">Administracion</span>
            <h1>Usuarios</h1>
            <p>Consulta las cuentas registradas, edita sus datos básicos o activa y desactiva su acceso.</p>
          </div>
          <div className="admin-lock-badge">ADMIN</div>
        </div>

        <StatusBanner message={error} tone="error" />
        <StatusBanner message={message} tone="info" />

        <div className="admin-user-summary-grid">
          <article>
            <span>Usuarios totales</span>
            <strong>{isLoading ? '...' : users.length}</strong>
          </article>
          <article>
            <span>Activos</span>
            <strong>{isLoading ? '...' : activeUsers}</strong>
          </article>
          <article>
            <span>Desactivados</span>
            <strong>{isLoading ? '...' : inactiveUsers}</strong>
          </article>
        </div>

        {isLoading ? <div className="catalog-empty">Cargando usuarios...</div> : null}

        {!isLoading && users.length > 0 ? (
          <div className="catalog-list-shell" role="table" aria-label="Usuarios registrados">
            <div className="catalog-list-row catalog-list-head admin-users-list-head" role="row">
              <span>Usuario</span>
              <span>Correo</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {users.map((candidate) => (
              <article key={candidate.id} className="catalog-list-row admin-users-list-row" role="row">
                <div className="catalog-primary-cell" data-label="Usuario">
                  <strong>{candidate.displayName || candidate.username}</strong>
                  <span>@{candidate.username} · ID {candidate.id}</span>
                </div>
                <div className="catalog-cell catalog-copy" data-label="Correo">
                  <strong>{candidate.email}</strong>
                  <span>{candidate.phone || 'Sin telefono'}</span>
                </div>
                <div className="catalog-cell" data-label="Rol">{formatRole(candidate.role)}</div>
                <div className="catalog-cell" data-label="Estado">
                  <span className={`admin-status-pill${candidate.enabled ? ' active' : ''}`}>{candidate.enabled ? 'Activo' : 'Desactivado'}</span>
                </div>
                <div className="catalog-cell catalog-actions-cell admin-users-actions" data-label="Acciones">
                  <button className="catalog-clear" type="button" onClick={() => openEditModal(candidate)} disabled={candidate.id === user?.id || isActionInProgress}>
                    {candidate.id === user?.id ? 'Tu perfil' : 'Editar'}
                  </button>
                  <button
                    className={candidate.enabled ? 'catalog-danger-button' : 'catalog-activate-button'}
                    type="button"
                    onClick={() => candidate.enabled ? handleUserDeactivate(candidate) : handleUserActivate(candidate)}
                    disabled={candidate.id === user?.id || isActionInProgress}
                  >
                    {candidate.id === user?.id ? 'Tu cuenta' : candidate.enabled ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!isLoading && users.length === 0 ? <div className="catalog-empty">Todavia no hay usuarios disponibles para administrar.</div> : null}
      </section>
    </AppShellLayout>
  )
}

function buildEditUserFormHtml(candidate) {
  return `
    <div class="auramusic-alert-form">
      <label>Nombre visible<input id="admin-user-display-name" class="auramusic-alert-input" maxlength="100" value="${escapeHtml(candidate.displayName)}"></label>
      <label>Username<input id="admin-user-username" class="auramusic-alert-input" maxlength="50" value="${escapeHtml(candidate.username)}"></label>
      <label>Correo<input id="admin-user-email" class="auramusic-alert-input" type="email" maxlength="120" value="${escapeHtml(candidate.email)}"></label>
      <label>Telefono<input id="admin-user-phone" class="auramusic-alert-input" maxlength="20" value="${escapeHtml(candidate.phone)}"></label>
      <label>Avatar URL<input id="admin-user-avatar-url" class="auramusic-alert-input" maxlength="500" value="${escapeHtml(candidate.avatarUrl)}" placeholder="https://..."></label>
    </div>
  `
}

function readEditUserForm() {
  const popup = Swal.getPopup()
  const values = {
    displayName: popup.querySelector('#admin-user-display-name')?.value.trim() ?? '',
    username: popup.querySelector('#admin-user-username')?.value.trim() ?? '',
    email: popup.querySelector('#admin-user-email')?.value.trim().toLowerCase() ?? '',
    phone: popup.querySelector('#admin-user-phone')?.value.trim() ?? '',
    avatarUrl: popup.querySelector('#admin-user-avatar-url')?.value.trim() ?? '',
  }

  if (!values.displayName || !values.username || !values.email) {
    Swal.showValidationMessage('Completa el nombre visible, username y correo.')
    return undefined
  }

  if (!emailPattern.test(values.email)) {
    Swal.showValidationMessage('Ingresa un correo electrónico válido.')
    return undefined
  }

  return values
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatRole(role) {
  if (role === 'ADMIN') return 'Administrador'
  if (role === 'MUSICIAN') return 'Musico'
  if (role === 'SOLO') return 'Solista'
  return role ?? 'Sin rol'
}
