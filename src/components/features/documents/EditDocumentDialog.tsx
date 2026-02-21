"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { updateDocument } from "@/lib/api/documents"
import { Document, DocumentType, Entity } from "@/lib/types/api"
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

interface EditDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  document: Document
  documentType: DocumentType | undefined
  entities: Entity[]
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  workspaceId,
  document,
  documentType,
  entities,
}: EditDocumentDialogProps) {
  const queryClient = useQueryClient()
  const [entityId, setEntityId] = useState(document.entityId ?? "")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    document.expiryDate ? new Date(document.expiryDate) : undefined
  )
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { control, reset: resetForm } = useForm<{ metadata: Record<string, string> }>({
    defaultValues: { metadata: document.metadata ?? {} },
  })

  useEffect(() => {
    if (open) {
      setEntityId(document.entityId ?? "")
      setExpiryDate(document.expiryDate ? new Date(document.expiryDate) : undefined)
      resetForm({ metadata: document.metadata ?? {} })
    }
  }, [open, document, resetForm])

  const mutation = useMutation({
    mutationFn: (data: { entityId?: string | null; expiryDate?: string | null; metadata?: Record<string, string> }) =>
      updateDocument(workspaceId, document.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] })
      toast.success("Document updated")
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to update document"),
  })

  function onSubmit() {
    mutation.mutate({
      entityId: entityId || null,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/50">
            You cannot replace the file. Only metadata and entity can be updated.
          </p>

          <div className="space-y-1">
            <Label>Entity (optional)</Label>
            <Select value={entityId || "__none__"} onValueChange={(v) => setEntityId(v === "__none__" ? "" : v)}>
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

          {documentType?.hasExpiry && (
            <div className="space-y-1">
              <Label>Expiry Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !expiryDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "MMM d, yyyy") : "No expiry date"}
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

          {documentType?.hasMetadata && documentType.fields.length > 0 && (
            <DynamicMetadataForm fields={documentType.fields} control={control} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
