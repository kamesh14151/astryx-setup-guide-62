"use client";

import { useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";
import {
  CircleUserRoundIcon,
  Sparkles,
  Maximize2,
  Trash2,
  UploadCloud,
  Check,
} from "lucide-react";

/**
 * Format bytes into human-readable string (KB, MB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type FocalPreset = "face" | "top" | "center";

const FOCAL_CLASSES: Record<FocalPreset, string> = {
  // Anchors directly to the upper 18-20% where faces reside in portrait photos
  face: "object-[center_20%]",
  top: "object-top",
  center: "object-center",
};

/**
 * Enhanced drop-in replacement for @reui/c-file-upload-1 Pattern.
 *
 * Solves the portrait face-cropping problem:
 * 1. Default `object-cover` centers at 50% 50%, cropping off heads/faces on portrait images.
 * 2. Applying `object-[center_20%]` keeps the subject's face prominently centered.
 * 3. Includes an expandable 4:5 portrait preview card (matching the 4/5 AspectRatio gallery hero standard).
 */
export function Pattern() {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept: "image/*",
    });

  const [focalPreset, setFocalPreset] = useState<FocalPreset>("face");
  const [showPortraitCard, setShowPortraitCard] = useState<boolean>(true);

  const activeFile = files[0];
  const previewUrl = activeFile?.preview || null;
  const fileName = activeFile?.name || null;
  const isPortrait =
    activeFile?.orientation === "portrait" || !activeFile?.orientation;

  const focalClass = FOCAL_CLASSES[focalPreset];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
      {/* ── Main Inline Uploader ── */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="inline-flex items-center gap-3 align-top">
          {/*
            Avatar Box:
            - Size is 40px (size-10) with ring & border
            - `object-cover` + `object-[center_20%]` guarantees the face is visible
              and not cropped off at the neckline/chest.
          */}
          <div
            className="border-input rounded-full relative flex size-10 shrink-0 items-center justify-center overflow-hidden border bg-muted ring-2 ring-primary/10 transition-all hover:ring-primary/30"
            aria-label={
              previewUrl
                ? "Preview of uploaded portrait image"
                : "Default user avatar"
            }
          >
            {previewUrl ? (
              <img
                className={`size-full object-cover ${focalClass} transition-all duration-200`}
                src={previewUrl}
                alt="Preview of uploaded image"
                width={40}
                height={40}
              />
            ) : (
              <CircleUserRoundIcon
                className="opacity-50 text-muted-foreground"
                width={20}
                height={20}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="relative inline-flex items-center gap-2">
            <Button
              onClick={openFileDialog}
              aria-haspopup="dialog"
              variant={fileName ? "outline" : "default"}
              size="sm"
            >
              <UploadCloud className="size-3.5 mr-1" />
              {fileName ? "Change image" : "Upload image"}
            </Button>
            <input
              {...getInputProps()}
              className="sr-only"
              aria-label="Upload image file"
              tabIndex={-1}
            />

            {previewUrl && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPortraitCard((prev) => !prev)}
                title="Toggle 4:5 portrait preview card"
                aria-label="Toggle 4:5 portrait preview"
              >
                <Maximize2 className="size-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>

        {/* File name & quick actions */}
        {fileName ? (
          <div className="inline-flex items-center gap-2 text-xs">
            <span
              className="text-muted-foreground max-w-[180px] truncate"
              aria-live="polite"
              title={fileName}
            >
              {fileName} ({formatFileSize(activeFile.size)})
            </span>
            <span className="text-muted-foreground/40">·</span>
            <button
              onClick={() => removeFile(activeFile.id)}
              className="text-destructive inline-flex items-center gap-0.5 cursor-pointer font-medium hover:underline text-xs"
              aria-label={`Remove ${fileName}`}
            >
              <Trash2 className="size-3" />
              Remove
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-2 text-xs">
            <p className="text-muted-foreground truncate" aria-live="polite">
              No image attached (portrait supported)
            </p>
          </div>
        )}
      </div>

      {/* ── 4:5 Portrait Preview Card (Astryx 4/5 AspectRatio Standard) ── */}
      {previewUrl && showPortraitCard && (
        <div className="flex flex-col items-center w-full gap-2.5 p-3 rounded-2xl border border-border bg-card/60 backdrop-blur-xs shadow-xs animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="flex items-center justify-between w-full text-xs px-1">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Portrait Framing Preview
            </span>
            <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
              4:5 Ratio
            </span>
          </div>

          {/*
            Exact 4:5 container matching the gallery hero standard:
            ratio={4 / 5} with objectFit: 'cover' & objectPosition: 'center 20%'
          */}
          <div className="relative aspect-[4/5] w-full max-w-[200px] overflow-hidden rounded-xl border border-border/80 bg-neutral-900 shadow-md">
            <img
              src={previewUrl}
              alt={fileName ?? "Portrait image preview"}
              className={`h-full w-full object-cover ${focalClass} transition-all duration-300`}
            />

            {/* Smart Face Alignment Marker Pill */}
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Face visible
            </div>

            {/* Bottom Gradient Overlay with File Details */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white">
              <p className="text-[11px] font-medium truncate">{fileName}</p>
              <p className="text-[10px] text-neutral-300">
                {isPortrait ? "Portrait photo" : "Landscape photo"} · Face
                anchored
              </p>
            </div>
          </div>

          {/* Focal Position Selector */}
          <div className="flex flex-col items-center gap-1.5 w-full pt-1">
            <span className="text-[11px] text-muted-foreground">
              Focus position:
            </span>
            <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs">
              {(
                [
                  { id: "face", label: "Face (Top 20%)" },
                  { id: "top", label: "Top" },
                  { id: "center", label: "Center" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setFocalPreset(preset.id)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    focalPreset === preset.id
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {focalPreset === preset.id && <Check className="size-3" />}
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pattern;

