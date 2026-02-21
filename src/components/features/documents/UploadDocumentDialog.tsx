"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { uploadDocument } from "@/lib/api/documents"
import { DocumentType, Entity } from "@/lib/types/api"
import { FileUploadZone } from "@/components/shared/FileUploadZone"
import { DynamicMetadataForm } from "@/components/shared/DynamicMetadataForm"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  documentTypes: DocumentType[]
  entities: Entity[]
  defaultEntityId?: string
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  workspaceId,
  documentTypes,
  entities,
  defaultEntityId,
}: UploadDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [selectedDocTypeId, setSelectedDocTypeId] = useState("")
  const [selectedEntityId, setSelectedEntityId] = useState(defaultEntityId ?? "")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [fileError, setFileError] = useState("")
  const [docTypeError, setDocTypeError] = useState("")

  const { control, handleSubmit, reset: resetForm } = useForm<{ metadata: Record<string, string> }>({
    defaultValues: { metadata: {} },
  })

  const selectedDocType = documentTypes.find((dt) => dt.id === selectedDocTypeId)

  function totalSteps() {
    let steps = 1
    if (selectedDocType?.hasMetadata) steps++
    if (selectedDocType?.hasExpiry) steps++
    return steps
  }

  function getStepIndex() {
    // Map logical step to UI step number
    // Step 1: always file + type + entity
    // Step 2: metadata (if hasMetadata)
    // Step 3 or 2: expiry (if hasExpiry)
    return step
  }

  function handleNext() {
    if (step === 1) {
      if (!selectedFile) { setFileError("Please select a file"); return }
      if (!selectedDocTypeId) { setDocTypeError("Please select a document type"); return }
      setFileError("")
      setDocTypeError("")

      // Determine next step
      if (selectedDocType?.hasMetadata) {
        setStep(2)
      } else if (selectedDocType?.hasExpiry) {
        setStep(3)
      } else {
        doUpload({})
      }
    } else if (step === 2) {
      // metadata step — handled via form submit
      handleSubmit((values) => {
        if (selectedDocType?.hasExpiry) {
          setStep(3)
        } else {
          doUpload(values.metadata)
        }
      })()
    } else if (step === 3) {
      handleSubmit((values) => {
        doUpload(values.metadata)
      })()
    }
  }

  const mutation = useMutation({
    mutationFn: (formData: FormData) => uploadDocument(workspaceId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
      toast.success("Document uploaded")
      handleClose()
    },
    onError: () => toast.error("Failed to upload document"),
  })

  function doUpload(metadata: Record<string, string>) {
    const formData = new FormData()
    formData.append("file", selectedFile!)
    formData.append("documentTypeId", selectedDocTypeId)
    if (selectedEntityId) formData.append("entityId", selectedEntityId)
    if (expiryDate) formData.append("expiryDate", expiryDate.toISOString())
    if (Object.keys(metadata).length > 0) {
      formData.append("metadata", JSON.stringify(metadata))
    }
    mutation.mutate(formData)
  }

  function handleClose() {
    onOpenChange(false)
    setStep(1)
    setSelectedFile(undefined)
    setSelectedDocTypeId("")
    setSelectedEntityId(defaultEntityId ?? "")
    setExpiryDate(undefined)
    setFileError("")
    setDocTypeError("")
    resetForm()
  }

  const steps = totalSteps()

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          {steps > 1 && (
            <p className="text-sm text-muted-foreground">
              Step {getStepIndex()} of {steps}
            </p>
          )}
        </DialogHeader>

        {/* Step 1: File, Type, Entity */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <FileUploadZone
              selectedFile={selectedFile}
              onFileSelect={(f) => { setSelectedFile(f); setFileError("") }}
            />
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}

            <div className="space-y-1">
              <Label>Document Type <span className="text-destructive">*</span></Label>
              <Select
                value={selectedDocTypeId}
                onValueChange={(v) => { setSelectedDocTypeId(v); setDocTypeError("") }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {docTypeError && <p className="text-sm text-destructive">{docTypeError}</p>}
            </div>

            <div className="space-y-1">
              <Label>Entity (optional)</Label>
              <Select value={selectedEntityId || "__none__"} onValueChange={(v) => setSelectedEntityId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Metadata */}
        {step === 2 && selectedDocType?.fields && (
          <div className="py-2">
            <DynamicMetadataForm
              fields={selectedDocType.fields}
              control={control}
            />
          </div>
        )}

        {/* Step 3: Expiry Date */}
        {step === 3 && (
          <div className="space-y-2 py-2">
            <Label>Expiry Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={(date) => { setExpiryDate(date); setCalendarOpen(false) }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={mutation.isPending}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleNext} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {step === steps || (step === 1 && !selectedDocType?.hasMetadata && !selectedDocType?.hasExpiry)
              ? "Upload"
              : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
