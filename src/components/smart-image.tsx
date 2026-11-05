'use client'

import {useState, type CSSProperties} from 'react'

/**
 * Image that fills its box with object-fit: cover, without cutting off faces.
 *
 * A normal `cover` crop keeps the middle of the picture. For a portrait photo
 * shown in a landscape box that removes the top and bottom, which is where the
 * head is, so the face disappears. For tall images this keeps the TOP part
 * instead (head and shoulders), and wide images stay centred.
 *
 * `portraitFocus` is how far down the picture the crop is anchored (0% = very
 * top, 50% = middle). 18% suits people photos: the face sits in the upper
 * third of most portraits.
 */
export function SmartImage({
  src,
  alt,
  portraitFocus = 18,
  style,
  className,
  onFail,
}: {
  src: string
  alt: string
  portraitFocus?: number
  style?: CSSProperties
  className?: string
  onFail?: () => void
}) {
  const [position, setPosition] = useState('50% 50%')

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: position,
        display: 'block',
        ...style,
      }}
      onLoad={e => {
        const img = e.currentTarget
        if (img.naturalHeight > img.naturalWidth * 1.05) {
          setPosition(`50% ${portraitFocus}%`)
        }
      }}
      onError={onFail}
      ref={el => {
        if (!el) return
        if (el.complete && el.naturalWidth === 0) onFail?.()
        else if (el.complete && el.naturalHeight > el.naturalWidth * 1.05) {
          setPosition(prev => (prev === '50% 50%' ? `50% ${portraitFocus}%` : prev))
        }
      }}
    />
  )
}
