"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadContentImage } from "@/lib/content/upload";

export function ImageUploadField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startUpload] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const result = await uploadContentImage(file);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onChange(result.url);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-espresso/70">{label}</span>
      <label
        className={`relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors ${
          value ? "border-espresso/10" : "border-dashed border-espresso/20 hover:border-terracotta/40"
        }`}
      >
        {value && <Image src={value} alt="" fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center text-xs font-medium transition-colors ${
            value ? "bg-espresso/0 text-transparent opacity-0 hover:bg-espresso/40 hover:text-paper hover:opacity-100" : "text-espresso/45"
          }`}
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              {value ? "Remplacer" : "Choisir une photo"}
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={pending}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
