"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UploadedFileItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  /** Estimated or detected aspect ratio ('portrait' | 'landscape' | 'square') */
  orientation?: "portrait" | "landscape" | "square";
  aspectRatio?: number;
}

export interface UseFileUploadOptions {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // Maximum file size in bytes
  onFilesChange?: (files: UploadedFileItem[]) => void;
}

export interface UseFileUploadActions {
  removeFile: (id?: string) => void;
  openFileDialog: () => void;
  clearFiles: () => void;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.RefObject<HTMLInputElement | null>;
  };
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    accept = "image/*",
    multiple = false,
    maxFiles,
    maxSize,
    onFilesChange,
  } = options;

  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke blob URLs to prevent memory leaks in the browser
  const revokePreviews = useCallback((items: UploadedFileItem[]) => {
    items.forEach((item) => {
      if (item.preview && item.preview.startsWith("blob:")) {
        URL.revokeObjectURL(item.preview);
      }
    });
  }, []);

  const removeFile = useCallback(
    (id?: string) => {
      setFiles((prev) => {
        if (!id) {
          revokePreviews(prev);
          onFilesChange?.([]);
          return [];
        }
        const itemToRemove = prev.find((f) => f.id === id);
        if (itemToRemove && itemToRemove.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(itemToRemove.preview);
        }
        const next = prev.filter((f) => f.id !== id);
        onFilesChange?.(next);
        return next;
      });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onFilesChange, revokePreviews]
  );

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      revokePreviews(prev);
      return [];
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [revokePreviews]);

  const handleFileSelection = useCallback(
    (incomingFiles: FileList | File[] | null) => {
      if (!incomingFiles || incomingFiles.length === 0) return;

      const fileList = Array.from(incomingFiles);
      const newItems: UploadedFileItem[] = [];

      for (const file of fileList) {
        if (maxSize && file.size > maxSize) continue;

        let preview = "";
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        const id = `${file.name}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;

        const item: UploadedFileItem = {
          id,
          file,
          preview,
          name: file.name,
          size: file.size,
          type: file.type,
        };

        // Asynchronously detect image orientation and dimensions
        if (preview) {
          const img = new Image();
          img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            let orientation: "portrait" | "landscape" | "square" = "square";
            if (ratio < 0.9) orientation = "portrait";
            else if (ratio > 1.1) orientation = "landscape";

            setFiles((currentFiles) =>
              currentFiles.map((f) =>
                f.id === id ? { ...f, orientation, aspectRatio: ratio } : f
              )
            );
          };
          img.src = preview;
        }

        newItems.push(item);
        if (!multiple) break;
      }

      setFiles((prev) => {
        if (!multiple) {
          revokePreviews(prev);
        }
        const combined = multiple ? [...prev, ...newItems] : newItems;
        const finalItems = maxFiles ? combined.slice(0, maxFiles) : combined;
        onFilesChange?.(finalItems);
        return finalItems;
      });
    },
    [maxFiles, maxSize, multiple, onFilesChange, revokePreviews]
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file" as const,
      accept,
      multiple,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelection(e.target.files);
      },
    }),
    [accept, multiple, handleFileSelection]
  );

  useEffect(() => {
    return () => {
      revokePreviews(files);
    };
  }, []);

  return [
    { files },
    { removeFile, openFileDialog, clearFiles, getInputProps },
  ] as const;
}

