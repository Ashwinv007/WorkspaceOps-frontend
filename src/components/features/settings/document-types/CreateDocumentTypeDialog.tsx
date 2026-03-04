"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createDocumentType } from "@/lib/api/document-types"
import { Loader2, Plus, Trash2 } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fieldSchema = z.object({
  fieldKey: z.string().min(1, "Required"),
  fieldType: z.enum(["text", "date"]),
  isRequired: z.boolean(),
  isExpiryField: z.boolean(),
})

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  hasMetadata: z.boolean(),
  hasExpiry: z.boolean(),
  fields: z.array(fieldSchema),
}).superRefine((data, ctx) => {
  if (data.hasExpiry) {
    const hasExpiryField = data.fields.some((f) => f.isExpiryField && f.fieldType === "date")
    if (!hasExpiryField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "When hasExpiry is enabled, at least one date field must be marked as expiry field",
        path: ["fields"],
      })
    }
  }
})

type FormValues = z.infer<typeof schema>

interface CreateDocumentTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
}

export function CreateDocumentTypeDialog({ open, onOpenChange, workspaceId }: CreateDocumentTypeDialogProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      hasMetadata: false,
      hasExpiry: false,
      fields: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "fields" })

  const hasMetadata = watch("hasMetadata")
  const hasExpiry = watch("hasExpiry")

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createDocumentType(workspaceId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types", workspaceId] })
      toast.success("Document type created")
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error("Failed to create document type"),
  })

  const showFields = hasMetadata || hasExpiry

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document Type</DialogTitle>
        </DialogHeader>

        <form id="create-dt-form" onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="dt-name">Name</Label>
            <Input id="dt-name" placeholder="Passport" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Has Metadata</Label>
              <p className="text-xs text-muted-foreground">Attach custom fields to documents</p>
            </div>
            <Switch
              checked={hasMetadata}
              onCheckedChange={(v) => {
                setValue("hasMetadata", v)
                if (!v && !hasExpiry) setValue("fields", [])
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Has Expiry</Label>
              <p className="text-xs text-muted-foreground">Track document expiration</p>
            </div>
            <Switch
              checked={hasExpiry}
              onCheckedChange={(v) => {
                setValue("hasExpiry", v)
                if (!v && !hasMetadata) setValue("fields", [])
              }}
            />
          </div>

          {showFields && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ fieldKey: "", fieldType: "text", isRequired: false, isExpiryField: false })}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Field
                  </Button>
                </div>

                {errors.fields && !Array.isArray(errors.fields) && (
                  <p className="text-sm text-destructive">{(errors.fields as { message?: string }).message}</p>
                )}

                {fields.map((field, index) => {
                  const fType = watch(`fields.${index}.fieldType`)
                  return (
                    <div key={field.id} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="fieldKey"
                            {...register(`fields.${index}.fieldKey`)}
                          />
                          {Array.isArray(errors.fields) && errors.fields[index]?.fieldKey && (
                            <p className="text-xs text-destructive">{errors.fields[index]?.fieldKey?.message}</p>
                          )}
                        </div>
                        <Select
                          value={fType}
                          onValueChange={(v) => {
                            setValue(`fields.${index}.fieldType`, v as "text" | "date")
                            if (v !== "date") setValue(`fields.${index}.isExpiryField`, false)
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Switch
                            checked={watch(`fields.${index}.isRequired`)}
                            onCheckedChange={(v) => setValue(`fields.${index}.isRequired`, v)}
                          />
                          Required
                        </label>
                        <label className={`flex items-center gap-2 ${fType !== "date" ? "opacity-50" : "cursor-pointer"}`}>
                          <Switch
                            checked={watch(`fields.${index}.isExpiryField`)}
                            disabled={fType !== "date"}
                            onCheckedChange={(v) => setValue(`fields.${index}.isExpiryField`, v)}
                          />
                          Expiry Field
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>Cancel</Button>
          <Button type="submit" form="create-dt-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
