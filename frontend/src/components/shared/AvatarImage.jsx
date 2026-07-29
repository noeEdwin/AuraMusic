import { useEffect, useState } from 'react'

import logo from '../../assets/logo.png'

export function AvatarImage({ alt = '', className, src }) {
  const [imageSrc, setImageSrc] = useState(src || logo)

  useEffect(() => {
    setImageSrc(src || logo)
  }, [src])

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(logo)}
    />
  )
}
