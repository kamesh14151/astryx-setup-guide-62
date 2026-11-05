// Image shape helpers.
//
// Vercel Blob keeps no width/height, and this project has no database, so the
// upload page writes the picture's size into the file name:
//   photo.png  ->  photo--800x1200.png   (Blob then adds its random suffix)
// The gallery reads it back from the name, so it knows a photo is a portrait
// before the image has loaded and can draw a tall card without a layout jump.

const DIMS = /--(\d{2,5})x(\d{2,5})(?=(?:-[A-Za-z0-9]{16,})?\.[A-Za-z0-9]+$)/
const SUFFIX = /-[A-Za-z0-9]{16,}(?=\.[A-Za-z0-9]+$)/

export type Shape = 'portrait' | 'landscape' | 'square'

export function parseDims(pathname: string): {width: number; height: number} | null {
  const m = pathname.match(DIMS)
  return m ? {width: Number(m[1]), height: Number(m[2])} : null
}

/** File name without the folder, the size marker and Blob's random suffix. */
export function cleanName(pathname: string): string {
  const file = pathname.split('/').pop() ?? pathname
  return file.replace(DIMS, '').replace(SUFFIX, '')
}

export function shapeOf(width: number, height: number): Shape {
  const ratio = width / height
  if (ratio < 0.9) return 'portrait'
  if (ratio > 1.15) return 'landscape'
  return 'square'
}

/** Card ratios: tall 4:5 for portraits, wide 3:2 for landscapes. */
export const SHAPE_ASPECT: Record<Shape, string> = {
  portrait: '4 / 5',
  landscape: '3 / 2',
  square: '1 / 1',
}

/** Reads a picture's pixel size in the browser before it is uploaded. */
export function readDimensions(file: File): Promise<{width: number; height: number} | null> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight})
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/** "my photo.png" + 800x1200 -> "my photo--800x1200.png" */
export function withDims(fileName: string, dims: {width: number; height: number} | null): string {
  if (!dims) return fileName
  const dot = fileName.lastIndexOf('.')
  const base = dot > 0 ? fileName.slice(0, dot) : fileName
  const ext = dot > 0 ? fileName.slice(dot) : ''
  return `${base.replace(DIMS, '')}--${dims.width}x${dims.height}${ext}`
}
