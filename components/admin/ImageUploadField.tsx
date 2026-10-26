"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {value && (
        <div className="relative h-32 w-48 overflow-hidden rounded-lg border border-espresso/10">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0])}
        disabled={pending}
        className="text-sm"
      />
      {pending && <span className="text-xs text-espresso/50">Envoi en cours...</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
