const AVATAR_PREFIX = 'auramusic.avatar.'

function getAvatarKey(user) {
  return `${AVATAR_PREFIX}${user?.id ?? user?.email ?? 'current'}`
}

export function readLocalAvatar(user) {
  return localStorage.getItem(getAvatarKey(user))
}

export function writeLocalAvatar(user, dataUrl) {
  if (dataUrl) {
    localStorage.setItem(getAvatarKey(user), dataUrl)
  } else {
    localStorage.removeItem(getAvatarKey(user))
  }
}

export function applyLocalAvatar(user) {
  if (!user) return user
  return { ...user, avatarUrl: readLocalAvatar(user) ?? user.avatarUrl ?? null }
}
