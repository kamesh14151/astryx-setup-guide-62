'use client'

// File-picker state with drag and drop, previews, size and type checks.
// Same API as the reui / originui `useFileUpload` hook, so code written for
// that hook (like `c-file-upload-1`) works unchanged.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'

export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileOrientation = 'portrait' | 'landscape' | 'square'

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
  // Shortcuts so UI code does not have to reach into `file`.
  name: string
  size: number
  type: string
  /** Filled in shortly after an image is added (needs the picture decoded). */
  orientation?: FileOrientation
}

export type FileUploadOptions = {
  maxFiles?: number // only used when multiple is true
  maxSize?: number // bytes
  accept?: string
  multiple?: boolean
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void
}

export type FileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
}

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearErrors: () => void
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>,
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export const useFileUpload = (
  options: FileUploadOptions = {},
): [FileUploadState, FileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
  } = options

  const [state, setState] = useState<FileUploadState>({
    files: initialFiles.map(file => ({
      file,
      id: file.id,
      preview: file.url,
      name: file.name,
      size: file.size,
      type: file.type,
    })),
    isDragging: false,
    errors: [],
  })

  const inputRef = useRef<HTMLInputElement>(null)
  // Latest files, so object URLs can be released on unmount.
  const filesRef = useRef<FileWithPreview[]>(state.files)
  filesRef.current = state.files

  useEffect(
    () => () => {
      for (const f of filesRef.current) {
        if (f.preview && f.file instanceof File && f.file.type.startsWith('image/')) {
          URL.revokeObjectURL(f.preview)
        }
      }
    },
    [],
  )

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file.size > maxSize) {
        return `"${file.name}" is larger than ${formatBytes(maxSize)}.`
      }
      if (accept !== '*') {
        const types = accept.split(',').map(t => t.trim())
        const fileType = file.type || ''
        const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
        const ok = types.some(t => {
          if (t.startsWith('.')) return ext === t.toLowerCase()
          if (t.endsWith('/*')) return fileType.startsWith(t.slice(0, -1))
          return fileType === t
        })
        if (!ok) return `"${file.name}" is not an accepted file type.`
      }
      return null
    },
    [accept, maxSize],
  )

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (!incoming || incoming.length === 0) return
      const list = Array.from(incoming)
      const errors: string[] = []

      const current = multiple ? filesRef.current : []
      if (multiple && current.length + list.length > maxFiles) {
        errors.push(`You can upload at most ${maxFiles} files.`)
      }

      const valid: FileWithPreview[] = []
      for (const file of list) {
        if (multiple && current.length + valid.length >= maxFiles) break
        const isDuplicate = current.some(
          e => e.file.name === file.name && e.file.size === file.size,
        )
        if (isDuplicate) continue
        const error = validateFile(file)
        if (error) {
          errors.push(error)
          continue
        }
        valid.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          preview: file.type.startsWith('image/')
            ? URL.createObjectURL(file)
            : undefined,
        })
      }

      if (valid.length > 0) {
        onFilesAdded?.(valid)
        // Single mode replaces the previous file, so release its preview.
        if (!multiple) {
          for (const f of filesRef.current) {
            if (f.preview && f.file instanceof File) URL.revokeObjectURL(f.preview)
          }
        }
        setState(prev => {
          const files = multiple ? [...prev.files, ...valid] : valid
          onFilesChange?.(files)
          return {...prev, files, errors}
        })
        // Work out portrait / landscape once each picture has decoded.
        for (const entry of valid) {
          if (!entry.preview) continue
          const img = new Image()
          img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight
            const orientation: FileOrientation =
              ratio < 0.9 ? 'portrait' : ratio > 1.15 ? 'landscape' : 'square'
            setState(prev => ({
              ...prev,
              files: prev.files.map(f =>
                f.id === entry.id ? {...f, orientation} : f,
              ),
            }))
          }
          img.src = entry.preview
        }
      } else if (errors.length > 0) {
        setState(prev => ({...prev, errors}))
      }

      if (inputRef.current) inputRef.current.value = ''
    },
    [multiple, maxFiles, validateFile, onFilesAdded, onFilesChange],
  )

  const removeFile = useCallback(
    (id: string) => {
      setState(prev => {
        const target = prev.files.find(f => f.id === id)
        if (target?.preview && target.file instanceof File) {
          URL.revokeObjectURL(target.preview)
        }
        const files = prev.files.filter(f => f.id !== id)
        onFilesChange?.(files)
        return {...prev, files, errors: []}
      })
    },
    [onFilesChange],
  )

  const clearFiles = useCallback(() => {
    setState(prev => {
      for (const f of prev.files) {
        if (f.preview && f.file instanceof File) URL.revokeObjectURL(f.preview)
      }
      if (inputRef.current) inputRef.current.value = ''
      onFilesChange?.([])
      return {...prev, files: [], errors: []}
    })
  }, [onFilesChange])

  const clearErrors = useCallback(() => {
    setState(prev => ({...prev, errors: []}))
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState(prev => ({...prev, isDragging: true}))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Ignore leaves into a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setState(prev => ({...prev, isDragging: false}))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState(prev => ({...prev, isDragging: false}))
      if (inputRef.current?.disabled) return
      const dropped = e.dataTransfer.files
      if (dropped && dropped.length > 0) {
        addFiles(multiple ? dropped : [dropped[0]])
      }
    },
    [addFiles, multiple],
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) addFiles(e.target.files)
    },
    [addFiles],
  )

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      type: 'file' as const,
      onChange: handleFileChange,
      accept: props.accept || accept,
      multiple: props.multiple !== undefined ? props.multiple : multiple,
      ref: inputRef,
    }),
    [accept, multiple, handleFileChange],
  )

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ]
}
