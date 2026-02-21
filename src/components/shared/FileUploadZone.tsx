"use client"

import { useRef } from "react"
import { CheckCircle2, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  selectedFile?: File
  accept?: string
}

export function FileUploadZone({ onFileSelect, selectedFile, accept }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
        selectedFile
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      {selectedFile ? (
        <>
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <p className="text-sm font-medium">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
          <p className="text-xs text-muted-foreground">Click to replace</p>
        </>
      ) : (
        <>
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground">Any file type accepted</p>
        </>
      )}
    </div>
  )
}
