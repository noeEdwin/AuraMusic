import Swal from 'sweetalert2'
import './sweetalert.css'

export async function confirmAction({ title, text, confirmText = 'Continuar', icon = 'warning' }) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: 'auramusic-alert',
      title: 'auramusic-alert-title',
      htmlContainer: 'auramusic-alert-text',
      confirmButton: 'auramusic-alert-confirm',
      cancelButton: 'auramusic-alert-cancel',
    },
  })

  return result.isConfirmed
}
