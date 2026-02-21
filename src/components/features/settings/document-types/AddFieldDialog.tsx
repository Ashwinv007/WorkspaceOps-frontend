"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addField } from "@/lib/api/document-types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  fieldKey: z.string().min(1, "Field key is required"),
  fieldType: z.enum(["text", "date"]),
  isRequired: z.boolean(),
  isExpiryField: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface AddFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  typeId: string
}

export function AddFieldDialog({ open, onOpenChange, workspaceId, typeId }: AddFieldDialogProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fieldType: "text", isRequired: false, isExpiryField: false },
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => addField(workspaceId, typeId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types", workspaceId] })
      toast.success("Field added")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to add field"),
  })

  const fieldType = watch("fieldType")
  const isRequired = watch("isRequired")
  const isExpiryField = watch("isExpiryField")

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
        </DialogHeader>
        <form id="add-field-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="field-key">Field Key</Label>
            <Input id="field-key" placeholder="issueDate" {...register("fieldKey")} />
            {errors.fieldKey && <p className="text-sm text-destructive">{errors.fieldKey.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Field Type</Label>
            <Select value={fieldType} onValueChange={(v) => { setValue("fieldType", v as "text" | "date"); if (v !== "date") setValue("isExpiryField", false) }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isRequired-toggle">Required</Label>
            <Switch
              id="isRequired-toggle"
              checked={isRequired}
              onCheckedChange={(v) => setValue("isRequired", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isExpiry-toggle" className={fieldType !== "date" ? "text-muted-foreground" : ""}>
              Expiry Field
            </Label>
            <Switch
              id="isExpiry-toggle"
              checked={isExpiryField}
              disabled={fieldType !== "date"}
              onCheckedChange={(v) => setValue("isExpiryField", v)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
          <Button type="submit" form="add-field-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
