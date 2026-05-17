"use client";

import { useId, useRef } from "react";
import { FileCheck, Upload, X } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  /** Bump after a successful upload so the native input resets cleanly */
  inputKey?: number | string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  className?: string;
  /** Slightly tighter padding for dense layouts (e.g. success card) */
  compact?: boolean;
};

/**
 * Accessible file picker styled as a drop zone; hides the default OS file button.
 */
export function PaymentSlipFileInput({
  inputKey,
  accept = "application/pdf,.pdf,image/*",
  file,
  onFileChange,
  disabled,
  className = "",
  compact = false,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const py = compact ? "py-3" : "py-4";
  const iconBox = compact ? "h-10 w-10" : "h-12 w-12";
  const iconSz = compact ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className={className}>
      <input
        key={inputKey}
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        aria-label="Choose payment slip — PDF or image"
        onChange={(e) => {
          onFileChange(e.target.files?.[0] ?? null);
        }}
      />
      <div
        className={[
          "flex w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all",
          "border-amber-brand/35 bg-white shadow-sm",
          "focus-within:border-amber-brand/70 focus-within:bg-amber-brand/[0.06] focus-within:ring-2 focus-within:ring-amber-brand/25 focus-within:ring-offset-2",
          file ? "border-amber-brand/55 bg-amber-brand/[0.07]" : "",
          disabled ? "pointer-events-none opacity-55" : "",
        ].join(" ")}
      >
        <label
          htmlFor={id}
          className={`group flex min-w-0 flex-1 cursor-pointer items-center gap-3 sm:gap-4 px-3 sm:px-4 ${py} font-nunito`}
        >
          <span
            className={`flex ${iconBox} shrink-0 items-center justify-center rounded-xl bg-amber-brand/15 text-amber-brand transition-colors group-hover:bg-amber-brand/25`}
            aria-hidden
          >
            {file ? (
              <FileCheck className={iconSz} strokeWidth={2} />
            ) : (
              <Upload className={iconSz} strokeWidth={2} />
            )}
          </span>
          <span className="min-w-0 flex-1 text-left">
            {file ? (
              <>
                <span className="block truncate text-sm font-semibold text-navy-brand">{file.name}</span>
                <span className="mt-0.5 block text-xs text-brown-brand/65">
                  {formatFileSize(file.size)} · click to replace
                </span>
              </>
            ) : (
              <>
                <span className="block text-sm font-semibold text-navy-brand">Choose payment slip</span>
                <span className="mt-0.5 block text-xs text-brown-brand/65">PDF or image (PNG, JPG, …)</span>
              </>
            )}
          </span>
        </label>
        {file && !disabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              clear();
            }}
            className="flex shrink-0 items-center justify-center border-l border-amber-brand/20 bg-amber-brand/[0.04] px-3 text-brown-brand/55 transition-colors hover:bg-white hover:text-navy-brand"
            aria-label="Remove selected file"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
